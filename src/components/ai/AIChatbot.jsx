/**
 * AIChatbot Component
 * 
 * AI-powered assistant (Efie AI) for tenants, landlords, artisans...
 * Floating button + chat window with conversation persistence
 * 
 * Recommended position: "bottom-right" (industry standard)
 * 
 * @param {Object} props
 * @param {boolean} [props.defaultOpen=false] - Open chat on mount
 * @param {string} [props.position="bottom-right"] - "bottom-right" | "bottom-left" | "top-right" | "top-left"
 */
import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatbotMessage, getChatbotConversations } from "@/services/aiService";
import { useAuthStore } from "@/stores/authStore";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AIChatbot({ defaultOpen = false, position = "bottom-right" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();
  const location = useLocation();
  const notificationAudioRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input & reset notification when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 150);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Listen for custom event to open chatbot from anywhere (e.g., landing page CTA)
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener('openAIChatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('openAIChatbot', handleOpenChatbot);
    };
  }, []);

  // Load history when user is authenticated & chat opens (skip for public users)
  useEffect(() => {
    if (user && isOpen && !messages.length) {
      loadConversations();
    } else if (!user && isOpen && !messages.length) {
      // Public user - show welcome message immediately
      setWelcomeMessage();
    }
  }, [user, isOpen]);

  const loadConversations = async () => {
    try {
      const data = await getChatbotConversations();
      if (data?.conversations?.length > 0) {
        const latest = data.conversations[0];
        setConversationId(latest.id);
        setMessages(
          latest.messages?.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })) || []
        );
      } else {
        setWelcomeMessage();
      }
    } catch (err) {
      console.warn("Failed to load chatbot history:", err);
      setWelcomeMessage();
    }
  };

  // Get user role (public if not authenticated)
  const getUserRole = () => {
    if (!user) return "public";
    return user.role?.toLowerCase() || "tenant";
  };

  const setWelcomeMessage = () => {
    const role = getUserRole();

    const welcomeMessages = {
      public: "Hello! I'm Efie AI. I can help you learn about RentalConnects, browse properties, and answer questions about our platform. How can I assist you today?",
      tenant: "Hello! I'm Efie AI — Helping You Feel at Home. I can help you find properties, discover artisans, and answer questions. How can I assist you today?",
      landlord: "Hello! I'm Efie AI. I can help you manage properties, respond to bookings, find tenants, and answer platform questions. How can I assist you today?",
      artisan: "Hello! I'm Efie AI. I can help you find tasks, manage your schedule, track earnings, and grow your business. How can I assist you today?",
      admin: "Hello! I'm Efie AI. I can help you manage approvals, review reports, and answer platform administration questions. How can I assist you today?",
      "super-admin": "Hello! I'm Efie AI. I can help you manage the system, users, pricing, and platform-wide settings. How can I assist you today?",
    };

    setMessages([
      {
        role: "assistant",
        content: welcomeMessages[role] || welcomeMessages.public,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    const newMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      let locationData = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        locationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch { } // silent fail

      // Determine user role (public if not authenticated)
      const userRole = user?.role?.toLowerCase() || "public";

      // Use existing conversation_id if available (for both auth and guest users)
      const conversationIdForRequest = conversationId;

      const res = await sendChatbotMessage({
        message: userMessage,
        conversation_id: conversationIdForRequest || "",
        context: {
          user_role: userRole,
          location: locationData,
          current_page: location.pathname,
        },
      });

      if (res.conversation_id) setConversationId(res.conversation_id);

      const assistantMsg = {
        role: "assistant",
        content: res.response,
        timestamp: new Date().toISOString(),
        suggested_actions: res.suggested_actions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) {
        setHasNewMessage(true);
        // Optional subtle sound (very low volume)
        try {
          const audio = new Audio(
            "https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-notification-2044.mp3"
          );
          audio.volume = 0.18;
          audio.play().catch(() => { });
        } catch { }
      }
    } catch (err) {
      console.error("AI Chat error:", err);

      const isRateLimit =
        err?.response?.status === 429 ||
        err?.message?.toLowerCase().includes("too many") ||
        err?.message?.includes("429");

      const errorMsg = {
        role: "assistant",
        content: isRateLimit
          ? "I'm a bit busy right now — too many conversations! Please wait 10–30 seconds and try again. 🙏"
          : "Sorry, something went wrong on my end. Try again or rephrase your question.",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
      if (isRateLimit) {
        toast.error("Rate limit reached — please wait a moment.");
      } else {
        toast.error("Failed to get response.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action?.type === "search" || action?.type === "quick_reply") {
      const query = action?.data?.query || action?.label;
      if (query) {
        setInput(query);
        // Optional: auto-submit
        setTimeout(() => {
          // We can't easily call handleSend directly due to event object requirement, 
          // but we can refactor handleSend or just set input and focus.
          // Better UX for quick reply is often auto-send.
          // Let's just set input and focus for now to match current behavior, 
          // OR trigger a send.
          // To trigger send, we need to bypass the form event.
          // Let's extract the core sending logic.
          submitMessage(query);
        }, 100);
      }
    }
  };

  const submitMessage = async (msgText) => {
    if (!msgText.trim() || loading) return;

    const userMessage = msgText.trim();
    setInput("");

    const newMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      let locationData = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        locationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch { }

      const userRole = user?.role?.toLowerCase() || "public";
      const conversationIdForRequest = conversationId;

      const res = await sendChatbotMessage({
        message: userMessage,
        conversation_id: conversationIdForRequest || "",
        context: {
          user_role: userRole,
          location: locationData,
          current_page: location.pathname,
        },
      });

      if (res.conversation_id) setConversationId(res.conversation_id);

      const assistantMsg = {
        role: "assistant",
        content: res.response,
        timestamp: new Date().toISOString(),
        suggested_actions: res.suggested_actions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) {
        setHasNewMessage(true);
        try {
          const audio = new Audio(
            "https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-notification-2044.mp3"
          );
          audio.volume = 0.18;
          audio.play().catch(() => { });
        } catch { }
      }
    } catch (err) {
      console.error("AI Chat error:", err);

      const isRateLimit =
        err?.response?.status === 429 ||
        err?.message?.toLowerCase().includes("too many") ||
        err?.message?.includes("429");

      const errorMsg = {
        role: "assistant",
        content: isRateLimit
          ? "I'm a bit busy right now — too many conversations! Please wait 10–30 seconds and try again. 🙏"
          : "Sorry, something went wrong on my end. Try again or rephrase your question.",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
      if (isRateLimit) {
        toast.error("Rate limit reached — please wait a moment.");
      } else {
        toast.error("Failed to get response.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //                   POSITIONING
  // ────────────────────────────────────────────────
  const positionStyles = {
    "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
    "top-right": "top-20 right-4 sm:top-24 sm:right-6", // Below navbar
    "top-left": "top-20 left-4 sm:top-24 sm:left-6", // Below navbar
  };

  const btnPosition = positionStyles[position] || positionStyles["bottom-right"];

  const chatPosition = positionStyles[position] || positionStyles["bottom-right"];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: hasNewMessage ? [0, -6, 0] : 0,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              y: { duration: 1.2, repeat: hasNewMessage ? Infinity : 0, repeatDelay: 3 },
            }}
            onClick={() => setIsOpen(true)}
            className={`fixed ${btnPosition} z-[9998] w-14 h-14 sm:w-16 sm:h-16 rounded-full 
              bg-gradient-to-br from-[#0b6e4f] to-[#095c42] hover:from-[#0a805c] hover:to-[#0b6e4f]
              text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 
              transition-all duration-300 flex items-center justify-center group touch-manipulation`}
            aria-label="Open Efie AI Assistant"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            {hasNewMessage && (
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-300/40"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}

            <Bot size={28} className="relative z-10 group-hover:rotate-12 transition-transform" />

            {hasNewMessage && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={`fixed ${chatPosition} z-[9999] w-[calc(100vw-2rem)] sm:w-96 
              h-[calc(100vh-5rem)] sm:h-[580px] max-h-[85vh] 
              bg-white dark:bg-gray-950 rounded-2xl shadow-2xl 
              border border-gray-200/80 dark:border-gray-800/80 
              flex flex-col overflow-hidden backdrop-blur-sm`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#0b6e4f] to-[#095c42] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-semibold">Efie AI</div>
                  <div className="text-xs opacity-90">Always here to help</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={22} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/30 dark:to-gray-950">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-[#0b6e4f] dark:text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                      ? "bg-[#0b6e4f] text-white"
                      : msg.isError
                        ? "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50"
                        : "bg-gray-100/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100"
                      }`}
                  >
                    {msg.content}
                    {msg.suggested_actions?.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-700 space-y-2">
                        {msg.suggested_actions.map((act, idx) => {
                          if (act.type === 'property_card') {
                            return (
                              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 w-full mb-2">
                                {act.data.image && (
                                  <img src={act.data.image} alt={act.data.title} className="w-full h-32 object-cover" />
                                )}
                                <div className="p-3">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate" title={act.data.title}>{act.data.title}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <span>📍</span> {act.data.location}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>🛏️ {act.data.bedrooms} bdr</span>
                                    <span>•</span>
                                    <span className="capitalize">{act.data.type}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-3">
                                    <span className="font-bold text-emerald-600 text-sm">₵{act.data.price?.toLocaleString()}</span>
                                    <a
                                      href={`/tenant/properties/${act.data.id}`}
                                      className="text-[10px] font-medium px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                                    >
                                      View Details
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(act)}
                              className="block w-full text-left text-xs px-3 py-1.5 rounded-lg bg-white/30 dark:bg-gray-700/40 hover:bg-white/50 dark:hover:bg-gray-700/60 transition"
                            >
                              {act.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-[#0b6e4f] dark:text-emerald-400" />
                  </div>
                  <div className="bg-gray-100/90 dark:bg-gray-800/90 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:180ms]" />
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:360ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about properties, artisans, rentals..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6e4f]/60 focus:border-transparent disabled:opacity-60"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-5 py-3 bg-[#0b6e4f] hover:bg-[#095c42] text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center min-w-[52px]"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                Efie AI — Feel at home faster
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}