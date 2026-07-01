'use client';
// components/dashboard/FilterPanel.tsx
// Email fetch filters form - asks for recipient email first

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Hash, ChevronDown, RotateCcw, Loader2, Terminal, AtSign, Send } from 'lucide-react';
import { FetchFilters } from '@/types/email.types';

const filterSchema = z.object({
  recipientEmail: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  maxResults: z.number().min(1).max(500),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface FilterPanelProps {
  onFetch: (filters: FetchFilters) => void;
  isLoading: boolean;
}

function buildQueryPreview(values: FilterFormValues): string {
  const parts: string[] = [];
  if (values.recipientEmail?.trim()) {
    parts.push(values.recipientEmail.trim());
  } else {
    parts.push('in:sent');
  }
  if (values.fromDate) parts.push(`after:${values.fromDate.replace(/-/g, '/')}`);
  if (values.toDate) {
    const d = new Date(values.toDate);
    d.setDate(d.getDate() + 1);
    parts.push(`before:${d.toISOString().split('T')[0].replace(/-/g, '/')}`);
  }
  return parts.join(' ');
}

export default function FilterPanel({ onFetch, isLoading }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const { register, handleSubmit, reset, control, formState: { isDirty, errors } } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { maxResults: 50 },
  });

  const watchedValues = useWatch({ control });
  const queryPreview = buildQueryPreview(watchedValues as FilterFormValues);

  const onSubmit = (data: FilterFormValues) => {
    onFetch({
      fromDate: data.fromDate || undefined,
      toDate: data.toDate || undefined,
      recipient: data.recipientEmail || undefined,
      maxResults: data.maxResults ?? 50,
    });
  };

  return (
    <div className="glass-card-solid overflow-hidden">
      {/* Header */}
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
            <Send className="w-4 h-4" style={{ color: '#3b82f6' }} strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Fetch Sent Emails
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enter a recipient email to see all emails you sent to them
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

              {/* ── HERO: Recipient Email ── */}
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1.5px solid rgba(59,130,246,0.25)' }}
              >
                <label
                  htmlFor="recipient-email"
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: '#3b82f6' }}
                >
                  <AtSign className="w-4 h-4" />
                  Whose emails do you want to fetch?
                </label>
                <input
                  id="recipient-email"
                  type="email"
                  placeholder="Enter recipient email  e.g. prints.deluxe@gmail.com"
                  {...register('recipientEmail')}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all font-medium"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1.5px solid rgba(59,130,246,0.4)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Leave blank to fetch all sent emails (no recipient filter)
                </p>
                {errors.recipientEmail && (
                  <p className="text-xs text-red-400">{errors.recipientEmail.message}</p>
                )}
              </div>

              {/* Date + Max Results row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="from-date" className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    From Date
                  </label>
                  <input
                    id="from-date"
                    type="date"
                    {...register('fromDate')}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="to-date" className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    To Date (inclusive)
                  </label>
                  <input
                    id="to-date"
                    type="date"
                    {...register('toDate')}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="max-results" className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                    Maximum Results
                  </label>
                  <select
                    id="max-results"
                    {...register('maxResults', { valueAsNumber: true })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
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
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Terminal className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#10b981' }}>Gmail Query Preview</p>
                  <code className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>{queryPreview}</code>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
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
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium"
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
