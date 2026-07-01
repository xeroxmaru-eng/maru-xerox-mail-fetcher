'use client';
// components/dashboard/AttachmentChip.tsx
// Small chip/badge component for displaying attachment filenames

import { Paperclip } from 'lucide-react';

interface AttachmentChipProps {
  name: string;
}

export default function AttachmentChip({ name }: AttachmentChipProps) {
  // Get file extension for coloring
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  const getColor = (extension: string): { color: string; bg: string; border: string } => {
    const colorMap: Record<string, { color: string; bg: string; border: string }> = {
      pdf: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' },
      doc: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
      docx: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
      xls: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' },
      xlsx: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' },
      ppt: { color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.2)' },
      pptx: { color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.2)' },
      jpg: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
      jpeg: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
      png: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
      gif: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
      zip: { color: '#92400e', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.2)' },
      rar: { color: '#92400e', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.2)' },
      ai: { color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' },
      psd: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
      cdr: { color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)' },
    };
    return colorMap[extension] ?? { color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' };
  };

  const colors = getColor(ext);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105"
      style={{
        color: colors.color,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      title={name}
    >
      <Paperclip className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={2.5} />
      <span className="max-w-[120px] truncate">{name}</span>
    </span>
  );
}
