// lib/utils.ts
// Shared utility functions used across the application

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isThisMonth, parseISO } from 'date-fns';

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string to a human-readable date.
 */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO date string to time only (HH:mm).
 */
export function formatTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'HH:mm');
  } catch {
    return '';
  }
}

/**
 * Truncates text to a given length and appends ellipsis.
 */
export function truncate(text: string, maxLength: number = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Copies text to clipboard and returns success boolean.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a date string is today.
 */
export function isDateToday(dateStr: string): boolean {
  try {
    return isToday(parseISO(dateStr));
  } catch {
    return false;
  }
}

/**
 * Checks if a date string is in the current month.
 */
export function isDateThisMonth(dateStr: string): boolean {
  try {
    return isThisMonth(parseISO(dateStr));
  } catch {
    return false;
  }
}

/**
 * Builds a Gmail search query string from filter parameters.
 */
export function buildGmailQuery(filters: {
  fromDate?: string;
  toDate?: string;
  recipientEmail?: string;
  subjectKeyword?: string;
  bodyKeyword?: string;
  attachmentName?: string;
}): string {
  const parts: string[] = [];

  if (filters.recipientEmail?.trim()) {
    // Search the email address directly (matches sent, received, and WeTransfer notifications)
    parts.push(filters.recipientEmail.trim());
  } else {
    // Default to sent emails when no recipient is specified
    parts.push('in:sent');
  }

  if (filters.fromDate) {
    parts.push(`after:${filters.fromDate.replace(/-/g, '/')}`);
  }
  if (filters.toDate) {
    // before: is exclusive in Gmail, so add 1 day to make toDate inclusive
    const d = new Date(filters.toDate);
    d.setDate(d.getDate() + 1);
    const inclusive = d.toISOString().split('T')[0].replace(/-/g, '/');
    parts.push(`before:${inclusive}`);
  }
  if (filters.subjectKeyword) {
    parts.push(`subject:${filters.subjectKeyword}`);
  }
  if (filters.bodyKeyword) {
    parts.push(filters.bodyKeyword);
  }
  if (filters.attachmentName) {
    parts.push(`filename:${filters.attachmentName}`);
  }

  return parts.join(' ');
}

/**
 * Generates a filename with current timestamp for exports.
 */
export function generateExportFilename(format: 'xlsx' | 'pdf' | 'docx'): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `maru-xerox-sent-emails-${timestamp}.${format}`;
}

/**
 * Converts a Uint8Array or ArrayBuffer to a Blob and triggers download.
 */
export function downloadBlob(data: Uint8Array | ArrayBuffer, filename: string, mimeType: string): void {
  const blob = new Blob([data as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
