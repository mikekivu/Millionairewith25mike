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
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    // Get PayPal client ID from backend
    fetch('/api/paypal/client-token')
      .then(res => res.json())
      .then(data => {
        if (data.clientId) {
          setClientId(data.clientId);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!clientId) return;

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.async = true;
      script.onload = () => initPayPalButton();
      document.body.appendChild(script);
    } else {
      initPayPalButton();
    }

    function initPayPalButton() {
      if (window.paypal && paypalRef.current) {
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
  }, [amount, currency, onSuccess, onError, clientId]);

  if (!clientId) {
    return <div>Loading PayPal...</div>;
  }

  return <div ref={paypalRef} />;
}