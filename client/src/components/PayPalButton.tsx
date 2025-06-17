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
        console.log('PayPal config received:', data);

        // Check if PayPal is properly configured
        if (!data.configured || data.error) {
          console.warn('PayPal not properly configured:', data.error || 'Unknown error');
          onError(data.error || 'PayPal not configured properly');
          return;
        }

        // Validate client ID exists and is not demo
        if (!data.clientId || data.clientId === 'demo') {
          console.warn('Invalid PayPal client ID');
          onError('PayPal not configured properly');
          return;
        }

        // The backend should return both clientToken and environment info
        setPaypalConfig({
          clientId: data.clientId,
          environment: data.environment || 'sandbox'
        });
      })
      .catch(error => {
        console.error('Failed to load PayPal config:', error);
        onError('Failed to load PayPal configuration');
      });
  }, [onError]);

  useEffect(() => {
    if (!paypalConfig) return;

    console.log('Loading PayPal SDK with config:', paypalConfig);

    // Remove any existing PayPal scripts to avoid conflicts
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
      delete window.paypal; // Clear the global PayPal object
    }

    // Validate client ID
    if (!paypalConfig.clientId || paypalConfig.clientId === 'demo') {
      console.error('Invalid PayPal client ID');
      onError('PayPal client ID not configured');
      return;
    }

    // Load PayPal SDK with the correct environment
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.clientId}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      initPayPalButton();
    };
    script.onerror = (error) => {
      console.error('Failed to load PayPal SDK:', error);
      onError('Failed to load PayPal SDK');
    };
    document.body.appendChild(script);

    function initPayPalButton() {
      if (!window.paypal) {
        console.error('PayPal SDK not available');
        onError('PayPal SDK not loaded');
        return;
      }

      if (!paypalRef.current) {
        console.error('PayPal container not available');
        return;
      }

      try {
        // Clear any existing buttons
        paypalRef.current.innerHTML = '';

        console.log('Initializing PayPal button with amount:', amount, 'currency:', currency);

        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Creating PayPal order...');
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
              console.log('PayPal payment approved, capturing order...');
              const details = await actions.order.capture();
              console.log('PayPal order captured successfully:', details);
              onSuccess(details);
            } catch (error) {
              console.error('PayPal capture failed:', error);
              const errorMessage = error?.message || error?.toString() || "PayPal payment failed";
              onError(errorMessage);
            }
          },
          onError: (error: any) => {
            console.error('PayPal button error:', error);
            const errorMessage = error?.message || error?.toString() || "PayPal payment failed";
            onError(errorMessage);
          },
          onCancel: (data: any) => {
            console.log('PayPal payment cancelled:', data);
            onError('Payment cancelled by user');
          }
        }).render(paypalRef.current);
      } catch (error) {
        console.error('Failed to initialize PayPal button:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize PayPal button';
        onError(errorMessage);
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