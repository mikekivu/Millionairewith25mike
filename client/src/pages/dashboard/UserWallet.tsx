import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { UserStatsCards } from '@/components/dashboard/StatsCards';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate, getTransactionStatusColor } from '@/lib/utils';
import { Plus, ArrowUpRight, ArrowDownRight, History, Wallet, Receipt } from 'lucide-react';
import DepositModal from '@/components/dashboard/DepositModal';
import WithdrawModal from '@/components/dashboard/WithdrawModal';
import TransactionReceipt from '@/components/dashboard/TransactionReceipt';
import { ColumnDef } from '@tanstack/react-table';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  transactionDetails?: string;
  externalTransactionId?: string;
  processingFee?: string;
}

export default function UserWallet() {
  const { toast } = useToast();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 300000, // 5 minutes
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/user/transactions'],
    staleTime: 60000, // 1 minute
    select: (data) => data.filter((tx: Transaction) => tx.type === 'deposit' || tx.type === 'withdrawal'),
  });

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const Icon = type === 'deposit' ? ArrowDownRight : ArrowUpRight;
        const bgColor = type === 'deposit' ? 'bg-green-100' : 'bg-red-100';
        const textColor = type === 'deposit' ? 'text-green-700' : 'text-red-700';
        
        return (
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${bgColor} ${textColor} mr-2`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="capitalize">{type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.getValue('type') as string;
        const currency = row.original.currency || 'USDT';
        const textColor = type === 'deposit' ? 'text-green-700' : 'text-red-700';
        const prefix = type === 'deposit' ? '+' : '-';
        
        return <span className={`font-medium ${textColor}`}>{prefix}{formatCurrency(amount, currency)}</span>;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        return <span className="capitalize">{method || 'N/A'}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        return formatDate(row.getValue('createdAt') as string);
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const transaction = row.original;
        const isCompleted = transaction.status === 'completed';
        
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewReceipt(transaction)}
            disabled={!isCompleted}
            className={`${!isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50'}`}
            title={isCompleted ? 'View Receipt' : 'Receipt only available for completed transactions'}
          >
            <Receipt className="h-4 w-4 mr-1" />
            Receipt
          </Button>
        );
      },
    }
  ];

  return (
    <>
      <Helmet>
        <title>Wallet - MillionaireWith$25</title>
        <meta name="description" content="Manage your MillionaireWith$25 wallet, make deposits, and withdraw funds." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button onClick={() => setDepositModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button onClick={() => setWithdrawModalOpen(true)} variant="outline">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">Balance</CardTitle>
                <CardDescription>Your current wallet balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 mr-4">
                    <Wallet className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-4xl font-bold">
                      {isLoadingStats 
                        ? <span className="animate-pulse">Loading...</span>
                        : formatCurrency(dashboardStats?.walletBalance || '0', 'USDT')
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="mr-2 h-5 w-5" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="flex justify-center py-8">
                        <p>Loading transactions...</p>
                      </div>
                    ) : transactions && transactions.length > 0 ? (
                      <DataTable 
                        columns={columns} 
                        data={transactions} 
                        searchColumn="type"
                        searchPlaceholder="Search transactions..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setDepositModalOpen(true)}
                        >
                          Make your first deposit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="deposits">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ArrowDownRight className="mr-2 h-5 w-5 text-green-600" />
                      Deposit History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="flex justify-center py-8">
                        <p>Loading deposits...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns} 
                        data={transactions.filter((tx: Transaction) => tx.type === 'deposit')} 
                        searchColumn="paymentMethod"
                        searchPlaceholder="Search deposits..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No deposits found</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setDepositModalOpen(true)}
                        >
                          Make a deposit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="withdrawals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ArrowUpRight className="mr-2 h-5 w-5 text-red-600" />
                      Withdrawal History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="flex justify-center py-8">
                        <p>Loading withdrawals...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns}
                        data={transactions.filter((tx: Transaction) => tx.type === 'withdrawal')} 
                        searchColumn="paymentMethod"
                        searchPlaceholder="Search withdrawals..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No withdrawals found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <DepositModal 
        open={depositModalOpen} 
        onOpenChange={setDepositModalOpen} 
      />

      <WithdrawModal 
        open={withdrawModalOpen} 
        onOpenChange={setWithdrawModalOpen} 
        currentBalance={parseFloat(dashboardStats?.walletBalance || '0')}
      />

      {selectedTransaction && (
        <TransactionReceipt
          open={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
          transaction={selectedTransaction}
          user={user}
        />
      )}
    </>
  );
}
