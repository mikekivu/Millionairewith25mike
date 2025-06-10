
import { storage } from '../server/storage';

async function checkPaymentMode() {
  try {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    console.log('Current payment mode:', paymentMode?.value || 'Not set (defaults to sandbox)');
    
    if (paymentMode?.value === 'live') {
      console.log('⚠️  WARNING: You are in LIVE mode - real money will be processed!');
    } else {
      console.log('ℹ️  You are in sandbox mode - safe for testing');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to check payment mode:', error);
    process.exit(1);
  }
}

checkPaymentMode();
