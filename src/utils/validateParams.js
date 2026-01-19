/**
 * URL Parameter Validation Utility
 * 
 * Provides validation for URL parameters to prevent injection attacks
 * and ensure type safety.
 * 
 * Usage:
 * import { validateId, validateNumericId, validateUUID } from '@/utils/validateParams';
 * 
 * const { id } = useParams();
 * const validId = validateNumericId(id);
 * if (!validId) {
 *   return <Navigate to="/error" replace />;
 * }
 * 
 * @module validateParams
 */

/**
 * Validate numeric ID parameter
 * @param {string|undefined} id - ID parameter from URL
 * @param {number} min - Minimum value (default: 1)
 * @param {number} max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @returns {number|null} Validated numeric ID or null if invalid
 */
export const validateNumericId = (id, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  if (!id) return null;
  
  // Remove any whitespace
  const cleanId = String(id).trim();
  
  // Check if it's a valid number
  if (!/^\d+$/.test(cleanId)) {
    console.warn('[validateParams] Invalid numeric ID:', id);
    return null;
  }
  
  const numId = parseInt(cleanId, 10);
  
  // Check bounds
  if (isNaN(numId) || numId < min || numId > max) {
    console.warn('[validateParams] ID out of bounds:', id, `(min: ${min}, max: ${max})`);
    return null;
  }
  
  return numId;
};

/**
 * Validate UUID parameter
 * @param {string|undefined} id - UUID parameter from URL
 * @param {boolean} silent - If true, don't log warnings (used internally)
 * @returns {string|null} Validated UUID or null if invalid
 */
export const validateUUID = (id, silent = false) => {
  if (!id) return null;
  
  const cleanId = String(id).trim();
  
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(cleanId)) {
    if (!silent) {
      console.warn('[validateParams] Invalid UUID format:', id);
    }
    return null;
  }
  
  return cleanId;
};

/**
 * Validate ID parameter (numeric or UUID)
 * @param {string|undefined} id - ID parameter from URL
 * @returns {string|number|null} Validated ID or null if invalid
 */
export const validateId = (id) => {
  if (!id) return null;
  
  // Try UUID first (more specific) - silent mode to avoid false warnings
  const uuid = validateUUID(id, true);
  if (uuid) return uuid;
  
  // Try numeric
  const numeric = validateNumericId(id);
  if (numeric) return numeric;
  
  // Invalid format
  console.warn('[validateParams] Invalid ID format:', id);
  return null;
};

/**
 * Validate and sanitize string parameter
 * @param {string|undefined} param - String parameter from URL
 * @param {number} maxLength - Maximum length (default: 255)
 * @param {RegExp} allowedPattern - Allowed character pattern (default: alphanumeric and common chars)
 * @returns {string|null} Validated string or null if invalid
 */
export const validateStringParam = (param, maxLength = 255, allowedPattern = /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=\[\]{}|\\:;"'<>\/]+$/) => {
  if (!param) return null;
  
  const cleanParam = String(param).trim();
  
  // Check length
  if (cleanParam.length > maxLength) {
    console.warn('[validateParams] String parameter too long:', cleanParam.length, `(max: ${maxLength})`);
    return null;
  }
  
  // Check pattern
  if (!allowedPattern.test(cleanParam)) {
    console.warn('[validateParams] String parameter contains invalid characters:', param);
    return null;
  }
  
  return cleanParam;
};

/**
 * Validate enum parameter
 * @param {string|undefined} param - Enum parameter from URL
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {string|null} Validated enum value or null if invalid
 */
export const validateEnumParam = (param, allowedValues) => {
  if (!param) return null;
  
  const cleanParam = String(param).trim().toLowerCase();
  const normalizedAllowed = allowedValues.map(v => String(v).toLowerCase());
  
  if (!normalizedAllowed.includes(cleanParam)) {
    console.warn('[validateParams] Invalid enum value:', param, `(allowed: ${allowedValues.join(', ')})`);
    return null;
  }
  
  return cleanParam;
};

export default {
  validateNumericId,
  validateUUID,
  validateId,
  validateStringParam,
  validateEnumParam
};
