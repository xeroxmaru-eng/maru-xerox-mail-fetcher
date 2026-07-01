// app/login/page.tsx
// Login page — Google sign-in with Maru Xerox branding

import type { Metadata } from 'next';
import LoginCard from '@/components/auth/LoginCard';

export const metadata: Metadata = {
  title: 'Sign In — Maru Xerox Mail Fetcher',
  description: 'Sign in with your Google account to access Maru Xerox Mail Fetcher.',
};

export default function LoginPage() {
  return (
    <main
      className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3b82f6, #1e40af)',
            animation: 'float1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #6366f1, #4f46e5)',
            animation: 'float2 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #06b6d4, #0284c7)',
            animation: 'float3 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid overlay pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <LoginCard />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.08); }
          66% { transform: translate(30px, -30px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </main>
  );
}
