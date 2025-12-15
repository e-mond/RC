// src/pages/Dashboards/Artisan/Messages/ArtisanMessages.jsx
import React, { useEffect, useState, useRef } from "react";
import { getArtisanConversations, sendArtisanMessage } from "@/services/artisanService";
import { MessageSquare, Send, Paperclip, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";

/**
 * ArtisanMessages - Messaging with landlords and tenants
 * - Conversation list
 * - Chat interface
 * - File sharing
 */
export default function ArtisanMessages() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
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
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Load messages for selected conversation
      // This would typically come from chatService
      setMessages(selectedConversation.messages || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await sendArtisanMessage(selectedConversation.id, messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: messageText,
          senderId: user?.id,
          senderName: user?.name || "You",
          timestamp: new Date().toISOString(),
        },
      ]);
      setMessageText("");
    } catch (err) {
      console.error("sendArtisanMessage:", err);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Communicate with landlords and tenants</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedConversation?.id === conv.id}
                    onClick={() => setSelectedConversation(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversation.recipientName?.[0] || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.recipientName || "Unknown"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.recipientRole || "User"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderId === user?.id}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="p-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Conversation Item
function ConversationItem({ conversation, isSelected, onClick }) {
  const lastMessage = conversation.lastMessage || conversation.messages?.[conversation.messages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-[#0b6e4f]/5 border-l-4 border-[#0b6e4f]" : ""
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white font-semibold">
          {conversation.recipientName?.[0] || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {conversation.recipientName || "Unknown"}
          </h4>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate">{lastMessage.message || lastMessage.text}</p>
          )}
        </div>
        {conversation.unreadCount > 0 && (
          <div className="w-5 h-5 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white text-xs font-medium">
            {conversation.unreadCount}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Message Bubble
function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${isOwn ? "bg-[#0b6e4f] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          }`}
      >
        <p className="text-sm">{message.message || message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-500"}`}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ""}
        </p>
      </div>
    </motion.div>
  );
}

