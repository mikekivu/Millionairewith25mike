import { 
  users, User, InsertUser, 
  plans, Plan, InsertPlan,
  investments, Investment, InsertInvestment,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral,
  paymentSettings, PaymentSetting, InsertPaymentSetting,
  contactMessages, ContactMessage, InsertContactMessage,
  userMessages, UserMessage, InsertUserMessage,
  notifications, Notification, InsertNotification,
  systemSettings, SystemSetting, InsertSystemSetting,
  paymentConfigurations
} from "@shared/schema";
import { db } from "./db";
import { nanoid } from "nanoid";
import { addDays } from "date-fns";
import { eq, and, desc } from "drizzle-orm";
// Import interfaces directly to avoid circular dependency
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserReferrals(userId: number): Promise<User[]>;
  toggleUserStatus(id: number, active: boolean): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Plans Management
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
  getAllPlans(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  updatePlan(id: number, plan: Partial<Plan>): Promise<Plan | undefined>;
  togglePlanStatus(id: number, active: boolean): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;

  // Investments Management
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getInvestment(id: number): Promise<Investment | undefined>;
  getUserInvestments(userId: number): Promise<Investment[]>;
  getAllInvestments(): Promise<Investment[]>;
  updateInvestment(id: number, investment: Partial<Investment>): Promise<Investment | undefined>;

  // Transactions Management
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactionByReference(reference: string): Promise<Transaction | undefined>;

  // Referral Management
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferral(id: number): Promise<Referral | undefined>;
  getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]>;
  getAllUserReferrals(userId: number): Promise<Referral[]>;
  updateReferral(id: number, referral: Partial<Referral>): Promise<Referral | undefined>;

  // Payment Settings Management
  createPaymentSetting(setting: InsertPaymentSetting): Promise<PaymentSetting>;
  getPaymentSetting(id: number): Promise<PaymentSetting | undefined>;
  getPaymentSettingByMethod(method: string): Promise<PaymentSetting | undefined>;
  getAllPaymentSettings(): Promise<PaymentSetting[]>;
  updatePaymentSetting(id: number, setting: Partial<PaymentSetting>): Promise<PaymentSetting | undefined>;
  togglePaymentMethod(id: number, active: boolean): Promise<PaymentSetting | undefined>;

  // Contact Messages Management
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markMessageAsResponded(id: number): Promise<ContactMessage | undefined>;

  // User Messages Management
  createUserMessage(message: InsertUserMessage): Promise<UserMessage>;
  getUserMessage(id: number): Promise<UserMessage | undefined>;
  getUserSentMessages(userId: number): Promise<UserMessage[]>;
  getUserReceivedMessages(userId: number): Promise<UserMessage[]>;
  markUserMessageAsRead(id: number): Promise<UserMessage | undefined>;
  markUserMessageAsReplied(id: number): Promise<UserMessage | undefined>;

  // Demo User Management
  isDemoUser(userId: number): Promise<boolean>;
  updateUserWallet(userId: number, amount: string, operation: 'add' | 'subtract' | 'set'): Promise<User | undefined>;

  // Notifications Management
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUnreadUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;

  // Dashboard statistics
  getDashboardStats(): Promise<DashboardStats>;
  getUserDashboardStats(userId: number): Promise<UserDashboardStats>;

  // Network visualization
  getNetworkPerformance(userId: number): Promise<any>;

  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalInvested: string;
  totalDeposits: string;
  totalWithdrawals: string;
  recentTransactions: Transaction[];
  recentUsers: User[];
}

export interface UserDashboardStats {
  walletBalance: string;
  totalInvested: string;
  totalEarnings: string;
  referralEarnings: string;
  activeInvestments: number;
  referralCount: number;
}

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
    try {
      return await db.select().from(investments);
    } catch (error) {
      console.error("Error getting all investments:", error);
      throw error;
    }
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

    // Only add to wallet if deposit is completed (real payment received)
    if (transaction.type === "deposit" && transaction.status === "completed") {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) + parseFloat(transaction.amount);
        await this.updateUser(user.id, { walletBalance: newBalance.toString() });
      }
    }

    // If it's a withdrawal and completed, subtract from user's wallet
    // Note: For pending withdrawals, balance is only deducted when admin approves
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

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const [updated] = await db
        .update(transactions)
        .set(data)
        .where(eq(transactions.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async getTransactionByReference(reference: string): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.paymentReference, reference))
      .limit(1);

    return transaction || null;
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
    try {
      // Fetch all referrals for this user and join with referred users' data with timeout
      const referralData = await Promise.race([
        db
          .select({
            referral: referrals,
            referredUser: users
          })
          .from(referrals)
          .where(eq(referrals.referrerId, userId))
          .leftJoin(users, eq(referrals.referredId, users.id))
          .orderBy(referrals.level, referrals.createdAt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Referrals query timeout')), 15000)
        )
      ]) as any[];

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
    } catch (error) {
      console.error('Referrals query timeout');
      return [];
    }
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
      // Create a values object that matches the schema
      const values = {
        method: setting.method,
        name: setting.name,
        instructions: setting.instructions || null,
        credentials: setting.credentials || null,
        minAmount: setting.minAmount || "10",
        maxAmount: setting.maxAmount || "10000",
        active: setting.active !== undefined ? setting.active : true,
        payment_method: setting.method // Important: Explicitly set payment_method 
      };

      // Insert using the values object
      const [newSetting] = await db
        .insert(paymentSettings)
        .values(values)
        .returning();

      if (!newSetting) {
        throw new Error('Failed to create payment setting');
      }

      return newSetting;
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
      // If method is being updated, ensure payment_method is also updated
      if (settingData.method) {
        // Create update object with both method and payment_method set to the same value
        const dataToUpdate: any = { ...settingData, payment_method: settingData.method };

        const [updatedSetting] = await db
          .update(paymentSettings)
          .set(dataToUpdate)
          .where(eq(paymentSettings.id, id))
          .returning();

        return updatedSetting;
      } else {
        // If not updating method, we can use the standard approach
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

  // User Messages Management
  async createUserMessage(message: InsertUserMessage): Promise<UserMessage> {
    const [newMessage] = await db.insert(userMessages).values(message).returning();

    // Create notification for the recipient
    await this.createNotification({
      userId: message.recipientId,
      title: "New Message",
      message: "You have received a new message",
      type: "message",
      entityId: newMessage.id,
      entityType: "message",
      link: "/dashboard/messages"
    });

    return newMessage;
  }

  async getUserMessage(id: number): Promise<UserMessage | undefined> {
    const [message] = await db.select().from(userMessages).where(eq(userMessages.id, id));
    return message;
  }

  async getUserSentMessages(userId: number): Promise<UserMessage[]> {
    return db
      .select()
      .from(userMessages)
      .where(eq(userMessages.senderId, userId))
      .orderBy(desc(userMessages.createdAt));
  }

  async getUserReceivedMessages(userId: number): Promise<UserMessage[]> {
    return db
      .select()
      .from(userMessages)
      .where(eq(userMessages.recipientId, userId))
      .orderBy(desc(userMessages.createdAt));
  }

  async markUserMessageAsRead(id: number): Promise<UserMessage | undefined> {
    const [updatedMessage] = await db
      .update(userMessages)
      .set({ read: true })
      .where(eq(userMessages.id, id))
      .returning();

    return updatedMessage;
  }

  async markUserMessageAsReplied(id: number): Promise<UserMessage | undefined> {
    const [updatedMessage] = await db
      .update(userMessages)
      .set({ replied: true })
      .where(eq(userMessages.id, id))
      .returning();
  }

  // Notifications Management
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.status, "unread")
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ status: "read" })
      .where(eq(notifications.id, id))
      .returning();

    return updatedNotification;
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
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      // Get user's direct referrals (level 1) with timeout
      const directReferrals = await Promise.race([
        this.getUserReferralsByLevel(userId, 1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        )
      ]) as Referral[];

      // If no referrals, return just the user
      if (directReferrals.length === 0) {
        return {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          username: user.username,
          level: 0,
          performance: 100,
          referrals: []
        };
      }

      // Build a simplified tree (max 3 levels to prevent timeout)
      const referralTree = await this.buildReferralPerformanceTree(userId, 0, 3);

      return referralTree;
    } catch (error) {
      console.error('Network performance query error:', error);
      // Return basic user info if query fails
      const user = await this.getUser(userId);
      return {
        id: userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'User',
        username: user?.username || 'unknown',
        level: 0,
        performance: 100,
        referrals: []
      };
    }
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

  // Demo User Management
  async isDemoUser(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === "demo_user";
  }

  async updateUserWallet(userId: number, amount: string, operation: 'add' | 'subtract' | 'set'): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const currentBalance = parseFloat(user.walletBalance);
    const changeAmount = parseFloat(amount);
    let newBalance: number;

    switch (operation) {
      case 'add':
        newBalance = currentBalance + changeAmount;
        break;
      case 'subtract':
        newBalance = Math.max(0, currentBalance - changeAmount);
        break;
      case 'set':
        newBalance = changeAmount;
        break;
      default:
        return undefined;
    }

    return this.updateUser(userId, { walletBalance: newBalance.toString() });
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    try {
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
      return setting;
    } catch (error: any) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('system_settings table does not exist, creating it...');
        await this.createSystemSettingsTable();
        // Try again after creating table
        const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
        return setting;
      }
      throw error;
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    try {
      return db.select().from(systemSettings);
    } catch (error: any) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('system_settings table does not exist, creating it...');
        await this.createSystemSettingsTable();
        // Try again after creating table
        return db.select().from(systemSettings);
      }
      throw error;
    }
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    try {
      const existingSetting = await this.getSystemSetting(key);

      if (existingSetting) {
        // Update existing setting
        const [updatedSetting] = await db
          .update(systemSettings)
          .set({ 
            value, 
            description: description || existingSetting.description 
          })
          .where(eq(systemSettings.key, key))
          .returning();
        return updatedSetting;
      } else {
        // Create new setting
        const [newSetting] = await db
          .insert(systemSettings)
          .values({ 
            key, 
            value, 
            description: description || `System setting: ${key}` 
          })
          .returning();
        return newSetting;
      }
    } catch (error) {
      console.error('Error in setSystemSetting:', error);
      throw error;
    }
  }

  async getAllPaymentConfigurations(): Promise<any[]> {
    try {
      return db.select().from(paymentConfigurations);
    } catch (error) {
      console.error('Error fetching all payment configurations:', error);
      throw error;
    }
  }

  async getPaymentConfiguration(provider: string, environment: string): Promise<any | undefined> {
    try {
      const [config] = await db.select().from(paymentConfigurations).where(
        and(
          eq(paymentConfigurations.provider, provider),
          eq(paymentConfigurations.environment, environment)
        )
      );
      return config;
    } catch (error) {
      console.error('Error fetching payment configuration:', error);
      throw error;
    }
  }

  async getPaymentConfigurationById(id: number): Promise<any | undefined> {
    try {
      const [config] = await db.select().from(paymentConfigurations).where(eq(paymentConfigurations.id, id));
      return config;
    } catch (error) {
      console.error('Error fetching payment configuration by ID:', error);
      throw error;
    }
  }

  async createPaymentConfiguration(data: any): Promise<any> {
    try {
      const [config] = await db.insert(paymentConfigurations).values(data).returning();
      return config;
    } catch (error) {
      console.error('Error creating payment configuration:', error);
      throw error;
    }
  }

  async updatePaymentConfiguration(id: number, data: any): Promise<any | undefined> {
    try {
      const [config] = await db
        .update(paymentConfigurations)
        .set(data)
        .where(eq(paymentConfigurations.id, id))
        .returning();
      return config;
    } catch (error) {
      console.error('Error updating payment configuration:', error);
      throw error;
    }
  }

  async togglePaymentConfigurationStatus(id: number, active: boolean): Promise<any | undefined> {
    try {
      const [config] = await db
        .update(paymentConfigurations)
        .set({ active })
        .where(eq(paymentConfigurations.id, id))
        .returning();
      return config;
    } catch (error) {
      console.error('Error toggling payment configuration status:', error);
      throw error;
    }
  }

  async deletePaymentConfiguration(id: number): Promise<boolean> {
    try {
      const result = await db.delete(paymentConfigurations).where(eq(paymentConfigurations.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting payment configuration:', error);
      throw error;
    }
  }

  private async createSystemSettingsTable(): Promise<void> {
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id SERIAL PRIMARY KEY,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          description TEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Insert default payment_mode setting
      await db.execute(`
        INSERT INTO system_settings (key, value, description)
        VALUES ('payment_mode', 'sandbox', 'Payment gateway environment mode (live or sandbox)')
        ON CONFLICT (key) DO NOTHING;
      `);

      console.log('✅ system_settings table created and initialized');
    } catch (error) {
      console.error('Failed to create system_settings table:', error);
      throw error;
    }
  }
}

// DatabaseStorage class is defined above and exported
// The storage instance is created in storage.ts