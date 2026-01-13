/**
 * WebSocket Service for Real-Time Messaging
 * 
 * Handles real-time communication using Socket.IO
 * Supports automatic reconnection and message encryption
 * 
 * @module websocketService
 */

import { io } from "socket.io-client";
import { encryptMessage, decryptMessage } from "@/utils/encryption";

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let encryptionKey = null;

/**
 * Initialize WebSocket connection
 * @param {string} token - JWT authentication token
 * @param {string} userId - Current user ID
 * @param {string} key - Encryption key (auto-generated if not provided)
 * @returns {Object} Socket instance
 */
export const initWebSocket = (token, userId, key = null) => {
  if (USE_MOCK) {
    // Mock WebSocket - simulate real-time behavior
    return createMockSocket(userId, key);
  }

  if (socket?.connected) {
    return socket;
  }

  encryptionKey = key || generateEncryptionKey();

  socket = io(WS_URL, {
    auth: {
      token,
      userId,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");
    reconnectAttempts = 0;
  });

  socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
    reconnectAttempts++;
  });

  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a conversation room
 * @param {string} conversationId - Conversation ID
 */
export const joinConversation = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit("join_conversation", { conversation_id: conversationId });
  }
};

/**
 * Leave a conversation room
 * @param {string} conversationId - Conversation ID
 */
export const leaveConversation = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit("leave_conversation", { conversation_id: conversationId });
  }
};

/**
 * Send a message via WebSocket
 * @param {string} conversationId - Conversation ID
 * @param {string} message - Message text
 * @returns {Promise<Object>} Sent message
 */
export const sendRealtimeMessage = (conversationId, message) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      reject(new Error("WebSocket not connected"));
      return;
    }

    // Auto-encrypt message
    const encryptedMessage = encryptMessage(message, encryptionKey);

    socket.emit("send_message", {
      conversation_id: conversationId,
      message: encryptedMessage,
      encrypted: true,
    }, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        // Decrypt for display (own messages)
        const decrypted = decryptMessage(response.data.message, encryptionKey);
        resolve({
          ...response.data,
          message: decrypted, // Show decrypted for own messages
        });
      }
    });
  });
};

/**
 * Listen for new messages
 * @param {Function} callback - Callback function (message) => void
 * @returns {Function} Unsubscribe function
 */
export const onNewMessage = (callback) => {
  if (!socket) return () => {};

  const handler = (data) => {
    // Auto-decrypt incoming messages
    try {
      const decrypted = decryptMessage(data.message, encryptionKey);
      callback({
        ...data,
        message: decrypted,
      });
    } catch (err) {
      console.error("Failed to decrypt message:", err);
      callback(data); // Return encrypted if decryption fails
    }
  };

  socket.on("new_message", handler);

  return () => {
    socket.off("new_message", handler);
  };
};

/**
 * Listen for typing indicators
 * @param {Function} callback - Callback function (data) => void
 * @returns {Function} Unsubscribe function
 */
export const onTyping = (callback) => {
  if (!socket) return () => {};

  socket.on("typing", callback);

  return () => {
    socket.off("typing", callback);
  };
};

/**
 * Send typing indicator
 * @param {string} conversationId - Conversation ID
 * @param {boolean} isTyping - Typing state
 */
export const sendTyping = (conversationId, isTyping) => {
  if (socket && socket.connected) {
    socket.emit("typing", {
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }
};

/**
 * Listen for message read receipts
 * @param {Function} callback - Callback function (data) => void
 * @returns {Function} Unsubscribe function
 */
export const onMessageRead = (callback) => {
  if (!socket) return () => {};

  socket.on("message_read", callback);

  return () => {
    socket.off("message_read", callback);
  };
};

/**
 * Mark message as read
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 */
export const markMessageRead = (conversationId, messageId) => {
  if (socket && socket.connected) {
    socket.emit("mark_read", {
      conversation_id: conversationId,
      message_id: messageId,
    });
  }
};

/**
 * Get encryption key
 * @returns {string} Encryption key
 */
export const getEncryptionKey = () => {
  return encryptionKey;
};

/**
 * Generate encryption key
 * @returns {string} Generated key
 */
const generateEncryptionKey = () => {
  // Generate a key based on user ID and timestamp
  const userId = localStorage.getItem("userId") || "default";
  const timestamp = Date.now();
  return `${userId}_${timestamp}`;
};

/**
 * Mock WebSocket for development
 */
const createMockSocket = (userId, key) => {
  encryptionKey = key || generateEncryptionKey();
  
  const mockSocket = {
    connected: true,
    emit: (event, data, callback) => {
      // Simulate message sending
      if (event === "send_message") {
        setTimeout(() => {
          const mockResponse = {
            data: {
              id: `msg_${Date.now()}`,
              conversation_id: data.conversation_id,
              sender_id: userId,
              message: data.message, // Already encrypted
              timestamp: new Date().toISOString(),
              status: "delivered",
            },
          };
          if (callback) callback(mockResponse);
          
          // Simulate receiving message
          setTimeout(() => {
            if (mockSocket.listeners["new_message"]) {
              mockSocket.listeners["new_message"].forEach(cb => {
                cb(mockResponse.data);
              });
            }
          }, 100);
        }, 200);
      }
    },
    on: (event, handler) => {
      if (!mockSocket.listeners) mockSocket.listeners = {};
      if (!mockSocket.listeners[event]) mockSocket.listeners[event] = [];
      mockSocket.listeners[event].push(handler);
    },
    off: (event, handler) => {
      if (mockSocket.listeners && mockSocket.listeners[event]) {
        mockSocket.listeners[event] = mockSocket.listeners[event].filter(h => h !== handler);
      }
    },
    disconnect: () => {
      mockSocket.connected = false;
    },
  };

  return mockSocket;
};

export default {
  initWebSocket,
  disconnectWebSocket,
  joinConversation,
  leaveConversation,
  sendRealtimeMessage,
  onNewMessage,
  onTyping,
  sendTyping,
  onMessageRead,
  markMessageRead,
  getEncryptionKey,
};
