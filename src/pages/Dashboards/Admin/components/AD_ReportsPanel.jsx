import React, { useEffect, useState, useCallback } from "react";
import { fetchReports } from "@/services/adminService";
import Button from "@/components/ui/Button";
import { Download, Filter, Calendar, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AD_ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ start: "", end: "", type: "all" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReports(filter.start, filter.end);
      const reportList = res.data || res || [];
      let filtered = Array.isArray(reportList) ? reportList : [];

      if (filter.type && filter.type !== "all") {
        filtered = filtered.filter((r) => r.type?.toLowerCase() === filter.type.toLowerCase());
      }

      setReports(filtered);
    } catch (err) {
      console.error("fetchReports:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter.start, filter.end, filter.type]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    const csv = [
      ["Type", "Summary", "Created At"].join(","),
      ...reports.map((r) =>
        [
          r.type || "unknown",
          `"${(r.summary || "").replace(/"/g, '""')}"`,
          new Date(r.createdAt).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reports-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data
  const chartData = reports.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartDataArray = Object.entries(chartData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#0b6e4f]" />
            System Reports
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {reports.length} report{reports.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2.5 px-5 py-3 bg-[#0b6e4f] hover:bg-[#095c42] text-white font-medium rounded-xl transition shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </Button>
      </header>

      {/* Filters */}
      <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={filter.start}
                onChange={(e) => setFilter({ ...filter, start: e.target.value })}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent transition"
              />
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">—</span>
              <input
                type="date"
                value={filter.end}
                onChange={(e) => setFilter({ ...filter, end: e.target.value })}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent transition"
              >
                <option value="all">All Types</option>
                <option value="user">User Reports</option>
                <option value="property">Property Reports</option>
                <option value="payment">Payment Reports</option>
                <option value="maintenance">Maintenance Reports</option>
              </select>
            </div>
          </div>

          <Button
            onClick={load}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0b6e4f] hover:bg-[#095c42] text-white font-medium rounded-xl transition shadow-md"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Chart */}
      {chartDataArray.length > 0 && (
        <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Reports Activity Over Time</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartDataArray}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                tick={{ fontSize: 14 }}
              />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
              />
              <Bar dataKey="count" fill="#0b6e4f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Reports Found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or date range.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r, idx) => (
            <motion.div
              key={r.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#0b6e4f]/50 dark:hover:border-[#0b6e4f]/30 transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 text-[#0b6e4f] rounded-full text-xs font-bold uppercase tracking-wider">
                      {r.type || "unknown"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt).toLocaleString("en-GH")}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {r.summary || r.title || "Untitled Report"}
                  </h4>
                  {r.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {r.description}
                    </p>
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