import apiClient from "./apiClient";

/**
 * Ads Service
 * Handles all advertisement-related API calls
 */

/**
 * Get all active ads
 * @param {Object} filters - Filter options (ad_type, role, region)
 * @returns {Promise} Ad list with pagination
 */
export const getAds = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/ads/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get ads error:", err);
    throw err.response?.data || { message: "Failed to fetch ads" };
  }
};

/**
 * Get ad by ID (admin only)
 * @param {number} id - Ad ID
 * @returns {Promise} Ad details
 */
export const getAd = async (id) => {
  try {
    const { data } = await apiClient.get(`/ads/${id}/`);
    return data;
  } catch (err) {
    console.error("Get ad error:", err);
    throw err.response?.data || { message: "Failed to fetch ad" };
  }
};

/**
 * Create a new ad (admin only)
 * @param {FormData|Object} adData - Ad data including image
 * @returns {Promise} Created ad
 */
export const createAd = async (adData) => {
  try {
    const isFormData = adData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.post("/ads/create/", adData, config);
    return data;
  } catch (err) {
    console.error("Create ad error:", err);
    throw err.response?.data || { message: "Failed to create ad" };
  }
};

/**
 * Update an ad (admin only)
 * @param {number} id - Ad ID
 * @param {FormData|Object} adData - Updated ad data
 * @returns {Promise} Updated ad
 */
export const updateAd = async (id, adData) => {
  try {
    const isFormData = adData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.patch(`/ads/${id}/`, adData, config);
    return data;
  } catch (err) {
    console.error("Update ad error:", err);
    throw err.response?.data || { message: "Failed to update ad" };
  }
};

/**
 * Delete an ad (admin only)
 * @param {number} id - Ad ID
 * @returns {Promise}
 */
export const deleteAd = async (id) => {
  try {
    await apiClient.delete(`/ads/${id}/`);
  } catch (err) {
    console.error("Delete ad error:", err);
    throw err.response?.data || { message: "Failed to delete ad" };
  }
};

/**
 * Track ad click (public)
 * @param {number} id - Ad ID
 * @returns {Promise}
 */
export const trackAdClick = async (id) => {
  try {
    await apiClient.post(`/ads/${id}/click/`);
  } catch (err) {
    console.error("Track ad click error:", err);
    // Don't throw error for tracking - it's not critical
  }
};

/**
 * Track ad view (public)
 * @param {number} id - Ad ID
 * @returns {Promise}
 */
export const trackAdView = async (id) => {
  try {
    await apiClient.post(`/ads/${id}/view/`);
  } catch (err) {
    console.error("Track ad view error:", err);
    // Don't throw error for tracking - it's not critical
  }
};
