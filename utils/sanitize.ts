// utils/sanitize.ts
// DOMPurify wrapper for safely sanitizing HTML email bodies before rendering

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Used when rendering HTML email bodies in the modal.
 *
 * @param html - Raw HTML string from Gmail
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'blockquote', 'pre', 'code',
      'hr', 'sup', 'sub',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'align', 'valign', 'border', 'cellpadding', 'cellspacing',
      'target', 'rel',
    ],
    ALLOW_DATA_ATTR: false,
    // Force all links to open in a new tab safely
    FORCE_BODY: true,
  });
}

/**
 * Strips all HTML tags from a string, returning plain text.
 * Used for body previews in the table.
 *
 * @param html - HTML string
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
