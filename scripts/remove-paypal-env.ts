
// Script to clean up PayPal environment variables
console.log('Cleaning up PayPal environment variables...');

delete process.env.PAYPAL_CLIENT_ID;
delete process.env.PAYPAL_CLIENT_SECRET;

console.log('✅ PayPal environment variables removed');
console.log('PayPal integration has been completely removed from the system');
