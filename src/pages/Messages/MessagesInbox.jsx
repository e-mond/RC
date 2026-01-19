// src/pages/Messages/MessagesInbox.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  Shield,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  Menu,
  Plus,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import UpgradePrompt from "@/components/premium/UpgradePrompt";
import { playNotificationSound } from "@/utils/soundNotifications";
import { canUserMessage, getMessagingRulesDescription } from "@/utils/messagingRules";
import {
  getConversations,
  getMessages,
  markConversationAsRead,
  createConversation,
} from "@/services/messagesService";
import UserSearchAutocomplete from "@/components/messages/UserSearchAutocomplete";
import {
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
} from "@/services/websocketService";

/**
 * Messages Inbox - Real-Time Secure Chat Interface
 * Features:
 * - WebSocket-based real-time messaging
 * - Automatic end-to-end encryption (no manual toggle)
 * - Real-time typing indicators
 * - Read receipts
 * - Responsive sidebar with conversation list
 * - Mobile-friendly UX
 */
export default function MessagesInbox() {
  const { user, token } = useAuthStore();
  const { can, role } = useFeatureAccess();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationUserId, setNewConversationUserId] = useState("");
  const [newConversationMessage, setNewConversationMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const wsRef = useRef(null);

  const isPremiumGated = role === "tenant" && !can("direct_messaging");

  // ───────────────────────────────────────────────────────────────
  // Auto-scroll to bottom
  // ───────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ───────────────────────────────────────────────────────────────
  // Initialize WebSocket connection
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPremiumGated || !user || !token) return;

    try {
      const socket = initWebSocket(token, user.id);
      wsRef.current = socket;
      
      if (socket.connected) {
        setWsConnected(true);
      }

      socket.on("connect", () => {
        setWsConnected(true);
        console.log("WebSocket connected");
      });

      socket.on("disconnect", () => {
        setWsConnected(false);
        console.log("WebSocket disconnected");
      });

      return () => {
        disconnectWebSocket();
        setWsConnected(false);
      };
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      toast.error("Real-time messaging unavailable");
    }
  }, [user, token, isPremiumGated]);

  // ───────────────────────────────────────────────────────────────
  // Listen for new messages via WebSocket
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wsRef.current || !selectedConversation) return;

    const unsubscribe = onNewMessage((message) => {
      if (message.conversation_id === selectedConversation.id || 
          message.conversationId === selectedConversation.id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, {
            ...message,
            isOwn: message.sender_id === user.id || message.senderId === user.id,
            status: "delivered",
          }];
        });
        playNotificationSound("message", 0.3);
        scrollToBottom();
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          (conv.id === message.conversation_id || conv.id === message.conversationId)
            ? {
                ...conv,
                lastMessage: message.message,
                lastMessageTime: message.timestamp,
                unreadCount: message.sender_id !== user.id ? (conv.unreadCount || 0) + 1 : 0,
              }
            : conv
        )
      );
    });

    return unsubscribe;
  }, [selectedConversation, user.id, scrollToBottom]);

  // ───────────────────────────────────────────────────────────────
  // Listen for typing indicators
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wsRef.current || !selectedConversation) return;

    const unsubscribe = onTyping((data) => {
      if (data.conversation_id === selectedConversation.id && 
          data.user_id !== user.id) {
        setIsTyping(data.is_typing);
        setTypingUserId(data.user_id);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        if (data.is_typing) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUserId(null);
          }, 3000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation, user.id]);

  // ───────────────────────────────────────────────────────────────
  // Listen for read receipts
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!wsRef.current || !selectedConversation) return;

    const unsubscribe = onMessageRead((data) => {
      if (data.conversation_id === selectedConversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message_id ? { ...msg, status: "read" } : msg
          )
        );
      }
    });

    return unsubscribe;
  }, [selectedConversation]);

  // ───────────────────────────────────────────────────────────────
  // Load conversations
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPremiumGated) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [isPremiumGated]);

  // Check for start conversation from URL with optional pre-filled message
  useEffect(() => {
    const startUserId = searchParams.get("start");
    const preFilledMessage = searchParams.get("message");
    const conversationId = searchParams.get("conversation");
    
    // If conversation ID is provided, select that conversation
    if (conversationId && !loading) {
      const existing = conversations.find((c) => c.id === conversationId || c.id?.toString() === conversationId);
      if (existing) {
        setSelectedConversation(existing);
        // If message is provided, pre-fill it
        if (preFilledMessage) {
          setMessageText(decodeURIComponent(preFilledMessage));
        }
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("conversation");
        newSearchParams.delete("message");
        window.history.replaceState({}, "", `/messages${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
        return;
      }
    }
    
    // If start user ID is provided, open new conversation modal
    if (startUserId && !loading && conversations.length >= 0) {
      const existing = conversations.find((c) => c.participantId === startUserId || c.participantId?.toString() === startUserId);
      if (existing) {
        setSelectedConversation(existing);
        // If message is provided, pre-fill it
        if (preFilledMessage) {
          setMessageText(decodeURIComponent(preFilledMessage));
        }
      } else {
        setNewConversationUserId(startUserId);
        // Pre-fill message if provided
        if (preFilledMessage) {
          setNewConversationMessage(decodeURIComponent(preFilledMessage));
        }
        setShowNewConversationModal(true);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("start");
      newSearchParams.delete("message");
      window.history.replaceState({}, "", `/messages${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
    }
  }, [searchParams, conversations, loading]);

  // ───────────────────────────────────────────────────────────────
  // Load messages when conversation selected
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation || isPremiumGated) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { messages: rawMessages = [] } = await getMessages(selectedConversation.id);
        setMessages(rawMessages.map(msg => ({
          ...msg,
          isOwn: msg.sender_id === user.id || msg.senderId === user.id,
        })));
        await markConversationAsRead(selectedConversation.id);
        
        // Check for pre-filled message from URL (only once when conversation is first loaded)
        const preFilledMessage = searchParams.get("message");
        if (preFilledMessage && rawMessages.length === 0) {
          setMessageText(decodeURIComponent(preFilledMessage));
          // Clear the message param after using it
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete("message");
          window.history.replaceState({}, "", `/messages?conversation=${selectedConversation.id}${newSearchParams.toString() ? `&${newSearchParams.toString()}` : ""}`);
        }
        
        // Join WebSocket room for this conversation
        joinConversation(selectedConversation.id);
      } catch (err) {
        console.error("Failed to load messages:", err);
        toast.error("Could not load messages");
      }
    };

    loadMessages();

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, isPremiumGated, user.id]);

  // ───────────────────────────────────────────────────────────────
  // Send message via WebSocket
  // ───────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending || isPremiumGated || !wsConnected) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      message: messageText,
      senderId: user.id,
      senderName: "You",
      timestamp: new Date().toISOString(),
      status: "sending",
      isOwn: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    const messageToSend = messageText;
    setMessageText("");
    setSending(true);

    try {
      const sentMessage = await sendRealtimeMessage(selectedConversation.id, messageToSend);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...sentMessage,
                message: messageToSend, // Show original for own messages
                status: "delivered",
              }
            : m
        )
      );

      playNotificationSound("message", 0.2);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send:", err);
      toast.error("Message failed to send");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!selectedConversation || !wsConnected) return;
    sendTyping(selectedConversation.id, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(selectedConversation.id, false);
    }, 1000);
  }, [selectedConversation, wsConnected]);

  useEffect(() => {
    if (messageText) {
      handleTyping();
    }
  }, [messageText, handleTyping]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!selectedConversation || !wsConnected) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.isOwn && msg.status !== "read"
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        markMessageRead(selectedConversation.id, msg.id);
      });
    }
  }, [messages, selectedConversation, wsConnected]);

  const filteredConversations = conversations.filter((c) =>
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ───────────────────────────────────────────────────────────────
  // Handle New Conversation
  // ───────────────────────────────────────────────────────────────
  const handleStartConversation = async () => {
    // Use selected user if available, otherwise fall back to user ID input
    let userId;
    
    if (selectedUser) {
      userId = selectedUser.id || selectedUser._id;
    } else {
      const trimmedUserId = newConversationUserId.trim();
      if (!trimmedUserId) {
        toast.error("Please search and select a user");
        return;
      }

      // Validate and convert to integer (backend only accepts user ID, not email)
      if (!/^\d+$/.test(trimmedUserId)) {
        toast.error("User ID must be a whole number (no decimals or letters)");
        return;
      }

      userId = parseInt(trimmedUserId, 10);
      if (isNaN(userId) || userId <= 0) {
        toast.error("User ID must be a positive number");
        return;
      }
    }

    const targetUser = selectedUser || { id: userId, role: "unknown" };
    const canMessage = canUserMessage(user, targetUser, {});
    
    if (!canMessage.canMessage) {
      toast.error(canMessage.reason || "You cannot message this user");
      return;
    }

    setCreatingConversation(true);
    try {
      const conversation = await createConversation({
        recipient_id: userId, // Send as integer
        initial_message: newConversationMessage.trim() || undefined,
      });
      
      setConversations((prev) => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowNewConversationModal(false);
      setNewConversationUserId("");
      setNewConversationMessage("");
      setSelectedUser(null);
      toast.success("Conversation started!");
      playNotificationSound("message", 0.2);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(err.message || "Failed to start conversation");
    } finally {
      setCreatingConversation(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // RENDERING
  // ───────────────────────────────────────────────────────────────
  if (isPremiumGated) {
    return <UpgradePrompt featureName="Direct Messaging" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversations */}
        <motion.div
          initial={false}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:relative lg:translate-x-0 z-30"
        >
          {/* Header + Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                aria-label="New conversation"
              >
                <Plus size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto h-[calc(100vh-120px)]">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${
                    selectedConversation?.id === conv.id
                      ? "bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white font-medium">
                      {conv.participantName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {conv.participantName || "Unknown"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#0b6e4f] text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage || "No messages"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedConversation ? (
            <>
              {/* Header */}
              <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white font-medium">
                    {selectedConversation.participantName[0].toUpperCase()}
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.participantName}
                    </h2>
                    {wsConnected && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                    <Shield size={14} /> Encrypted
                  </div>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50 dark:bg-gray-950">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[65%] px-4 py-3 rounded-2xl shadow-sm ${
                          msg.isOwn
                            ? "bg-[#0b6e4f] text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow"
                        }`}
                      >
                        <p className="text-sm wrap-break-words whitespace-pre-wrap">{msg.message}</p>

                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>

                          {msg.isOwn && (
                            <>
                              {msg.status === "sending" && <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70" />}
                              {msg.status === "delivered" && <Check className="w-4 h-4" />}
                              {msg.status === "read" && <CheckCheck className="w-4 h-4 text-blue-300" />}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && typingUserId !== user.id && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">typing</span>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center gap-3 max-w-5xl mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    aria-label="Type a message"
                    disabled={sending || !wsConnected}
                    className="flex-1 px-5 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f] outline-none text-sm"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim() || !wsConnected}
                    className={`p-3.5 rounded-full transition ${
                      messageText.trim() && !sending && wsConnected
                        ? "bg-[#0b6e4f] hover:bg-[#095c42] text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                    aria-label="Send"
                  >
                    {sending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
                {!wsConnected && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
                    Reconnecting...
                  </p>
                )}
              </form>
            </>
          ) : (
            /* Welcome / Empty State */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Real-Time Secure Messaging
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start a conversation with landlords, tenants or artisans
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm text-sm text-gray-700 dark:text-gray-300">
                  <Shield size={16} className="text-[#0b6e4f]" />
                  End-to-end encrypted • Real-time
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewConversationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  New Conversation
                </h2>
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <UserSearchAutocomplete
                  value={newConversationUserId}
                  onChange={(value) => {
                    setNewConversationUserId(value);
                    if (!value) {
                      setSelectedUser(null);
                    }
                  }}
                  onSelect={(user) => {
                    setSelectedUser(user);
                    if (user?.id) {
                      setNewConversationUserId(user.id.toString());
                    }
                  }}
                  selectedUser={selectedUser}
                  placeholder="Search by email or name..."
                />
                
                {/* Fallback: Manual User ID Entry */}
                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Or enter User ID manually
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newConversationUserId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewConversationUserId(value);
                        setSelectedUser(null);
                      }}
                      placeholder="Enter user ID (e.g., 123)"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Message (Optional)
                  </label>
                  <textarea
                    value={newConversationMessage}
                    onChange={(e) => setNewConversationMessage(e.target.value)}
                    placeholder="Type your first message..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    autoFocus={!!newConversationMessage}
                  />
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <p className="font-medium mb-1">Messaging Rules:</p>
                  <p>{getMessagingRulesDescription(user.role)}</p>
                </div>

                <button
                  onClick={handleStartConversation}
                  disabled={creatingConversation || (!selectedUser && (!newConversationUserId.trim() || !/^\d+$/.test(newConversationUserId.trim())))}
                  className="w-full px-4 py-2 bg-[#0b6e4f] hover:bg-[#095c42] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingConversation ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Start Conversation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
