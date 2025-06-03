
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

// Schema for Pesapal configuration
const pesapalConfigSchema = z.object({
  consumerKey: z.string().min(10, "Consumer Key must be valid"),
  consumerSecret: z.string().min(10, "Consumer Secret must be valid"),
});

type PesapalConfigFormValues = z.infer<typeof pesapalConfigSchema>;

interface PesapalConfigData {
  configured: boolean;
  consumerKey: string;
  consumerSecret: string;
  sandbox: boolean;
  status: string;
  message: string;
}

export default function PesapalConfigForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<PesapalConfigData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<PesapalConfigFormValues>({
    resolver: zodResolver(pesapalConfigSchema),
    defaultValues: {
      consumerKey: '',
      consumerSecret: '',
    },
  });

  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/payment-settings/pesapal-config');
        const data = await response.json();
        setConfigData(data);
        
        if (data.configured) {
          form.setValue('consumerKey', data.consumerKey);
          form.setValue('consumerSecret', ''); // Don't prefill secret for security
        }
      } catch (error) {
        console.error('Failed to load Pesapal config:', error);
        toast({
          title: "Error",
          description: "Failed to load Pesapal configuration",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadConfig();
  }, [form, toast]);

  const onSubmit = async (values: PesapalConfigFormValues) => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/admin/payment-settings/pesapal-config', values);
      const result = await response.json();

      if (response.ok) {
        setConfigData(prev => ({
          ...prev,
          configured: true,
          status: 'success',
          message: result.message,
          consumerKey: values.consumerKey,
        }));

        toast({
          title: "Success",
          description: result.message,
        });

        // Clear the secret field for security
        form.setValue('consumerSecret', '');
      } else {
        throw new Error(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Pesapal configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pesapal Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pesapal Configuration
        </CardTitle>
        <CardDescription>
          Configure Pesapal payment gateway for mobile money and card payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configData && (
          <Alert className={`mb-6 ${configData.configured ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            {configData.configured ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertTitle>
              {configData.configured ? 'Pesapal Configured' : 'Pesapal Not Configured'}
            </AlertTitle>
            <AlertDescription>
              {configData.message}
              {configData.configured && (
                <div className="mt-2 text-sm">
                  <p>Environment: {configData.sandbox ? 'Sandbox (Testing)' : 'Production'}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="consumerKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your Pesapal Consumer Key" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your Pesapal Consumer Key from the merchant dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consumerSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder={configData?.configured ? "Enter new secret (leave blank to keep current)" : "Enter your Pesapal Consumer Secret"}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your Pesapal Consumer Secret from the merchant dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Notes</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Get your API credentials from the Pesapal merchant dashboard</li>
                  <li>The system automatically uses sandbox mode in development</li>
                  <li>Supports M-Pesa, Airtel Money, T-Kash, and card payments</li>
                  <li>Transactions are processed in real-time</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving Configuration..." : (configData?.configured ? "Update Configuration" : "Save Configuration")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>For testing purposes, you can use Pesapal's sandbox credentials:</p>
        <p className="font-mono text-xs mt-1">Consumer Key: qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW</p>
        <p className="font-mono text-xs">Consumer Secret: osGQ364R49cXKeOYSpaOnT++rHs=</p>
      </CardFooter>
    </Card>
  );
}
