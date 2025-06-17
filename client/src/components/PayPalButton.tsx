
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  description?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  transactionId: string;
}

export default function PayPalButton({
  amount,
  currency = 'USD',
  description = 'Deposit',
  onSuccess,
  onError,
  disabled = false,
  transactionId
}: PayPalButtonProps) {
  const { toast } = useToast();
  const [paypalConfig, setPaypalConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    fetchPayPalConfig();
  }, []);

  const fetchPayPalConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await apiRequest('GET', '/api/paypal/config');
      if (response.ok) {
        const config = await response.json();
        setPaypalConfig(config);
      } else {
        setPaypalConfig({ configured: false, error: 'Failed to fetch configuration' });
      }
    } catch (error) {
      console.error('PayPal config error:', error);
      setPaypalConfig({ configured: false, error: 'Failed to fetch configuration' });
    } finally {
      setConfigLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!paypalConfig?.configured) {
      onError?.('PayPal is not properly configured');
      toast({
        title: "Payment Error",
        description: "PayPal is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create PayPal order
      const orderResponse = await apiRequest('POST', '/api/paypal/create-order', {
        amount: amount,
        currency: currency,
        reference: transactionId
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const orderData = await orderResponse.json();
      
      // Find the approval URL
      const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;
      
      if (!approvalUrl) {
        throw new Error('No approval URL found in PayPal response');
      }

      // Redirect to PayPal for payment
      window.location.href = approvalUrl;

    } catch (error) {
      console.error('PayPal payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (configLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  if (!paypalConfig?.configured) {
    return (
      <Button
        disabled
        className="w-full bg-gray-400 cursor-not-allowed"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        PayPal Not Available
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayPalPayment}
      disabled={disabled || isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          💳 Pay with PayPal
        </>
      )}
    </Button>
  );
}
