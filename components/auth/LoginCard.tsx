'use client';
// components/auth/LoginCard.tsx
// Animated login card with Google Sign-In button

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Eye, Download } from 'lucide-react';

const features = [
  { icon: Shield, label: 'Secure OAuth 2.0 — read-only access' },
  { icon: Eye, label: 'View your sent emails in a beautiful dashboard' },
  { icon: Download, label: 'Export to Excel, PDF, or Word' },
];

export default function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-solid w-full max-w-md p-8 relative z-10"
    >
      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 glow"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
          }}
        >
          <Mail className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          Maru Xerox
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm font-medium mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Mail Fetcher
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-16 h-0.5 mt-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
        />
      </div>

      {/* Feature list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="space-y-3 mb-8"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.1)' }}
            >
              <f.icon className="w-4 h-4" style={{ color: 'var(--brand-500, #3b82f6)' }} strokeWidth={1.8} />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {f.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Divider */}
      <div
        className="h-px w-full mb-6"
        style={{ background: 'var(--border-color)' }}
      />

      {/* Google Sign-In Button */}
      <motion.button
        id="google-signin-btn"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        onClick={handleSignIn}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 relative overflow-hidden"
        style={{
          background: isLoading
            ? 'var(--bg-tertiary)'
            : 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
          color: 'white',
          boxShadow: isLoading
            ? 'none'
            : '0 4px 20px rgba(37, 99, 235, 0.35), 0 1px 3px rgba(0,0,0,0.1)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span style={{ color: 'var(--text-secondary)' }}>Connecting to Google…</span>
          </>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffffcc"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff99"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ffffffcc"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </motion.button>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-xs text-center mt-4"
        style={{ color: 'var(--text-muted)' }}
      >
        🔒 Read-only Gmail access. We never store your emails or passwords.
      </motion.p>
    </motion.div>
  );
}
