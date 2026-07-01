// exports/excel.export.ts
// Excel export using ExcelJS — produces a formatted .xlsx file

import ExcelJS from 'exceljs';
import { EmailMessage, FetchFilters } from '@/types/email.types';
import { generateExportFilename, downloadBlob } from '@/lib/utils';

const BRAND_COLOR = '1e40af'; // Deep blue - Maru Xerox brand
const HEADER_TEXT_COLOR = 'FFFFFF';
const ALT_ROW_COLOR = 'EFF6FF';

/**
 * Exports an array of EmailMessage objects to a formatted Excel workbook.
 *
 * @param emails - Filtered emails to export
 * @param filters - Applied filters (shown in metadata sheet)
 */
export async function exportToExcel(
  emails: EmailMessage[],
  filters: FetchFilters
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // Metadata
  workbook.creator = 'Maru Xerox Mail Fetcher';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ── Sheet 1: Emails ──────────────────────────────────────────
  const sheet = workbook.addWorksheet('Inbox Emails', {
    views: [{ state: 'frozen', ySplit: 1 }], // Freeze header row
    properties: { tabColor: { argb: BRAND_COLOR } },
  });

  // Define columns
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Time', key: 'time', width: 10 },
    { header: 'Sender(s)', key: 'from', width: 35 },
    { header: 'Subject', key: 'subject', width: 45 },
    { header: 'Body', key: 'body', width: 60 },
    { header: 'Attachments', key: 'attachments', width: 40 },
    { header: 'Attachment Count', key: 'attachmentCount', width: 18 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BRAND_COLOR },
    };
    cell.font = {
      bold: true,
      color: { argb: HEADER_TEXT_COLOR },
      size: 11,
      name: 'Calibri',
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: '1d4ed8' } },
      bottom: { style: 'thin', color: { argb: '1d4ed8' } },
      left: { style: 'thin', color: { argb: '1d4ed8' } },
      right: { style: 'thin', color: { argb: '1d4ed8' } },
    };
  });

  // Add data rows
  emails.forEach((email, index) => {
    const row = sheet.addRow({
      date: email.date,
      time: email.time,
      from: email.from.join(', '),
      subject: email.subject,
      body: email.bodyText,
      attachments: email.attachments.join('\n'),
      attachmentCount: email.attachmentCount,
    });

    row.height = 40;

    // Alternate row shading
    const isAlt = index % 2 === 1;
    row.eachCell((cell) => {
      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: ALT_ROW_COLOR },
        };
      }
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'DBEAFE' } },
        bottom: { style: 'thin', color: { argb: 'DBEAFE' } },
        left: { style: 'thin', color: { argb: 'DBEAFE' } },
        right: { style: 'thin', color: { argb: 'DBEAFE' } },
      };
      cell.font = { name: 'Calibri', size: 10 };
    });
  });

  // Enable AutoFilter on header row
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  // ── Sheet 2: Export Info ─────────────────────────────────────
  const infoSheet = workbook.addWorksheet('Export Info');
  infoSheet.getColumn(1).width = 25;
  infoSheet.getColumn(2).width = 40;

  const infoRows = [
    ['Exported By', 'Maru Xerox Mail Fetcher'],
    ['Export Date', new Date().toLocaleString()],
    ['Total Emails', emails.length.toString()],
    ['From Date', filters.fromDate ?? 'Not set'],
    ['To Date', filters.toDate ?? 'Not set'],
    ['Recipient Filter', filters.recipient ?? 'Not set'],
    ['Subject Filter', filters.subjectKeyword ?? 'Not set'],
    ['Body Keyword', filters.bodyKeyword ?? 'Not set'],
    ['Attachment Filter', filters.attachmentName ?? 'Not set'],
    ['Max Results', filters.maxResults.toString()],
  ];

  infoRows.forEach(([label, value]) => {
    const row = infoSheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, name: 'Calibri' };
    row.getCell(2).font = { name: 'Calibri' };
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(buffer as ArrayBuffer, generateExportFilename('xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
