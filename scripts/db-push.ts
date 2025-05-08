import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from '@neondatabase/serverless';
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import * as schema from '../shared/schema';
import { nanoid } from "nanoid";

// Set up database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function main() {
  console.log('Migrating database...');
  
  // Push the schema to the database
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  // Check if admin user exists
  const [adminUser] = await db.select().from(schema.users).where({ username: 'admin' });
  
  // Create admin user if it doesn't exist
  if (!adminUser) {
    console.log('Creating admin user...');
    await db.insert(schema.users).values({
      username: "admin",
      password: "$2b$10$8D0qqMQHtE2TLM6rVe8NtedHCZzCBTr.YFVH58oDMuPWipJptdHVa", // "admin123"
      email: "admin@richlance.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      active: true,
      referralCode: "ADMIN" + nanoid(8),
      walletBalance: "0"
    });
  }
  
  // Check if plans exist
  const plans = await db.select().from(schema.plans);
  
  // Create default plans if they don't exist
  if (plans.length === 0) {
    console.log('Creating default plans...');
    await db.insert(schema.plans).values([
      {
        name: "Basic",
        description: "Perfect for beginners looking to start their investment journey.",
        monthlyRate: "5",
        minDeposit: "100",
        maxDeposit: "1000",
        durationDays: 30,
        features: ["Min Deposit: 100 USDT", "Max Deposit: 1,000 USDT", "Duration: 30 days", "24/7 Support"],
        active: true
      },
      {
        name: "Standard",
        description: "Our most popular plan for active investors.",
        monthlyRate: "8",
        minDeposit: "1000",
        maxDeposit: "10000",
        durationDays: 30,
        features: ["Min Deposit: 1,000 USDT", "Max Deposit: 10,000 USDT", "Duration: 30 days", "24/7 Support + Financial Advisor"],
        active: true
      },
      {
        name: "Premium",
        description: "For serious investors seeking maximum returns.",
        monthlyRate: "12",
        minDeposit: "10000",
        maxDeposit: "50000",
        durationDays: 30,
        features: ["Min Deposit: 10,000 USDT", "Max Deposit: 50,000 USDT", "Duration: 30 days", "VIP Support + Dedicated Manager"],
        active: true
      }
    ]);
  }
  
  // Check if payment settings exist
  const paymentSettings = await db.select().from(schema.paymentSettings);
  
  // Create default payment settings if they don't exist
  if (paymentSettings.length === 0) {
    console.log('Creating default payment settings...');
    await db.insert(schema.paymentSettings).values([
      {
        paymentMethod: "paypal",
        active: true,
        walletAddress: "",
        apiKey: process.env.PAYPAL_CLIENT_ID || "",
        secretKey: process.env.PAYPAL_CLIENT_SECRET || ""
      },
      {
        paymentMethod: "coinbase",
        active: true,
        walletAddress: "TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb", // Example USDT TRC20 wallet address
        apiKey: process.env.COINBASE_API_KEY || "",
        secretKey: process.env.COINBASE_API_SECRET || ""
      }
    ]);
  }
  
  console.log('Database migration completed successfully!');
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (e) => {
    console.error('Error during migration:', e);
    await pool.end();
    process.exit(1);
  });