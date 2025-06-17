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
import DashboardLayout from '@/components/layout/DashboardLayout';

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

  const handlePaymentError = (error: string | Error | any) => {
    console.error("Payment error:", error);
    
    // Convert error to string safely
    let errorMessage = "An error occurred while processing your payment. Please try again.";
    
    try {
      if (typeof error === 'string' && error.trim()) {
        errorMessage = error;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && error.message) {
        errorMessage = String(error.message);
      } else if (error && typeof error === 'object') {
        // Handle empty objects or other object types
        errorMessage = "Payment processing failed. Please try again.";
      }
    } catch (e) {
      console.error("Error processing payment error:", e);
      errorMessage = "Payment processing failed. Please try again.";
    }
    
    toast({
      title: "Payment Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleWithdrawalRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (amount < 10) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is $10.00",
        variant: "destructive",
      });
      return;
    }

    if (amount > parseFloat(user?.walletBalance || '0')) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    // Check if this is a demo user
    const isDemoUser = user?.role === 'demo_user';

    if (isDemoUser) {
        // For demo users, process withdrawal instantly with success message
        toast({
          title: "Processing Withdrawal...",
          description: "Your withdrawal request is being processed...",
        });

        try {
          const response = await fetch('/api/user/withdrawals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              amount: withdrawAmount,
              currency: selectedCurrency,
              paymentMethod: 'instant_withdrawal',
              transactionDetails: `Withdrawal of ${withdrawAmount} ${selectedCurrency}`
            }),
          });

          if (response.ok) {
            // Wait 2 seconds to simulate processing
            setTimeout(() => {
              toast({
                title: "🎉 Withdrawal Successful!",
                description: `Your withdrawal of ${formatCurrency(amount, selectedCurrency)} has been processed successfully! Thank you for investing with us. Your funds have been transferred to your account.`,
                duration: 10000, // Show for 10 seconds
              });

              // Refresh user data and clear form
              refetchUser();
              setWithdrawAmount('');
              setIsWithdrawing(false);
            }, 2000);
          } else {
            throw new Error('Withdrawal processing failed');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process withdrawal. Please try again.",
            variant: "destructive",
          });
          setIsWithdrawing(false);
        }
    } else {
      // Regular user flow - simulate processing with admin authorization message
      toast({
        title: "Processing Withdrawal",
        description: "Your withdrawal request is being processed...",
      });

      // Wait 3-5 seconds to simulate processing
      setTimeout(() => {
        toast({
          title: "Withdrawal Submitted",
          description: "Your withdrawal request has been submitted for admin authorization. You will be contacted soon.",
        });

        // After another 2 seconds, show admin contact message
        setTimeout(() => {
          toast({
            title: "Admin Authorization Required",
            description: "Please contact admin for withdrawal authorization. Your request is being reviewed and action will be taken soon.",
            duration: 8000, // Show for 8 seconds
          });
          setIsWithdrawing(false);
          setWithdrawAmount('');
        }, 2000);
      }, Math.random() * 2000 + 3000); // Random delay between 3-5 seconds
    }
  };

  const walletBalance = parseFloat(user?.walletBalance || '0');
  const isValidDepositAmount = depositAmount && !isNaN(parseFloat(depositAmount)) && parseFloat(depositAmount) > 0;
  const isValidWithdrawAmount = withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= walletBalance;

  // Debug log for wallet balance
  console.log('User wallet balance:', user?.walletBalance, 'Parsed:', walletBalance);

  // Fetch user data
  const refetchUser = async () => {
    try {
      await refetch();
      console.log('User data refetched:', user);
    } catch (error) {
      console.error("Failed to refetch user:", error);
    }
  };

  // Force refresh user data on component mount
  useEffect(() => {
    refetchUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    const paymentMethod = urlParams.get('payment');
    const trackingId = urlParams.get('tracking_id');
    const errorParam = urlParams.get('error');

    if (paymentStatus && paymentMethod) {
      if (paymentStatus === 'completed') {
        toast({
          title: "Payment Successful",
          description: `Your ${paymentMethod} payment has been completed successfully. Your wallet will be updated shortly.`,
        });
      } else if (paymentStatus === 'failed') {
        let errorMessage = "Payment failed. Please try again.";
        if (errorParam === 'missing_tracking_id') {
          errorMessage = "Payment failed: Missing tracking information. Please contact support if this continues.";
        } else if (errorParam === 'callback_error') {
          errorMessage = "Payment processing error occurred. Please contact support if your payment was deducted.";
        } else if (errorParam === 'processing_error') {
          errorMessage = "Payment processing error. If amount was deducted, please contact support.";
        }

        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 8000, // Show longer for failed payments
        });
      } else if (paymentStatus === 'pending') {
        toast({
          title: "Payment Pending",
          description: `Your ${paymentMethod} payment is being processed. You will receive a notification once it's confirmed.`,
        });
      }

      // Clean up URL parameters after a short delay to ensure toast is shown
      setTimeout(() => {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }, 1000);

      // Refresh transactions to show the latest status
      setTimeout(() => {
        fetchTransactions();
      }, 2000);
    }
  }, [toast]);

  const handleDepositSuccess = async (transactionId: string, amount: string) => {
    toast({
      title: "Payment Submitted",
      description: `Your payment of ${formatCurrency(parseFloat(amount), selectedCurrency)} has been submitted and is being verified. Your wallet will be updated once the payment is confirmed.`,
      duration: 8000,
    });

    // Refresh user data (though balance won't change until admin approval)
    await refetchUser();

    // Clear the deposit amount
    setDepositAmount('');
  };

  return (
    <DashboardLayout>
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
              ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        // Prevent invalid inputs that could crash the page
                        try {
                          if (value === '') {
                            setDepositAmount('');
                            return;
                          }
                          
                          // Check if it's a valid number format
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && isFinite(numValue) && numValue >= 0) {
                            setDepositAmount(value);
                          }
                        } catch (error) {
                          console.error("Error handling deposit amount input:", error);
                          // Don't update state if there's an error
                        }
                      }}
                      min="5"
                      max="10000"
                      step="0.01"
                      onFocus={(e) => e.target.select()}
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

                {depositAmount && !isNaN(parseFloat(depositAmount)) && parseFloat(depositAmount) < 5 && (
                  <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
                    Minimum deposit amount is $5.00
                  </div>
                )}

                {depositAmount && !isNaN(parseFloat(depositAmount)) && parseFloat(depositAmount) > 10000 && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                    Maximum deposit amount is $10,000.00 per transaction
                  </div>
                )}

                {isValidDepositAmount && !isNaN(parseFloat(depositAmount)) && parseFloat(depositAmount) >= 5 && parseFloat(depositAmount) <= 10000 && (
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
                          <div className="payment-button-container">
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
                        onClick={handleWithdrawalRequest}
                        disabled={isWithdrawing || !isValidWithdrawAmount}
                        className="w-full"
                        size="lg"
                      >
                        {isWithdrawing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Request...
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Submit Withdrawal Request ({formatCurrency(parseFloat(withdrawAmount), selectedCurrency)})
                          </>
                        )}
                      </Button>
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
    </DashboardLayout>
  );
}