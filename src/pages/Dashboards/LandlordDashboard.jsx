import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, DollarSign, Wrench, TrendingUp, Plus } from "lucide-react";
import { getDashboardStats } from "@/services/analyticsService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function LandlordDashboard() {
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
            <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.full_name || "Landlord"}!</p>
          </div>
          <div className="flex gap-2">
            <Link to="/properties/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </Link>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
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
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_properties || 0}</p>
                </div>
                <Home className="w-8 h-8 text-teal-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Available Properties</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.available_properties || 0}
                  </p>
                </div>
                <Home className="w-8 h-8 text-green-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_revenue?.toLocaleString() || 0} GHS
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
                  <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending_bookings || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/properties/my-properties">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Home className="w-10 h-10 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Properties</h3>
              <p className="text-gray-600">Manage your property listings</p>
            </motion.div>
          </Link>

          <Link to="/bookings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Calendar className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
              <p className="text-gray-600">View and manage bookings</p>
            </motion.div>
          </Link>

          <Link to="/payments/history">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <DollarSign className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
              <p className="text-gray-600">View payment history</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
