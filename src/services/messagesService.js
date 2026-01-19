/**
 * messagesService.js - Messaging Service
 * 
 * Unified messaging API service for all roles.
 * Supports both mock and real API modes.
 * 
 * Mock Mode:
 * - Returns sample conversations and messages
 * - Simulates message sending
 * - Works without backend connection
 * - Production uses real API endpoints
 * 
 * @module messagesService
 * @requires ./apiClient
 */

// src/services/messagesService.js
// Unified messaging API service for all roles
// Uses authenticated apiClient with Bearer token
// Production-ready: All mock data removed - uses real API only

import apiClient from "@/services/apiClient";
import { isMockMode } from "@/mocks/mockManager";

/**
 * Mock Mode Detection
 * Uses centralized mock manager for consistency
 */
const USE_MOCK = isMockMode();

/**
 * Fetch all conversations for the current authenticated user
 * @returns {Promise<Array>} List of conversations with participant info
 */
export const getConversations = async () => {
  // Production: Always use real API - no mock data
  try {
    const { data } = await apiClient.get("/messages/conversations/");
    return data.data || data.conversations || data || [];
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
  // Production: Always use real API - no mock data
  try {
    const { data } = await apiClient.get(`/messages/conversations/${conversationId}/`);
    return data.data || data.messages || { messages: [] };
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    throw err.response?.data || { message: "Unable to load messages" };
  }
};

/**
 * Send a new message in a conversation
 * @param {string|number} conversationId
 * @param {string} text - Message content (encrypted automatically by backend)
 * @param {Array} attachments - Optional file IDs (not supported - removed per requirements)
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (conversationId, text, attachments = []) => {
  // Production: Always use real API - no mock data
  // Note: Attachments removed per requirements - messaging is text-only
  try {
    const { data } = await apiClient.post("/messages/send/", {
      conversation_id: conversationId,
      message: text.trim(),
      // attachments removed - messaging is text-only with automatic encryption
    });
    return data.data || data;
  } catch (err) {
    console.error("Send message failed:", err);
    throw err.response?.data || { message: "Failed to send message" };
  }
};

/**
 * Create or get existing conversation with a user
 * @param {Object} data - { recipient_id: string|number, initial_message?: string }
 * @returns {Promise<Object>} Conversation object
 */
export const createConversation = async (data) => {
  // Production: Always use real API - no mock data
  try {
    // Validate recipient_id format before sending
    const recipientId = data.recipient_id;
    if (!recipientId) {
      throw new Error("recipient_id is required");
    }

    // Ensure recipient_id is a valid integer (convert string to number if needed)
    const normalizedRecipientId = typeof recipientId === 'string' 
      ? parseInt(recipientId, 10) 
      : recipientId;

    if (isNaN(normalizedRecipientId) || normalizedRecipientId <= 0) {
      throw new Error("recipient_id must be a valid positive integer (user ID)");
    }

    const { data: response } = await apiClient.post("/messages/conversations/", {
      ...data,
      recipient_id: normalizedRecipientId, // Send normalized integer
    });
    return response.data || response;
  } catch (err) {
    console.error("Create conversation error:", err);
    
    // Provide user-friendly error messages
    if (err.response?.status === 400) {
      const errorData = err.response?.data;
      if (errorData?.recipient_id) {
        throw new Error(`Invalid recipient: ${errorData.recipient_id[0] || "recipient_id must be a valid user ID"}`);
      }
      throw new Error(errorData?.message || errorData?.detail || "Invalid conversation data");
    }
    
    if (err.response?.status === 404) {
      throw new Error("Recipient user not found");
    }
    
    if (err.response?.status === 403) {
      throw new Error("You do not have permission to message this user");
    }

    throw err.response?.data || { message: err.message || "Failed to create conversation" };
  }
};

/**
 * Mark conversation as read
 * @param {string|number} conversationId
 */
export const markConversationAsRead = async (conversationId) => {
  // Production: Always use real API - no mock data
  try {
    await apiClient.post(`/messages/conversations/${conversationId}/read/`);
  } catch (err) {
    console.error("Mark as read failed:", err);
    // Fail silently - not critical
  }
};

/**
 * Get total unread message count for current user
 * Used for sidebar badge notification
 * @returns {Promise<number>} Total unread messages
 */
export const getUnreadCount = async () => {
  // Production: Always use real API - no mock data
  try {
    const { data } = await apiClient.get("/messages/unread-count/");
    // Backend should return { unread: 5 } or { count: 5 } or direct number
    return data.unread || data.count || data || 0;
  } catch (err) {
    console.warn("Failed to fetch unread count:", err);
    return 0; // Fail silently — badge just won't show
  }
};