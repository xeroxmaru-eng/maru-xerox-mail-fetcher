// app/api/emails/route.ts
// Protected API route for fetching Gmail inbox emails.
// Validates session, builds query, delegates to gmail.service.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchSentEmails } from '@/services/gmail.service';
import { buildGmailQuery } from '@/lib/utils';
import { ApiEmailResponse } from '@/types/email.types';

/**
 * GET /api/emails
 * Query params: fromDate, toDate, recipient, subjectKeyword, bodyKeyword, attachmentName, maxResults
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiEmailResponse>> {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user || !session.accessToken) {
      return NextResponse.json(
        { emails: [], totalFetched: 0, query: '', error: 'Unauthorized. Please sign in again.' },
        { status: 401 }
      );
    }

    // Handle expired token error
    if ((session as { error?: string }).error === 'RefreshAccessTokenError') {
      return NextResponse.json(
        { emails: [], totalFetched: 0, query: '', error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = req.nextUrl;
    const fromDate = searchParams.get('fromDate') ?? undefined;
    const toDate = searchParams.get('toDate') ?? undefined;
    const recipient = searchParams.get('recipient') ?? undefined;
    const subjectKeyword = searchParams.get('subjectKeyword') ?? undefined;
    const bodyKeyword = searchParams.get('bodyKeyword') ?? undefined;
    const attachmentName = searchParams.get('attachmentName') ?? undefined;
    const maxResultsParam = parseInt(searchParams.get('maxResults') ?? '50', 10);
    const maxResults = isNaN(maxResultsParam) ? 50 : Math.min(Math.max(maxResultsParam, 1), 500);

    // Build the Gmail search query
    const query = buildGmailQuery({
      fromDate,
      toDate,
      recipientEmail: recipient,
      subjectKeyword,
      bodyKeyword,
      attachmentName,
    });

    console.log('[API /emails] Generated query string:', query);

    // Fetch sent emails from Gmail API
    const emails = await fetchSentEmails(
      session.accessToken as string,
      query,
      maxResults
    );

    console.log(`[API /emails] Successfully fetched ${emails.length} emails from Gmail API`);

    return NextResponse.json({
      emails,
      totalFetched: emails.length,
      query,
    });
  } catch (error: unknown) {
    console.error('[API /emails] Full error:', JSON.stringify(error));

    // Handle specific Google API errors
    const googleError = error as { code?: number; message?: string; errors?: Array<{ message?: string; reason?: string }> };
    const detail = googleError?.errors?.[0]?.message ?? googleError?.message ?? 'Unknown error';

    if (googleError?.code === 401) {
      return NextResponse.json(
        { emails: [], totalFetched: 0, query: '', error: `Gmail auth expired (401): ${detail}. Please sign out and sign in again.` },
        { status: 401 }
      );
    }

    if (googleError?.code === 429) {
      return NextResponse.json(
        { emails: [], totalFetched: 0, query: '', error: 'Gmail rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (googleError?.code === 403) {
      return NextResponse.json(
        { emails: [], totalFetched: 0, query: '', error: `Permission denied (403): ${detail}. Please sign out and sign in again with Gmail access.` },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        emails: [],
        totalFetched: 0,
        query: '',
        error: `Error fetching emails: ${detail}`,
      },
      { status: 500 }
    );
  }
}
