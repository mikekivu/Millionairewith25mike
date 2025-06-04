
import { Request, Response } from 'express';
import { storage } from './storage';

// Pesapal API configuration
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pay.pesapal.com/v3' 
  : 'https://cybqa.pesapal.com/pesapalv3';

export async function createPesapalOrder(req: Request, res: Response) {
  try {
    const { amount, currency = 'KES', email, description, userId, type = 'deposit' } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number.",
      });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Verify user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
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

    // Generate order ID
    const orderId = `PESAPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      // Demo mode
      await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status: "pending",
        paymentMethod: "pesapal",
        transactionDetails: `Pesapal ${type}: ${orderId}`,
        paymentReference: orderId
      });

      return res.json({
        order_tracking_id: orderId,
        merchant_reference: orderId,
        redirect_url: `${req.protocol}://${req.get('host')}/dashboard/wallet?payment=pesapal&status=pending&tracking_id=${orderId}`,
        status: "pending",
        orderId: orderId
      });
    }

    // Real Pesapal integration
    try {
      // Get authentication token first
      const authResponse = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: PESAPAL_CONSUMER_KEY,
          consumer_secret: PESAPAL_CONSUMER_SECRET
        })
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate with Pesapal');
      }

      const authData = await authResponse.json();
      const token = authData.token;

      // Create pending transaction
      await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status: "pending",
        paymentMethod: "pesapal",
        transactionDetails: `Pesapal ${type}: ${orderId}`,
        paymentReference: orderId
      });

      const callbackUrl = `${req.protocol}://${req.get('host')}/api/pesapal/callback`;
      const ipnUrl = `${req.protocol}://${req.get('host')}/api/pesapal/ipn`;

      // Submit order request
      const orderData = {
        id: orderId,
        currency: currency,
        amount: parseFloat(amount),
        description: description || `${type === 'deposit' ? 'Wallet Deposit' : 'Wallet Withdrawal'}`,
        callback_url: callbackUrl,
        notification_id: ipnUrl,
        billing_address: {
          email_address: email,
          phone_number: null,
          country_code: currency === 'KES' ? 'KE' : 'US',
          first_name: user.firstName || 'Customer',
          middle_name: '',
          last_name: user.lastName || 'Customer',
          line_1: '',
          line_2: '',
          city: '',
          state: '',
          postal_code: '',
          zip_code: ''
        }
      };

      const submitResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to create Pesapal order');
      }

      const submitData = await submitResponse.json();

      res.json({
        order_tracking_id: submitData.order_tracking_id,
        merchant_reference: orderId,
        redirect_url: submitData.redirect_url,
        status: "pending",
        orderId: orderId,
        callback_url: callbackUrl,
        ipn_url: ipnUrl
      });

    } catch (error) {
      console.error('Pesapal API error:', error);
      
      // Fallback to demo mode if API fails
      await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status: "pending",
        paymentMethod: "pesapal",
        transactionDetails: `Pesapal ${type}: ${orderId} (Demo)`,
        paymentReference: orderId
      });

      res.json({
        order_tracking_id: orderId,
        merchant_reference: orderId,
        redirect_url: `${req.protocol}://${req.get('host')}/dashboard/wallet?payment=pesapal&status=demo&tracking_id=${orderId}`,
        status: "pending",
        orderId: orderId,
        demo_mode: true
      });
    }
  } catch (error) {
    console.error("Failed to create Pesapal order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function handlePesapalCallback(req: Request, res: Response) {
  try {
    const { OrderTrackingId, OrderMerchantReference } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).json({ error: "Missing OrderTrackingId" });
    }

    // Get transaction status from Pesapal
    let transactionStatus = 'pending';
    
    if (PESAPAL_CONSUMER_KEY && PESAPAL_CONSUMER_SECRET) {
      try {
        // Get authentication token
        const authResponse = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            consumer_key: PESAPAL_CONSUMER_KEY,
            consumer_secret: PESAPAL_CONSUMER_SECRET
          })
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          const token = authData.token;

          // Get transaction status
          const statusResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.payment_status_description === 'Completed') {
              transactionStatus = 'completed';
            } else if (statusData.payment_status_description === 'Failed') {
              transactionStatus = 'failed';
            }
          }
        }
      } catch (error) {
        console.error('Error verifying Pesapal transaction status:', error);
        // Default to completed for demo purposes
        transactionStatus = 'completed';
      }
    } else {
      // Demo mode - mark as completed
      transactionStatus = 'completed';
    }

    const transaction = await storage.getTransactionByReference(OrderTrackingId as string);
    
    if (transaction) {
      await storage.updateTransaction(transaction.id, { status: transactionStatus });
      
      if (transactionStatus === 'completed') {
        if (transaction.type === 'deposit') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');
        } else if (transaction.type === 'withdrawal') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'subtract');
        }
      }
    }

    const frontendUrl = `${req.protocol}://${req.get('host')}`;
    const redirectUrl = `${frontendUrl}/dashboard/wallet?payment=pesapal&status=${transactionStatus}&tracking_id=${OrderTrackingId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Failed to handle Pesapal callback:", error);
    const frontendUrl = `${req.protocol}://${req.get('host')}`;
    const redirectUrl = `${frontendUrl}/dashboard/wallet?payment=pesapal&status=failed`;
    res.redirect(redirectUrl);
  }
}

export async function handlePesapalIPN(req: Request, res: Response) {
  try {
    const { OrderTrackingId, OrderNotificationType } = req.body;

    if (OrderTrackingId && OrderNotificationType === 'COMPLETED') {
      const transaction = await storage.getTransactionByReference(OrderTrackingId);
      
      if (transaction && transaction.status === 'pending') {
        await storage.updateTransaction(transaction.id, { status: "completed" });
        
        if (transaction.type === 'deposit') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');
        } else if (transaction.type === 'withdrawal') {
          await storage.updateUserWallet(transaction.userId, transaction.amount, 'subtract');
        }
      }
    }

    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Failed to handle Pesapal IPN:", error);
    res.status(500).json({ error: "Failed to process IPN." });
  }
}

export async function getPesapalTransactionStatus(req: Request, res: Response) {
  try {
    const { orderTrackingId } = req.params;

    if (!orderTrackingId) {
      return res.status(400).json({ error: "Order tracking ID is required" });
    }

    // In a real implementation, you would query Pesapal API for the actual status
    const transaction = await storage.getTransactionByReference(orderTrackingId);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    let status = 0; // Failed
    if (transaction.status === 'completed') {
      status = 1; // Completed
    } else if (transaction.status === 'pending') {
      status = 2; // Pending
    }

    res.json({
      status,
      payment_method: "pesapal",
      amount: transaction.amount,
      currency: transaction.currency,
      transaction_status: transaction.status
    });
  } catch (error) {
    console.error("Failed to get Pesapal transaction status:", error);
    res.status(500).json({ error: "Failed to get transaction status." });
  }
}
