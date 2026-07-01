// app/page.tsx
// Root route — redirects to /login or /dashboard based on auth

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  redirect('/login');
}
