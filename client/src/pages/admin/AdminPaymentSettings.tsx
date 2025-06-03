import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
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
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Payment Method
              </Button>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage available payment methods for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure payment methods that users can use for transactions. 
                  Each method can be enabled/disabled and have custom instructions.
                </p>
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
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMethodMutation.mutate(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}