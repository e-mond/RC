/**
 * Error Message Utilities
 * 
 * Provides user-friendly error messages for common API errors,
 * especially rate limiting (429) and other HTTP errors.
 */

/**
 * Check if error is a rate limit error (429)
 * @param {Error|Object} err - Error object
 * @returns {boolean} True if rate limit error
 */
export const isRateLimitError = (err) => {
  if (!err) return false;
  const status = err.response?.status || err.status;
  const message = (err.message || err.response?.data?.message || "").toLowerCase();
  
  return status === 429 || 
         message.includes("429") || 
         message.includes("too many") ||
         message.includes("rate limit") ||
         message.includes("quota exceeded");
};

/**
 * Get user-friendly error message
 * @param {Error|Object} err - Error object
 * @param {string} fallback - Fallback message if error can't be parsed
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err) return fallback;

  // Rate limit errors (429)
  if (isRateLimitError(err)) {
    return "We're receiving too many requests right now. Please wait a moment and try again. This helps ensure everyone gets fast responses!";
  }

  // Network errors
  if (!err.response) {
    if (err.code === "ECONNABORTED") {
      return "Request timed out. Please check your internet connection and try again.";
    }
    if (err.code === "ERR_NETWORK" || err.message?.toLowerCase().includes("network")) {
      return "Unable to connect to server. Please check your internet connection and try again.";
    }
    return "Connection error. Please check your internet and try again.";
  }

  const status = err.response?.status;
  const data = err.response?.data;

  // HTTP status code specific messages
  switch (status) {
    case 400:
      return data?.message || data?.detail || "Invalid request. Please check your input and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return data?.message || data?.detail || "You don't have permission to perform this action.";
    case 404:
      return data?.message || data?.detail || "The requested resource was not found.";
    case 409:
      return data?.message || data?.detail || "This action conflicts with existing data. Please refresh and try again.";
    case 422:
      // Validation errors - try to extract field errors
      if (data?.field_errors) {
        const fieldErrors = Object.entries(data.field_errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
          .join(", ");
        return `Please fix the following errors: ${fieldErrors}`;
      }
      return data?.message || data?.detail || "Invalid data provided. Please check your input.";
    case 429:
      return "We're receiving too many requests right now. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server error. Our team has been notified. Please try again in a few moments.";
    default:
      // Try to extract message from response
      if (data?.message) return data.message;
      if (data?.detail) return data.detail;
      if (typeof data === "string") return data;
      if (err.message) return err.message;
      return fallback;
  }
};

/**
 * Extract error message for toast notifications
 * @param {Error|Object} err - Error object
 * @param {string} fallback - Fallback message
 * @returns {string} Error message for toast
 */
export const getToastErrorMessage = (err, fallback = "An error occurred. Please try again.") => {
  return getErrorMessage(err, fallback);
};

export default {
  isRateLimitError,
  getErrorMessage,
  getToastErrorMessage,
};
