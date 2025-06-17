
import { db } from '../server/db';

async function createPaymentConfigurationsTable() {
  console.log('🔧 Creating payment_configurations table...');
  
  try {
    // Create payment_configurations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payment_configurations (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        environment VARCHAR(20) NOT NULL DEFAULT 'sandbox',
        client_id TEXT,
        client_secret TEXT,
        consumer_key TEXT,
        consumer_secret TEXT,
        ipn_id TEXT,
        active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(provider, environment)
      );
    `);
    
    console.log('✅ payment_configurations table created successfully');
    
    // Also fix system_settings table structure
    console.log('🔧 Fixing system_settings table...');
    
    // Check if system_settings table exists and has the right structure
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Insert default payment_mode setting
    await db.execute(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('payment_mode', 'sandbox', 'Payment gateway environment mode (live or sandbox)')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('✅ system_settings table fixed successfully');
    console.log('✅ All tables created and initialized');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createPaymentConfigurationsTable().catch(console.error);
