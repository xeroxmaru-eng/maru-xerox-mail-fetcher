// app/layout.tsx
// Root layout — wraps everything with providers (Session, Theme, etc.)

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Maru Xerox Mail Fetcher',
  description: 'Securely fetch, view, and export Gmail sent emails for Maru Xerox — read-only Gmail access.',
  keywords: ['Maru Xerox', 'Gmail', 'email fetcher', 'sent mail', 'export'],
  robots: 'noindex, nofollow', // Internal enterprise app
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
