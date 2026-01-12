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

import apiClient from "@/services/apiClient";

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
 * Mock Conversations Store
 * In-memory store for mock conversations and messages
 */
let mockConversationsStore = [
  {
    id: "conv_001",
    participantId: "user_landlord_001",
    participantName: "Jane Landlord",
    participantRole: "landlord",
    lastMessage: "Thanks for your interest! When would you like to schedule a viewing?",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unreadCount: 2,
    messages: [
      {
        id: "msg_001",
        senderId: "user_tenant_001",
        senderName: "You",
        message: "Hi, I'm interested in viewing this property.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isOwn: true,
        status: "delivered",
      },
      {
        id: "msg_002",
        senderId: "user_landlord_001",
        senderName: "Jane Landlord",
        message: "Hello! I'd be happy to show you the property.",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        isOwn: false,
        status: "delivered",
      },
      {
        id: "msg_003",
        senderId: "user_landlord_001",
        senderName: "Jane Landlord",
        message: "Thanks for your interest! When would you like to schedule a viewing?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isOwn: false,
        status: "delivered",
      },
    ],
  },
  {
    id: "conv_002",
    participantId: "user_artisan_001",
    participantName: "Ebo Plumbing Services",
    participantRole: "artisan",
    lastMessage: "I can come by tomorrow afternoon.",
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    unreadCount: 0,
    messages: [
      {
        id: "msg_004",
        senderId: "user_landlord_001",
        senderName: "You",
        message: "I need plumbing services for my property.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isOwn: true,
        status: "delivered",
      },
      {
        id: "msg_005",
        senderId: "user_artisan_001",
        senderName: "Ebo Plumbing Services",
        message: "I can come by tomorrow afternoon.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isOwn: false,
        status: "delivered",
      },
    ],
  },
];

/**
 * Fetch all conversations for the current authenticated user
 * @returns {Promise<Array>} List of conversations with participant info
 */
export const getConversations = async () => {
  if (USE_MOCK) {
    // Return conversations with participant info
    const conversations = mockConversationsStore.map((conv) => ({
      id: conv.id,
      participantId: conv.participantId,
      participantName: conv.participantName,
      participantRole: conv.participantRole,
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unreadCount,
    }));
    return withDelay(conversations, 300);
  }

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
  if (USE_MOCK) {
    const conversation = mockConversationsStore.find((c) => c.id === conversationId || c.id === String(conversationId));
    if (!conversation) {
      return withDelay({ messages: [] }, 300);
    }
    return withDelay({ messages: conversation.messages || [] }, 300);
  }

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
 * @param {string} text - Message content (can be encrypted)
 * @param {Array} attachments - Optional file IDs
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (conversationId, text, attachments = []) => {
  if (USE_MOCK) {
    const conversation = mockConversationsStore.find((c) => c.id === conversationId || c.id === String(conversationId));
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Create new message
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: "user_current", // Current user
      senderName: "You",
      message: text.trim(), // Store as-is (encrypted if provided)
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "delivered",
      attachments: attachments || [],
    };

    // Add to conversation
    conversation.messages.push(newMessage);
    conversation.lastMessage = text.trim();
    conversation.lastMessageTime = new Date().toISOString();

    return withDelay(newMessage, 500);
  }

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
 * Create or get existing conversation with a user
 * @param {Object} data - { recipient_id: string|number, initial_message?: string }
 * @returns {Promise<Object>} Conversation object
 */
export const createConversation = async (data) => {
  if (USE_MOCK) {
    // Check if conversation already exists
    const existing = mockConversationsStore.find(
      (c) => c.participantId === data.recipient_id
    );
    if (existing) {
      return withDelay(existing, 300);
    }
    
    // Create new conversation
    const newConv = {
      id: `conv_${Date.now()}`,
      participantId: data.recipient_id,
      participantName: data.recipient_name || "User",
      participantRole: data.recipient_role || "tenant",
      lastMessage: data.initial_message || "Conversation started",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messages: data.initial_message ? [{
        id: `msg_${Date.now()}`,
        senderId: "current_user",
        senderName: "You",
        message: data.initial_message,
        timestamp: new Date().toISOString(),
        isOwn: true,
        status: "delivered",
      }] : [],
    };
    
    mockConversationsStore.push(newConv);
    return withDelay(newConv, 300);
  }

  try {
    const { data: response } = await apiClient.post("/messages/conversations/", data);
    return response;
  } catch (err) {
    console.error("Create conversation error:", err);
    throw err.response?.data || { message: "Failed to create conversation" };
  }
};

/**
 * Mark conversation as read (optional)
 * @param {string|number} conversationId
 */
export const markConversationAsRead = async (conversationId) => {
  if (USE_MOCK) {
    const conversation = mockConversationsStore.find((c) => c.id === conversationId || c.id === String(conversationId));
    if (conversation) {
      conversation.unreadCount = 0;
    }
    return Promise.resolve();
  }

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
  if (USE_MOCK) {
    const totalUnread = mockConversationsStore.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    return withDelay(totalUnread, 200);
  }

  try {
    const { data } = await apiClient.get("/messages/unread-count/");
    // Backend should return { unread: 5 } or similar
    return data.unread || data.count || 0;
  } catch (err) {
    console.warn("Failed to fetch unread count:", err);
    return 0; // Fail silently — badge just won't show
  }
};