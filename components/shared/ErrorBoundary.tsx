'use client';
// components/shared/ErrorBoundary.tsx
// React Error Boundary with friendly UI for unexpected errors

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Inline error alert for API/fetch errors (not an Error Boundary).
 */
export function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3 animate-fade-in"
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
          Error
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs px-2 py-1 rounded-md transition-colors flex-shrink-0"
          style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
