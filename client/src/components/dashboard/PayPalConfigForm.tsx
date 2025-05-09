import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for PayPal configuration
const paypalConfigSchema = z.object({
  clientId: z.string().min(10, "Client ID must be valid"),
  clientSecret: z.string().min(10, "Client Secret must be valid"),
});

type PaypalConfigFormValues = z.infer<typeof paypalConfigSchema>;

export function PayPalConfigForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configStatus, setConfigStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Form setup
  const form = useForm<PaypalConfigFormValues>({
    resolver: zodResolver(paypalConfigSchema),
    defaultValues: {
      clientId: '',
      clientSecret: '',
    },
  });

  // Load any existing config
  useEffect(() => {
    const loadPaypalConfig = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/admin/payment-settings/paypal-config');
        const data = await response.json();
        
        if (data.configured) {
          setIsConfigured(true);
          form.setValue('clientId', data.clientId || '');
          // Don't set the secret as it's sensitive
          form.setValue('clientSecret', data.clientSecret ? '••••••••••••••••' : '');
        }
        
        setConfigStatus(data.status || 'idle');
        setStatusMessage(data.message || '');
      } catch (error) {
        console.error('Failed to load PayPal config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPaypalConfig();
  }, [form]);

  const onSubmit = async (values: PaypalConfigFormValues) => {
    try {
      setIsLoading(true);
      
      // If the secret shows placeholders and wasn't changed, don't send it
      const dataToSubmit = {
        clientId: values.clientId,
        clientSecret: values.clientSecret.includes('•••') ? undefined : values.clientSecret,
      };
      
      const response = await apiRequest('POST', '/api/admin/payment-settings/paypal-config', dataToSubmit);
      const data = await response.json();
      
      if (response.ok) {
        setIsConfigured(true);
        setConfigStatus('success');
        setStatusMessage(data.message || 'PayPal configuration saved successfully');
        
        toast({
          title: "PayPal Configuration Updated",
          description: "Your PayPal API credentials have been saved",
        });
      } else {
        setConfigStatus('error');
        setStatusMessage(data.message || 'Failed to save PayPal configuration');
        
        toast({
          title: "Configuration Failed",
          description: data.message || "Failed to save PayPal configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update PayPal config:', error);
      setConfigStatus('error');
      setStatusMessage('An unexpected error occurred');
      
      toast({
        title: "Configuration Error",
        description: "An unexpected error occurred when saving PayPal configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>PayPal API Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure your PayPal API credentials for payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configStatus === 'success' && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Configuration Successful</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
        
        {configStatus === 'error' && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your PayPal Client ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your PayPal client ID starts with "AUu" or similar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder={isConfigured ? "••••••••••••••••" : "Enter your PayPal Client Secret"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {isConfigured 
                      ? "Leave unchanged to keep using the existing secret" 
                      : "Your PayPal client secret starts with 'ED' or similar"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full md:w-auto mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (isConfigured ? "Update Configuration" : "Save Configuration")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>For testing purposes, you can use the following PayPal API keys:</p>
        <p className="font-mono text-xs mt-1">Client ID: AUuVpRN2jT2d5G8iu2eLY7WR_lgMkShROBT0khHlJo8fC6M_3S2DfgZA8pQVVIn6ogmWMoH-4Wo-w8o2</p>
        <p className="font-mono text-xs">Secret: EDexFMhe664mmpWsKCM8PynPylTNWlBydwQL8a0JCKjTthXNzTwwHahLieMT6_qkJQAJkNArp4hYE</p>
      </CardFooter>
    </Card>
  );
}