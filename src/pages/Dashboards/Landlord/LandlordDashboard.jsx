// src/pages/Dashboards/Landlord/LandlordDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getLandlordDashboardStats,
  getLandlordRecentActivity,
} from "@/services/landlordService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

// Icons
import {
  Home,
  DollarSign,
  Users,
  Calendar,
  Zap,
  Plus,
  Building2,
  CalendarCheck,
  TrendingUp,
  Activity,
} from "lucide-react";

import { mockLandlordDashboardStats, mockLandlordActivity } from "@/mocks/dashboardMock";

export default function LandlordDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const realStats = await getLandlordDashboardStats();
      const realActivity = await getLandlordRecentActivity();
      setStats(realStats);
      setActivity(realActivity);
    } catch (err) {
      console.warn("API failed → using mock data", err);
      setStats(mockLandlordDashboardStats);
      setActivity(mockLandlordActivity);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-[#0b6e4f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950 space-y-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Landlord Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor your properties, revenue, and tenant activity
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Properties" value={stats.totalProperties} icon={Building2} gradient="from-purple-500 to-purple-600" />
        <KPICard title="Monthly Revenue" value={`₵${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} gradient="from-emerald-500 to-emerald-600" />
        <KPICard title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={Users} gradient="from-blue-500 to-blue-600" />
        <KPICard title="Pending Requests" value={stats.pendingViewRequests} icon={Calendar} gradient="from-amber-500 to-amber-600" />
      </section>

      {/* Charts */}
      <section className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <TrendingUp size={22} />
              Revenue Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37415150" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.9)", border: "none", borderRadius: "12px" }} />
                <Bar dataKey="revenue" fill="#0b6e4f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Activity size={22} />
              Occupancy Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37415150" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.9)", border: "none", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="rate" stroke="#0b6e4f" strokeWidth={4} dot={{ fill: "#0b6e4f", r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Activity + Quick Actions */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              Recent Activity
              <Activity size={20} className="text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                activity.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <div className="w-2 h-2 mt-2 bg-[#0b6e4f] rounded-full shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

       {/* Quick Actions */}
<Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
      <span className="w-11 h-11 bg-linear-to-br from-[#0b6e4f] to-[#095c42] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
        <Zap size={22} />
      </span>
      <span className="truncate">Quick Actions</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4 pt-2">
    {/* Add New Property */}
    <Link to="/landlord/properties/new" className="block group">
      <Button className="w-full h-14 justify-start text-left text-base lg:text-lg font-medium bg-linear-to-r from-[#0b6e4f] to-[#095c42] hover:from-[#095c42] hover:to-[#074d38] shadow-lg transform group-hover:scale-105 transition-all duration-300">
        <Plus className="mr-3 h-5 w-5 shrink-0" />
        <span className="truncate">Add New Property</span>
      </Button>
    </Link>

    {/* Manage Properties */}
    <Link to="/landlord/properties" className="block group">
      <Button
        variant="outline"
        className="w-full h-14 justify-start text-left text-base lg:text-lg font-medium border-2 hover:border-[#0b6e4f] hover:bg-[#0b6e4f]/5 dark:hover:bg-[#0b6e4f]/10 group-hover:scale-105 transition-all duration-300"
      >
        <Home className="mr-3 h-5 w-5 shrink-0" />
        <span className="truncate">Manage Properties</span>
      </Button>
    </Link>

    {/* View Booking Requests */}
    <Link to="/landlord/bookings" className="block group">
      <Button
        variant="outline"
        className="w-full h-14 justify-start text-left text-base lg:text-lg font-medium border-2 hover:border-[#0b6e4f] hover:bg-[#0b6e4f]/5 dark:hover:bg-[#0b6e4f]/10 group-hover:scale-105 transition-all duration-300"
      >
        <CalendarCheck className="mr-3 h-5 w-5 shrink-0" />
        <span className="truncate">View Booking Requests</span>
      </Button>
    </Link>
  </CardContent>
</Card>
      </section>
    </div>
  );
}

// Iconic KPI Card
function KPICard({ title, value, icon: Icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-linear-to-br ${gradient} p-6 rounded-2xl shadow-xl text-white`}
    >
      <div className="flex items-center justify-between mb-4">
        {Icon && <Icon size={32} className="opacity-90" />}
      </div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}