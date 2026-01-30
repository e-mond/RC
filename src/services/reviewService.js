/**
 * reviewService.js - Review & Rating Service
 * 
 * Handles all review and rating-related API calls.
 * Supports both mock and real API modes.
 * 
 * Review Types:
 * - Tenant → Landlord & Property (property reviews)
 * - Landlord → Tenant (optional, controlled)
 * - Artisan ratings (job completion reviews)
 * 
 * Mock Mode:
 * - Returns sample reviews for different entities
 * - Works without backend connection
 * - Production uses real API endpoints
 * 
 * @module reviewService
 * @requires ./apiClient
 */

import apiClient from "./apiClient";

/**
 * Mock Mode Detection
 */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

/**
 * Simulate Network Delay
 */
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/**
 * Mock Reviews Store
 * In-memory store for mock reviews
 */
let mockReviewsStore = [
  {
    id: "rev_001",
    review_type: "property",
    property_id: "prop_001",
    property_title: "Modern 2-Bedroom Apartment",
    reviewer_id: "user_tenant_001",
    reviewer_name: "John Doe",
    reviewer_role: "tenant",
    reviewee_id: "user_landlord_001",
    reviewee_name: "Jane Landlord",
    rating: 5,
    comment: "Excellent property! Clean, well-maintained, and in a great location. The landlord was very responsive.",
    status: "approved",
    is_verified: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev_002",
    review_type: "property",
    property_id: "prop_001",
    property_title: "Modern 2-Bedroom Apartment",
    reviewer_id: "user_tenant_002",
    reviewer_name: "Mary Smith",
    reviewer_role: "tenant",
    reviewee_id: "user_landlord_001",
    reviewee_name: "Jane Landlord",
    rating: 4,
    comment: "Good property overall. Minor maintenance issues but landlord addressed them quickly.",
    status: "approved",
    is_verified: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev_003",
    review_type: "artisan",
    artisan_id: "user_artisan_001",
    artisan_name: "Ebo Plumbing Services",
    reviewer_id: "user_landlord_001",
    reviewer_name: "Jane Landlord",
    reviewer_role: "landlord",
    rating: 5,
    comment: "Professional service, completed on time, and at a fair price. Highly recommended!",
    status: "approved",
    is_verified: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rev_004",
    review_type: "tenant",
    tenant_id: "user_tenant_001",
    tenant_name: "John Doe",
    reviewer_id: "user_landlord_001",
    reviewer_name: "Jane Landlord",
    reviewer_role: "landlord",
    rating: 5,
    comment: "Excellent tenant. Always pays on time and takes good care of the property.",
    status: "approved",
    is_verified: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get all reviews with optional filters
 * @param {Object} filters - Filter options (review_type, property_id, reviewee_id, rating, min_rating, status)
 * @returns {Promise} Review list with pagination
 */
export const getReviews = async (filters = {}) => {
  if (USE_MOCK) {
    let filteredReviews = [...mockReviewsStore];
    
    // Apply filters
    if (filters.review_type) {
      filteredReviews = filteredReviews.filter((r) => r.review_type === filters.review_type);
    }
    if (filters.property_id) {
      filteredReviews = filteredReviews.filter((r) => r.property_id === filters.property_id);
    }
    if (filters.reviewee_id) {
      filteredReviews = filteredReviews.filter((r) => 
        r.reviewee_id === filters.reviewee_id || r.artisan_id === filters.reviewee_id || r.tenant_id === filters.reviewee_id
      );
    }
    if (filters.rating) {
      filteredReviews = filteredReviews.filter((r) => r.rating === parseInt(filters.rating));
    }
    if (filters.min_rating) {
      filteredReviews = filteredReviews.filter((r) => r.rating >= parseInt(filters.min_rating));
    }
    if (filters.status) {
      filteredReviews = filteredReviews.filter((r) => r.status === filters.status);
    }
    
    return withDelay({
      results: filteredReviews,
      count: filteredReviews.length,
      next: null,
      previous: null,
    }, 300);
  }

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
  if (USE_MOCK) {
    const newReview = {
      id: `rev_${Date.now()}`,
      ...reviewData,
      status: "pending", // Reviews require moderation
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockReviewsStore.unshift(newReview);
    return withDelay(newReview, 500);
  }

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
  if (USE_MOCK) {
    const reviewIndex = mockReviewsStore.findIndex(
      (r) => r.id === id || String(r.id) === String(id)
    );
    
    if (reviewIndex === -1) {
      throw new Error("Review not found");
    }
    
    const updatedReview = {
      ...mockReviewsStore[reviewIndex],
      ...reviewData,
      updated_at: new Date().toISOString(),
    };
    
    mockReviewsStore[reviewIndex] = updatedReview;
    return withDelay(updatedReview, 400);
  }

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
  if (USE_MOCK) {
    const reviewIndex = mockReviewsStore.findIndex(
      (r) => r.id === id || String(r.id) === String(id)
    );
    
    if (reviewIndex === -1) {
      throw new Error("Review not found");
    }
    
    mockReviewsStore.splice(reviewIndex, 1);
    return withDelay({ success: true }, 300);
  }

  try {
    await apiClient.delete(`/reviews/${id}/`);
  } catch (err) {
    console.error("Delete review error:", err);
    throw err.response?.data || { message: "Failed to delete review" };
  }
};

/**
 * Get reviews for a specific property
 * @param {number|string} propertyId - Property ID
 * @returns {Promise} Property reviews with average rating
 */
export const getPropertyReviews = async (propertyId) => {
  if (USE_MOCK) {
    const propertyReviews = mockReviewsStore.filter(
      (r) => r.property_id === propertyId || r.property_id === String(propertyId)
    );
    
    const approvedReviews = propertyReviews.filter((r) => r.status === "approved");
    const averageRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;
    
    return withDelay({
      reviews: approvedReviews,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: approvedReviews.length,
      rating_breakdown: {
        5: approvedReviews.filter((r) => r.rating === 5).length,
        4: approvedReviews.filter((r) => r.rating === 4).length,
        3: approvedReviews.filter((r) => r.rating === 3).length,
        2: approvedReviews.filter((r) => r.rating === 2).length,
        1: approvedReviews.filter((r) => r.rating === 1).length,
      },
    }, 300);
  }

  try {
    const { data } = await apiClient.get(`/reviews/property/${propertyId}/`);
    return data;
  } catch (err) {
    console.error("Get property reviews error:", err);
    throw err.response?.data || { message: "Failed to fetch property reviews" };
  }
};

/**
 * Get reviews for a specific user (as reviewee)
 * @param {number|string} userId - User ID
 * @returns {Promise} User reviews with average rating
 */
export const getUserReviews = async (userId) => {
  if (USE_MOCK) {
    const userReviews = mockReviewsStore.filter(
      (r) => r.reviewee_id === userId || r.reviewee_id === String(userId) ||
             r.artisan_id === userId || r.artisan_id === String(userId) ||
             r.tenant_id === userId || r.tenant_id === String(userId)
    );
    
    const approvedReviews = userReviews.filter((r) => r.status === "approved");
    const averageRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;
    
    return withDelay({
      reviews: approvedReviews,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: approvedReviews.length,
      rating_breakdown: {
        5: approvedReviews.filter((r) => r.rating === 5).length,
        4: approvedReviews.filter((r) => r.rating === 4).length,
        3: approvedReviews.filter((r) => r.rating === 3).length,
        2: approvedReviews.filter((r) => r.rating === 2).length,
        1: approvedReviews.filter((r) => r.rating === 1).length,
      },
    }, 300);
  }

  try {
    const { data } = await apiClient.get(`/reviews/user/${userId}/`);
    return data;
  } catch (err) {
    console.error("Get user reviews error:", err);
    throw err.response?.data || { message: "Failed to fetch user reviews" };
  }
};

