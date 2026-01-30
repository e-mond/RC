/**
 * Image Validation Utilities
 * 
 * Provides helper functions for validating and filtering image URLs
 * to prevent broken or malicious URLs while allowing legitimate Cloudinary uploads.
 * 
 * Key Improvements (Jan 2026):
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
  if (url.length < 20) {
    return false;
  }

  // Special handling for Cloudinary URLs - trust them if they look complete
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    const afterUpload = url.split("/image/upload/")[1] || "";
    // Must have version or filename after /upload/
    if (afterUpload.trim().length > 0) {
      // Optional: you can add more specific checks here if needed
      // e.g. check for known public ID patterns or file extensions
      return true; // ← TRUST THIS URL - it came from your upload!
    }
    // If nothing after /upload/ → invalid
    return false;
  }

  // General mock/fake URL detection (for non-Cloudinary URLs)
  const mockPatterns = [
    /placehold\.(co|it)/i,     // placehold.co, placehold.it
    /placeholder/i,            // loremflickr, via.placeholder.com, etc.
    /dummyimage\.com/i,
    /picsum\.photos/i,         // optional - remove if you want to allow these
  ];

  // Reject if matches any obvious mock pattern
  if (mockPatterns.some(pattern => pattern.test(url))) {
    return false;
  }

  // Optional: could add file extension check here (but not required for Cloudinary)
  // const imageExtRegex = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
  // if (!imageExtRegex.test(url)) return false;

  return true;
};

/**
 * Extracts image URL from various data structures
 * Handles: strings, objects with image_url/image/url properties
 * @param {string|object} img - Image data (string URL or object)
 * @returns {string|null} Extracted URL or null if invalid
 */
export const extractImageUrl = (img) => {
  if (!img) return null;

  // If it's already a string, validate and return
  if (typeof img === "string") {
    return isValidImageUrl(img) ? img : null;
  }

  // If it's an object, try common property names
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
 * @param {Array} images - Array of image data (strings or objects)
 * @returns {Array<string>} Array of valid image URLs
 */
export const filterValidImageUrls = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .map(extractImageUrl)
    .filter(url => url !== null);
};

/**
 * Gets the first valid image URL from an array
 * @param {Array} images - Array of image data
 * @param {string} fallback - Fallback URL if no valid images found
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
 * Gets a placeholder image data URL
 * @param {string} text - Text to display in placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Data URL for placeholder image
 */
export const getPlaceholderImage = (text = "No Image", width = 400, height = 300) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23e5e7eb' width='${width}' height='${height}'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
};

/**
 * Validates and sanitizes image URLs before saving to backend
 * Removes invalid URLs and logs warnings
 * @param {Array} images - Array of image URLs or File objects
 * @returns {Array} Filtered array of valid image URLs
 */
export const sanitizeImageUrls = (images) => {
  if (!Array.isArray(images)) return [];

  const validUrls = [];
  const invalidCount = { total: 0, details: [] };

  images.forEach((img, index) => {
    // Skip File objects (they'll be uploaded separately)
    if (img instanceof File) {
      return; // Don't include File objects in URL validation
    }

    const url = extractImageUrl(img);

    if (url) {
      validUrls.push(url);
    } else {
      invalidCount.total++;
      invalidCount.details.push({
        index,
        value: typeof img === "string" ? img.substring(0, 80) + "..." : String(img).substring(0, 80) + "...",
      });
    }
  });

  // Log warning if invalid URLs were filtered (development only)
  if (invalidCount.total > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `[imageValidation] Filtered out ${invalidCount.total} invalid image URL(s):`,
      invalidCount.details
    );
  }

  return validUrls;
};

export default {
  isValidImageUrl,
  extractImageUrl,
  filterValidImageUrls,
  getFirstValidImage,
  getPlaceholderImage,
  sanitizeImageUrls,
};