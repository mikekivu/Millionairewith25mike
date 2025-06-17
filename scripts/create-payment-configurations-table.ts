
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL || 'postgresql://localhost:5432/propertygroups');
const db = drizzle(client);

async function createPaymentConfigurationsTable() {
  console.log('🔧 Creating payment_configurations table...');
  
  try {
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
    
    // Check if table was created
    const result = await db.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'payment_configurations'
    `);
    
    console.log('✅ Table verification complete');
    
  } catch (error) {
    console.error('❌ Error creating payment_configurations table:', error);
  } finally {
    await client.end();
  }
}

createPaymentConfigurationsTable().catch(console.error);
