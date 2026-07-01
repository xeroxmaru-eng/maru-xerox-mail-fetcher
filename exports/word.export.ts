// exports/word.export.ts
// Word export using docx library — generates a professional .docx document

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import { EmailMessage, FetchFilters } from '@/types/email.types';
import { generateExportFilename, downloadBlob } from '@/lib/utils';

const BRAND_COLOR = '1e40af';
const HEADER_BG = 'dbeafe';

/**
 * Creates a styled table cell for the header row.
 */
function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.SOLID, color: BRAND_COLOR },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '1d4ed8' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '1d4ed8' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '1d4ed8' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '1d4ed8' },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 18,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

/**
 * Creates a styled table cell for a data row.
 */
function dataCell(text: string, width: number, isAlt: boolean): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: isAlt
      ? { type: ShadingType.SOLID, color: HEADER_BG }
      : { type: ShadingType.SOLID, color: 'FFFFFF' },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'DBEAFE' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DBEAFE' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'DBEAFE' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'DBEAFE' },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '',
            size: 16,
            color: '1e293b',
          }),
        ],
      }),
    ],
  });
}

/**
 * Exports emails to a formatted Word (.docx) document.
 */
export async function exportToWord(
  emails: EmailMessage[],
  filters: FetchFilters
): Promise<void> {
  // Column widths in DXA (twentieths of a point, ~1440 DXA = 1 inch)
  const colWidths = [1400, 900, 2400, 2800, 4000, 2000];

  // Build header row
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Date', colWidths[0]),
      headerCell('Time', colWidths[1]),
      headerCell('Sender(s)', colWidths[2]),
      headerCell('Subject', colWidths[3]),
      headerCell('Body', colWidths[4]),
      headerCell('Attachments', colWidths[5]),
    ],
  });

  // Build data rows
  const dataRows = emails.map((email, index) => {
    const isAlt = index % 2 === 1;
    return new TableRow({
      children: [
        dataCell(email.date, colWidths[0], isAlt),
        dataCell(email.time, colWidths[1], isAlt),
        dataCell(email.from.join(', '), colWidths[2], isAlt),
        dataCell(email.subject, colWidths[3], isAlt),
        dataCell(email.bodyText.slice(0, 200), colWidths[4], isAlt),
        dataCell(email.attachments.join('\n'), colWidths[5], isAlt),
      ],
    });
  });

  const table = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Applied filters summary
  const filterLines = [
    `Export Date: ${new Date().toLocaleString()}`,
    `Total Emails: ${emails.length}`,
    filters.fromDate ? `From Date: ${filters.fromDate}` : null,
    filters.toDate ? `To Date: ${filters.toDate}` : null,
    filters.recipient ? `Recipient: ${filters.recipient}` : null,
    filters.subjectKeyword ? `Subject Keyword: ${filters.subjectKeyword}` : null,
    filters.bodyKeyword ? `Body Keyword: ${filters.bodyKeyword}` : null,
    filters.attachmentName ? `Attachment Name: ${filters.attachmentName}` : null,
    `Max Results: ${filters.maxResults}`,
  ].filter(Boolean) as string[];

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'MARU XEROX — Inbox Mail Export Report',
                    bold: true,
                    color: BRAND_COLOR,
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: '64748b',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '64748b',
                  }),
                  new TextRun({
                    text: ' — Maru Xerox Mail Fetcher — Confidential',
                    size: 16,
                    color: '64748b',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            text: 'Maru Xerox — Inbox Mail Report',
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'Maru Xerox — Inbox Mail Report',
                bold: true,
                size: 32,
                color: BRAND_COLOR,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Filter summary
          new Paragraph({
            children: [
              new TextRun({
                text: 'Export Details',
                bold: true,
                size: 22,
                color: '334155',
              }),
            ],
            spacing: { before: 100, after: 100 },
          }),

          ...filterLines.map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({ text: line, size: 18, color: '475569' }),
                ],
                spacing: { after: 60 },
              })
          ),

          // Spacer
          new Paragraph({ text: '', spacing: { after: 300 } }),

          // Email table
          table,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  downloadBlob(buffer, generateExportFilename('docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
