// src/pages/Dashboards/Artisan/components/AR_EarningsPanel.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { getEarningsSummary, getEarningsHistory, generateInvoice } from "@/services/artisanService";
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
} from "recharts";
import { DollarSign, TrendingUp, Download, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/**
 * AR_EarningsPanel - Comprehensive earnings dashboard
 * - Earnings summary
 * - Payment history
 * - Invoice generation
 */
export default function AR_EarningsPanel() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [summaryData, historyData] = await Promise.all([
          getEarningsSummary(),
          getEarningsHistory(),
        ]);
        if (mounted) {
          setSummary(summaryData);
          setHistory(Array.isArray(historyData.earnings) ? historyData.earnings : []);
        }
      } catch (err) {
        console.error("loadEarnings:", err);
        if (mounted) setError(err.message || "Failed to load earnings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerateInvoice = async (taskId) => {
    try {
      const blob = await generateInvoice(taskId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${taskId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("generateInvoice:", err);
      alert(err.message || "Failed to generate invoice");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = history.reduce((acc, earning) => {
    const month = new Date(earning.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += earning.amount || 0;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Earnings"
          value={`₵${(summary?.totalEarnings || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          color="bg-green-500"
        />
        <SummaryCard
          title="Pending"
          value={`₵${(summary?.pendingEarnings || 0).toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
          color="bg-yellow-500"
        />
        <SummaryCard
          title="Completed Tasks"
          value={summary?.completedTasks || 0}
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Total Tasks"
          value={summary?.totalTasks || 0}
          icon={<Calendar className="h-6 w-6 text-gray-600" />}
          color="bg-gray-500"
        />
      </div>

      {/* Earnings Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Earnings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip formatter={(value) => `₵${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="amount" stroke="#0b6e4f" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment History</h3>
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No payment history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((earning) => (
              <PaymentHistoryItem
                key={earning.id}
                earning={earning}
                onGenerateInvoice={handleGenerateInvoice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Card
function SummaryCard({ title, value, icon, color }) {
  const textColor = color.replace("bg-", "text-");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`p-3 ${color} rounded-lg bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Payment History Item
function PaymentHistoryItem({ earning, onGenerateInvoice }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
    >
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">{earning.taskTitle || "Task Payment"}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {earning.date ? new Date(earning.date).toLocaleDateString() : "Date not available"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-bold text-[#0b6e4f]">₵{earning.amount?.toLocaleString() || "0"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{earning.status || "paid"}</p>
        </div>
        <button
          onClick={() => onGenerateInvoice(earning.taskId || earning.id)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
        >
          <Download size={16} />
          Invoice
        </button>
      </div>
    </motion.div>
  );
}
