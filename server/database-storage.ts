import { 
  users, User, InsertUser, 
  plans, Plan, InsertPlan,
  investments, Investment, InsertInvestment,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral,
  paymentSettings, PaymentSetting, InsertPaymentSetting,
  contactMessages, ContactMessage, InsertContactMessage
} from "@shared/schema";
import { db } from "./db";
import { nanoid } from "nanoid";
import { addDays } from "date-fns";
import { eq, and, desc } from "drizzle-orm";
import { IStorage, DashboardStats, UserDashboardStats } from "./storage";

export class DatabaseStorage implements IStorage {
  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Make sure user has a referral code
    if (!user.referralCode) {
      user.referralCode = (user.username.toUpperCase() + nanoid(8)).substring(0, 20);
    }
    
    const [newUser] = await db.insert(users).values(user).returning();
    
    // Handle referrals if user was referred
    if (newUser.referredBy) {
      const referrer = await this.getUser(newUser.referredBy);
      if (referrer) {
        await this.createReferral({
          referrerId: referrer.id,
          referredId: newUser.id,
          level: 1,
          commissionRate: "10",
          status: "active"
        });
        
        // Create referrals for higher levels if applicable
        const referrerChain = await this.getReferrerChain(referrer.id);
        for (let i = 0; i < referrerChain.length && i < 4; i++) { // Up to level 5
          const ancestorId = referrerChain[i];
          await this.createReferral({
            referrerId: ancestorId,
            referredId: newUser.id,
            level: i + 2, // Level 2, 3, 4, 5
            commissionRate: this.getCommissionRateForLevel(i + 2),
            status: "active"
          });
        }
      }
    }
    
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserReferrals(userId: number): Promise<User[]> {
    const directReferrals = await db
      .select({
        user: users
      })
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, userId),
        eq(referrals.level, 1)
      ))
      .innerJoin(users, eq(referrals.referredId, users.id));
    
    return directReferrals.map(r => r.user);
  }

  async toggleUserStatus(id: number, active: boolean): Promise<User | undefined> {
    return this.updateUser(id, { active });
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  // Plans Management
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getAllPlans(): Promise<Plan[]> {
    return db.select().from(plans);
  }

  async getActivePlans(): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.active, true));
  }

  async updatePlan(id: number, planData: Partial<Plan>): Promise<Plan | undefined> {
    const [updatedPlan] = await db
      .update(plans)
      .set(planData)
      .where(eq(plans.id, id))
      .returning();
    
    return updatedPlan;
  }

  async togglePlanStatus(id: number, active: boolean): Promise<Plan | undefined> {
    return this.updatePlan(id, { active });
  }

  async deletePlan(id: number): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id));
    return result.rowCount > 0;
  }
  
  // Investments Management
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    // Create the investment
    const [newInvestment] = await db.insert(investments).values(investment).returning();
    
    // Create transaction record for the investment
    await this.createTransaction({
      userId: investment.userId,
      type: "investment",
      amount: investment.amount,
      currency: "USDT",
      status: "completed",
      paymentMethod: "wallet",
      transactionDetails: `Investment in plan #${investment.planId}`,
      investmentId: newInvestment.id
    });
    
    // Deduct from user's wallet
    const user = await this.getUser(investment.userId);
    if (user) {
      const newBalance = parseFloat(user.walletBalance) - parseFloat(investment.amount);
      await this.updateUser(user.id, { walletBalance: newBalance.toString() });
    }
    
    return newInvestment;
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id));
    return investment;
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    return db.select().from(investments).where(eq(investments.userId, userId));
  }

  async getAllInvestments(): Promise<Investment[]> {
    return db.select().from(investments);
  }

  async updateInvestment(id: number, investmentData: Partial<Investment>): Promise<Investment | undefined> {
    const [updatedInvestment] = await db
      .update(investments)
      .set(investmentData)
      .where(eq(investments.id, id))
      .returning();
    
    return updatedInvestment;
  }
  
  // Transactions Management
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // If it's a deposit, add to user's wallet
    if (transaction.type === "deposit" && transaction.status === "completed") {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) + parseFloat(transaction.amount);
        await this.updateUser(user.id, { walletBalance: newBalance.toString() });
      }
    }
    
    // If it's a withdrawal, subtract from user's wallet
    if (transaction.type === "withdrawal" && transaction.status === "completed") {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) - parseFloat(transaction.amount);
        await this.updateUser(user.id, { walletBalance: newBalance.toString() });
      }
    }
    
    // If it's a referral commission, add to referrer's wallet
    if (transaction.type === "referral" && transaction.status === "completed" && transaction.referralId) {
      const referral = await this.getReferral(transaction.referralId);
      if (referral) {
        const referrer = await this.getUser(referral.referrerId);
        if (referrer) {
          const newBalance = parseFloat(referrer.walletBalance) + parseFloat(transaction.amount);
          await this.updateUser(referrer.id, { walletBalance: newBalance.toString() });
          
          // Update referral commission amount
          await this.updateReferral(referral.id, { 
            commissionAmount: (parseFloat(referral.commissionAmount) + parseFloat(transaction.amount)).toString() 
          });
        }
      }
    }
    
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      paymentMethod: transactions.paymentMethod,
      transactionDetails: transactions.transactionDetails,
      investmentId: transactions.investmentId,
      referralId: transactions.referralId
    }).from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      paymentMethod: transactions.paymentMethod,
      transactionDetails: transactions.transactionDetails,
      investmentId: transactions.investmentId,
      referralId: transactions.referralId
    }).from(transactions).where(eq(transactions.userId, userId));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      paymentMethod: transactions.paymentMethod,
      transactionDetails: transactions.transactionDetails,
      investmentId: transactions.investmentId,
      referralId: transactions.referralId
    }).from(transactions);
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      paymentMethod: transactions.paymentMethod,
      transactionDetails: transactions.transactionDetails,
      investmentId: transactions.investmentId,
      referralId: transactions.referralId
    }).from(transactions).where(eq(transactions.type, type));
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const existingTransaction = await this.getTransaction(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    // If we're changing status from pending to completed
    if (
      existingTransaction.status === "pending" && 
      transactionData.status === "completed" &&
      !existingTransaction.investmentId // Not investment-related transactions as they're handled differently
    ) {
      // Handle deposit completion
      if (existingTransaction.type === "deposit") {
        const user = await this.getUser(existingTransaction.userId);
        if (user) {
          const newBalance = parseFloat(user.walletBalance) + parseFloat(existingTransaction.amount);
          await this.updateUser(user.id, { walletBalance: newBalance.toString() });
        }
      }
      
      // Handle withdrawal completion
      if (existingTransaction.type === "withdrawal") {
        const user = await this.getUser(existingTransaction.userId);
        if (user) {
          const newBalance = parseFloat(user.walletBalance) - parseFloat(existingTransaction.amount);
          await this.updateUser(user.id, { walletBalance: Math.max(0, newBalance).toString() });
        }
      }
      
      // Handle referral completion
      if (existingTransaction.type === "referral" && existingTransaction.referralId) {
        const referral = await this.getReferral(existingTransaction.referralId);
        if (referral) {
          const referrer = await this.getUser(referral.referrerId);
          if (referrer) {
            const newBalance = parseFloat(referrer.walletBalance) + parseFloat(existingTransaction.amount);
            await this.updateUser(referrer.id, { walletBalance: newBalance.toString() });
            
            // Update referral commission amount
            await this.updateReferral(referral.id, { 
              commissionAmount: (parseFloat(referral.commissionAmount) + parseFloat(existingTransaction.amount)).toString() 
            });
          }
        }
      }
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction;
  }
  
  // Referral Management
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral;
  }

  async getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, userId),
        eq(referrals.level, level)
      ));
  }

  async getAllUserReferrals(userId: number): Promise<Referral[]> {
    // Fetch all referrals for this user and join with referred users' data
    const referralData = await db
      .select({
        referral: referrals,
        referredUser: users
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .leftJoin(users, eq(referrals.referredId, users.id))
      .orderBy(referrals.level, referrals.createdAt);
    
    console.log(`Found ${referralData.length} referrals for user ID ${userId}`);
    
    // Map the results to include the actual referral and the user it belongs to
    return referralData.map(r => ({
      ...r.referral,
      // Include joined user data for the frontend to display
      referredUser: r.referredUser ? {
        id: r.referredUser.id,
        username: r.referredUser.username,
        email: r.referredUser.email,
        firstName: r.referredUser.firstName,
        lastName: r.referredUser.lastName,
        referralCode: r.referredUser.referralCode,
        walletBalance: r.referredUser.walletBalance,
        active: r.referredUser.active,
        role: r.referredUser.role,
        referredBy: r.referredUser.referredBy,
        profileImage: r.referredUser.profileImage
      } : null
    }));
  }

  async updateReferral(id: number, referralData: Partial<Referral>): Promise<Referral | undefined> {
    const [updatedReferral] = await db
      .update(referrals)
      .set(referralData)
      .where(eq(referrals.id, id))
      .returning();
    
    return updatedReferral;
  }
  
  // Payment Settings Management
  async createPaymentSetting(setting: InsertPaymentSetting): Promise<PaymentSetting> {
    try {
      // Instead of using drizzle query builder, let's use SQL to ensure payment_method is set
      const result = await db.execute(
        `INSERT INTO payment_settings 
        (method, name, instructions, credentials, min_amount, max_amount, active, payment_method) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          setting.method,
          setting.name,
          setting.instructions || null,
          setting.credentials || null,
          setting.minAmount || "10",
          setting.maxAmount || "10000",
          setting.active !== undefined ? setting.active : true,
          setting.method // Important: Use the same value for payment_method as method
        ]
      );
      
      if (!result || !result.rows || result.rows.length === 0) {
        throw new Error('Failed to create payment setting');
      }
      
      // Return the first row from the result
      return result.rows[0] as PaymentSetting;
    } catch (error) {
      console.error('Error creating payment setting:', error);
      throw error;
    }
  }

  async getPaymentSetting(id: number): Promise<PaymentSetting | undefined> {
    const [setting] = await db.select().from(paymentSettings).where(eq(paymentSettings.id, id));
    return setting;
  }

  async getPaymentSettingByMethod(method: string): Promise<PaymentSetting | undefined> {
    const [setting] = await db.select().from(paymentSettings).where(eq(paymentSettings.method, method));
    return setting;
  }

  async getAllPaymentSettings(): Promise<PaymentSetting[]> {
    return db.select().from(paymentSettings);
  }

  async updatePaymentSetting(id: number, settingData: Partial<PaymentSetting>): Promise<PaymentSetting | undefined> {
    try {
      // If method is being updated, use raw SQL to update both together
      if (settingData.method) {
        // Need to use raw SQL to update both fields together
        const fields = [];
        const values = [];
        let paramCount = 1;
        
        // Build dynamic SQL based on provided fields
        Object.entries(settingData).forEach(([key, value]) => {
          if (key !== 'method') { // Skip method as we'll handle it specially
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            fields.push(`${snakeKey} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });
        
        // Always update both method and payment_method together
        fields.push(`method = $${paramCount}`);
        values.push(settingData.method);
        paramCount++;
        
        fields.push(`payment_method = $${paramCount}`);
        values.push(settingData.method);
        paramCount++;
        
        // Add ID as the last parameter
        values.push(id);
        
        const result = await db.execute(
          `UPDATE payment_settings SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
          values
        );
        
        if (!result || !result.rows || result.rows.length === 0) {
          return undefined;
        }
        
        return result.rows[0] as PaymentSetting;
      } else {
        // If not updating method, we can use the ORM approach
        const dataToUpdate = { ...settingData };
        
        const [updatedSetting] = await db
          .update(paymentSettings)
          .set(dataToUpdate)
          .where(eq(paymentSettings.id, id))
          .returning();
        
        return updatedSetting;
      }
    } catch (error) {
      console.error('Error updating payment setting:', error);
      throw error;
    }
  }

  async togglePaymentMethod(id: number, active: boolean): Promise<PaymentSetting | undefined> {
    return this.updatePaymentSetting(id, { active });
  }
  
  // Contact Messages Management
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }

  async markMessageAsResponded(id: number): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ responded: true })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage;
  }
  
  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const allUsers = await this.getAllUsers();
    const activeUsers = allUsers.filter(user => user.active);
    const inactiveUsers = allUsers.filter(user => !user.active);
    
    // Calculate investment total
    const investments = await this.getAllInvestments();
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toString();
    
    // Get transaction totals
    const deposits = await this.getTransactionsByType("deposit");
    const totalDeposits = deposits
      .filter(tx => tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    const withdrawals = await this.getTransactionsByType("withdrawal");
    const totalWithdrawals = withdrawals
      .filter(tx => tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    // Get most recent transactions
    const allTransactions = await this.getAllTransactions();
    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Get most recent users
    const recentUsers = allUsers
      .filter(user => user.role !== "admin")
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
    
    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      totalInvested,
      totalDeposits,
      totalWithdrawals,
      recentTransactions,
      recentUsers
    };
  }

  async getUserDashboardStats(userId: number): Promise<UserDashboardStats> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Get user's investments
    const userInvestments = await this.getUserInvestments(userId);
    const totalInvested = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toString();
    const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;
    
    // Calculate user's earnings
    const totalProfit = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.profit), 0);
    
    // Get referral earnings
    const userReferrals = await this.getAllUserReferrals(userId);
    const referralEarnings = userReferrals.reduce(
      (sum, ref) => sum + parseFloat(ref.commissionAmount), 
      0
    ).toString();
    
    const referralCount = (await this.getUserReferralsByLevel(userId, 1)).length;
    
    return {
      walletBalance: user.walletBalance,
      totalInvested,
      totalEarnings: totalProfit.toString(),
      referralEarnings,
      activeInvestments,
      referralCount
    };
  }

  // Helper methods
  private async getReferrerChain(userId: number, chain: number[] = []): Promise<number[]> {
    const user = await this.getUser(userId);
    if (!user || !user.referredBy) {
      return chain;
    }
    
    chain.push(user.referredBy);
    return this.getReferrerChain(user.referredBy, chain);
  }

  private getCommissionRateForLevel(level: number): string {
    const rates = {
      1: "10", // 10% for level 1
      2: "5",  // 5% for level 2
      3: "3",  // 3% for level 3
      4: "2",  // 2% for level 4
      5: "1"   // 1% for level 5
    };
    
    return rates[level as keyof typeof rates] || "0";
  }
  
  // Network performance heatmap data
  async getNetworkPerformance(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Get user's direct referrals (level 1)
    const directReferrals = await this.getUserReferralsByLevel(userId, 1);
    
    // If no referrals, return just the user
    if (directReferrals.length === 0) {
      return {
        id: userId,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        level: 0,
        performance: 100, // Root node is always 100%
        referrals: []
      };
    }
    
    // Build the referral tree recursively
    const referralTree = await this.buildReferralPerformanceTree(userId, 0, 5); // Max 5 levels deep
    
    return referralTree;
  }
  
  private async buildReferralPerformanceTree(userId: number, currentLevel: number, maxLevel: number): Promise<any> {
    if (currentLevel > maxLevel) return null;
    
    // Get user info
    const user = await this.getUser(userId);
    if (!user) return null;
    
    // Get direct referrals
    const directReferrals = await this.getUserReferralsByLevel(userId, 1);
    
    // Calculate performance score based on wallet balance, activity, etc.
    const userInvestments = await this.getUserInvestments(userId);
    const investmentAmount = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const userTransactions = await this.getUserTransactions(userId);
    const recentActivity = userTransactions.filter(tx => 
      new Date(tx.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    ).length;
    
    // Performance formula: active status (50%) + investment amount (30%) + recent activity (20%)
    let performanceScore = 0;
    performanceScore += user.active ? 50 : 0;
    performanceScore += Math.min(investmentAmount / 500, 1) * 30; // Cap at $500 for max score
    performanceScore += Math.min(recentActivity / 5, 1) * 20; // Cap at 5 activities for max score
    
    // Build tree node
    const treeNode = {
      id: userId,
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      level: currentLevel,
      performance: performanceScore,
      referrals: []
    };
    
    // Process child nodes recursively
    if (currentLevel < maxLevel && directReferrals.length > 0) {
      for (const referral of directReferrals) {
        const childNode = await this.buildReferralPerformanceTree(
          referral.referredId, 
          currentLevel + 1, 
          maxLevel
        );
        
        if (childNode) {
          treeNode.referrals.push(childNode);
        }
      }
    }
    
    return treeNode;
  }
}