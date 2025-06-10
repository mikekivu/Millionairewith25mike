
import { storage } from '../server/storage';

async function setLiveMode() {
  try {
    console.log('Switching payment mode to live...');
    
    await storage.setSystemSetting(
      'payment_mode',
      'live',
      'Payment gateway environment mode (live or sandbox)'
    );
    
    console.log('Payment mode switched to live successfully!');
    console.log('⚠️  WARNING: You are now in LIVE mode. Real money will be processed.');
    console.log('Make sure you have configured live API credentials for PayPal and Pesapal.');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to switch to live mode:', error);
    process.exit(1);
  }
}

setLiveMode();
