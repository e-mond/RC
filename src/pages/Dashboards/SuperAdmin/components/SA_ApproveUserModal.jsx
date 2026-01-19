/**
 * SA_ApproveUserModal - User Approval Modal
 * 
 * Proper modal component for approving users with:
 * - Optional notes field for audit trail
 * - Confirmation before action
 * - Loading states
 * - Error handling
 * - Success notifications
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function SA_ApproveUserModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  // Return nothing if no user is passed
  if (!user) return null;

  const userName = user.fullName || user.name || "this user";
  const userEmail = user.email || "";
  const userRole = user.role || "";

  const handleApprove = async () => {
    try {
      setLoading(true);
      await onConfirm(notes.trim());
      toast.success("User approved! Approval email has been sent to the user.");
      onClose?.();
    } catch (err) {
      console.error("Approve user error:", err);
      toast.error(err.message || "Failed to approve user");
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
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle size={22} />
                Approve User
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
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                Role: {userRole}
              </p>
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">Approval will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Activate the user's account</li>
                  <li>Send approval email notification</li>
                  <li>Allow user to log in and use the platform</li>
                  <li>Log action in audit trail</li>
                </ul>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText size={16} className="inline mr-1" />
                Approval Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., All documents verified, business registration confirmed, ready for activation..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Notes will be stored in the audit log for reference.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {loading ? "Approving..." : "Approve User"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
