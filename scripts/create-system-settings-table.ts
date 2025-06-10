
import { db } from '../server/db';
import { systemSettings } from '@shared/schema';

async function createSystemSettingsTable() {
  try {
    console.log('Creating system_settings table...');
    
    // Create the table using Drizzle schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ system_settings table created successfully');
    
    // Insert default payment_mode setting
    await db.execute(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('payment_mode', 'sandbox', 'Payment gateway environment mode (live or sandbox)')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('✅ Default payment_mode setting added');
    
    // Verify the table was created
    const result = await db.execute(`
      SELECT * FROM system_settings WHERE key = 'payment_mode';
    `);
    
    console.log('Current payment mode setting:', result.rows[0] || 'Not found');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create system_settings table:', error);
    process.exit(1);
  }
}

createSystemSettingsTable();
