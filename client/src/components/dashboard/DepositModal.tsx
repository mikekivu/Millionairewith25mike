import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CreditCard, Copy, CheckCircle, DollarSign, Bitcoin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// PayPal integration removed
import CryptoPaymentButton from '@/components/CryptoPaymentButton';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), { message: "Amount must be a number" })
    .refine((val) => parseFloat(val) > 0, { message: "Amount must be greater than zero" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

export default function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'processing'>('form');
  const [depositData, setDepositData] = useState<any>(null);
  const [paymentTab, setPaymentTab] = useState('crypto');

  // Fetch available payment methods
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['/api/payment-settings'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Create deposit request mutation
  const depositMutation = useMutation({
    mutationFn: async (data: DepositFormValues) => {
      const response = await apiRequest('POST', '/api/user/deposits', {
        ...data,
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
      paymentMethod: '',
    },
  });

  const onSubmit = (values: DepositFormValues) => {
    depositMutation.mutate(values);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The address has been copied to your clipboard.",
      });
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    form.setValue('paymentMethod', value);
    if (value === 'paypal') {
      setPaymentTab('paypal');
    } else if (value === 'usdt_trc20') {
      setPaymentTab('crypto');
    } else {
      setPaymentTab('bank');
    }
  };

  const handleResetForm = () => {
    setStep('form');
    setDepositData(null);
    form.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleResetForm();
    }, 300); // Reset after close animation
  };

  const selectedMethod = Array.isArray(paymentMethods) 
    ? paymentMethods.find((method: any) => method.method === form.getValues().paymentMethod)
    : undefined;

  const renderPaymentInstructions = () => {
    switch (paymentTab) {
      case 'crypto':
        return (
          <CryptoPaymentButton 
            amount={form.getValues().amount}
            walletAddress={selectedMethod?.credentials || 'TXxAb5Cdef1ghJklMnoPQr2sTu3vWXyZ4aBcDe5f'}
            currency="USDT"
            onSuccess={handleClose}
          />
        );
      
      // PayPal integration removed
      
      case 'bank':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Please include your transaction ID as reference when making the bank transfer. Your deposit will be processed once we've verified the payment.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Bank Details:</p>
              <div className="p-3 bg-gray-100 rounded-md">
                <pre className="text-xs whitespace-pre-wrap">
                  {selectedMethod?.credentials || 
                   `Bank Name: Example Bank
Account Name: MillionaireWith$25 Ltd
Account Number: 1234567890
Sort Code: 12-34-56
Reference: DEP-${Date.now().toString().substring(8)}`}
                </pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard(selectedMethod?.credentials || '')}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Details
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Amount to Transfer:</p>
              <p className="text-lg font-bold">{formatCurrency(parseFloat(form.getValues().amount), 'USDT')}</p>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Instructions:</p>
              <p>{selectedMethod?.instructions || 'Please transfer the exact amount using the bank details provided. Include your transaction ID as the reference. Your deposit will be processed within 1-2 business days.'}</p>
            </div>
          </div>
        );
      
      default:
        return null;
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USDT)</FormLabel>
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
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={handlePaymentMethodChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingPaymentMethods ? (
                              <SelectItem value="loading" disabled>Loading payment methods...</SelectItem>
                            ) : paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
                              paymentMethods.map((method: any) => (
                                <SelectItem key={method.id} value={method.method}>
                                  {method.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No payment methods available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
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
        ) : (
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
              
              <Tabs defaultValue={paymentTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="crypto" disabled={form.getValues().paymentMethod !== 'usdt_trc20'}>
                    <Bitcoin className="h-4 w-4 mr-2" />
                    USDT TRC20
                  </TabsTrigger>
                  <TabsTrigger value="bank" disabled={form.getValues().paymentMethod !== 'bank_transfer'}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Bank
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={paymentTab}>
                  {renderPaymentInstructions()}
                </TabsContent>
              </Tabs>
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
        )}
      </DialogContent>
    </Dialog>
  );
}