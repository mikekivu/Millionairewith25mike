import { 
  users, User, InsertUser, 
  plans, Plan, InsertPlan,
  investments, Investment, InsertInvestment,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral,
  paymentSettings, PaymentSetting, InsertPaymentSetting,
  contactMessages, ContactMessage, InsertContactMessage
} from "@shared/schema";
import { nanoid } from "nanoid";
import { addDays } from "date-fns";

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
  
  // Dashboard statistics
  getDashboardStats(): Promise<DashboardStats>;
  getUserDashboardStats(userId: number): Promise<UserDashboardStats>;
  
  // Network visualization
  getNetworkPerformance(userId: number): Promise<any>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plans: Map<number, Plan>;
  private investments: Map<number, Investment>;
  private transactions: Map<number, Transaction>;
  private referrals: Map<number, Referral>;
  private paymentSettings: Map<number, PaymentSetting>;
  private contactMessages: Map<number, ContactMessage>;
  
  private userId: number;
  private planId: number;
  private investmentId: number;
  private transactionId: number;
  private referralId: number;
  private paymentSettingId: number;
  private contactMessageId: number;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.investments = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    this.paymentSettings = new Map();
    this.contactMessages = new Map();
    
    this.userId = 1;
    this.planId = 1;
    this.investmentId = 1;
    this.transactionId = 1;
    this.referralId = 1;
    this.paymentSettingId = 1;
    this.contactMessageId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$8D0qqMQHtE2TLM6rVe8NtedHCZzCBTr.YFVH58oDMuPWipJptdHVa", // "admin123"
      email: "admin@richlance.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      active: true,
      referralCode: "ADMIN" + nanoid(8),
    };
    this.createUser(adminUser);
    
    // Create sample plans
    this.createPlan({
      name: "Basic",
      description: "Perfect for beginners looking to start their investment journey.",
      monthlyRate: "5",
      minDeposit: "100",
      maxDeposit: "1000",
      durationDays: 30,
      features: ["Min Deposit: 100 USDT", "Max Deposit: 1,000 USDT", "Duration: 30 days", "24/7 Support"],
      active: true
    });
    
    this.createPlan({
      name: "Standard",
      description: "Our most popular plan for active investors.",
      monthlyRate: "8",
      minDeposit: "1000",
      maxDeposit: "10000",
      durationDays: 30,
      features: ["Min Deposit: 1,000 USDT", "Max Deposit: 10,000 USDT", "Duration: 30 days", "24/7 Support + Financial Advisor"],
      active: true
    });
    
    this.createPlan({
      name: "Premium",
      description: "For serious investors seeking maximum returns.",
      monthlyRate: "12",
      minDeposit: "10000",
      maxDeposit: "50000",
      durationDays: 30,
      features: ["Min Deposit: 10,000 USDT", "Max Deposit: 50,000 USDT", "Duration: 30 days", "VIP Support + Dedicated Manager"],
      active: true
    });
    
    // Create payment settings
    this.createPaymentSetting({
      method: "paypal",
      name: "PayPal",
      instructions: "You will be redirected to PayPal to complete your payment. After completion, your account will be credited automatically.",
      credentials: `{"clientId":"${process.env.PAYPAL_CLIENT_ID || ''}","clientSecret":"${process.env.PAYPAL_CLIENT_SECRET || ''}"}`,
      minAmount: "10",
      maxAmount: "10000",
      active: true
    });
    
    this.createPaymentSetting({
      method: "usdt_trc20",
      name: "USDT (TRC20)",
      instructions: "Send USDT TRC20 to the wallet address displayed. Make sure to use the TRC20 network, otherwise your funds may be lost.",
      credentials: "TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb", // Example USDT TRC20 wallet address
      minAmount: "10",
      maxAmount: "50000",
      active: true
    });
    
    this.createPaymentSetting({
      method: "bank_transfer",
      name: "Bank Transfer",
      instructions: "Please include your transaction ID as reference when making the bank transfer. Your deposit will be processed once we've verified the payment.",
      credentials: `Bank Name: MillionaireWith$25 Bank
Account Name: MillionaireWith$25 Ltd
Account Number: 1234567890
Sort Code: 12-34-56
Swift/BIC: MLNRWITH25
Reference: Your Transaction ID`,
      minAmount: "100",
      maxAmount: "100000",
      active: true
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.referralCode === referralCode);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, walletBalance: "0" };
    
    if (!newUser.referralCode) {
      newUser.referralCode = newUser.username.toUpperCase() + nanoid(8);
    }
    
    this.users.set(id, newUser);
    
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

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserReferrals(userId: number): Promise<User[]> {
    const referrals = Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === userId && ref.level === 1);
      
    const referredUsers: User[] = [];
    for (const ref of referrals) {
      const user = await this.getUser(ref.referredId);
      if (user) {
        referredUsers.push(user);
      }
    }
    
    return referredUsers;
  }

  async toggleUserStatus(id: number, active: boolean): Promise<User | undefined> {
    return this.updateUser(id, { active });
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Plans Management
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const id = this.planId++;
    const newPlan: Plan = { ...plan, id };
    this.plans.set(id, newPlan);
    return newPlan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async getAllPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getActivePlans(): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.active);
  }

  async updatePlan(id: number, plan: Partial<Plan>): Promise<Plan | undefined> {
    const existingPlan = await this.getPlan(id);
    if (!existingPlan) {
      return undefined;
    }
    
    const updatedPlan = { ...existingPlan, ...plan };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }

  async togglePlanStatus(id: number, active: boolean): Promise<Plan | undefined> {
    return this.updatePlan(id, { active });
  }

  async deletePlan(id: number): Promise<boolean> {
    return this.plans.delete(id);
  }

  // Investments Management
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = this.investmentId++;
    const newInvestment: Investment = { 
      ...investment, 
      id, 
      createdAt: new Date(), 
      profit: "0"
    };
    this.investments.set(id, newInvestment);
    
    // Create transaction record for the investment
    await this.createTransaction({
      userId: investment.userId,
      type: "investment",
      amount: investment.amount,
      currency: "USDT",
      status: "completed",
      paymentMethod: "wallet",
      transactionDetails: `Investment in plan #${investment.planId}`,
      investmentId: id
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
    return this.investments.get(id);
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(inv => inv.userId === userId);
  }

  async getAllInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async updateInvestment(id: number, investment: Partial<Investment>): Promise<Investment | undefined> {
    const existingInvestment = await this.getInvestment(id);
    if (!existingInvestment) {
      return undefined;
    }
    
    const updatedInvestment = { ...existingInvestment, ...investment };
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }

  // Transactions Management
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date() };
    this.transactions.set(id, newTransaction);
    
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
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.type === type);
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined> {
    const existingTransaction = await this.getTransaction(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    // If we're changing status from pending to completed
    if (
      existingTransaction.status === "pending" && 
      transaction.status === "completed" &&
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
          await this.updateUser(user.id, { walletBalance: newBalance.toString() });
        }
      }
      
      // Handle referral commission
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
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Referral Management
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = this.referralId++;
    const newReferral: Referral = { ...referral, id, commissionAmount: "0", createdAt: new Date() };
    this.referrals.set(id, newReferral);
    return newReferral;
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }

  async getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === userId && ref.level === level);
  }

  async getAllUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === userId);
  }

  async updateReferral(id: number, referral: Partial<Referral>): Promise<Referral | undefined> {
    const existingReferral = await this.getReferral(id);
    if (!existingReferral) {
      return undefined;
    }
    
    const updatedReferral = { ...existingReferral, ...referral };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }

  // Payment Settings Management
  async createPaymentSetting(setting: InsertPaymentSetting): Promise<PaymentSetting> {
    const id = this.paymentSettingId++;
    const newSetting: PaymentSetting = { 
      ...setting, 
      id,
      minAmount: setting.minAmount || "10",
      maxAmount: setting.maxAmount || "10000"
    };
    this.paymentSettings.set(id, newSetting);
    return newSetting;
  }

  async getPaymentSetting(id: number): Promise<PaymentSetting | undefined> {
    return this.paymentSettings.get(id);
  }

  async getPaymentSettingByMethod(method: string): Promise<PaymentSetting | undefined> {
    return Array.from(this.paymentSettings.values())
      .find(setting => setting.method === method);
  }

  async getAllPaymentSettings(): Promise<PaymentSetting[]> {
    return Array.from(this.paymentSettings.values());
  }

  async updatePaymentSetting(id: number, setting: Partial<PaymentSetting>): Promise<PaymentSetting | undefined> {
    const existingSetting = await this.getPaymentSetting(id);
    if (!existingSetting) {
      return undefined;
    }
    
    const updatedSetting = { ...existingSetting, ...setting };
    this.paymentSettings.set(id, updatedSetting);
    return updatedSetting;
  }

  async togglePaymentMethod(id: number, active: boolean): Promise<PaymentSetting | undefined> {
    return this.updatePaymentSetting(id, { active });
  }

  // Contact Messages Management
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageId++;
    const newMessage: ContactMessage = { ...message, id, createdAt: new Date(), responded: false };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async markMessageAsResponded(id: number): Promise<ContactMessage | undefined> {
    const existingMessage = await this.getContactMessage(id);
    if (!existingMessage) {
      return undefined;
    }
    
    const updatedMessage = { ...existingMessage, responded: true };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Helper functions
  private async getReferrerChain(userId: number, chain: number[] = []): Promise<number[]> {
    const user = await this.getUser(userId);
    if (!user || !user.referredBy) {
      return chain;
    }
    
    chain.push(user.referredBy);
    return this.getReferrerChain(user.referredBy, chain);
  }
  
  private getCommissionRateForLevel(level: number): string {
    switch (level) {
      case 2: return "5";
      case 3: return "3";
      case 4: return "2";
      case 5: return "1";
      default: return "0";
    }
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const allUsers = await this.getAllUsers();
    const activeUsers = allUsers.filter(user => user.active);
    const inactiveUsers = allUsers.filter(user => !user.active);
    
    const allInvestments = await this.getAllInvestments();
    const totalInvested = allInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toString();
    
    const allDeposits = await this.getTransactionsByType("deposit");
    const completedDeposits = allDeposits.filter(tx => tx.status === "completed");
    const totalDeposits = completedDeposits.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    const allWithdrawals = await this.getTransactionsByType("withdrawal");
    const completedWithdrawals = allWithdrawals.filter(tx => tx.status === "completed");
    const totalWithdrawals = completedWithdrawals.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    const allTransactions = await this.getAllTransactions();
    const recentTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
    
    const recentUsers = allUsers
      .sort((a, b) => {
        const aId = a.id;
        const bId = b.id;
        return bId - aId; // Sort by ID descending (assuming higher ID = newer)
      })
      .slice(0, 10);
    
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
      throw new Error("User not found");
    }
    
    const userInvestments = await this.getUserInvestments(userId);
    const totalInvested = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toString();
    
    const userTransactions = await this.getUserTransactions(userId);
    const earningsTransactions = userTransactions.filter(tx => 
      (tx.type === "investment" && tx.status === "completed" && parseFloat(tx.amount) > 0)
    );
    const totalEarnings = earningsTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    const referralTransactions = userTransactions.filter(tx => 
      tx.type === "referral" && tx.status === "completed"
    );
    const referralEarnings = referralTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    
    const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;
    
    const userReferrals = await this.getAllUserReferrals(userId);
    const referralCount = userReferrals.length;
    
    return {
      walletBalance: user.walletBalance,
      totalInvested,
      totalEarnings,
      referralEarnings,
      activeInvestments,
      referralCount
    };
  }
  
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
        isActive: user.active,
        children: []
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
      isActive: user.active,
      children: []
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
          treeNode.children.push(childNode);
        }
      }
    }
    
    return treeNode;
  }
}

import { DatabaseStorage } from "./database-storage";

// Use the database storage implementation
export const storage = new DatabaseStorage();
