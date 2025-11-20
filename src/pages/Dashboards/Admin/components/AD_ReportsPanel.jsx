import React, { useEffect, useState, useCallback } from "react";
import { fetchReports } from "@/services/adminService";
import Button from "@/components/ui/Button";
import { Download, Filter, Calendar, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/**
 * Enhanced Reports Panel with charts and export
 */
export default function AD_ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ start: "", end: "", type: "all" });
  const [error, setError] = useState("");

  const load = useCallback(async (start, end, type) => {
    setLoading(true);
    try {
      const res = await fetchReports(start || filter.start, end || filter.end);
      const reportList = res.data || res || [];
      let filtered = Array.isArray(reportList) ? reportList : [];
      
      // Filter by type if specified
      if (type && type !== "all") {
        filtered = filtered.filter((r) => r.type?.toLowerCase() === type.toLowerCase());
      } else if (filter.type && filter.type !== "all") {
        filtered = filtered.filter((r) => r.type?.toLowerCase() === filter.type.toLowerCase());
      }

      setReports(filtered);
    } catch (err) {
      console.error("fetchReports:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter.end, filter.start, filter.type]);

  useEffect(() => {
    load();
  }, [load]);

  const onFilter = () => {
    load(filter.start, filter.end, filter.type);
  };

  const handleExport = () => {
    const csv = [
      ["Type", "Summary", "Created At"].join(","),
      ...reports.map((r) =>
        [r.type || "unknown", r.summary || "", new Date(r.createdAt).toISOString()].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Prepare chart data
  const chartData = reports.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count += 1;
    return acc;
  }, {});

  const chartDataArray = Object.values(chartData).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm flex items-center justify-center min-h-[300px]">
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
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} />
            System Reports
          </h3>
          <p className="text-sm text-gray-600 mt-1">{reports.length} report(s) found</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </header>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <input
              type="date"
              value={filter.start}
              onChange={(e) => setFilter({ ...filter, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={filter.end}
              onChange={(e) => setFilter({ ...filter, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            >
              <option value="all">All Types</option>
              <option value="user">User Reports</option>
              <option value="property">Property Reports</option>
              <option value="payment">Payment Reports</option>
              <option value="maintenance">Maintenance Reports</option>
            </select>
          </div>
          <Button onClick={onFilter} className="flex items-center gap-2">
            <Filter size={16} />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Chart */}
      {chartDataArray.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-4">Reports Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0b6e4f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium uppercase">
                      {r.type || "unknown"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900">{r.summary || r.title || "No summary"}</div>
                  {r.description && (
                    <div className="text-sm text-gray-600 mt-1">{r.description}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
