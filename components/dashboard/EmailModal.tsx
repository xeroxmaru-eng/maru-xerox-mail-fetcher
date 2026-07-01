'use client';
// components/dashboard/EmailModal.tsx
// Full email body viewer modal with sanitized HTML rendering

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Paperclip, Mail, Calendar, Clock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EmailMessage } from '@/types/email.types';
import { sanitizeHtml } from '@/utils/sanitize';
import { copyToClipboard } from '@/lib/utils';
import AttachmentChip from './AttachmentChip';

interface EmailModalProps {
  email: EmailMessage | null;
  onClose: () => void;
}

export default function EmailModal({ email, onClose }: EmailModalProps) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (email) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [email]);

  const handleCopySubject = async () => {
    if (!email) return;
    await copyToClipboard(email.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = async () => {
    if (!email) return;
    await copyToClipboard(email.bodyText);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const sanitizedBody = email?.bodyHtml
    ? sanitizeHtml(email.bodyHtml)
    : email?.bodyText?.replace(/\n/g, '<br />') ?? '';

  return (
    <AnimatePresence>
      {email && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Email: ${email.subject}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-start gap-4 px-6 py-5 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-color)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.12)' }}
                >
                  <Mail className="w-5 h-5" style={{ color: '#3b82f6' }} strokeWidth={1.8} />
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="text-base font-semibold leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {email.subject}
                  </h2>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <User className="w-3 h-3" />
                      {email.from.join(', ')}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Calendar className="w-3 h-3" />
                      {email.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" />
                      {email.time}
                    </span>
                    {email.attachmentCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: '#3b82f6' }}>
                        <Paperclip className="w-3 h-3" />
                        {email.attachmentCount} attachment{email.attachmentCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Close */}
                <button
                  id="modal-close-btn"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                  aria-label="Close email"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Attachments */}
              {email.attachments.length > 0 && (
                <div
                  className="px-6 py-3 flex flex-wrap gap-2 flex-shrink-0"
                  style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}
                >
                  <span className="text-xs font-medium self-center" style={{ color: 'var(--text-muted)' }}>
                    Attachments:
                  </span>
                  {email.attachments.map((att) => (
                    <AttachmentChip key={att} name={att} />
                  ))}
                </div>
              )}

              {/* Email body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed"
                  style={{ color: 'var(--text-primary)' }}
                  dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                />
              </div>

              {/* Footer actions */}
              <div
                className="px-6 py-4 flex items-center gap-3 flex-shrink-0 flex-wrap"
                style={{ borderTop: '1px solid var(--border-color)' }}
              >
                <button
                  id="copy-subject-btn"
                  onClick={handleCopySubject}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: copiedSubject ? '#10b981' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedSubject ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSubject ? 'Copied!' : 'Copy Subject'}
                </button>

                <button
                  id="copy-body-btn"
                  onClick={handleCopyBody}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: copiedBody ? '#10b981' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedBody ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedBody ? 'Copied!' : 'Copy Body'}
                </button>

                <div className="ml-auto">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
