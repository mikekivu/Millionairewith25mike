
import { storage } from '../server/storage';

async function switchToLive() {
  try {
    console.log('🔄 Switching to LIVE mode...');
    
    // Set payment mode to live
    await storage.setSystemSetting(
      'payment_mode',
      'live',
      'Payment gateway environment mode (live or sandbox)'
    );
    
    // Verify the change
    const setting = await storage.getSystemSetting('payment_mode');
    
    if (setting?.value === 'live') {
      console.log('✅ SUCCESS: Payment mode is now LIVE');
      console.log('⚠️  WARNING: You are now in LIVE mode. Real money will be processed!');
      console.log('🔒 Make sure you have configured live API credentials for PayPal and Pesapal.');
    } else {
      console.log('❌ FAILED: Could not switch to live mode');
      console.log('Current value:', setting?.value || 'undefined');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to switch to live mode:', error);
    process.exit(1);
  }
}

switchToLive();
