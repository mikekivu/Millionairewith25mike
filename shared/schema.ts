import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  walletBalance: decimal("wallet_balance", { precision: 18, scale: 6 }).notNull().default("0"),
  referralCode: text("referral_code").notNull().unique(),
  referrerId: integer("referrer_id"),
  referralLevel: integer("referral_level").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Investment plans
export const investmentPlans = pgTable("investment_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  monthlyReturn: decimal("monthly_return", { precision: 5, scale: 2 }).notNull(),
  minInvestment: decimal("min_investment", { precision: 18, scale: 6 }).notNull(),
  termMonths: integer("term_months").notNull(),
  referralCommission: decimal("referral_commission", { precision: 5, scale: 2 }).notNull(),
  referralLevels: integer("referral_levels").notNull(),
  earlyWithdrawalFee: decimal("early_withdrawal_fee", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Investments
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: integer("plan_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  lastPayoutDate: timestamp("last_payout_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, investment, earnings, referral
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  status: text("status").notNull().default("pending"),
  description: text("description"),
  paymentMethod: text("payment_method"), // paypal, coinbase
  referenceId: text("reference_id"), // external payment reference
  investmentId: integer("investment_id"), // for investment-related transactions
  referrerId: integer("referrer_id"), // for referral earnings
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Referrals table for tracking genealogy
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  referrerId: integer("referrer_id").notNull(),
  level: integer("level").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payment Gateway Settings
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  walletAddress: text("wallet_address"), // For crypto gateways
  environment: text("environment").default("production"), // sandbox or production
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
  walletBalance: true,
  referralLevel: true,
  status: true
});

export const insertInvestmentPlanSchema = createInsertSchema(investmentPlans).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPayoutDate: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ 
  id: true,
  createdAt: true
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export type InsertInvestmentPlan = z.infer<typeof insertInvestmentPlanSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
