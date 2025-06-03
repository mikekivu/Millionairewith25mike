import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
}

export default function PayPalButton({ amount, currency, intent }: PayPalButtonProps) {
  const handlePayPalClick = () => {
    alert(`PayPal payment of ${amount} ${currency} would be processed here.`);
  };

  return (
    <Button
      onClick={handlePayPalClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Pay with PayPal - {currency} {amount}
    </Button>
  );
}