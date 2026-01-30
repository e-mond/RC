/**
 * SA_RejectUserModal - User Rejection Modal
 * 
 * Proper modal component for rejecting users with:
 * - Required reason field with validation
 * - Confirmation before action
 * - Loading states
 * - Error handling
 * - Success notifications
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, XCircle, AlertTriangle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function SA_RejectUserModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  // Return nothing if no user is passed
  if (!user) return null;

  const userName = user.fullName || user.name || "this user";
  const userEmail = user.email || "";
  const userRole = user.role || "";

  const validate = () => {
    const newErrors = {};
    if (!reason.trim()) {
      newErrors.reason = "Rejection reason is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReject = async () => {
    if (!validate()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      await onConfirm(reason.trim());
      toast.success("User rejected! Rejection email has been sent to the user.");
      onClose?.();
    } catch (err) {
      console.error("Reject user error:", err);
      toast.error(err.message || "Failed to reject user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle size={22} />
                Reject User
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* User Info */}
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                Role: {userRole}
              </p>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium">Rejection will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Set user status to "rejected"</li>
                  <li>Send rejection email with reason to user</li>
                  <li>Prevent user from logging in</li>
                  <li>Log action in audit trail</li>
                  <li>User can resubmit after addressing issues</li>
                </ul>
              </div>
            </div>

            {/* Required Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText size={16} className="inline mr-1" />
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors((prev) => ({ ...prev, reason: null }));
                  }
                }}
                placeholder="e.g., Incomplete documentation. Missing business registration certificate. Please resubmit with all required documents..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white resize-none"
                required
              />
              {errors.reason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.reason}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This reason will be included in the rejection email sent to the user.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <XCircle size={16} />
              {loading ? "Rejecting..." : "Reject User"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
