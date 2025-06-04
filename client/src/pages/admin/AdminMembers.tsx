import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import EditWalletDialog from '@/components/dashboard/EditWalletDialog';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  walletBalance: string;
  active: boolean;
  role: string;
  referralCode: string;
  referredBy?: number;
  profileImage?: string;
  country?: string;
  phoneNumber?: string;
}

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [walletEditDialogOpen, setWalletEditDialogOpen] = useState(false);
  const [userForWalletEdit, setUserForWalletEdit] = useState<User | null>(null);

  // Check if current user is super admin
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    onSuccess: (data) => {
      if (data && data.email === "mikepaul620@gmail.com") {
        setIsSuperAdmin(true);
      }
    }
  });

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 60000, // 1 minute
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: number; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/toggle-status`, { active });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: data.message || "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User Deleted",
        description: data.message || "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (userId: number, active: boolean) => {
    setSelectedUserId(userId);
    setNewStatus(active);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedUserId !== null) {
      toggleStatusMutation.mutate({ userId: selectedUserId, active: newStatus });
    }
    setIsStatusDialogOpen(false);
  };

  const confirmDeleteUser = () => {
    if (selectedUserId !== null) {
      deleteUserMutation.mutate(selectedUserId);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
  };

  const handleEditWallet = (user: User) => {
    setUserForWalletEdit(user);
    setWalletEditDialogOpen(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.getValue('firstName') as string;
        const lastName = row.original.lastName;
        
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-2 font-medium">
              {firstName[0]}{lastName[0]}
            </div>
            <div>
              <div className="font-medium">{firstName} {lastName}</div>
              <div className="text-sm text-muted-foreground">{row.original.username}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue('role')}</div>;
      },
    },
    {
      accessorKey: 'walletBalance',
      header: 'Balance',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('walletBalance'), 'USDT');
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.getValue('active') as boolean;
        
        return (
          <div className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
            active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {active ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
            {active ? 'Active' : 'Inactive'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        
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
                onClick={() => handleViewProfile(user)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleToggleStatus(user.id, !user.active)}
                className={user.active ? "text-red-600" : "text-green-600"}
              >
                {user.active ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => handleEditWallet(user)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 6h20"></path><path d="M2 10h20"></path><path d="M2 14h20"></path><path d="M2 18h9"></path></svg>
                Edit Wallet Balance
              </DropdownMenuItem>

              {isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() => toast({
                    title: "View Transactions",
                    description: `Viewing all transactions for ${user.firstName} ${user.lastName}`,
                  })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 2H8"></path><path d="M9 1v3"></path><path d="M15 1v3"></path><path d="M12 7v5"></path><path d="M16 13l-4 4-4-4"></path><path d="M19 17a7.06 7.06 0 0 1-12.28 4"></path><path d="M5 17a7.07 7.07 0 0 1 1.28-4"></path><path d="M10.5 9.5L12 7l1.5 2.5"></path></svg>
                  Transaction History
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600"
                disabled={user.role === 'admin' && !isSuperAdmin}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filter users by active status
  const activeUsers = users?.filter(user => user.active) || [];
  const inactiveUsers = users?.filter(user => !user.active) || [];

  return (
    <>
      <Helmet>
        <title>Manage Members - MillionaireWith$25 Admin</title>
        <meta name="description" content="Manage MillionaireWith$25 platform members. View, activate, deactivate, or delete user accounts." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Manage Members</h1>
              {isSuperAdmin && (
                <span className="ml-3 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-300">
                  Super Admin
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Members</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : users?.length || 0}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Active Members</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : activeUsers.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <UserCheck className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Inactive Members</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : inactiveUsers.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800">
                      <UserX className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Members</TabsTrigger>
                <TabsTrigger value="active">Active Members</TabsTrigger>
                <TabsTrigger value="inactive">Inactive Members</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      All Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading members...</p>
                      </div>
                    ) : users && users.length > 0 ? (
                      <DataTable 
                        columns={columns} 
                        data={users} 
                        searchColumn="firstName"
                        searchPlaceholder="Search by name..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No members found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="mr-2 h-5 w-5 text-green-600" />
                      Active Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading active members...</p>
                      </div>
                    ) : activeUsers.length > 0 ? (
                      <DataTable 
                        columns={columns} 
                        data={activeUsers} 
                        searchColumn="firstName"
                        searchPlaceholder="Search by name..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No active members found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="inactive">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserX className="mr-2 h-5 w-5 text-red-600" />
                      Inactive Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <p>Loading inactive members...</p>
                      </div>
                    ) : inactiveUsers.length > 0 ? (
                      <DataTable 
                        columns={columns} 
                        data={inactiveUsers} 
                        searchColumn="firstName"
                        searchPlaceholder="Search by name..."
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No inactive members found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Super Admin Financial Reports Section */}
            {isSuperAdmin && (
              <div className="mt-10">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold">Enhanced Financial Reports</h2>
                  <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-300">
                    Super Admin Only
                  </span>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>System Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Total System Balance</p>
                        <p className="text-2xl font-bold mt-1">125,480.00 USDT</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">Total Deposits</p>
                        <p className="text-2xl font-bold mt-1">289,650.00 USDT</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Total Withdrawals</p>
                        <p className="text-2xl font-bold mt-1">164,170.00 USDT</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                        <p className="text-sm text-orange-700 font-medium">Total Commissions</p>
                        <p className="text-2xl font-bold mt-1">45,780.00 USDT</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button variant="outline" className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export Full Report
                      </Button>
                      <Button variant="outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        Advanced Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Member Financial Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      As a Super Admin, you have access to manage all financial aspects of member accounts, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Adjusting wallet balances for any member</li>
                      <li>Viewing complete transaction history for all accounts</li>
                      <li>Approving or rejecting withdrawal requests</li>
                      <li>Managing referral bonuses and commissions</li>
                      <li>Generating detailed financial reports for individual members</li>
                    </ul>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                        Manage Wallet Balances
                      </Button>
                      <Button variant="outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        Review Pending Withdrawals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Edit Dialog */}
      <EditWalletDialog
        user={userForWalletEdit}
        open={walletEditDialogOpen}
        onOpenChange={setWalletEditDialogOpen}
      />

      {/* Status change confirmation dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus ? 'Activate User Account' : 'Deactivate User Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus 
                ? 'Are you sure you want to activate this user account? They will be able to login and use the platform again.'
                : 'Are you sure you want to deactivate this user account? They will not be able to login or use the platform until reactivated.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus} className={newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {newStatus ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete user confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone and all user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profileImage || ''} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                  <AvatarFallback className="text-lg font-semibold bg-primary-100 text-primary-800">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Wallet Balance</Label>
                  <p className="font-medium">{formatCurrency(selectedUser.walletBalance, 'USDT')}</p>
                </div>
                {selectedUser.country && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <p className="font-medium">{selectedUser.country}</p>
                  </div>
                )}
                {selectedUser.phoneNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedUser.phoneNumber}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Referral Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Referral Code</Label>
                    <p className="font-mono text-sm bg-gray-100 rounded px-2 py-1">{selectedUser.referralCode}</p>
                  </div>
                  {selectedUser.referredBy && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Referred By</Label>
                      <p className="text-sm">ID: {selectedUser.referredBy}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
