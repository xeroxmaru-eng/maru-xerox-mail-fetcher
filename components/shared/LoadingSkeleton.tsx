'use client';
// components/shared/LoadingSkeleton.tsx
// Reusable skeleton loading states for the email table

import { motion } from 'framer-motion';

interface SkeletonRowProps {
  columns?: number;
}

function SkeletonCell({ width = 'w-full' }: { width?: string }) {
  return (
    <div
      className={`h-4 rounded ${width} skeleton`}
    />
  );
}

export function TableRowSkeleton({ columns = 7 }: SkeletonRowProps) {
  const widths = ['w-20', 'w-14', 'w-32', 'w-48', 'w-full', 'w-24', 'w-16'];
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonCell width={widths[i] ?? 'w-full'} />
        </td>
      ))}
    </tr>
  );
}

export function StatsCardSkeleton() {
  return (
    <div
      className="glass-card-solid p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded skeleton" />
        <div className="h-10 w-10 rounded-xl skeleton" />
      </div>
      <div className="h-8 w-16 rounded skeleton" />
      <div className="h-3 w-32 rounded skeleton" />
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
}

export default function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden rounded-xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Fake header */}
      <div
        className="px-4 py-3 flex gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(29,78,216,0.9), rgba(79,70,229,0.9))',
        }}
      >
        {['w-20', 'w-14', 'w-32', 'w-48', 'w-full', 'w-24', 'w-16'].map((w, i) => (
          <div key={i} className={`h-4 rounded ${w} opacity-30`} style={{ background: 'white' }} />
        ))}
      </div>

      {/* Fake rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
