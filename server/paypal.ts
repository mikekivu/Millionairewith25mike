
import { Request, Response } from 'express';
import { storage } from './storage';

interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

class PayPalService {
  private async getPayPalConfig(environment: string = 'sandbox') {
    const config = await storage.getPaymentConfiguration('paypal', environment);
    return config;
  }

  private async getAccessToken(config: any): Promise<string> {
    const baseUrl = config.environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data: PayPalAccessTokenResponse = await response.json();
    return data.access_token;
  }

  async createOrder(amount: string, currency: string = 'USD', reference: string): Promise<PayPalOrderResponse> {
    // Get current payment mode
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPayPalConfig(environment);
    if (!config || !config.active) {
      throw new Error('PayPal is not configured or active');
    }

    const accessToken = await this.getAccessToken(config);
    const baseUrl = config.environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: reference,
        amount: {
          currency_code: currency,
          value: amount,
        },
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/paypal/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/paypal/cancel`,
      },
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    return await response.json();
  }

  async captureOrder(orderId: string): Promise<any> {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPayPalConfig(environment);
    if (!config || !config.active) {
      throw new Error('PayPal is not configured or active');
    }

    const accessToken = await this.getAccessToken(config);
    const baseUrl = config.environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to capture PayPal order');
    }

    return await response.json();
  }

  async getClientConfig(): Promise<any> {
    const paymentMode = await storage.getSystemSetting('payment_mode');
    const environment = paymentMode?.value || 'sandbox';

    const config = await this.getPayPalConfig(environment);
    
    if (!config || !config.active || !config.clientId) {
      return {
        configured: false,
        error: 'PayPal is not configured or credentials are missing'
      };
    }

    return {
      clientId: config.clientId,
      environment: config.environment,
      configured: true
    };
  }
}

export const paypalService = new PayPalService();

export async function getPayPalConfig(req: Request, res: Response) {
  try {
    const config = await paypalService.getClientConfig();
    res.json(config);
  } catch (error) {
    console.error('PayPal config error:', error);
    res.status(500).json({ 
      configured: false, 
      error: 'Failed to get PayPal configuration' 
    });
  }
}

export async function createPayPalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, reference, description, userId, type } = req.body;

    if (!amount || !reference) {
      return res.status(400).json({ error: 'Amount and reference are required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create a pending transaction record first
    const { storage } = await import('./storage');
    await storage.createTransaction({
      userId,
      type: type || 'deposit',
      amount: amount.toString(),
      currency: currency || 'USD',
      status: 'pending',
      paymentMethod: 'paypal',
      transactionDetails: description || `PayPal ${type || 'deposit'}`,
      description: description || `PayPal ${type || 'deposit'} of ${amount} ${currency || 'USD'}`,
      reference
    });

    const order = await paypalService.createOrder(amount, currency, reference);
    
    // Extract the approval URL from PayPal's response
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    
    res.json({
      ...order,
      approvalUrl
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create order' });
  }
}

export async function capturePayPalOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await paypalService.captureOrder(orderId);
    res.json(result);
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to capture order' });
  }
}

export async function handlePayPalSuccess(req: Request, res: Response) {
  const { token } = req.query;
  const frontendUrl = `${req.protocol}://${req.get('host')}`;
  
  if (token) {
    try {
      // Find the transaction by PayPal order ID
      const transaction = await storage.getTransactionByReference(token as string);
      
      if (transaction) {
        // Update transaction status to completed
        await storage.updateTransaction(transaction.id, { 
          status: 'completed',
          transactionDetails: `PayPal payment completed. Order ID: ${token}`
        });

        // Add money to user's wallet
        await storage.updateUserWallet(transaction.userId, transaction.amount, 'add');

        // Create notification
        await storage.createNotification({
          userId: transaction.userId,
          title: "Deposit Successful",
          message: `Your PayPal deposit of ${transaction.currency} ${transaction.amount} has been completed successfully`,
          type: "deposit_completed",
          entityId: transaction.id,
          entityType: "transaction",
          link: "/dashboard/wallet"
        });

        res.redirect(`${frontendUrl}/dashboard/wallet?payment=paypal&status=success&amount=${transaction.amount}`);
      } else {
        res.redirect(`${frontendUrl}/dashboard/wallet?payment=paypal&status=error&message=transaction_not_found`);
      }
    } catch (error) {
      console.error('PayPal success handling error:', error);
      res.redirect(`${frontendUrl}/dashboard/wallet?payment=paypal&status=error&message=processing_failed`);
    }
  } else {
    res.redirect(`${frontendUrl}/dashboard/wallet?payment=paypal&status=error&message=invalid_token`);
  }
}

export async function handlePayPalCancel(req: Request, res: Response) {
  const frontendUrl = `${req.protocol}://${req.get('host')}`;
  res.redirect(`${frontendUrl}/dashboard/wallet?payment=paypal&status=cancelled`);
}
