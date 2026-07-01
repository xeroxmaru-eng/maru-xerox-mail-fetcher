'use client';
// components/dashboard/EmailTable.tsx
// Main email table using TanStack Table v8 with sorting, pagination, actions

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown,
  Inbox, ChevronUp,
} from 'lucide-react';
import { EmailMessage, PageSize } from '@/types/email.types';
import { truncate, copyToClipboard } from '@/lib/utils';
import AttachmentChip from './AttachmentChip';
import Pagination from './Pagination';
import TableSkeleton from '@/components/shared/LoadingSkeleton';
import { useSession } from 'next-auth/react';

interface EmailTableProps {
  emails: EmailMessage[];
  isLoading: boolean;
  onViewEmail: (email: EmailMessage) => void;
}

const columnHelper = createColumnHelper<EmailMessage>();

// Action cell component to handle individual row copy state
function ActionCell({
  email,
  onView,
}: {
  email: EmailMessage;
  onView: () => void;
}) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleCopySubject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(email.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(email.bodyText);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        id={`view-email-${email.id}`}
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
        style={{
          background: 'rgba(59,130,246,0.1)',
          color: '#3b82f6',
          border: '1px solid rgba(59,130,246,0.2)',
          cursor: 'pointer',
        }}
        title="View full email"
      >
        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="hidden lg:inline">View</span>
      </button>

      <button
        id={`copy-subject-${email.id}`}
        onClick={handleCopySubject}
        className="p-1.5 rounded-lg transition-all"
        style={{
          background: copiedSubject ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
          color: copiedSubject ? '#10b981' : 'var(--text-muted)',
          border: `1px solid ${copiedSubject ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
          cursor: 'pointer',
        }}
        title="Copy subject"
      >
        {copiedSubject
          ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
        }
      </button>

      <button
        id={`copy-body-${email.id}`}
        onClick={handleCopyBody}
        className="p-1.5 rounded-lg transition-all"
        style={{
          background: copiedBody ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
          color: copiedBody ? '#10b981' : 'var(--text-muted)',
          border: `1px solid ${copiedBody ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
          cursor: 'pointer',
        }}
        title="Copy body"
      >
        {copiedBody
          ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
        }
      </button>
    </div>
  );
}

export default function EmailTable({ emails, isLoading, onViewEmail }: EmailTableProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const handlePageSizeChange = useCallback((size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Paginate emails
  const totalCount = emails.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageEmails = emails.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = [
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => (
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
          {info.getValue()}
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor('time', {
      header: 'Time',
      cell: (info) => (
        <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
          {info.getValue()}
        </span>
      ),
      size: 70,
    }),
    columnHelper.accessor('from', {
      header: 'Correspondent',
      cell: (info) => {
        const email = info.row.original;
        const isSentByUser = email.from.some(
          (addr) => addr.toLowerCase() === userEmail
        );
        const displayAddresses = isSentByUser ? email.to : email.from;
        const prefix = isSentByUser ? 'To: ' : 'From: ';

        return (
          <div className="max-w-[200px]">
            <span className="text-[10px] uppercase font-bold tracking-wider block mb-0.5" style={{ color: isSentByUser ? '#3b82f6' : '#10b981' }}>
              {prefix}
            </span>
            {displayAddresses.slice(0, 2).map((addr) => (
              <div key={addr} className="text-xs truncate" style={{ color: 'var(--text-secondary)' }} title={addr}>
                {addr}
              </div>
            ))}
            {displayAddresses.length > 2 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                +{displayAddresses.length - 2} more
              </span>
            )}
          </div>
        );
      },
      size: 180,
    }),
    columnHelper.accessor('subject', {
      header: 'Subject',
      cell: (info) => (
        <div
          className="text-sm font-medium max-w-[220px] truncate"
          style={{ color: 'var(--text-primary)' }}
          title={info.getValue()}
        >
          {info.getValue()}
        </div>
      ),
      size: 220,
    }),
    columnHelper.accessor('bodyText', {
      header: 'Preview',
      enableSorting: false,
      cell: (info) => (
        <p
          className="text-xs max-w-[200px] line-clamp-2"
          style={{ color: 'var(--text-muted)' }}
          title={info.getValue()}
        >
          {truncate(info.getValue(), 150)}
        </p>
      ),
      size: 200,
    }),
    columnHelper.accessor('attachments', {
      header: 'Attachments',
      enableSorting: false,
      cell: (info) => {
        const atts = info.getValue();
        if (atts.length === 0) {
          return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[160px]">
            {atts.slice(0, 3).map((att) => (
              <AttachmentChip key={att} name={att} />
            ))}
            {atts.length > 3 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              >
                +{atts.length - 3}
              </span>
            )}
          </div>
        );
      },
      size: 180,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionCell email={row.original} onView={() => onViewEmail(row.original)} />
      ),
      size: 120,
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: pageEmails,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  if (isLoading) return <TableSkeleton rows={8} />;

  if (!isLoading && emails.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(59,130,246,0.1)' }}
        >
          <Inbox className="w-8 h-8" style={{ color: '#3b82f6' }} strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          No emails found
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Use the filters above to fetch inbox emails from your Gmail account.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            {/* Table head */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap select-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(29,78,216,0.95), rgba(79,70,229,0.95))',
                        color: 'rgba(255,255,255,0.9)',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        width: header.column.getSize(),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="opacity-60">
                            {header.column.getIsSorted() === 'asc'
                              ? <ArrowUp className="w-3 h-3" />
                              : header.column.getIsSorted() === 'desc'
                              ? <ArrowDown className="w-3 h-3" />
                              : <ArrowUpDown className="w-3 h-3" />
                            }
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table body */}
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="email-table-row"
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                    }}
                    onClick={() => onViewEmail(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Scroll to top */}
      {emails.length > 10 && (
        <div className="flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Back to top
          </button>
        </div>
      )}
    </div>
  );
}
