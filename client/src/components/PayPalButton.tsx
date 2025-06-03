
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  userId: number;
  type?: 'deposit' | 'withdrawal';
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({ 
  amount, 
  currency, 
  intent, 
  userId, 
  type = 'deposit',
  onSuccess,
  onError 
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayPalClick = async () => {
    try {
      setLoading(true);

      // Create PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          intent,
          userId,
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      // Find approval URL
      const approvalUrl = data.links?.find((link: any) => link.rel === 'approve')?.href;
      
      if (approvalUrl && approvalUrl !== '#') {
        // Redirect to PayPal for real payments
        window.location.href = approvalUrl;
      } else {
        // Demo mode - simulate payment
        toast({
          title: "Demo Mode",
          description: `PayPal ${type} of ${currency} ${amount} would be processed here.`,
        });

        // Simulate successful payment after 2 seconds
        setTimeout(async () => {
          try {
            const captureResponse = await fetch(`/api/paypal/capture-order/${data.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });

            const captureData = await captureResponse.json();

            if (captureResponse.ok) {
              toast({
                title: "Payment Successful",
                description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${currency} ${amount} completed successfully.`,
              });
              onSuccess?.(captureData);
            } else {
              throw new Error(captureData.error || 'Payment capture failed');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            toast({
              title: "Payment Failed",
              description: errorMessage,
              variant: "destructive",
            });
            onError?.(errorMessage);
          }
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalClick}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Processing...' : `Pay with PayPal - ${currency} ${amount}`}
    </Button>
  );
}
