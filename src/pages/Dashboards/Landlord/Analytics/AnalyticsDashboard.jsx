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
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, MessageSquare, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Analytics Dashboard (Premium Feature)
 * - Revenue charts
 * - Occupancy metrics
 * - Inquiry tracking
 * - Trust Score visualization
 */
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
        // Mock data for now - replace with real API calls
        await new Promise((r) => setTimeout(r, 500));

        if (!mounted) return;

        // Mock analytics data
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
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Failed to load analytics"}
        </div>
      </div>
    );
  }

  const COLORS = ["#0b6e4f", "#1f8cff", "#f59e0b", "#ef4444"];

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[#0f1724]">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600">Comprehensive insights into your property performance</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={`₵${analytics.summary.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-[#0b6e4f]" />}
          trend="+12.5%"
          trendUp
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${analytics.summary.occupancyRate}%`}
          icon={<Users className="h-6 w-6 text-[#0b6e4f]" />}
          trend="+5%"
          trendUp
        />
        <SummaryCard
          title="Total Inquiries"
          value={analytics.summary.totalInquiries}
          icon={<MessageSquare className="h-6 w-6 text-[#0b6e4f]" />}
          trend="+18%"
          trendUp
        />
        <SummaryCard
          title="Trust Score"
          value={analytics.trustScore}
          icon={<Shield className="h-6 w-6 text-[#0b6e4f]" />}
          trend="+2"
          trendUp
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₵${value.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#0b6e4f" fill="#0b6e4f" fillOpacity={0.6} />
            <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            <Line type="monotone" dataKey="net" stroke="#1f8cff" strokeWidth={3} dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Occupancy Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.occupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupied" fill="#0b6e4f" name="Occupied" />
              <Bar dataKey="vacant" fill="#ef4444" name="Vacant" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Inquiries & Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Inquiries & Views</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.inquiries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="inquiries"
                stroke="#0b6e4f"
                strokeWidth={2}
                name="Inquiries"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="views"
                stroke="#1f8cff"
                strokeWidth={2}
                name="Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Trust Score & Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Trust Score</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#0b6e4f"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(analytics.trustScore / 100) * 552.92} 552.92`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0b6e4f]">{analytics.trustScore}</div>
                  <div className="text-sm text-gray-600">out of 100</div>
                </div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={analytics.trustHistory}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0b6e4f" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Property Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.propertyPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#1f8cff" name="Views" />
              <Bar dataKey="inquiries" fill="#0b6e4f" name="Inquiries" />
              <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon, trend, trendUp }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trendUp ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trend}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="p-3 bg-[#0b6e4f]/10 rounded-lg text-[#0b6e4f]">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

