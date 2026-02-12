/**
 * SA_RoleDelegation
 * 
 * Dedicated component for Super Admins to delegate admin roles to users.
 * - Lists eligible users (non-admin, non-super-admin roles)
 * - Quick delegation UI for promoting users to admin
 * - Integrates with assignRole service + notifications
 * - Accessible, animated, fully responsive, mobile-friendly
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  UserCheck,
  Users,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Home,
  Building,
  Wrench,
  Crown,
} from "lucide-react";
import { assignRole, fetchAllUsers } from "@/services/adminService";
import { createNotification } from "@/services/notificationService";
import { sendRolePromotionEmail } from "@/services/emailService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";

// Role badge helper moved to its own file for fast refresh compatibility
import RoleBadge from "./RoleBadge";

export default function SA_RoleDelegation({ onSuccess, className = "" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delegating, setDelegating] = useState({}); // { userId: true }
  const currentUser = useAuthStore((state) => state.user);

  // Filter eligible users
  const eligibleUsers = useMemo(() => {
    return users
      .filter((user) => {
        const role = user.role?.toLowerCase();
        if (role === "admin" || role === "super-admin") return false;

        const status = user.status?.toLowerCase();
        if (["suspended", "deleted", "inactive", "banned"].includes(status)) return false;
        if (user.deleted === true) return false;

        const matchesSearch =
          (user.fullName || user.name || user.full_name || "")
            .toLowerCase()
            .includes(search.toLowerCase().trim()) ||
          (user.email || "").toLowerCase().includes(search.toLowerCase().trim());

        return matchesSearch;
      })
      .sort((a, b) => {
        const nameA = (a.fullName || a.name || a.full_name || "").toLowerCase();
        const nameB = (b.fullName || b.name || b.full_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [users, search]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelegateAdmin = async (user) => {
    const userName = user.fullName || user.name || user.full_name || user.email || "this user";
    if (!confirm(`Promote ${userName} to Admin role?\n\nThey will gain access to user approvals, property moderation, and more.`)) {
      return;
    }

    const userId = user.id || user._id;
    setDelegating((prev) => ({ ...prev, [userId]: true }));

    try {
      await assignRole(userId, "admin");

      // Optimistic UI update
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === userId ? { ...u, role: "admin", status: "active" } : u
        )
      );

      toast.success(`${userName} promoted to Admin!`);

      // Notification (non-blocking)
      createNotification({
        type: "role_promoted",
        title: "You've Been Promoted to Admin!",
        message: `Congratulations! You are now an Admin, promoted by ${currentUser?.fullName || currentUser?.name || "a Super Admin"}. Access moderation tools now.`,
        actionUrl: "/admin/overview",
        metadata: {
          new_role: "admin",
          promoted_by: currentUser?.id,
          promoted_by_name: currentUser?.fullName || currentUser?.name,
        },
      }).catch(console.warn);

      // Email (non-blocking)
      sendRolePromotionEmail(user, {
        newRole: "admin",
        promotedBy: currentUser?.fullName || currentUser?.name || "Super Admin",
      }).catch(console.warn);

      onSuccess?.();
    } catch (err) {
      console.error("Role delegation failed:", err);
      toast.error(err.message || "Failed to promote user to Admin");
    } finally {
      setDelegating((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Delegate Admin Roles
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Promote trusted users to Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4" />
          <span>
            {eligibleUsers.length} eligible user{eligibleUsers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
          aria-label="Search eligible users"
        />
      </div>

      {/* Users List */}
      {eligibleUsers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {search.trim() ? "No matching users found" : "No eligible users to promote"}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto wrap-break-words">
            {search.trim()
              ? "Try a different search term or clear the filter"
              : "All current users are already admins, super admins, or ineligible (suspended/inactive)."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {eligibleUsers.map((user) => {
              const userId = user.id || user._id;
              const isDelegating = delegating[userId];
              const currentRole = user.role?.toLowerCase() || "unknown";
              const displayName = user.fullName || user.name || user.full_name || "Unknown User";
              const displayEmail = user.email || "No email provided";

              return (
                <motion.div
                  key={userId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 transition-all duration-200 overflow-hidden"
                  role="article"
                  aria-labelledby={`user-${userId}`}
                  tabIndex={0}
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar */}
                    <div className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4
                        id={`user-${userId}`}
                        className="font-semibold text-lg text-gray-900 dark:text-white truncate"
                      >
                        {displayName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate break-all">
                        {displayEmail}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Current role:</span>
                        <RoleBadge role={currentRole} />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 mt-3 sm:mt-0">
                      {isDelegating ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Promoting...</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleDelegateAdmin(user)}
                          variant="primary"
                          size="md"
                          disabled={isDelegating}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm min-w-[140px]"
                          aria-label={`Promote ${displayName} to Admin`}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Promote to Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-300">
            Important Notes on Admin Delegation
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1.5 wrap-break-word">
            Admins gain access to user management, property moderation, and platform oversight tools. 
            Only promote trusted individuals. All role changes are permanently logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}