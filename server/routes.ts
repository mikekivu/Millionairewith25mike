import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertInvestmentSchema, 
  insertTransactionSchema,
  insertInvestmentPlanSchema,
  insertPaymentGatewaySchema
} from "@shared/schema";
import crypto from "crypto";
import { nanoid } from "nanoid";
import session from "express-session";
import MemoryStore from "memorystore";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { createCoinbaseCharge, checkCoinbaseCharge } from "./coinbase";

// Session middleware
const setupSession = (app: Express) => {
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'richlance-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
};

// Auth middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user && user.role === 'admin') {
      return next();
    }
  }
  res.status(403).json({ message: 'Forbidden' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  setupSession(app);

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }
      
      // Set user in session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const registerSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
        referralCode: z.string().optional()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
      
      const validatedData = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      
      // Handle referral if code provided
      let referrerId: number | undefined = undefined;
      if (validatedData.referralCode) {
        const referrer = await storage.getUserByReferralCode(validatedData.referralCode);
        if (referrer) {
          referrerId = referrer.id;
        }
      }
      
      // Hash password
      const hashedPassword = crypto.createHash('sha256').update(validatedData.password).digest('hex');
      
      // Create user
      const newUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'user',
        referralCode: nanoid(10),
        referrerId
      });
      
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        referralCode: newUser.referralCode
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
        status: user.status
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Investment Plans
  app.get('/api/investment-plans', async (req, res) => {
    try {
      const plans = await storage.getAllInvestmentPlans(true);
      res.json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/investment-plans/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }
      
      const plan = await storage.getInvestmentPlan(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User investments
  app.get('/api/user/investments', isAuthenticated, async (req, res) => {
    try {
      const investments = await storage.getUserInvestments(req.session.userId!);
      
      // Enrich with plan details
      const enrichedInvestments = await Promise.all(investments.map(async (investment) => {
        const plan = await storage.getInvestmentPlan(investment.planId);
        return {
          ...investment,
          plan: plan ? {
            name: plan.name,
            monthlyReturn: plan.monthlyReturn
          } : null
        };
      }));
      
      res.json(enrichedInvestments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/user/investments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      
      // Check if plan exists
      const plan = await storage.getInvestmentPlan(validatedData.planId);
      if (!plan || plan.status !== 'active') {
        return res.status(404).json({ message: 'Investment plan not found or inactive' });
      }
      
      // Check minimum investment
      if (parseFloat(validatedData.amount.toString()) < parseFloat(plan.minInvestment.toString())) {
        return res.status(400).json({ 
          message: `Minimum investment for this plan is ${plan.minInvestment} USDT` 
        });
      }
      
      // Check if user has enough balance
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (parseFloat(user.walletBalance) < parseFloat(validatedData.amount.toString())) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      
      // Calculate end date based on term months
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.termMonths);
      
      // Create investment
      const investment = await storage.createInvestment({
        userId: req.session.userId!,
        planId: validatedData.planId,
        amount: validatedData.amount,
        status: 'active',
        startDate,
        endDate
      });
      
      res.status(201).json(investment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User transactions
  app.get('/api/user/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.session.userId!);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Wallet operations
  app.post('/api/user/wallet/deposit', isAuthenticated, async (req, res) => {
    try {
      const depositSchema = z.object({
        amount: z.string().regex(/^\d+(\.\d+)?$/),
        paymentMethod: z.enum(['paypal', 'coinbase'])
      });
      
      const { amount, paymentMethod } = depositSchema.parse(req.body);
      
      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId: req.session.userId!,
        type: 'deposit',
        amount,
        status: 'pending',
        description: `Deposit via ${paymentMethod}`,
        paymentMethod
      });
      
      res.status(201).json({
        transaction,
        redirectUrl: `/api/payment/${paymentMethod}/checkout?transactionId=${transaction.id}`
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/user/wallet/withdraw', isAuthenticated, async (req, res) => {
    try {
      const withdrawSchema = z.object({
        amount: z.string().regex(/^\d+(\.\d+)?$/),
        paymentMethod: z.enum(['paypal', 'coinbase']),
        walletAddress: z.string().optional()
      });
      
      const { amount, paymentMethod, walletAddress } = withdrawSchema.parse(req.body);
      
      // Check if user has enough balance
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (parseFloat(user.walletBalance) < parseFloat(amount)) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      
      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId: req.session.userId!,
        type: 'withdrawal',
        amount,
        status: 'pending', // Pending admin approval
        description: `Withdrawal via ${paymentMethod}`,
        paymentMethod,
        referenceId: walletAddress
      });
      
      res.status(201).json({
        transaction,
        message: 'Withdrawal request submitted successfully and pending approval'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Genealogy tree
  app.get('/api/user/genealogy', isAuthenticated, async (req, res) => {
    try {
      const genealogyTree = await storage.getGenealogyTree(req.session.userId!);
      res.json(genealogyTree);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User profile
  app.get('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Check if email already exists
      if (validatedData.email) {
        const existingEmail = await storage.getUserByEmail(validatedData.email);
        if (existingEmail && existingEmail.id !== req.session.userId) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      const updatedUser = await storage.updateUser(req.session.userId!, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        referralCode: updatedUser.referralCode
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/user/change-password', isAuthenticated, async (req, res) => {
    try {
      const passwordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
        confirmPassword: z.string()
      }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
      
      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
      if (user.password !== hashedCurrentPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
      await storage.updateUser(user.id, { password: hashedNewPassword });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard statistics
  app.get('/api/user/dashboard', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const investments = await storage.getUserInvestments(user.id);
      const transactions = await storage.getUserTransactions(user.id);
      const referrals = await storage.getUserReferrals(user.id);
      
      const totalInvested = investments.reduce((sum, inv) => 
        sum + parseFloat(inv.amount.toString()), 0);
      
      const activeInvestments = investments.filter(inv => inv.status === 'active');
      
      const referralEarnings = transactions
        .filter(t => t.type === 'referral' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalEarnings = transactions
        .filter(t => (t.type === 'earnings' || t.type === 'referral') && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      res.json({
        walletBalance: user.walletBalance,
        totalInvested,
        activeInvestments: activeInvestments.length,
        totalEarnings,
        referralEarnings,
        referrals: referrals.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin routes
  app.get('/api/admin/dashboard', isAdmin, async (req, res) => {
    try {
      const totalDeposits = await storage.getTotalDeposits();
      const totalWithdrawals = await storage.getTotalWithdrawals();
      const activeInvestments = await storage.getActiveInvestments();
      const totalInvestments = await storage.getTotalInvestments();
      const activeUsers = await storage.getActiveUsers();
      
      res.json({
        totalDeposits,
        totalWithdrawals,
        activeInvestments,
        totalInvestments,
        activeUsers,
        pendingWithdrawals: (await storage.getAllTransactions())
          .filter(t => t.type === 'withdrawal' && t.status === 'pending').length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Omit sensitive information
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
        status: user.status,
        createdAt: user.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const updateSchema = z.object({
        status: z.enum(['active', 'inactive']).optional(),
        role: z.enum(['user', 'admin']).optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const updatedUser = await storage.updateUser(id, validatedData);
      
      res.json({
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        status: updatedUser!.status,
        role: updatedUser!.role
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/transactions', isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      
      // Enrich with user info
      const enrichedTransactions = await Promise.all(transactions.map(async (transaction) => {
        const user = await storage.getUser(transaction.userId);
        return {
          ...transaction,
          user: user ? {
            username: user.username,
            email: user.email
          } : null
        };
      }));
      
      res.json(enrichedTransactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/admin/transactions/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transaction ID' });
      }
      
      const updateSchema = z.object({
        status: z.enum(['pending', 'completed', 'rejected'])
      });
      
      const { status } = updateSchema.parse(req.body);
      
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const updatedTransaction = await storage.updateTransaction(id, { status });
      
      res.json(updatedTransaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/investment-plans', isAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllInvestmentPlans();
      res.json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/investment-plans', isAdmin, async (req, res) => {
    try {
      const validatedData = insertInvestmentPlanSchema.parse(req.body);
      const plan = await storage.createInvestmentPlan(validatedData);
      res.status(201).json(plan);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/admin/investment-plans/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }
      
      const updateSchema = insertInvestmentPlanSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const plan = await storage.getInvestmentPlan(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      const updatedPlan = await storage.updateInvestmentPlan(id, validatedData);
      
      res.json(updatedPlan);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/payment-gateways', isAdmin, async (req, res) => {
    try {
      const gateways = await storage.getAllPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/admin/payment-gateways/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid gateway ID' });
      }
      
      const updateSchema = insertPaymentGatewaySchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const gateway = await storage.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ message: 'Gateway not found' });
      }
      
      const updatedGateway = await storage.updatePaymentGateway(id, validatedData);
      
      res.json(updatedGateway);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Payment gateway integrations
  // PayPal routes
  app.get("/api/payment/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/payment/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/payment/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Coinbase routes
  app.post("/api/payment/coinbase/create-charge", isAuthenticated, async (req, res) => {
    try {
      const { amount, transactionId } = req.body;
      
      if (!amount || !transactionId) {
        return res.status(400).json({ message: 'Amount and transactionId are required' });
      }
      
      const transaction = await storage.getTransaction(parseInt(transactionId));
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const charge = await createCoinbaseCharge(amount, transactionId.toString());
      res.json(charge);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create Coinbase charge' });
    }
  });

  app.get("/api/payment/coinbase/check-charge/:chargeId", isAuthenticated, async (req, res) => {
    try {
      const { chargeId } = req.params;
      const result = await checkCoinbaseCharge(chargeId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to check Coinbase charge' });
    }
  });

  // Misc routes
  app.get('/api/contact', async (req, res) => {
    res.json({
      email: 'support@richlance.com',
      phone: '+1 (555) 123-4567',
      address: '123 Investment Avenue, Financial District, New York, NY 10004',
      social: {
        facebook: 'https://facebook.com/richlance',
        twitter: 'https://twitter.com/richlance',
        instagram: 'https://instagram.com/richlance',
        linkedin: 'https://linkedin.com/company/richlance'
      }
    });
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(10)
      });
      
      const validatedData = contactSchema.parse(req.body);
      
      // Just acknowledge receipt in mock version
      res.json({ 
        message: 'Thank you for contacting us! We will get back to you shortly.',
        submitted: validatedData
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
