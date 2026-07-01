// app/api/debug/route.ts
// Debug endpoint — shows session token status and Gmail API raw response

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !session.accessToken) {
      return NextResponse.json({
        status: 'NO_SESSION',
        user: null,
        error: 'Not authenticated',
      });
    }

    const tokenPreview = (session.accessToken as string).slice(0, 20) + '...';

    try {
      const authClient = new google.auth.OAuth2();
      authClient.setCredentials({ access_token: session.accessToken as string });
      const gmail = google.gmail({ version: 'v1', auth: authClient });

      const listResult = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:inbox',
        maxResults: 5,
      });

      return NextResponse.json({
        status: 'OK',
        user: session.user?.email,
        tokenPreview,
        sessionError: (session as { error?: string }).error ?? null,
        gmailQuery: 'in:inbox',
        resultCount: listResult.data.messages?.length ?? 0,
        estimatedTotal: listResult.data.resultSizeEstimate ?? 0,
        messageIds: listResult.data.messages?.map((m) => m.id) ?? [],
      });
    } catch (gmailErr: unknown) {
      const ge = gmailErr as { code?: number; message?: string; errors?: Array<{ message?: string; reason?: string }> };
      return NextResponse.json({
        status: 'GMAIL_ERROR',
        user: session.user?.email,
        tokenPreview,
        sessionError: (session as { error?: string }).error ?? null,
        gmailErrorCode: ge?.code,
        gmailErrorMessage: ge?.message,
        gmailErrorDetail: ge?.errors,
      });
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ status: 'SERVER_ERROR', message: e?.message });
  }
}
