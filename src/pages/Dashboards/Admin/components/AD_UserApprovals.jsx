import React, { useEffect, useState } from "react";
import { fetchPendingUsers, approveUser, rejectUser } from "@/services/adminService";
import Button from "@/components/ui/Button";

/**
 * Lists pending user signup (landlords & artisans) for admin approval.
 * Supports approve + reject with optimistic UI.
 */
export default function AD_UserApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPendingUsers();
        setUsers(res.data || res);
      } catch (err) {
        console.error("fetchPendingUsers:", err);
        setError(err.message || "Failed to fetch pending users");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveUser(id);
      setUsers((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      console.error("approveUser:", err);
      setError(err.message || "Approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    setActionLoading(id);
    try {
      await rejectUser(id, reason);
      setUsers((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      console.error("rejectUser:", err);
      setError(err.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded shadow-sm">Loading pending users…</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded">{error}</div>;
  if (!users.length) return <div className="p-6 bg-white rounded">No pending users.</div>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Pending User Approvals</h3>
      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">{u.fullName}</div>
              <div className="text-sm text-gray-600">{u.email} • {u.role}</div>
              <div className="text-xs text-gray-400">Submitted: {new Date(u.submittedAt).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleReject(u.id)} disabled={actionLoading === u.id}>
                {actionLoading === u.id ? "..." : "Reject"}
              </Button>
              <Button variant="primary" onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}>
                {actionLoading === u.id ? "..." : "Approve"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
