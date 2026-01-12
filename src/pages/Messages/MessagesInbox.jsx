// src/pages/Messages/MessagesInbox.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Search,
  Phone,
  Video,
  Shield,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  Menu,
  Lock,
  Unlock,
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
  encryptMessage,
  decryptMessage,
  loadPassphrase,
  savePassphrase,
  clearPassphrase,
} from "@/utils/encryption";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  createConversation,
} from "@/services/messagesService";

/**
 * Messages Inbox - Secure Chat Interface
 * Features:
 * - Responsive sidebar with conversation list
 * - Search conversations
 * - End-to-end encryption with user-managed passphrase
 * - Optimistic UI + message status indicators
 * - Typing indicator simulation (demo)
 * - Mobile-friendly UX
 */
export default function MessagesInbox() {
  const { user } = useAuthStore();
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
  const [sidebarOpen, setSidebarOpen] = useState(true); // open on desktop by default
  const [passphrase, setPassphrase] = useState(loadPassphrase() || "");
  const [encryptionEnabled, setEncryptionEnabled] = useState(!!loadPassphrase());
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationUserId, setNewConversationUserId] = useState("");
  const [newConversationMessage, setNewConversationMessage] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  // Simulate typing indicator (demo only)
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation) return;

    const timer = setTimeout(() => {
      if (Math.random() > 0.65) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000 + Math.random() * 4000);
      }
    }, 5000 + Math.random() * 8000);

    return () => clearTimeout(timer);
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

  // Check for start conversation from URL (e.g., from property page)
  useEffect(() => {
    const startUserId = searchParams.get("start");
    if (startUserId && !loading && conversations.length >= 0) {
      // Find existing conversation or open new conversation modal
      const existing = conversations.find((c) => c.participantId === startUserId);
      if (existing) {
        setSelectedConversation(existing);
      } else {
        // Open new conversation modal with pre-filled user ID
        setNewConversationUserId(startUserId);
        setShowNewConversationModal(true);
      }
      // Clean up URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("start");
      window.history.replaceState({}, "", `/messages${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
    }
  }, [searchParams, conversations, loading]);

  // ───────────────────────────────────────────────────────────────
  // Load & decrypt messages when conversation or passphrase changes
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation || isPremiumGated) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { messages: rawMessages = [] } = await getMessages(selectedConversation.id);

        const decrypted = rawMessages.map((msg) => {
          try {
            const decryptedText = decryptMessage(msg.message || msg.content, passphrase);
            return { ...msg, message: decryptedText };
          } catch {
            // Show warning instead of breaking UI if decryption fails
            return { ...msg, message: "[Decryption failed - wrong passphrase?]" };
          }
        });

        setMessages(decrypted);
        await markConversationAsRead(selectedConversation.id);
        
        // Play sound notification for new unread messages
        const newMessages = decrypted.filter((msg) => !msg.isOwn && !msg.is_read);
        if (newMessages.length > 0) {
          playNotificationSound("message", 0.3);
          toast.success(`You have ${newMessages.length} new message${newMessages.length > 1 ? "s" : ""}`, {
            icon: "💬",
          });
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        toast.error("Could not load messages");
      }
    };

    loadMessages();
  }, [selectedConversation, passphrase, isPremiumGated]);

  // ───────────────────────────────────────────────────────────────
  // Handle passphrase toggle / update
  // ───────────────────────────────────────────────────────────────
  const handleEncryptionToggle = () => {
    if (encryptionEnabled) {
      // Disable encryption
      if (window.confirm("Disable encryption? New messages will be sent unencrypted.")) {
        setEncryptionEnabled(false);
        clearPassphrase();
        setPassphrase("");
        toast.success("Encryption disabled");
      }
    } else {
      // Enable encryption
      const newPassphrase = window.prompt(
        "Set your encryption passphrase (keep it safe!):\n\n" +
        "This passphrase will be used to encrypt/decrypt your messages.\n" +
        "If you forget it, you won't be able to read old encrypted messages."
      );

      if (!newPassphrase?.trim()) {
        toast.error("Passphrase cannot be empty");
        return;
      }

      setPassphrase(newPassphrase.trim());
      setEncryptionEnabled(true);
      savePassphrase(newPassphrase.trim());
      toast.success("Encryption enabled");
    }
  };

  // ───────────────────────────────────────────────────────────────
  // Send message with optimistic update
  // ───────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending || isPremiumGated) return;

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
    setMessageText("");
    setSending(true);

    try {
      const payload = encryptionEnabled
        ? encryptMessage(messageText, passphrase)
        : messageText;

      const sentMessage = await sendMessage(selectedConversation.id, payload);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...sentMessage,
                message: encryptionEnabled
                  ? messageText // show original for own messages
                  : sentMessage.message,
                status: "delivered",
              }
            : m
        )
      );

      // Play sound notification for sent message (optional feedback)
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

  const filteredConversations = conversations.filter((c) =>
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ───────────────────────────────────────────────────────────────
  // Handle New Conversation
  // ───────────────────────────────────────────────────────────────
  const handleStartConversation = async () => {
    if (!newConversationUserId.trim()) {
      toast.error("Please enter a user ID or email");
      return;
    }

    // Validate messaging rules
    const targetUser = { id: newConversationUserId, role: "unknown" }; // Would need to fetch user details
    const canMessage = canUserMessage(user, targetUser, {});
    
    if (!canMessage.canMessage) {
      toast.error(canMessage.reason || "You cannot message this user");
      return;
    }

    setCreatingConversation(true);
    try {
      const conversation = await createConversation({
        recipient_id: newConversationUserId.trim(),
        initial_message: newConversationMessage.trim() || undefined,
      });
      
      // Add to conversations list
      setConversations((prev) => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowNewConversationModal(false);
      setNewConversationUserId("");
      setNewConversationMessage("");
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
      <div className="flex flex-1 overflow-hidden border-red-500">
        {/* Sidebar - Conversations */}
        <motion.div
          initial={false}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:relative lg:translate-x-0"
        >
          {/* Header + Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 ">
            <div className="flex items-center justify-between gap-2 ">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Start new conversation"
                title="Start new conversation"
              >
                <Plus className="w-5 h-5 text-[#0b6e4f]" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f] outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto h-[calc(100%-68px)]">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
                <MessageSquare className="w-16 h-16 mb-4 opacity-40" />
                <p className="text-center">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setSidebarOpen(false);
                  }}
                  aria-label={`Chat with ${conv.participantName}`}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-gray-100 dark:bg-gray-700 border-l-4 border-[#0b6e4f]"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white font-semibold shrink-0">
                    {conv.participantName?.[0]?.toUpperCase() || "?"}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium truncate">{conv.participantName}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage || "Start a conversation..."}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <div className="min-w-5 h-5 bg-[#0b6e4f] text-white text-xs rounded-full flex items-center justify-center px-1.5">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile menu toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-30 p-3 bg-white dark:bg-gray-800 rounded-full shadow-md lg:hidden"
              aria-label="Open conversations"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {selectedConversation ? (
            <>
              {/* Header */}
              <header className="bg-white dark:bg-gray-800 border-b  border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
                  >
                    <Menu className="w-5 h-5 " />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white font-medium">
                    {selectedConversation.participantName[0].toUpperCase()}
                  </div>

                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.participantName}
                  </h2>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleEncryptionToggle}
                    aria-label={encryptionEnabled ? "Encryption: On" : "Encryption: Off"}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                      encryptionEnabled
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {encryptionEnabled ? (
                      <>
                        <Lock size={14} /> Encrypted
                      </>
                    ) : (
                      <>
                        <Unlock size={14} /> Not Encrypted
                      </>
                    )}
                  </button>

                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Voice call">
                    <Phone size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Video call">
                    <Video size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
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
                {isTyping && (
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
                  <button
                    type="button"
                    className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                    aria-label="Attach"
                  >
                    <Paperclip size={22} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    aria-label="Type a message"
                    disabled={sending}
                    className="flex-1 px-5 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f] outline-none text-sm"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className={`p-3.5 rounded-full transition ${
                      messageText.trim() && !sending
                        ? "bg-[#0b6e4f] hover:bg-[#095c42] text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                    aria-label="Send"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Welcome / Empty State */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Secure Messaging
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start a conversation with landlords, tenants or artisans
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm text-sm text-gray-700 dark:text-gray-300">
                  <Shield size={16} className="text-[#0b6e4f]" />
                  End-to-end encrypted
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* New Conversation Modal */}
        <AnimatePresence>
          {showNewConversationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewConversationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Start New Conversation</h3>
                  <button
                    onClick={() => setShowNewConversationModal(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User ID or Email
                    </label>
                    <input
                      type="text"
                      value={newConversationUserId}
                      onChange={(e) => setNewConversationUserId(e.target.value)}
                      placeholder="Enter user ID or email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Message (Optional)
                    </label>
                    <textarea
                      value={newConversationMessage}
                      onChange={(e) => setNewConversationMessage(e.target.value)}
                      placeholder="Type your first message..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Messaging Rules:</p>
                    <p>{getMessagingRulesDescription(user?.role)}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNewConversationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartConversation}
                      disabled={creatingConversation || !newConversationUserId.trim()}
                      className="flex-1 px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creatingConversation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Start Conversation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}