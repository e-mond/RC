/**
 * SA_AssignRoleWithPermissionsModal
 * 
 * Enhanced role assignment modal with granular permissions selection.
 * When assigning admin role, Super Admin can select specific permissions.
 * 
 * Features:
 * - Role selection (tenant, landlord, artisan, admin, super-admin)
 * - Granular permissions (checkbox-based) for admin roles
 * - Permission descriptions
 * - Audit logging (all changes logged)
 * - Accessible, animated, responsive
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assignRoleWithPermissions } from "@/services/adminService";
import { Shield, Crown, Building, Home, Wrench, X, CheckSquare, Square, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { RoleBadge } from "./SA_AssignRoleModalHelpers";
import Button from "@/components/ui/Button";

const roles = [
  { key: "tenant", label: "Tenant", icon: Home, color: "bg-yellow-100 text-yellow-700" },
  { key: "landlord", label: "Landlord", icon: Building, color: "bg-green-100 text-green-700" },
  { key: "artisan", label: "Artisan", icon: Wrench, color: "bg-orange-100 text-orange-700" },
  { key: "admin", label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-700" },
  { key: "super-admin", label: "Super Admin", icon: Crown, color: "bg-purple-100 text-purple-700" },
];

/**
 * Available permissions for admin roles
 */
const ADMIN_PERMISSIONS = [
  {
    key: "canApproveUsers",
    label: "Approve Users",
    description: "Approve or reject new user registrations (landlords, artisans)",
  },
  {
    key: "canApproveListings",
    label: "Approve Property Listings",
    description: "Approve or reject property listings before they go live",
  },
  {
    key: "canModerateAds",
    label: "Moderate Ads",
    description: "Review, approve, or reject advertisement submissions",
  },
  {
    key: "canManageMaintenance",
    label: "Manage Maintenance",
    description: "Oversee maintenance requests and assign to artisans",
  },
  {
    key: "canViewReports",
    label: "View Reports",
    description: "Access system reports and analytics",
  },
  {
    key: "canMonitorPayments",
    label: "Monitor Payments",
    description: "View payment transactions and wallet activity",
  },
  {
    key: "canManageWallets",
    label: "Manage Wallets",
    description: "View and manage user wallet balances",
  },
  {
    key: "canViewInsights",
    label: "View System Insights",
    description: "Access platform-wide statistics and insights",
  },
];

/**
 * Default permissions for admin role
 */
const DEFAULT_ADMIN_PERMISSIONS = {
  canApproveUsers: true,
  canApproveListings: true,
  canModerateAds: false,
  canManageMaintenance: false,
  canViewReports: false,
  canMonitorPayments: false,
  canManageWallets: false,
  canViewInsights: false,
};

export default function SA_AssignRoleWithPermissionsModal({ user, onClose, onSuccess }) {
  const [role, setRole] = useState(user?.role || "tenant");
  const [permissions, setPermissions] = useState(
    user?.permissions || (user?.role === "admin" ? DEFAULT_ADMIN_PERMISSIONS : {})
  );
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const selectRef = useRef(null);

  // Reset permissions when role changes
  useEffect(() => {
    if (role === "admin") {
      // If user already has permissions, keep them; otherwise start with empty (Super Admin chooses)
      // Only use defaults if user is already an admin with existing permissions
      if (user?.role === "admin" && user?.permissions) {
        setPermissions(user.permissions);
      } else {
        // Start with empty permissions - Super Admin must explicitly choose
        setPermissions({});
      }
    } else if (role === "super-admin") {
      // Super Admin gets all permissions automatically
      setPermissions(
        ADMIN_PERMISSIONS.reduce((acc, perm) => {
          acc[perm.key] = true;
          return acc;
        }, {})
      );
    } else {
      // Other roles don't have admin permissions
      setPermissions({});
    }
  }, [role, user?.role, user?.permissions]);

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

  const handleTogglePermission = (permissionKey) => {
    if (role !== "admin") return; // Only allow permission changes for admin role
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  const handleAssign = async () => {
    // Validate: Admin role must have at least one permission
    if (role === "admin") {
      const hasAnyPermission = Object.values(permissions).some((p) => p === true);
      if (!hasAnyPermission) {
        toast.error("Please select at least one permission for the admin role");
        return;
      }
    }

    if (role === user.role && JSON.stringify(permissions) === JSON.stringify(user.permissions || {})) {
      toast.error("No changes to save");
      return;
    }

    try {
      setLoading(true);
      await assignRoleWithPermissions(user.id || user._id, role, permissions);
      toast.success(`Role and permissions updated successfully`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to assign role with permissions:", err);
      toast.error(err.message || "Failed to update role and permissions");
    } finally {
      setLoading(false);
    }
  };

  const currentRoleConfig = roles.find((r) => r.key === user.role) || roles[0];
  const newRoleConfig = roles.find((r) => r.key === role) || roles[0];
  const showPermissions = role === "admin" || role === "super-admin";

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="assign-role-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 id="assign-role-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                Assign Role & Permissions
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Updating role for:</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {user.fullName || user.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Current:</span>
                  <RoleBadge config={currentRoleConfig} />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Role
                </label>
                <select
                  id="role-select"
                  ref={selectRef}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
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
              </div>

              {/* Permissions Section (Admin/Super Admin only) */}
              {showPermissions && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[#0b6e4f]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Granular Permissions
                    </h3>
                  </div>

                  {role === "super-admin" ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                            Super Admin Role
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            Super Admins automatically have all permissions. No granular control needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              Select Permissions
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                              Choose which permissions this admin will have. You can select any combination of permissions below. All changes are logged in the audit trail.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {ADMIN_PERMISSIONS.map((permission) => {
                          const isChecked = permissions[permission.key] || false;
                          const Icon = isChecked ? CheckSquare : Square;

                          return (
                            <motion.div
                              key={permission.key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(permission.key)}
                                className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] rounded"
                                aria-label={`Toggle ${permission.label}`}
                              >
                                <Icon
                                  className={`w-5 h-5 ${
                                    isChecked
                                      ? "text-[#0b6e4f]"
                                      : "text-gray-400 dark:text-gray-500"
                                  }`}
                                />
                              </button>
                              <div className="flex-1">
                                <label
                                  htmlFor={`perm-${permission.key}`}
                                  onClick={() => handleTogglePermission(permission.key)}
                                  className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                                >
                                  {permission.label}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Permission Summary */}
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selected Permissions ({ADMIN_PERMISSIONS.filter((p) => permissions[p.key]).length} of {ADMIN_PERMISSIONS.length}):
                          </p>
                          {ADMIN_PERMISSIONS.filter((p) => permissions[p.key]).length === 0 && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              ⚠️ At least one permission required
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ADMIN_PERMISSIONS.filter((p) => permissions[p.key]).length > 0 ? (
                            ADMIN_PERMISSIONS.filter((p) => permissions[p.key]).map((p) => (
                              <span
                                key={p.key}
                                className="px-3 py-1.5 text-xs font-medium bg-[#0b6e4f] text-white rounded-full flex items-center gap-1"
                              >
                                <CheckSquare className="w-3 h-3" />
                                {p.label}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                              No permissions selected - please select at least one permission
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Audit Trail
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    All role and permission changes are automatically logged in the audit trail for security and compliance.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={
                  loading ||
                  (role === user.role &&
                    JSON.stringify(permissions) === JSON.stringify(user.permissions || {})) ||
                  (role === "admin" && !Object.values(permissions).some((p) => p === true))
                }
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Role & Permissions"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

