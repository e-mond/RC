// src/pages/Dashboards/Landlord/LandlordDashboard.jsx
import React, { useEffect, useState } from "react";
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

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"; // ← Fixed: Capital 'C'
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UpgradeBanner from "@/components/common/UpgradeBanner";

import { getLandlordDashboardStats, getLandlordRecentActivity } from "@/services/landlordService";

/**
 * LandlordDashboard – Main dashboard view for landlords
 * 
 * Displays:
 * - Key metrics (KPIs)
 * - Revenue & occupancy charts
 * - Recent activity feed
 * - Quick action buttons
 * 
 * Features:
 * - Parallel data fetching
 * - Loading & error handling
 * - Dark mode support
 * - Responsive layout
 */
export default function LandlordDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Fetches dashboard statistics and recent activity in parallel
   */
  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsData, activityData] = await Promise.all([
        getLandlordDashboardStats(),
        getLandlordRecentActivity(),
      ]);

      setStats(statsData);
      setActivity(activityData || []);
    } catch (err) {
      console.error("Failed to load landlord dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ─── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-[#0b6e4f] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────
  if (error || !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-5 rounded-xl text-center">
          <p className="font-medium">{error || "Failed to load landlord dashboard"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={loadDashboard}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Upgrade Banner */}
      <UpgradeBanner
        message="Unlock advanced analytics, digital rent collection, and unlimited listings"
        position="top"
        dismissible={true}
      />

      {/* Overview KPIs */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Overview
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPI title="Total Properties" value={stats.totalProperties ?? 0} />
          <KPI
            title="Monthly Revenue"
            value={`₵${Number(stats.monthlyRevenue ?? 0).toLocaleString()}`}
          />
          <KPI title="Occupancy Rate" value={`${stats.occupancyRate ?? 0}%`} />
          <KPI title="Pending View Requests" value={stats.pendingViewRequests ?? 0} />
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.revenueChart || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.6} />
                <XAxis dataKey="month" axisLine={false} tick={{ fill: "#6b7280" }} />
                <YAxis axisLine={false} tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="revenue" fill="#0b6e4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trend Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.occupancyTrend || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                <XAxis dataKey="month" axisLine={false} tick={{ fill: "#6b7280" }} />
                <YAxis domain={[0, 100]} axisLine={false} tick={{ fill: "#6b7280" }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Occupancy"]}
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#0b6e4f"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity + Quick Actions */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <ul className="space-y-4">
                {activity.map((item, index) => (
                  <li
                    key={index}
                    className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/landlord/properties/new">
              <Button className="w-full justify-center bg-[#0b6e4f] hover:bg-[#095c42]">
                Add New Property
              </Button>
            </Link>

            <Link to="/landlord/properties">
              <Button variant="outline" className="w-full justify-center">
                Manage Properties
              </Button>
            </Link>

            <Link to="/landlord/bookings">
              <Button variant="outline" className="w-full justify-center">
                View Booking Requests
              </Button>
            </Link>

            <Link to="/landlord/analytics">
              <Button variant="outline" className="w-full justify-center">
                Full Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────
// KPI Card Reusable Component
// ────────────────────────────────────────────────
function KPI({ title, value }) {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}