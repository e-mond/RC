/**
 * Utility functions for handling amenity data normalization
 * 
 * Backend may return amenities in various formats:
 * - String: "Parking"
 * - Object: { id: 1, name: "Parking" }
 * - Nested Object: { id: 1, amenity: { id: 1, name: "Parking" } }
 * 
 * This utility ensures consistent extraction of amenity names for rendering.
 */

/**
 * Extract amenity name from various data formats
 * @param {string|object} amenity - Amenity data in any format
 * @param {number} index - Optional index for fallback naming
 * @returns {string} - Extracted amenity name
 */
export function getAmenityName(amenity, index = 0) {
  if (!amenity) {
    return `Amenity ${index + 1}`;
  }

  // If already a string, return as-is
  if (typeof amenity === "string") {
    return amenity;
  }

  // If it's an object, extract the name
  if (amenity && typeof amenity === "object") {
    // Handle { amenity: { name: "..." } } nested format
    if (amenity.amenity && typeof amenity.amenity === "object" && amenity.amenity.name) {
      return String(amenity.amenity.name);
    }
    // Handle { name: "..." } format
    if (amenity.name && typeof amenity.name === "string") {
      return String(amenity.name);
    }
  }

  // Fallback: convert to string
  return String(amenity.amenity || amenity.name || `Amenity ${index + 1}`);
}

/**
 * Normalize an array of amenities to extract names
 * @param {Array<string|object>} amenities - Array of amenities in various formats
 * @returns {Array<string>} - Array of amenity names
 */
export function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) {
    return [];
  }

  return amenities
    .map((amenity, idx) => getAmenityName(amenity, idx))
    .filter((name) => name && typeof name === "string" && name.length > 0);
}

/**
 * Get amenity ID from various data formats
 * @param {string|object} amenity - Amenity data in any format
 * @returns {string|number|null} - Amenity ID or null
 */
export function getAmenityId(amenity) {
  if (!amenity) {
    return null;
  }

  if (typeof amenity === "string") {
    return null; // Strings don't have IDs
  }

  if (amenity && typeof amenity === "object") {
    // Handle { id: 1, amenity: { id: 1, name: "..." } } format
    if (amenity.amenity && typeof amenity.amenity === "object" && amenity.amenity.id) {
      return amenity.amenity.id;
    }
    // Handle { id: 1, name: "..." } format
    if (amenity.id) {
      return amenity.id;
    }
  }

  return null;
}
