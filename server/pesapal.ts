
import axios from 'axios';
import crypto from 'crypto';
import { Request, Response } from 'express';

interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  sandbox: boolean;
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

class PesapalAPI {
  private config: PesapalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: PesapalConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://cybqa.pesapal.com/pesapalv3/api' 
      : 'https://pay.pesapal.com/v3/api';
  }

  // Get access token for API calls
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/Auth/RequestToken`, {
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.accessToken = response.data.token;
      // Token expires in 5 minutes, refresh 1 minute early
      this.tokenExpiry = new Date(Date.now() + 4 * 60 * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Pesapal access token:', error);
      throw new Error('Failed to authenticate with Pesapal');
    }
  }

  // Register IPN URL for notifications
  async registerIPN(url: string, ipn_notification_type: string = 'GET'): Promise<string> {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.post(`${this.baseUrl}/URLSetup/RegisterIPN`, {
        url,
        ipn_notification_type
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return response.data.ipn_id;
    } catch (error) {
      console.error('Failed to register IPN:', error);
      throw new Error('Failed to register IPN with Pesapal');
    }
  }

  // Submit order request
  async submitOrderRequest(orderData: PesapalOrderRequest): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.post(`${this.baseUrl}/Transactions/SubmitOrderRequest`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to submit order request:', error);
      throw new Error('Failed to create Pesapal order');
    }
  }

  // Get transaction status
  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw new Error('Failed to get transaction status from Pesapal');
    }
  }
}

// Initialize Pesapal API
const pesapalConfig: PesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  sandbox: process.env.NODE_ENV !== 'production'
};

const pesapalAPI = new PesapalAPI(pesapalConfig);

// Pesapal route handlers
export async function createPesapalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, email, phone, firstName, lastName, description } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number.",
      });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get base URL for callbacks
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const orderData: PesapalOrderRequest = {
      id: orderId,
      currency: currency || 'KES',
      amount: parseFloat(amount),
      description: description || 'Wallet Deposit',
      callback_url: `${baseUrl}/api/pesapal/callback`,
      notification_id: '', // Will be set after IPN registration
      billing_address: {
        email_address: email,
        phone_number: phone,
        country_code: 'KE',
        first_name: firstName,
        last_name: lastName,
      }
    };

    // Register IPN if needed (you might want to do this once during setup)
    try {
      const ipnId = await pesapalAPI.registerIPN(`${baseUrl}/api/pesapal/ipn`, 'GET');
      orderData.notification_id = ipnId;
    } catch (ipnError) {
      console.warn('IPN registration failed, continuing without notification_id:', ipnError);
    }

    const result = await pesapalAPI.submitOrderRequest(orderData);

    res.json({
      order_tracking_id: result.order_tracking_id,
      merchant_reference: result.merchant_reference,
      redirect_url: result.redirect_url,
      status: result.status,
      orderId: orderId
    });
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
    const transactionStatus = await pesapalAPI.getTransactionStatus(OrderTrackingId as string);
    
    // Redirect to frontend with status
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? `${req.protocol}://${req.get('host')}`
      : `${req.protocol}://${req.get('host')}`;
    
    const redirectUrl = `${frontendUrl}/dashboard/wallet?payment=pesapal&status=${transactionStatus.status}&tracking_id=${OrderTrackingId}&reference=${OrderMerchantReference}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Failed to handle Pesapal callback:", error);
    res.status(500).json({ error: "Failed to process callback." });
  }
}

export async function handlePesapalIPN(req: Request, res: Response) {
  try {
    const { OrderTrackingId, OrderMerchantReference } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).json({ error: "Missing OrderTrackingId" });
    }

    // Get transaction status from Pesapal
    const transactionStatus = await pesapalAPI.getTransactionStatus(OrderTrackingId as string);
    
    // Update transaction in database based on status
    if (req.session.userId && transactionStatus.status === 1) { // Status 1 means completed
      // Extract user ID from merchant reference or session
      const userId = req.session.userId;
      
      // This would need to be implemented in your storage layer
      // Update the transaction status to completed and credit user's wallet
      console.log(`Pesapal payment completed for user ${userId}, tracking ID: ${OrderTrackingId}`);
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

    const transactionStatus = await pesapalAPI.getTransactionStatus(orderTrackingId);
    
    res.json(transactionStatus);
  } catch (error) {
    console.error("Failed to get Pesapal transaction status:", error);
    res.status(500).json({ error: "Failed to get transaction status." });
  }
}

export { pesapalAPI };
