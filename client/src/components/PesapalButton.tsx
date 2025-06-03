import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

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
  disabled
}: PesapalButtonProps) {
  const handlePesapalClick = () => {
    alert(`Pesapal payment of ${amount} ${currency} would be processed here.`);
  };

  return (
    <Button
      onClick={handlePesapalClick}
      disabled={disabled}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Pay with Pesapal - {currency} {amount}
    </Button>
  );
}