/**
 * SA_SuspendUserModal - User Suspension Modal
 * 
 * Proper modal component for suspending users with:
 * - Reason input (required)
 * - Duration selection (temporary or permanent)
 * - Confirmation before action
 * - Loading states
 * - Error handling
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { suspendUser } from "@/services/adminService";
import { createNotification } from "@/services/notificationService";
import { sendAccountSuspensionEmail } from "@/services/emailService";
import { useAuthStore } from "@/stores/authStore";
import { X, Ban, AlertTriangle, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function SA_SuspendUserModal({ user, open, onClose, onSuccess, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [suspensionType, setSuspensionType] = useState("permanent"); // "permanent" or "temporary"
  const [durationDays, setDurationDays] = useState(30);
  const [errors, setErrors] = useState({});
  
  // Get current admin user for attribution
  const currentUser = useAuthStore((state) => state.user);

  // If 'open' prop is provided, respect it; otherwise show when user exists (backward compatibility)
  const shouldShow = open !== undefined ? (user && open) : !!user;

  // Reset state when modal closes - hooks must be called unconditionally
  useEffect(() => {
    if (!shouldShow) {
      setReason("");
      setSuspensionType("permanent");
      setDurationDays(30);
      setErrors({});
    }
  }, [shouldShow]);

  // Return nothing if no user is passed - but only after all hooks are called
  if (!shouldShow) return null;

  const validate = () => {
    const newErrors = {};
    if (!reason.trim()) {
      newErrors.reason = "Suspension reason is required";
    }
    if (suspensionType === "temporary" && (!durationDays || durationDays < 1)) {
      newErrors.duration = "Duration must be at least 1 day";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuspend = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const suspensionData = {
        reason: reason.trim(),
        duration_days: suspensionType === "temporary" ? durationDays : null,
      };

      // Use onConfirm if provided (for UserApprovalDetailPage), otherwise use suspendUser directly
      if (onConfirm) {
        await onConfirm(suspensionData);
      } else {
        const { suspendUserSA } = await import("@/services/adminService");
        await suspendUserSA(user.id || user._id, suspensionData);
      }
      
      // Create in-system notification for the suspended user (non-blocking)
      try {
        await createNotification({
          type: "account_suspended",
          title: "Account Suspended",
          message: suspensionType === "permanent"
            ? `Your account has been suspended by ${currentUser?.fullName || currentUser?.name || "an administrator"}.\n\nReason: ${reason.trim()}\n\nIf you believe this is an error, please contact support.`
            : `Your account has been suspended for ${durationDays} days by ${currentUser?.fullName || currentUser?.name || "an administrator"}.\n\nReason: ${reason.trim()}\n\nYour account will be automatically restored after the suspension period.`,
          actionUrl: "/support",
          metadata: {
            suspended_by: currentUser?.id,
            suspended_by_name: currentUser?.fullName || currentUser?.name,
            reason: reason.trim(),
            suspension_type: suspensionType,
            duration_days: suspensionType === "temporary" ? durationDays : null,
            suspended_at: new Date().toISOString(),
          },
        });
      } catch (notifErr) {
        console.warn("Failed to create suspension notification:", notifErr);
        // Non-blocking - don't fail the whole operation
      }
      
      // Send suspension email (non-blocking, as fallback if backend doesn't send it)
      sendAccountSuspensionEmail(user, reason.trim()).catch((emailErr) => {
        console.warn("Failed to send suspension email:", emailErr);
        // Non-blocking - backend should also send this email
      });
      
      toast.success(
        suspensionType === "permanent"
          ? "User suspended permanently. Notifications have been sent."
          : `User suspended for ${durationDays} days. Notifications have been sent.`
      );
      
      if (onConfirm) {
        onClose?.();
      } else {
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      console.error("Suspend user error:", err);
      toast.error(err.message || "Failed to suspend user");
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
              <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <Ban size={22} />
                Suspend User
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
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white">{user.fullName || user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                Role: {user.role}
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium">Suspension will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Revoke user's active sessions</li>
                  <li>Prevent user from logging in</li>
                  <li>Send notification email to user</li>
                  {suspensionType === "temporary" && (
                    <li>Automatically restore access after {durationDays} days</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Suspension Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suspension Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSuspensionType("permanent")}
                  className={`flex-1 p-3 rounded-lg border-2 transition ${
                    suspensionType === "permanent"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ban size={18} />
                    <span className="font-medium">Permanent</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Until manually restored
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSuspensionType("temporary")}
                  className={`flex-1 p-3 rounded-lg border-2 transition ${
                    suspensionType === "temporary"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span className="font-medium">Temporary</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For a specific duration
                  </p>
                </button>
              </div>
            </div>

            {/* Duration (if temporary) */}
            {suspensionType === "temporary" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days)
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                {errors.duration && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.duration}</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Suspension <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors((prev) => ({ ...prev, reason: null }));
                  }
                }}
                placeholder="e.g., Violation of terms of service, Multiple complaints received..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white resize-none"
                required
              />
              {errors.reason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.reason}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This reason will be included in the suspension email sent to the user.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Ban size={16} />
              {loading ? "Suspending..." : "Suspend User"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
