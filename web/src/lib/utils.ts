import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    approved: 'text-green-600 bg-green-50',
    completed: 'text-green-600 bg-green-50',
    delivered: 'text-green-600 bg-green-50',
    in_progress: 'text-blue-600 bg-blue-50',
    planned: 'text-yellow-600 bg-yellow-50',
    draft: 'text-gray-600 bg-gray-50',
    pending: 'text-yellow-600 bg-yellow-50',
    rejected: 'text-red-600 bg-red-50',
    cancelled: 'text-red-600 bg-red-50',
    hold: 'text-orange-600 bg-orange-50',
    dispatched: 'text-purple-600 bg-purple-50',
    partial: 'text-blue-600 bg-blue-50',
    sent: 'text-blue-600 bg-blue-50',
    low: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50',
    healthy: 'text-green-600 bg-green-50',
  };
  return map[status?.toLowerCase()] || 'text-gray-600 bg-gray-50';
}
