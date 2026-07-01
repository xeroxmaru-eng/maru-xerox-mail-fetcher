// hooks/useEmails.ts
// Custom hook for fetching and managing Gmail inbox emails

'use client';

import { useState, useCallback } from 'react';
import { EmailMessage, FetchFilters, ApiEmailResponse } from '@/types/email.types';

interface UseEmailsReturn {
  emails: EmailMessage[];
  isLoading: boolean;
  error: string | null;
  lastQuery: string;
  totalFetched: number;
  fetchEmails: (filters: FetchFilters) => Promise<void>;
  clearEmails: () => void;
  clearError: () => void;
}

/**
 * Manages the email fetch lifecycle:
 * - Builds query from filters
 * - Calls the /api/emails route
 * - Manages loading, error, and data state
 */
export function useEmails(): UseEmailsReturn {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [totalFetched, setTotalFetched] = useState(0);

  const fetchEmails = useCallback(async (filters: FetchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);
      if (filters.recipient) params.set('recipient', filters.recipient);
      if (filters.subjectKeyword) params.set('subjectKeyword', filters.subjectKeyword);
      if (filters.bodyKeyword) params.set('bodyKeyword', filters.bodyKeyword);
      if (filters.attachmentName) params.set('attachmentName', filters.attachmentName);
      params.set('maxResults', filters.maxResults.toString());

      const response = await fetch(`/api/emails?${params.toString()}`, {
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          response.redirected
            ? 'Session expired or invalid. Please sign out and sign in again.'
            : 'Unexpected server response. Check Vercel environment variables (AUTH_SECRET, AUTH_URL).'
        );
      }

      const data: ApiEmailResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `Server error: ${response.status}`);
      }

      setEmails(data.emails);
      setTotalFetched(data.totalFetched);
      setLastQuery(data.query);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setError(message);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearEmails = useCallback(() => {
    setEmails([]);
    setTotalFetched(0);
    setLastQuery('');
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    emails,
    isLoading,
    error,
    lastQuery,
    totalFetched,
    fetchEmails,
    clearEmails,
    clearError,
  };
}
