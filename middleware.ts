// middleware.ts
// Route protection — redirects unauthenticated users to /login

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!(req as { auth?: { user?: unknown } }).auth?.user;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if not authenticated and not on a public route
  if (!isLoggedIn && !isPublicRoute && !pathname.startsWith('/api/auth')) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if already logged in and visiting login
  if (isLoggedIn && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files, images, and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
