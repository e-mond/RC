import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Calendar, DollarSign, Star, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/services/analyticsService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function ArtisanDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Artisan Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.full_name || "Artisan"}!</p>
            {user?.profession && (
              <p className="text-sm text-gray-500 mt-1">Profession: {user.profession}</p>
            )}
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_service_requests || 0}
                  </p>
                </div>
                <Wrench className="w-8 h-8 text-teal-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active_requests || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_earnings?.toLocaleString() || 0} GHS
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.average_rating?.toFixed(1) || "0.0"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ({stats.total_reviews || 0} reviews)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/bookings/service-requests">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Wrench className="w-10 h-10 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Requests</h3>
              <p className="text-gray-600">View incoming service requests</p>
            </motion.div>
          </Link>

          <Link to="/bookings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Calendar className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
              <p className="text-gray-600">Manage your bookings</p>
            </motion.div>
          </Link>

          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Star className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-gray-600">Update your artisan profile</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
