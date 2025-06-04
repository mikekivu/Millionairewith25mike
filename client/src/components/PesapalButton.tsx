import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PesapalButtonProps {
  amount: string;
  currency: string;
  description?: string;
  userEmail: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
  userId: number;
  type?: 'deposit' | 'withdrawal';
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function PesapalButton({
  amount,
  currency,
  description,
  userEmail,
  userId,
  type = 'deposit',
  onSuccess,
  onError,
  disabled
}: PesapalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePesapalClick = async () => {
    try {
      setLoading(true);

      // Create Pesapal order
      const response = await fetch('/api/pesapal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          email: userEmail,
          description: description || `${type === 'deposit' ? 'Wallet Deposit' : 'Wallet Withdrawal'}`,
          userId,
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Pesapal order');
      }

      if (data.demo_mode) {
        // Demo mode
        toast({
          title: "Demo Mode",
          description: `Pesapal ${type} of ${currency} ${amount} would be processed here.`,
        });

        // Simulate successful payment after 2 seconds
        setTimeout(() => {
          toast({
            title: "Payment Successful",
            description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${currency} ${amount} completed successfully.`,
          });
          onSuccess?.(data);
        }, 2000);
      } else if (data.redirect_url) {
        // Real Pesapal payment - redirect to payment page
        toast({
          title: "Redirecting to Pesapal",
          description: "You will be redirected to complete your payment...",
        });
        
        // Small delay to show the toast before redirecting
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 1000);
      } else {
        throw new Error('Invalid response from Pesapal API');
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
      onClick={handlePesapalClick}
      disabled={disabled || loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Processing...' : `Pay with Pesapal - ${currency} ${amount}`}
    </Button>
  );
}