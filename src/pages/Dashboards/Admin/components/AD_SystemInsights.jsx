import React, { useEffect, useState } from "react";
import { fetchInsights } from "@/services/adminService";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard"; // ← Import

/**
 * System Insights widget: shows quick numbers and recent stats.
 * Permission-aware (the dashboard should hide this if the admin lacks permission).
 */
export default function AD_SystemInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchInsights();
        if (!mounted) return;
        setInsights(res.data || res);
      } catch (err) {
        console.error("fetchInsights:", err);
        setError(err.message || "Unable to load insights");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm">Loading insights…</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <header className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">System Insights</h3>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <StatCard label="Total Users" value={insights.usersCount} />
        <StatCard label="Properties" value={insights.propertiesCount} />
        <StatCard label="Pending Users" value={insights.pendingUsers} />
        <StatCard label="Pending Properties" value={insights.pendingProperties} />
      </div>

      <div className="mt-4 flex gap-4">
        <small className="text-sm text-gray-600">
          Revenue (30d): ₵{Number(insights.revenueLast30d).toLocaleString()}
        </small>
        <small className="text-sm text-gray-600">
          Repairs pending: {insights.repairsPending}
        </small>
      </div>
    </section>
  );
}