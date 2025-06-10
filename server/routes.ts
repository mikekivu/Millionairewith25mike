import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  insertContactMessageSchema,
  insertInvestmentSchema,
  insertTransactionSchema,
  insertUserMessageSchema,
  insertNotificationSchema,
} from "@shared/schema";
import express from 'express';
import { nanoid } from 'nanoid';
import { authenticateToken } from './db-compatibility.js';
import { Decimal } from 'decimal.js';

// Utility function for formatting currency
const formatCurrency = (amount: string | number, currency: string = 'USD') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} ${currency}`;
};

// Define session interface
declare module "express-session" {
  interface SessionData {
    userId: number;
    user: any;
  }
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "richlance-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add timeout middleware
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds
    res.setTimeout(30000);
    next();
  });

  // Set up session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  // Auth Middleware
  const authMiddleware = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      req.session.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // Admin Middleware
  const adminMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Add superAdmin flag to the request for routes that need super admin permissions
      if (user.email === "mikepaul620@gmail.com") {
        (req as any).isSuperAdmin = true;
      } else {
        (req as any).isSuperAdmin = false;
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Coinbase Webhook
  app.post("/api/webhook/coinbase", async (req, res) => {
    // In a production environment, verify webhook signature
    const { event } = req.body;

    if (event && event.type === "charge:confirmed") {
      const { data } = event;
      if (data && data.metadata && data.metadata.userId) {
        const userId = parseInt(data.metadata.userId);
        const amount = data.pricing.local.amount;

        // Create transaction
        await storage.createTransaction({
          userId,
          type: "deposit",
          amount,
          currency: "USD",
          status: "completed",
          paymentMethod: "coinbase",
          transactionDetails: `Coinbase deposit: ${data.code}`
        });
      }
    }

    res.status(200).end();
  });

  // Authentication Routes
  const router = express.Router();

  // Auth routes
  router.post('/auth/register', async (req, res) => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone, 
        country, 
        referralCode 
      } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate username and referral code
      const username = `${firstName.toLowerCase()}${Math.random().toString(36).substr(2, 9)}`;
      const userReferralCode = nanoid(8);

      // Find referrer if referral code provided
      let referredBy = undefined;
      if (referralCode) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        country: country || null,
        phoneNumber: phone || null,
        referralCode: userReferralCode,
        referredBy,
        role: "user",
        active: true,
      });

      // Create notification for new user registration (for admins)
      try {
        // Get all admin users
        const allUsers = await storage.getAllUsers();
        const adminUsers = allUsers.filter(u => u.role === 'admin');

        // Create notification for each admin about new registration
        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            title: "New User Registration",
            message: `${firstName} ${lastName} has registered and joined the platform`,
            type: "registration",
            entityId: newUser.id,
            entityType: "user",
            link: "/admin/members"
          });
        }

        // Create welcome notification for new user
        await storage.createNotification({
          userId: newUser.id,
          title: "Welcome to MillionareWith$25!",
          message: "Welcome to our platform! Complete your profile and start exploring investment opportunities.",
          type: "welcome",
          entityId: newUser.id,
          entityType: "user",
          link: "/dashboard"
        });
      } catch (notifError) {
        console.error("Failed to create registration notifications:", notifError);
      }

      // Create referral entries if user was referred
      if (referredBy) {
        try {
          await storage.createReferral({
            referrerId: referredBy,
            referredId: newUser.id,
            level: 1,
            commissionRate: "20",
            commissionAmount: '20',
            status: 'completed'
          });

          // Add $20 bonus to referrer's wallet
          await storage.updateUserWallet(referredBy, '20', 'add');

          await storage.createTransaction({
            userId: referredBy,
            type: 'referral_bonus',
            amount: '20',
            currency: 'USD',
            status: 'completed',
            description: `Referral bonus for inviting ${firstName} ${lastName}`
          });
        } catch (err) {
          console.error("Error creating referral entries:", err);
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1d" });

      // Set user in session
      req.session.userId = newUser.id;

      // Return user without password
      const { password: userPassword, ...userWithoutPassword } = newUser;
      res.status(201).json({ 
        message: "User registered successfully", 
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log(`Login attempt for email: ${email}`);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`User not found for email: ${email}`);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check if user is active
      if (!user.active) {
        console.log(`Inactive user login attempt: ${email}`);
        return res.status(403).json({ message: "Account is deactivated" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Invalid password for user: ${email}`);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

      // Set user in session
      req.session.userId = user.id;

      console.log(`Successful login for user: ${email}, role: ${user.role}`);

      // Return user without password
      const { password: userPassword, ...userWithoutPassword } = user;
      res.status(200).json({ 
        message: "Login successful", 
        user: userWithoutPassword,
        token,
        success: true
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error during login" });
    }
  });

  router.post('/auth/logout', async (req, res) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });

      // Clear session cookies
      res.clearCookie('connect.sid');

      console.log('User logged out successfully');
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password: userPassword, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User dashboard
  router.get('/user/dashboard', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get referral count and earnings
      const referrals = await storage.getUserReferrals(userId);
      const directReferrals = referrals['1'] || [];
      const referralEarnings = directReferrals.length * 20; // $20 per referral

      const stats = await storage.getUserDashboardStats(userId);
      res.status(200).json(stats);

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  });

  // User referrals
  router.get('/user/referrals', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const referrals = await storage.getAllUserReferrals(userId);

      // Group by level - referrals now already include referred user details
      const referralsByLevel = {};
      for (const referral of referrals) {
        if (!referralsByLevel[referral.level]) {
          referralsByLevel[referral.level] = [];
        }
        referralsByLevel[referral.level].push(referral);
      }

      res.status(200).json(referralsByLevel);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User investments
  router.get('/user/investments', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const investments = await storage.getUserInvestments(userId);

      // Enrich with plan details
      const enrichedInvestments = await Promise.all(
        investments.map(async (investment) => {
          const plan = await storage.getPlan(investment.planId);
          return { ...investment, plan };
        })
      );

      res.status(200).json(enrichedInvestments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User transactions
  router.get('/user/transactions', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const transactions = await storage.getUserTransactions(userId);
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Plans
  router.get('/plans', async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Investments
  router.post('/user/investments', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertInvestmentSchema.parse({
        ...req.body,
        userId
      });

      // Check if plan exists and is active
      const plan = await storage.getPlan(validatedData.planId);
      if (!plan || !plan.active) {
        return res.status(400).json({ message: "Invalid or inactive plan" });
      }

      // Check min/max deposit
      const amount = parseFloat(validatedData.amount);
      const minDeposit = parseFloat(plan.minDeposit);
      const maxDeposit = parseFloat(plan.maxDeposit);

      if (amount < minDeposit || amount > maxDeposit) {
        return res.status(400).json({ 
          message: `Investment amount must be between ${minDeposit} and ${maxDeposit} USD` 
        });
      }

      // Minimum investment check
      if (amount < 100) {
        return res.status(400).json({ 
          message: "Minimum investment amount is $100" 
        });
      }

      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`Investment check - User: ${userId}, Current balance: ${user.walletBalance}, Investment amount: ${amount}`);

      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Calculate end date (12 hours for automatic 400% profit)
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 12);

      // Deduct from user's wallet first
      const newBalance = walletBalance - amount;
      console.log(`Deducting from wallet - Old balance: ${walletBalance}, New balance: ${newBalance}`);

      await storage.updateUser(userId, { 
        walletBalance: newBalance.toString() 
      });

      // Verify the update
      const updatedUser = await storage.getUser(userId);
      console.log(`Wallet updated - New balance in DB: ${updatedUser?.walletBalance}`);

      // Create investment
      const investment = await storage.createInvestment({
        ...validatedData,
        endDate,
        status: "active"
      });

      // Create investment transaction record
      await storage.createTransaction({
        userId,
        type: 'investment',
        amount: amount.toString(),
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'wallet',
        transactionDetails: `Investment in ${plan.name} plan`,
        description: `Invested ${amount} USD in ${plan.name}`,
        investmentId: investment.id
      });

      res.status(201).json({ 
        message: "Investment created successfully", 
        investment 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Wallet operations
  router.post('/user/deposits', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;

      // Check if this is a demo user
      const isDemoUser = await storage.isDemoUser(userId);

      // For demo users, auto-complete deposits instantly
      const transactionStatus = isDemoUser ? "completed" : "pending";

      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
        type: "deposit",
        status: transactionStatus,
        paymentMethod: req.body.paymentMethod || "bank_transfer"
      });

      const transaction = await storage.createTransaction(validatedData);

      // If demo user, add money immediately and create notifications
      if (isDemoUser) {
        await storage.updateUserWallet(userId, validatedData.amount, 'add');

        // Create success notification for demo user
        await storage.createNotification({
          userId,
          title: "Deposit Successful",
          message: `Your deposit of ${validatedData.amount} ${validatedData.currency} has been processed successfully. Thank you for choosing our platform!`,
          type: "deposit_completed",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      }

      // Create notifications for deposit
      try {
        // Get user info
        const user = await storage.getUser(userId);

        // Notify user about deposit initiation
        await storage.createNotification({
          userId,
          title: "Deposit Initiated",
          message: `Your deposit of ${validatedData.amount} ${validatedData.currency} has been initiated and is pending confirmation`,
          type: "deposit_pending",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });

        // Notify admins about new deposit
        const allUsers = await storage.getAllUsers();
        const adminUsers = allUsers.filter(u => u.role === 'admin');

        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            title: "New Deposit Request",
            message: `${user?.firstName} ${user?.lastName} has initiated a deposit of ${validatedData.amount} ${validatedData.currency}`,
            type: "deposit_request",
            entityId: transaction.id,
            entityType: "transaction",
            link: "/admin/transactions"
          });
        }
      } catch (notifError) {
        console.error("Failed to create deposit notifications:", notifError);
      }

      res.status(201).json({ 
        message: "Deposit initiated", 
        transaction 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/user/withdrawals', authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { amount, currency, paymentMethod, transactionDetails } = req.body;

      // Validate minimum withdrawal amount
      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount < 10) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $10.00" });
      }

      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance < withdrawAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Check if this is a demo user
      const isDemoUser = await storage.isDemoUser(userId);

      // For demo users, auto-complete withdrawals instantly
      const transactionStatus = isDemoUser ? "completed" : "pending";
      const description = isDemoUser 
        ? `Withdrawal processed successfully`
        : `Withdrawal request - Pending admin approval`;

      // Create withdrawal request
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount,
        currency: currency || "USD",
        status: transactionStatus,
        paymentMethod: paymentMethod || "bank_transfer",
        transactionDetails: transactionDetails || `Withdrawal request for ${amount} ${currency || "USD"}`,
        description
      });

      // If demo user, add success notification (wallet already deducted in createTransaction)
      if (isDemoUser) {
        // Create success notification for demo user
        await storage.createNotification({
          userId,
          title: "Withdrawal Successful",
          message: `Your withdrawal of ${amount} ${currency || "USD"} has been processed successfully. Your funds have been transferred to your account.`,
          type: "withdrawal_approved",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      }

      // Create notification for admin about new withdrawal request
      try {
        // Get all admin users
        const allUsers = await storage.getAllUsers();
        const adminUsers = allUsers.filter(u => u.role === 'admin');

        // Create notification for each admin
        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            title: "New Withdrawal Request",
            message: `User ${user.firstName} ${user.lastName} has requested a withdrawal of ${amount} ${currency || "USD"}`,
            type: "withdrawal_request",
            entityId: transaction.id,
            entityType: "transaction",
            link: "/admin/withdrawals"
          });
        }
      } catch (notifError) {
        console.error("Failed to create admin notification:", notifError);
        // Don't fail the whole request if notification fails
      }

      // Create notification for user about submission
      try {
        await storage.createNotification({
          userId,
          title: "Withdrawal Request Submitted",
          message: `Your withdrawal request for ${amount} ${currency || "USD"} has been submitted for admin approval`,
          type: "withdrawal_submitted",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      } catch (notifError) {
        console.error("Failed to create user notification:", notifError);
      }

      res.status(201).json({ 
        message: "Withdrawal request submitted successfully. You will be notified once it's reviewed by our admin team.", 
        transaction 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // PayPal Routes
  app.get("/api/paypal/client-token", async (req, res) => {
    try {
      res.json({ 
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientToken: process.env.PAYPAL_CLIENT_ID || '' 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get client token" });
    }
  });

  app.post("/api/paypal/create-order", async (req, res) => {
    const { createPaypalOrder } = await import('./paypal');
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/capture-order/:orderID", async (req, res) => {
    const { capturePaypalOrder } = await import('./paypal');
    await capturePaypalOrder(req, res);
  });

  // Pesapal Routes
  app.post("/api/pesapal/create-order", async (req, res) => {
    const { createPesapalOrder } = await import('./pesapal');
    await createPesapalOrder(req, res);
  });

  app.get("/api/pesapal/callback", async (req, res) => {
    const { handlePesapalCallback } = await import('./pesapal');
    await handlePesapalCallback(req, res);
  });

  app.post("/api/pesapal/ipn", async (req, res) => {
    const { handlePesapalIPN } = await import('./pesapal');
    await handlePesapalIPN(req, res);
  });

  app.get("/api/pesapal/transaction-status/:orderTrackingId", async (req, res) => {
    const { getPesapalTransactionStatus } = await import('./pesapal');
    await getPesapalTransactionStatus(req, res);
  });

  // Demo Pesapal payment page simulation
  app.get("/api/pesapal/demo-payment", async (req, res) => {
    const { OrderTrackingId } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).send('Missing OrderTrackingId');
    }

    // Get transaction details to show amount
    let transaction = null;
    try {
      transaction = await storage.getTransactionByReference(OrderTrackingId as string);
    } catch (error) {
      console.error('Error getting transaction:', error);
    }

    const displayAmount = transaction ? `${transaction.currency} ${transaction.amount}` : 'Payment';

    // Simple HTML page that simulates Pesapal payment options
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Pesapal Payment Gateway - Demo</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
            }
            .amount-display {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .amount-text {
                font-size: 24px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 5px;
            }
            .amount-subtitle {
                color: #666;
                font-size: 14px;
            }
            .payment-methods {
                margin: 30px 0;
            }
            .section-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #333;
            }
            .payment-option { 
                border: 2px solid #e9ecef; 
                margin: 12px 0; 
                padding: 18px 20px; 
                cursor: pointer; 
                border-radius: 8px; 
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                background: white;
            }
            .payment-option:hover { 
                background-color: #f8f9fa; 
                border-color: #2c5aa0;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(44, 90, 160, 0.15);
            }
            .payment-icon {
                font-size: 24px;
                margin-right: 15px;
                width: 30px;
            }
            .payment-text {
                font-size: 16px;
                font-weight: 500;
            }
            .processing {
                display: none;
                text-align: center;
                padding: 40px;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #2c5aa0;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .security-note {
                background: #e8f5e8;
                border: 1px solid #c3e6c3;
                border-radius: 6px;
                padding: 15px;
                margin-top: 30px;
                font-size: 14px;
                color: #2d5016;
            }
            .security-icon {
                color: #28a745;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div className="container">
            <div class="header">
                <div class="logo">🏦 Pesapal</div>
                <div class="subtitle">Secure Payment Gateway</div>
            </div>

            <div class="amount-display">
                <div class="amount-text">${displayAmount}</div>
                <div class="amount-subtitle">Amount to Pay</div>
            </div>

            <div class="payment-methods" id="paymentMethods">
                <div class="section-title">Choose Payment Method:</div>

                <div class="payment-option" onclick="processPayment('visa')">
                    <span class="payment-icon">💳</span>
                    <span class="payment-text">Visa Card</span>
                </div>

                <div class="payment-option" onclick="processPayment('mastercard')">
                    <span class="payment-icon">💳</span>
                    <span class="payment-text">Mastercard</span>
                </div>

                <div class="payment-option" onclick="processPayment('mpesa')">
                    <span class="payment-icon">📱</span>
                    <span class="payment-text">M-Pesa</span>
                </div>

                <div class="payment-option" onclick="processPayment('airtel')">
                    <span class="payment-icon">📱</span>
                    <span class="payment-text">Airtel Money</span>
                </div>

                <div class="payment-option" onclick="processPayment('equity')">
                    <span class="payment-icon">🏦</span>
                    <span class="payment-text">Equity Bank</span>
                </div>

                <div class="payment-option" onclick="processPayment('kcb')">
                    <span class="payment-icon">🏦</span>
                    <span class="payment-text">KCB Bank</span>
                </div>
            </div>

            <div class="processing" id="processing">
                <div class="spinner"></div>
                <div>Processing your payment...</div>
                <div style="font-size: 14px; color: #666; margin-top: 10px;">Please wait while we redirect you.</div>
            </div>

            <div class="security-note">
                <span class="security-icon">🔒</span>
                Your payment is secured with 256-bit SSL encryption
            </div>
        </div>

        <script>
            function processPayment(method) {
                // Hide payment methods and show processing
                document.getElementById('paymentMethods').style.display = 'none';
                document.getElementById('processing').style.display = 'block';

                // Simulate payment processing time (2-4 seconds)
                const processingTime = Math.random() * 2000 + 2000;

                setTimeout(() => {
                    // Redirect back to callback with success
                    window.location.href = '/api/pesapal/callback?OrderTrackingId=${OrderTrackingId}&demo=true&method=' + method + '&status=completed';
                }, processingTime);
            }
        </script>
    </body>
    </html>
    `;

    res.send(html);
  });

  // Mount the API router
  app.use('/api', router);

  // Public Routes

  // Heartbeat Route
  app.post("/api/heartbeat", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Contact Route
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(validatedData);
      res.status(201).json({ 
        message: "Message sent successfully", 
        id: contactMessage.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User Messages Routes
  app.get("/api/user/messages/sent", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getUserSentMessages(userId);
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/messages/received", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getUserReceivedMessages(userId);
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/messages/:id", authMiddleware, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getUserMessage(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user is authorized to view this message
      const userId = req.session.userId;
      if (message.senderId !== userId && message.recipientId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this message" });
      }

      // If user is the recipient, mark as read
      if (message.recipientId === userId && !message.read) {
        await storage.markUserMessageAsRead(messageId);
      }

      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/user/messages", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertUserMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      // Check if recipient exists
      const recipient = await storage.getUser(validatedData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      const message = await storage.createUserMessage(validatedData);
      res.status(201).json({ 
        message: "Message sent successfully", 
        id: message.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/user/messages/:id/reply", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messageId = parseInt(req.params.id);
      const originalMessage = await storage.getUserMessage(messageId);

      if (!originalMessage) {
        return res.status(404).json({ message: "Original message not found" });
      }

      // Verify user is recipient of original message
      if (originalMessage.recipientId !== userId) {
        return res.status(403).json({ message: "Unauthorized to reply to this message" });
      }

      // Create reply message
      const validatedData = insertUserMessageSchema.parse({
        senderId: userId,
        recipientId: originalMessage.senderId,
        subject: `Re: ${originalMessage.subject}`,
        content: req.body.content,
      });

      const replyMessage = await storage.createUserMessage(validatedData);

      // Mark original message as replied
      await storage.markUserMessageAsReplied(messageId);

      res.status(201).json({ 
        message: "Reply sent successfully", 
        id: replyMessage.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User Notifications Routes
  app.get("/api/user/notifications", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifications = await storage.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/notifications/unread", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifications = await storage.getUnreadUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/user/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);

      // Check if notification table exists
      try {
        const notification = await storage.getNotification(notificationId);

        if (!notification) {
          return res.status(200).json({ id: notificationId, status: "read" });
        }

        // Verify user is owner of notification
        const userId = req.session.userId;
        if (notification.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized to mark this notification" });
        }

        const updatedNotification = await storage.markNotificationAsRead(notificationId);
        res.status(200).json(updatedNotification);
      } catch (dbError) {
        // If there's a database error (like missing table), just return success
        // This is a temporary solution until the notifications table is created
        console.log("Database error in notifications, using client-side state:", dbError.message);
        return res.status(200).json({ id: notificationId, status: "read" });
      }
    } catch (error) {
      console.error("Unexpected error in notification route:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, profileImage, country, phoneNumber } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        profileImage,
        country,
        phoneNumber
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ 
        message: "Profile updated successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/user/password", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await storage.updateUser(userId, { password: hashedPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payment-settings", async (req, res) => {
    try {
      const paymentSettings = await storage.getAllPaymentSettings();
      const activePaymentMethods = paymentSettings
        .filter(setting => setting.active)
        .map(setting => ({
          id: setting.id,
          method: setting.method,
          name: setting.name,
          instructions: setting.instructions,
          credentials: setting.credentials,
          minAmount: setting.minAmount,
          maxAmount: setting.maxAmount,
          active: setting.active
        }));

      res.status(200).json(activePaymentMethods);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Routes
  app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin withdrawal routes
  app.post("/api/admin/withdraw", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { amount, currency, method, destination, notes } = req.body;
      const adminId = req.session.userId;

      // Validate input
      if (!amount || !method || !destination) {
        return res.status(400).json({ message: "Missing required fields: amount, method, and destination are required" });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
      }

      // Get dashboard stats to check available balance
      const stats = await storage.getDashboardStats();
      const availableBalance = parseFloat(stats.totalDeposits) - parseFloat(stats.totalWithdrawals || '0');

      if (withdrawAmount > availableBalance) {
        return res.status(400).json({ 
          message: "Insufficient funds. Amount exceeds available balance." 
        });
      }

      // Create admin withdrawal transaction
      const withdrawal = await storage.createTransaction({
        userId: adminId,
        type: "admin_withdrawal",
        amount: amount.toString(),
        currency: currency || "USD",
        status: "completed", // Admin withdrawals are auto-approved
        paymentMethod: method,
        transactionDetails: `Admin withdrawal to ${method}: ${destination}`,
        description: notes || `Admin withdrawal via ${method}`
      });

      res.status(201).json({
        message: "Withdrawal created successfully",
        withdrawal
      });
    } catch (error) {
      console.error("Admin withdrawal error:", error);
      res.status(500).json({ message: "Server error during withdrawal" });
    }
  });

  app.get("/api/admin/withdrawals-history", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const adminId = req.session.userId;

      // Get admin withdrawal transactions
      const allTransactions = await storage.getUserTransactions(adminId);
      const adminWithdrawals = allTransactions
        .filter(tx => tx.type === "admin_withdrawal")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.status(200).json(adminWithdrawals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/users/:id/toggle-status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { active } = req.body;

      if (typeof active !== "boolean") {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }

      const updatedUser = await storage.toggleUserStatus(userId, active);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ 
        message: `User ${active ? 'activated' : 'deactivated'} successfully`, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/plans", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/plans", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const plan = await storage.createPlan(req.body);
      res.status(201).json({ 
        message: "Plan created successfully", 
        plan 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const updatedPlan = await storage.updatePlan(planId, req.body);

      if (!updatedPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.status(200).json({ 
        message: "Plan updated successfully", 
        plan: updatedPlan 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/plans/:id/toggle-status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const { active } = req.body;

      if (typeof active !== "boolean") {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }

      const updatedPlan = await storage.togglePlanStatus(planId, active);

      if (!updatedPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.status(200).json({ 
        message: `Plan ${active ? 'activated' : 'deactivated'} successfully`, 
        plan: updatedPlan 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const deleted = await storage.deletePlan(planId);

      if (!deleted) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/transactions", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/transactions/:type", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const type = req.params.type;
      const transactions = await storage.getTransactionsByType(type);
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin manual profit processing (for testing)
  app.post("/api/admin/process-profits", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { profitProcessor } = await import('./profit-processor');

      // Manually trigger profit processing
      await (profitProcessor as any).processCompletedInvestments();

      res.status(200).json({
        message: "Manual profit processing completed successfully"
      });
    } catch (error) {
      console.error("Error in manual profit processing:", error);
      res.status(500).json({ message: "Server error during profit processing" });
    }
  });

  // Admin withdrawal management routes
  app.get("/api/admin/withdrawals", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { status } = req.query;
      let withdrawals = await storage.getTransactionsByType("withdrawal");

      if (status && status !== 'all') {
        withdrawals = withdrawals.filter(w => w.status === status);
      }

      // Enrich with user information
      const enrichedWithdrawals = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const user = await storage.getUser(withdrawal.userId);
          return {
            ...withdrawal,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              username: user.username
            } : null
          };
        })
      );

      // Sort by created date, most recent first
      enrichedWithdrawals.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.status(200).json(enrichedWithdrawals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/withdrawals/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (!["completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'completed' or 'failed'" });
      }

      // Get the withdrawal transaction
      const withdrawal = await storage.getTransaction(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      if (withdrawal.type !== "withdrawal") {
        return res.status(400).json({ message: "Transaction is not a withdrawal" });
      }

      if (withdrawal.status !== "pending") {
        return res.status(400).json({ message: "Withdrawal has already been processed" });
      }

      // If approving withdrawal, deduct from user's wallet
      if (status === "completed") {
        const user = await storage.getUser(withdrawal.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const walletBalance = parseFloat(user.walletBalance);
        const withdrawAmount = parseFloat(withdrawal.amount);

        if (walletBalance < withdrawAmount) {
          return res.status(400).json({ 
            message: "User no longer has sufficient balance for this withdrawal" 
          });
        }

        // Deduct from wallet
        const newBalance = walletBalance - withdrawAmount;
        await storage.updateUser(withdrawal.userId, { 
          walletBalance: newBalance.toString() 
        });

        // Notify user of approval
        await storage.createNotification({
          userId: withdrawal.userId,
          title: "Withdrawal Approved",
          message: `Your withdrawal request for ${withdrawal.amount} ${withdrawal.currency} has been approved and processed`,
          type: "withdrawal_approved",
          entityId: withdrawal.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      } else {
        // Notify user of rejection
        await storage.createNotification({
          userId: withdrawal.userId,
          title: "Withdrawal Rejected",
          message: `Your withdrawal request for ${withdrawal.amount} ${withdrawal.currency} has been rejected${notes ? `: ${notes}` : ''}`,
          type: "withdrawal_rejected",
          entityId: withdrawal.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      }

      // Update transaction
      const updatedWithdrawal = await storage.updateTransaction(withdrawalId, {
        status,
        description: notes || withdrawal.description
      });

      res.status(200).json({
        message: `Withdrawal ${status === 'completed' ? 'approved' : 'rejected'} successfully`,
        withdrawal: updatedWithdrawal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/transactions/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status } = req.body;

      if (!["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid transaction status" });
      }

      // Get the transaction first
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // If it's a withdrawal being approved, handle the wallet deduction
      if (transaction.type === "withdrawal" && status === "completed" && transaction.status === "pending") {
        const user = await storage.getUser(transaction.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const walletBalance = parseFloat(user.walletBalance);
        const withdrawAmount = parseFloat(transaction.amount);

        // Check if user still has sufficient balance
        if (walletBalance < withdrawAmount) {
          return res.status(400).json({ 
            message: "User no longer has sufficient balance for this withdrawal" 
          });
        }

        // Deduct from user's wallet
        const newBalance = walletBalance - withdrawAmount;
        await storage.updateUser(transaction.userId, { 
          walletBalance: newBalance.toString() 
        });

        // Create notification for user about approval
        await storage.createNotification({
          userId: transaction.userId,
          title: "Withdrawal Approved",
          message: `Your withdrawal request for ${transaction.amount} ${transaction.currency} has been approved and processed`,
          type: "withdrawal_approved",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      } else if (transaction.type === "withdrawal" && status === "failed" && transaction.status === "pending") {
        // Create notification for user about rejection
        await storage.createNotification({
          userId: transaction.userId,
          title: "Withdrawal Rejected",
          message: `Your withdrawal request for ${transaction.amount} ${transaction.currency} has been rejected`,
          type: "withdrawal_rejected",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/transactions"
        });
      }

      const updatedTransaction = await storage.updateTransaction(transactionId, { status });

      // Create notifications for transaction status updates
      try {
        const user = await storage.getUser(transaction.userId);

        if (transaction.type === "deposit" && status === "completed") {
          // Notify user about successful deposit
          await storage.createNotification({
            userId: transaction.userId,
            title: "Deposit Completed",
            message: `Your deposit of ${transaction.amount} ${transaction.currency} has been successfully processed and added to your wallet`,
            type: "deposit_completed",
            entityId: transaction.id,
            entityType: "transaction",
            link: "/dashboard/transactions"
          });
        } else if (transaction.type === "deposit" && status === "failed") {
          // Notify user about failed deposit
          await storage.createNotification({
            userId: transaction.userId,
            title: "Deposit Failed",
            message: `Your deposit of ${transaction.amount} ${transaction.currency} could not be processed. Please contact support if you believe this is an error.`,
            type: "deposit_failed",
            entityId: transaction.id,
            entityType: "transaction",
            link: "/dashboard/transactions"
          });
        }
      } catch (notifError) {
        console.error("Failed to create transaction update notifications:", notifError);
      }

      res.status(200).json({ 
        message: "Transaction status updated successfully", 
        transaction: updatedTransaction 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/payment-settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const paymentSettings = await storage.getAllPaymentSettings();
      res.status(200).json(paymentSettings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/payment-settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { method, name, instructions, credentials, minAmount, maxAmount, active } = req.body;

      // Validation
      if (!method || !name) {
        return res.status(400).json({ message: "Method and name are required" });
      }

      const newSetting = await storage.createPaymentSetting({
        method,
        name,
        instructions,
        credentials,
        minAmount: minAmount || "10",
        maxAmount: maxAmount || "10000",
        active: active !== undefined ? active : true,
        // Also set the payment_method field to the same value as method to satisfy the NOT NULL constraint
        payment_method: method
      });

      res.status(201).json({
        message: "Payment setting created successfully",
        setting: newSetting
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

    app.put("/api/admin/payment-settings/:id", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const settingId = parseInt(req.params.id);
        // If the method is being updated, make sure payment_method is also updated
        const updatedData = { ...req.body };
        if (updatedData.method) {
          updatedData.payment_method = updatedData.method;
        }

        const updatedSetting = await storage.updatePaymentSetting(settingId, updatedData);

        if (!updatedSetting) {
          return res.status(404).json({ message: "Payment setting not found" });
        }

        res.status(200).json({ 
          message: "Payment setting updated successfully", 
          setting: updatedSetting 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.put("/api/admin/payment-settings/:id/toggle-status", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const settingId = parseInt(req.params.id);
        const { active } = req.body;

        if (typeof active !== "boolean") {
          return res.status(400).json({ message: "Active status must be a boolean" });
        }

        const updatedSetting = await storage.togglePaymentMethod(settingId, active);

        if (!updatedSetting) {
          return res.status(404).json({ message: "Payment setting not found" });
        }

        res.status(200).json({ 
          message: `Payment method ${active ? 'activated' : 'deactivated'} successfully`, 
          setting: updatedSetting 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/admin/payment-settings/:id", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const settingId = parseInt(req.params.id);

        // In a production environment, you might want to check if this payment method
        // is being used in transactions before deleting it

        // For now we'll just check if the setting exists
        const setting = await storage.getPaymentSetting(settingId);
        if (!setting) {
          return res.status(404).json({ message: "Payment setting not found" });
        }

        // Delete the setting (this would need to be implemented in the storage interface)
        // For now, we'll just deactivate it since we don't have a delete method in the interface
        const updatedSetting = await storage.togglePaymentMethod(settingId, false);

        res.status(200).json({
          message: "Payment method deleted successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Admin wallet balance management
    app.put("/api/admin/users/:id/wallet", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { amount, action, notes } = req.body;

        // Validate input
        if (!amount || !action || !["set", "add", "subtract"].includes(action)) {
          return res.status(400).json({ message: "Invalid amount or action. Action must be 'set', 'add', or 'subtract'" });
        }

        const walletAmount = parseFloat(amount);
        if (walletAmount < 0) {
          return res.status(400).json({ message: "Amount must be positive" });
        }

        // Get the user
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const currentBalance = parseFloat(user.walletBalance);
        let newBalance: number;

        switch (action) {
          case "set":
            newBalance = walletAmount;
            break;
          case "add":
            newBalance = currentBalance + walletAmount;
            break;
          case "subtract":
            newBalance = Math.max(0, currentBalance - walletAmount); // Don't allow negative balance
            break;
          default:
            return res.status(400).json({ message: "Invalid action" });
        }

        // Update user wallet balance
        const updatedUser = await storage.updateUser(userId, { 
          walletBalance: newBalance.toString() 
        });

        // Create a transaction record for audit trail
        await storage.createTransaction({
          userId,
          type: "admin_adjustment",
          amount: amount.toString(),
          currency: "USD",
          status: "completed",
          paymentMethod: "admin",
          transactionDetails: `Admin wallet adjustment: ${action} ${amount} USD`,
          description: notes || `Admin ${action} wallet balance by ${amount} USD`
        });

        // Create notification for user
        await storage.createNotification({
          userId,
          title: "Wallet Balance Updated",
          message: `Your wallet balance has been ${action === 'set' ? 'set to' : action === 'add' ? 'increased by' : 'decreased by'} ${formatCurrency(amount, 'USD')} by an administrator`,
          type: "wallet_adjustment",
          entityId: userId,
          entityType: "user",
          link: "/dashboard/wallet"
        });

        res.status(200).json({
          message: "Wallet balance updated successfully",
          user: {
            id: updatedUser?.id,
            username: updatedUser?.username,
            firstName: updatedUser?.firstName,
            lastName: updatedUser?.lastName,
            walletBalance: updatedUser?.walletBalance
          },
          previousBalance: currentBalance.toString(),
          newBalance: newBalance.toString(),
          action,
          amount: amount.toString()
        });
      } catch (error) {
        console.error("Error updating wallet balance:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // PayPal API Configuration
    app.get("/api/admin/payment-settings/paypal-config", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        // Check if PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables are set
        const configured = !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
        const hasLiveCredentials = process.env.PAYPAL_CLIENT_ID && 
          process.env.PAYPAL_CLIENT_SECRET && 
          !process.env.PAYPAL_CLIENT_ID.includes('sandbox');
        const environment = hasLiveCredentials ? 'live' : 'sandbox';

        res.status(200).json({
          configured,
          environment,
          clientId: process.env.PAYPAL_CLIENT_ID || '',
          // Don't send back the actual secret, just indicate if it's set
          clientSecret: process.env.PAYPAL_CLIENT_SECRET ? '••••••••••••••••' : '',
          status: configured ? 'success' : 'idle',
          message: configured ? 'PayPal API is configured' : 'PayPal API is not configured'
        });
      } catch (error) {
        console.error('Error getting PayPal config:', error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/payment-settings/paypal-config", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const { clientId, clientSecret } = req.body;

        if (!clientId) {
          return res.status(400).json({ message: "Client ID is required" });
        }

        // If clientSecret is not provided and we already have one in env, keep using the existing one
        const newClientSecret = clientSecret || process.env.PAYPAL_CLIENT_SECRET;

        if (!newClientSecret) {
          return res.status(400).json({ message: "Client Secret is required" });
        }

        // In a real-world scenario, we'd save these to a secure environment variable store
        // For Replit, we're just updating the environment variables in memory
        process.env.PAYPAL_CLIENT_ID = clientId;
        process.env.PAYPAL_CLIENT_SECRET = newClientSecret;

        res.status(200).json({ 
          message: "PayPal API configuration saved successfully",
          configured: true,
          status: 'success'
        });
      } catch (error) {
        console.error('Error saving PayPal config:', error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Pesapal API Configuration
    app.get("/api/admin/payment-settings/pesapal-config", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        // Check if PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET environment variables are set
        const configured = !!(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET);

        res.status(200).json({
          configured,
          consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
          // Don't send back the actual secret, just indicate if it's set
          consumerSecret: process.env.PESAPAL_CONSUMER_SECRET ? '••••••••••••••••' : '',
          sandbox: process.env.NODE_ENV !== 'production',
          status: configured ? 'success' : 'idle',
          message: configured ? 'Pesapal API is configured' : 'Pesapal API is not configured'
        });
      } catch (error) {
        console.error('Error getting Pesapal config:', error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/payment-settings/pesapal-config", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const { consumerKey, consumerSecret } = req.body;

        if (!consumerKey) {
          return res.status(400).json({ message: "Consumer Key is required" });
        }

        // If consumerSecret is not provided and we already have one in env, keep using the existing one
        const newConsumerSecret = consumerSecret || process.env.PESAPAL_CONSUMER_SECRET;

        if (!newConsumerSecret) {
          return res.status(400).json({ message: "Consumer Secret is required" });
        }

        // Update environment variables in memory
        process.env.PESAPAL_CONSUMER_KEY = consumerKey;
        process.env.PESAPAL_CONSUMER_SECRET = newConsumerSecret;

        res.status(200).json({ 
          message: "Pesapal API configuration saved successfully",
          configured: true,
          status: 'success'
        });
      } catch (error) {
        console.error('Error saving Pesapal config:', error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // System settings endpoints
  app.get("/api/admin/system-settings", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put("/api/admin/system-settings/:key", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      // Special handling for payment_mode to update environment accordingly
      if (key === 'payment_mode') {
        console.log(`Admin switching payment mode to: ${value}`);
        
        // Log the change for audit purposes
        const adminId = req.session.userId;
        const admin = await storage.getUser(adminId);
        console.log(`Payment mode changed to ${value} by admin: ${admin?.email}`);
        
        // You could also create a transaction record for audit trail
        try {
          await storage.createTransaction({
            userId: adminId,
            type: "admin_action",
            amount: "0",
            currency: "USD",
            status: "completed",
            paymentMethod: "admin",
            transactionDetails: `Payment mode switched to ${value}`,
            description: `Admin ${admin?.email} switched payment mode to ${value.toUpperCase()}`
          });
        } catch (auditError) {
          console.error("Failed to create audit trail:", auditError);
        }
      }

      const setting = await storage.setSystemSetting(key, value, description);
      res.json({ message: "System setting updated successfully", setting });
    } catch (error) {
      console.error('Error updating system setting:', error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Admin contact messages endpoints
  app.get("/api/admin/contact-messages", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const messages = await storage.getAllContactMessages();
        res.status(200).json(messages);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.put("/api/admin/contact-messages/:id/mark-responded", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const messageId = parseInt(req.params.id);
        const updatedMessage = await storage.markMessageAsResponded(messageId);

        if (!updatedMessage) {
          return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ 
          message: "Message marked as responded", 
          contactMessage: updatedMessage 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Admin User Messages Routes
    app.get("/api/admin/user-messages", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        // Get all users to enrich the messages with user info
        const users = await storage.getAllUsers();
        const userMap = new Map();
        users.forEach(user => {
          userMap.set(user.id, {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          });
        });

        // Get all messages (getting all sent messages will capture all messages in the system)
        let allMessages = [];
        for (const user of users) {
          const sentMessages = await storage.getUserSentMessages(user.id);
          allMessages = [...allMessages, ...sentMessages];
        }

        // Sort by date, most recent first
        allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Enrich with user info
        const enrichedMessages = allMessages.map(msg => ({
          ...msg,
          sender: userMap.get(msg.senderId),
          recipient: userMap.get(msg.recipientId)
        }));

        res.status(200).json(enrichedMessages);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/admin/user-messages/:id", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const messageId = parseInt(req.params.id);
        const message = await storage.getUserMessage(messageId);

        if (!message) {
          return res.status(404).json({ message: "Message not found" });
        }

        // Get sender and recipient info
        const sender = await storage.getUser(message.senderId);
        const recipient = await storage.getUser(message.recipientId);

        // Remove sensitive data
        const { password: senderPass, ...senderInfo } = sender;
        const { password: recipientPass, ...recipientInfo } = recipient;

        // Enrich the message
        const enrichedMessage = {
          ...message,
          sender: senderInfo,
          recipient: recipientInfo
        };

        res.status(200).json(enrichedMessage);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/messages", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const adminId = req.session.userId;
        const { recipientId, subject, content } = req.body;

        // Validate input
        if (!recipientId || !subject || !content) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if recipient exists
        const recipient = await storage.getUser(recipientId);
        if (!recipient) {
          return res.status(404).json({ message: "Recipient not found" });
        }

        // Create message
        const message = await storage.createUserMessage({
          senderId: adminId,
          recipientId,
          subject,
          content
        });

        res.status(201).json({
          message: "Message sent successfully",
          id: message.id
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Admin Notifications Routes
    app.get("/api/admin/notifications", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const notifications = await storage.getUserNotifications(userId);
        res.status(200).json(notifications);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/notifications", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const { userId, title, message, type, link } = req.body;

        // Validate input
        if (!userId || !title || !message || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Create notification
        const notification = await storage.createNotification({
          userId,
          title,
          message,
          type,
          link: link || null,
          entityId: null,
          entityType: null
        });

        res.status(201).json({
          message: "Notification created successfully",
          notification
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/notifications/:id/read", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const notificationId = parseInt(req.params.id);

        // Check if notification table exists
        try {
          const notification = await storage.getNotification(notificationId);

          if (!notification) {
            return res.status(200).json({ id: notificationId, status: "read" });
          }

          // Verify user is owner of notification
          const userId = req.session.userId;
          if (notification.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to mark this notification" });
          }

          const updatedNotification = await storage.markNotificationAsRead(notificationId);
          res.status(200).json(updatedNotification);
        } catch (dbError) {
          // If there's a database error (like missing table), just return success
          // This is a temporary solution until the notifications table is created
          console.log("Database error in admin notifications, using client-side state:", dbError.message);
          return res.status(200).json({ id: notificationId, status: "read" });
        }
      } catch (error) {
        console.error("Unexpected error in admin notification route:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/admin/notifications/broadcast", authMiddleware, adminMiddleware, async (req, res) => {
      try {
        const { title, message, type, link, userRole } = req.body;

        // Validate input
        if (!title || !message || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Get users (filtered by role if specified)
        let users = await storage.getAllUsers();
        if (userRole) {
          users = users.filter(user => user.role === userRole);
        }

        // Create notification for each user
        const promises = users.map(user => storage.createNotification({
          userId: user.id,
          title,
          message,
          type,
          link: link || null,
          entityId: null,
          entityType: null
        }));

        await Promise.all(promises);

        res.status(201).json({
          message: `Notification broadcast to ${users.length} users successfully`
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    });


    const httpServer = createServer(app);

    return httpServer;
  }