import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency = 'USDT', options = {}) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0 ${currency}`;
  }
  
  return `${numAmount.toFixed(2)} ${currency}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatShortDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function truncateMiddle(str: string, startChars = 6, endChars = 4, separator = '...') {
  if (str.length <= startChars + endChars) {
    return str;
  }
  
  return `${str.substring(0, startChars)}${separator}${str.substring(str.length - endChars)}`;
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return 'text-green-500 bg-green-50';
    case 'pending':
    case 'processing':
      return 'text-yellow-500 bg-yellow-50';
    case 'inactive':
    case 'failed':
    case 'rejected':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
}

export function calculateTotalReferrals(genealogyTree: Record<number, any[]>) {
  return Object.values(genealogyTree).reduce((acc, level) => acc + level.length, 0);
}

export function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getDefaultPaymentSetup() {
  return {
    intent: "CAPTURE",
    currency: "USD",
    isLoading: false
  };
}
