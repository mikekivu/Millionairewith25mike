import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, Copy, CheckCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import PesapalButton from '@/components/PesapalButton';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// USDT deposit amounts should match the Matrix Board levels
const MATRIX_LEVELS = [
  { level: 1, amount: "25", income: "200", reward: "Health Product" },
  { level: 2, amount: "100", income: "800", reward: "Mobile phone" },
  { level: 3, amount: "500", income: "4000", reward: "Tablet" },
  { level: 4, amount: "1000", income: "8000", reward: "iPad" },
  { level: 5, amount: "4000", income: "32000", reward: "Laptop" },
  { level: 6, amount: "8000", income: "64000", reward: "Holiday vacation" }
];

const depositFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), { message: "Amount must be a number" })
    .refine((val) => parseFloat(val) > 0, { message: "Amount must be greater than zero" })
    .refine(
      (val) => {
        const amount = parseFloat(val);
        // Check if amount matches any of the Matrix Board levels
        return MATRIX_LEVELS.some(level => parseFloat(level.amount) === amount);
      },
      { message: "Amount must be one of: 25, 100, 500, 1000, 4000, or 8000 USDT" }
    ),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

export default function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'processing' | 'pesapal'>('form');
  const [depositData, setDepositData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('TUt1RB8XL91QZeEPrY62QGYvM3raCUUJJb'); // Default USDT TRC20 wallet address
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('usdt_trc20');

  // Fetch USDT TRC20 payment setting
  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/payment-settings'],
  });

  useEffect(() => {
    if (Array.isArray(paymentSettings) && paymentSettings.length > 0) {
      const usdtMethod = paymentSettings.find((method: any) => method.method === 'usdt_trc20');
      if (usdtMethod && usdtMethod.credentials) {
        setWalletAddress(usdtMethod.credentials);
      }
    }
  }, [paymentSettings]);

  // Create deposit request mutation
  const depositMutation = useMutation({
    mutationFn: async (data: DepositFormValues) => {
      const response = await apiRequest('POST', '/api/user/deposits', {
        ...data,
        paymentMethod: 'usdt_trc20',
        currency: 'USDT',
        status: 'pending',
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDepositData(data);
      setStep('processing');
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate deposit",
        variant: "destructive",
      });
    },
  });

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'usdt_trc20',
    },
  });

  const onSubmit = (values: DepositFormValues) => {
    if (values.paymentMethod === 'pesapal') {
      setStep('pesapal');
    } else {
      depositMutation.mutate(values);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The address has been copied to your clipboard.",
      });
    });
  };

  const handleResetForm = () => {
    setStep('form');
    setDepositData(null);
    setSelectedPaymentMethod('usdt_trc20');
    form.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleResetForm();
    }, 300); // Reset after close animation
  };

  const getPaymentInstructions = (method: string) => {
    const paymentMethod = paymentSettings?.find((pm: any) => pm.method === method);
    if (!paymentMethod) return "Please select a payment method to see instructions.";

    return paymentMethod.instructions || "No specific instructions provided.";
  };

  const getPaymentCredentials = (method: string) => {
    const paymentMethod = paymentSettings?.find((pm: any) => pm.method === method);
    if (!paymentMethod) return "";

    return paymentMethod.credentials || "";
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paypal':
        return 'PayPal Email Address';
      case 'gpay':
        return 'Google Pay Phone/Email';
      case 'apple_pay':
        return 'Apple Pay Email/Phone';
      case 'cashapp':
        return 'Cash App Tag';
      case 'bank_transfer':
        return 'Bank Account Details';
      case 'usdt_trc20':
        return 'USDT TRC20 Wallet Address';
      default:
        return 'Payment Details';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Add funds to your wallet to start investing
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          className="grid grid-cols-1 gap-3"
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedPaymentMethod(value);
                          }}
                          defaultValue={field.value}
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="usdt_trc20" id="usdt" />
                            <Label htmlFor="usdt" className="flex-1 cursor-pointer">
                              <div className="font-medium">USDT TRC20</div>
                              <div className="text-sm text-gray-500">Pay with USDT on TRON network</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="pesapal" id="pesapal" />
                            <Label htmlFor="pesapal" className="flex-1 cursor-pointer">
                              <div className="font-medium">Pesapal (Mobile Money)</div>
                              <div className="text-sm text-gray-500">M-Pesa, Airtel Money, T-Kash, Cards</div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({selectedPaymentMethod === 'pesapal' ? 'KES' : 'USDT'})</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input 
                            placeholder="100.00" 
                            {...field} 
                            type="number" 
                            step="1" 
                            min="1"
                            className="pl-9" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      {selectedPaymentMethod === 'usdt_trc20' && (
                        <div className="pt-2">
                          <RadioGroup 
                            className="grid grid-cols-3 gap-2"
                            onValueChange={(value) => form.setValue('amount', value)}
                            defaultValue={field.value}
                          >
                            {MATRIX_LEVELS.map((level) => (
                              <div key={level.level} className="flex items-center space-x-2">
                                <RadioGroupItem value={level.amount} id={`level-${level.level}`} />
                                <Label htmlFor={`level-${level.level}`}>{level.amount} USDT</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={depositMutation.isPending}>
                    {depositMutation.isPending ? "Processing..." : "Continue"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : step === 'processing' ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Deposit</DialogTitle>
              <DialogDescription>
                Follow the instructions below to complete your deposit
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{depositData?.transaction?.id || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{formatCurrency(parseFloat(form.getValues().amount), 'USDT')}</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Please send the exact amount to the USDT TRC20 wallet address below. Your deposit will be processed once confirmed on the blockchain.
                </AlertDescription>
              </Alert>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">USDT TRC20 Wallet Address:</p>
                      <div className="p-3 bg-gray-100 rounded-md flex items-center justify-between">
                        <div className="break-all text-sm">{walletAddress}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(walletAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Amount to Send:</p>
                      <p className="text-lg font-bold">{formatCurrency(parseFloat(form.getValues().amount), 'USDT')}</p>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Send <strong>only USDT</strong> on the <strong>TRC20 network</strong>.</li>
                        <li>Include your transaction ID in the memo/reference field if possible.</li>
                        <li>After payment, contact support if your deposit isn't credited within 24 hours.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleResetForm}>
                Make Another Deposit
              </Button>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : step === 'pesapal' ? (
          <>
            <DialogHeader>
              <DialogTitle>Pay with Pesapal</DialogTitle>
              <DialogDescription>
                Complete your payment using M-Pesa, Airtel Money, T-Kash, or card
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{form.getValues().amount} KES</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">Pesapal</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Secure Payment</AlertTitle>
                <AlertDescription>
                  Your payment will be processed securely through Pesapal. You'll be redirected to complete the payment.
                </AlertDescription>
              </Alert>

              <PesapalButton
                amount={form.getValues().amount}
                currency="KES"
                description="Wallet Deposit"
                userEmail="user@example.com" // You'll need to get this from auth context
                onSuccess={(data) => {
                  setDepositData(data);
                  setStep('processing');
                }}
                onError={(error) => {
                  console.error('Pesapal payment error:', error);
                }}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep('form')}>
                Back to Form
              </Button>
              <Button onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}