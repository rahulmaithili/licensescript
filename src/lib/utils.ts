import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  if (dateString.startsWith('9999')) return 'Lifetime (Never)';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function calculateDaysLeft(expiryDateStr: string | null | undefined): { days: number; text: string; isExpired: boolean; isLifetime: boolean } {
  if (!expiryDateStr || expiryDateStr.startsWith('9999')) {
    return { days: 9999, text: 'Lifetime', isExpired: false, isLifetime: true };
  }
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, text: `Expired ${Math.abs(diffDays)}d ago`, isExpired: true, isLifetime: false };
  }
  if (diffDays === 0) {
    return { days: 0, text: 'Expires Today', isExpired: false, isLifetime: false };
  }
  return { days: diffDays, text: `${diffDays} days left`, isExpired: false, isLifetime: false };
}

export function maskLicenseKey(key: string): string {
  if (!key || key.length < 10) return key;
  const parts = key.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-••••-••••-${parts[parts.length - 1]}`;
  }
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
