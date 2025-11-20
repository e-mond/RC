import React, { useEffect, useState } from "react";
import { fetchReports } from "@/services/adminService";
import Button from "@/components/ui/Button";

/**
 * Reports panel — admin can filter by date range (simple).
 */
export default function AD_ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ start: "", end: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load(start, end) {
    setLoading(true);
    try {
      const res = await fetchReports(start || "", end || "");
      setReports(res.data || res);
    } catch (err) {
      console.error("fetchReports:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  const onFilter = () => {
    load(filter.start, filter.end);
  };

  if (loading) return <div className="p-6 bg-white rounded shadow-sm">Loading reports…</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded">{error}</div>;
  if (!reports.length) return <div className="p-6 bg-white rounded">No reports found.</div>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reports</h3>
        <div className="flex items-center gap-2">
          <input type="date" value={filter.start} onChange={(e) => setFilter({ ...filter, start: e.target.value })} className="p-2 border rounded" />
          <input type="date" value={filter.end} onChange={(e) => setFilter({ ...filter, end: e.target.value })} className="p-2 border rounded" />
          <Button variant="primary" onClick={onFilter}>Filter</Button>
        </div>
      </header>

      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="p-3 bg-gray-50 rounded">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{r.type.toUpperCase()}</div>
                <div className="text-sm text-gray-600">{r.summary}</div>
                <div className="text-xs text-gray-400">Reported: {new Date(r.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
