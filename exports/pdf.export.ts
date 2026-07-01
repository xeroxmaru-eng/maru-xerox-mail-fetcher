// exports/pdf.export.ts
// PDF export using pdf-lib — generates a professional report

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { EmailMessage, FetchFilters } from '@/types/email.types';
import { generateExportFilename, downloadBlob } from '@/lib/utils';

// Brand colors
const BRAND_R = 0.118, BRAND_G = 0.251, BRAND_B = 0.686; // #1e40af
const LIGHT_R = 0.937, LIGHT_G = 0.961, LIGHT_B = 1.0;    // #EFF6FF

const PAGE_WIDTH = 841.89;  // A4 landscape width
const PAGE_HEIGHT = 595.28; // A4 landscape height
const MARGIN = 40;

/**
 * Helper to draw text safely (truncates if too long for cell).
 */
function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0.1, 0.1, 0.1),
  maxWidth?: number
) {
  let displayText = String(text ?? '');
  if (maxWidth && font.widthOfTextAtSize(displayText, size) > maxWidth - 4) {
    while (
      displayText.length > 0 &&
      font.widthOfTextAtSize(displayText + '…', size) > maxWidth - 4
    ) {
      displayText = displayText.slice(0, -1);
    }
    displayText += '…';
  }
  page.drawText(displayText, { x, y, size, font, color });
}

/**
 * Exports emails to a PDF report document.
 */
export async function exportToPdf(
  emails: EmailMessage[],
  filters: FetchFilters
): Promise<void> {
  const doc = await PDFDocument.create();
  doc.setTitle('Maru Xerox — Inbox Emails Report');
  doc.setAuthor('Maru Xerox Mail Fetcher');
  doc.setCreationDate(new Date());

  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  // ── Cover / Info Page ────────────────────────────────────────
  const coverPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // Header bar
  coverPage.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 100,
    width: PAGE_WIDTH,
    height: 100,
    color: rgb(BRAND_R, BRAND_G, BRAND_B),
  });

  coverPage.drawText('MARU XEROX', {
    x: MARGIN,
    y: PAGE_HEIGHT - 45,
    size: 22,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText('Inbox Mail Export Report', {
    x: MARGIN,
    y: PAGE_HEIGHT - 72,
    size: 13,
    font: regularFont,
    color: rgb(0.8, 0.9, 1),
  });

  // Export details
  let infoY = PAGE_HEIGHT - 130;
  const infoData = [
    ['Export Date:', new Date().toLocaleString()],
    ['Total Emails:', emails.length.toString()],
    ['From Date:', filters.fromDate ?? 'Not set'],
    ['To Date:', filters.toDate ?? 'Not set'],
    ['Recipient Filter:', filters.recipient ?? 'Not set'],
    ['Subject Filter:', filters.subjectKeyword ?? 'Not set'],
    ['Body Keyword:', filters.bodyKeyword ?? 'Not set'],
    ['Max Results:', filters.maxResults.toString()],
  ];

  for (const [label, value] of infoData) {
    coverPage.drawText(label, {
      x: MARGIN,
      y: infoY,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    coverPage.drawText(value, {
      x: MARGIN + 130,
      y: infoY,
      size: 10,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    infoY -= 20;
  }

  // ── Data Pages ───────────────────────────────────────────────
  const ROWS_PER_PAGE = 15;
  const ROW_H = 28;
  const HEADER_H = 30;
  const TABLE_TOP = PAGE_HEIGHT - MARGIN - 30;
  const TABLE_BOTTOM = MARGIN + 20;

  // Column definitions [label, x, width]
  const cols: [string, number, number][] = [
    ['Date',       MARGIN,       60],
    ['Time',       MARGIN + 60,  40],
    ['From',       MARGIN + 100, 120],
    ['To',         MARGIN + 220, 120],
    ['Subject',    MARGIN + 340, 160],
    ['Body',       MARGIN + 500, 160],
    ['Attachments',MARGIN + 660, 100],
  ];

  for (let pageIdx = 0; pageIdx < Math.ceil(emails.length / ROWS_PER_PAGE); pageIdx++) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const slice = emails.slice(pageIdx * ROWS_PER_PAGE, (pageIdx + 1) * ROWS_PER_PAGE);
    const pageNum = pageIdx + 1;
    const totalPages = Math.ceil(emails.length / ROWS_PER_PAGE);

    // Table header background
    page.drawRectangle({
      x: MARGIN,
      y: TABLE_TOP - HEADER_H,
      width: PAGE_WIDTH - MARGIN * 2,
      height: HEADER_H,
      color: rgb(BRAND_R, BRAND_G, BRAND_B),
    });

    // Header labels
    for (const [label, x] of cols) {
      drawText(page, label, x + 4, TABLE_TOP - HEADER_H + 10, boldFont, 8, rgb(1, 1, 1));
    }

    // Data rows
    slice.forEach((email, rowIdx) => {
      const rowY = TABLE_TOP - HEADER_H - (rowIdx + 1) * ROW_H;

      // Alternate row background
      if (rowIdx % 2 === 0) {
        page.drawRectangle({
          x: MARGIN,
          y: rowY,
          width: PAGE_WIDTH - MARGIN * 2,
          height: ROW_H,
          color: rgb(LIGHT_R, LIGHT_G, LIGHT_B),
        });
      }

      const values = [
        email.date,
        email.time,
        email.from.join(', '),
        email.to.join(', '),
        email.subject,
        email.bodyText,
        email.attachments.join(', '),
      ];

      cols.forEach(([, x, width], colIdx) => {
        drawText(
          page,
          values[colIdx],
          x + 4,
          rowY + 9,
          regularFont,
          7,
          rgb(0.15, 0.15, 0.15),
          width
        );
      });

      // Row bottom border
      page.drawLine({
        start: { x: MARGIN, y: rowY },
        end: { x: PAGE_WIDTH - MARGIN, y: rowY },
        thickness: 0.3,
        color: rgb(0.85, 0.9, 0.97),
      });
    });

    // Page number footer
    page.drawText(`Page ${pageNum} of ${totalPages} — Maru Xerox Mail Fetcher`, {
      x: MARGIN,
      y: TABLE_BOTTOM - 15,
      size: 7,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Outer table border
    page.drawRectangle({
      x: MARGIN,
      y: TABLE_TOP - HEADER_H - slice.length * ROW_H,
      width: PAGE_WIDTH - MARGIN * 2,
      height: HEADER_H + slice.length * ROW_H,
      borderColor: rgb(0.7, 0.8, 0.95),
      borderWidth: 0.5,
    });
  }

  const pdfBytes = await doc.save();
  downloadBlob(pdfBytes, generateExportFilename('pdf'), 'application/pdf');
}
