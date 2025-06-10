
import { storage } from '../server/storage';

async function forceLiveMode() {
  try {
    console.log('Force setting payment mode to live...');
    
    // First check if the setting exists
    const currentSetting = await storage.getSystemSetting('payment_mode');
    console.log('Current setting:', currentSetting);
    
    // Delete any existing payment_mode setting and recreate it
    try {
      await storage.setSystemSetting(
        'payment_mode',
        'live',
        'Payment gateway environment mode (live or sandbox)'
      );
    } catch (error) {
      console.log('Error setting system setting, trying alternative approach:', error);
    }
    
    // Verify the setting was saved
    const newSetting = await storage.getSystemSetting('payment_mode');
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
