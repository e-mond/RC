// src/services/messagesService.js
// Unified messaging API service for all roles
// Uses authenticated apiClient with Bearer token

import apiClient from "@/services/apiClient";

/**
 * Fetch all conversations for the current authenticated user
 * @returns {Promise<Array>} List of conversations with participant info
 */
export const getConversations = async () => {
  try {
    const { data } = await apiClient.get("/messages/conversations/");
    return data.data || [];
  } catch (err) {
    console.error("Failed to fetch conversations:", err);
    throw err.response?.data || { message: "Unable to load conversations" };
  }
};

/**
 * Fetch messages for a specific conversation
 * @param {string|number} conversationId
 * @returns {Promise<Object>} { messages: [] }
 */
export const getMessages = async (conversationId) => {
  try {
    const { data } = await apiClient.get(`/messages/conversations/${conversationId}/`);
    return data.data || { messages: [] };
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    throw err.response?.data || { message: "Unable to load messages" };
  }
};

/**
 * Send a new message in a conversation
 * @param {string|number} conversationId
 * @param {string} text - Message content
 * @param {Array} attachments - Optional file IDs
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (conversationId, text, attachments = []) => {
  try {
    const { data } = await apiClient.post("/messages/send/", {
      conversation_id: conversationId,
      message: text.trim(),
      attachments,
    });
    return data.data;
  } catch (err) {
    console.error("Send message failed:", err);
    throw err.response?.data || { message: "Failed to send message" };
  }
};

/**
 * Mark conversation as read (optional)
 * @param {string|number} conversationId
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    await apiClient.post(`/messages/conversations/${conversationId}/read/`);
  } catch (err) {
    console.error("Mark as read failed:", err);
  }
};

/**
 * Get total unread message count for current user
 * Used for sidebar badge notification
 * @returns {Promise<number>} Total unread messages
 */
export const getUnreadCount = async () => {
  try {
    const { data } = await apiClient.get("/messages/unread-count/");
    // Backend should return { unread: 5 } or similar
    return data.unread || data.count || 0;
  } catch (err) {
    console.warn("Failed to fetch unread count:", err);
    return 0; // Fail silently — badge just won't show
  }
};