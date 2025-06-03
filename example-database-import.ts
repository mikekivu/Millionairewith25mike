
// Import the database connection directly
import { db } from "./server/db";
import { users, plans, investments, transactions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Example usage - Get all users
async function getAllUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
}

// Example usage - Get a specific user
async function getUser(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

// Example usage - Get active plans
async function getActivePlans() {
  const activePlans = await db.select().from(plans).where(eq(plans.active, true));
  return activePlans;
}

// Example usage - Get user investments
async function getUserInvestments(userId: number) {
  const userInvestments = await db.select().from(investments).where(eq(investments.userId, userId));
  return userInvestments;
}
