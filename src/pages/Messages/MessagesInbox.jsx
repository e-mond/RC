// src/pages/Messages/MessagesInbox.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Search,
  MoreVertical,
  Phone,
  Video,
  Shield,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import UpgradePrompt from "@/components/premium/UpgradePrompt";
import { encryptMessage, decryptMessage, loadPassphrase, savePassphrase } from "@/utils/encryption";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
} from "@/services/messagesService";

export default function MessagesInbox() {
  const { user } = useAuthStore();
  const { can, role } = useFeatureAccess();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Collapsible on mobile
  const [encryptionPassphrase, setEncryptionPassphrase] = useState(loadPassphrase());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isPremiumGated = role === "tenant" && !can("direct_messaging");
  const encryptionEnabled = Boolean(encryptionPassphrase);

  // Simulate typing indicator
  useEffect(() => {
    if (selectedConversation && Math.random() > 0.6) {
      const timer = setTimeout(() => setIsTyping(true), 4000);
      const stop = setTimeout(() => setIsTyping(false), 8000);
      return () => {
        clearTimeout(timer);
        clearTimeout(stop);
      };
    }
  }, [selectedConversation, messages]);

  // Persist passphrase whenever it changes
  useEffect(() => {
    savePassphrase(encryptionPassphrase);
  }, [encryptionPassphrase]);

  // Load conversations
  useEffect(() => {
    if (isPremiumGated) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isPremiumGated]);

  // Load messages
  useEffect(() => {
    if (!selectedConversation || isPremiumGated) {
      setMessages([]);
      return;
    }

    const load = async () => {
      try {
        const data = await getMessages(selectedConversation.id);
        // Decrypt messages if they were encrypted with our helper
        const items = (data.messages || []).map((m) => ({
          ...m,
          message: decryptMessage(m.message, encryptionPassphrase),
        }));
        setMessages(items);
        await markConversationAsRead(selectedConversation.id);
      } catch {
        toast.error("Failed to load messages");
      }
    };
    load();
  }, [selectedConversation, isPremiumGated]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Keyboard accessibility: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || isPremiumGated) return;

    const tempId = Date.now();
    const optimistic = {
      id: tempId,
      message: messageText,
      senderId: user.id,
      senderName: "You",
      timestamp: new Date().toISOString(),
      status: "sending",
      isOwn: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessageText("");

    setSending(true);
    try {
      const payload = encryptionEnabled
        ? encryptMessage(messageText, encryptionPassphrase)
        : messageText;
      const sent = await sendMessage(selectedConversation.id, payload);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...sent,
                message: decryptMessage(sent.message || sent.content, encryptionPassphrase),
                status: "delivered",
              }
            : m
        )
      );
    } catch {
      toast.error("Failed to send");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPremiumGated) return <UpgradePrompt featureName="Direct Messaging" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar – Collapsible on mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="h-full overflow-y-auto pb-20 lg:pb-0">
            {filteredConversations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className={`w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    selectedConversation?.id === conv.id ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                  aria-label={`Chat with ${conv.participantName}`}
                >
                  <div className="w-14 h-14 bg-linear-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {conv.participantName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.participantName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.lastMessageTime || Date.now()).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.lastMessage || "Tap to start chatting"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-[#0b6e4f] text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 relative">
          {/* Mobile Sidebar Toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg lg:hidden"
              aria-label="Open conversations"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-linear-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.participantName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.participantName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Encryption status / quick passphrase toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = window.prompt(
                        encryptionEnabled
                          ? "Update your chat passphrase (leave empty to disable encryption):"
                          : "Set a chat passphrase to enable end-to-end encryption:"
                      );
                      if (next === null) return;
                      setEncryptionPassphrase(next.trim());
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20"
                  >
                    {encryptionEnabled ? "Encryption: On" : "Encryption: Off"}
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                          msg.isOwn
                            ? "bg-[#0b6e4f] text-white"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        }`}
                      >
                        <p className="text-sm wrap-break-word">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.isOwn && (
                            <>
                              {msg.status === "sending" && <Loader2 className="w-3 h-3 animate-spin" />}
                              {msg.status === "delivered" && <Check className="w-3.5 h-3.5" />}
                              {msg.status === "read" && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">typing</span>
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <button type="button" className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="flex-1 px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] text-sm"
                    disabled={sending}
                    aria-label="Type message"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="p-3 bg-[#0b6e4f] text-white rounded-full hover:bg-[#095c42] disabled:opacity-50 transition"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center max-w-md px-8">
                <div className="w-32 h-32 mx-auto mb-8 bg-linear-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">RC</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Secure messaging for tenants, landlords, and artisans
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  <Shield className="w-4 h-4" />
                  <span>Your messages are end-to-end encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Overlay when sidebar open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}