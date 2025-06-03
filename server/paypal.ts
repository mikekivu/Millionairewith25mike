import { Request, Response } from "express";

export async function getClientToken() {
  return "demo_client_token";
}

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number.",
      });
    }

    // Simulate order creation
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      id: orderId,
      status: "CREATED",
      links: [
        {
          href: `#`,
          rel: "approve",
          method: "REDIRECT"
        }
      ]
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;

    // Simulate order capture
    res.status(200).json({
      id: orderID,
      status: "COMPLETED",
      payment_source: {
        paypal: {}
      }
    });
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  const clientToken = await getClientToken();
  res.json({
    clientToken,
  });
}