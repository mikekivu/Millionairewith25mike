import React from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate, getTransactionStatusColor } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { History, ArrowUpRight, ArrowDownRight, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  transactionDetails?: string;
  investmentId?: number;
  referralId?: number;
}

export default function UserTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/user/transactions'],
    staleTime: 60000, // 1 minute
  });

  const depositCount = transactions?.filter(tx => tx.type === 'deposit').length || 0;
  const withdrawalCount = transactions?.filter(tx => tx.type === 'withdrawal').length || 0;
  const investmentCount = transactions?.filter(tx => tx.type === 'investment').length || 0;
  const referralCount = transactions?.filter(tx => tx.type === 'referral').length || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'referral':
        return <Users className="h-4 w-4 text-yellow-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const icon = getTransactionIcon(type);
        
        return (
          <div className="flex items-center">
            <div className="mr-2">{icon}</div>
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
        const isPositive = ['deposit', 'referral'].includes(type);
        const textColor = isPositive ? 'text-green-600' : 'text-red-600';
        const prefix = isPositive ? '+' : '-';
        
        return <span className={`font-medium ${textColor}`}>{prefix}{formatCurrency(amount, currency)}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant="outline" className={getTransactionStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        return method ? <span className="capitalize">{method}</span> : <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: 'transactionDetails',
      header: 'Details',
      cell: ({ row }) => {
        const details = row.getValue('transactionDetails') as string;
        return details ? 
          <span className="text-sm truncate max-w-xs block">{details}</span> : 
          <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        return formatDate(row.getValue('createdAt') as string);
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Transactions - RichLance</title>
        <meta name="description" content="View and track your transaction history on the RichLance platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Transactions</h1>
            
            <Tabs defaultValue="all" className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="deposits" className="flex items-center">
                  <ArrowDownRight className="mr-2 h-4 w-4 text-green-600" />
                  Deposits ({depositCount})
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex items-center">
                  <ArrowUpRight className="mr-2 h-4 w-4 text-red-600" />
                  Withdrawals ({withdrawalCount})
                </TabsTrigger>
                <TabsTrigger value="investments" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                  Investments ({investmentCount})
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-yellow-600" />
                  Referrals ({referralCount})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="mr-2 h-5 w-5" />
                      All Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading transactions...</p>
                      </div>
                    ) : transactions && transactions.length > 0 ? (
                      <DataTable 
                        columns={columns} 
                        data={transactions} 
                        searchColumn="type"
                        searchPlaceholder="Search by transaction type..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found</p>
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
                      Deposits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading deposits...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns}
                        data={transactions.filter(tx => tx.type === 'deposit')}
                        searchColumn="paymentMethod"
                        searchPlaceholder="Search by payment method..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No deposits found</p>
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
                      Withdrawals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading withdrawals...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns}
                        data={transactions.filter(tx => tx.type === 'withdrawal')}
                        searchColumn="paymentMethod"
                        searchPlaceholder="Search by payment method..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No withdrawals found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="investments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                      Investments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading investments...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns}
                        data={transactions.filter(tx => tx.type === 'investment')}
                        searchColumn="transactionDetails"
                        searchPlaceholder="Search by investment details..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No investment transactions found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="referrals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-yellow-600" />
                      Referral Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading referral transactions...</p>
                      </div>
                    ) : transactions ? (
                      <DataTable 
                        columns={columns}
                        data={transactions.filter(tx => tx.type === 'referral')}
                        searchColumn="transactionDetails"
                        searchPlaceholder="Search by referral details..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No referral earnings found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
