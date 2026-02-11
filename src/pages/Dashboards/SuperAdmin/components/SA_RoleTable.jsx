// src/pages/Dashboards/SuperAdmin/components/SA_RoleTable.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiSearch, FiDownload, FiUserCheck } from "react-icons/fi";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { RoleBadge, TableSkeleton, EmptyState } from "./SA_RoleTableHelpers";

export default function SA_RoleTable({ users = [], loading, onAssign }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState([]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || u.fullName || "").toLowerCase().includes(search.toLowerCase().trim()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase().trim());
      const matchesRole = !roleFilter || u.role?.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const csvData = filteredUsers.map((u) => ({
    Name: u.name || u.fullName || "Unknown",
    Email: u.email || "No email",
    "Current Role": u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "None",
  }));

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.some((s) => (s.id || s._id) === (user.id || user._id))
        ? prev.filter((s) => (s.id || s._id) !== (user.id || user._id))
        : [...prev, user]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === filteredUsers.length ? [] : [...filteredUsers]
    );
  };

  const handleBulkAssign = () => {
    if (selected.length === 0) return;
    toast.success(`Bulk assign ready for ${selected.length} user${selected.length > 1 ? "s" : ""}`);
  };

  if (loading) return <TableSkeleton />;
  if (!users.length) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              aria-label="Search users"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="artisan">Artisan</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          {selected.length > 0 && (
            <Button
              variant="primary"
              size="xs"           // ← smaller button
              onClick={handleBulkAssign}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3 py-1.5 text-sm"
            >
              <FiUserCheck className="w-3.5 h-3.5 mr-1.5" />
              Assign ({selected.length})
            </Button>
          )}

          <CSVLink
            data={csvData}
            filename={`roles_export_${new Date().toISOString().split("T")[0]}.csv`}
            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition text-sm"
          >
            <FiDownload className="w-3.5 h-3.5 mr-1.5" />
            Export
          </CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-3.5 text-left w-12">
                <input
                  type="checkbox"
                  checked={selected.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  aria-label="Select all users"
                />
              </th>
              <th className="p-3.5 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">User</th>
              <th className="p-3.5 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Email</th>
              <th className="p-3.5 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Current Role</th>
              <th className="p-3.5 text-right font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredUsers.map((u) => {
                const isSelected = selected.some((s) => (s.id || s._id) === (u.id || u._id));
                const displayName = u.name || u.fullName || "Unknown User";
                const displayEmail = u.email || "No email";

                return (
                  <motion.tr
                    key={u.id || u._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      isSelected ? "bg-emerald-50 dark:bg-emerald-950/20" : ""
                    }`}
                  >
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(u)}
                        className="rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                        aria-label={`Select ${displayName}`}
                      />
                    </td>
                    <td className="p-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap truncate max-w-[180px]">
                      {displayName}
                    </td>
                    <td className="p-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap truncate max-w-[220px]">
                      {displayEmail}
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="primary"
                        size="xs"                    // ← smaller button size
                        onClick={() => onAssign(u)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-3 py-1.5 text-sm min-w-[110px]"
                        aria-label={`Assign new role to ${displayName}`}
                      >
                        <FiShield className="w-3.5 h-3.5 mr-1.5" />
                        Assign Role
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      {filteredUsers.length > 0 && (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          Showing {filteredUsers.length} of {users.length} users
          {search || roleFilter ? " (filtered)" : ""}
        </div>
      )}
    </motion.div>
  );
}