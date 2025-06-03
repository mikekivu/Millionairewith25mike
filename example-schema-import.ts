
// Import types from schema
import { 
  User, 
  InsertUser, 
  Plan, 
  InsertPlan, 
  Investment, 
  InsertInvestment, 
  Transaction, 
  InsertTransaction,
  Referral,
  InsertReferral 
} from "@shared/schema";

// Example function using types
async function createUserWithType(userData: InsertUser): Promise<User> {
  const storage = new DatabaseStorage();
  return await storage.createUser(userData);
}

// Example function with plan type
function displayPlan(plan: Plan): string {
  return `Plan: ${plan.name} - Rate: ${plan.monthlyRate}% - Min: $${plan.minDeposit}`;
}

// Example function with investment type
function calculateInvestmentReturn(investment: Investment, plan: Plan): number {
  const principal = parseFloat(investment.amount);
  const rate = parseFloat(plan.monthlyRate) / 100;
  return principal * rate;
}
