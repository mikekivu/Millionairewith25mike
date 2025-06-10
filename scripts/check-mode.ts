
import { storage } from '../server/storage';

async function checkCurrentMode() {
  try {
    console.log('🔍 Checking current payment mode...');
    
    const setting = await storage.getSystemSetting('payment_mode');
    const mode = setting?.value || 'sandbox';
    
    console.log(`📊 Current payment mode: ${mode.toUpperCase()}`);
    
    if (mode === 'live') {
      console.log('⚠️  WARNING: You are in LIVE mode - real money will be processed!');
      console.log('💳 PayPal: Live environment');
      console.log('🏦 Pesapal: Live environment');
    } else {
      console.log('🧪 You are in SANDBOX mode - safe for testing');
      console.log('💳 PayPal: Sandbox environment');
      console.log('🏦 Pesapal: Demo/Test environment');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to check payment mode:', error);
    process.exit(1);
  }
}

checkCurrentMode();
