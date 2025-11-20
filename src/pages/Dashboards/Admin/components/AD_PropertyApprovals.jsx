import React, { useEffect, useState } from "react";
import { fetchPendingProperties, approveProperty, rejectProperty } from "@/services/adminService";
import Button from "@/components/ui/Button";

/**
 * Admin property approvals widget.
 * Shows pending properties and allows approve/reject.
 */
export default function AD_PropertyApprovals() {
  const [propsList, setPropsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchPendingProperties();
        if (mounted) setPropsList(res.data || res);
      } catch (err) {
        console.error("fetchPendingProperties:", err);
        setError(err.message || "Failed to load pending properties");
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
      await approveProperty(id);
      setPropsList((s) => s.filter((p) => p.id !== id));
    } catch (err) {
      console.error("approveProperty:", err);
      setError(err.message || "Approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    setActionLoading(id);
    try {
      await rejectProperty(id, reason);
      setPropsList((s) => s.filter((p) => p.id !== id));
    } catch (err) {
      console.error("rejectProperty:", err);
      setError(err.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded shadow-sm">Loading pending properties…</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded">{error}</div>;
  if (!propsList.length) return <div className="p-6 bg-white rounded">No pending properties.</div>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Pending Property Approvals</h3>
      <div className="space-y-3">
        {propsList.map((p) => (
          <article key={p.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded">
            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
              {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">{p.address}</div>
              <div className="text-xs text-gray-400">Submitted: {new Date(p.submittedAt).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => handleReject(p.id)} disabled={actionLoading === p.id}>
                {actionLoading === p.id ? "..." : "Reject"}
              </Button>
              <Button variant="primary" onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}>
                {actionLoading === p.id ? "..." : "Approve"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
