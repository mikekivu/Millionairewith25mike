
import { Request, Response } from 'express';
import { storage } from './storage';
import { nanoid } from 'nanoid';

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: any;
  message?: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  message?: string;
}

class PesapalService {
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getPesapalConfig(environment: string = 'sandbox') {
    const config = await storage.getPaymentConfiguration('pesapal', environment);
    return config;
  }

  private async authenticate(config: any): Promise<string> {
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken;
    }

    const baseUrl = config.environment === 'live' 
      ? 'https://pay.pesapal.com/v3/api' 
      : 'https://cybqa.pesapal.com/pesapalv3/api';

    const response = await fetch(`${baseUrl}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Pesapal');
    }

    const data: PesapalAuthResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.message || 'Pesapal authentication failed');
    }

    this.authToken = data.token;
    this.tokenExpiry = new Date(data.expiryDate);
    
    return data.token;
  }

  async createOrder(amount: string, currency: string, email: string, reference: string, userId: number): Promise<PesapalOrderResponse> {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPesapalConfig(environment);
    if (!config || !config.active) {
      throw new Error('Pesapal is not configured or active');
    }

    const token = await this.authenticate(config);
    const baseUrl = config.environment === 'live' 
      ? 'https://pay.pesapal.com/v3/api' 
      : 'https://cybqa.pesapal.com/pesapalv3/api';

    const user = await storage.getUser(userId);
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/pesapal/callback`;

    const orderData: PesapalOrderRequest = {
      id: reference,
      currency: currency,
      amount: parseFloat(amount),
      description: `Deposit to wallet - ${amount} ${currency}`,
      callback_url: callbackUrl,
      notification_id: config.ipnId || '',
      billing_address: {
        email_address: email,
        phone_number: user?.phoneNumber || '',
        country_code: user?.country || 'KE',
        first_name: user?.firstName || '',
        last_name: user?.lastName || '',
      },
    };

    const response = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create Pesapal order');
    }

    const result: PesapalOrderResponse = await response.json();
    
    if (result.error) {
      throw new Error(result.message || 'Pesapal order creation failed');
    }

    return result;
  }

  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPesapalConfig(environment);
    if (!config || !config.active) {
      throw new Error('Pesapal is not configured or active');
    }

    const token = await this.authenticate(config);
    const baseUrl = config.environment === 'live' 
      ? 'https://pay.pesapal.com/v3/api' 
      : 'https://cybqa.pesapal.com/pesapalv3/api';

    const response = await fetch(`${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get transaction status');
    }

    return await response.json();
  }

  async registerIPN(url: string): Promise<any> {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPesapalConfig(environment);
    if (!config || !config.active) {
      throw new Error('Pesapal is not configured or active');
    }

    const token = await this.authenticate(config);
    const baseUrl = config.environment === 'live' 
      ? 'https://pay.pesapal.com/v3/api' 
      : 'https://cybqa.pesapal.com/pesapalv3/api';

    const response = await fetch(`${baseUrl}/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: url,
        ipn_notification_type: 'GET',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register IPN');
    }

    return await response.json();
  }
}

export const pesapalService = new PesapalService();

export async function createPesapalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, email, reference, userId } = req.body;

    if (!amount || !email || !reference || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await pesapalService.createOrder(amount, currency || 'USD', email, reference, userId);
    res.json(order);
  } catch (error) {
    console.error('Pesapal order creation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create order' });
  }
}

export async function handlePesapalCallback(req: Request, res: Response) {
  const { OrderTrackingId, OrderMerchantReference } = req.query;
  const frontendUrl = `${req.protocol}://${req.get('host')}`;

  if (!OrderTrackingId) {
    return res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=error&message=missing_order_id`);
  }

  try {
    // Get transaction status from Pesapal
    const status = await pesapalService.getTransactionStatus(OrderTrackingId as string);
    
    // Find the transaction in our database
    const transaction = await storage.getTransactionByReference(OrderMerchantReference as string || OrderTrackingId as string);
    
    if (!transaction) {
      return res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=error&message=transaction_not_found`);
    }

    if (status.payment_status_description === 'Completed') {
      // Update transaction status
      await storage.updateTransaction(transaction.id, { 
        status: 'completed',
        transactionDetails: `Pesapal payment completed. Tracking ID: ${OrderTrackingId}`
      });

      // Add money to user's wallet
      await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');

      // Create notification
      await storage.createNotification({
        userId: transaction.userId,
        title: "Deposit Successful",
        message: `Your Pesapal deposit of ${transaction.currency} ${transaction.amount} has been completed successfully`,
        type: "deposit_completed",
        entityId: transaction.id,
        entityType: "transaction",
        link: "/dashboard/wallet"
      });

      res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=success&amount=${transaction.amount}`);
    } else if (status.payment_status_description === 'Failed') {
      await storage.updateTransaction(transaction.id, { 
        status: 'failed',
        transactionDetails: `Pesapal payment failed. Tracking ID: ${OrderTrackingId}`
      });

      res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=failed&message=payment_failed`);
    } else {
      res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=pending&message=payment_processing`);
    }
  } catch (error) {
    console.error('Pesapal callback error:', error);
    res.redirect(`${frontendUrl}/dashboard/wallet?payment=pesapal&status=error&message=processing_failed`);
  }
}

export async function handlePesapalIPN(req: Request, res: Response) {
  try {
    const { OrderTrackingId, OrderMerchantReference } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).json({ error: 'Missing OrderTrackingId' });
    }

    // Get transaction status
    const status = await pesapalService.getTransactionStatus(OrderTrackingId as string);
    
    // Find and update transaction
    const transaction = await storage.getTransactionByReference(OrderMerchantReference as string || OrderTrackingId as string);
    
    if (transaction && status.payment_status_description === 'Completed' && transaction.status === 'pending') {
      await storage.updateTransaction(transaction.id, { 
        status: 'completed',
        transactionDetails: `Pesapal IPN confirmation. Tracking ID: ${OrderTrackingId}`
      });

      await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');

      await storage.createNotification({
        userId: transaction.userId,
        title: "Deposit Confirmed",
        message: `Your Pesapal deposit of ${transaction.currency} ${transaction.amount} has been confirmed`,
        type: "deposit_completed",
        entityId: transaction.id,
        entityType: "transaction",
        link: "/dashboard/wallet"
      });
    }

    res.status(200).json({ message: 'IPN processed successfully' });
  } catch (error) {
    console.error('Pesapal IPN error:', error);
    res.status(500).json({ error: 'IPN processing failed' });
  }
}

export async function getPesapalTransactionStatus(req: Request, res: Response) {
  try {
    const { orderTrackingId } = req.params;

    if (!orderTrackingId) {
      return res.status(400).json({ error: 'Order tracking ID is required' });
    }

    const status = await pesapalService.getTransactionStatus(orderTrackingId);
    res.json(status);
  } catch (error) {
    console.error('Pesapal status check error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get status' });
  }
}
