// hooks/useTableFilters.ts
// Client-side filtering, searching, and sorting state for the email table

'use client';

import { useState, useMemo, useCallback } from 'react';
import { EmailMessage, FilterMode, SortDirection } from '@/types/email.types';

interface UseTableFiltersReturn {
  searchQuery: string;
  filterMode: FilterMode;
  sortDirection: SortDirection;
  filteredEmails: EmailMessage[];
  setSearchQuery: (q: string) => void;
  setFilterMode: (mode: FilterMode) => void;
  setSortDirection: (dir: SortDirection) => void;
  clearFilters: () => void;
}

/**
 * Manages client-side email filtering:
 * - Full-text search across subject, body, recipient, and attachment names
 * - Attachment presence filter (all / has-attachments / no-attachments)
 * - Sort direction (newest first / oldest first)
 */
export function useTableFilters(emails: EmailMessage[]): UseTableFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredEmails = useMemo(() => {
    let result = [...emails];

    // 1. Full-text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (email) =>
          email.subject.toLowerCase().includes(q) ||
          email.bodyText.toLowerCase().includes(q) ||
          email.to.some((addr) => addr.toLowerCase().includes(q)) ||
          email.attachments.some((att) => att.toLowerCase().includes(q))
      );
    }

    // 2. Attachment filter
    if (filterMode === 'has-attachments') {
      result = result.filter((e) => e.attachmentCount > 0);
    } else if (filterMode === 'no-attachments') {
      result = result.filter((e) => e.attachmentCount === 0);
    }

    // 3. Sort direction
    result.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [emails, searchQuery, filterMode, sortDirection]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterMode('all');
    setSortDirection('desc');
  }, []);

  return {
    searchQuery,
    filterMode,
    sortDirection,
    filteredEmails,
    setSearchQuery,
    setFilterMode,
    setSortDirection,
    clearFilters,
  };
}
