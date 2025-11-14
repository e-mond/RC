import apiClient from "./apiClient";

/**
 * Signs up a new user dynamically based on their role.
 * Uses multipart/form-data to support file uploads (e.g., ID for artisans).
 * 
 * @param {string} role - "landlord" | "tenant" | "artisan"
 * @param {FormData} formData - registration data
 * @returns {Promise<Object>} server response
 */
export const signupUser = async (role, formData) => {
  try {
    const endpoint = `/auth/signup/${role}/`;
    const { data } = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    console.error("Signup API error:", err);
    throw err.response?.data || { message: "Signup failed" };
  }
};
