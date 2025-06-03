import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, DollarSign, ArrowUpRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

const withdrawFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), { message: "Amount must be a number" })
    .refine((val) => parseFloat(val) > 0, { message: "Amount must be greater than zero" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  transactionDetails: z.string().min(1, { message: "Wallet address or account details are required" }),
});

type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

export default function WithdrawModal({ open, onOpenChange, currentBalance }: WithdrawModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [withdrawalData, setWithdrawalData] = useState<any>(null);

  // Fetch available payment methods
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['/api/payment-settings'],
    staleTime: 60 * 60 * 1000, // 1 hour
    select: (data) => data?.filter((method: any) => method.active),
  });

  // Create withdrawal request mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawFormValues) => {
      const response = await apiRequest('POST', '/api/user/withdrawals', {
        ...data,
        currency: 'USDT',
      });
      return response.json();
    },
    onSuccess: (data) => {
      setWithdrawalData(data);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal request",
        variant: "destructive",
      });
    },
  });

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: '',
      paymentMethod: '',
      transactionDetails: '',
    },
  });

  const selectedAmount = parseFloat(form.watch('amount') || '0');
  const isOverBalance = selectedAmount > currentBalance;

  const onSubmit = (values: WithdrawFormValues) => {
    if (isOverBalance) {
      toast({
        title: "Insufficient balance",
        description: `Your withdrawal amount exceeds your available balance of ${formatCurrency(currentBalance, 'USDT')}`,
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate(values);
  };

  const handleSelectPaymentMethod = (value: string) => {
    form.setValue('paymentMethod', value);
    form.setValue('transactionDetails', '');
  };

  const handleResetForm = () => {
    setStep('form');
    setWithdrawalData(null);
    form.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleResetForm();
    }, 300); // Reset after close animation
  };

  const selectedMethod = paymentMethods?.find((method: any) => 
    method.method === form.getValues().paymentMethod
  );

  const getAddressPlaceholder = () => {
    const method = form.getValues().paymentMethod;
    if (!method) return "Payment details";

    switch (method.toLowerCase()) {
      case 'paypal':
        return "Enter your PayPal email address";
      case 'gpay':
        return "Enter your Google Pay phone number or email";
      case 'apple_pay':
        return "Enter your Apple Pay email or phone number";
      case 'cashapp':
        return "Enter your Cash App tag (e.g., $username)";
      case 'bank_transfer':
        return "Enter your bank account details (Account number, routing number, etc.)";
      case 'usdt_trc20':
        return "Enter your USDT TRC20 wallet address";
      default:
        if (method.toLowerCase().includes('usdt') || method.toLowerCase().includes('crypto')) {
          return "Enter your cryptocurrency wallet address";
        }
        return "Enter your payment details";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Withdraw funds from your wallet to your preferred payment method
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-4">
              <p className="text-sm font-medium">Available Balance:</p>
              <p className="font-bold text-lg">{formatCurrency(currentBalance, 'USDT')}</p>
            </div>

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
                            className={`pl-9 ${isOverBalance ? 'border-red-500' : ''}`} 
                          />
                        </div>
                      </FormControl>
                      {isOverBalance && (
                        <p className="text-sm text-red-500 mt-1">
                          Amount exceeds your available balance
                        </p>
                      )}
                      <FormMessage />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => form.setValue('amount', currentBalance.toString())}
                        className="mt-1"
                      >
                        Use Max
                      </Button>
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
                          onValueChange={handleSelectPaymentMethod}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingPaymentMethods ? (
                              <SelectItem value="loading" disabled>Loading payment methods...</SelectItem>
                            ) : paymentMethods && paymentMethods.length > 0 ? (
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

                {form.getValues().paymentMethod && (
                  <FormField
                    control={form.control}
                    name="transactionDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getAddressPlaceholder()}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`Enter your ${getAddressPlaceholder()}`} 
                            {...field} 
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedMethod && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Withdrawal Information</AlertTitle>
                    <AlertDescription>
                      Minimum withdrawal: {formatCurrency(parseFloat(selectedMethod.minAmount), 'USDT')}<br />
                      Maximum withdrawal: {formatCurrency(parseFloat(selectedMethod.maxAmount), 'USDT')}<br />
                      Processing time: 24-48 hours
                    </AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={withdrawMutation.isPending || isOverBalance || !form.getValues().paymentMethod}
                  >
                    {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Withdrawal Request Submitted</DialogTitle>
              <DialogDescription>
                Your withdrawal request has been successfully submitted
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-semibold">Thank You!</h3>
              <p className="text-center text-gray-500 mt-2">
                Your withdrawal request for {formatCurrency(parseFloat(form.getValues().amount), 'USDT')} has been submitted for processing.
              </p>

              <div className="w-full p-4 bg-gray-50 rounded-md mt-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(form.getValues().amount), 'USDT')}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium">{selectedMethod?.name || form.getValues().paymentMethod}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-medium">{withdrawalData?.transaction?.id || 'Pending'}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-yellow-600">Pending</span>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                  Your withdrawal request will be processed within 24-48 hours. You will receive a notification once it's completed.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleResetForm}>
                Make Another Withdrawal
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