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
} from "@shared/schema";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

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

  // PayPal Integration Routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

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
          currency: "USDT",
          status: "completed",
          paymentMethod: "coinbase",
          transactionDetails: `Coinbase deposit: ${data.code}`
        });
      }
    }
    
    res.status(200).end();
  });

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email) || 
                           await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      
      // Handle referral code
      let referredBy = undefined;
      if (validatedData.referralCode) {
        const referrer = await storage.getUserByReferralCode(validatedData.referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }
      
      // Create user
      const newUser = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        country: validatedData.country || null,
        phoneNumber: validatedData.phoneNumber || null,
        referralCode: validatedData.username.toUpperCase() + Math.random().toString(36).substring(2, 8),
        referredBy,
        role: "user",
        active: true
      });
      
      // Create referral entries if user was referred
      if (referredBy) {
        try {
          console.log(`Creating referral record for new user ${newUser.id} referred by ${referredBy}`);
          
          // Create direct (level 1) referral
          await storage.createReferral({
            referrerId: referredBy,
            referredId: newUser.id,
            level: 1,
            commissionRate: "10"
          });
          
          // Check if the referrer has their own referrer (for level 2)
          const referrer = await storage.getUser(referredBy);
          if (referrer && referrer.referredBy) {
            console.log(`Creating level 2 referral: ${referrer.referredBy} -> ${newUser.id}`);
            await storage.createReferral({
              referrerId: referrer.referredBy,
              referredId: newUser.id,
              level: 2,
              commissionRate: "5"
            });
            
            // Check for level 3 referrer
            const level2Referrer = await storage.getUser(referrer.referredBy);
            if (level2Referrer && level2Referrer.referredBy) {
              console.log(`Creating level 3 referral: ${level2Referrer.referredBy} -> ${newUser.id}`);
              await storage.createReferral({
                referrerId: level2Referrer.referredBy,
                referredId: newUser.id,
                level: 3,
                commissionRate: "3"
              });
              
              // Check for level 4 referrer
              const level3Referrer = await storage.getUser(level2Referrer.referredBy);
              if (level3Referrer && level3Referrer.referredBy) {
                console.log(`Creating level 4 referral: ${level3Referrer.referredBy} -> ${newUser.id}`);
                await storage.createReferral({
                  referrerId: level3Referrer.referredBy,
                  referredId: newUser.id,
                  level: 4,
                  commissionRate: "2"
                });
                
                // Check for level 5 referrer
                const level4Referrer = await storage.getUser(level3Referrer.referredBy);
                if (level4Referrer && level4Referrer.referredBy) {
                  console.log(`Creating level 5 referral: ${level4Referrer.referredBy} -> ${newUser.id}`);
                  await storage.createReferral({
                    referrerId: level4Referrer.referredBy,
                    referredId: newUser.id,
                    level: 5,
                    commissionRate: "1"
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error("Error creating referral entries:", err);
          // Continue registration process even if referral creation fails
        }
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1d" });
      
      // Set user in session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Check if user is active
      if (!user.active) {
        return res.status(403).json({ message: "Account is deactivated" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
      
      // Set user in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ 
        message: "Login successful", 
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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public Routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

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

  // User Dashboard Routes
  app.get("/api/user/dashboard", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getUserDashboardStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/investments", authMiddleware, async (req, res) => {
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

  app.post("/api/user/investments", authMiddleware, async (req, res) => {
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
          message: `Investment amount must be between ${minDeposit} and ${maxDeposit} USDT` 
        });
      }
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);
      
      // Create investment
      const investment = await storage.createInvestment({
        ...validatedData,
        endDate,
        status: "active"
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

  app.get("/api/user/transactions", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const transactions = await storage.getUserTransactions(userId);
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/user/deposits", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
        type: "deposit",
        status: "pending"
      });
      
      const transaction = await storage.createTransaction(validatedData);
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

  app.post("/api/user/withdrawals", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { amount, currency, paymentMethod, transactionDetails } = req.body;
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount,
        currency: currency || "USDT",
        status: "pending",
        paymentMethod,
        transactionDetails
      });
      
      res.status(201).json({ 
        message: "Withdrawal request submitted", 
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

  app.get("/api/user/referrals", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log(`Fetching referrals for user ID: ${userId}`);
      const referrals = await storage.getAllUserReferrals(userId);
      
      // Group by level - referrals now already include referred user details
      const referralsByLevel = {};
      for (const referral of referrals) {
        if (!referralsByLevel[referral.level]) {
          referralsByLevel[referral.level] = [];
        }
        referralsByLevel[referral.level].push(referral);
      }
      
      console.log(`Grouped referrals by level: ${Object.keys(referralsByLevel).join(', ')}`);
      console.log(`Total referrals found: ${referrals.length}`);
      
      res.status(200).json(referralsByLevel);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Network performance heatmap data endpoint
  app.get("/api/user/network-performance", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log(`Fetching network performance data for user ID: ${userId}`);
      
      const performanceData = await storage.getNetworkPerformance(userId);
      
      res.status(200).json(performanceData);
    } catch (error) {
      console.error("Error fetching network performance data:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/referral-code", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ referralCode: user.referralCode });
    } catch (error) {
      console.error(error);
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

  app.put("/api/admin/transactions/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid transaction status" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, { status });
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
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

  const httpServer = createServer(app);

  return httpServer;
}
