// src/pages/Dashboards/SuperAdmin/components/SA_RoleTable.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiSearch, FiDownload, FiUserX } from "react-icons/fi";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";
import { RoleBadge, TableSkeleton, EmptyState } from "./SA_RoleTableHelpers";

export default function SA_RoleTable({ users = [], loading, onAssign }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState([]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const csvData = filteredUsers.map((u) => ({
    Name: u.name || u.fullName,
    Email: u.email,
    "Current Role": u.role,
  }));

  const handleBulkAssign = () => {
    if (selected.length === 0) return;
    toast.success(`Ready to assign role to ${selected.length} user${selected.length > 1 ? "s" : ""}`);
  };

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id || u._id === user._id)
        ? prev.filter((u) => u.id !== user.id && u._id !== user._id)
        : [...prev, user]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === filteredUsers.length ? [] : filteredUsers
    );
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
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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
              onClick={handleBulkAssign}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <FiShield size={16} />
              Assign ({selected.length})
            </button>
          )}
          <CSVLink
            data={csvData}
            filename={`roles_${new Date().toISOString().split("T")[0]}.csv`}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
          >
            <FiDownload size={16} />
            Export
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
                  checked={selected.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Current Role</th>
              <th className="p-3 text-right">Assign New Role</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((u) => {
                const isSelected = selected.some((s) => s.id === u.id || s._id === u._id);
                return (
                  <motion.tr
                    key={u.id || u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                    <td className="p-3 font-medium">{u.name || u.fullName}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="p-3"><RoleBadge role={u.role} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onAssign(u)}
                        className="inline-flex items-center gap-2 bg-[#0b6e4f] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#095c42] transition"
                      >
                        <FiShield size={16} />
                        Assign
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