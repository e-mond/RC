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
 * Tries multiple endpoint patterns to handle different backend configurations:
 * 1. GET /api/users/{id}/profile/ (primary)
 * 2. GET /api/users/{id}/ (fallback)
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
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
  let data;
  let lastError;

  // Try primary endpoint: /api/users/{id}/profile/
  try {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PUBLIC_PROFILE(userId));
    data = response.data;
  } catch (err1) {
    // If 404, try fallback endpoint: /api/users/{id}/
    if (err1.response?.status === 404) {
      try {
        const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(userId));
        data = response.data;
      } catch (err2) {
        lastError = err2;
        console.error("Get user profile error (both endpoints failed):", {
          primary: err1.response?.status,
          fallback: err2.response?.status,
        });
      }
    } else {
      lastError = err1;
      console.error("Get user profile error:", err1);
    }
  }

  if (data) {
    // Handle different response shapes
    return data.user || data.profile || data;
  }

  // If all attempts failed, throw the last error
  throw lastError?.response?.data || { message: "Failed to fetch user profile" };
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
