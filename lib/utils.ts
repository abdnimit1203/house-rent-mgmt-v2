import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function getMonthName(month: number): string {
  return MONTHS[month - 1] ?? 'Unknown';
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}
