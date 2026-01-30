// src/pages/Dashboards/Tenant/Bookings/components/CancelModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * CancelModal - Confirmation modal for cancelling a booking
 */
export default function CancelModal({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Confirm cancellation
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(booking.id, reason || null);
      onClose();
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-800"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Cancel Booking
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Warning:</strong> Cancelling this booking will notify the landlord. This action cannot be undone.
              </p>
            </div>

            {/* Property Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Property</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {booking.propertyTitle || "Unknown Property"}
              </p>
              {(booking.scheduled_date || booking.preferred_date) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Scheduled: {new Date(booking.scheduled_date || booking.preferred_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Reason (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Cancellation Reason <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Let the landlord know why you're cancelling..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Providing a reason helps landlords understand and improve their service
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Booking"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
