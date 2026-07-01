'use client';
// components/dashboard/FilterPanel.tsx
// Email fetch filters form using React Hook Form + Zod

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, Hash, ChevronDown, RotateCcw, Loader2, Terminal } from 'lucide-react';
import { FetchFilters } from '@/types/email.types';

// Zod validation schema
const filterSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  senderEmail: z.string().optional(),
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
  hint?: string;
  registration: ReturnType<ReturnType<typeof useForm<FilterFormValues>>['register']>;
}

function InputField({ id, label, placeholder, icon: Icon, type = 'text', hint, registration }: InputFieldProps) {
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
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {hint && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
}

function buildQueryPreview(values: FilterFormValues): string {
  const parts: string[] = ['in:inbox'];
  if (values.fromDate) parts.push(`after:${values.fromDate.replace(/-/g, '/')}`);
  if (values.toDate) {
    const d = new Date(values.toDate);
    d.setDate(d.getDate() + 1);
    parts.push(`before:${d.toISOString().split('T')[0].replace(/-/g, '/')}`);
  }
  if (values.senderEmail?.trim()) parts.push(`from:${values.senderEmail.trim()}`);
  return parts.join(' ');
}

export default function FilterPanel({ onFetch, isLoading }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const { register, handleSubmit, reset, control, formState: { isDirty } } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { maxResults: 50 },
  });

  const watchedValues = useWatch({ control });
  const queryPreview = buildQueryPreview(watchedValues as FilterFormValues);

  const onSubmit = (data: FilterFormValues) => {
    onFetch({
      fromDate: data.fromDate || undefined,
      toDate: data.toDate || undefined,
      recipient: data.senderEmail || undefined,
      maxResults: data.maxResults ?? 50,
    });
  };

  return (
    <div className="glass-card-solid overflow-hidden">
      <button
        id="filter-panel-toggle"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors"
        style={{ borderBottom: expanded ? '1px solid var(--border-color)' : 'none' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Search className="w-4 h-4" style={{ color: '#3b82f6' }} strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Fetch Inbox Emails</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Leave all fields blank to fetch all latest inbox emails
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
                  label="To Date (inclusive)"
                  placeholder="End date"
                  icon={Calendar}
                  type="date"
                  registration={register('toDate')}
                />
              </div>

              {/* Sender + Max Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="sender-email"
                  label="Filter by Sender (optional)"
                  placeholder="Leave blank for ALL senders"
                  icon={User}
                  hint="Only fill this to narrow to emails FROM a specific address"
                  registration={register('senderEmail')}
                />
                <div className="space-y-1.5">
                  <label htmlFor="max-results" className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                    Maximum Results
                  </label>
                  <select
                    id="max-results"
                    {...register('maxResults', { valueAsNumber: true })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value={25}>25 emails</option>
                    <option value={50}>50 emails</option>
                    <option value={100}>100 emails</option>
                    <option value={200}>200 emails</option>
                    <option value={500}>500 emails</option>
                  </select>
                </div>
              </div>

              {/* Live Gmail Query Preview */}
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Terminal className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#3b82f6' }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#3b82f6' }}>Gmail Query Preview</p>
                  <code className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>{queryPreview}</code>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  id="fetch-emails-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center min-w-[160px]"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Fetching…</>
                  ) : (
                    <><Search className="w-4 h-4" strokeWidth={2} />Fetch Emails</>
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
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
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
