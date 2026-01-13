/**
 * HTML Sanitization Utility
 * 
 * Provides safe HTML sanitization using DOMPurify to prevent XSS attacks.
 * 
 * IMPORTANT: This module requires DOMPurify to be installed:
 *   npm install dompurify
 * 
 * Usage:
 * import { sanitizeBlogContentSync, sanitizeLeaseContentSync } from '@/utils/sanitize';
 * <div dangerouslySetInnerHTML={{ __html: sanitizeBlogContentSync(userContent) }} />
 * 
 * @module sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html, options = {}) => {
  if (typeof window === 'undefined' || !html) {
    return html || '';
  }

  try {
    // Default configuration - strict security
    const defaultOptions = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'b', 'i',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'style',
        'colspan', 'rowspan', 'target', 'rel'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      // Prevent script execution
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    };

    const config = { ...defaultOptions, ...options };
    return DOMPurify.sanitize(html, config);
  } catch (error) {
    console.error('[sanitizeHtml] Error sanitizing HTML:', error);
    // Return empty string on error to prevent XSS
    return '';
  }
};

/**
 * Sanitize HTML for blog posts
 * Allows more formatting options for rich content
 * 
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeBlogContent = (html) => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel']
  });
};

/**
 * Sanitize HTML for lease previews
 * Allows table formatting for lease documents
 * 
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeLeaseContent = (html) => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span'
    ],
    ALLOWED_ATTR: ['class', 'style', 'colspan', 'rowspan']
  });
};

/**
 * Synchronous sanitization functions for use with dangerouslySetInnerHTML
 * These are aliases for the main functions (which are already synchronous)
 */
export const sanitizeHtmlSync = sanitizeHtml;
export const sanitizeBlogContentSync = sanitizeBlogContent;
export const sanitizeLeaseContentSync = sanitizeLeaseContent;

export default sanitizeHtml;
