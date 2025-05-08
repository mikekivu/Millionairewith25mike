import React from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  AlertCircle,
  DollarSign,
  User,
  Clock, 
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  transactionDetails?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  
  const { data: withdrawals, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions/withdrawals'],
    staleTime: 60000, // 1 minute
  });

  const handleApproveWithdrawal = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/admin/transactions/${id}/status`, { status: 'completed' });
      toast({
        title: "Withdrawal Approved",
        description: "The withdrawal has been approved and processed.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/admin/transactions/${id}/status`, { status: 'rejected' });
      toast({
        title: "Withdrawal Rejected",
        description: "The withdrawal has been rejected.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? (
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        ) : (
          <div className="text-muted-foreground">Unknown User</div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('amount'), row.original.currency);
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue('paymentMethod') || 'USDT TRC20'}</div>;
      },
    },
    {
      accessorKey: 'transactionDetails',
      header: 'Wallet Address',
      cell: ({ row }) => {
        return <div className="truncate max-w-[200px]">{row.getValue('transactionDetails') || 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        
        return (
          <div className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status === 'completed' ? <Check className="h-3 w-3 mr-1" /> : 
             status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
             <X className="h-3 w-3 mr-1" />}
            {status}
          </div>
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
      cell: ({ row }) => {
        const transaction = row.original;
        const isPending = transaction.status === 'pending';
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleApproveWithdrawal(transaction.id)}
                className="text-green-600"
                disabled={!isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRejectWithdrawal(transaction.id)}
                className="text-red-600"
                disabled={!isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'pending') || [];
  const completedWithdrawals = withdrawals?.filter(w => w.status === 'completed') || [];
  const rejectedWithdrawals = withdrawals?.filter(w => w.status === 'rejected') || [];

  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const totalWithdrawnAmount = completedWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);

  return (
    <>
      <Helmet>
        <title>Withdrawal Management - RichLance Admin</title>
        <meta name="description" content="Manage withdrawal requests from RichLance platform users." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Withdrawal Management</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Pending Withdrawals</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : pendingWithdrawals.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Pending Amount</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : formatCurrency(totalPendingAmount, 'USDT')}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Withdrawn</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : formatCurrency(totalWithdrawnAmount, 'USDT')}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                  Pending Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading withdrawals...</p>
                  </div>
                ) : pendingWithdrawals.length > 0 ? (
                  <DataTable 
                    columns={columns} 
                    data={pendingWithdrawals} 
                    searchColumn="user"
                    searchPlaceholder="Search by user..."
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending withdrawals</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-600" />
                  Processed Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading withdrawals...</p>
                  </div>
                ) : [...completedWithdrawals, ...rejectedWithdrawals].length > 0 ? (
                  <DataTable 
                    columns={columns} 
                    data={[...completedWithdrawals, ...rejectedWithdrawals]} 
                    searchColumn="user"
                    searchPlaceholder="Search by user..."
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No processed withdrawals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}