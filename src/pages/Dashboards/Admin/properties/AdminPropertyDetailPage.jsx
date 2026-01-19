/**
 * AdminPropertyDetailPage - Admin Property Detail Page
 * 
 * Dedicated page for admins/super admins to view property details with:
 * - Full property information
 * - Ratings and reviews
 * - Suspend property functionality
 * - Property owner information
 * - Property status management
 * 
 * Route: /admin/properties/:id or /super-admin/properties/:id
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  User,
  Mail,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Building2,
  DollarSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { fetchProperty } from "@/services/propertyService";
import { getPropertyReviews } from "@/services/reviewService";
import { approveProperty, rejectProperty } from "@/services/adminService";
import PageHeader from "@/modules/dashboard/PageHeader";
import { ReviewsList } from "@/components/reviews";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";
import { useAuthStore } from "@/stores/authStore";

export default function AdminPropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super-admin";
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    if (id) {
      loadProperty();
      loadReviews();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchProperty(id);
      const prop = data?.data ?? data;
      setProperty(prop);
    } catch (err) {
      console.error("Failed to load property:", err);
      setError(err.message || "Failed to load property");
      toast.error(err.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await getPropertyReviews(id);
      setReviews(response.reviews || response.data || []);
      setReviewsData({
        average_rating: response.average_rating || 0,
        total_reviews: response.total_reviews || response.count || 0,
        rating_breakdown: response.rating_breakdown || {},
      });
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    setActionLoading("suspend");
    try {
      // Use reject property with reason (suspension)
      if (isSuperAdmin) {
        const { rejectPropertySA } = await import("@/services/adminService");
        await rejectPropertySA(id, suspendReason);
      } else {
        await rejectProperty(id, suspendReason);
      }
      toast.success("Property suspended successfully");
      setSuspendModalOpen(false);
      setSuspendReason("");
      loadProperty(); // Refresh property data
    } catch (err) {
      console.error("Failed to suspend property:", err);
      toast.error(err.message || "Failed to suspend property");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      if (isSuperAdmin) {
        const { approvePropertySA } = await import("@/services/adminService");
        await approvePropertySA(id);
      } else {
        await approveProperty(id);
      }
      toast.success("Property approved successfully");
      loadProperty();
    } catch (err) {
      console.error("Failed to approve property:", err);
      toast.error(err.message || "Failed to approve property");
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

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Property not found"}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending_approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    suspended: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    draft: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Property Details"
          subtitle={property.title || "Property Information"}
          badge={isSuperAdmin ? "Super Admin" : "Admin"}
          align="between"
          actions={
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 p-2">
                  {property.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={getFirstValidImage([img], getPlaceholderImage("Property", 400, 300))}
                        alt={`${property.title} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Property Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {property.title || "Untitled Property"}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address || "No address"}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[property.status] || statusColors.draft
                }`}>
                  {property.status?.replace("_", " ").toUpperCase() || "DRAFT"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{property.bedrooms || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{property.bathrooms || 0}</p>
                  </div>
                </div>
                {property.area_sqm && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{property.area_sqm} sqm</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-semibold text-[#0b6e4f]">
                      ₵{Number(property.price || property.priceGhs || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {property.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{property.description}</p>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {amenity.name || amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Landlord Information */}
            {property.landlord && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Property Owner
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                    {(property.landlord.full_name || property.landlord.name || "L")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {property.landlord.full_name || property.landlord.name || "Unknown"}
                    </p>
                    {property.landlord.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{property.landlord.email}</p>
                    )}
                    {property.landlord.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{property.landlord.phone}</p>
                    )}
                  </div>
                  {property.landlord.id && (
                    <Link to={`/super-admin/users/${property.landlord.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews & Ratings
              </h3>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
                </div>
              ) : (
                <ReviewsList
                  reviews={reviews}
                  averageRating={reviewsData.average_rating}
                  totalReviews={reviewsData.total_reviews}
                  ratingBreakdown={reviewsData.rating_breakdown}
                  showModerationStatus={true}
                />
              )}
            </motion.div>
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
                {property.status !== "approved" && (
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading === "approve"}
                    className="w-full flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095c42]"
                  >
                    {actionLoading === "approve" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve Property
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => setSuspendModalOpen(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2 text-orange-600 hover:text-orange-700"
                >
                  <Ban className="w-4 h-4" />
                  Suspend Property
                </Button>

                <Link to={`/properties/${id}`}>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Public Page
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Property Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reviewsData.average_rating > 0 ? reviewsData.average_rating.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reviewsData.total_reviews || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {property.created_at
                      ? new Date(property.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Suspend Modal */}
        {suspendModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Suspend Property
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="e.g., Violation of terms, Inappropriate content..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuspendModalOpen(false);
                      setSuspendReason("");
                    }}
                    disabled={actionLoading === "suspend"}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSuspend}
                    disabled={actionLoading === "suspend" || !suspendReason.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {actionLoading === "suspend" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Suspending...
                      </>
                    ) : (
                      "Suspend Property"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
