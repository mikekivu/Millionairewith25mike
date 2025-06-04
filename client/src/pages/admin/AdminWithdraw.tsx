
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, CreditCard, Banknote, DollarSign, AlertCircle } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AdminWithdrawal {
  id: number;
  amount: string;
  currency: string;
  method: string;
  destination: string;
  status: string;
  notes: string;
  createdAt: string;
  processedAt: string | null;
}

export default function AdminWithdraw() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('paypal');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Get dashboard stats to show available balance
  const { data: dashboardStats } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
  });

  // Get admin withdrawal history
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals-history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/withdrawals-history');
      if (!response.ok) throw new Error('Failed to fetch withdrawal history');
      return response.json();
    },
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const response = await apiRequest('POST', '/api/admin/withdraw', withdrawalData);
      if (!response.ok) throw new Error('Failed to create withdrawal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({
        title: "Success",
        description: "Withdrawal request created successfully",
      });
      setWithdrawAmount('');
      setDestination('');
      setNotes('');
      setIsWithdrawing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create withdrawal",
        variant: "destructive",
      });
      setIsWithdrawing(false);
    },
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || !destination) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Withdrawal amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    createWithdrawalMutation.mutate({
      amount: withdrawAmount,
      currency: 'USD',
      method: withdrawMethod,
      destination,
      notes
    });
  };

  // Calculate available balance (total deposits - total withdrawals - user withdrawals)
  const availableBalance = dashboardStats ? 
    (parseFloat(dashboardStats.totalDeposits) - parseFloat(dashboardStats.totalWithdrawals || '0')).toString() 
    : '0';

  const isValidAmount = withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= parseFloat(availableBalance);

  return (
    <>
      <Helmet>
        <title>Admin Withdraw - Admin Dashboard</title>
        <meta name="description" content="Withdraw admin funds to PayPal or bank account." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>

        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="h-6 w-6" />
              <h1 className="text-2xl md:text-3xl font-bold">Admin Withdraw</h1>
            </div>

            {/* Available Balance Card */}
            <Card className="mb-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(availableBalance, 'USD')}
                </div>
                <p className="text-green-100 mt-2">Total deposits minus user withdrawals</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Withdrawal Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Withdrawal</CardTitle>
                  <CardDescription>
                    Withdraw funds to your PayPal account or bank
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min="1"
                        max={availableBalance}
                        step="0.01"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Available: {formatCurrency(availableBalance, 'USD')}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="method">Withdrawal Method</Label>
                      <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paypal">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              PayPal
                            </div>
                          </SelectItem>
                          <SelectItem value="bank">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="destination">
                      {withdrawMethod === 'paypal' ? 'PayPal Email' : 'Bank Account Details'}
                    </Label>
                    <Input
                      id="destination"
                      placeholder={
                        withdrawMethod === 'paypal' 
                          ? 'your-paypal@email.com' 
                          : 'Account Number, Bank Name, SWIFT Code'
                      }
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes for this withdrawal..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {!isValidAmount && withdrawAmount && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="text-sm text-red-700">
                        {parseFloat(withdrawAmount) > parseFloat(availableBalance) 
                          ? "Insufficient funds. Amount exceeds available balance."
                          : "Please enter a valid amount greater than 0."
                        }
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleWithdraw}
                    disabled={!isValidAmount || !destination || isWithdrawing}
                    className="w-full"
                    size="lg"
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Withdrawal...
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Withdraw {withdrawAmount ? formatCurrency(withdrawAmount, 'USD') : 'Funds'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Withdrawal History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Withdrawals</CardTitle>
                  <CardDescription>
                    Your withdrawal history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : withdrawals && withdrawals.length > 0 ? (
                    <div className="space-y-4">
                      {withdrawals.slice(0, 5).map((withdrawal: AdminWithdrawal) => (
                        <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {withdrawal.method === 'paypal' ? (
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Banknote className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <div className="font-medium">
                                {formatCurrency(withdrawal.amount, withdrawal.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(withdrawal.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              withdrawal.status === 'completed' ? 'default' :
                              withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {withdrawal.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {withdrawal.method.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No withdrawals yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
