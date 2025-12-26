// src/services/adsService.js
// Handles user-promoted ads (boosting own listings)
// Separate from admin ads management

import apiClient from "@/services/apiClient";

/**
 * Get current user's active promoted ads
 */
export const getMyAds = async () => {
  try {
    const { data } = await apiClient.get("/ads/my-boosts/");
    return data.data || [];
  } catch (err) {
    console.error("Failed to fetch my ads:", err);
    throw err.response?.data || { message: "Failed to load your promotions" };
  }
};

/**
 * Create a new promoted ad (boost)
 * @param {Object} payload - { packageId, listingId }
 */
export const createBoost = async (payload) => {
  try {
    const { data } = await apiClient.post("/ads/boost/", payload);
    return data;
  } catch (err) {
    console.error("Boost creation failed:", err);
    throw err.response?.data || { message: "Failed to activate boost" };
  }
};

/**
 * Renew an existing boost
 * @param {number} adId
 */
export const renewBoost = async (adId) => {
  try {
    const { data } = await apiClient.patch(`/ads/boost/${adId}/renew/`);
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Renew failed" };
  }
};

/**
 * Cancel/delete a boost
 * @param {number} adId
 */
export const cancelBoost = async (adId) => {
  try {
    await apiClient.delete(`/ads/boost/${adId}/`);
  } catch (err) {
    throw err.response?.data || { message: "Cancel failed" };
  }
};