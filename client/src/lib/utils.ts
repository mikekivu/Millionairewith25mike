import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency = 'USDT'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toFixed(2)} ${currency}`;
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getTransactionStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'arrow-down';
    case 'withdrawal':
      return 'arrow-up';
    case 'investment':
      return 'trending-up';
    case 'referral':
      return 'users';
    default:
      return 'circle';
  }
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

export function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}

export function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.clipboard) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        resolve(false);
      }
    } else {
      navigator.clipboard.writeText(text).then(
        () => resolve(true),
        () => resolve(false)
      );
    }
  });
}
