'use client';
// components/dashboard/ExportMenu.tsx
// Dropdown menu for exporting emails to Excel, PDF, or Word

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, File, ChevronDown, Loader2 } from 'lucide-react';
import { EmailMessage, FetchFilters } from '@/types/email.types';
import { useExport } from '@/hooks/useExport';

interface ExportMenuProps {
  emails: EmailMessage[];
  filters: FetchFilters;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  action: 'excel' | 'pdf' | 'word';
}

const exportOptions: ExportOption[] = [
  {
    id: 'export-excel',
    label: 'Export to Excel',
    description: 'Formatted .xlsx with styling',
    icon: FileSpreadsheet,
    color: '#16a34a',
    bgColor: 'rgba(22,163,74,0.1)',
    action: 'excel',
  },
  {
    id: 'export-pdf',
    label: 'Export to PDF',
    description: 'Professional report with cover page',
    icon: FileText,
    color: '#dc2626',
    bgColor: 'rgba(220,38,38,0.1)',
    action: 'pdf',
  },
  {
    id: 'export-word',
    label: 'Export to Word',
    description: 'Formatted .docx document',
    icon: File,
    color: '#2563eb',
    bgColor: 'rgba(37,99,235,0.1)',
    action: 'word',
  },
];

export default function ExportMenu({ emails, filters }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportError, exportToExcel, exportToPdf, exportToWord } = useExport();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (action: 'excel' | 'pdf' | 'word') => {
    setOpen(false);
    switch (action) {
      case 'excel': await exportToExcel(emails, filters); break;
      case 'pdf': await exportToPdf(emails, filters); break;
      case 'word': await exportToWord(emails, filters); break;
    }
  };

  const isEmpty = emails.length === 0;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        id="export-menu-btn"
        onClick={() => !isEmpty && !isExporting && setOpen((v) => !v)}
        whileHover={{ scale: isEmpty || isExporting ? 1 : 1.02 }}
        whileTap={{ scale: isEmpty || isExporting ? 1 : 0.98 }}
        disabled={isEmpty || isExporting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: isEmpty || isExporting
            ? 'var(--bg-tertiary)'
            : 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
          color: isEmpty || isExporting ? 'var(--text-muted)' : 'white',
          cursor: isEmpty || isExporting ? 'not-allowed' : 'pointer',
          border: isEmpty || isExporting ? '1px solid var(--border-color)' : 'none',
          boxShadow: isEmpty || isExporting ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" strokeWidth={2} />
        )}
        {isExporting ? 'Exporting…' : 'Export'}
        {!isExporting && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </motion.button>

      {exportError && (
        <p
          className="absolute top-full mt-1 right-0 text-xs whitespace-nowrap px-2 py-1 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
        >
          {exportError}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl z-30 overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-1.5">
              <p
                className="text-xs font-medium px-3 py-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Export {emails.length} email{emails.length !== 1 ? 's' : ''}
              </p>

              {exportOptions.map((opt) => (
                <button
                  key={opt.action}
                  id={opt.id}
                  role="menuitem"
                  onClick={() => handleExport(opt.action)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = opt.bgColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: opt.bgColor }}
                  >
                    <opt.icon className="w-5 h-5" style={{ color: opt.color }} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {opt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
