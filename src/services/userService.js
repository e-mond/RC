import apiClient from "./apiClient";

/**
 * User Service
 * Handles all user profile-related API calls
 */

/**
 * Get current user profile
 * @returns {Promise} User profile
 */
export const getProfile = async () => {
  try {
    const { data } = await apiClient.get("/auth/profile/");
    return data;
  } catch (err) {
    console.error("Get profile error:", err);
    throw err.response?.data || { message: "Failed to fetch profile" };
  }
};

/**
 * Update user profile
 * @param {FormData|Object} profileData - Updated profile data (can include profile picture)
 * @returns {Promise} Updated profile
 */
export const updateProfile = async (profileData) => {
  try {
    const isFormData = profileData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.patch("/auth/profile/", profileData, config);
    return data;
  } catch (err) {
    console.error("Update profile error:", err);
    throw err.response?.data || { message: "Failed to update profile" };
  }
};
