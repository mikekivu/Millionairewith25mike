import { pgTable, text, serial, integer, boolean, timestamp, numeric, foreignKey, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country"),
  phoneNumber: text("phone_number"),
  walletBalance: numeric("wallet_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  role: text("role").notNull().default("user"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by").references(() => users.id),
  profileImage: text("profile_image"),
});

// Investment Plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  returnPercentage: numeric("return_percentage", { precision: 5, scale: 2 }).notNull(), // 400% return
  minDeposit: numeric("min_deposit", { precision: 18, scale: 8 }).notNull(),
  maxDeposit: numeric("max_deposit", { precision: 18, scale: 8 }).notNull(),
  durationHours: integer("duration_hours").notNull(), // 12 hours
  features: text("features").array(),
  active: boolean("active").notNull().default(true),
});

// Investments
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => plans.id),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  profit: numeric("profit", { precision: 18, scale: 8 }).notNull().default("0"),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, investment, referral
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paymentMethod: text("payment_method"), // paypal, coinbase, bank_transfer, etc.
  transactionDetails: text("transaction_details"),
  paymentProof: text("payment_proof"), // URL or path to payment proof image/document
  externalTransactionId: text("external_transaction_id"), // ID from payment provider (PayPal, Coinbase, etc.)
  processedAt: timestamp("processed_at"), // When the transaction was processed
  processedBy: integer("processed_by").references(() => users.id), // Admin who processed the transaction
  adminNotes: text("admin_notes"), // Internal notes for admins
  receiptId: text("receipt_id"), // ID of generated receipt
  receiptUrl: text("receipt_url"), // URL to download the receipt
  investmentId: integer("investment_id").references(() => investments.id),
  referralId: integer("referral_id").references(() => referrals.id),
  paymentReference: text("payment_reference"),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  level: integer("level").notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: numeric("commission_amount", { precision: 18, scale: 8 }).notNull().default("0"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payment Settings
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  method: text("method").notNull(), // paypal, usdt_trc20
  name: text("name").notNull(), // Display name for the payment method
  active: boolean("active").notNull().default(true),
  instructions: text("instructions"), // Instructions for users
  credentials: text("credentials"), // Wallet address, PayPal email, etc.
  minAmount: text("min_amount").notNull().default("10"),
  maxAmount: text("max_amount").notNull().default("10000"),
  payment_method: text("payment_method").notNull(), // For compatibility - same as method
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentConfigurations = pgTable("payment_configurations", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'paypal' or 'pesapal'
  environment: varchar("environment", { length: 20 }).notNull().default('sandbox'), // 'sandbox' or 'live'
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  consumerKey: text("consumer_key"), // For Pesapal
  consumerSecret: text("consumer_secret"), // For Pesapal
  ipnId: text("ipn_id"), // For Pesapal
  active: boolean("active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  responded: boolean("responded").notNull().default(false),
});

// User Messages (Member-to-member & Admin-to-member messages)
export const userMessages = pgTable("user_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
  replied: boolean("replied").notNull().default(false),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // payment, message, referral, plan, admin
  status: text("status").notNull().default("unread"), // unread, read
  createdAt: timestamp("created_at").notNull().defaultNow(),
  entityId: integer("entity_id"), // ID of the related entity (payment ID, message ID, etc.)
  entityType: text("entity_type"), // Type of the related entity (payment, message, etc.)
  link: text("link"), // Optional link to navigate to when clicked
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  referer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
  referrals: many(users, {
    relationName: "user_referrals"
  }),
  investments: many(investments),
  transactions: many(transactions),
  processedTransactions: many(transactions, { relationName: "transaction_processor" }),
  referralsAsReferrer: many(referrals, { relationName: "referrer" }),
  referralsAsReferred: many(referrals, { relationName: "referred" }),
  sentMessages: many(userMessages, { relationName: "message_sender" }),
  receivedMessages: many(userMessages, { relationName: "message_recipient" }),
  notifications: many(notifications),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  investments: many(investments),
}));

export const investmentsRelations = relations(investments, ({ one, many }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [investments.planId],
    references: [plans.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  processor: one(users, {
    fields: [transactions.processedBy],
    references: [users.id],
    relationName: "transaction_processor"
  }),
  investment: one(investments, {
    fields: [transactions.investmentId],
    references: [investments.id],
  }),
  referral: one(referrals, {
    fields: [transactions.referralId],
    references: [referrals.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
  transactions: many(transactions),
}));

export const userMessagesRelations = relations(userMessages, ({ one }) => ({
  sender: one(users, {
    fields: [userMessages.senderId],
    references: [users.id],
    relationName: "message_sender",
  }),
  recipient: one(users, {
    fields: [userMessages.recipientId],
    references: [users.id],
    relationName: "message_recipient",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });
export const insertInvestmentSchema = createInsertSchema(investments).omit({ id: true, createdAt: true, profit: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true, commissionAmount: true });
// Create a custom PaymentSetting schema that includes payment_method
export const insertPaymentSettingSchema = createInsertSchema(paymentSettings)
  .omit({ id: true })
  .extend({
    payment_method: z.string().optional(),
  });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, responded: true });

// New schemas for user messages and notifications
export const insertUserMessageSchema = createInsertSchema(userMessages).omit({ id: true, createdAt: true, read: true, replied: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, status: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = z.infer<typeof insertPaymentSettingSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    email: true,
    firstName: true,
    lastName: true,
  })
  .extend({
    confirmPassword: z.string().min(6),
    country: z.string().optional(),
    phoneNumber: z.string().optional(),
    referralCode: z.string().optional(),
    terms: z.boolean().refine(val => val === true, {
      message: "You must agree to the terms and conditions"
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const insertTransactionSchemaZod = z.object({
  userId: z.number(),
  type: z.enum(["deposit", "withdrawal", "investment", "profit", "referral_bonus", "admin_adjustment"]),
  amount: z.string(),
  currency: z.string().default("USD"),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  paymentMethod: z.string().optional(),
  transactionDetails: z.string().optional(),
  description: z.string().optional(),
  paymentReference: z.string().optional(),
});