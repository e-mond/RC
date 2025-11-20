// src/pages/Dashboards/SuperAdmin/components/SA_UserTable.jsx
/**
 * SA_UserTable
 * - Full user management with search, role filter, bulk delete
 * - Ghana-ready: joined date in Africa/Accra
 * - 100% unique keys via UUID fallback
 * - CSV export, responsive, accessible
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiDownload, FiSearch } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import { RoleBadge, StatusBadge, TableSkeleton, EmptyState } from "./SA_UserTableHelpers";
import { v4 as uuidv4 } from "uuid";
import { formatDateGH } from "@/utils/format";

export default function SA_UserTable({ users = [], loading, onDelete }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
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
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
              aria-label="Search users"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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

        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
              aria-label={`Delete ${selected.length} users`}
            >
              <FiTrash2 size={16} />
              Delete ({selected.length})
            </button>
          )}
          <CSVLink
            data={csvData}
            filename={`users_${new Date().toISOString().split("T")[0]}.csv`}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
            aria-label="Export users to CSV"
          >
            <FiDownload size={16} />
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                  aria-label="Select all users"
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((u) => {
                const uniqueKey = u._id || u.id || uuidv4(); // 100% UNIQUE
                const isSelected = selected.some((s) => s._id === u._id || s.id === u.id);

                return (
                  <motion.tr
                    key={uniqueKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(u)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 font-medium">{u.fullName}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="p-3"><RoleBadge role={u.role} /></td>
                    <td className="p-3"><StatusBadge status={u.status} /></td>
                    <td className="p-3 text-sm text-gray-500">
                      {formatDateGH(u.joined) || "—"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDelete(u)}
                        className="text-red-600 hover:text-red-800 transition"
                        aria-label={`Delete ${u.fullName}`}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}