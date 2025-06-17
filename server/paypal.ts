import { Request, Response } from "express";
import { storage } from "./storage";

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPaypalBaseUrl() {
  try {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    console.log('PayPal checking payment mode:', paymentMode);

    // Use the admin-configured payment mode setting as the primary determinant
    const isLive = paymentMode?.value === 'live';
    const baseUrl = isLive ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
    console.log('PayPal using base URL:', baseUrl, 'for mode:', paymentMode?.value);
    return baseUrl;
  } catch (error) {
    console.log('Error getting payment mode, using sandbox:', error);
    // Fallback to sandbox for safety
    return 'https://api.sandbox.paypal.com';
  }
}

export async function getClientToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.log("PayPal credentials not configured, using demo mode");
    return "demo_client_token";
  }

  try {
    // Get access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const baseUrl = await getPaypalBaseUrl();

    console.log(`Requesting PayPal access token from: ${baseUrl}/v1/oauth2/token`);

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    });

    const responseText = await response.text();
    console.log(`PayPal API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error("PayPal API call failed:", response.status, responseText);
      return "demo_client_token";
    }

    const data = JSON.parse(responseText);
    console.log("PayPal access token obtained successfully");
    return data.access_token || "demo_client_token";
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    return "demo_client_token";
  }
}

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { amount, currency = 'USD', intent = 'CAPTURE', userId, type = 'deposit' } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required.",
      });
    }

    // Verify user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // For withdrawals, check if user has sufficient balance
    if (type === 'withdrawal') {
      const walletBalance = parseFloat(user.walletBalance);
      if (walletBalance < parseFloat(amount)) {
        return res.status(400).json({
          error: "Insufficient wallet balance for withdrawal.",
        });
      }
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      // Demo mode
      const orderId = `PAYPAL_DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create pending transaction
      await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status: "pending",
        paymentMethod: "paypal",
        transactionDetails: `PayPal ${type}: ${orderId}`,
        paymentReference: orderId
      });

      return res.status(200).json({
        id: orderId,
        status: "CREATED",
        links: [{
          href: `#`,
          rel: "approve",
          method: "REDIRECT"
        }]
      });
    }

    // Real PayPal integration
    const accessToken = await getClientToken();
    const baseUrl = await getPaypalBaseUrl();

    const orderData = {
      intent: intent.toUpperCase(),
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount
        },
        description: `${type === 'deposit' ? 'Wallet Deposit' : 'Wallet Withdrawal'} - User ${user.username}`,
        custom_id: `${userId}_${type}_${Date.now()}`
      }],
      application_context: {
        return_url: `${req.protocol}://${req.get('host')}/dashboard/wallet?payment=paypal&status=success`,
        cancel_url: `${req.protocol}://${req.get('host')}/dashboard/wallet?payment=paypal&status=cancelled`,
        brand_name: "RichLance Investment",
        user_action: "PAY_NOW"
      }
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData)
    });

    const order = await response.json();

    if (response.ok) {
      // Create pending transaction
      await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status: "pending",
        paymentMethod: "paypal",
        transactionDetails: `PayPal ${type}: ${order.id}`,
        paymentReference: order.id
      });

      res.status(200).json(order);
    } else {
      console.error("PayPal order creation failed:", order);
      res.status(500).json({ error: "Failed to create PayPal order." });
    }
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;
    const { userId } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      // Demo mode - simulate successful capture
      const transaction = await storage.getTransactionByReference(orderID);
      if (transaction) {
        // Update transaction status
        await storage.updateTransaction(transaction.id, { status: "completed" });

        if (transaction.type === 'deposit') {
          // Add funds to wallet
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');
        } else if (transaction.type === 'withdrawal') {
          // Deduct funds from wallet (already checked in creation)
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'subtract');
        }
      }

      return res.status(200).json({
        id: orderID,
        status: "COMPLETED",
        payment_source: { paypal: {} }
      });
    }

    // Real PayPal integration
    const accessToken = await getClientToken();
    const baseUrl = await getPaypalBaseUrl();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const captureData = await response.json();

    if (response.ok && captureData.status === 'COMPLETED') {
      // Find and update the transaction
      const transaction = await storage.getTransactionByReference(orderID);
      if (transaction) {
        await storage.updateTransaction(transaction.id, { status: "completed" });

        if (transaction.type === 'deposit') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');
        } else if (transaction.type === 'withdrawal') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'subtract');
        }
      }

      res.status(200).json(captureData);
    } else {
      console.error("PayPal capture failed:", captureData);
      res.status(500).json({ error: "Failed to capture PayPal order." });
    }
  } catch (error) {
    console.error("Failed to capture PayPal order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value === 'live' ? 'live' : 'sandbox';
    const isConfigured = !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
    
    console.log('PayPal config request - Mode:', environment, 'Configured:', isConfigured);
    
    if (!isConfigured) {
      console.warn('PayPal credentials not configured');
      return res.json({ 
        clientToken: 'demo_client_token',
        clientId: 'demo',
        environment: 'sandbox',
        configured: false,
        error: 'PayPal credentials not configured'
      });
    }

    // For live mode, validate that we have proper credentials
    if (environment === 'live') {
      console.log('Live mode detected, validating credentials...');
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error('Live mode requires PayPal credentials');
        return res.json({
          clientToken: 'demo_client_token',
          clientId: 'demo',
          environment: 'sandbox',
          configured: false,
          error: 'Live PayPal credentials not configured'
        });
      }
      
      // Test the credentials by getting an access token
      try {
        const clientToken = await getClientToken();
        if (clientToken === 'demo_client_token') {
          throw new Error('Failed to get valid access token');
        }
      } catch (error) {
        console.error('Failed to validate live PayPal credentials:', error);
        return res.json({
          clientToken: 'demo_client_token',
          clientId: 'demo',
          environment: 'sandbox',
          configured: false,
          error: 'Invalid PayPal credentials for live mode'
        });
      }
    }

    const clientToken = await getClientToken();
    
    // Return both client token and environment info
    res.json({ 
      clientToken,
      clientId: PAYPAL_CLIENT_ID,
      environment,
      configured: true
    });
  } catch (error) {
    console.error('Error loading PayPal config:', error);
    res.json({ 
      clientToken: 'demo_client_token',
      clientId: 'demo',
      environment: 'sandbox',
      configured: false,
      error: error.message
    });
  }
}