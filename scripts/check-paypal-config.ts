
import { storage } from '../server/storage';

async function checkPayPalConfig() {
  console.log('=== PayPal Configuration Diagnostic ===\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? 
    `${process.env.PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET'}`);
  console.log(`   PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? 
    '••••••••••••••••' : 'NOT SET'}`);
  
  // Check if Client ID looks like sandbox or live
  if (process.env.PAYPAL_CLIENT_ID) {
    const isSandboxId = process.env.PAYPAL_CLIENT_ID.includes('sandbox') || 
                       process.env.PAYPAL_CLIENT_ID.startsWith('AZa') ||
                       process.env.PAYPAL_CLIENT_ID.startsWith('AYa');
    console.log(`   Client ID Type: ${isSandboxId ? 'SANDBOX' : 'LIVE'}`);
  }
  
  console.log('\n2. System Settings:');
  try {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    console.log(`   Payment Mode: ${paymentMode?.value || 'NOT SET'}`);
  } catch (error) {
    console.log(`   Error getting payment mode: ${error.message}`);
  }

  console.log('\n3. PayPal API Test:');
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
      
      // Test sandbox
      console.log('   Testing Sandbox API...');
      const sandboxResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });
      console.log(`   Sandbox Status: ${sandboxResponse.status} ${sandboxResponse.ok ? '✅' : '❌'}`);

      // Test live
      console.log('   Testing Live API...');
      const liveResponse = await fetch('https://api.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });
      console.log(`   Live Status: ${liveResponse.status} ${liveResponse.ok ? '✅' : '❌'}`);
      
      if (!liveResponse.ok) {
        const errorText = await liveResponse.text();
        console.log(`   Live Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   API Test Error: ${error.message}`);
    }
  } else {
    console.log('   Cannot test - credentials not set');
  }

  console.log('\n4. Recommendations:');
  console.log('   - Ensure you\'re using LIVE credentials for live mode');
  console.log('   - Live Client IDs typically start with "AT" or "AW"');
  console.log('   - Sandbox Client IDs typically contain "sandbox" or start with "AZ"');
  console.log('   - Make sure your PayPal app is approved for live payments');
  console.log('   - Check that your credentials are copied correctly without extra spaces');
}

checkPayPalConfig().catch(console.error);
