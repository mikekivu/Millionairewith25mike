
import { storage } from '../server/storage';

async function switchToSandbox() {
  try {
    console.log('🔄 Switching to SANDBOX mode...');
    
    // Ensure system_settings table exists and create if needed
    try {
      await storage.getAllSystemSettings();
    } catch (tableError) {
      console.log('⚠️  system_settings table might not exist, creating it...');
      // This will be handled by the setSystemSetting method
    }
    
    // Set payment mode to sandbox
    await storage.setSystemSetting(
      'payment_mode',
      'sandbox',
      'Payment gateway environment mode (live or sandbox)'
    );
    
    // Verify the change
    const setting = await storage.getSystemSetting('payment_mode');
    
    if (setting?.value === 'sandbox') {
      console.log('✅ SUCCESS: Payment mode is now SANDBOX');
      console.log('🧪 You are now in sandbox/test mode. No real money will be processed.');
      console.log('💡 This is safe for testing and development.');
      console.log('💳 PayPal: Using sandbox environment');
      console.log('🏦 Pesapal: Using demo/test environment');
    } else {
      console.log('❌ FAILED: Could not switch to sandbox mode');
      console.log('Current value:', setting?.value || 'undefined');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to switch to sandbox mode:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

switchToSandbox();
