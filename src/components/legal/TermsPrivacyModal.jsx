import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { getTermsContent, getPrivacyContent } from "./legalContent.jsx";

/**
 * Terms & Privacy Modal Component
 * 
 * Features:
 * - Scrollable content area
 * - Forced scrolling to bottom before agreement
 * - "I have read and agree" button only enabled after scrolling
 * - Supports both Terms and Privacy content
 */
export default function TermsPrivacyModal({ type, isOpen, onClose, onAgree }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null);

  const isTerms = type === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const content = isTerms ? getTermsContent() : getPrivacyContent();

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current || !contentRef.current) return;

    const container = scrollContainerRef.current;
    const content = contentRef.current;
    
    // Check if scrolled to bottom (with 50px threshold)
    const isAtBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    setHasScrolledToBottom(isAtBottom);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setHasAgreed(false);
      // Scroll to top when opening
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  const handleAgree = () => {
    if (hasScrolledToBottom && !hasAgreed) {
      setHasAgreed(true);
      if (onAgree) {
        onAgree(type);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <div ref={contentRef} className="prose prose-sm max-w-none">
              {content}
            </div>

            {/* Scroll Indicator */}
            {!hasScrolledToBottom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 text-center"
              >
                <p className="text-sm text-gray-600 font-medium">
                  Please scroll to the bottom to continue
                </p>
                <div className="mt-2 flex justify-center">
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-[#0b6e4f]"
                  >
                    ↓
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer with Agreement Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {!hasScrolledToBottom ? (
                  <p className="text-sm text-gray-600">
                    Please read through the entire {isTerms ? "Terms of Service" : "Privacy Policy"} before agreeing.
                  </p>
                ) : (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <CheckCircle size={16} />
                    You've read the {isTerms ? "Terms of Service" : "Privacy Policy"}
                  </p>
                )}
              </div>
              <button
                onClick={handleAgree}
                disabled={!hasScrolledToBottom}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  hasScrolledToBottom
                    ? "bg-[#0b6e4f] hover:bg-[#095c42] text-white shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                I have read and agree
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
