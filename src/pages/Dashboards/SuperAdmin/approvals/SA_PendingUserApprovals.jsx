/**
 * SA_PendingUserApprovals - Super Admin Pending User Approvals Page
 * 
 * Dedicated full-page view for reviewing and approving/rejecting pending user registrations.
 * Provides comprehensive user management with document review, bulk actions, and filtering.
 * 
 * Features:
 * - List all pending users (landlords, artisans)
 * - View user details and uploaded documents
 * - Approve/reject users with reasons
 * - Bulk approval actions
 * - Filter by role and search
 * - Export pending users list
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingUsersSA, approveUserSA, rejectUserSA } from "@/services/adminService";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import { CheckCircle, XCircle, Filter, Download, CheckSquare, Square, Loader2, Eye, FileText, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import SA_ApproveUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_ApproveUserModal";
import SA_RejectUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_RejectUserModal";

export default function SA_PendingUserApprovals() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchPendingUsersSA();
        // Handle paginated response with 'results' array or direct array/object
        const userList = res.results || res.users || res.data || (Array.isArray(res) ? res : []);
        if (mounted) setUsers(Array.isArray(userList) ? userList : []);
      } catch (err) {
        console.error("fetchPendingUsers:", err);
        if (mounted) setError(err.message || "Failed to fetch pending users");
        toast.error("Failed to load pending users");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = (user) => {
    setApproveTarget(user);
  };

  const handleReject = (user) => {
    setRejectTarget(user);
  };

  const confirmApprove = async (notes = "") => {
    if (!approveTarget) return;
    const id = approveTarget.id;
    
    setActionLoading(id);
    try {
      // Backend may accept notes in request body
      await approveUserSA(id, notes ? { notes } : undefined);
      setUsers((s) => s.filter((u) => u.id !== id));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setApproveTarget(null);
    } catch (err) {
      console.error("approveUser:", err);
      throw err; // Let modal handle error display
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async (reason) => {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    
    setActionLoading(id);
    try {
      await rejectUserSA(id, reason);
      setUsers((s) => s.filter((u) => u.id !== id));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRejectTarget(null);
    } catch (err) {
      console.error("rejectUser:", err);
      throw err; // Let modal handle error display
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) return;
    const ids = Array.from(selectedUsers);
    setActionLoading("bulk");
    try {
      await Promise.all(ids.map((id) => approveUserSA(id)));
      setUsers((s) => s.filter((u) => !ids.includes(u.id)));
      setSelectedUsers(new Set());
      toast.success(`Approved ${ids.length} user(s) successfully!`);
    } catch (err) {
      console.error("bulkApprove:", err);
      toast.error(err.message || "Bulk approve failed");
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
      ["Name", "Email", "Role", "Submitted At", "Status"].join(","),
      ...filteredUsers.map((u) =>
        [
          u.fullName || u.name || "",
          u.email || "",
          u.role || "",
          new Date(u.submittedAt || u.createdAt || Date.now()).toISOString(),
          u.status || "pending",
        ].join(",")
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
    toast.success("Pending users exported successfully");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Pending User Approvals"
          subtitle={`${filteredUsers.length} user(s) awaiting approval`}
          badge="Super Admin"
          icon={<Users className="w-6 h-6" />}
        />

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Main Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Header with Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Users</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and approve new user registrations
                </p>
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
                  Export CSV
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="landlord">Landlords</option>
                  <option value="artisan">Artisans</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No pending users found</p>
              <p className="text-sm mt-2">All user registrations have been processed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Select All */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleSelect(u.id)}
                      className="shrink-0"
                      aria-label={`Select ${u.fullName || u.name}`}
                    >
                      {selectedUsers.has(u.id) ? (
                        <CheckSquare size={20} className="text-[#0b6e4f]" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {u.fullName || u.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{u.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium capitalize">
                          {u.role}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Submitted: {new Date(u.submittedAt || u.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                        {u.documents && Object.keys(u.documents).length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FileText size={12} />
                            {Object.keys(u.documents).length} document(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/super-admin/users/pending/${u.id}`)}
                        className="flex items-center gap-2"
                        title="View details and documents"
                      >
                        <Eye size={16} />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(u)}
                        disabled={actionLoading === u.id}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {actionLoading === u.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(u)}
                        disabled={actionLoading === u.id}
                        className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095c42]"
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
        </motion.section>
      </div>

      {/* Approve User Modal */}
      <SA_ApproveUserModal
        user={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={confirmApprove}
      />

      {/* Reject User Modal */}
      <SA_RejectUserModal
        user={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}
