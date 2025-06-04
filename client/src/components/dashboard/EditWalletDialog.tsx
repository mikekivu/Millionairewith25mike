
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Plus, Minus, Settings } from 'lucide-react';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  walletBalance: string;
}

interface EditWalletDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditWalletDialog({ user, open, onOpenChange }: EditWalletDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'set' | 'add' | 'subtract'>('add');
  const [notes, setNotes] = useState('');

  const updateWalletMutation = useMutation({
    mutationFn: async ({ userId, amount, action, notes }: { 
      userId: number; 
      amount: string; 
      action: string; 
      notes: string; 
    }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/wallet`, {
        amount,
        action,
        notes
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Wallet Updated",
        description: `${user?.firstName} ${user?.lastName}'s wallet balance has been updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onOpenChange(false);
      setAmount('');
      setNotes('');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update wallet balance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    updateWalletMutation.mutate({
      userId: user.id,
      amount,
      action,
      notes
    });
  };

  const getActionIcon = () => {
    switch (action) {
      case 'add':
        return <Plus className="h-4 w-4" />;
      case 'subtract':
        return <Minus className="h-4 w-4" />;
      case 'set':
        return <Settings className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getActionDescription = () => {
    if (!amount || !user) return '';
    
    const currentBalance = parseFloat(user.walletBalance);
    const adjustAmount = parseFloat(amount);
    
    switch (action) {
      case 'add':
        return `New balance will be: ${formatCurrency((currentBalance + adjustAmount).toString(), 'USD')}`;
      case 'subtract':
        return `New balance will be: ${formatCurrency(Math.max(0, currentBalance - adjustAmount).toString(), 'USD')}`;
      case 'set':
        return `New balance will be: ${formatCurrency(adjustAmount.toString(), 'USD')}`;
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Edit Wallet Balance
          </DialogTitle>
          <DialogDescription>
            {user && (
              <>
                Update wallet balance for <strong>{user.firstName} {user.lastName}</strong>
                <br />
                Current balance: <strong>{formatCurrency(user.walletBalance, 'USD')}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(value: 'set' | 'add' | 'subtract') => setAction(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add to balance
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4" />
                      Subtract from balance
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Set balance to
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {amount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                {getActionIcon()}
                <span className="font-medium">{getActionDescription()}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for balance adjustment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateWalletMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateWalletMutation.isPending || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2"
            >
              {updateWalletMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  {getActionIcon()}
                  Update Balance
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
