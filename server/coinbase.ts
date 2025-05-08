import fetch from "node-fetch";

// Coinbase Commerce API
const API_KEY = process.env.COINBASE_API_KEY || "COINBASE_API_KEY";
const API_BASE = "https://api.commerce.coinbase.com";

interface CoinbaseCharge {
  id: string;
  code: string;
  hosted_url: string;
  created_at: string;
  expires_at: string;
  status: string;
  pricing: {
    local: {
      amount: string;
      currency: string;
    };
  };
}

/**
 * Creates a new charge/payment request in Coinbase
 * 
 * @param amount - Amount in USDT
 * @param referenceId - Reference ID (transaction ID)
 */
export async function createCoinbaseCharge(amount: string, referenceId: string) {
  try {
    const response = await fetch(`${API_BASE}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": API_KEY,
        "X-CC-Version": "2018-03-22"
      },
      body: JSON.stringify({
        name: "RichLance Deposit",
        description: "Deposit to RichLance wallet",
        pricing_type: "fixed_price",
        local_price: {
          amount,
          currency: "USDT"
        },
        metadata: {
          referenceId
        },
        redirect_url: `${process.env.APP_URL || 'http://localhost:5000'}/user/wallet?status=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/user/wallet?status=cancelled`,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coinbase API error:", errorText);
      throw new Error(`Failed to create Coinbase charge: ${errorText}`);
    }

    const data = await response.json();
    return data.data as CoinbaseCharge;
  } catch (error) {
    console.error("Error creating Coinbase charge:", error);
    throw error;
  }
}

/**
 * Checks the status of a Coinbase charge
 * 
 * @param chargeId - Coinbase charge ID
 */
export async function checkCoinbaseCharge(chargeId: string) {
  try {
    const response = await fetch(`${API_BASE}/charges/${chargeId}`, {
      method: "GET",
      headers: {
        "X-CC-Api-Key": API_KEY,
        "X-CC-Version": "2018-03-22"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coinbase API error:", errorText);
      throw new Error(`Failed to check Coinbase charge: ${errorText}`);
    }

    const data = await response.json();
    const charge = data.data as CoinbaseCharge;
    
    // Map Coinbase status to our status
    let status = "pending";
    if (charge.status === "COMPLETED" || charge.status === "CONFIRMED") {
      status = "completed";
    } else if (charge.status === "EXPIRED" || charge.status === "CANCELED") {
      status = "rejected";
    }
    
    return {
      id: charge.id,
      status,
      amount: charge.pricing.local.amount,
      currency: charge.pricing.local.currency,
      hostedUrl: charge.hosted_url,
      createdAt: charge.created_at,
      expiresAt: charge.expires_at
    };
  } catch (error) {
    console.error("Error checking Coinbase charge:", error);
    throw error;
  }
}
