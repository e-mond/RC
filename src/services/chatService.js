import apiClient from "./apiClient";

/**
 * Chat Service
 * Handles all chat and messaging-related API calls
 */

/**
 * Get all conversations for current user
 * @returns {Promise} List of conversations
 */
export const getConversations = async () => {
  try {
    const { data } = await apiClient.get("/chat/conversations/");
    return data;
  } catch (err) {
    console.error("Get conversations error:", err);
    throw err.response?.data || { message: "Failed to fetch conversations" };
  }
};

/**
 * Get conversation by ID
 * @param {number} id - Conversation ID
 * @returns {Promise} Conversation details
 */
export const getConversation = async (id) => {
  try {
    const { data } = await apiClient.get(`/chat/conversations/${id}/`);
    return data;
  } catch (err) {
    console.error("Get conversation error:", err);
    throw err.response?.data || { message: "Failed to fetch conversation" };
  }
};

/**
 * Create or get conversation with a user
 * @param {Object} conversationData - Conversation data (recipient_id)
 * @returns {Promise} Conversation details
 */
export const createConversation = async (conversationData) => {
  try {
    const { data } = await apiClient.post("/chat/conversations/", conversationData);
    return data;
  } catch (err) {
    console.error("Create conversation error:", err);
    throw err.response?.data || { message: "Failed to create conversation" };
  }
};

/**
 * Get messages in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {Object} params - Query parameters (page, page_size)
 * @returns {Promise} Message list with pagination
 */
export const getMessages = async (conversationId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });
    
    const { data } = await apiClient.get(
      `/chat/conversations/${conversationId}/messages/?${queryParams.toString()}`
    );
    return data;
  } catch (err) {
    console.error("Get messages error:", err);
    throw err.response?.data || { message: "Failed to fetch messages" };
  }
};

/**
 * Send a message in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {Object} messageData - Message data (content)
 * @returns {Promise} Sent message
 */
export const sendMessage = async (conversationId, messageData) => {
  try {
    const { data } = await apiClient.post(
      `/chat/conversations/${conversationId}/messages/`,
      messageData
    );
    return data;
  } catch (err) {
    console.error("Send message error:", err);
    throw err.response?.data || { message: "Failed to send message" };
  }
};

/**
 * Send a message (creates conversation if needed)
 * @param {Object} messageData - Message data (recipient_id, content)
 * @returns {Promise} Sent message
 */
export const sendDirectMessage = async (messageData) => {
  try {
    const { data } = await apiClient.post("/chat/messages/send/", messageData);
    return data;
  } catch (err) {
    console.error("Send direct message error:", err);
    throw err.response?.data || { message: "Failed to send message" };
  }
};

/**
 * Get unread messages count
 * @returns {Promise} Unread messages count
 */
export const getUnreadCount = async () => {
  try {
    const { data } = await apiClient.get("/chat/messages/unread-count/");
    return data;
  } catch (err) {
    console.error("Get unread count error:", err);
    throw err.response?.data || { message: "Failed to fetch unread count" };
  }
};

