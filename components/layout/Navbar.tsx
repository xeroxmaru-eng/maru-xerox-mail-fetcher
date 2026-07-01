'use client';
// components/layout/Navbar.tsx
// Top navigation bar with logo, user profile, theme toggle, and logout

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LogOut, ChevronDown, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  const user = session?.user;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Mail className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
              Maru Xerox
            </p>
            <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Mail Fetcher
            </p>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <motion.button
              id="user-menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span
                className="hidden md:block text-sm font-medium max-w-[140px] truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name ?? user?.email ?? 'User'}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                style={{
                  color: 'var(--text-muted)',
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl z-50 overflow-hidden"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xl)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {user?.name}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {user?.email}
                      </p>
                    </div>

                    {/* Sign out */}
                    <button
                      id="signout-btn"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                      style={{
                        color: signingOut ? 'var(--text-muted)' : '#ef4444',
                        cursor: signingOut ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!signingOut) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
