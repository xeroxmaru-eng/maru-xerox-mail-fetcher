// services/gmail.service.ts
// Gmail API abstraction layer — read-only inbox mail fetching
// IMPORTANT: This service NEVER modifies, deletes, or sends emails.

import { google } from 'googleapis';
import { EmailMessage } from '@/types/email.types';

/**
 * Creates an authenticated Gmail API client using the user's access token.
 */
function createGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

/**
 * Decodes a base64url encoded string (used for Gmail message payloads).
 */
function decodeBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * Extracts plain text and HTML body parts from a Gmail message payload.
 * Recursively handles multipart messages.
 */
function extractBody(payload: {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: Array<{
    mimeType?: string;
    body?: { data?: string; size?: number };
    parts?: unknown[];
  }>;
}): { text: string; html: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  // Direct body (non-multipart)
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    text = decodeBase64Url(payload.body.data);
  } else if (payload.mimeType === 'text/html' && payload.body?.data) {
    html = decodeBase64Url(payload.body.data);
  }

  // Multipart — recurse into parts
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const extracted = extractBody(part as Parameters<typeof extractBody>[0]);
      if (extracted.text) text = extracted.text;
      if (extracted.html) html = extracted.html;
    }
  }

  return { text, html };
}

/**
 * Extracts attachment filenames from a Gmail message payload.
 * Does NOT download attachment data — only reads filenames.
 */
function extractAttachments(payload: {
  mimeType?: string;
  filename?: string;
  body?: { attachmentId?: string };
  parts?: unknown[];
}): string[] {
  const attachments: string[] = [];

  if (!payload) return attachments;

  // Check if this part itself is an attachment
  if (
    payload.filename &&
    payload.filename.length > 0 &&
    payload.body?.attachmentId
  ) {
    attachments.push(payload.filename);
  }

  // Recurse into parts
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const nested = extractAttachments(part as Parameters<typeof extractAttachments>[0]);
      attachments.push(...nested);
    }
  }

  return attachments;
}

/**
 * Parses a Gmail message header value by name.
 */
function getHeader(
  headers: Array<{ name?: string | null; value?: string | null }>,
  name: string
): string {
  const header = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  );
  return header?.value ?? '';
}

/**
 * Parses the Date header into separate date and time strings.
 */
function parseDateHeader(dateStr: string): { date: string; time: string } {
  try {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) throw new Error('Invalid date');

    const date = parsed.toISOString().split('T')[0]; // "2024-01-15"
    const time = parsed.toTimeString().slice(0, 5);   // "14:32"
    return { date, time };
  } catch {
    return { date: '', time: '' };
  }
}

/**
 * Parses "From" header into an array of email addresses.
 */
function parseFromHeader(fromStr: string): string[] {
  if (!fromStr) return [];
  return fromStr
    .split(',')
    .map((addr) => {
      // Extract just the email from "Name <email>" format
      const match = addr.match(/<([^>]+)>/);
      return match ? match[1].trim() : addr.trim();
    })
    .filter(Boolean);
}

/**
 * Fetches inbox emails from Gmail based on the provided query and options.
 * This is the main exported function used by the API route.
 *
 * @param accessToken - User's Google OAuth access token
 * @param query - Gmail search query string (e.g., "in:inbox after:2024/01/01")
 * @param maxResults - Maximum number of messages to return
 * @returns Array of parsed EmailMessage objects
 */
export async function fetchInboxEmails(
  accessToken: string,
  query: string,
  maxResults: number = 50
): Promise<EmailMessage[]> {
  const gmail = createGmailClient(accessToken);

  // Step 1: Get list of message IDs matching the query
  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    labelIds: ['INBOX'],
    maxResults: Math.min(maxResults, 500), // Gmail API hard limit safety
  });

  console.log('[Gmail Service] listResponse data:', JSON.stringify(listResponse.data));

  const messages = listResponse.data.messages ?? [];
  if (messages.length === 0) return [];

  // Step 2: Fetch full message details in parallel (batched to avoid rate limits)
  const BATCH_SIZE = 10;
  const emails: EmailMessage[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map((msg) =>
        gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        })
      )
    );

    for (const result of batchResults) {
      if (result.status === 'rejected') continue;

      const msgData = result.value.data;
      const headers = msgData.payload?.headers ?? [];

      const dateStr = getHeader(headers, 'Date');
      const { date, time } = parseDateHeader(dateStr);
      const fromStr = getHeader(headers, 'From');
      const subject = getHeader(headers, 'Subject');

      const { text: bodyText, html: bodyHtml } = extractBody(
        msgData.payload as Parameters<typeof extractBody>[0] ?? {}
      );
      const attachments = extractAttachments(
        msgData.payload as Parameters<typeof extractAttachments>[0] ?? {}
      );

      emails.push({
        id: msgData.id ?? '',
        date,
        time,
        from: parseFromHeader(fromStr),
        subject: subject || '(No Subject)',
        bodyText: bodyText || '(No body)',
        bodyHtml,
        attachments,
        attachmentCount: attachments.length,
      });
    }
  }

  // Sort newest first by default
  emails.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateB - dateA;
  });

  return emails;
}
