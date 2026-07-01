'use client';
// components/dashboard/Pagination.tsx
// Pagination controls for the email table

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageSize } from '@/types/email.types';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: PageSize;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

const PAGE_SIZES: PageSize[] = [25, 50, 100];

function PageButton({
  onClick,
  disabled,
  active,
  children,
  id,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className="min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center"
      style={{
        background: active
          ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
          : 'var(--bg-card)',
        color: active ? 'white' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        border: active ? 'none' : '1px solid var(--border-color)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: active ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1 && totalCount <= PAGE_SIZES[0]) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to display
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2"
    >
      {/* Left: count info + page size */}
      <div className="flex items-center gap-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Showing{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {startItem}–{endItem}
          </span>{' '}
          of{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {totalCount}
          </span>
        </p>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Per page:</span>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}
          >
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                id={`page-size-${size}`}
                onClick={() => onPageSizeChange(size)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: pageSize === size
                    ? 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
                    : 'var(--bg-card)',
                  color: pageSize === size ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                aria-pressed={pageSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <PageButton
            id="page-first-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </PageButton>

          <PageButton
            id="page-prev-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </PageButton>

          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <span
                key={`dots-${i}`}
                className="min-w-[36px] h-9 flex items-center justify-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                …
              </span>
            ) : (
              <PageButton
                key={page}
                id={`page-${page}-btn`}
                onClick={() => onPageChange(page as number)}
                active={currentPage === page}
              >
                {page}
              </PageButton>
            )
          )}

          <PageButton
            id="page-next-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </PageButton>

          <PageButton
            id="page-last-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </PageButton>
        </div>
      )}
    </motion.div>
  );
}
