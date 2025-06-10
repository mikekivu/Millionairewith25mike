
import { storage } from '../server/storage';

async function initPaymentMode() {
  try {
    console.log('Initializing payment mode setting...');
    
    // Set default payment mode to sandbox for safety
    await storage.setSystemSetting(
      'payment_mode',
      'sandbox',
      'Payment gateway environment mode (live or sandbox)'
    );
    
    console.log('Payment mode setting initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize payment mode:', error);
    process.exit(1);
  }
}

initPaymentMode();
