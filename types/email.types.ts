// types/email.types.ts
// Central TypeScript interfaces for the Maru Xerox Mail Fetcher

export interface EmailMessage {
  id: string;
  date: string;       // "2024-01-15"
  time: string;       // "14:32"
  from: string[];     // array of sender email addresses (inbox)
  subject: string;
  bodyText: string;   // plain text version of the body
  bodyHtml: string;   // HTML version (sanitized before rendering)
  attachments: string[];  // array of attachment filenames
  attachmentCount: number;
}

export interface FetchFilters {
  fromDate?: string;        // ISO date string
  toDate?: string;          // ISO date string
  recipient?: string;       // filter by sender "From" address
  subjectKeyword?: string;  // filter by subject
  bodyKeyword?: string;     // filter by body content
  attachmentName?: string;  // filter by attachment filename
  maxResults: number;       // max emails to fetch (25 | 50 | 100)
}

export interface EmailStats {
  total: number;
  today: number;
  thisMonth: number;
  filtered: number;
}

export interface ApiEmailResponse {
  emails: EmailMessage[];
  totalFetched: number;
  query: string;
  error?: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'word';
  emails: EmailMessage[];
  filters: FetchFilters;
}

export type SortDirection = 'asc' | 'desc';
export type FilterMode = 'all' | 'has-attachments' | 'no-attachments';
export type PageSize = 25 | 50 | 100;
