/**
 * AI Service
 * Handles all AI-related API calls: chat, trust score, recommendations
 */
import apiClient from "./apiClient";

/**
 * Send a chat message to Efie AI chatbot
 * @param {string} message - The user's message
 * @returns {Promise} AI response
 */
export const sendChatMessage = async (message) => {
    try {
        const { data } = await apiClient.post("/ai/chat/", { message });
        return data;
    } catch (err) {
        console.error("AI chat error:", err);
        throw err.response?.data || { message: "Failed to get AI response" };
    }
};

/**
 * Get trust score for a user
 * @param {number|null} userId - Optional user ID, defaults to current user
 * @returns {Promise} Trust score data with breakdown
 */
export const getTrustScore = async (userId = null) => {
    try {
        const url = userId ? `/ai/trust-score/${userId}/` : "/ai/trust-score/";
        const { data } = await apiClient.get(url);
        return data;
    } catch (err) {
        console.error("Get trust score error:", err);
        throw err.response?.data || { message: "Failed to get trust score" };
    }
};

/**
 * Get personalized recommendations for properties and artisans
 * @returns {Promise} Recommendations with properties and artisans arrays
 */
export const getRecommendations = async () => {
    try {
        const { data } = await apiClient.get("/ai/recommendations/");
        return data;
    } catch (err) {
        console.error("Get recommendations error:", err);
        throw err.response?.data || { message: "Failed to get recommendations" };
    }
};

export default {
    sendChatMessage,
    getTrustScore,
    getRecommendations,
};
