/**
 * AdminAssignedRoles Page
 * 
 * Displays all users with their assigned roles and permissions.
 * Shows which roles were assigned by Super Admin and when.
 * 
 * Features:
 * - List all users with their roles
 * - Show permissions for admin roles
 * - Filter by role
 * - Search users
 * - View role assignment history
 */

import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/services/adminService";
import { useAuthStore } from "@/stores/authStore";
import { Users, Shield, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";

export default function AdminAssignedRoles() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchAllUsers();
        setUsers(data.users || []);
      } catch (err) {
        toast.error(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    tenant: users.filter((u) => u.role === "tenant").length,
    landlord: users.filter((u) => u.role === "landlord").length,
    artisan: users.filter((u) => u.role === "artisan").length,
    admin: users.filter((u) => u.role === "admin").length,
    "super-admin": users.filter((u) => u.role === "super-admin").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Roles"
        subtitle="View all users and their assigned roles with permissions"
        badge="Role Management"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(roleCounts).map(([role, count]) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role.replace("-", " ")}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <SectionCard title="Filters" description="Search and filter users by role">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      {/* Users Table */}
      <SectionCard title="Users" description={`${filteredUsers.length} user(s) found`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Permissions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0b6e4f] dark:bg-emerald-600 flex items-center justify-center text-white font-bold">
                          {(u.full_name || u.fullName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.full_name || u.fullName || "Unknown"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u.email || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === "super-admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                            : u.role === "admin"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : u.role === "landlord"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : u.role === "artisan"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        }`}
                      >
                        {u.role?.replace("-", " ") || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.permissions && Object.keys(u.permissions).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(u.permissions)
                            .filter(([_, value]) => value === true)
                            .slice(0, 3)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            ))}
                          {Object.values(u.permissions).filter((v) => v === true).length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              +{Object.values(u.permissions).filter((v) => v === true).length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No permissions</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.status === "active" || u.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : u.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {u.status || (u.is_active ? "active" : "inactive")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

