
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
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

export default function PayPalButton({
  amount,
  currency,
  description,
  userEmail,
  userPhone,
  userFirstName,
  userLastName,
  userId,
  type = 'deposit',
  onSuccess,
  onError,
  disabled = false
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  // Fetch PayPal configuration on mount
  useEffect(() => {
    const fetchPayPalConfig = async () => {
      try {
        const response = await fetch('/api/paypal/config');
        const config = await response.json();
        console.log('PayPal config received:', config);
        setPaypalConfig(config);
        setIsConfigured(config.configured && !config.error);
      } catch (error) {
        console.error('Failed to fetch PayPal config:', error);
        setIsConfigured(false);
      }
    };

    fetchPayPalConfig();
  }, []);

  const handlePayPalPayment = async () => {
    if (!isConfigured) {
      toast({
        title: "PayPal Not Configured",
        description: "PayPal payment is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique reference for this transaction
      const reference = `PP_${Date.now()}_${userId}_${Math.random().toString(36).substr(2, 9)}`;

      // Create PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          reference,
          description: description || `${type} via PayPal`,
          userEmail,
          userPhone,
          userFirstName,
          userLastName,
          userId,
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      if (data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'PayPal payment failed';
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching config
  if (paypalConfig === null) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  // Show error state if not configured
  if (!isConfigured) {
    return (
      <Button 
        disabled 
        className="w-full bg-gray-400 cursor-not-allowed"
        title={paypalConfig?.error || "PayPal is not configured"}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        PayPal Unavailable
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayPalPayment}
      disabled={disabled || isLoading || !isConfigured}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay with PayPal
        </>
      )}
    </Button>
  );
}
