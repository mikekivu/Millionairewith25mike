import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Receipt, Download, Printer, Send, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadReceipt, generateReceiptAsBase64 } from '@/lib/receiptGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Receipt generation is successful only for completed transactions
interface TransactionReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any; // Replace with your Transaction type
  user: any; // Replace with your User type
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  open,
  onOpenChange,
  transaction,
  user
}) => {
  const { toast } = useToast();
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handler for generating and previewing receipt
  const handlePreviewReceipt = async () => {
    if (!transaction || !user) return;
    
    setIsLoading(true);
    try {
      // Get user's full name
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Prepare receipt data
      const receiptData = {
        transactionId: transaction.id,
        userId: user.id,
        userName,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        status: transaction.status,
        date: new Date(transaction.createdAt),
        paymentMethod: transaction.paymentMethod || 'Unknown',
        externalTransactionId: transaction.externalTransactionId,
        processingFee: '0.00', // Set actual processing fee if available
        paymentDetails: transaction.transactionDetails,
        // Additional metadata
        adminProcessor: transaction.adminProcessor || '', 
        ipAddress: transaction.ipAddress || user.lastIpAddress || '',
        country: transaction.country || user.country || '',
        investmentId: transaction.investmentId,
        planName: transaction.planName
      };
      
      // Generate receipt as base64 data URL
      const dataUrl = await generateReceiptAsBase64(receiptData);
      setReceiptDataUrl(dataUrl);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating receipt preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate receipt preview. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for downloading receipt
  const handleDownloadReceipt = async () => {
    if (!transaction || !user) return;
    
    setIsLoading(true);
    try {
      // Get user's full name
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Prepare receipt data
      const receiptData = {
        transactionId: transaction.id,
        userId: user.id,
        userName,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        status: transaction.status,
        date: new Date(transaction.createdAt),
        paymentMethod: transaction.paymentMethod || 'Unknown',
        externalTransactionId: transaction.externalTransactionId,
        processingFee: '0.00', // Set actual processing fee if available
        paymentDetails: transaction.transactionDetails,
        // Additional metadata
        adminProcessor: transaction.adminProcessor || '', 
        ipAddress: transaction.ipAddress || user.lastIpAddress || '',
        country: transaction.country || user.country || '',
        investmentId: transaction.investmentId,
        planName: transaction.planName
      };
      
      // Download receipt
      await downloadReceipt(receiptData);
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully.'
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for printing receipt
  const handlePrintReceipt = () => {
    if (!receiptDataUrl) {
      toast({
        title: 'Error',
        description: 'Please generate a receipt preview first.',
        variant: 'destructive'
      });
      return;
    }
    
    // Create a new window to print from
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Error',
        description: 'Pop-up blocked. Please allow pop-ups to print receipts.',
        variant: 'destructive'
      });
      return;
    }
    
    // Write receipt to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt #${transaction.id}</title>
        </head>
        <body style="margin: 0; padding: 0;">
          <iframe src="${receiptDataUrl}" style="width: 100%; height: 100vh; border: none;"></iframe>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 1000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handler for sending receipt by email
  const handleEmailReceipt = () => {
    toast({
      title: 'Coming Soon',
      description: 'Email receipt functionality will be available soon.'
    });
  };
  
  // Handler for opening delete confirmation dialog
  const openDeleteConfirmation = () => {
    if (!receiptDataUrl) {
      return;
    }
    setDeleteDialogOpen(true);
  };
  
  // Handler for confirming receipt deletion
  const confirmDeleteReceipt = () => {
    if (!receiptDataUrl) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Clear the receipt data
      setReceiptDataUrl(null);
      toast({
        title: 'Success',
        description: 'Receipt deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete receipt. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Transaction Receipt
            </DialogTitle>
            <DialogDescription>
              View, download or print your transaction receipt
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {!receiptDataUrl ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                <Receipt className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Receipt Generated</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Click the button below to generate a receipt for this transaction
                </p>
                <Button 
                  onClick={handlePreviewReceipt} 
                  disabled={isLoading || transaction?.status !== 'completed'}
                >
                  {isLoading ? 'Generating...' : 'Generate Receipt'}
                </Button>
                
                {transaction?.status !== 'completed' && (
                  <p className="text-sm text-amber-600 mt-4">
                    Note: Receipts are only available for completed transactions
                  </p>
                )}
              </div>
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Receipt Preview</TabsTrigger>
                  <TabsTrigger value="details">Transaction Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="border rounded-lg p-1">
                  <iframe
                    src={receiptDataUrl}
                    className="w-full min-h-[500px] border-0"
                    title="Receipt Preview"
                  />
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Transaction ID</h3>
                        <p>{transaction?.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Date</h3>
                        <p>{new Date(transaction?.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Type</h3>
                        <p className="capitalize">{transaction?.type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Amount</h3>
                        <p>{transaction?.currency} {transaction?.amount}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                        <p className="capitalize">{transaction?.status}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Payment Method</h3>
                        <p className="capitalize">{transaction?.paymentMethod || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {transaction?.transactionDetails && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Details</h3>
                        <p className="text-sm">{transaction.transactionDetails}</p>
                      </div>
                    )}
                    
                    {transaction?.externalTransactionId && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">External Transaction ID</h3>
                        <p className="text-sm font-mono">{transaction.externalTransactionId}</p>
                      </div>
                    )}
                    
                    {transaction?.adminProcessor && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Processed By</h3>
                        <p className="text-sm">{transaction.adminProcessor}</p>
                      </div>
                    )}
                    
                    {transaction?.ipAddress && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">IP Address</h3>
                        <p className="text-sm font-mono">{transaction.ipAddress}</p>
                      </div>
                    )}
                    
                    {transaction?.country && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Country</h3>
                        <p className="text-sm">{transaction.country}</p>
                      </div>
                    )}
                    
                    {transaction?.digitalSignature && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Digital Verification</h3>
                        <p className="text-sm font-mono text-xs break-all opacity-60">{transaction.digitalSignature}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {receiptDataUrl && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReceipt}
                    disabled={isLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReceipt}
                    disabled={isLoading}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailReceipt}
                    disabled={isLoading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openDeleteConfirmation}
                    disabled={isLoading}
                    className="border-red-200 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteReceipt}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete Receipt'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionReceipt;