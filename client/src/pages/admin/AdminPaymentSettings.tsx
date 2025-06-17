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

  

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
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
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 font-semibold">⚠️ All Payment Methods Disabled</p>
                <p className="text-red-600 text-sm">Payment functionality has been temporarily disabled</p>
              </div>
            </div>

            

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Payment Mode Configuration</CardTitle>
                <CardDescription>
                  Switch between sandbox (testing) and live (production) mode for all payment gateways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Current Payment Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                          const mode = paymentMode?.value || 'sandbox';
                          return mode === 'live' 
                            ? 'Live mode - Real money transactions will be processed'
                            : 'Sandbox mode - Test environment for safe testing';
                        })()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={(() => {
                        const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                        return paymentMode?.value === 'live' ? 'destructive' : 'secondary';
                      })()}>
                        {(() => {
                          const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                          return paymentMode?.value === 'live' ? 'LIVE' : 'SANDBOX';
                        })()}
                      </Badge>
                      <Switch
                        checked={(() => {
                          const paymentMode = systemSettings?.find((s: any) => s.key === 'payment_mode');
                          return paymentMode?.value === 'live';
                        })()}
                        onCheckedChange={(checked) => {
                          const newMode = checked ? 'live' : 'sandbox';

                          if (checked) {
                            const confirmed = confirm(
                              '⚠️ WARNING: You are about to switch to LIVE mode!\n\n' +
                              'This means:\n' +
                              '• Real money will be processed\n' +
                              '• Pesapal will use live environments\n' +
                              '• All transactions will be real\n\n' +
                              'Are you sure you want to continue?'
                            );

                            if (!confirmed) return;
                          }

                          // Call API to update system setting
                          fetch('/api/admin/system-settings/payment_mode', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                              value: newMode,
                              description: 'Payment gateway environment mode (live or sandbox)'
                            })
                          })
                          .then(response => response.json())
                          .then(() => {
                            queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings'] });
                            toast({
                              title: "Payment Mode Updated",
                              description: `Payment mode switched to ${newMode.toUpperCase()}${newMode === 'live' ? ' - BE CAREFUL, real money will be processed!' : ' - Safe for testing'}`,
                              variant: newMode === 'live' ? 'destructive' : 'default'
                            });
                          })
                          .catch(error => {
                            console.error('Error updating payment mode:', error);
                            toast({
                              title: "Error",
                              description: "Failed to update payment mode",
                              variant: "destructive"
                            });
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Mode Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-800">🧪 Sandbox Mode</h5>
                        <ul className="text-sm text-green-700 mt-1 space-y-1">
                          <li>• Safe for testing and development</li>
                          <li>• No real money processed</li>
                          <li>• Pesapal uses demo environment</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800">🔴 Live Mode</h5>
                        <ul className="text-sm text-red-700 mt-1 space-y-1">
                          <li>• ⚠️ Real money will be processed</li>
                          <li>• Pesapal uses live environment</li>
                          <li>• All transactions are real</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Transaction Limits</CardTitle>
                <CardDescription>
                  Configure minimum and maximum transaction limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Payment Methods Removed</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Payment functionality has been completely disabled. All payment methods have been removed from the system.
                </p>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4 w-full max-w-md">
                  <p className="text-red-800 font-semibold text-center">⚠️ Payment Services Disabled</p>
                  <p className="text-red-600 text-sm text-center mt-1">Contact administrator for any payment-related inquiries</p>
                </div>
              </CardContent>
            </Card>
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

      
    </>
  );
}