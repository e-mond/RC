import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, User } from "lucide-react";
import {
  getConversation,
  getMessages,
  sendMessage,
  createConversation,
  sendDirectMessage,
} from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function ChatInterface() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
      loadMessages();
    } else if (userId) {
      createOrGetConversation();
    }
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createOrGetConversation = async () => {
    try {
      const data = await createConversation({ recipient_id: parseInt(userId) });
      setConversation(data);
      if (data.id) {
        loadMessages(data.id);
      }
    } catch (err) {
      setError(err.message || "Failed to load conversation");
    }
  };

  const loadConversation = async () => {
    try {
      const data = await getConversation(conversationId);
      setConversation(data);
    } catch (err) {
      setError(err.message || "Failed to load conversation");
    }
  };

  const loadMessages = async (id = conversationId) => {
    try {
      setLoading(true);
      const data = await getMessages(id);
      setMessages(data.results || data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = { content: newMessage };
      const id = conversationId || conversation?.id;
      
      if (id) {
        await sendMessage(id, messageData);
      } else if (userId) {
        await sendDirectMessage({ recipient_id: parseInt(userId), content: newMessage });
      }

      setNewMessage("");
      await loadMessages(id || conversation?.id);
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const otherUser =
    conversation?.participant1?.id === user?.id
      ? conversation?.participant2
      : conversation?.participant1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        {otherUser && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center">
              {otherUser.profile_picture_url ? (
                <img
                  src={otherUser.profile_picture_url}
                  alt={otherUser.full_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser.full_name}</h2>
                <p className="text-sm text-gray-600">{otherUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender?.id === user?.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? "bg-teal-600 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-75">
                        {message.sender?.full_name}
                      </p>
                    )}
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-teal-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-white border-t border-gray-200 p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Button type="submit" loading={sending} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

