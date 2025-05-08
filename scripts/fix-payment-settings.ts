import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

async function fixPaymentSettingsTable() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Checking if payment_settings table exists...");
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_settings')"
    );
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log("Creating payment_settings table...");
      await pool.query(`
        CREATE TABLE payment_settings (
          id SERIAL PRIMARY KEY,
          method TEXT NOT NULL,
          name TEXT NOT NULL,
          instructions TEXT,
          credentials TEXT,
          min_amount TEXT NOT NULL DEFAULT '10',
          max_amount TEXT NOT NULL DEFAULT '10000',
          active BOOLEAN NOT NULL DEFAULT true
        );
      `);
      console.log("payment_settings table created successfully");
    } else {
      console.log("payment_settings table already exists, checking columns...");
      
      // Check if method column exists
      const methodColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'method')"
      );
      
      if (!methodColumnCheck.rows[0].exists) {
        console.log("Adding method column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN method TEXT NOT NULL DEFAULT 'paypal'"
        );
        console.log("method column added successfully");
      } else {
        console.log("method column already exists");
      }
      
      // Check if name column exists
      const nameColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'name')"
      );
      
      if (!nameColumnCheck.rows[0].exists) {
        console.log("Adding name column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN name TEXT NOT NULL DEFAULT 'Payment Method'"
        );
        console.log("name column added successfully");
      } else {
        console.log("name column already exists");
      }
      
      // Check if instructions column exists
      const instructionsColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'instructions')"
      );
      
      if (!instructionsColumnCheck.rows[0].exists) {
        console.log("Adding instructions column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN instructions TEXT"
        );
        console.log("instructions column added successfully");
      } else {
        console.log("instructions column already exists");
      }
      
      // Check if credentials column exists
      const credentialsColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'credentials')"
      );
      
      if (!credentialsColumnCheck.rows[0].exists) {
        console.log("Adding credentials column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN credentials TEXT"
        );
        console.log("credentials column added successfully");
      } else {
        console.log("credentials column already exists");
      }
      
      // Check if min_amount column exists
      const minAmountColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'min_amount')"
      );
      
      if (!minAmountColumnCheck.rows[0].exists) {
        console.log("Adding min_amount column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN min_amount TEXT NOT NULL DEFAULT '10'"
        );
        console.log("min_amount column added successfully");
      } else {
        console.log("min_amount column already exists");
      }
      
      // Check if max_amount column exists
      const maxAmountColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'max_amount')"
      );
      
      if (!maxAmountColumnCheck.rows[0].exists) {
        console.log("Adding max_amount column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN max_amount TEXT NOT NULL DEFAULT '10000'"
        );
        console.log("max_amount column added successfully");
      } else {
        console.log("max_amount column already exists");
      }
      
      // Check if active column exists
      const activeColumnCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'active')"
      );
      
      if (!activeColumnCheck.rows[0].exists) {
        console.log("Adding active column to payment_settings table...");
        await pool.query(
          "ALTER TABLE payment_settings ADD COLUMN active BOOLEAN NOT NULL DEFAULT true"
        );
        console.log("active column added successfully");
      } else {
        console.log("active column already exists");
      }
    }
    
    console.log("Database schema updated successfully");
  } catch (error) {
    console.error("Error updating database schema:", error);
  } finally {
    await pool.end();
  }
}

fixPaymentSettingsTable().catch(console.error);