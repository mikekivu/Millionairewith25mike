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
}

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<boolean>(false);

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
                onClick={() => toast({
                  title: "View Profile",
                  description: `View user profile not implemented`,
                })}
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
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600"
                disabled={user.role === 'admin'}
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
        <title>Manage Members - RichLance Admin</title>
        <meta name="description" content="Manage RichLance platform members. View, activate, deactivate, or delete user accounts." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Members</h1>
            
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
          </div>
        </div>
      </div>

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
    </>
  );
}
