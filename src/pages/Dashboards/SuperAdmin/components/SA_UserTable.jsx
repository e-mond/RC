/**
 * SA_UserTable
 * - Full user management with search, role filter, bulk delete
 * - Ghana-ready: joined date in Africa/Accra
 * - Improved accessibility (ARIA, scope, caption)
 * - Prevent wrapping of critical columns (Role, Status, etc.)
 * - Subtle truncation + tooltips for long content
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiTrash2, FiDownload, FiSearch } from "react-icons/fi";
import { Ban, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import { RoleBadge, StatusBadge, TableSkeleton, EmptyState } from "./SA_UserTableHelpers";
import { v4 as uuidv4 } from "uuid";
import { formatDateGH } from "@/utils/format";
import SA_SuspendUserModal from "./SA_SuspendUserModal";

export default function SA_UserTable({ users = [], loading, onDelete, onRefresh }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.status === "deleted" || u.status === "inactive" || u.deleted === true) {
        return false;
      }
      const matchesSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const csvData = filteredUsers.map((u) => ({
    Name: u.fullName,
    Email: u.email,
    Role: u.role,
    Status: u.status,
    Joined: formatDateGH(u.joined) || "N/A",
  }));

  const handleBulkDelete = () => {
    if (selected.length === 0) return;
    selected.forEach((u) => onDelete(u));
    setSelected([]);
    setSelectAll(false);
    toast.success(`Deleted ${selected.length} user${selected.length > 1 ? "s" : ""}`);
  };

  const handleSuspend = (user) => {
    setSuspendTarget(user);
  };

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.some((s) => s._id === user._id || s.id === user.id)
        ? prev.filter((s) => s._id !== user._id && s.id !== user.id)
        : [...prev, user]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelected(selectAll ? [] : filteredUsers);
  };

  if (loading) return <TableSkeleton />;
  if (!users.length) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition"
              aria-label="Search users by name or email"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-[#0b6e4f] min-w-40"
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

        <div className="flex flex-wrap gap-2 self-end sm:self-auto">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition focus:ring-2 focus:ring-red-400 focus:outline-none"
              aria-label={`Delete selected ${selected.length} user${selected.length === 1 ? "" : "s"}`}
            >
              <FiTrash2 size={16} />
              Delete ({selected.length})
            </button>
          )}
          <CSVLink
            data={csvData}
            filename={`users_${new Date().toISOString().split("T")[0]}.csv`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition focus:ring-2 focus:ring-green-400 focus:outline-none"
            aria-label="Export filtered users to CSV file"
          >
            <FiDownload size={16} />
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <caption className="sr-only">List of platform users with roles, status, join date and management actions</caption>

          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[#0b6e4f] focus:ring-[#0b6e4f]"
                  aria-label="Select all visible users"
                />
              </th>
              <th scope="col" className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Name
              </th>
              <th scope="col" className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Role
              </th>
              <th scope="col" className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Joined
              </th>
              <th scope="col" className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <AnimatePresence>
              {filteredUsers.map((u) => {
                const uniqueKey = u._id || u.id || uuidv4();
                const isSelected = selected.some((s) => s._id === u._id || s.id === u.id);

                return (
                  <motion.tr
                    key={uniqueKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    } focus-within:bg-blue-50 dark:focus-within:bg-blue-900/30 outline-none`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(u)}
                        className="rounded border-gray-300 text-[#0b6e4f] focus:ring-[#0b6e4f]"
                      />
                    </td>
                    <td className="p-4 font-medium max-w-[180px] sm:max-w-[220px]">
                      <Link
                        to={`/super-admin/users/${u.id || u._id}`}
                        className="text-[#0b6e4f] hover:text-[#095c42] hover:underline transition truncate block"
                        title={u.fullName}
                      >
                        {u.fullName}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 max-w-[220px] sm:max-w-[280px]">
                      <Link
                        to={`/super-admin/users/${u.id || u._id}`}
                        className="hover:text-[#0b6e4f] hover:underline transition truncate block"
                        title={u.email}
                      >
                        {u.email}
                      </Link>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDateGH(u.joined) || "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/super-admin/users/${u.id || u._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                          aria-label={`View full details for ${u.fullName}`}
                          title="View user details"
                        >
                          <Eye size={18} />
                        </Link>

                        {u.status !== "suspended" && (
                          <button
                            onClick={() => handleSuspend(u)}
                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition focus:outline-none focus:ring-2 focus:ring-orange-500 rounded p-1"
                            aria-label={`Suspend user ${u.fullName}`}
                            title="Suspend user"
                          >
                            <Ban size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(u)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                          aria-label={`Permanently delete user ${u.fullName}`}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Suspend User Modal */}
      <SA_SuspendUserModal
        user={suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
          setSuspendTarget(null);
        }}
      />
    </motion.div>
  );
}