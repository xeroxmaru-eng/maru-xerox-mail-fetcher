'use client';
// components/dashboard/FilterPanel.tsx
// Email fetch filters form using React Hook Form + Zod

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, Hash, ChevronDown, RotateCcw, Loader2 } from 'lucide-react';
import { FetchFilters } from '@/types/email.types';
import { useState } from 'react';

// Zod validation schema containing only required fields
const filterSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  recipient: z.string().optional(),
  maxResults: z.number().min(1).max(500),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface FilterPanelProps {
  onFetch: (filters: FetchFilters) => void;
  isLoading: boolean;
}

interface InputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
  registration: ReturnType<ReturnType<typeof useForm<FilterFormValues>>['register']>;
}

function InputField({ id, label, placeholder, icon: Icon, type = 'text', registration }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium flex items-center gap-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'rgba(59,130,246,0.3)',
        } as React.CSSProperties}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export default function FilterPanel({ onFetch, isLoading }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { maxResults: 50 },
  });

  const onSubmit = (data: FilterFormValues) => {
    onFetch({
      fromDate: data.fromDate || undefined,
      toDate: data.toDate || undefined,
      recipient: data.recipient || undefined,
      maxResults: data.maxResults ?? 50,
    });
  };

  return (
    <div
      className="glass-card-solid overflow-hidden"
    >
      {/* Panel header */}
      <button
        id="filter-panel-toggle"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors"
        style={{ borderBottom: expanded ? '1px solid var(--border-color)' : 'none' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.12)' }}
          >
            <Search className="w-4 h-4" style={{ color: '#3b82f6' }} strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Fetch Emails
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Configure filters and fetch inbox emails
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="from-date"
                  label="From Date"
                  placeholder="Start date"
                  icon={Calendar}
                  type="date"
                  registration={register('fromDate')}
                />
                <InputField
                  id="to-date"
                  label="To Date"
                  placeholder="End date"
                  icon={Calendar}
                  type="date"
                  registration={register('toDate')}
                />
              </div>

              {/* Recipient + Max Results row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="recipient"
                  label="Recipient Email"
                  placeholder="e.g. prints.deluxe@gmail.com"
                  icon={User}
                  registration={register('recipient')}
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="max-results"
                    className="text-xs font-medium flex items-center gap-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                    Maximum Results
                  </label>
                  <select
                    id="max-results"
                    {...register('maxResults', { valueAsNumber: true })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value={25}>25 emails</option>
                    <option value={50}>50 emails</option>
                    <option value={100}>100 emails</option>
                    <option value={200}>200 emails</option>
                    <option value={500}>500 emails</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id="fetch-emails-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center min-w-[160px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" strokeWidth={2} />
                      Fetch Emails
                    </>
                  )}
                </button>

                {isDirty && !isLoading && (
                  <motion.button
                    id="reset-filters-btn"
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => reset()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

