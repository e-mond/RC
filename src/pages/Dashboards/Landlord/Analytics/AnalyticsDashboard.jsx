// src/pages/Dashboards/Landlord/Analytics/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, MessageSquare, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));

        if (!mounted) return;

        const mockData = {
          revenue: [
            { month: "Jan", revenue: 3200, expenses: 800, net: 2400 },
            { month: "Feb", revenue: 3500, expenses: 850, net: 2650 },
            { month: "Mar", revenue: 4200, expenses: 900, net: 3300 },
            { month: "Apr", revenue: 3800, expenses: 820, net: 2980 },
            { month: "May", revenue: 4500, expenses: 950, net: 3550 },
            { month: "Jun", revenue: 4800, expenses: 1000, net: 3800 },
          ],
          occupancy: [
            { month: "Jan", occupied: 8, vacant: 2, total: 10 },
            { month: "Feb", occupied: 9, vacant: 1, total: 10 },
            { month: "Mar", occupied: 9, vacant: 1, total: 10 },
            { month: "Apr", occupied: 8, vacant: 2, total: 10 },
            { month: "May", occupied: 10, vacant: 0, total: 10 },
            { month: "Jun", occupied: 10, vacant: 0, total: 10 },
          ],
          inquiries: [
            { day: "Mon", inquiries: 12, views: 180 },
            { day: "Tue", inquiries: 15, views: 220 },
            { day: "Wed", inquiries: 18, views: 250 },
            { day: "Thu", inquiries: 14, views: 200 },
            { day: "Fri", inquiries: 20, views: 280 },
            { day: "Sat", inquiries: 22, views: 300 },
            { day: "Sun", inquiries: 16, views: 240 },
          ],
          propertyPerformance: [
            { name: "Property A", views: 1200, inquiries: 45, bookings: 8 },
            { name: "Property B", views: 980, inquiries: 32, bookings: 6 },
            { name: "Property C", views: 750, inquiries: 28, bookings: 5 },
            { name: "Property D", views: 650, inquiries: 20, bookings: 3 },
          ],
          trustScore: 87,
          trustHistory: [
            { month: "Jan", score: 82 },
            { month: "Feb", score: 84 },
            { month: "Mar", score: 85 },
            { month: "Apr", score: 86 },
            { month: "May", score: 87 },
            { month: "Jun", score: 87 },
          ],
          summary: {
            totalRevenue: 24000,
            totalProperties: 10,
            occupancyRate: 100,
            totalInquiries: 117,
            avgResponseTime: "2.5 hours",
          },
        };

        setAnalytics(mockData);
      } catch (err) {
        console.error("loadAnalytics:", err);
        if (mounted) setError(err.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || "Failed to load analytics"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive insights into your property performance
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={`₵${analytics.summary.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend="+12.5%"
          trendUp
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${analytics.summary.occupancyRate}%`}
          icon={<Users className="h-6 w-6" />}
          trend="+5%"
          trendUp
        />
        <SummaryCard
          title="Total Inquiries"
          value={analytics.summary.totalInquiries}
          icon={<MessageSquare className="h-6 w-6" />}
          trend="+18%"
          trendUp
        />
        <SummaryCard
          title="Trust Score"
          value={analytics.trustScore}
          icon={<Shield className="h-6 w-6" />}
          trend="+2"
          trendUp
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={analytics.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  className: "dark:bg-gray-800 dark:border-gray-700",
                }}
                formatter={(value) => `₵${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#0b6e4f" fill="#0b6e4f" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
              <Line type="monotone" dataKey="net" stroke="#1f8cff" strokeWidth={3} dot={{ r: 5, fill: "#1f8cff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Occupancy + Inquiries */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Occupancy Rate</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.occupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#0b6e4f" name="Occupied" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vacant" fill="#ef4444" name="Vacant" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.inquiries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="day" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="inquiries" stroke="#0b6e4f" strokeWidth={3} dot={{ r: 5 }} name="Inquiries" />
                <Line yAxisId="right" type="monotone" dataKey="views" stroke="#1f8cff" strokeWidth={3} dot={{ r: 5 }} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Trust Score</h3>
          <div className="flex justify-center mb-8">
            <div className="relative w-56 h-56">
              <svg className="transform -rotate-90 w-56 h-56">
                <circle cx="112" cy="112" r="100" stroke="#e5e7eb" strokeWidth="20" fill="none" className="dark:stroke-gray-700" />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  stroke="#0b6e4f"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${(analytics.trustScore / 100) * 628} 628`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-[#0b6e4f] dark:text-[#0b6e4f]">{analytics.trustScore}</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">out of 100</div>
                </div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={analytics.trustHistory}>
              <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis domain={[70, 100]} stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0b6e4f" strokeWidth={3} dot={{ r: 6, fill: "#0b6e4f" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Property Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Property Performance</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={analytics.propertyPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis type="number" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#1f8cff" name="Views" radius={[0, 8, 8, 0]} />
              <Bar dataKey="inquiries" fill="#0b6e4f" name="Inquiries" radius={[0, 8, 8, 0]} />
              <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced Summary Card with dark mode
function SummaryCard({ title, value, icon, trend, trendUp }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 transition-all hover:shadow-xl dark:hover:shadow-2xl"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-centre gap-2">
            {trendUp ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {trend}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="p-4 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 rounded-2xl">
          <div className="text-[#0b6e4f]">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}