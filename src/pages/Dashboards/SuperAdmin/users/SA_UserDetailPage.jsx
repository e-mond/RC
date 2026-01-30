/**
 * SA_UserDetailPage - Super Admin User Detail Page
 * 
 * Comprehensive user detail page for Super Admins showing:
 * - Full user profile information
 * - Properties (if landlord)
 * - Services/jobs (if artisan)
 * - Reviews & ratings
 * - Wallet information
 * - Role-specific metadata
 * - Admin actions (activate/deactivate, suspend, assign roles, delete)
 * 
 * Route: /super-admin/users/:id
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Wrench,
  Star,
  Wallet,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Loader2,
  AlertCircle,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { getUserDetailsSA, suspendUserSA, deleteUser, assignRoleWithPermissions } from "@/services/adminService";
import PageHeader from "@/modules/dashboard/PageHeader";
import { validateId } from "@/utils/validateParams";
import SA_SuspendUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_SuspendUserModal";
import SA_DeleteUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_DeleteUserModal";

export default function SA_UserDetailPage() {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Validate and sanitize ID parameter
  const id = validateId(rawId);

  useEffect(() => {
    if (!id) {
      toast.error("Invalid user ID");
      navigate("/super-admin/users");
      return;
    }
    loadUserDetails();
  }, [id, navigate]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUserDetailsSA(id);
      // Handle different response shapes
      setUser(data.user || data);
    } catch (err) {
      console.error("Failed to load user details:", err);
      setError(err.message || "Failed to load user details");
      toast.error(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = () => {
    setSuspendModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleRoleChange = async (newRole) => {
    setActionLoading("role");
    try {
      await assignRoleWithPermissions(id, newRole, {});
      toast.success(`User role updated to ${newRole}`);
      loadUserDetails(); // Refresh user data
    } catch (err) {
      console.error("Failed to change role:", err);
      toast.error(err.message || "Failed to change role");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "User not found"}</p>
          <Button onClick={() => navigate("/super-admin/users")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const role = user.role?.toLowerCase() || "tenant";
  const displayName = user.full_name || user.fullName || user.name || "User";
  const isLandlord = role === "landlord";
  const isArtisan = role === "artisan";
  const statusColors = {
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending_approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    suspended: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <PageHeader
          title="User Details"
          subtitle={`Managing ${displayName}`}
          badge="Super Admin"
          align="between"
          actions={
            <Button
              onClick={() => navigate("/super-admin/users")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[user.status] || statusColors.active
                }`}>
                  {user.status?.replace("_", " ").toUpperCase() || "ACTIVE"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{displayName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.email || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.phone || user.phone_number || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">{role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {user.created_at || user.createdAt
                      ? new Date(user.created_at || user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {user.last_login || user.lastLogin
                      ? new Date(user.last_login || user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.bio}</p>
                </div>
              )}
            </motion.div>

            {/* Properties Section (Landlord) */}
            {isLandlord && user.properties && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Properties ({user.properties?.length || user.properties_count || 0})
                  </h2>
                  <Link to={`/landlord/properties/view/${id}`}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                {user.properties && user.properties.length > 0 ? (
                  <div className="space-y-4">
                    {user.properties.slice(0, 5).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        {property.images?.[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <Link
                            to={`/properties/${property.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-[#0b6e4f]"
                          >
                            {property.title}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                            statusColors[property.status] || statusColors.active
                          }`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No properties found</p>
                )}
              </motion.div>
            )}

            {/* Services/Jobs Section (Artisan) */}
            {isArtisan && (user.services || user.jobs) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <Wrench className="w-5 h-5" />
                  Services & Jobs
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.services?.length || user.services_count || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Jobs Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.jobs_completed || user.jobs?.length || 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            {(user.reviews || user.average_rating !== undefined) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5" />
                  Reviews & Ratings
                </h2>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.average_rating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.total_reviews || user.reviews?.length || 0} reviews
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(user.average_rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wallet Information */}
            {user.wallet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <Wallet className="w-5 h-5" />
                  Wallet Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₵{user.wallet.balance || user.wallet_balance || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.wallet.transactions_count || 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Admin Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                {/* Role Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={actionLoading === "role"}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="artisan">Artisan</option>
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>

                {/* Suspend User */}
                <Button
                  onClick={handleSuspend}
                  variant="outline"
                  className="w-full flex items-center gap-2 text-orange-600 hover:text-orange-700"
                >
                  <Ban className="w-4 h-4" />
                  Suspend User
                </Button>

                {/* Delete User */}
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </Button>

                {/* View Profile */}
                <Link to={`/super-admin/users/${id}/profile`}>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {isLandlord && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Properties</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.properties_count || user.properties?.length || 0}
                    </p>
                  </div>
                )}
                {isArtisan && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Services</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.services_count || user.services?.length || 0}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trust Score</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {user.trust_score || "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <SA_SuspendUserModal
          user={user}
          open={suspendModalOpen}
          onClose={() => setSuspendModalOpen(false)}
          onSuccess={() => {
            loadUserDetails();
            setSuspendModalOpen(false);
          }}
        />
        <SA_DeleteUserModal
          user={user}
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => {
            navigate("/super-admin/users");
          }}
        />
      </div>
    </div>
  );
}
