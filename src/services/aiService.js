/**
 * aiService.js - AI-Powered Features Service
 * 
 * Handles all AI-related API calls:
 * - Property recommendations
 * - Artisan recommendations
 * - AI chatbot interactions
 * - Trust score retrieval
 * 
 * API Endpoints:
 * - POST /ai/recommendations/properties - Get property recommendations
 * - POST /ai/recommendations/artisans - Get artisan recommendations
 * - POST /ai/chat/message - Send chatbot message
 * - GET /ai/trust-score/:userId - Get user trust score
 * 
 * @module aiService
 * @requires ./apiClient
 */

import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";

// Force real API for AI services for testing
const USE_MOCK = false; // isMockMode();

/**
 * Simulate Network Delay
 * Helper function to add realistic delays in mock mode
 */
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/**
 * Extract Error Message
 * Utility to consistently extract error messages from API responses
 * Handles rate limiting (429) with user-friendly messages
 */
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);

  // Handle rate limiting (429) with user-friendly message
  if (err.response?.status === 429) {
    return new Error("Too many requests. Please wait a moment before trying again.");
  }

  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.response?.data?.detail) return new Error(err.response.data.detail);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

// ──────────────────────────────────────────────────────────────────────────────
// PROPERTY RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get AI-Powered Property Recommendations
 * 
 * Sends user context to backend AI service to get personalized property recommendations.
 * 
 * API Contract:
 * - POST /api/ai/recommendations/properties/
 * - Request: {
 *     user_role: "tenant",
 *     location?: { latitude: number, longitude: number },
 *     budget_range?: { min: number, max: number },
 *     preferences?: {
 *       property_type?: string[],
 *       bedrooms?: number,
 *       bathrooms?: number,
 *       amenities?: string[]
 *     },
 *     past_activity?: {
 *       viewed_properties?: number[],
 *       favorited_properties?: number[],
 *       search_history?: string[]
 *     }
 *   }
 * - Response: {
 *     recommendations: Property[],
 *     reasoning?: string,
 *     confidence_score?: number
 *   }
 * 
 * @param {Object} context - User context for recommendations
 * @param {string} context.user_role - User role (typically "tenant")
 * @param {Object} [context.location] - User location { latitude, longitude }
 * @param {Object} [context.budget_range] - Budget range { min, max }
 * @param {Object} [context.preferences] - Property preferences
 * @param {Object} [context.past_activity] - User activity history
 * @returns {Promise<Object>} Recommendations response
 * @throws {Error} If request fails
 */
export const getPropertyRecommendations = async (context = {}) => {
  if (USE_MOCK) {
    // Return mock recommendations
    const mockRecommendations = [
      {
        id: "rec_1",
        title: "Modern Apartment in East Legon",
        address: "East Legon, Accra",
        price: 1500,
        currency: "GHS",
        bedrooms: 2,
        bathrooms: 1,
        images: ["https://placehold.co/600x400?text=Recommended+1"],
        reasoning: "Based on your search history and budget preferences",
      },
      {
        id: "rec_2",
        title: "Spacious 3-Bedroom House",
        address: "Cantonments, Accra",
        price: 2500,
        currency: "GHS",
        bedrooms: 3,
        bathrooms: 2,
        images: ["https://placehold.co/600x400?text=Recommended+2"],
        reasoning: "Similar to properties you've viewed",
      },
    ];
    return withDelay({
      recommendations: mockRecommendations,
      reasoning: "Based on your preferences and activity history",
      confidence_score: 0.85,
    }, 600);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(
      API_ENDPOINTS.AI?.RECOMMENDATIONS?.PROPERTIES || "/ai/recommendations/properties/",
      context
    );
    return data;
  } catch (err) {
    // Provide more specific error message for 500 errors
    if (err.response?.status === 500) {
      throw new Error("Failed to generate recommendations. Please try again.");
    }
    throw extractError(err, "Failed to get property recommendations");
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// ARTISAN RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get AI-Powered Artisan Recommendations
 * 
 * Sends user context to backend AI service to get personalized artisan recommendations.
 * 
 * API Contract:
 * - POST /api/ai/recommendations/artisans/
 * - Request: {
 *     user_role: "tenant",
 *     location?: { latitude: number, longitude: number },
 *     service_type?: string,
 *     past_interactions?: number[],
 *     trust_score_threshold?: number
 *   }
 * - Response: {
 *     recommendations: Artisan[],
 *     reasoning?: string,
 *     confidence_score?: number
 *   }
 * 
 * @param {Object} context - User context for recommendations
 * @param {string} context.user_role - User role (typically "tenant")
 * @param {Object} [context.location] - User location { latitude, longitude }
 * @param {string} [context.service_type] - Type of service needed
 * @param {number[]} [context.past_interactions] - IDs of previously interacted artisans
 * @param {number} [context.trust_score_threshold] - Minimum trust score (0-100)
 * @returns {Promise<Object>} Recommendations response
 * @throws {Error} If request fails
 */
export const getArtisanRecommendations = async (context = {}) => {
  if (USE_MOCK) {
    const mockRecommendations = [
      {
        id: "artisan_rec_1",
        full_name: "Kwame Plumbing Services",
        service_type: "plumber",
        location: "East Legon, Accra",
        trust_score: 92,
        reasoning: "High trust score and proximity to your location",
      },
      {
        id: "artisan_rec_2",
        full_name: "Ama Electrical Works",
        service_type: "electrician",
        location: "Cantonments, Accra",
        trust_score: 88,
        reasoning: "Excellent reviews and verified status",
      },
    ];
    return withDelay({
      recommendations: mockRecommendations,
      reasoning: "Based on location and trust scores",
      confidence_score: 0.82,
    }, 600);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(
      API_ENDPOINTS.AI?.RECOMMENDATIONS?.ARTISANS || "/ai/recommendations/artisans/",
      context
    );
    return data;
  } catch (err) {
    throw extractError(err, "Failed to get artisan recommendations");
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// AI CHATBOT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Send Message to AI Chatbot
 * 
 * Sends a user message to the AI chatbot and receives a response.
 * 
 * API Contract:
 * - POST /api/ai/chat/message/
 * - Request: {
 *     message: string,
 *     conversation_id?: string,
 *     context?: {
 *       user_role: string,
 *       location?: { latitude, longitude },
 *       current_page?: string
 *     }
 *   }
 * - Response: {
 *     response: string,
 *     conversation_id: string,
 *     suggested_actions?: Array<{ type: string, label: string, data?: any }>
 *   }
 * 
 * @param {Object} payload - Chat message payload
 * @param {string} payload.message - User message
 * @param {string} [payload.conversation_id] - Existing conversation ID
 * @param {Object} [payload.context] - Additional context
 * @returns {Promise<Object>} Chatbot response
 * @throws {Error} If request fails
 */
export const sendChatbotMessage = async (payload) => {
  if (USE_MOCK) {
    // Simple mock responses based on message content
    const message = payload.message?.toLowerCase() || "";
    let response = "I'm here to help you find properties and artisans. How can I assist you today?";

    if (message.includes("property") || message.includes("apartment") || message.includes("house")) {
      response = "I can help you find properties! Try searching by location, price range, or property type. Would you like me to show you some recommendations?";
    } else if (message.includes("artisan") || message.includes("plumber") || message.includes("electrician")) {
      response = "I can help you find trusted artisans near you. What type of service do you need?";
    } else if (message.includes("document") || message.includes("lease")) {
      response = "For renting a property, you typically need: Ghana Card/ID, proof of income, references, and sometimes a guarantor. Would you like more details?";
    }

    return withDelay({
      response,
      conversation_id: payload.conversation_id || `conv_${Date.now()}`,
      suggested_actions: [
        { type: "search", label: "Search Properties", data: { query: "properties" } },
        { type: "search", label: "Find Artisans", data: { query: "artisans" } },
      ],
    }, 800);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(
      API_ENDPOINTS.AI?.CHAT?.MESSAGE || "/ai/chat/message/",
      payload
    );
    return data;
  } catch (err) {
    throw extractError(err, "Failed to send chatbot message");
  }
};

/**
 * Get Chatbot Conversation History
 * 
 * Retrieves conversation history for the current user.
 * 
 * API Contract:
 * - GET /api/ai/chat/conversations/
 * - Response: {
 *     conversations: Array<{
 *       id: string,
 *       messages: Array<{ role: "user" | "assistant", content: string, timestamp: string }>,
 *       created_at: string
 *     }>
 *   }
 * 
 * @returns {Promise<Object>} Conversation history
 * @throws {Error} If request fails
 */
export const getChatbotConversations = async () => {
  if (USE_MOCK) {
    return withDelay({
      conversations: [],
    }, 300);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(
      API_ENDPOINTS.AI?.CHAT?.CONVERSATIONS || "/ai/chat/conversations/"
    );
    return data;
  } catch (err) {
    throw extractError(err, "Failed to get chatbot conversations");
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// TRUST SCORE
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get User Trust Score
 * 
 * Retrieves the AI-calculated trust score for a user.
 * 
 * API Contract:
 * - GET /api/ai/trust-score/:userId/
 * - Response: {
 *     user_id: number,
 *     trust_score: number, // 0-100
 *     breakdown?: {
 *       verification: number,
 *       activity: number,
 *       reviews: number,
 *       behavior: number
 *     },
 *     last_updated: string
 *   }
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Trust score data
 * @throws {Error} If request fails
 */
export const getTrustScore = async (userId) => {
  if (!userId) throw new Error("getTrustScore: userId required");

  if (USE_MOCK) {
    // Return mock trust score
    const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100
    return withDelay({
      user_id: userId,
      trust_score: mockScore,
      breakdown: {
        verification: 25,
        activity: 20,
        reviews: 30,
        behavior: 25,
      },
      last_updated: new Date().toISOString(),
    }, 300);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const endpoint = API_ENDPOINTS.AI?.TRUST_SCORE?.(userId) || `/ai/trust-score/${userId}/`;
    const { data } = await apiClient.get(endpoint);
    return data;
  } catch (err) {
    // If 404, return default trust score
    if (err.response?.status === 404) {
      return {
        user_id: userId,
        trust_score: 50, // Default fallback
        breakdown: null,
        last_updated: null,
      };
    }
    // If 500, return default trust score instead of throwing error
    if (err.response?.status === 500) {
      console.warn(`Trust score endpoint returned 500 for user ${userId}, using default score`);
      return {
        user_id: userId,
        trust_score: 50, // Default fallback
        breakdown: null,
        last_updated: null,
      };
    }
    throw extractError(err, "Failed to get trust score");
  }
};

/**
 * Get Trust Scores for Multiple Users
 * 
 * Batch retrieval of trust scores for multiple users.
 * 
 * API Contract:
 * - POST /api/ai/trust-score/batch/
 * - Request: { user_ids: number[] }
 * - Response: { scores: Array<{ user_id: number, trust_score: number }> }
 * 
 * @param {number[]} userIds - Array of user IDs
 * @returns {Promise<Object>} Batch trust scores
 * @throws {Error} If request fails
 */
export const getTrustScoresBatch = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { scores: [] };
  }

  if (USE_MOCK) {
    const scores = userIds.map((id) => ({
      user_id: id,
      trust_score: Math.floor(Math.random() * 30) + 70,
    }));
    return withDelay({ scores }, 400);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(
      API_ENDPOINTS.AI?.TRUST_SCORE?.BATCH || "/ai/trust-score/batch/",
      { user_ids: userIds }
    );
    return data;
  } catch (err) {
    throw extractError(err, "Failed to get trust scores");
  }
};

export default {
  getPropertyRecommendations,
  getArtisanRecommendations,
  sendChatbotMessage,
  getChatbotConversations,
  getTrustScore,
  getTrustScoresBatch,
};
