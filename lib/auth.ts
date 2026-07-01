// lib/auth.ts
// NextAuth.js v5 configuration with Google OAuth + Gmail read-only scope

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

/**
 * NextAuth configuration.
 * - Uses Google provider with gmail.readonly scope only.
 * - Persists accessToken and refreshToken in JWT for API calls.
 * - Handles token refresh automatically when expired.
 */
export const authConfig: NextAuthConfig = {
  // Required on Vercel — without this, OAuth callbacks and session cookies can break in production.
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * JWT callback — stores Google access/refresh tokens in JWT.
     * Also handles token refresh when access token has expired.
     */
    async jwt({ token, account }) {
      // On initial sign-in, account object is present
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        return token;
      }

      // Return token if it hasn't expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token expired — attempt refresh
      return await refreshAccessToken(token);
    },

    /**
     * Session callback — exposes accessToken to client session.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

/**
 * Refreshes the Google access token using the refresh token.
 */
async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
