import React, { useEffect, useState } from "react";
import { fetchPendingUsers, approveUser, rejectUser } from "@/services/adminService";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Filter, Download, CheckSquare, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Enhanced User Approvals with bulk actions and filtering
 */
export default function AD_UserApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPendingUsers();
        const userList = res.users || res.data || res || [];
        if (mounted) setUsers(Array.isArray(userList) ? userList : []);
      } catch (err) {
        console.error("fetchPendingUsers:", err);
        if (mounted) setError(err.message || "Failed to fetch pending users");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveUser(id);
      setUsers((s) => s.filter((u) => u.id !== id));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("approveUser:", err);
      setError(err.message || "Approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return; // User cancelled
    setActionLoading(id);
    try {
      await rejectUser(id, reason);
      setUsers((s) => s.filter((u) => u.id !== id));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("rejectUser:", err);
      setError(err.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) return;
    const ids = Array.from(selectedUsers);
    setActionLoading("bulk");
    try {
      await Promise.all(ids.map((id) => approveUser(id)));
      setUsers((s) => s.filter((u) => !ids.includes(u.id)));
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("bulkApprove:", err);
      setError(err.message || "Bulk approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Role", "Submitted At"].join(","),
      ...filteredUsers.map((u) =>
        [u.fullName || u.name, u.email, u.role, new Date(u.submittedAt || u.createdAt).toISOString()].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pending-users-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role?.toLowerCase() === filterRole.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending User Approvals</h3>
            <p className="text-sm text-gray-600 mt-1">{filteredUsers.length} user(s) pending approval</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedUsers.size > 0 && (
              <Button
                onClick={handleBulkApprove}
                disabled={actionLoading === "bulk"}
                className="flex items-center gap-2"
              >
                {actionLoading === "bulk" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approve Selected ({selectedUsers.size})
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            >
              <option value="all">All Roles</option>
              <option value="landlord">Landlords</option>
              <option value="artisan">Artisans</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p>No pending users found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {/* Select All */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {selectedUsers.size === filteredUsers.length ? (
                <CheckSquare size={18} className="text-[#0b6e4f]" />
              ) : (
                <Square size={18} />
              )}
              <span>Select All</span>
            </button>
          </div>

          {/* User Items */}
          {filteredUsers.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleSelect(u.id)}
                  className="shrink-0"
                >
                  {selectedUsers.has(u.id) ? (
                    <CheckSquare size={20} className="text-[#0b6e4f]" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{u.fullName || u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                      {u.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Submitted: {new Date(u.submittedAt || u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    {actionLoading === u.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2"
                  >
                    {actionLoading === u.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
