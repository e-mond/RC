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
 * Get public user profile by ID
 * 
 * Uses the public profile endpoint: GET /api/users/{id}/profile/
 * 
 * Access Rules:
 * - Public: basic info + approved properties/services + reviews
 * - Self: full profile + wallet
 * - Admin / Super Admin: full profile for any user
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise} User profile
 */
export const getUserProfile = async (userId) => {
  try {
    // Use the new public profile endpoint
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.PUBLIC_PROFILE(userId));
    // Handle different response shapes
    return data.user || data.profile || data;
  } catch (err) {
    console.error("Get user profile error:", err);
    throw err.response?.data || { message: "Failed to fetch user profile" };
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
