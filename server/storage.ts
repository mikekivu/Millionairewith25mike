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
  systemSettings, SystemSetting, InsertSystemSetting
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plans: Map<number, Plan>;
  private investments: Map<number, Investment>;
  private transactions: Map<number, Transaction>;
  private referrals: Map<number, Referral>;
  private paymentSettings: Map<number, PaymentSetting>;
  private contactMessages: Map<number, ContactMessage>;
  private userMessages: Map<number, UserMessage>;
  private notifications: Map<number, Notification>;
  private systemSettings: Map<string, SystemSetting>;

  private userId: number;
  private planId: number;
  private investmentId: number;
  private transactionId: number;
  private referralId: number;
  private paymentSettingId: number;
  private contactMessageId: number;
  private userMessageId: number;
  private notificationId: number;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.investments = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    this.paymentSettings = new Map();
    this.contactMessages = new Map();
    this.userMessages = new Map();
    this.notifications = new Map();
    this.systemSettings = new Map();

    this.userId = 1;
    this.planId = 1;
    this.investmentId = 1;
    this.transactionId = 1;
    this.referralId = 1;
    this.paymentSettingId = 1;
    this.contactMessageId = 1;
    this.userMessageId = 1;
    this.notificationId = 1;

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

    // Create Matrix Board plans
    this.createPlan({
      name: "Matrix Board 1",
      description: "Join with 25 USDT. Refer 15 People to earn 200 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "25",
      maxDeposit: "25",
      durationDays: 365,
      features: [
        "Join with 25 USDT", 
        "Refer 15 People", 
        "Total Income: 200 USDT", 
        "Re-Entry: 25 USDT",
        "Total Income After Re-Entry: 200 USDT",
        "Reward Gift: Health Product"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "200",
      reEntryAmount: "25",
      totalIncomeAfterReEntry: "200",
      rewardGift: "Health Product"
    });

    this.createPlan({
      name: "Matrix Board 2",
      description: "Join with 100 USDT. Refer 15 People to earn 800 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "100",
      maxDeposit: "100",
      durationDays: 365,
      features: [
        "Join with 100 USDT", 
        "Refer 15 People", 
        "Total Income: 800 USDT", 
        "Re-Entry: 100 USDT",
        "Total Income After Re-Entry: 700 USDT",
        "Reward Gift: Mobile phone"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "800",
      reEntryAmount: "100",
      totalIncomeAfterReEntry: "700",
      rewardGift: "Mobile phone"
    });

    this.createPlan({
      name: "Matrix Board 3",
      description: "Join with 500 USDT. Refer 15 People to earn 4000 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "500",
      maxDeposit: "500",
      durationDays: 365,
      features: [
        "Join with 500 USDT", 
        "Refer 15 People", 
        "Total Income: 4000 USDT", 
        "Re-Entry: 500 USDT",
        "Total Income After Re-Entry: 3500 USDT",
        "Reward Gift: Tablet"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "4000",
      reEntryAmount: "500",
      totalIncomeAfterReEntry: "3500",
      rewardGift: "Tablet"
    });

    this.createPlan({
      name: "Matrix Board 4",
      description: "Join with 1000 USDT. Refer 15 People to earn 8000 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "1000",
      maxDeposit: "1000",
      durationDays: 365,
      features: [
        "Join with 1000 USDT", 
        "Refer 15 People", 
        "Total Income: 8000 USDT", 
        "Re-Entry: 1000 USDT",
        "Total Income After Re-Entry: 7000 USDT",
        "Reward Gift: iPad"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "8000",
      reEntryAmount: "1000",
      totalIncomeAfterReEntry: "7000",
      rewardGift: "iPad"
    });

    this.createPlan({
      name: "Matrix Board 5",
      description: "Join with 4000 USDT. Refer 15 People to earn 32000 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "4000",
      maxDeposit: "4000",
      durationDays: 365,
      features: [
        "Join with 4000 USDT", 
        "Refer 15 People", 
        "Total Income: 32000 USDT", 
        "Re-Entry: 4000 USDT",
        "Total Income After Re-Entry: 28000 USDT",
        "Reward Gift: Laptop"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "32000",
      reEntryAmount: "4000",
      totalIncomeAfterReEntry: "28000",
      rewardGift: "Laptop"
    });

    this.createPlan({
      name: "Matrix Board 6",
      description: "Join with 8000 USDT. Refer 15 People to earn 64000 USDT. Re-entry available.",
      monthlyRate: "0",
      minDeposit: "8000",
      maxDeposit: "8000",
      durationDays: 365,
      features: [
        "Join with 8000 USDT", 
        "Refer 15 People", 
        "Total Income: 64000 USDT", 
        "Re-Entry: 8000 USDT",
        "Total Income After Re-Entry: 56000 USDT",
        "Reward Gift: Holiday treatment vocation"
      ],
      active: true,
      requiredReferrals: 15,
      totalIncome: "64000",
      reEntryAmount: "8000",
      totalIncomeAfterReEntry: "56000",
      rewardGift: "Holiday treatment vocation"
    });

    // Create payment settings - only Coinbase USDT TRC20
    this.createPaymentSetting({
      method: "usdt_trc20",
      name: "USDT (TRC20)",
      instructions: "Send USDT TRC20 to the wallet address displayed below. Make sure to use the TRC20 network on Coinbase, otherwise your funds may be lost. After sending, please upload the payment proof screenshot for verification.",
      credentials: "TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb", // Example USDT TRC20 wallet address
      minAmount: "25", // Minimum is 25 USDT for Matrix Board 1
      maxAmount: "8000", // Maximum is 8000 USDT for Matrix Board 6
      active: true,
      payment_method: "usdt_trc20"
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
    // Get all referrals where this user is the referrer
    const referrals = Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === userId);

    // Enrich with referred user data for easier display
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const referredUser = await this.getUser(referral.referredId);
        return {
          ...referral,
          referredUser: referredUser ? {
            id: referredUser.id,
            username: referredUser.username,
            email: referredUser.email,
            firstName: referredUser.firstName,
            lastName: referredUser.lastName,
            active: referredUser.active
          } : null
        };
      })
    );

    return enrichedReferrals;
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

  // System settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    return this.systemSettings.get(key);
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    const existingSetting = await this.getSystemSetting(key);
    const id = key;
    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value, description: description || existingSetting.description };
      this.systemSettings.set(key, updatedSetting);
      return updatedSetting;
    } else {
      const newSetting: SystemSetting = { key, value, description, id };
      this.systemSettings.set(key, newSetting);
      return newSetting;
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values());
  }
}

// Use the database storage implementation
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();

// The profit processor is already started in server/index.ts

import { eq } from "drizzle-orm";
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return user || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      return user || null;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }

  async getUserByReferralCode(referralCode: string): Promise<User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.referralCode, referralCode),
      });
      return user || null;
    } catch (error) {
      console.error("Error getting user by referral code:", error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const newUser = await db.insert(users).values(user).returning().get();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await db
        .update(users)
        .set(user)
        .where(eq(users.id, id))
        .returning()
        .get();
      return updatedUser || null;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.query.users.findMany();
      return allUsers;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async getUserReferrals(userId: number): Promise<User[]> {
    // This requires a more complex query to fetch users referred by the given user.
    // You might need to use a separate table for referrals to make this efficient.
    // For now, let's assume you have a 'referrals' table with 'referrerId' and 'referredId' columns.
    try {
      const referredUsers = await db.query.users.findMany({
        where: eq(users.referredBy, userId),
      });
      return referredUsers;
    } catch (error) {
      console.error("Error getting user referrals:", error);
      throw error;
    }
  }

  async toggleUserStatus(id: number, active: boolean): Promise<User | null> {
    try {
      const updatedUser = await db
        .update(users)
        .set({ active: active })
        .where(eq(users.id, id))
        .returning()
        .get();
      return updatedUser || null;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    try {
      const newPlan = await db.insert(plans).values(plan).returning().get();
      return newPlan;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  }

  async getPlan(id: number): Promise<Plan | null> {
    try {
      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, id),
      });
      return plan || null;
    } catch (error) {
      console.error("Error getting plan:", error);
      throw error;
    }
  }

  async getAllPlans(): Promise<Plan[]> {
    try {
      const allPlans = await db.query.plans.findMany();
      return allPlans;
    } catch (error) {
      console.error("Error getting all plans:", error);
      throw error;
    }
  }

  async getActivePlans(): Promise<Plan[]> {
    try {
      const activePlans = await db.query.plans.findMany({
        where: eq(plans.active, true),
      });
      return activePlans;
    } catch (error) {
      console.error("Error getting active plans:", error);
      throw error;
    }
  }

  async updatePlan(id: number, plan: Partial<Plan>): Promise<Plan | null> {
    try {
      const updatedPlan = await db
        .update(plans)
        .set(plan)
        .where(eq(plans.id, id))
        .returning()
        .get();
      return updatedPlan || null;
    } catch (error) {
      console.error("Error updating plan:", error);
      throw error;
    }
  }

  async togglePlanStatus(id: number, active: boolean): Promise<Plan | null> {
    try {
      const updatedPlan = await db
        .update(plans)
        .set({ active: active })
        .where(eq(plans.id, id))
        .returning()
        .get();
      return updatedPlan || null;
    } catch (error) {
      console.error("Error toggling plan status:", error);
      throw error;
    }
  }

  async deletePlan(id: number): Promise<boolean> {
    try {
      await db.delete(plans).where(eq(plans.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting plan:", error);
      return false;
    }
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    try {
      const newInvestment = await db.insert(investments).values(investment).returning().get();
      return newInvestment;
    } catch (error) {
      console.error("Error creating investment:", error);
      throw error;
    }
  }

  async getInvestment(id: number): Promise<Investment | null> {
    try {
      const investment = await db.query.investments.findFirst({
        where: eq(investments.id, id),
      });
      return investment || null;
    } catch (error) {
      console.error("Error getting investment:", error);
      throw error;
    }
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    try {
      const userInvestments = await db.query.investments.findMany({
        where: eq(investments.userId, userId),
      });
      return userInvestments;
    } catch (error) {
      console.error("Error getting user investments:", error);
      throw error;
    }
  }

  async getAllInvestments(): Promise<Investment[]> {
    try {
      const allInvestments = await db.query.investments.findMany();
      return allInvestments;
    } catch (error) {
      console.error("Error getting all investments:", error);
      throw error;
    }
  }

  async updateInvestment(id: number, investment: Partial<Investment>): Promise<Investment | null> {
    try {
      const updatedInvestment = await db
        .update(investments)
        .set(investment)
        .where(eq(investments.id, id))
        .returning()
        .get();
      return updatedInvestment || null;
    } catch (error) {
      console.error("Error updating investment:", error);
      throw error;
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      const newTransaction = await db.insert(transactions).values(transaction).returning().get();
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async getTransaction(id: number): Promise<Transaction | null> {
    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, id),
      });
      return transaction || null;
    } catch (error) {
      console.error("Error getting transaction:", error);
      throw error;
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      const userTransactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
      });
      return userTransactions;
    } catch (error) {
      console.error("Error getting user transactions:", error);
      throw error;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const allTransactions = await db.query.transactions.findMany();
      return allTransactions;
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw error;
    }
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    try {
      const transactionsByType = await db.query.transactions.findMany({
        where: eq(transactions.type, type),
      });
      return transactionsByType;
    } catch (error) {
      console.error("Error getting transactions by type:", error);
      throw error;
    }
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const updatedTransaction = await db
        .update(transactions)
        .set(transaction)
        .where(eq(transactions.id, id))
        .returning()
        .get();
      return updatedTransaction || null;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async getTransactionByReference(reference: string): Promise<Transaction | null> {
    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.reference, reference),
      });
      return transaction || null;
    } catch (error) {
      console.error("Error getting transaction by reference:", error);
      throw error;
    }
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    try {
      const newReferral = await db.insert(referrals).values(referral).returning().get();
      return newReferral;
    } catch (error) {
      console.error("Error creating referral:", error);
      throw error;
    }
  }

  async getReferral(id: number): Promise<Referral | null> {
    try {
      const referral = await db.query.referrals.findFirst({
        where: eq(referrals.id, id),
      });
      return referral || null;
    } catch (error) {
      console.error("Error getting referral:", error);
      throw error;
    }
  }

  async getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]> {
    try {
      const userReferrals = await db.query.referrals.findMany({
        where: eq(referrals.referrerId, userId),
      });
      return userReferrals;
    } catch (error) {
      console.error("Error getting user referrals by level:", error);
      throw error;
    }
  }

  async getAllUserReferrals(userId: number): Promise<Referral[]> {
    try {
      const allUserReferrals = await db.query.referrals.findMany({
        where: eq(referrals.referrerId, userId),
      });
      return allUserReferrals;
    } catch (error) {
      console.error("Error getting all user referrals:", error);
      throw error;
    }
  }

  async updateReferral(id: number, referral: Partial<Referral>): Promise<Referral | null> {
    try {
      const updatedReferral = await db
        .update(referrals)
        .set(referral)
        .where(eq(referrals.id, id))
        .returning()
        .get();
      return updatedReferral || null;
    } catch (error) {
      console.error("Error updating referral:", error);
      throw error;
    }
  }

  async createPaymentSetting(setting: InsertPaymentSetting): Promise<PaymentSetting> {
    try {
      const newSetting = await db.insert(paymentSettings).values(setting).returning().get();
      return newSetting;
    } catch (error) {
      console.error("Error creating payment setting:", error);
      throw error;
    }
  }

  async getPaymentSetting(id: number): Promise<PaymentSetting | null> {
    try {
      const paymentSetting = await db.query.paymentSettings.findFirst({
        where: eq(paymentSettings.id, id),
      });
      return paymentSetting || null;
    } catch (error) {
      console.error("Error getting payment setting:", error);
      throw error;
    }
  }

  async getPaymentSettingByMethod(method: string): Promise<PaymentSetting | null> {
    try {
      const paymentSetting = await db.query.paymentSettings.findFirst({
        where: eq(paymentSettings.method, method),
      });
      return paymentSetting || null;
    } catch (error) {
      console.error("Error getting payment setting by method:", error);
      throw error;
    }
  }

  async getAllPaymentSettings(): Promise<PaymentSetting[]> {
    try {
      const allPaymentSettings = await db.query.paymentSettings.findMany();
      return allPaymentSettings;
    } catch (error) {
      console.error("Error getting all payment settings:", error);
      throw error;
    }
  }

  async updatePaymentSetting(id: number, setting: Partial<PaymentSetting>): Promise<PaymentSetting | null> {
    try {
      const updatedPaymentSetting = await db
        .update(paymentSettings)
        .set(setting)
        .where(eq(paymentSettings.id, id))
        .returning()
        .get();
      return updatedPaymentSetting || null;
    } catch (error) {
      console.error("Error updating payment setting:", error);
      throw error;
    }
  }

  async togglePaymentMethod(id: number, active: boolean): Promise<PaymentSetting | null> {
    try {
      const updatedPaymentSetting = await db
        .update(paymentSettings)
        .set({ active: active })
        .where(eq(paymentSettings.id, id))
        .returning()
        .get();
      return updatedPaymentSetting || null;
    } catch (error) {
      console.error("Error toggling payment method:", error);
      throw error;
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      const newContactMessage = await db.insert(contactMessages).values(message).returning().get();
      return newContactMessage;
    } catch (error) {
      console.error("Error creating contact message:", error);
      throw error;
    }
  }

  async getContactMessage(id: number): Promise<ContactMessage | null> {
    try {
      const contactMessage = await db.query.contactMessages.findFirst({
        where: eq(contactMessages.id, id),
      });
      return contactMessage || null;
    } catch (error) {
      console.error("Error getting contact message:", error);
      throw error;
    }
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    try {
      const allContactMessages = await db.query.contactMessages.findMany();
      return allContactMessages;
    } catch (error) {
      console.error("Error getting all contact messages:", error);
      throw error;
    }
  }

  async markMessageAsResponded(id: number): Promise<ContactMessage | null> {
    try {
      const updatedContactMessage = await db
        .update(contactMessages)
        .set({ responded: true })
        .where(eq(contactMessages.id, id))
        .returning()
        .get();
      return updatedContactMessage || null;
    } catch (error) {
      console.error("Error marking message as responded:", error);
      throw error;
    }
  }

  async createUserMessage(message: InsertUserMessage): Promise<UserMessage> {
    try {
      const newUserMessage = await db.insert(userMessages).values(message).returning().get();
      return newUserMessage;
    } catch (error) {
      console.error("Error creating user message:", error);
      throw error;
    }
  }

  async getUserMessage(id: number): Promise<UserMessage | null> {
    try {
      const userMessage = await db.query.userMessages.findFirst({
        where: eq(userMessages.id, id),
      });
      return userMessage || null;
    } catch (error) {
      console.error("Error getting user message:", error);
      throw error;
    }
  }

  async getUserSentMessages(userId: number): Promise<UserMessage[]> {
    try {
      const userSentMessages = await db.query.userMessages.findMany({
        where: eq(userMessages.senderId, userId),
      });
      return userSentMessages;
    } catch (error) {
      console.error("Error getting user sent messages:", error);
      throw error;
    }
  }

  async getUserReceivedMessages(userId: number): Promise<UserMessage[]> {
    try {
      const userReceivedMessages = await db.query.userMessages.findMany({
        where: eq(userMessages.receiverId, userId),
      });
      return userReceivedMessages;
    } catch (error) {
      console.error("Error getting user received messages:", error);
      throw error;
    }
  }

  async markUserMessageAsRead(id: number): Promise<UserMessage | null> {
    try {
      const updatedUserMessage = await db
        .update(userMessages)
        .set({ isRead: true })
        .where(eq(userMessages.id, id))
        .returning()
        .get();
      return updatedUserMessage || null;
    } catch (error) {
      console.error("Error marking user message as read:", error);
      throw error;
    }
  }

  async markUserMessageAsReplied(id: number): Promise<UserMessage | null> {
    try {
      const updatedUserMessage = await db
        .update(userMessages)
        .set({ isReplied: true })
        .where(eq(userMessages.id, id))
        .returning()
        .get();
      return updatedUserMessage || null;
    } catch (error) {
      console.error("Error marking user message as replied:", error);
      throw error;
    }
  }

  async isDemoUser(userId: number): Promise<boolean> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      return user?.role === "demo_user" || false;
    } catch (error) {
      console.error("Error checking if user is demo user:", error);
      return false;
    }
  }

  async updateUserWallet(userId: number, amount: string, operation: 'add' | 'subtract' | 'set'): Promise<User | null> {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;

      let newBalance: string;
      const currentBalance = parseFloat(user.walletBalance);
      const changeAmount = parseFloat(amount);

      switch (operation) {
        case 'add':
          newBalance = (currentBalance + changeAmount).toString();
          break;
        case 'subtract':
          newBalance = Math.max(0, currentBalance - changeAmount).toString();
          break;
        case 'set':
          newBalance = changeAmount.toString();
          break;
        default:
          return null;
      }

      const updatedUser = await db
        .update(users)
        .set({ walletBalance: newBalance })
        .where(eq(users.id, userId))
        .returning()
        .get();
      return updatedUser || null;
    } catch (error) {
      console.error("Error updating user wallet:", error);
      throw error;
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const newNotification = await db.insert(notifications).values(notification).returning().get();
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotification(id: number): Promise<Notification | null> {
    try {
      const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, id),
      });
      return notification || null;
    } catch (error) {
      console.error("Error getting notification:", error);
      throw error;
    }
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
      });
      return userNotifications;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  async getUnreadUserNotifications(userId: number): Promise<Notification[]> {
    try {
      const unreadUserNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
      });
      return unreadUserNotifications;
    } catch (error) {
      console.error("Error getting unread user notifications:", error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification | null> {
    try {
      const updatedNotification = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning()
        .get();
      return updatedNotification || null;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
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
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  async getUserDashboardStats(userId: number): Promise<UserDashboardStats> {
    try {
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
    } catch (error) {
      console.error("Error getting user dashboard stats:", error);
      throw error;
    }
  }

  async getNetworkPerformance(userId: number): Promise<any> {
    try {
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
    } catch (error) {
      console.error("Error getting network performance:", error);
      throw error;
    }
  }

  private async buildReferralPerformanceTree(userId: number, currentLevel: number, maxLevel: number): Promise<any> {
    try {
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
    } catch (error) {
      console.error("Error building referral performance tree:", error);
      return null;
    }
  }

  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    try {
      const systemSetting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, key),
      });
      return systemSetting || null;
    } catch (error) {
      console.error("Error getting system setting:", error);
      throw error;
    }
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    try {
      // Check if the setting exists
      const existingSetting = await this.getSystemSetting(key);

      if (existingSetting) {
        // Update the existing setting
        const updatedSetting = await db
          .update(systemSettings)
          .set({ value: value, description: description || existingSetting.description })
          .where(eq(systemSettings.key, key))
          .returning()
          .get();
        return updatedSetting;
      } else {
        // Insert a new setting
        const newSetting = await db
          .insert(systemSettings)
          .values({ key: key, value: value, description: description })
          .returning()
          .get();
        return newSetting;
      }
    } catch (error) {
      console.error("Error setting system setting:", error);
      throw error;
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    try {
      const allSystemSettings = await db.query.systemSettings.findMany();
      return allSystemSettings;
    } catch (error) {
      console.error("Error getting all system settings:", error);
      throw error;
    }
  }
}