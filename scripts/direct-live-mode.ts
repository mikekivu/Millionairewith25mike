
import { db } from '../server/db';
import { systemSettings } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function directSetLiveMode() {
  try {
    console.log('Directly setting payment mode to live in database...');
    
    // First try to find existing setting
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, 'payment_mode'))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(systemSettings)
        .set({ value: 'live' })
        .where(eq(systemSettings.key, 'payment_mode'))
        .returning();
      
      console.log('Updated existing setting:', updated);
    } else {
      // Insert new
      const [inserted] = await db
        .insert(systemSettings)
        .values({
          key: 'payment_mode',
          value: 'live',
          description: 'Payment gateway environment mode (live or sandbox)'
        })
        .returning();
      
      console.log('Inserted new setting:', inserted);
    }
    
    // Verify the setting
    const verify = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, 'payment_mode'))
      .limit(1);
    
    console.log('Verification - Current payment mode:', verify[0]?.value || 'Not found');
    
    if (verify[0]?.value === 'live') {
      console.log('✅ SUCCESS: Payment mode is now LIVE');
      console.log('⚠️  WARNING: Real money will be processed!');
    } else {
      console.log('❌ FAILED: Could not set live mode');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to directly set live mode:', error);
    process.exit(1);
  }
}

directSetLiveMode();
