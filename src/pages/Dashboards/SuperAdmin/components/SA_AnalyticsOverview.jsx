import React from "react";

/**
 * Small analytics overview component
 * Replace with charts (Recharts) for more advanced visuals
 */
export default function SA_AnalyticsOverview({ loading, summary }) {
  if (loading) return <div className="bg-white p-4 rounded shadow">Loading summary…</div>;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Total Users</div>
        <div className="text-2xl font-semibold">{summary?.totalUsers ?? 0}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Active Listings</div>
        <div className="text-2xl font-semibold">{summary?.activeListings ?? 0}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Open Support</div>
        <div className="text-2xl font-semibold">{summary?.openSupport ?? 0}</div>
      </div>
    </section>
  );
}
