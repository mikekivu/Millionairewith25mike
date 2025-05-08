import { 
  users, User, InsertUser,
  investmentPlans, InvestmentPlan, InsertInvestmentPlan,
  investments, Investment, InsertInvestment,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral,
  paymentGateways, PaymentGateway, InsertPaymentGateway
} from "@shared/schema";
import { nanoid } from "nanoid";
import crypto from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(active?: boolean): Promise<User[]>;
  getUserReferrals(userId: number): Promise<User[]>;
  
  // Investment Plan operations
  getInvestmentPlan(id: number): Promise<InvestmentPlan | undefined>;
  getAllInvestmentPlans(activeOnly?: boolean): Promise<InvestmentPlan[]>;
  createInvestmentPlan(plan: InsertInvestmentPlan): Promise<InvestmentPlan>;
  updateInvestmentPlan(id: number, data: Partial<InvestmentPlan>): Promise<InvestmentPlan | undefined>;
  
  // Investment operations
  getInvestment(id: number): Promise<Investment | undefined>;
  getUserInvestments(userId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, data: Partial<Investment>): Promise<Investment | undefined>;
  getAllInvestments(): Promise<Investment[]>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Referral operations
  getReferral(id: number): Promise<Referral | undefined>;
  getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getGenealogyTree(userId: number, maxLevel?: number): Promise<Record<number, User[]>>;
  
  // Payment Gateway operations
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  getPaymentGatewayByName(name: string): Promise<PaymentGateway | undefined>;
  getAllPaymentGateways(activeOnly?: boolean): Promise<PaymentGateway[]>;
  createPaymentGateway(gateway: InsertPaymentGateway): Promise<PaymentGateway>;
  updatePaymentGateway(id: number, data: Partial<PaymentGateway>): Promise<PaymentGateway | undefined>;

  // Dashboard statistics
  getTotalDeposits(): Promise<number>;
  getTotalWithdrawals(): Promise<number>;
  getActiveInvestments(): Promise<number>;
  getTotalInvestments(): Promise<number>;
  getActiveUsers(): Promise<number>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private investmentPlansData: Map<number, InvestmentPlan>;
  private investmentsData: Map<number, Investment>;
  private transactionsData: Map<number, Transaction>;
  private referralsData: Map<number, Referral>;
  private paymentGatewaysData: Map<number, PaymentGateway>;
  
  private userIdCounter: number;
  private planIdCounter: number;
  private investmentIdCounter: number;
  private transactionIdCounter: number;
  private referralIdCounter: number;
  private gatewayIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.investmentPlansData = new Map();
    this.investmentsData = new Map();
    this.transactionsData = new Map();
    this.referralsData = new Map();
    this.paymentGatewaysData = new Map();
    
    this.userIdCounter = 1;
    this.planIdCounter = 1;
    this.investmentIdCounter = 1;
    this.transactionIdCounter = 1;
    this.referralIdCounter = 1;
    this.gatewayIdCounter = 1;
    
    // Initialize with default investment plans
    this.seedInvestmentPlans();
    // Initialize with default payment gateways
    this.seedPaymentGateways();
    // Add admin user
    this.seedAdminUser();
  }

  // Seed methods
  private seedInvestmentPlans() {
    const plans = [
      {
        name: "Starter Plan",
        description: "Perfect for beginners looking to start their investment journey.",
        monthlyReturn: "8",
        minInvestment: "100",
        termMonths: 3,
        referralCommission: "5",
        referralLevels: 1,
        earlyWithdrawalFee: "10",
        status: "active"
      },
      {
        name: "Growth Plan",
        description: "Designed for serious investors looking for substantial returns.",
        monthlyReturn: "12",
        minInvestment: "500",
        termMonths: 6,
        referralCommission: "7",
        referralLevels: 2,
        earlyWithdrawalFee: "8",
        status: "active"
      },
      {
        name: "Premium Plan",
        description: "Our elite plan for maximum returns and premium benefits.",
        monthlyReturn: "18",
        minInvestment: "2000",
        termMonths: 12,
        referralCommission: "10",
        referralLevels: 3,
        earlyWithdrawalFee: "5",
        status: "active"
      }
    ];
    
    plans.forEach(plan => {
      this.createInvestmentPlan(plan as any);
    });
  }

  private seedPaymentGateways() {
    const gateways = [
      {
        name: "PayPal",
        isActive: true,
        apiKey: process.env.PAYPAL_CLIENT_ID || "PAYPAL_CLIENT_ID",
        apiSecret: process.env.PAYPAL_CLIENT_SECRET || "PAYPAL_CLIENT_SECRET",
        environment: "sandbox"
      },
      {
        name: "Coinbase",
        isActive: true,
        apiKey: process.env.COINBASE_API_KEY || "COINBASE_API_KEY",
        apiSecret: process.env.COINBASE_API_SECRET || "COINBASE_API_SECRET",
        walletAddress: process.env.COINBASE_WALLET_ADDRESS || "COINBASE_WALLET_ADDRESS",
        environment: "sandbox"
      }
    ];
    
    gateways.forEach(gateway => {
      this.createPaymentGateway(gateway as any);
    });
  }

  private seedAdminUser() {
    const adminUser: InsertUser = {
      username: "admin",
      email: "admin@richlance.com",
      password: this.hashPassword("admin123"),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      referralCode: nanoid(10)
    };
    
    this.createUser(adminUser);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.usersData.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.usersData.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    for (const user of this.usersData.values()) {
      if (user.referralCode === referralCode) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Generate referral code if not provided
    if (!userData.referralCode) {
      userData.referralCode = nanoid(10);
    }
    
    // Set up referral relationship if referrer provided
    let referralLevel = 0;
    if (userData.referrerId) {
      const referrer = await this.getUser(userData.referrerId);
      if (referrer) {
        referralLevel = referrer.referralLevel + 1;
      }
    }
    
    const user: User = {
      ...userData,
      id,
      walletBalance: "0",
      referralLevel,
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    
    this.usersData.set(id, user);
    
    // Create referral records if referrer provided
    if (userData.referrerId) {
      // Direct referral (level 1)
      await this.createReferral({
        userId: id,
        referrerId: userData.referrerId,
        level: 1
      });
      
      // Find higher level referrers up to 5 levels
      await this.createHigherLevelReferrals(id, userData.referrerId, 2);
    }
    
    return user;
  }

  private async createHigherLevelReferrals(userId: number, directReferrerId: number, currentLevel: number) {
    if (currentLevel > 5) return; // Limit to 5 levels
    
    const referrer = await this.getUser(directReferrerId);
    if (!referrer || !referrer.referrerId) return;
    
    // Create the next level referral
    await this.createReferral({
      userId,
      referrerId: referrer.referrerId,
      level: currentLevel
    });
    
    // Continue up the chain
    await this.createHigherLevelReferrals(userId, referrer.referrerId, currentLevel + 1);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date()
    };
    
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(active?: boolean): Promise<User[]> {
    const users = Array.from(this.usersData.values());
    if (active !== undefined) {
      return users.filter(user => (user.status === 'active') === active);
    }
    return users;
  }

  async getUserReferrals(userId: number): Promise<User[]> {
    const referrals: User[] = [];
    for (const user of this.usersData.values()) {
      if (user.referrerId === userId) {
        referrals.push(user);
      }
    }
    return referrals;
  }

  // Investment Plan operations
  async getInvestmentPlan(id: number): Promise<InvestmentPlan | undefined> {
    return this.investmentPlansData.get(id);
  }

  async getAllInvestmentPlans(activeOnly = false): Promise<InvestmentPlan[]> {
    const plans = Array.from(this.investmentPlansData.values());
    if (activeOnly) {
      return plans.filter(plan => plan.status === 'active');
    }
    return plans;
  }

  async createInvestmentPlan(planData: InsertInvestmentPlan): Promise<InvestmentPlan> {
    const id = this.planIdCounter++;
    const now = new Date();
    
    const plan: InvestmentPlan = {
      ...planData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.investmentPlansData.set(id, plan);
    return plan;
  }

  async updateInvestmentPlan(id: number, data: Partial<InvestmentPlan>): Promise<InvestmentPlan | undefined> {
    const plan = this.investmentPlansData.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = {
      ...plan,
      ...data,
      updatedAt: new Date()
    };
    
    this.investmentPlansData.set(id, updatedPlan);
    return updatedPlan;
  }

  // Investment operations
  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investmentsData.get(id);
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    const investments: Investment[] = [];
    for (const investment of this.investmentsData.values()) {
      if (investment.userId === userId) {
        investments.push(investment);
      }
    }
    return investments;
  }

  async createInvestment(investmentData: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const now = new Date();
    
    const investment: Investment = {
      ...investmentData,
      id,
      createdAt: now,
      updatedAt: now,
      lastPayoutDate: null
    };
    
    this.investmentsData.set(id, investment);
    
    // Create transaction record for the investment
    await this.createTransaction({
      userId: investmentData.userId,
      type: "investment",
      amount: investmentData.amount.toString(),
      status: "completed",
      description: `Investment in plan #${investmentData.planId}`,
      investmentId: id
    });
    
    // Update user wallet balance
    const user = await this.getUser(investmentData.userId);
    if (user) {
      const newBalance = (parseFloat(user.walletBalance) - parseFloat(investmentData.amount.toString())).toString();
      await this.updateUser(user.id, { walletBalance: newBalance });
    }
    
    // Process referral commissions
    await this.processReferralCommissions(investmentData);
    
    return investment;
  }
  
  private async processReferralCommissions(investment: InsertInvestment) {
    const investor = await this.getUser(investment.userId);
    if (!investor || !investor.referrerId) return;
    
    const plan = await this.getInvestmentPlan(investment.planId);
    if (!plan) return;
    
    // Get all referrals for this user
    const referrals = await this.getReferralsByUserId(investment.userId);
    
    // Map to store commission percentages by level
    const commissionByLevel: Record<number, number> = {
      1: parseFloat(plan.referralCommission.toString())
    };
    
    // Calculate commissions for levels 2-5 (decreasing by level)
    for (let i = 2; i <= plan.referralLevels; i++) {
      commissionByLevel[i] = commissionByLevel[i-1] * 0.5; // 50% of previous level
    }
    
    // Process each referral level
    for (const referral of referrals) {
      if (referral.level > plan.referralLevels) continue;
      
      const commissionPercent = commissionByLevel[referral.level] || 0;
      if (commissionPercent > 0) {
        const commissionAmount = (parseFloat(investment.amount.toString()) * commissionPercent / 100).toString();
        
        // Create referral commission transaction
        await this.createTransaction({
          userId: referral.referrerId,
          type: "referral",
          amount: commissionAmount,
          status: "completed",
          description: `Level ${referral.level} referral commission from investment #${investment.userId}`,
          referrerId: investment.userId
        });
        
        // Update referrer's wallet balance
        const referrer = await this.getUser(referral.referrerId);
        if (referrer) {
          const newBalance = (parseFloat(referrer.walletBalance) + parseFloat(commissionAmount)).toString();
          await this.updateUser(referrer.id, { walletBalance: newBalance });
        }
      }
    }
  }

  private async getReferralsByUserId(userId: number): Promise<Referral[]> {
    const referrals: Referral[] = [];
    for (const referral of this.referralsData.values()) {
      if (referral.userId === userId) {
        referrals.push(referral);
      }
    }
    return referrals;
  }

  async updateInvestment(id: number, data: Partial<Investment>): Promise<Investment | undefined> {
    const investment = this.investmentsData.get(id);
    if (!investment) return undefined;
    
    const updatedInvestment = {
      ...investment,
      ...data,
      updatedAt: new Date()
    };
    
    this.investmentsData.set(id, updatedInvestment);
    return updatedInvestment;
  }

  async getAllInvestments(): Promise<Investment[]> {
    return Array.from(this.investmentsData.values());
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsData.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    for (const transaction of this.transactionsData.values()) {
      if (transaction.userId === userId) {
        transactions.push(transaction);
      }
    }
    return transactions;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    
    const transaction: Transaction = {
      ...transactionData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.transactionsData.set(id, transaction);
    
    // Handle deposits
    if (transaction.type === "deposit" && transaction.status === "completed") {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const newBalance = (parseFloat(user.walletBalance) + parseFloat(transaction.amount)).toString();
        await this.updateUser(user.id, { walletBalance: newBalance });
      }
    }
    
    // Handle withdrawals
    if (transaction.type === "withdrawal" && transaction.status === "completed") {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const newBalance = (parseFloat(user.walletBalance) - parseFloat(transaction.amount)).toString();
        await this.updateUser(user.id, { walletBalance: newBalance });
      }
    }
    
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactionsData.get(id);
    if (!transaction) return undefined;
    
    const prevStatus = transaction.status;
    const updatedTransaction = {
      ...transaction,
      ...data,
      updatedAt: new Date()
    };
    
    this.transactionsData.set(id, updatedTransaction);
    
    // Status changed from pending to completed
    if (prevStatus !== 'completed' && updatedTransaction.status === 'completed') {
      // Handle deposits
      if (updatedTransaction.type === "deposit") {
        const user = await this.getUser(updatedTransaction.userId);
        if (user) {
          const newBalance = (parseFloat(user.walletBalance) + parseFloat(updatedTransaction.amount)).toString();
          await this.updateUser(user.id, { walletBalance: newBalance });
        }
      }
      
      // Handle withdrawals
      if (updatedTransaction.type === "withdrawal") {
        const user = await this.getUser(updatedTransaction.userId);
        if (user) {
          const newBalance = (parseFloat(user.walletBalance) - parseFloat(updatedTransaction.amount)).toString();
          await this.updateUser(user.id, { walletBalance: newBalance });
        }
      }
    }
    
    return updatedTransaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsData.values());
  }

  // Referral operations
  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referralsData.get(id);
  }

  async getUserReferralsByLevel(userId: number, level: number): Promise<Referral[]> {
    const referrals: Referral[] = [];
    for (const referral of this.referralsData.values()) {
      if (referral.referrerId === userId && referral.level === level) {
        referrals.push(referral);
      }
    }
    return referrals;
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const id = this.referralIdCounter++;
    const now = new Date();
    
    const referral: Referral = {
      ...referralData,
      id,
      createdAt: now
    };
    
    this.referralsData.set(id, referral);
    return referral;
  }

  async getGenealogyTree(userId: number, maxLevel = 5): Promise<Record<number, User[]>> {
    const result: Record<number, User[]> = {};
    
    // Initialize result with empty arrays for each level
    for (let i = 1; i <= maxLevel; i++) {
      result[i] = [];
    }
    
    // First level referrals (direct)
    const directReferrals = await this.getUserReferrals(userId);
    result[1] = directReferrals;
    
    // Process each level recursively, up to maxLevel
    for (let level = 2; level <= maxLevel; level++) {
      const previousLevelUsers = result[level - 1];
      for (const user of previousLevelUsers) {
        const userReferrals = await this.getUserReferrals(user.id);
        result[level] = [...result[level], ...userReferrals];
      }
    }
    
    return result;
  }

  // Payment Gateway operations
  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    return this.paymentGatewaysData.get(id);
  }

  async getPaymentGatewayByName(name: string): Promise<PaymentGateway | undefined> {
    for (const gateway of this.paymentGatewaysData.values()) {
      if (gateway.name === name) {
        return gateway;
      }
    }
    return undefined;
  }

  async getAllPaymentGateways(activeOnly = false): Promise<PaymentGateway[]> {
    const gateways = Array.from(this.paymentGatewaysData.values());
    if (activeOnly) {
      return gateways.filter(gateway => gateway.isActive);
    }
    return gateways;
  }

  async createPaymentGateway(gatewayData: InsertPaymentGateway): Promise<PaymentGateway> {
    const id = this.gatewayIdCounter++;
    const now = new Date();
    
    const gateway: PaymentGateway = {
      ...gatewayData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.paymentGatewaysData.set(id, gateway);
    return gateway;
  }

  async updatePaymentGateway(id: number, data: Partial<PaymentGateway>): Promise<PaymentGateway | undefined> {
    const gateway = this.paymentGatewaysData.get(id);
    if (!gateway) return undefined;
    
    const updatedGateway = {
      ...gateway,
      ...data,
      updatedAt: new Date()
    };
    
    this.paymentGatewaysData.set(id, updatedGateway);
    return updatedGateway;
  }

  // Dashboard statistics
  async getTotalDeposits(): Promise<number> {
    let total = 0;
    for (const transaction of this.transactionsData.values()) {
      if (transaction.type === "deposit" && transaction.status === "completed") {
        total += parseFloat(transaction.amount);
      }
    }
    return total;
  }

  async getTotalWithdrawals(): Promise<number> {
    let total = 0;
    for (const transaction of this.transactionsData.values()) {
      if (transaction.type === "withdrawal" && transaction.status === "completed") {
        total += parseFloat(transaction.amount);
      }
    }
    return total;
  }

  async getActiveInvestments(): Promise<number> {
    let count = 0;
    for (const investment of this.investmentsData.values()) {
      if (investment.status === "active") {
        count++;
      }
    }
    return count;
  }

  async getTotalInvestments(): Promise<number> {
    let total = 0;
    for (const investment of this.investmentsData.values()) {
      if (investment.status === "active") {
        total += parseFloat(investment.amount.toString());
      }
    }
    return total;
  }

  async getActiveUsers(): Promise<number> {
    let count = 0;
    for (const user of this.usersData.values()) {
      if (user.status === "active") {
        count++;
      }
    }
    return count;
  }
}

export const storage = new MemStorage();
