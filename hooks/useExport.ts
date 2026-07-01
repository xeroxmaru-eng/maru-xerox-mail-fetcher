// hooks/useExport.ts
// Hook to handle exporting emails to Excel, PDF, and Word formats

'use client';

import { useState, useCallback } from 'react';
import { EmailMessage, FetchFilters } from '@/types/email.types';

interface UseExportReturn {
  isExporting: boolean;
  exportError: string | null;
  exportToExcel: (emails: EmailMessage[], filters: FetchFilters) => Promise<void>;
  exportToPdf: (emails: EmailMessage[], filters: FetchFilters) => Promise<void>;
  exportToWord: (emails: EmailMessage[], filters: FetchFilters) => Promise<void>;
}

/**
 * Lazily imports the heavy export libraries so they don't bloat
 * the initial JS bundle. Downloads trigger immediately on call.
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToExcel = useCallback(
    async (emails: EmailMessage[], filters: FetchFilters) => {
      if (emails.length === 0) {
        setExportError('No emails to export. Please fetch emails first.');
        return;
      }
      setIsExporting(true);
      setExportError(null);
      try {
        const { exportToExcel: doExport } = await import('@/exports/excel.export');
        await doExport(emails, filters);
      } catch (err) {
        setExportError('Failed to generate Excel file. Please try again.');
        console.error('[useExport] Excel export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportToPdf = useCallback(
    async (emails: EmailMessage[], filters: FetchFilters) => {
      if (emails.length === 0) {
        setExportError('No emails to export. Please fetch emails first.');
        return;
      }
      setIsExporting(true);
      setExportError(null);
      try {
        const { exportToPdf: doExport } = await import('@/exports/pdf.export');
        await doExport(emails, filters);
      } catch (err) {
        setExportError('Failed to generate PDF file. Please try again.');
        console.error('[useExport] PDF export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportToWord = useCallback(
    async (emails: EmailMessage[], filters: FetchFilters) => {
      if (emails.length === 0) {
        setExportError('No emails to export. Please fetch emails first.');
        return;
      }
      setIsExporting(true);
      setExportError(null);
      try {
        const { exportToWord: doExport } = await import('@/exports/word.export');
        await doExport(emails, filters);
      } catch (err) {
        setExportError('Failed to generate Word file. Please try again.');
        console.error('[useExport] Word export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { isExporting, exportError, exportToExcel, exportToPdf, exportToWord };
}
