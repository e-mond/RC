import apiClient from "./apiClient";

/**
 * Signs up a new user dynamically based on their role.
 * Uses multipart/form-data to support file uploads (e.g., ID for artisans).
 * 
 * @param {string} role - "landlord" | "tenant" | "artisan"
 * @param {FormData} formData - registration data
 * @returns {Promise<Object>} server response
 */
/**
 * Extract error message from signup error response
 * Handles Django field validation errors (e.g., password: ['This password is too common.'])
 */
const extractSignupError = (err) => {
  if (!err?.response?.data) {
    return err?.message || "Signup failed. Please try again.";
  }
  
  const data = err.response.data;
  
  // Handle field-specific errors (Django validation format)
  // Format: { password: ['This password is too common.'], email: ['Invalid email'] }
  if (typeof data === 'object' && !data.message && !data.error && !data.detail) {
    const fieldErrors = Object.entries(data)
      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => {
        // Format field name (password -> Password, fullName -> Full Name)
        const fieldName = key
          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
          .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
        return `${fieldName}: ${value[0]}`;
      });
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('. ');
    }
  }
  
  // Standard error formats
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  
  return "Signup failed. Please check your information and try again.";
};

export const signupUser = async (role, formData) => {
  try {
    const endpoint = `/auth/signup/${role}/`;
    const { data } = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    // Extract and format error message for user display
    const errorMessage = extractSignupError(err);
    throw new Error(errorMessage);
  }
};
