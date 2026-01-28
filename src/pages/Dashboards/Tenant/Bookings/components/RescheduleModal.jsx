// src/pages/Dashboards/Tenant/Bookings/components/RescheduleModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * RescheduleModal - Modal for rescheduling a booking
 */
export default function RescheduleModal({ booking, onClose, onConfirm }) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newDate) {
      toast.error("Please select a new date");
      return;
    }

    // Validate date is in the future
    const selectedDate = new Date(newDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < todayDate) {
      toast.error("Please select a future date");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(booking.id, newDate, newTime || null, message || null);
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reschedule Booking</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Property Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Property</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {booking.propertyTitle || "Unknown Property"}
              </p>
            </div>

            {/* Current Date/Time */}
            {(booking.scheduled_date || booking.preferred_date) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Current Schedule</p>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(booking.scheduled_date || booking.preferred_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                </p>
              </div>
            )}

            {/* New Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                New Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select a future date for your viewing
              </p>
            </div>

            {/* New Time (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} className="inline mr-2" />
                Preferred Time <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Let the landlord know your preferred time
              </p>
            </div>

            {/* Message (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Message to Landlord <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Explain why you need to reschedule..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newDate}
                className="flex-1 px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  "Reschedule Booking"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
