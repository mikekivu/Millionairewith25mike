import { Request, Response } from 'express';

export async function createPesapalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, email, description } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number.",
      });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Simulate order creation
    const orderId = `PESAPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      order_tracking_id: orderId,
      merchant_reference: orderId,
      redirect_url: `#`,
      status: "pending",
      orderId: orderId
    });
  } catch (error) {
    console.error("Failed to create Pesapal order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function handlePesapalCallback(req: Request, res: Response) {
  try {
    const { OrderTrackingId } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).json({ error: "Missing OrderTrackingId" });
    }

    const frontendUrl = `${req.protocol}://${req.get('host')}`;
    const redirectUrl = `${frontendUrl}/dashboard/wallet?payment=pesapal&status=completed&tracking_id=${OrderTrackingId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Failed to handle Pesapal callback:", error);
    res.status(500).json({ error: "Failed to process callback." });
  }
}

export async function handlePesapalIPN(req: Request, res: Response) {
  try {
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

    res.json({
      status: 1, // Completed
      payment_method: "pesapal",
      amount: "100.00",
      currency: "KES"
    });
  } catch (error) {
    console.error("Failed to get Pesapal transaction status:", error);
    res.status(500).json({ error: "Failed to get transaction status." });
  }
}