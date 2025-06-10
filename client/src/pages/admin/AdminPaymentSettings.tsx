import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

interface PaymentMethod {
  id: number;
  name: string;
  method: string;
  active: boolean;
  instructions?: string;
  credentials?: string;
  minAmount?: string;
  maxAmount?: string;
}

export default function AdminPaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    method: '',
    name: '',
    instructions: '',
    credentials: '',
    minAmount: '10',
    maxAmount: '10000',
    active: true
  });

  const [paypalConfig, setPaypalConfig] = useState({
    clientId: '',
    clientSecret: ''
  });

  const [pesapalConfig, setPesapalConfig] = useState({
    consumerKey: '',
    consumerSecret: ''
  });

  const [isPaypalConfigOpen, setIsPaypalConfigOpen] = useState(false);
  const [isPesapalConfigOpen, setIsPesapalConfigOpen] = useState(false);

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
  });

  const { data: paypalApiConfig } = useQuery({
    queryKey: ['admin', 'paypal-config'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings/paypal-config');
      if (!response.ok) throw new Error('Failed to fetch PayPal config');
      return response.json();
    },
  });

  const { data: pesapalApiConfig } = useQuery({
    queryKey: ['admin', 'pesapal-config'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings/pesapal-config');
      if (!response.ok) throw new Error('Failed to fetch Pesapal config');
      return response.json();
    },
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/system-settings');
      if (!response.ok) throw new Error('Failed to fetch system settings');
      return response.json();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ settingId, active }: { settingId: number; active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/payment-settings/${settingId}/status`, { active });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
      toast({
        title: "Success",
        description: "Payment method status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (settingId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/payment-settings/${settingId}`);
      if (!response.ok) throw new Error('Failed to delete payment method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete payment method",
        variant: "destructive",
      });
    },
  });

  const createMethodMutation = useMutation({
    mutationFn: async (methodData: any) => {
      const response = await apiRequest('POST', '/api/admin/payment-settings', methodData);
      if (!response.ok) throw new Error('Failed to create payment method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Payment method created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment method",
        variant: "destructive",
      });
    },
  });

  const updateMethodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/payment-settings/${id}`, data);
      if (!response.ok) throw new Error('Failed to update payment method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
      setIsEditModalOpen(false);
      setEditingMethod(null);
      resetForm();
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment method",
        variant: "destructive",
      });
    },
  });

  const updatePaypalConfigMutation = useMutation({
    mutationFn: async (config: { clientId: string; clientSecret: string }) => {
      const response = await apiRequest('POST', '/api/admin/payment-settings/paypal-config', config);
      if (!response.ok) throw new Error('Failed to update PayPal config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'paypal-config'] });
      setIsPaypalConfigOpen(false);
      toast({
        title: "Success",
        description: "PayPal configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update PayPal config",
        variant: "destructive",
      });
    },
  });

  const updatePesapalConfigMutation = useMutation({
    mutationFn: async (config: { consumerKey: string; consumerSecret: string }) => {
      const response = await apiRequest('POST', '/api/admin/payment-settings/pesapal-config', config);
      if (!response.ok) throw new Error('Failed to update Pesapal config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pesapal-config'] });
      setIsPesapalConfigOpen(false);
      toast({
        title: "Success",
        description: "Pesapal configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Pesapal config",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      method: '',
      name: '',
      instructions: '',
      credentials: '',
      minAmount: '10',
      maxAmount: '10000',
      active: true
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditClick = (method: PaymentMethod) => {
    console.log('Editing method:', method);
    setFormData({
      method: method.method || '',
      name: method.name || '',
      instructions: method.instructions || '',
      credentials: method.credentials || '',
      minAmount: method.minAmount || '10',
      maxAmount: method.maxAmount || '10000',
      active: method.active
    });
    setEditingMethod(method);
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.method || !formData.name) {
      toast({
        title: "Error",
        description: "Method and name are required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingMethod) {
      console.log('Updating method:', editingMethod.id, formData);
      updateMethodMutation.mutate({ id: editingMethod.id, data: formData });
    } else {
      console.log('Creating new method:', formData);
      createMethodMutation.mutate(formData);
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Settings - Admin Dashboard</title>
        <meta name="description" content="Manage payment methods and settings for the platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>

        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Payment Settings</h1>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" /> Add Payment Method
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>PayPal Configuration</CardTitle>
                  <CardDescription>
                    Manage PayPal payment integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Environment</span>
                      <Badge variant={(() => {
                        const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                        return paymentMode?.value === 'live' ? 'default' : 'secondary';
                      })()}>
                        {(() => {
                          const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                          return paymentMode?.value === 'live' ? 'Live' : 'Sandbox';
                        })()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Transaction Fee</span>
                      <span className="text-sm">2.9% + $0.30</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">API Credentials</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPaypalConfig({
                              clientId: paypalApiConfig?.clientId || '',
                              clientSecret: ''
                            });
                            setIsPaypalConfigOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client ID:</span>
                          <span className="font-mono text-xs">
                            {paypalApiConfig?.configured ? (paypalApiConfig?.clientId ? `${paypalApiConfig.clientId.substring(0, 8)}...` : 'Set') : 'Not Set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client Secret:</span>
                          <span className="font-mono text-xs">
                            {paypalApiConfig?.configured ? '••••••••••••••••' : 'Not Set'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        PayPal integration is configured and ready for transactions. 
                        Supports deposits and withdrawals worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pesapal Configuration</CardTitle>
                  <CardDescription>
                    Manage Pesapal payment integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Environment</span>
                      <Badge variant={(() => {
                        const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                        return paymentMode?.value === 'live' ? 'default' : 'secondary';
                      })()}>
                        {(() => {
                          const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                          return paymentMode?.value === 'live' ? 'Live' : 'Sandbox';
                        })()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Transaction Fee</span>
                      <span className="text-sm">3.5%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">API Credentials</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPesapalConfig({
                              consumerKey: pesapalApiConfig?.consumerKey || '',
                              consumerSecret: ''
                            });
                            setIsPesapalConfigOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Consumer Key:</span>
                          <span className="font-mono text-xs">
                            {pesapalApiConfig?.configured ? (pesapalApiConfig?.consumerKey ? `${pesapalApiConfig.consumerKey.substring(0, 8)}...` : 'Set') : 'Not Set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Consumer Secret:</span>
                          <span className="font-mono text-xs">
                            {pesapalApiConfig?.configured ? '••••••••••••••••' : 'Not Set'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        Pesapal integration is configured for African markets. 
                        Supports mobile money and card payments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Transaction Limits</CardTitle>
                <CardDescription>
                  Configure minimum and maximum transaction limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Deposit Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Minimum</label>
                        <p className="font-medium">$5.00</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Maximum</label>
                        <p className="font-medium">$10,000.00</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Withdrawal Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Minimum</label>
                        <p className="font-medium">$10.00</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Maximum</label>
                        <p className="font-medium">$5,000.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading payment methods...</p>
              </div>
            ) : paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.map((method: PaymentMethod) => (
                  <Card key={method.id} className={!method.active ? "opacity-75" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          method.active ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <CardTitle className="text-xl">{method.name}</CardTitle>
                          <CardDescription>{method.method}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={method.active ? "default" : "secondary"}>
                        {method.active ? "Active" : "Inactive"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {method.instructions && (
                          <p className="text-muted-foreground">{method.instructions}</p>
                        )}
                        {method.credentials && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground">Credentials:</p>
                            <p className="font-mono text-xs">{method.credentials.length > 20 ? method.credentials.substring(0, 20) + '...' : method.credentials}</p>
                          </div>
                        )}
                        {method.minAmount && method.maxAmount && (
                          <p className="text-xs text-muted-foreground">
                            Limits: ${method.minAmount} - ${method.maxAmount}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatusMutation.mutate({
                            settingId: method.id,
                            active: !method.active
                          })}
                        >
                          {method.active ? "Disable" : "Enable"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditClick(method);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this payment method?')) {
                              deleteMethodMutation.mutate(method.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    No payment methods have been configured yet. Add your first payment method to get started.
                  </p>
                  <Button onClick={handleAddClick}>
                    <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method for users to make deposits and withdrawals.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">Method</Label>
                <Input
                  id="method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., paypal, usdt_trc20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., PayPal, USDT (TRC20)"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructions" className="text-right">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="col-span-3"
                  placeholder="Payment instructions for users"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credentials" className="text-right">Credentials</Label>
                <Input
                  id="credentials"
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="col-span-3"
                  placeholder="Wallet address, API key, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minAmount" className="text-right">Min Amount ($)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  className="col-span-3"
                  placeholder="10"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxAmount" className="text-right">Max Amount ($)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  className="col-span-3"
                  placeholder="10000"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">Active</Label>
                <div className="col-span-3">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMethodMutation.isPending}>
                {createMethodMutation.isPending ? "Creating..." : "Create Payment Method"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-method" className="text-right">Method</Label>
                <Input
                  id="edit-method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., paypal, usdt_trc20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., PayPal, USDT (TRC20)"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-instructions" className="text-right">Instructions</Label>
                <Textarea
                  id="edit-instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="col-span-3"
                  placeholder="Payment instructions for users"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-credentials" className="text-right">Credentials</Label>
                <Input
                  id="edit-credentials"
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="col-span-3"
                  placeholder="Wallet address, API key, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-minAmount" className="text-right">Min Amount ($)</Label>
                <Input
                  id="edit-minAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  className="col-span-3"
                  placeholder="10"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-maxAmount" className="text-right">Max Amount ($)</Label>
                <Input
                  id="edit-maxAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  className="col-span-3"
                  placeholder="10000"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">Active</Label>
                <div className="col-span-3">
                  <Switch
                    id="edit-active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMethodMutation.isPending}>
                {updateMethodMutation.isPending ? "Updating..." : "Update Payment Method"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PayPal Configuration Modal */}
      <Dialog open={isPaypalConfigOpen} onOpenChange={setIsPaypalConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>PayPal API Configuration</DialogTitle>
            <DialogDescription>
              Configure your PayPal API credentials. You can get these from your PayPal Developer Dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            updatePaypalConfigMutation.mutate(paypalConfig);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paypal-client-id" className="text-right">Client ID</Label>
                <Input
                  id="paypal-client-id"
                  value={paypalConfig.clientId}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, clientId: e.target.value })}
                  className="col-span-3"
                  placeholder="Your PayPal Client ID"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paypal-client-secret" className="text-right">Client Secret</Label>
                <Input
                  id="paypal-client-secret"
                  type="password"
                  value={paypalConfig.clientSecret}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, clientSecret: e.target.value })}
                  className="col-span-3"
                  placeholder="Your PayPal Client Secret"
                />
              </div>
              <div className="col-span-4 text-sm text-muted-foreground">
                <p>• Get your PayPal API credentials from <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PayPal Developer Dashboard</a></p>
                <p>• Leave Client Secret empty to keep the existing secret</p>
                <p>• Use Sandbox credentials for testing, Live credentials for production</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaypalConfigOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePaypalConfigMutation.isPending}>
                {updatePaypalConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog
      {/* Pesapal Configuration Modal */}
      <Dialog open={isPesapalConfigOpen} onOpenChange={setIsPesapalConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pesapal API Configuration</DialogTitle>
            <DialogDescription>
              Configure your Pesapal API credentials. You can get these from your Pesapal Dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            updatePesapalConfigMutation.mutate(pesapalConfig);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pesapal-consumer-key" className="text-right">Consumer Key</Label>
                <Input
                  id="pesapal-consumer-key"
                  value={pesapalConfig.consumerKey}
                  onChange={(e) => setPesapalConfig({ ...pesapalConfig, consumerKey: e.target.value })}
                  className="col-span-3"
                  placeholder="Your Pesapal Consumer Key"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pesapal-consumer-secret" className="text-right">Consumer Secret</Label>
                <Input
                  id="pesapal-consumer-secret"
                  type="password"
                  value={pesapalConfig.consumerSecret}
                  onChange={(e) => setPesapalConfig({ ...pesapalConfig, consumerSecret: e.target.value })}
                  className="col-span-3"
                  placeholder="Your Pesapal Consumer Secret"
                />
              </div>
              <div className="col-span-4 text-sm text-muted-foreground">
                <p>• Get your Pesapal API credentials from <a href="https://www.pesapal.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pesapal Dashboard</a></p>
                <p>• Leave Consumer Secret empty to keep the existing secret</p>
                <p>• Supports mobile money and card payments across Africa</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPesapalConfigOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePesapalConfigMutation.isPending}>
                {updatePesapalConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}