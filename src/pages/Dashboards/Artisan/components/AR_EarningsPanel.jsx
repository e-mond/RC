// src/pages/Dashboards/Artisan/components/AR_EarningsPanel.jsx
import React, { useEffect, useState } from "react";
import { getEarningsSummary, getEarningsHistory, generateInvoice } from "@/services/artisanService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, Download, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

import SummaryCard from "./SummaryCard";
import PaymentHistoryItem from "./PaymentHistoryItem";

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
        if (mounted) setError(err.message || "Failed to load earnings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
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
      alert(err.message || "Failed to generate invoice");
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[500px] bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-3xl">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 bg-linear-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-3xl text-center">
        <p className="text-xl font-semibold text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  const monthlyData = history.reduce((acc, earning) => {
    const month = new Date(earning.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + (earning.amount || 0);
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));

  const COLORS = ["#0b6e4f", "#095c42", "#0a5a40", "#084d38", "#073f30"];

  return (
    <div className="space-y-10 p-4 sm:p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-nowrap">
        <SummaryCard title="Total Earnings" value={`₵${(summary?.totalEarnings || 0).toLocaleString()}`} gradient="from-emerald-400 to-teal-600" icon={<DollarSign className="w-6 h-6" />} />
        <SummaryCard title="Pending Payout" value={`₵${(summary?.pendingEarnings || 0).toLocaleString()}`} gradient="from-amber-400 to-orange-600" icon={<TrendingUp className="w-6 h-6" />} />
        <SummaryCard title="Completed Tasks" value={summary?.completedTasks || 0} gradient="from-blue-400 to-cyan-600" icon={<Calendar className="w-6 h-6" />} />
        <SummaryCard title="Total Tasks" value={summary?.totalTasks || 0} gradient="from-violet-400 to-purple-600" icon={<Calendar className="w-6 h-6" />} />
      </div>

      {/*  Vertical Bar Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="4 8" stroke="#e0e0e0" opacity={0.3} />
              <XAxis dataKey="month" stroke="#666" fontSize={14} />
              <YAxis stroke="#666" fontSize={14} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 36, 0.95)",
                  border: "1px solid #0b6e4f",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                formatter={(v) => `₵${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Payment History */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-[#0b6e4f]/5 to-transparent">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Payment History</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-xl font-medium text-gray-700 dark:text-gray-300">No payments yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Complete jobs to see your earnings flow in
              </p>
            </div>
          ) : (
            history.map((earning, idx) => (
              <motion.div
                key={earning.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-8 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                <PaymentHistoryItem earning={earning} onGenerateInvoice={handleGenerateInvoice} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}