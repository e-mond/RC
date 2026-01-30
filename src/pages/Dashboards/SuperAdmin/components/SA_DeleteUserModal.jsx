import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteUser } from "@/services/adminService";
import { X, Trash2, AlertTriangle, CheckSquare, Square } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";

/**
 * SA_DeleteUserModal
 * - Proper confirmation modal for deleting a user
 * - Options for soft delete, property deletion, and data retention
 * - Safe delete with loading state and error handling
 */
export default function SA_DeleteUserModal({ user, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    reason: "",
    deleteProperties: false,
    hardDelete: true, // Hard delete by default - permanently remove from DB
  });
  const [confirmText, setConfirmText] = useState("");
  const [errors, setErrors] = useState({});

  // If 'open' prop is provided, respect it; otherwise show when user exists (backward compatibility)
  const shouldShow = open !== undefined ? (user && open) : !!user;

  // Reset state when modal closes - hooks must be called unconditionally
  useEffect(() => {
    if (!shouldShow) {
      setConfirmText("");
      setDeleteOptions({
        reason: "",
        deleteProperties: false,
        hardDelete: true, // Hard delete by default
      });
      setErrors({});
    }
  }, [shouldShow]);

  // Return nothing if no user is passed - but only after all hooks are called
  if (!shouldShow) return null;

  const userId = user.id || user._id;
  const userName = user.fullName || user.name || "this user";

  const validate = () => {
    const newErrors = {};
    if (confirmText !== userName && confirmText !== user.email) {
      newErrors.confirmText = `Please type "${userName}" or "${user.email}" to confirm`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!validate()) {
      toast.error("Please confirm by typing the user's name or email");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        reason: deleteOptions.reason || "Account deletion requested",
        delete_properties: deleteOptions.deleteProperties,
        delete_data: deleteOptions.hardDelete,
      };

      // Backend expects userId in URL, options in request body
      await deleteUser(userId, payload);
      toast.success("User deleted successfully");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
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
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={22} />
                Confirm User Deletion
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
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                Role: {user.role}
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium">This action will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove user access permanently</li>
                  <li>Revoke all active sessions</li>
                  <li>Send notification email to user</li>
                  {deleteOptions.deleteProperties && <li>Delete all user's properties</li>}
                  {deleteOptions.hardDelete && <li>Permanently delete all user data (cannot be recovered)</li>}
                  {!deleteOptions.hardDelete && <li>Soft delete user (marks as inactive, can be restored)</li>}
                  {deleteOptions.hardDelete && <li className="font-semibold text-red-600 dark:text-red-400">Permanently delete user from database (cannot be recovered)</li>}
                </ul>
              </div>
            </div>

            {/* Delete Options */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Deletion (optional)
                </label>
                <textarea
                  value={deleteOptions.reason}
                  onChange={(e) =>
                    setDeleteOptions((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g., Account closure requested by user, Terms violation..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteOptions((prev) => ({ ...prev, deleteProperties: !prev.deleteProperties }))
                  }
                  className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                >
                  {deleteOptions.deleteProperties ? (
                    <CheckSquare size={20} className="text-red-600" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delete User's Properties</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Also delete all properties owned by this user
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteOptions((prev) => ({ ...prev, hardDelete: !prev.hardDelete }))
                  }
                  className="w-full flex items-center gap-3 p-3 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                >
                  {deleteOptions.hardDelete ? (
                    <CheckSquare size={20} className="text-red-600" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">Hard Delete (Permanent)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Permanently delete all data. Cannot be recovered. Default is soft delete.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <strong>"{userName}"</strong> or <strong>"{user.email}"</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  if (errors.confirmText) {
                    setErrors((prev) => ({ ...prev, confirmText: null }));
                  }
                }}
                placeholder="Enter user name or email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
              />
              {errors.confirmText && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.confirmText}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={loading || !confirmText}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <Trash2 size={16} />
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
