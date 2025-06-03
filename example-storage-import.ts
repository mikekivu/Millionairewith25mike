
// Import the storage class for high-level operations
import { DatabaseStorage } from "./server/database-storage";

// Initialize the storage
const storage = new DatabaseStorage();

// Example usage - User operations
async function exampleUserOperations() {
  // Get a user
  const user = await storage.getUser(1);
  
  // Get user by email
  const userByEmail = await storage.getUserByEmail("user@example.com");
  
  // Get all users
  const allUsers = await storage.getAllUsers();
  
  // Create a new user
  const newUser = await storage.createUser({
    username: "newuser",
    password: "hashedpassword",
    email: "newuser@example.com",
    firstName: "New",
    lastName: "User",
    referralCode: "NEWUSER123"
  });
  
  return { user, userByEmail, allUsers, newUser };
}

// Example usage - Investment operations
async function exampleInvestmentOperations() {
  // Get all plans
  const plans = await storage.getAllPlans();
  
  // Get active plans
  const activePlans = await storage.getActivePlans();
  
  // Get user investments
  const userInvestments = await storage.getUserInvestments(1);
  
  // Create new investment
  const newInvestment = await storage.createInvestment({
    userId: 1,
    planId: 1,
    amount: "100.00",
    status: "active",
    endDate: new Date()
  });
  
  return { plans, activePlans, userInvestments, newInvestment };
}

// Example usage - Transaction operations
async function exampleTransactionOperations() {
  // Get user transactions
  const userTransactions = await storage.getUserTransactions(1);
  
  // Get all transactions
  const allTransactions = await storage.getAllTransactions();
  
  // Create a transaction
  const newTransaction = await storage.createTransaction({
    userId: 1,
    type: "deposit",
    amount: "50.00",
    currency: "USDT",
    status: "pending",
    paymentMethod: "paypal"
  });
  
  return { userTransactions, allTransactions, newTransaction };
}

// Example usage - Dashboard stats
async function exampleDashboardOperations() {
  // Get admin dashboard stats
  const adminStats = await storage.getDashboardStats();
  
  // Get user dashboard stats
  const userStats = await storage.getUserDashboardStats(1);
  
  return { adminStats, userStats };
}
