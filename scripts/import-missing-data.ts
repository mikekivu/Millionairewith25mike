
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

// Set up database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function importMissingPlans() {
  console.log('Checking for missing investment plans...');
  
  const existingPlans = await db.select().from(schema.plans);
  console.log(`Found ${existingPlans.length} existing plans`);
  
  // Basic plans that should exist
  const basicPlans = [
    {
      name: "Starter",
      description: "Perfect for beginners starting their investment journey",
      monthlyRate: "5.00",
      minDeposit: "50",
      maxDeposit: "999",
      durationDays: 30,
      features: ["Daily returns", "24/7 support", "Instant withdrawals"],
      active: true,
      requiredReferrals: 0,
      totalIncome: "75",
      reEntryAmount: "50",
      totalIncomeAfterReEntry: "150",
      rewardGift: "Welcome bonus"
    },
    {
      name: "Professional",
      description: "For experienced investors looking for higher returns",
      monthlyRate: "8.00",
      minDeposit: "1000",
      maxDeposit: "4999",
      durationDays: 60,
      features: ["Higher returns", "Priority support", "Advanced analytics", "Personal advisor"],
      active: true,
      requiredReferrals: 5,
      totalIncome: "4800",
      reEntryAmount: "1000",
      totalIncomeAfterReEntry: "9600",
      rewardGift: "Premium toolkit"
    },
    {
      name: "Elite",
      description: "Maximum returns for elite investors",
      monthlyRate: "12.00",
      minDeposit: "5000",
      maxDeposit: "50000",
      durationDays: 90,
      features: ["Maximum returns", "VIP support", "Exclusive opportunities", "Direct management"],
      active: true,
      requiredReferrals: 15,
      totalIncome: "18000",
      reEntryAmount: "5000",
      totalIncomeAfterReEntry: "36000",
      rewardGift: "Elite membership"
    }
  ];
  
  for (const plan of basicPlans) {
    const existing = existingPlans.find(p => p.name === plan.name);
    if (!existing) {
      try {
        const [newPlan] = await db.insert(schema.plans).values(plan).returning();
        console.log(`Created plan: ${newPlan.name}`);
      } catch (error) {
        console.error(`Error creating plan ${plan.name}:`, error);
      }
    } else {
      console.log(`Plan ${plan.name} already exists`);
    }
  }
}

async function importDefaultPaymentSettings() {
  console.log('Checking for default payment settings...');
  
  const existingSettings = await db.select().from(schema.paymentSettings);
  console.log(`Found ${existingSettings.length} existing payment settings`);
  
  const defaultSettings = [
    {
      method: "usdt_trc20",
      name: "USDT (TRC20)",
      active: true,
      instructions: "Send USDT to the wallet address below. Use TRC20 network only.",
      credentials: "TYourUSDTWalletAddressHere",
      minAmount: "10",
      maxAmount: "50000",
      payment_method: "usdt_trc20"
    },
    {
      method: "paypal",
      name: "PayPal",
      active: true,
      instructions: "Send payment to the PayPal email below. Include your username in the note.",
      credentials: "payments@yoursite.com",
      minAmount: "10",
      maxAmount: "10000",
      payment_method: "paypal"
    }
  ];
  
  for (const setting of defaultSettings) {
    const existing = existingSettings.find(s => s.method === setting.method);
    if (!existing) {
      try {
        const [newSetting] = await db.insert(schema.paymentSettings).values(setting).returning();
        console.log(`Created payment setting: ${newSetting.name}`);
      } catch (error) {
        console.error(`Error creating payment setting ${setting.name}:`, error);
      }
    } else {
      console.log(`Payment setting ${setting.name} already exists`);
    }
  }
}

async function createReferralRelationships() {
  console.log('Creating referral relationships for existing users...');
  
  // Get all users who have referredBy set
  const usersWithReferrers = await db.select().from(schema.users).where(
    schema.users.referredBy !== null
  );
  
  console.log(`Found ${usersWithReferrers.length} users with referrers`);
  
  for (const user of usersWithReferrers) {
    if (user.referredBy) {
      // Check if referral relationship already exists
      const existingReferral = await db.select().from(schema.referrals).where(
        and(
          eq(schema.referrals.referrerId, user.referredBy),
          eq(schema.referrals.referredId, user.id)
        )
      );
      
      if (existingReferral.length === 0) {
        try {
          const referralData = {
            referrerId: user.referredBy,
            referredId: user.id,
            level: 1, // Direct referral
            commissionRate: "10.00", // 10% commission
            commissionAmount: "0",
            status: "active" as const
          };
          
          await db.insert(schema.referrals).values(referralData);
          console.log(`Created referral relationship: User ${user.referredBy} referred User ${user.id}`);
        } catch (error) {
          console.error(`Error creating referral for user ${user.id}:`, error);
        }
      } else {
        console.log(`Referral relationship already exists for user ${user.id}`);
      }
    }
  }
}

async function main() {
  try {
    await importMissingPlans();
    await importDefaultPaymentSettings();
    await createReferralRelationships();
    
    console.log('Missing data import completed successfully!');
    
    // Display statistics
    const stats = await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.plans),
      db.select().from(schema.paymentSettings),
      db.select().from(schema.referrals),
      db.select().from(schema.investments),
      db.select().from(schema.transactions)
    ]);
    
    console.log('\n=== Database Statistics ===');
    console.log(`Users: ${stats[0].length}`);
    console.log(`Plans: ${stats[1].length}`);
    console.log(`Payment Settings: ${stats[2].length}`);
    console.log(`Referrals: ${stats[3].length}`);
    console.log(`Investments: ${stats[4].length}`);
    console.log(`Transactions: ${stats[5].length}`);
    
  } catch (error) {
    console.error('Error during missing data import:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (e) => {
    console.error('Error during missing data import:', e);
    await pool.end();
    process.exit(1);
  });
