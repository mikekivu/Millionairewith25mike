
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

const client = postgres(process.env.DATABASE_URL || 'postgresql://localhost:5432/propertygroups');
const db = drizzle(client, { schema });

async function removeAllPaymentMethods() {
  console.log('🗑️ Removing all payment methods from database...');
  
  try {
    // Delete all payment settings
    const deletedSettings = await db.delete(schema.paymentSettings).returning();
    console.log(`✅ Deleted ${deletedSettings.length} payment settings`);
    
    // Verify they're all gone
    const remainingSettings = await db.select().from(schema.paymentSettings);
    console.log(`Remaining payment settings: ${remainingSettings.length}`);
    
    if (remainingSettings.length === 0) {
      console.log('✅ All payment methods successfully removed');
    } else {
      console.log('⚠️ Some payment methods still remain:', remainingSettings);
    }
    
  } catch (error) {
    console.error('❌ Error removing payment methods:', error);
  } finally {
    await client.end();
  }
}

removeAllPaymentMethods().catch(console.error);
