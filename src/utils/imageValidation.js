// src/utils/imageValidation.js
// cSpell:ignore placehold loremflickr dummyimage picsum Csvg Crect Ctext

/**
 * Image Validation Utilities
 * 
 * Provides helper functions for validating and filtering image URLs
 * to prevent broken or malicious URLs while allowing legitimate Cloudinary uploads.
 * 
 * Key Improvements (Feb 2025):
 * - Trusts real Cloudinary URLs from successful uploads
 * - Removed over-strict fake version check that blocked real timestamps
 * - Maintains protection against obvious placeholders and invalid formats
 */

/**
 * Validates if a string is a valid HTTP/HTTPS image URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  // Must start with http:// or https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false;
  }

  // Basic length sanity check (Cloudinary URLs are usually 60–150 chars)
  if (url.length < 20) return false;

  // Special handling for Cloudinary URLs - trust them if they look complete
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    const afterUpload = url.split("/image/upload/")[1] || "";
    // Must have version or filename after /upload/
    if (afterUpload.trim().length > 0) {
      return true; // TRUST THIS URL - it came from your upload!
    }
    return false;
  }

  // General mock/fake URL detection (for non-Cloudinary URLs)
  const mockPatterns = [
    /placehold\.(co|it)/i,
    /placeholder/i,
    /dummyimage\.com/i,
    /picsum\.photos/i,
  ];

  if (mockPatterns.some((pattern) => pattern.test(url))) {
    return false;
  }

  return true;
};

/**
 * Extracts image URL from various data structures
 * Handles: strings, objects with image_url/image/url properties
 * @param {string|object} img - Image data
 * @returns {string|null} Extracted URL or null if invalid
 */
export const extractImageUrl = (img) => {
  if (!img) return null;

  if (typeof img === "string") {
    return isValidImageUrl(img) ? img : null;
  }

  if (typeof img === "object") {
    const url = img.image_url || img.image || img.url || img.src || img.secure_url;
    if (url && typeof url === "string") {
      return isValidImageUrl(url) ? url : null;
    }
  }

  return null;
};

/**
 * Filters an array of images to only include valid URLs
 * @param {Array} images - Array of image data
 * @returns {Array<string>} Array of valid image URLs
 */
export const filterValidImageUrls = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .map(extractImageUrl)
    .filter((url) => url !== null);
};

/**
 * Gets the first valid image URL from an array
 * @param {Array} images - Array of image data
 * @param {string} [fallback=null] - Fallback URL if no valid images
 * @returns {string} Valid image URL or fallback
 */
export const getFirstValidImage = (images, fallback = null) => {
  const validUrls = filterValidImageUrls(images);

  if (validUrls.length > 0) {
    return validUrls[0];
  }

  return fallback || getPlaceholderImage();
};

/**
 * Gets a lightweight SVG placeholder image data URL
 * @param {string} [text="No Image"] - Text to display
 * @param {number} [width=400] - Width in pixels
 * @param {number} [height=300] - Height in pixels
 * @returns {string} Data URL for placeholder
 */
export const getPlaceholderImage = (text = "No Image", width = 400, height = 300) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
};

/**
 * Validates and sanitizes image URLs before saving to backend
 * @param {Array} images - Array of image URLs or File objects
 * @returns {Array<string>} Filtered array of valid image URLs
 */
export const sanitizeImageUrls = (images) => {
  if (!Array.isArray(images)) return [];

  const validUrls = [];
  let invalidCount = 0;

  images.forEach((img) => {
    // Skip File objects (they'll be uploaded separately)
    if (img instanceof File) return;

    const url = extractImageUrl(img);

    if (url) {
      validUrls.push(url);
    } else {
      invalidCount++;
    }
  });

  // Log warning in development only
  if (invalidCount > 0 && import.meta.env.DEV) {
    console.warn(`[imageValidation] Filtered out ${invalidCount} invalid image URL(s)`);
  }

  return validUrls;
};


// Optional default export if needed elsewhere
export default {
  isValidImageUrl,
  extractImageUrl,
  filterValidImageUrls,
  getFirstValidImage,
  getPlaceholderImage,
  sanitizeImageUrls,
};