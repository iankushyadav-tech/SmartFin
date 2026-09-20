import { ExpenseCategory, IncomeType } from '../types';

/**
 * Format currency in Indian numbering system (e.g. ₹25,000, ₹2,230, ₹450)
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  
  const isNegative = amount < 0;
  const absValue = Math.abs(Math.round(amount));
  
  // Format with en-IN locale
  const formatted = absValue.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Format date string into human friendly format (e.g. "20 Sep 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculate relative days remaining
 */
export function getDaysRemaining(deadlineDate: string): { days: number; text: string; isPast: boolean } {
  const target = new Date(deadlineDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)} days overdue`, isPast: true };
  } else if (diffDays === 0) {
    return { days: 0, text: 'Due today', isPast: false };
  } else if (diffDays === 1) {
    return { days: 1, text: '1 day left', isPast: false };
  } else {
    return { days: diffDays, text: `${diffDays} days left`, isPast: false };
  }
}

/**
 * Category color mappings
 */
export function getCategoryBadge(category: ExpenseCategory): {
  color: string;
  bg: string;
  border: string;
  text: string;
} {
  switch (category) {
    case 'Food':
      return {
        color: '#f97316',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
      };
    case 'Travel':
      return {
        color: '#0ea5e9',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-700',
      };
    case 'Education':
      return {
        color: '#8b5cf6',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
      };
    case 'Shopping':
      return {
        color: '#ec4899',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        text: 'text-pink-700',
      };
    case 'Entertainment':
      return {
        color: '#f43f5e',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
      };
    case 'Bills':
      return {
        color: '#64748b',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        text: 'text-slate-700',
      };
    case 'Healthcare':
      return {
        color: '#10b981',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
      };
    case 'Other':
    default:
      return {
        color: '#6b7280',
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-700',
      };
  }
}

/**
 * Income Type badges
 */
export function getIncomeTypeBadge(type: IncomeType): {
  bg: string;
  border: string;
  text: string;
} {
  switch (type) {
    case 'Pocket Money':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    case 'Scholarship':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    case 'Part-time Job':
      return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' };
    case 'Freelance':
      return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' };
    case 'Other':
    default:
      return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' };
  }
}
