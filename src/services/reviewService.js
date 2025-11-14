import apiClient from "./apiClient";

/**
 * Review Service
 * Handles all review-related API calls
 */

/**
 * Get all reviews with optional filters
 * @param {Object} filters - Filter options (review_type, property_id, reviewee_id, rating, min_rating)
 * @returns {Promise} Review list with pagination
 */
export const getReviews = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/reviews/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get reviews error:", err);
    throw err.response?.data || { message: "Failed to fetch reviews" };
  }
};

/**
 * Get review by ID
 * @param {number} id - Review ID
 * @returns {Promise} Review details
 */
export const getReview = async (id) => {
  try {
    const { data } = await apiClient.get(`/reviews/${id}/`);
    return data;
  } catch (err) {
    console.error("Get review error:", err);
    throw err.response?.data || { message: "Failed to fetch review" };
  }
};

/**
 * Create a new review
 * @param {Object} reviewData - Review data (property_id or reviewee_id, review_type, rating, comment)
 * @returns {Promise} Created review
 */
export const createReview = async (reviewData) => {
  try {
    const { data } = await apiClient.post("/reviews/", reviewData);
    return data;
  } catch (err) {
    console.error("Create review error:", err);
    throw err.response?.data || { message: "Failed to create review" };
  }
};

/**
 * Update a review
 * @param {number} id - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise} Updated review
 */
export const updateReview = async (id, reviewData) => {
  try {
    const { data } = await apiClient.patch(`/reviews/${id}/`, reviewData);
    return data;
  } catch (err) {
    console.error("Update review error:", err);
    throw err.response?.data || { message: "Failed to update review" };
  }
};

/**
 * Delete a review
 * @param {number} id - Review ID
 * @returns {Promise}
 */
export const deleteReview = async (id) => {
  try {
    await apiClient.delete(`/reviews/${id}/`);
  } catch (err) {
    console.error("Delete review error:", err);
    throw err.response?.data || { message: "Failed to delete review" };
  }
};

/**
 * Get reviews for a specific property
 * @param {number} propertyId - Property ID
 * @returns {Promise} Property reviews with average rating
 */
export const getPropertyReviews = async (propertyId) => {
  try {
    const { data } = await apiClient.get(`/reviews/property/${propertyId}/`);
    return data;
  } catch (err) {
    console.error("Get property reviews error:", err);
    throw err.response?.data || { message: "Failed to fetch property reviews" };
  }
};

/**
 * Get reviews for a specific user
 * @param {number} userId - User ID
 * @returns {Promise} User reviews with average rating
 */
export const getUserReviews = async (userId) => {
  try {
    const { data } = await apiClient.get(`/reviews/user/${userId}/`);
    return data;
  } catch (err) {
    console.error("Get user reviews error:", err);
    throw err.response?.data || { message: "Failed to fetch user reviews" };
  }
};

