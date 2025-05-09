import { db } from "../server/db";
import { plans } from "../shared/schema";
import { eq } from "drizzle-orm";

const matrixPlans = [
  {
    name: "Matrix Board 1",
    description: "Join Matrix Board 1 with 25 USDT, refer 15 people, and earn a total of 200 USDT plus a Health Product as reward.",
    monthlyRate: "0", // We don't use monthly rates for Matrix Board
    minDeposit: "25", // This is the join amount
    maxDeposit: "25",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "200",
    reEntryAmount: "25",
    totalIncomeAfterReEntry: "200",
    rewardGift: "Health Product"
  },
  {
    name: "Matrix Board 2",
    description: "Join Matrix Board 2 with 100 USDT, refer 15 people, and earn a total of 800 USDT plus a Mobile Phone as reward.",
    monthlyRate: "0",
    minDeposit: "100",
    maxDeposit: "100",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "800",
    reEntryAmount: "100",
    totalIncomeAfterReEntry: "800",
    rewardGift: "Mobile Phone"
  },
  {
    name: "Matrix Board 3",
    description: "Join Matrix Board 3 with 500 USDT, refer 15 people, and earn a total of 4000 USDT plus a Tablet as reward.",
    monthlyRate: "0",
    minDeposit: "500",
    maxDeposit: "500",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "4000",
    reEntryAmount: "500",
    totalIncomeAfterReEntry: "4000",
    rewardGift: "Tablet"
  },
  {
    name: "Matrix Board 4",
    description: "Join Matrix Board 4 with 1000 USDT, refer 15 people, and earn a total of 8000 USDT plus an iPad as reward.",
    monthlyRate: "0",
    minDeposit: "1000",
    maxDeposit: "1000",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "8000",
    reEntryAmount: "1000",
    totalIncomeAfterReEntry: "8000",
    rewardGift: "iPad"
  },
  {
    name: "Matrix Board 5",
    description: "Join Matrix Board 5 with 4000 USDT, refer 15 people, and earn a total of 32000 USDT plus a Laptop as reward.",
    monthlyRate: "0",
    minDeposit: "4000",
    maxDeposit: "4000",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "32000",
    reEntryAmount: "4000",
    totalIncomeAfterReEntry: "32000",
    rewardGift: "Laptop"
  },
  {
    name: "Matrix Board 6",
    description: "Join Matrix Board 6 with 8000 USDT, refer 15 people, and earn a total of 64000 USDT plus a Holiday Vacation as reward.",
    monthlyRate: "0",
    minDeposit: "8000",
    maxDeposit: "8000",
    durationDays: 365,
    active: true,
    requiredReferrals: 15,
    totalIncome: "64000",
    reEntryAmount: "8000",
    totalIncomeAfterReEntry: "64000",
    rewardGift: "Holiday Vacation"
  }
];

async function createMatrixPlans() {
  console.log("Starting to create Matrix Board plans...");

  try {
    // First check if any of these plans already exist
    for (const plan of matrixPlans) {
      const existingPlan = await db.select().from(plans).where(eq(plans.name, plan.name));
      
      if (existingPlan.length > 0) {
        console.log(`Plan ${plan.name} already exists. Updating...`);
        await db.update(plans)
          .set(plan)
          .where(eq(plans.name, plan.name));
      } else {
        console.log(`Creating new plan: ${plan.name}`);
        await db.insert(plans).values(plan);
      }
    }
    
    console.log("Successfully created all Matrix Board plans!");
  } catch (error) {
    console.error("Error creating Matrix Board plans:", error);
  }
}

// Run the function
createMatrixPlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to create plans:", error);
    process.exit(1);
  });