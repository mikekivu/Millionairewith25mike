
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  currency?: string;
}

export function PayPalButton({
  amount,
  onSuccess,
  onError,
  currency = 'USD'
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    environment: string;
  } | null>(null);

  useEffect(() => {
    // Get PayPal configuration from backend (includes client ID and environment)
    fetch('/api/paypal/client-token')
      .then(res => res.json())
      .then(data => {
        // The backend should return both clientToken and environment info
        setPaypalConfig({
          clientId: data.clientId || 'demo',
          environment: data.environment || 'sandbox'
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!paypalConfig) return;

    // Remove any existing PayPal scripts to avoid conflicts
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Load PayPal SDK with the correct environment
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.clientId}&currency=${currency}`;
    script.async = true;
    script.onload = () => initPayPalButton();
    document.body.appendChild(script);

    function initPayPalButton() {
      if (window.paypal && paypalRef.current) {
        // Clear any existing buttons
        paypalRef.current.innerHTML = '';
        
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount,
                  currency_code: currency
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess(details);
            } catch (error) {
              onError(error);
            }
          },
          onError: (error: any) => {
            onError(error);
          }
        }).render(paypalRef.current);
      }
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [amount, currency, onSuccess, onError, paypalConfig]);

  if (!paypalConfig) {
    return <div>Loading PayPal...</div>;
  }

  return <div ref={paypalRef} />;
}

export default PayPalButton;
