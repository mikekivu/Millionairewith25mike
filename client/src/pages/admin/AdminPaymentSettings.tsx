
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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff } from 'lucide-react';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

interface PaymentConfiguration {
  id: number;
  provider: string;
  environment: string;
  clientId?: string;
  clientSecret?: string;
  consumerKey?: string;
  consumerSecret?: string;
  ipnId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfiguration | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    provider: '',
    environment: 'sandbox',
    clientId: '',
    clientSecret: '',
    consumerKey: '',
    consumerSecret: '',
    ipnId: ''
  });

  const { data: paymentConfigurations, isLoading } = useQuery({
    queryKey: ['admin', 'payment-configurations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-configurations');
      if (!response.ok) throw new Error('Failed to fetch payment configurations');
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
    mutationFn: async ({ configId, active }: { configId: number; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/payment-configurations/${configId}/toggle-status`, { active });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-configurations'] });
      toast({
        title: "Success",
        description: "Payment configuration status updated successfully",
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

  const deleteConfigMutation = useMutation({
    mutationFn: async (configId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/payment-configurations/${configId}`);
      if (!response.ok) throw new Error('Failed to delete payment configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-configurations'] });
      toast({
        title: "Success",
        description: "Payment configuration deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete payment configuration",
        variant: "destructive",
      });
    },
  });

  const createConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await apiRequest('POST', '/api/admin/payment-configurations', configData);
      if (!response.ok) throw new Error('Failed to create payment configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-configurations'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Payment configuration created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment configuration",
        variant: "destructive",
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/payment-configurations/${id}`, data);
      if (!response.ok) throw new Error('Failed to update payment configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-configurations'] });
      setIsEditModalOpen(false);
      setEditingConfig(null);
      resetForm();
      toast({
        title: "Success",
        description: "Payment configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment configuration",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      provider: '',
      environment: 'sandbox',
      clientId: '',
      clientSecret: '',
      consumerKey: '',
      consumerSecret: '',
      ipnId: ''
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditClick = (config: PaymentConfiguration) => {
    setFormData({
      provider: config.provider,
      environment: config.environment,
      clientId: config.clientId || '',
      clientSecret: config.clientSecret || '',
      consumerKey: config.consumerKey || '',
      consumerSecret: config.consumerSecret || '',
      ipnId: config.ipnId || ''
    });
    setEditingConfig(config);
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.provider || !formData.environment) {
      toast({
        title: "Error",
        description: "Provider and environment are required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingConfig) {
      updateConfigMutation.mutate({ id: editingConfig.id, data: formData });
    } else {
      createConfigMutation.mutate(formData);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskSecret = (secret: string | undefined, show: boolean) => {
    if (!secret) return '';
    return show ? secret : '••••••••••••••••';
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
                <Plus className="mr-2 h-4 w-4" />
                Add Configuration
              </Button>
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
                              '• Payment gateways will use live environments\n' +
                              '• All transactions will be real\n\n' +
                              'Are you sure you want to continue?'
                            );

                            if (!confirmed) return;
                          }

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
                          <li>• All gateways use demo environment</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800">🔴 Live Mode</h5>
                        <ul className="text-sm text-red-700 mt-1 space-y-1">
                          <li>• ⚠️ Real money will be processed</li>
                          <li>• Gateways use live environment</li>
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
              <CardHeader>
                <CardTitle>Payment Gateway Configurations</CardTitle>
                <CardDescription>
                  Manage PayPal and Pesapal configurations for different environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : paymentConfigurations && paymentConfigurations.length > 0 ? (
                  <div className="space-y-4">
                    {paymentConfigurations.map((config: PaymentConfiguration) => (
                      <div key={config.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <h3 className="font-semibold capitalize">{config.provider}</h3>
                              <p className="text-sm text-muted-foreground">
                                {config.environment} environment
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={config.active ? "default" : "secondary"}>
                              {config.active ? "Active" : "Inactive"}
                            </Badge>
                            <Switch
                              checked={config.active}
                              onCheckedChange={(checked) => {
                                toggleStatusMutation.mutate({ configId: config.id, active: checked });
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(config)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteConfigMutation.mutate(config.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {config.provider === 'paypal' && (
                            <>
                              <div>
                                <label className="font-medium">Client ID</label>
                                <div className="flex items-center space-x-2">
                                  <p className="font-mono text-xs">
                                    {maskSecret(config.clientId, showSecrets[`${config.id}-clientId`])}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSecretVisibility(`${config.id}-clientId`)}
                                  >
                                    {showSecrets[`${config.id}-clientId`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="font-medium">Client Secret</label>
                                <div className="flex items-center space-x-2">
                                  <p className="font-mono text-xs">
                                    {maskSecret(config.clientSecret, showSecrets[`${config.id}-clientSecret`])}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSecretVisibility(`${config.id}-clientSecret`)}
                                  >
                                    {showSecrets[`${config.id}-clientSecret`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {config.provider === 'pesapal' && (
                            <>
                              <div>
                                <label className="font-medium">Consumer Key</label>
                                <div className="flex items-center space-x-2">
                                  <p className="font-mono text-xs">
                                    {maskSecret(config.consumerKey, showSecrets[`${config.id}-consumerKey`])}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSecretVisibility(`${config.id}-consumerKey`)}
                                  >
                                    {showSecrets[`${config.id}-consumerKey`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="font-medium">Consumer Secret</label>
                                <div className="flex items-center space-x-2">
                                  <p className="font-mono text-xs">
                                    {maskSecret(config.consumerSecret, showSecrets[`${config.id}-consumerSecret`])}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSecretVisibility(`${config.id}-consumerSecret`)}
                                  >
                                    {showSecrets[`${config.id}-consumerSecret`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                              {config.ipnId && (
                                <div>
                                  <label className="font-medium">IPN ID</label>
                                  <p className="font-mono text-xs">{config.ipnId}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="mt-4 text-xs text-muted-foreground">
                          Created: {new Date(config.createdAt).toLocaleDateString()} | 
                          Updated: {new Date(config.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payment Configurations</h3>
                    <p className="text-muted-foreground mb-4">
                      Add PayPal or Pesapal configurations to enable payment processing.
                    </p>
                    <Button onClick={handleAddClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Configuration Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Configuration</DialogTitle>
            <DialogDescription>
              Add a new payment gateway configuration for your platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="pesapal">Pesapal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="environment" className="text-right">Environment</Label>
                <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.provider === 'paypal' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clientId" className="text-right">Client ID</Label>
                    <Input
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="col-span-3"
                      placeholder="PayPal Client ID"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clientSecret" className="text-right">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      className="col-span-3"
                      placeholder="PayPal Client Secret"
                    />
                  </div>
                </>
              )}

              {formData.provider === 'pesapal' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="consumerKey" className="text-right">Consumer Key</Label>
                    <Input
                      id="consumerKey"
                      value={formData.consumerKey}
                      onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal Consumer Key"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="consumerSecret" className="text-right">Consumer Secret</Label>
                    <Input
                      id="consumerSecret"
                      type="password"
                      value={formData.consumerSecret}
                      onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal Consumer Secret"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ipnId" className="text-right">IPN ID</Label>
                    <Input
                      id="ipnId"
                      value={formData.ipnId}
                      onChange={(e) => setFormData({ ...formData, ipnId: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal IPN ID (optional)"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createConfigMutation.isPending}>
                {createConfigMutation.isPending ? "Creating..." : "Create Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Configuration</DialogTitle>
            <DialogDescription>
              Update the payment gateway configuration details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {formData.provider === 'paypal' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-clientId" className="text-right">Client ID</Label>
                    <Input
                      id="edit-clientId"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="col-span-3"
                      placeholder="PayPal Client ID"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-clientSecret" className="text-right">Client Secret</Label>
                    <Input
                      id="edit-clientSecret"
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      className="col-span-3"
                      placeholder="PayPal Client Secret"
                    />
                  </div>
                </>
              )}

              {formData.provider === 'pesapal' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-consumerKey" className="text-right">Consumer Key</Label>
                    <Input
                      id="edit-consumerKey"
                      value={formData.consumerKey}
                      onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal Consumer Key"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-consumerSecret" className="text-right">Consumer Secret</Label>
                    <Input
                      id="edit-consumerSecret"
                      type="password"
                      value={formData.consumerSecret}
                      onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal Consumer Secret"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-ipnId" className="text-right">IPN ID</Label>
                    <Input
                      id="edit-ipnId"
                      value={formData.ipnId}
                      onChange={(e) => setFormData({ ...formData, ipnId: e.target.value })}
                      className="col-span-3"
                      placeholder="Pesapal IPN ID (optional)"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateConfigMutation.isPending}>
                {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
