import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus,
  PencilLine,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

interface Plan {
  id: number;
  name: string;
  description: string;
  minDeposit: string;
  maxDeposit: string;
  roi: string;
  durationDays: number;
  referralBonus: string;
  active: boolean;
}

const planFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  minDeposit: z.string().min(1, "Minimum deposit is required"),
  maxDeposit: z.string().min(1, "Maximum deposit is required"),
  roi: z.string().min(1, "ROI is required"),
  durationDays: z.string().min(1, "Duration is required").transform(val => parseInt(val)),
  referralBonus: z.string().min(1, "Referral bonus is required"),
  active: z.boolean().default(true)
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function AdminPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<boolean>(false);

  // Fetch all plans
  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/admin/plans'],
    staleTime: 60000, // 1 minute
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormValues) => {
      const response = await apiRequest('POST', '/api/admin/plans', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan Created",
        description: "Investment plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PlanFormValues }) => {
      const response = await apiRequest('PUT', `/api/admin/plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan Updated",
        description: "Investment plan updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  // Toggle plan status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ planId, active }: { planId: number; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/plans/${planId}/toggle-status`, { active });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: data.message || "Plan status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update plan status",
        variant: "destructive",
      });
      setIsStatusDialogOpen(false);
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/plans/${planId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Plan Deleted",
        description: data.message || "Plan deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete plan",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Setup form
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      minDeposit: "100",
      maxDeposit: "10000",
      roi: "5",
      durationDays: "30",
      referralBonus: "1",
      active: true
    }
  });

  const onSubmit = (values: PlanFormValues) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: values });
    } else {
      createPlanMutation.mutate(values);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description,
      minDeposit: plan.minDeposit,
      maxDeposit: plan.maxDeposit,
      roi: plan.roi,
      durationDays: plan.durationDays.toString(),
      referralBonus: plan.referralBonus,
      active: plan.active
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
    form.reset();
  };

  const handleToggleStatus = (planId: number, active: boolean) => {
    setSelectedPlanId(planId);
    setNewStatus(active);
    setIsStatusDialogOpen(true);
  };

  const handleDeletePlan = (planId: number) => {
    setSelectedPlanId(planId);
    setIsDeleteDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedPlanId !== null) {
      toggleStatusMutation.mutate({ planId: selectedPlanId, active: newStatus });
    }
  };

  const confirmDeletePlan = () => {
    if (selectedPlanId !== null) {
      deletePlanMutation.mutate(selectedPlanId);
    }
  };

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        
        return (
          <div className="font-medium">{name}</div>
        );
      },
    },
    {
      accessorKey: 'minDeposit',
      header: 'Min Deposit',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('minDeposit'), 'USDT');
      },
    },
    {
      accessorKey: 'maxDeposit',
      header: 'Max Deposit',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('maxDeposit'), 'USDT');
      },
    },
    {
      accessorKey: 'roi',
      header: 'ROI',
      cell: ({ row }) => {
        return `${row.getValue('roi')}%`;
      },
    },
    {
      accessorKey: 'durationDays',
      header: 'Duration',
      cell: ({ row }) => {
        return `${row.getValue('durationDays')} days`;
      },
    },
    {
      accessorKey: 'referralBonus',
      header: 'Referral Bonus',
      cell: ({ row }) => {
        return `${row.getValue('referralBonus')}%`;
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
            {active ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
            {active ? 'Active' : 'Inactive'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                <PencilLine className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleToggleStatus(plan.id, !plan.active)}
                className={plan.active ? "text-red-600" : "text-green-600"}
              >
                {plan.active ? (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeletePlan(plan.id)}
                className="text-red-600"
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

  // Filter plans by active status
  const activePlans = plans?.filter(plan => plan.active) || [];
  const inactivePlans = plans?.filter(plan => !plan.active) || [];

  return (
    <>
      <Helmet>
        <title>Investment Plans - RichLance Admin</title>
        <meta name="description" content="Manage RichLance platform investment plans. Create, edit, activate, or deactivate investment packages." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Investment Plans</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add New Plan
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Active Plans</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : activePlans.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <Package className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Inactive Plans</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <span className="animate-pulse">Loading...</span> : inactivePlans.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800">
                      <XCircle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  All Investment Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading plans...</p>
                  </div>
                ) : plans && plans.length > 0 ? (
                  <DataTable 
                    columns={columns} 
                    data={plans} 
                    searchColumn="name"
                    searchPlaceholder="Search by plan name..."
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No investment plans found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Your First Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Investment Plan' : 'Add New Investment Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Update the details of the investment plan' 
                : 'Create a new investment plan for users to invest in'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Basic Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description of the investment plan" 
                        {...field} 
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Deposit (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Deposit (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="roi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ROI (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="referralBonus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Bonus (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createPlanMutation.isPending || updatePlanMutation.isPending}>
                  {createPlanMutation.isPending || updatePlanMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      {editingPlan ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingPlan ? 'Update Plan' : 'Create Plan'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Status change confirmation dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus ? 'Activate Investment Plan' : 'Deactivate Investment Plan'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus 
                ? 'Are you sure you want to activate this plan? It will be visible to users and available for investment.'
                : 'Are you sure you want to deactivate this plan? It will no longer be visible to users or available for investment.'
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

      {/* Delete plan confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment plan? This action cannot be undone.
              Any ongoing investments in this plan will remain active until completion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePlan} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}