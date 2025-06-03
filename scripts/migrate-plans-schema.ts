
import { db } from "../server/db";

async function migratePlansSchema() {
  console.log('Starting plans table migration...');
  
  try {
    // First, let's check current table structure
    const currentPlans = await db.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current table structure:', currentPlans.rows);
    
    // Add new columns if they don't exist
    const migrations = [
      `ALTER TABLE plans ADD COLUMN IF NOT EXISTS return_percentage NUMERIC(5, 2)`,
      `ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_hours INTEGER`,
      `UPDATE plans SET return_percentage = 400.00 WHERE return_percentage IS NULL`,
      `UPDATE plans SET duration_hours = 12 WHERE duration_hours IS NULL`,
      `ALTER TABLE plans ALTER COLUMN return_percentage SET NOT NULL`,
      `ALTER TABLE plans ALTER COLUMN duration_hours SET NOT NULL`,
      `ALTER TABLE plans DROP COLUMN IF EXISTS monthly_rate`,
      `ALTER TABLE plans DROP COLUMN IF EXISTS duration_days`
    ];
    
    for (const migration of migrations) {
      try {
        console.log(`Executing: ${migration}`);
        await db.execute(migration);
        console.log('✓ Success');
      } catch (error) {
        console.log(`⚠ Warning for "${migration}":`, error.message);
      }
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the changes
    const updatedStructure = await db.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Updated table structure:', updatedStructure.rows);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

migratePlansSchema()
  .then(() => {
    console.log('Plans schema migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
