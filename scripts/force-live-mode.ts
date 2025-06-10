
import { DatabaseStorage } from '../server/database-storage';

async function forceLiveMode() {
  try {
    console.log('Force setting payment mode to live...');
    
    // Use DatabaseStorage directly
    const storage = new DatabaseStorage();
    
    // First check if the setting exists
    const currentSetting = await storage.getSystemSetting('payment_mode');
    console.log('Current setting:', currentSetting);
    
    // Set the payment mode to live
    const newSetting = await storage.setSystemSetting(
      'payment_mode',
      'live',
      'Payment gateway environment mode (live or sandbox)'
    );
    
    console.log('New setting after update:', newSetting);
    
    if (newSetting?.value === 'live') {
      console.log('✅ SUCCESS: Payment mode is now set to LIVE');
      console.log('⚠️  WARNING: You are now in LIVE mode. Real money will be processed.');
    } else {
      console.log('❌ FAILED: Payment mode was not updated properly');
      console.log('Current value:', newSetting?.value || 'undefined');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to force live mode:', error);
    process.exit(1);
  }
}

forceLiveMode();
