import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, calculateEndDate } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
  id: number;
  name: string;
  monthlyRate?: string;
  roi?: string;
  minDeposit: string;
  maxDeposit: string;
  durationDays: number;
  description: string;
  features?: string[];
  referralBonus?: string;
}

interface InvestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  currentBalance: number;
}

const investFormSchema = z.object({
  planId: z.string().min(1, { message: "Please select an investment plan" }),
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), { message: "Amount must be a number" })
    .refine((val) => parseFloat(val) > 0, { message: "Amount must be greater than zero" }),
});

type InvestFormValues = z.infer<typeof investFormSchema>;

export default function InvestModal({ open, onOpenChange, plans, currentBalance }: InvestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'plan' | 'amount' | 'confirm' | 'success'>('plan');
  const [investmentData, setInvestmentData] = useState<any>(null);

  // Create investment mutation
  const investMutation = useMutation({
    mutationFn: async (data: InvestFormValues) => {
      const response = await apiRequest('POST', '/api/user/investments', {
        ...data,
        planId: parseInt(data.planId),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setInvestmentData(data);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/user/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create investment",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InvestFormValues>({
    resolver: zodResolver(investFormSchema),
    defaultValues: {
      planId: '',
      amount: '',
    },
  });

  const selectedPlan = plans.find(p => p.id.toString() === form.watch('planId'));
  const selectedAmount = parseFloat(form.watch('amount') || '0');
  const isOverBalance = selectedAmount > currentBalance;

  const onSubmit = (values: InvestFormValues) => {
    if (isOverBalance) {
      toast({
        title: "Insufficient balance",
        description: `Your investment amount exceeds your available balance of ${formatCurrency(currentBalance, 'USDT')}`,
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPlan) {
      const minDeposit = parseFloat(selectedPlan.minDeposit);
      const maxDeposit = parseFloat(selectedPlan.maxDeposit);
      
      if (selectedAmount < minDeposit) {
        toast({
          title: "Invalid amount",
          description: `Minimum investment for this plan is ${formatCurrency(minDeposit, 'USDT')}`,
          variant: "destructive",
        });
        return;
      }
      
      if (selectedAmount > maxDeposit) {
        toast({
          title: "Invalid amount",
          description: `Maximum investment for this plan is ${formatCurrency(maxDeposit, 'USDT')}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step === 'amount') {
      setStep('confirm');
    } else if (step === 'confirm') {
      investMutation.mutate(values);
    }
  };

  const handleSelectPlan = (planId: string) => {
    form.setValue('planId', planId);
    setStep('amount');
  };

  const handleResetForm = () => {
    setStep('plan');
    setInvestmentData(null);
    form.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      handleResetForm();
    }, 300); // Reset after close animation
  };

  const renderPlanSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle>Choose Investment Plan</DialogTitle>
        <DialogDescription>
          Select the investment plan that best fits your strategy
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              form.watch('planId') === plan.id.toString() ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            onClick={() => handleSelectPlan(plan.id.toString())}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant="outline" className="bg-primary-50 text-primary-800">
                  {plan.roi || plan.monthlyRate}% ROI
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Min: {formatCurrency(parseFloat(plan.minDeposit), 'USDT')}</span>
                </li>
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Max: {formatCurrency(parseFloat(plan.maxDeposit), 'USDT')}</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Duration: {plan.durationDays} days</span>
                </li>
                {plan.referralBonus && (
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Referral Bonus: {plan.referralBonus}%</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full" 
                variant={form.watch('planId') === plan.id.toString() ? 'default' : 'outline'}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );

  const renderAmountSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle>Investment Amount</DialogTitle>
        <DialogDescription>
          Enter the amount you want to invest
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex justify-between pb-2">
          <div>
            <p className="font-medium">{selectedPlan?.name}</p>
            <p className="text-sm text-muted-foreground">{selectedPlan?.description}</p>
          </div>
          <Badge variant="outline" className="h-fit bg-primary-50 text-primary-800">
            {selectedPlan?.roi || selectedPlan?.monthlyRate}% ROI
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md mb-4">
          <p className="text-sm">Available Balance:</p>
          <p className="font-bold">{formatCurrency(currentBalance, 'USDT')}</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount (USDT)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        placeholder={selectedPlan?.minDeposit || "100.00"} 
                        {...field} 
                        type="number" 
                        step="1" 
                        min={selectedPlan?.minDeposit}
                        max={selectedPlan?.maxDeposit}
                        className={`pl-9 ${isOverBalance ? 'border-red-500' : ''}`} 
                      />
                    </div>
                  </FormControl>
                  {isOverBalance && (
                    <p className="text-sm text-red-500 mt-1">
                      Amount exceeds your available balance
                    </p>
                  )}
                  <FormDescription className="flex justify-between text-xs">
                    <span>Min: {formatCurrency(parseFloat(selectedPlan?.minDeposit || '0'), 'USDT')}</span>
                    <span>Max: {formatCurrency(parseFloat(selectedPlan?.maxDeposit || '0'), 'USDT')}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedPlan && selectedAmount > 0 && (
              <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium">Investment Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Daily Profit:</div>
                  <div className="font-medium text-right text-green-600">
                    {formatCurrency((selectedAmount * (parseFloat(selectedPlan.roi || selectedPlan.monthlyRate || '0') / 100) / 30), 'USDT')}
                  </div>
                  <div className="text-muted-foreground">Monthly Profit:</div>
                  <div className="font-medium text-right text-green-600">
                    {formatCurrency((selectedAmount * (parseFloat(selectedPlan.roi || selectedPlan.monthlyRate || '0') / 100)), 'USDT')}
                  </div>
                  <div className="text-muted-foreground">Total Return:</div>
                  <div className="font-medium text-right text-green-600">
                    {formatCurrency((selectedAmount * (parseFloat(selectedPlan.roi || selectedPlan.monthlyRate || '0') / 100) / 30 * selectedPlan.durationDays), 'USDT')}
                  </div>
                  <div className="text-muted-foreground">End Date:</div>
                  <div className="font-medium text-right">
                    {calculateEndDate(new Date(), selectedPlan.durationDays).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('plan')}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedAmount || isOverBalance || investMutation.isPending}
              >
                Continue
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );

  const renderConfirmation = () => (
    <>
      <DialogHeader>
        <DialogTitle>Confirm Investment</DialogTitle>
        <DialogDescription>
          Please review and confirm your investment details
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        <div className="rounded-md border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-lg">{selectedPlan?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlan?.description}</p>
            </div>
            <Badge className="bg-primary text-white border-none">
              {selectedPlan?.roi || selectedPlan?.monthlyRate}% ROI
            </Badge>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-muted-foreground">Investment Amount:</div>
            <div className="font-bold text-right">{formatCurrency(selectedAmount, 'USDT')}</div>
            
            <div className="text-muted-foreground">Plan Duration:</div>
            <div className="text-right">{selectedPlan?.durationDays} days</div>
            
            <div className="text-muted-foreground">Daily Profit:</div>
            <div className="text-green-600 font-medium text-right">
              {formatCurrency((selectedAmount * (parseFloat(selectedPlan?.roi || selectedPlan?.monthlyRate || '0') / 100) / 30), 'USDT')}
            </div>
            
            <div className="text-muted-foreground">Total Expected Return:</div>
            <div className="text-green-600 font-medium text-right">
              {formatCurrency((selectedAmount * (parseFloat(selectedPlan?.roi || selectedPlan?.monthlyRate || '0') / 100) / 30 * selectedPlan!.durationDays), 'USDT')}
            </div>
            
            <div className="text-muted-foreground">Start Date:</div>
            <div className="text-right">{new Date().toLocaleDateString()}</div>
            
            <div className="text-muted-foreground">End Date:</div>
            <div className="text-right">{calculateEndDate(new Date(), selectedPlan!.durationDays).toLocaleDateString()}</div>
          </div>
        </div>
        
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Please Note</AlertTitle>
          <AlertDescription>
            Once confirmed, this investment cannot be cancelled. The invested amount will be locked for the entire duration of the investment plan.
          </AlertDescription>
        </Alert>
      </div>
      
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setStep('amount')}
        >
          Back
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={investMutation.isPending}
        >
          {investMutation.isPending ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Investment"
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderSuccess = () => (
    <>
      <DialogHeader>
        <DialogTitle>Investment Successful</DialogTitle>
        <DialogDescription>
          Your investment has been created successfully
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-6 flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        
        <h3 className="text-lg font-semibold">Congratulations!</h3>
        <p className="text-center text-gray-500 mt-2">
          Your investment of {formatCurrency(selectedAmount, 'USDT')} has been successfully created.
        </p>
        
        <div className="w-full p-4 bg-gray-50 rounded-md mt-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Investment Plan:</span>
            <span className="font-medium">{selectedPlan?.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Investment Amount:</span>
            <span className="font-medium">{formatCurrency(selectedAmount, 'USDT')}</span>
          </div>
          <Separator />
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Expected Daily Profit:</span>
            <span className="font-medium text-green-600">
              {formatCurrency((selectedAmount * (parseFloat(selectedPlan?.roi || selectedPlan?.monthlyRate || '0') / 100) / 30), 'USDT')}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between py-2">
            <span className="text-gray-500">End Date:</span>
            <span className="font-medium">{calculateEndDate(new Date(), selectedPlan!.durationDays).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Alert className="mt-4">
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>What's Next?</AlertTitle>
          <AlertDescription>
            Your profits will start accruing daily. You can track the performance of your investment in the investments dashboard.
          </AlertDescription>
        </Alert>
      </div>
      
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={handleResetForm}>
          New Investment
        </Button>
        <Button onClick={handleClose}>
          Done
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'plan' && renderPlanSelection()}
        {step === 'amount' && renderAmountSelection()}
        {step === 'confirm' && renderConfirmation()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
}