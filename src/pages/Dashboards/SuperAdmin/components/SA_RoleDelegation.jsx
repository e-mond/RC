// src/pages/Dashboards/SuperAdmin/components/SA_RoleDelegation.jsx
/**
 * SA_RoleDelegation
 * 
 * Dedicated component for Super Admins to delegate admin roles to users.
 * - Lists eligible users (non-admin, non-super-admin roles)
 * - Quick delegation UI for promoting users to admin
 * - Integrates with assignRole service
 * - Accessible, animated, responsive
 * 
 * Used in: SuperAdminDashboard, SA_RolesPage, or dedicated delegation page
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, UserCheck, Users, Search, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { assignRole, fetchAllUsers } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { RoleBadge } from "./SA_AssignRoleModalHelpers";

export default function SA_RoleDelegation({ onSuccess, className = "" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delegating, setDelegating] = useState({}); // { userId: true }

  // Filter eligible users (can become admin)
  const eligibleUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const role = user.role?.toLowerCase();
      // Only show users who are not already admin or super-admin
      if (role === "admin" || role === "super-admin") return false;
      
      // Filter by search
      const matchesSearch =
        (user.fullName || user.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (user.email || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      
      return matchesSearch;
    });
    
    return filtered.sort((a, b) => {
      // Sort by name
      const nameA = (a.fullName || a.name || "").toLowerCase();
      const nameB = (b.fullName || b.name || "").toLowerCase();
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
    if (!confirm(`Promote ${user.fullName || user.name || user.email} to Admin role?`)) {
      return;
    }

    setDelegating((prev) => ({ ...prev, [user.id || user._id]: true }));

    try {
      await assignRole(user.id || user._id, "admin");
      toast.success(`${user.fullName || user.name || "User"} promoted to Admin! 🎉`);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === (user.id || user._id)
            ? { ...u, role: "admin" }
            : u
        )
      );
      
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delegate admin role:", err);
      toast.error(err.message || "Failed to promote user to Admin");
    } finally {
      setDelegating((prev) => {
        const next = { ...prev };
        delete next[user.id || user._id];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0b6e4f]" />
            Delegate Admin Roles
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Promote eligible users to Admin role
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{eligibleUsers.length} eligible user{eligibleUsers.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Eligible Users List */}
      {eligibleUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {search ? "No users found matching your search" : "No eligible users to promote"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {search
              ? "Try a different search term"
              : "All users are already admins or super admins"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {eligibleUsers.map((user) => {
              const userId = user.id || user._id;
              const isDelegating = delegating[userId];
              const currentRole = user.role?.toLowerCase() || "unknown";

              return (
                <motion.div
                  key={userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white font-semibold">
                      {(user.fullName || user.name || user.email)?.[0]?.toUpperCase() || "U"}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.fullName || user.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.email || "No email"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Current role:</span>
                        <RoleBadge
                          config={getRoleConfig(currentRole)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleDelegateAdmin(user)}
                      disabled={isDelegating}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isDelegating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Promoting...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Promote to Admin
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            About Admin Delegation
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Admins have access to user approvals, property moderation, and platform oversight.
            Only promote trusted users to this role. All role changes are logged in the audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get role badge config (icon, color, label) based on role
 */
function getRoleConfig(role) {
  const configs = {
    tenant: { icon: Home, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Tenant" },
    landlord: { icon: Building, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Landlord" },
    artisan: { icon: Wrench, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Artisan" },
    admin: { icon: Shield, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Admin" },
    "super-admin": { icon: Crown, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Super Admin" },
  };
  
  return configs[role] || { icon: Shield, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: role.charAt(0).toUpperCase() + role.slice(1) };
}

