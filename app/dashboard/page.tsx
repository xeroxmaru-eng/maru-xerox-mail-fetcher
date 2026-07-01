'use client';
// app/dashboard/page.tsx
// Main Dashboard Page for Maru Xerox Mail Fetcher

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import StatsCards from '@/components/dashboard/StatsCards';
import FilterPanel from '@/components/dashboard/FilterPanel';
import SearchBar from '@/components/dashboard/SearchBar';
import EmailTable from '@/components/dashboard/EmailTable';
import EmailModal from '@/components/dashboard/EmailModal';
import ExportMenu from '@/components/dashboard/ExportMenu';
import { ErrorAlert, ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useEmails } from '@/hooks/useEmails';
import { useTableFilters } from '@/hooks/useTableFilters';
import { EmailMessage } from '@/types/email.types';

export default function DashboardPage() {
  const {
    emails,
    isLoading,
    error,
    fetchEmails,
    clearError,
  } = useEmails();

  const {
    searchQuery,
    filterMode,
    sortDirection,
    filteredEmails,
    setSearchQuery,
    setFilterMode,
    setSortDirection,
  } = useTableFilters(emails);

  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage, analyze, and export your Gmail Inbox.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExportMenu
              emails={filteredEmails}
              filters={{
                maxResults: emails.length, // use length or search criteria as fallback
              }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert message={error} onDismiss={clearError} />
        )}

        {/* Stats Cards */}
        <ErrorBoundary>
          <StatsCards
            emails={emails}
            filteredCount={filteredEmails.length}
            isLoading={isLoading}
          />
        </ErrorBoundary>

        {/* Fetch Filters Panel */}
        <ErrorBoundary>
          <FilterPanel onFetch={fetchEmails} isLoading={isLoading} />
        </ErrorBoundary>

        {/* Table & Filtering Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              sortDirection={sortDirection}
              onSortDirectionChange={setSortDirection}
              totalCount={emails.length}
              filteredCount={filteredEmails.length}
            />
          </div>

          <ErrorBoundary>
            <EmailTable
              emails={filteredEmails}
              isLoading={isLoading}
              onViewEmail={setSelectedEmail}
            />
          </ErrorBoundary>
        </div>
      </main>

      {/* Full Email Modal */}
      <EmailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
}
