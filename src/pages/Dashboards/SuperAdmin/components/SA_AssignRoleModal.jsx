// src/pages/Dashboards/SuperAdmin/components/SA_AssignRoleModal.jsx
/**
 * SA_AssignRoleModal
 * - Role assignment with live preview
 * - Ghana-ready, accessible, animated
 * - Escape key, focus trap, loading state
 * - Zero warnings, crash-proof
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assignRole } from "@/services/adminService";
import { Shield, Crown, Building, Home, Wrench, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { RoleBadge } from "./SA_AssignRoleModalHelpers";

const roles = [
  { key: "tenant", label: "Tenant", icon: Home, color: "bg-yellow-100 text-yellow-700" },
  { key: "landlord", label: "Landlord", icon: Building, color: "bg-green-100 text-green-700" },
  { key: "artisan", label: "Artisan", icon: Wrench, color: "bg-orange-100 text-orange-700" },
  { key: "admin", label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-700" },
  { key: "super-admin", label: "Super Admin", icon: Crown, color: "bg-purple-100 text-purple-700" },
];

export default function SA_AssignRoleModal({ user, onClose, onSuccess }) {
  const [role, setRole] = useState(user?.role || "tenant");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const selectRef = useRef(null);

  // Focus select on open
  useEffect(() => {
    if (user && selectRef.current) {
      selectRef.current.focus();
    }
  }, [user]);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    const handleTab = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  if (!user) return null;

  const handleAssign = async () => {
    if (role === user.role) {
      toast.error("Role is unchanged");
      return;
    }

    try {
      setLoading(true);
      await assignRole(user._id, role);
      toast.success(`Role updated to ${role}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const currentRoleConfig = roles.find(r => r.key === user.role) || roles[0];
  const newRoleConfig = roles.find(r => r.key === role) || roles[0];

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="assign-role-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 id="assign-role-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Assign Role
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* User Info */}
            <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Updating role for:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current:</span>
                <RoleBadge config={currentRoleConfig} />
              </div>
            </div>

            {/* Role Select */}
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Role
            </label>
            <select
              id="role-select"
              ref={selectRef}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600 transition"
              aria-label="Select new role"
            >
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Preview */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Will become:</span>
              <RoleBadge config={newRoleConfig} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading || role === user.role}
                className="px-5 py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update Role"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}