
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  description?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function PayPalButton(props: PayPalButtonProps) {
  return (
    <Button
      disabled
      className="w-full bg-gray-400 cursor-not-allowed"
    >
      <AlertTriangle className="mr-2 h-4 w-4" />
      PayPal Services Disabled
    </Button>
  );
}
