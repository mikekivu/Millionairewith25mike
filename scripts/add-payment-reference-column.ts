
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addPaymentReferenceColumn() {
  try {
    console.log("Adding payment_reference column to transactions table...");
    
    // Add the payment_reference column
    await db.execute(sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)
    `);
    
    console.log("Successfully added payment_reference column!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding payment_reference column:", error);
    process.exit(1);
  }
}

addPaymentReferenceColumn().catch(console.error);
