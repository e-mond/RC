/**
 * Security: HTML Sanitization Tests
 * 
 * Tests for XSS protection via DOMPurify sanitization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeHtml, sanitizeBlogContentSync, sanitizeLeaseContentSync } from '../sanitize';

describe('HTML Sanitization', () => {
  beforeEach(() => {
    // Mock DOMPurify if needed
    vi.clearAllMocks();
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("XSS")');
      expect(sanitized).toContain('Safe content');
    });

    it('should remove event handlers', () => {
      const malicious = '<img src=x onerror=alert(1)>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert(1)');
    });

    it('should remove iframe tags', () => {
      const malicious = '<iframe src="https://evil.com"></iframe><p>Content</p>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('evil.com');
      expect(sanitized).toContain('Content');
    });

    it('should preserve safe HTML', () => {
      const safe = '<p>Safe content</p><strong>Bold text</strong>';
      const sanitized = sanitizeHtml(safe);
      
      expect(sanitized).toContain('Safe content');
      expect(sanitized).toContain('Bold text');
    });

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });
  });

  describe('sanitizeBlogContentSync', () => {
    it('should sanitize blog post content', () => {
      const malicious = '<script>alert("XSS")</script><h1>Blog Title</h1><p>Content</p>';
      const sanitized = sanitizeBlogContentSync(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Blog Title');
      expect(sanitized).toContain('Content');
    });

    it('should allow blog formatting tags', () => {
      const content = '<h1>Title</h1><p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      const sanitized = sanitizeBlogContentSync(content);
      
      expect(sanitized).toContain('Title');
      expect(sanitized).toContain('Paragraph');
      expect(sanitized).toContain('Bold');
      expect(sanitized).toContain('Italic');
    });
  });

  describe('sanitizeLeaseContentSync', () => {
    it('should sanitize lease preview content', () => {
      const malicious = '<script>alert("XSS")</script><table><tr><td>Data</td></tr></table>';
      const sanitized = sanitizeLeaseContentSync(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Data');
    });

    it('should allow table formatting', () => {
      const content = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>';
      const sanitized = sanitizeLeaseContentSync(content);
      
      expect(sanitized).toContain('Header');
      expect(sanitized).toContain('Data');
    });
  });
});
