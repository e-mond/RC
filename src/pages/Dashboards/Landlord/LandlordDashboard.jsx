import React, { useEffect, useState } from "react";
import { getLandlordDashboardStats,getLandlordRecentActivity,} from "@/services/landlordService";
import { BarChart,Bar,XAxis,YAxis,Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, } from "recharts";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";


// --------------------
// MOCK FALLBACK IMPORTS
// --------------------
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
      // -----------------------------
      // TRY REAL API FIRST
      // -----------------------------
      const realStats = await getLandlordDashboardStats();
      const realActivity = await getLandlordRecentActivity();

      setStats(realStats);
      setActivity(realActivity);
    } catch (err) {
      console.warn("Dashboard API failed → switching to mock mode", err);

      // -----------------------------
      // MOCK FALLBACK
      // -----------------------------
      setStats(mockLandlordDashboardStats);
      setActivity(mockLandlordActivity);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-[#0b6e4f] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ---------------- KPI CARDS ---------------- */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total Properties" value={stats.totalProperties} />
        <KPI title="Total Revenue (Monthly)" value={`₵${stats.monthlyRevenue}`} />
        <KPI title="Occupancy Rate" value={`${stats.occupancyRate}%`} />
        <KPI title="View Requests" value={stats.pendingViewRequests} />
      </section>

      {/* ---------------- CHARTS ---------------- */}
      <section className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueChart}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ---------------- ACTIVITY + QUICK ACTIONS ---------------- */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activity.map((item, i) => (
                <li key={i} className="border-b pb-2">
                  <p className="font-medium">{item.message}</p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/landlord/properties/new">
              <Button className="w-full">Add New Property</Button>
            </Link>

            <Link to="/landlord/properties">
              <Button variant="outline" className="w-full">
                Manage Properties
              </Button>
            </Link>

            <Link to="/landlord/bookings">
              <Button variant="outline" className="w-full">
                View Booking Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// -----------------------------
// KPI SMALL COMPONENT
// -----------------------------
function KPI({ title, value }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
