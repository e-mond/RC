/**
 * AdminAssignedRoles (now used under Super Admin)
 * 
 * Displays all users with their assigned roles and permissions.
 * Shows role assignment details (assigned by whom, when).
 * 
 * Features: Responsive cards, full accessibility, modern UI, mobile-friendly
 */

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Search,
  Filter,
  Loader2,           // ← FIXED: added missing import
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import { fetchAllUsers } from "@/services/adminService";

export default function AdminAssignedRoles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchAllUsers();
        setUsers(data.users || data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
        toast.error("Failed to load user roles");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Memoized filtered & searched users
  const filteredUsers = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return users.filter((u) => {
      const name = (u.full_name || u.fullName || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Role counts for stats cards
  const roleCounts = useMemo(() => ({
    tenant: users.filter((u) => u.role === "tenant").length,
    landlord: users.filter((u) => u.role === "landlord").length,
    artisan: users.filter((u) => u.role === "artisan").length,
    admin: users.filter((u) => u.role === "admin").length,
    "super-admin": users.filter((u) => u.role === "super-admin").length,
  }), [users]);

  // Role badge styling helper
  const getRoleBadge = (role) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize";
    const variants = {
      "super-admin": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      admin: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      landlord: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      artisan: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      tenant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
    return (
      <span className={`${base} ${variants[role] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
        {role.replace("-", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header */}
        <PageHeader
          title="Assigned Roles"
          subtitle="View all users, their roles, permissions and assignment history"
          badge="Role Management"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(roleCounts).map(([role, count]) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * Object.keys(roleCounts).indexOf(role) }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              role="status"
              aria-live="polite"
            >
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 capitalize">
                {role.replace("-", " ")}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {count}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <SectionCard title="Filters" className="bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                aria-label="Search users by name or email"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <Filter className="w-5 h-5 text-gray-400" aria-hidden="true" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                aria-label="Filter users by role"
              >
                <option value="">All Roles</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="artisan">Artisan</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Users List */}
        <SectionCard
          title={`Users (${filteredUsers.length})`}
          description="Browse assigned roles and permissions"
          className="bg-white dark:bg-gray-800"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-600" />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="mt-2">Try changing your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((u, index) => (
                <motion.article
                  key={u.id || u._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 transition-all duration-200"
                  role="region"
                  aria-labelledby={`user-title-${u.id || index}`}
                  tabIndex={0}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {(u.full_name || u.name || "U").charAt(0).toUpperCase()}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <h3
                        id={`user-title-${u.id || index}`}
                        className="font-semibold text-lg text-gray-900 dark:text-white truncate"
                      >
                        {u.full_name || u.name || "Unknown User"}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {u.email || "No email provided"}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {getRoleBadge(u.role)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.status === "active" || u.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {u.status || (u.is_active ? "Active" : "Inactive")}
                        </span>
                      </div>

                      {/* Permissions Preview */}
                      {u.permissions && Object.keys(u.permissions).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                            Key Permissions:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(u.permissions)
                              .filter(([, value]) => value === true)
                              .slice(0, 4)
                              .map(([key]) => (
                                <span
                                  key={key}
                                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                >
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                              ))}
                            {Object.values(u.permissions).filter(Boolean).length > 4 && (
                              <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                +{Object.values(u.permissions).filter(Boolean).length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}