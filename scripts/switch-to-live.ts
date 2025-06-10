
import { storage } from '../server/storage';

async function switchToLive() {
  try {
    console.log('🔄 Switching to LIVE mode...');
    
    // Ensure system_settings table exists and create if needed
    try {
      await storage.getAllSystemSettings();
    } catch (tableError) {
      console.log('⚠️  system_settings table might not exist, creating it...');
      // This will be handled by the setSystemSetting method
    }
    
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
      console.log('💳 PayPal: Make sure you have live client ID and secret');
      console.log('🏦 Pesapal: Make sure you have live consumer key and secret');
    } else {
      console.log('❌ FAILED: Could not switch to live mode');
      console.log('Current value:', setting?.value || 'undefined');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to switch to live mode:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

switchToLive();
