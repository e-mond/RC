// src/pages/Dashboards/Artisan/Messages/ArtisanMessages.jsx
import React, { useEffect, useState, useRef } from "react";
import { getArtisanConversations, sendArtisanMessage } from "@/services/artisanService";
import {
  MessageSquare,
  Send,
  Paperclip,
  Loader2,
  Search,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";

/**
 * ArtisanMessages - Premium Messaging Dashboard
 * Full dark mode + glassmorphism + smooth animations
 */
export default function ArtisanMessages() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getArtisanConversations();
        if (mounted) setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getArtisanConversations:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    const newMsg = {
      id: Date.now(),
      message: messageText,
      senderId: user?.id,
      senderName: user?.name || "You",
      timestamp: new Date().toISOString(),
    };

    setSending(true);
    try {
      await sendArtisanMessage(selectedConversation.id, messageText);
      setMessages((prev) => [...prev, newMsg]);
      setMessageText("");
    } catch (err) {
      console.error("sendArtisanMessage:", err);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.recipientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Communicate with landlords and tenants
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">
        {/* Conversations Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Conversations
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {conversations.length} total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      currentUserId={user?.id} // ← passed as prop (no TS syntax!)
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        >
          {selectedConversation ? (
            <>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/60">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-linear-to-br from-[#0b6e4f] to-[#095c42] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {selectedConversation.recipientName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {selectedConversation.recipientName || "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation.recipientRole || "User"} • Active now
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-linear-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id || i}
                      message={msg}
                      isOwn={msg.senderId === user?.id}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/60">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Paperclip size={22} className="text-gray-600 dark:text-gray-400" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] text-gray-900 dark:text-white placeholder-gray-500"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="p-4 bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <MessageSquare size={48} className="text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* Fixed: No TypeScript syntax, pure JS */
function ConversationItem({ conversation, isSelected, onClick, currentUserId }) {
  const lastMessage = conversation.lastMessage || conversation.messages?.[conversation.messages.length - 1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 8 }}
      onClick={onClick}
      className={`p-5 cursor-pointer transition-all ${
        isSelected
          ? "bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 border-l-4 border-[#0b6e4f]"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 bg-linear-to-br from-[#0b6e4f] to-[#095c42] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
            {conversation.recipientName?.[0]?.toUpperCase() || "U"}
          </div>
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              {conversation.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {conversation.recipientName || "Unknown User"}
          </h4>
          {lastMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
              {lastMessage.senderId === currentUserId ? "You: " : ""}
              {lastMessage.message || lastMessage.text || "No messages"}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {lastMessage?.timestamp
              ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-md ${
          isOwn
            ? "bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.message || message.text}</p>
        <p
          className={`text-xs mt-2 ${
            isOwn ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          } text-right`}
        >
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
      </div>
    </motion.div>
  );
}