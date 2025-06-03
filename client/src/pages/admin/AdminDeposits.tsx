
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/dashboard/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, Eye, Download, CreditCard, DollarSign } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

interface Deposit {
  id: number;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  processedAt: string | null;
}

export default function AdminDeposits() {
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: deposits, isLoading } = useQuery({
    queryKey: ['admin', 'deposits', statusFilter, dateFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/deposits?status=${statusFilter}&date=${dateFilter}`);
      if (!response.ok) throw new Error('Failed to fetch deposits');
      return response.json();
    },
  });

  const { data: depositStats } = useQuery({
    queryKey: ['admin', 'deposit-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/deposit-stats');
      if (!response.ok) throw new Error('Failed to fetch deposit stats');
      return response.json();
    },
  });

  const columns: ColumnDef<Deposit>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => `#${row.getValue('id')}`,
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.getValue('user') as Deposit['user'];
        return (
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue('amount'), row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('paymentMethod')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'completed' ? 'default' : 
                       status === 'pending' ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'transactionId',
      header: 'Transaction ID',
      cell: ({ row }) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {row.getValue('transactionId')}
        </code>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedDeposit(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const getStatusStats = () => {
    if (!deposits) return { pending: 0, completed: 0, failed: 0, total: 0, totalAmount: 0 };
    
    return deposits.reduce((stats: any, deposit: Deposit) => {
      stats[deposit.status] = (stats[deposit.status] || 0) + 1;
      stats.total += 1;
      if (deposit.status === 'completed') {
        stats.totalAmount += parseFloat(deposit.amount);
      }
      return stats;
    }, { pending: 0, completed: 0, failed: 0, total: 0, totalAmount: 0 });
  };

  const stats = getStatusStats();

  return (
    <>
      <Helmet>
        <title>Deposits - Admin Dashboard</title>
        <meta name="description" content="View and manage user deposit transactions." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>

        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <h1 className="text-2xl md:text-3xl font-bold">Deposits</h1>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount, 'USD')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <CreditCard className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Deposits Overview */}
            {depositStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Deposits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(depositStats.today || 0, 'USD')}</div>
                    <p className="text-xs text-muted-foreground">
                      {depositStats.todayCount || 0} transactions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(depositStats.week || 0, 'USD')}</div>
                    <p className="text-xs text-muted-foreground">
                      {depositStats.weekCount || 0} transactions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(depositStats.month || 0, 'USD')}</div>
                    <p className="text-xs text-muted-foreground">
                      {depositStats.monthCount || 0} transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Deposits Table */}
            <Card>
              <CardHeader>
                <CardTitle>Deposit Transactions</CardTitle>
                <CardDescription>
                  View and monitor all user deposit transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading deposits...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={deposits || []}
                    searchKey="user.email"
                    searchPlaceholder="Search by user email..."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View Deposit Dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>
              View detailed information about this deposit transaction
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deposit ID</label>
                  <p className="font-medium">#{selectedDeposit.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedDeposit.status === 'completed' ? 'default' : 
                                   selectedDeposit.status === 'pending' ? 'secondary' : 'destructive'}>
                      {selectedDeposit.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p className="font-medium">
                    {selectedDeposit.user.firstName} {selectedDeposit.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedDeposit.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="font-medium">{selectedDeposit.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">
                    {selectedDeposit.transactionId}
                  </code>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                  <p className="font-medium">{formatDate(selectedDeposit.createdAt)}</p>
                </div>
                {selectedDeposit.processedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Processed At</label>
                    <p className="font-medium">{formatDate(selectedDeposit.processedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedDeposit(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
