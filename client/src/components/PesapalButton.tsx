
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Loader2 } from 'lucide-react';

interface PesapalButtonProps {
  amount: string;
  currency: string;
  description?: string;
  userEmail: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function PesapalButton({
  amount,
  currency,
  description,
  userEmail,
  userPhone,
  userFirstName,
  userLastName,
  onSuccess,
  onError,
  disabled
}: PesapalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      const error = "Invalid amount";
      onError?.(error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (!userEmail) {
      const error = "Email is required for payment";
      onError?.(error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        amount: parseFloat(amount),
        currency: currency || 'KES',
        description: description || 'Wallet Deposit',
        email: userEmail,
        phone: userPhone,
        firstName: userFirstName,
        lastName: userLastName,
      };

      const response = await apiRequest('POST', '/api/pesapal/order', orderPayload);
      
      if (!response.ok) {
        throw new Error('Failed to create Pesapal order');
      }

      const orderData = await response.json();

      if (orderData.redirect_url) {
        // Open Pesapal payment page in a new window
        const paymentWindow = window.open(
          orderData.redirect_url,
          'pesapal_payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
          throw new Error('Please allow popups for this site to complete payment');
        }

        // Monitor the payment window
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            setLoading(false);
            
            // Check payment status after window is closed
            checkPaymentStatus(orderData.order_tracking_id);
          }
        }, 1000);

        // Store order data for success callback
        onSuccess?.(orderData);
      } else {
        throw new Error('Invalid response from Pesapal');
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const checkPaymentStatus = async (orderTrackingId: string) => {
    try {
      const response = await apiRequest('GET', `/api/pesapal/status/${orderTrackingId}`);
      const statusData = await response.json();

      if (statusData.status === 1) { // Completed
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
      } else if (statusData.status === 2) { // Failed
        toast({
          title: "Payment Failed",
          description: "Your payment was not completed. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Pending",
          description: "Your payment is being processed. You will be notified once it's complete.",
        });
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to verify payment status. Please contact support if you completed the payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay with Pesapal
        </>
      )}
    </Button>
  );
}
