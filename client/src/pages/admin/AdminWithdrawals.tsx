
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/dashboard/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingDown, Check, X, Eye, AlertCircle, Download, Filter } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

interface Withdrawal {
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
  createdAt: string;
  processedAt: string | null;
  notes: string | null;
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals', statusFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/withdrawals?status=${statusFilter}`);
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      return response.json();
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, action, notes }: { withdrawalId: number; action: string; notes: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/withdrawals/${withdrawalId}`, {
        status: action,
        notes
      });
      if (!response.ok) throw new Error(`Failed to ${action} withdrawal`);
      return response.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      toast({
        title: "Success",
        description: `Withdrawal ${action}d successfully`,
      });
      setSelectedWithdrawal(null);
      setActionType(null);
      setNotes('');
    },
    onError: (error, { action }) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} withdrawal`,
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<Withdrawal>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => `#${row.getValue('id')}`,
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.getValue('user') as Withdrawal['user'];
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
      cell: ({ row }) => formatCurrency(row.getValue('amount'), row.original.currency),
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
      accessorKey: 'createdAt',
      header: 'Requested',
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const withdrawal = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedWithdrawal(withdrawal)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {withdrawal.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setActionType('approve');
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setActionType('reject');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleProcessWithdrawal = () => {
    if (!selectedWithdrawal || !actionType) return;
    
    const action = actionType === 'approve' ? 'completed' : 'rejected';
    processWithdrawalMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      action,
      notes
    });
  };

  const getStatusStats = () => {
    if (!withdrawals) return { pending: 0, completed: 0, rejected: 0, total: 0 };
    
    return withdrawals.reduce((stats: any, withdrawal: Withdrawal) => {
      stats[withdrawal.status] = (stats[withdrawal.status] || 0) + 1;
      stats.total += 1;
      return stats;
    }, { pending: 0, completed: 0, rejected: 0, total: 0 });
  };

  const stats = getStatusStats();

  return (
    <>
      <Helmet>
        <title>Withdrawals - Admin Dashboard</title>
        <meta name="description" content="Manage user withdrawal requests and transactions." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>

        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6" />
                <h1 className="text-2xl md:text-3xl font-bold">Withdrawals</h1>
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
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
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
                    <div className="p-2 bg-red-100 rounded-full">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold">{stats.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>
                  Manage and process user withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading withdrawals...</p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={withdrawals || []}
                    searchKey="user.email"
                    searchPlaceholder="Search by user email..."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View/Process Withdrawal Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => {
        setSelectedWithdrawal(null);
        setActionType(null);
        setNotes('');
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType ? `${actionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal` : 'Withdrawal Details'}
            </DialogTitle>
            <DialogDescription>
              {actionType ? 
                `${actionType === 'approve' ? 'Approve' : 'Reject'} this withdrawal request` :
                'View withdrawal request details'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Withdrawal ID</Label>
                  <p className="font-medium">#{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedWithdrawal.status === 'completed' ? 'default' : 
                                 selectedWithdrawal.status === 'pending' ? 'secondary' : 'destructive'}>
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="font-medium">
                    {selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.user.email}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">{selectedWithdrawal.paymentMethod}</p>
                </div>
                <div>
                  <Label>Requested At</Label>
                  <p className="font-medium">{formatDate(selectedWithdrawal.createdAt)}</p>
                </div>
              </div>

              {selectedWithdrawal.notes && (
                <div>
                  <Label>Existing Notes</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedWithdrawal.notes}</p>
                </div>
              )}

              {actionType && (
                <div>
                  <Label htmlFor="notes">
                    {actionType === 'approve' ? 'Processing Notes (Optional)' : 'Rejection Reason'}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={actionType === 'approve' ? 
                      'Add any processing notes...' : 
                      'Please provide a reason for rejection...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required={actionType === 'reject'}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedWithdrawal(null);
                setActionType(null);
                setNotes('');
              }}
            >
              {actionType ? 'Cancel' : 'Close'}
            </Button>
            {actionType && (
              <Button
                onClick={handleProcessWithdrawal}
                disabled={actionType === 'reject' && !notes.trim()}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
              >
                {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
