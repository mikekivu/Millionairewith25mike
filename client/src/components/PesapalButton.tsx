import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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

export default function PesapalButton(props: PesapalButtonProps) {
  return (
    <Button
      disabled
      className="w-full bg-gray-400 cursor-not-allowed"
    >
      <AlertTriangle className="mr-2 h-4 w-4" />
      Payment Services Disabled
    </Button>
  );
}