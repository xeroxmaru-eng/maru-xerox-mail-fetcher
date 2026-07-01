'use client';
// components/dashboard/SearchBar.tsx
// Real-time search + filter mode + sort direction controls

import { motion } from 'framer-motion';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { FilterMode, SortDirection } from '@/types/email.types';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (dir: SortDirection) => void;
  totalCount: number;
  filteredCount: number;
}

const filterModes: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All Emails' },
  { value: 'has-attachments', label: 'Has Attachments' },
  { value: 'no-attachments', label: 'No Attachments' },
];

export default function SearchBar({
  query,
  onQueryChange,
  filterMode,
  onFilterModeChange,
  sortDirection,
  onSortDirectionChange,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
          strokeWidth={2}
        />
        <input
          id="email-search-input"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search subject, body, recipient, attachments…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
          aria-label="Search emails"
        />
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </motion.button>
        )}
      </div>

      {/* Filter mode */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Filter className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-color)' }}
          role="group"
          aria-label="Attachment filter"
        >
          {filterModes.map((mode) => (
            <button
              key={mode.value}
              id={`filter-mode-${mode.value}`}
              onClick={() => onFilterModeChange(mode.value)}
              className="px-3 py-2 text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: filterMode === mode.value
                  ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
                  : 'var(--bg-card)',
                color: filterMode === mode.value ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              aria-pressed={filterMode === mode.value}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort direction */}
      <button
        id="sort-direction-btn"
        onClick={() => onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex-shrink-0"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
        title={sortDirection === 'desc' ? 'Currently: Newest First' : 'Currently: Oldest First'}
      >
        <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={2} />
        {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
      </button>

      {/* Count badge */}
      {totalCount > 0 && (
        <motion.div
          key={filteredCount}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background: 'rgba(59,130,246,0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          {filteredCount} / {totalCount}
        </motion.div>
      )}
    </div>
  );
}
