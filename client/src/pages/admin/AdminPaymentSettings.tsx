import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { PayPalConfigForm } from '@/components/dashboard/PayPalConfigForm';
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
  Clock,
  CreditCard,
  Wallet,
  Bitcoin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface PaymentSetting {
  id: number;
  method: string;
  name: string;
  instructions: string;
  credentials: string;
  active: boolean;
  minAmount: string;
  maxAmount: string;
}

const paymentSettingFormSchema = z.object({
  method: z.string().min(1, "Payment method identifier is required"),
  name: z.string().min(1, "Name is required"),
  instructions: z.string().min(1, "Instructions are required"),
  credentials: z.string().min(1, "Credentials are required"),
  minAmount: z.string().min(1, "Minimum amount is required"),
  maxAmount: z.string().min(1, "Maximum amount is required"),
  active: z.boolean().default(true)
});

type PaymentSettingFormValues = z.infer<typeof paymentSettingFormSchema>;

type PredefinedMethod = {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultInstructions: string;
  defaultCredentials: string;
  minAmount: string;
  maxAmount: string;
};

export default function AdminPaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PaymentSetting | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSettingId, setSelectedSettingId] = useState<number | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<boolean>(false);
  const [selectedPredefinedMethod, setSelectedPredefinedMethod] = useState<string | null>(null);
  
  // Predefined payment methods
  const predefinedMethods: PredefinedMethod[] = [
    {
      id: "paypal",
      name: "PayPal",
      icon: <CreditCard className="h-5 w-5" />,
      defaultInstructions: "To deposit via PayPal, click the PayPal button and follow the instructions to complete your payment.",
      defaultCredentials: "example@yourdomain.com",
      minAmount: "25",
      maxAmount: "10000"
    },
    {
      id: "usdt_trc20",
      name: "USDT TRC20 (Coinbase)",
      icon: <Bitcoin className="h-5 w-5" />,
      defaultInstructions: "Send USDT to the provided wallet address using the TRC20 network only. Include your username in the transaction memo.",
      defaultCredentials: "TXz8aYxxx...(enter your USDT TRC20 wallet address)",
      minAmount: "25",
      maxAmount: "25000"
    }
  ];

  // Fetch all payment settings
  const { data: paymentSettings, isLoading } = useQuery<PaymentSetting[]>({
    queryKey: ['/api/admin/payment-settings'],
    staleTime: 60000, // 1 minute
  });

  // Create payment setting mutation
  const createSettingMutation = useMutation({
    mutationFn: async (data: PaymentSettingFormValues) => {
      // Convert string values for min/max amounts to ensure they're valid
      const formattedData = {
        ...data,
        // Ensure these are non-empty strings
        minAmount: data.minAmount || "10",
        maxAmount: data.maxAmount || "10000",
        instructions: data.instructions || "",
        credentials: data.credentials || ""
      };
      
      console.log("Creating payment setting with data:", formattedData);
      const response = await apiRequest('POST', '/api/admin/payment-settings', formattedData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Method Added",
        description: "Payment method created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Payment method creation error:", error);
      toast({
        title: "Error Adding Payment Method",
        description: error instanceof Error ? error.message : "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update payment setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PaymentSettingFormValues }) => {
      // Ensure the data is properly formatted
      const formattedData = {
        ...data,
        // Ensure these are non-empty strings
        minAmount: data.minAmount || "10",
        maxAmount: data.maxAmount || "10000",
        instructions: data.instructions || "",
        credentials: data.credentials || ""
      };
      
      console.log("Updating payment setting with data:", formattedData);
      const response = await apiRequest('PUT', `/api/admin/payment-settings/${id}`, formattedData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Method Updated",
        description: "Payment method updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setIsDialogOpen(false);
      setEditingSetting(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Payment method update error:", error);
      toast({
        title: "Error Updating Payment Method",
        description: error instanceof Error ? error.message : "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle payment method status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ settingId, active }: { settingId: number; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/payment-settings/${settingId}/toggle-status`, { active });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: data.message || "Payment method status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update payment method status",
        variant: "destructive",
      });
      setIsStatusDialogOpen(false);
    },
  });

  // Delete payment setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async (settingId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/payment-settings/${settingId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Method Deleted",
        description: data.message || "Payment method deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete payment method",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Setup form
  const form = useForm<PaymentSettingFormValues>({
    resolver: zodResolver(paymentSettingFormSchema),
    defaultValues: {
      method: "",
      name: "",
      instructions: "",
      credentials: "",
      minAmount: "10",
      maxAmount: "10000",
      active: true
    }
  });

  // Select predefined payment method
  const selectPredefinedMethod = (methodId: string) => {
    const method = predefinedMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedPredefinedMethod(methodId);
      form.setValue("method", method.id);
      form.setValue("name", method.name);
      form.setValue("instructions", method.defaultInstructions);
      form.setValue("credentials", method.defaultCredentials);
      form.setValue("minAmount", method.minAmount);
      form.setValue("maxAmount", method.maxAmount);
    }
  };

  const onSubmit = (values: PaymentSettingFormValues) => {
    if (editingSetting) {
      updateSettingMutation.mutate({ id: editingSetting.id, data: values });
    } else {
      createSettingMutation.mutate(values);
    }
  };

  const handleEditSetting = (setting: PaymentSetting) => {
    setEditingSetting(setting);
    form.reset({
      method: setting.method,
      name: setting.name,
      instructions: setting.instructions,
      credentials: setting.credentials,
      minAmount: setting.minAmount,
      maxAmount: setting.maxAmount,
      active: setting.active
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSetting(null);
    setSelectedPredefinedMethod(null);
    form.reset();
  };

  const handleToggleStatus = (settingId: number, active: boolean) => {
    setSelectedSettingId(settingId);
    setNewStatus(active);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteSetting = (settingId: number) => {
    setSelectedSettingId(settingId);
    setIsDeleteDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedSettingId !== null) {
      toggleStatusMutation.mutate({ settingId: selectedSettingId, active: newStatus });
    }
  };

  const confirmDeleteSetting = () => {
    if (selectedSettingId !== null) {
      deleteSettingMutation.mutate(selectedSettingId);
    }
  };

  const getPaymentIcon = (method: string | undefined) => {
    if (!method) return <CreditCard />;
    
    const methodLower = method.toLowerCase();
    if (methodLower.includes('paypal')) return <CreditCard />;
    if (methodLower.includes('crypto') || methodLower.includes('usdt') || methodLower.includes('trc20')) return <Bitcoin />;
    if (methodLower.includes('bank')) return <Wallet />;
    return <CreditCard />;
  };

  return (
    <>
      <Helmet>
        <title>Payment Settings - MillionaireWith$25 Admin</title>
        <meta name="description" content="Manage MillionaireWith$25 platform payment methods. Configure deposit and withdrawal options for users." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Payment Settings</h1>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Payment Method
              </Button>
            </div>
            
            {/* PayPal API Configuration */}
            <div className="mb-8">
              <PayPalConfigForm />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading payment methods...</p>
              </div>
            ) : paymentSettings && Array.isArray(paymentSettings) && paymentSettings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentSettings.map((setting) => (
                  <Card key={setting.id} className={!setting.active ? "opacity-75" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          setting.active ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {getPaymentIcon(setting.method)}
                        </div>
                        <div className="ml-3">
                          <CardTitle className="text-xl">{setting.name}</CardTitle>
                          <CardDescription>{setting.method}</CardDescription>
                        </div>
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditSetting(setting)}>
                              <PencilLine className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(setting.id, !setting.active)}
                              className={setting.active ? "text-red-600" : "text-green-600"}
                            >
                              {setting.active ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSetting(setting.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 pb-3 text-sm">
                        <div className="text-muted-foreground">Status:</div>
                        <div className={`inline-flex items-center text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                          setting.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {setting.active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" /> Inactive
                            </>
                          )}
                        </div>
                        <div className="text-muted-foreground">Min Amount:</div>
                        <div>${setting.minAmount} USDT</div>
                        <div className="text-muted-foreground">Max Amount:</div>
                        <div>${setting.maxAmount} USDT</div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Instructions: {setting.instructions && setting.instructions.length > 80
                          ? `${setting.instructions.substring(0, 80)}...`
                          : setting.instructions || 'No instructions provided'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No payment methods configured</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Payment Method
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingSetting ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
            <DialogDescription>
              {editingSetting 
                ? 'Update the details of the payment method' 
                : 'Add a new payment method for users to deposit and withdraw funds'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Predefined Payment Method Selection */}
          {!editingSetting && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Select a Payment Method:</h3>
              <div className="grid grid-cols-2 gap-3">
                {predefinedMethods.map((method) => (
                  <Button
                    key={method.id}
                    type="button"
                    variant={selectedPredefinedMethod === method.id ? "default" : "outline"}
                    className={`flex items-center justify-start py-6 ${
                      selectedPredefinedMethod === method.id 
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                        : "hover:border-orange-300"
                    }`}
                    onClick={() => selectPredefinedMethod(method.id)}
                  >
                    <div className="mr-3">{method.icon}</div>
                    <div className="text-left">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs opacity-80">{method.id}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., paypal, usdt_trc20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this payment method
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PayPal, USDT TRC20" {...field} />
                      </FormControl>
                      <FormDescription>
                        How users will see this payment method
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Amount (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Amount (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions for User</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions for using this payment method" 
                        {...field} 
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="credentials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credentials</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Wallet address, bank details, etc." 
                        {...field} 
                        className="resize-none"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Make this payment method available to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createSettingMutation.isPending || updateSettingMutation.isPending}>
                  {createSettingMutation.isPending || updateSettingMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      {editingSetting ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingSetting ? 'Update Method' : 'Add Method'}</>
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
              {newStatus ? 'Enable Payment Method' : 'Disable Payment Method'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus 
                ? 'Are you sure you want to enable this payment method? It will be available for users to deposit and withdraw funds.'
                : 'Are you sure you want to disable this payment method? Users will no longer be able to use it for deposits and withdrawals.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus} className={newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {newStatus ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete payment method confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
              Users will no longer be able to use this method for transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSetting} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}