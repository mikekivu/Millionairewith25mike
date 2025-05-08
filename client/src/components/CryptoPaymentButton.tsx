import React, { useState } from "react";
import { Bitcoin, Copy, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CryptoPaymentButtonProps {
  amount: string;
  walletAddress: string;
  currency?: string;
  onSuccess?: () => void;
}

export default function CryptoPaymentButton({
  amount,
  walletAddress,
  currency = "USDT",
  onSuccess
}: CryptoPaymentButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The address has been copied to your clipboard.",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  const handleManualConfirmation = () => {
    // In a production environment, this would trigger a backend check
    // Here we're just simulating the user confirming they've sent the payment
    toast({
      title: "Payment Notification Sent",
      description: "We'll verify your payment and update your account shortly.",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Please send only {currency} TRC20 to this address. Sending any other cryptocurrency may result in permanent loss.
        </AlertDescription>
      </Alert>
      
      <div className="p-5 border border-yellow-200 rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bitcoin className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800">{currency} TRC20 Payment</span>
          </div>
          <div className="text-sm text-yellow-600">
            Amount: <span className="font-semibold">{amount} {currency}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-1 text-gray-700">Wallet Address:</p>
          <div className="flex items-center p-3 bg-white rounded-md border border-yellow-200">
            <code className="text-xs flex-1 break-all text-gray-800">
              {walletAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletAddress)}
              className={copied ? "text-green-600" : "text-yellow-600"}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-1 text-gray-700">Amount to Send:</p>
          <div className="flex items-center p-3 bg-white rounded-md border border-yellow-200">
            <p className="text-sm text-gray-800">{amount} {currency}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(amount)}
              className="text-yellow-600"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-yellow-100 p-3 rounded text-sm text-yellow-800 mb-4">
          <p className="font-medium">Instructions:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>Copy the wallet address above</li>
            <li>Open your TRC20 wallet application</li>
            <li>Send exactly {amount} {currency} to the address</li>
            <li>Once sent, click the button below to inform us</li>
            <li>Your deposit will be processed after blockchain confirmation</li>
          </ol>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
          onClick={handleManualConfirmation}
        >
          I've Sent the Payment
        </Button>
      </div>
    </div>
  );
}