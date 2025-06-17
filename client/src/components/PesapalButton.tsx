
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
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
  userPhone,
  userFirstName,
  userLastName,
  userId,
  type = 'deposit',
  onSuccess,
  onError,
  disabled = false
}: PesapalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pesapalConfig, setPesapalConfig] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  // Fetch Pesapal configuration on mount
  useEffect(() => {
    const fetchPesapalConfig = async () => {
      try {
        const response = await fetch('/api/admin/payment-configurations');
        const configs = await response.json();
        
        // Find active Pesapal configuration
        const pesapalActiveConfig = configs.find((config: any) => 
          config.provider === 'pesapal' && config.active
        );
        
        console.log('Pesapal config received:', pesapalActiveConfig);
        setPesapalConfig(pesapalActiveConfig);
        setIsConfigured(!!pesapalActiveConfig && 
          pesapalActiveConfig.consumerKey && 
          pesapalActiveConfig.consumerSecret
        );
      } catch (error) {
        console.error('Failed to fetch Pesapal config:', error);
        setIsConfigured(false);
      }
    };

    fetchPesapalConfig();
  }, []);

  const handlePesapalPayment = async () => {
    if (!isConfigured) {
      toast({
        title: "Pesapal Not Configured",
        description: "Pesapal payment is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Pesapal order
      const response = await fetch('/api/pesapal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          description: description || `${type} via Pesapal`,
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
        throw new Error(data.error || 'Failed to create Pesapal order');
      }

      if (data.redirect_url) {
        // Redirect to Pesapal for payment
        window.location.href = data.redirect_url;
      } else {
        throw new Error('No redirect URL received from Pesapal');
      }
    } catch (error) {
      console.error('Pesapal payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Pesapal payment failed';
      
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
  if (pesapalConfig === null) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading Pesapal...
      </Button>
    );
  }

  // Show error state if not configured
  if (!isConfigured) {
    return (
      <Button 
        disabled 
        className="w-full bg-gray-400 cursor-not-allowed"
        title="Pesapal is not configured with valid credentials"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Pesapal Unavailable
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePesapalPayment}
      disabled={disabled || isLoading || !isConfigured}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      {isLoading ? (
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
