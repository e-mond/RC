import apiClient from "./apiClient";

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

/**
 * Get dashboard statistics for current user (role-based)
 * @returns {Promise} Dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const { data } = await apiClient.get("/analytics/dashboard/");
    return data;
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    throw err.response?.data || { message: "Failed to fetch dashboard statistics" };
  }
};

/**
 * Get analytics for a specific property (landlord only)
 * @param {number} propertyId - Property ID
 * @returns {Promise} Property analytics
 */
export const getPropertyAnalytics = async (propertyId) => {
  try {
    const { data } = await apiClient.get(`/analytics/property/${propertyId}/`);
    return data;
  } catch (err) {
    console.error("Get property analytics error:", err);
    throw err.response?.data || { message: "Failed to fetch property analytics" };
  }
};

/**
 * Get revenue analytics (landlords and artisans)
 * @returns {Promise} Revenue analytics
 */
export const getRevenueAnalytics = async () => {
  try {
    const { data } = await apiClient.get("/analytics/revenue/");
    return data;
  } catch (err) {
    console.error("Get revenue analytics error:", err);
    throw err.response?.data || { message: "Failed to fetch revenue analytics" };
  }
};

/**
 * Get admin analytics (admin only)
 * @returns {Promise} Admin analytics
 */
export const getAdminAnalytics = async () => {
  try {
    const { data } = await apiClient.get("/analytics/admin/");
    return data;
  } catch (err) {
    console.error("Get admin analytics error:", err);
    throw err.response?.data || { message: "Failed to fetch admin analytics" };
  }
};

/**
 * Convenience helper: get landlord-focused analytics data
 * by combining role-aware dashboard stats and revenue analytics.
 */
export const getLandlordAnalyticsDashboard = async () => {
  const [stats, revenue] = await Promise.all([getDashboardStats(), getRevenueAnalytics()]);
  return { stats, revenue };
};


