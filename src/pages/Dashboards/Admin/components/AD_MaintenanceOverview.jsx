import React, { useEffect, useState } from "react";
import { fetchMaintenance, assignMaintenance } from "@/services/adminService";
import Button from "@/components/ui/Button";

/**
 * Maintenance overview for admins: lists pending requests and allow quick assignment.
 */
export default function AD_MaintenanceOverview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchMaintenance();
        if (mounted) setItems(res.data || res);
      } catch (err) {
        console.error("fetchMaintenance:", err);
        setError(err.message || "Failed to load maintenance");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleAssign = async (id) => {
    const assignedTo = window.prompt("Assign to user id:");
    if (!assignedTo) return;
    setAssigning(id);
    try {
      await assignMaintenance(id, assignedTo);
      setItems((s) => s.map((it) => (it.id === id ? { ...it, status: "assigned", assignedTo } : it)));
    } catch (err) {
      console.error("assignMaintenance:", err);
      setError(err.message || "Assign failed");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded shadow-sm">Loading maintenance requests…</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded">{error}</div>;
  if (!items.length) return <div className="p-6 bg-white rounded">No pending maintenance.</div>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Maintenance Requests</h3>
      <ul className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">{m.summary}</div>
              <div className="text-sm text-gray-600">Property: {m.propertyId} • Tenant: {m.tenantId}</div>
              <div className="text-xs text-gray-400">Created: {new Date(m.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-600">{m.status}</div>
              <Button variant="primary" onClick={() => handleAssign(m.id)} disabled={assigning === m.id}>
                {assigning === m.id ? "…" : "Assign"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
