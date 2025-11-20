import React from "react";
import { motion } from "framer-motion";
import { deleteUser } from "@/services/adminService";
import { X, Trash2, AlertTriangle } from "lucide-react";

/**
 * SA_DeleteUserModal
 * - Confirmation modal for deleting a user
 * - Safe delete with loading state
 */
export default function SA_DeleteUserModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = React.useState(false);

  // Return nothing if no user is passed
  if (!user) return null;

  // Confirm delete handler
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(user._id);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle size={22} />
              Confirm Delete
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete:
          </p>
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
              Role: {user.role}
            </p>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-3">
            This action <strong>cannot be undone</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={loading}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70 transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
