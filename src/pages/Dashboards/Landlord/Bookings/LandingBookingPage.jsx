// src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx
import React, { useState, useEffect } from "react";
import { fetchBookings, respondBooking } from "@/services/landlordService";
import { getUserReviews } from "@/services/reviewService";
import { useAuthStore } from "@/stores/authStore";
import BookingsCalendar from "@/components/landlord/BookingsCalendar";
import { Calendar, List, Filter, CheckCircle, XCircle, Clock, Star, Shield, User, Link as LinkIcon, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import RatingDisplay from "@/components/reviews/RatingDisplay";
import VerificationBadge from "@/components/reviews/VerificationBadge";
import { notifyBookingApproved, notifyBookingRejected } from "@/utils/bookingNotifications";

export default function LandingBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("calendar");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const list = await fetchBookings();
        if (!mounted) return;
        
        // Debug logging
        if (import.meta.env.DEV) {
          console.log("[LandingBookingPage] Fetched bookings:", list);
          console.log("[LandingBookingPage] Bookings count:", list?.length || 0);
        }
        
        setBookings(Array.isArray(list) ? list : []);
        
        // If no bookings found, log for debugging
        if (Array.isArray(list) && list.length === 0 && import.meta.env.DEV) {
          console.warn("[LandingBookingPage] No bookings returned from API");
        }
      } catch (err) {
        console.error("[LandingBookingPage] fetchBookings error:", err);
        if (mounted) {
          const { getErrorMessage } = await import("@/utils/errorMessages");
          setError(getErrorMessage(err, "Unable to load bookings"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRespond = async (id, action) => {
    if (!id) {
      toast.error("Invalid booking ID");
      return;
    }

    try {
      setError(""); // Clear previous errors
      
      // Find the booking to get tenant and property info
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        toast.error("Booking not found");
        return;
      }

      // Respond to booking
      await respondBooking(id, action);
      
      // Update local state with new status
      const updatedBooking = {
        ...booking,
        status: action === "accept" ? "accepted" : "declined",
      };
      
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? updatedBooking : b))
      );
      
      // Trigger notifications (in-system + email) for tenant
      // Note: Backend should also create notifications, but we trigger here as fallback
      try {
        if (action === "accept") {
          await notifyBookingApproved({
            booking: updatedBooking,
            tenant: booking.tenant || { id: booking.tenantId || booking.applicantId },
            property: booking.property || { id: booking.propertyId, title: booking.propertyTitle },
            sendEmail: true,
          });
        } else {
          await notifyBookingRejected({
            booking: updatedBooking,
            tenant: booking.tenant || { id: booking.tenantId || booking.applicantId },
            property: booking.property || { id: booking.propertyId, title: booking.propertyTitle },
            reason: null, // Could extract from booking if available
            sendEmail: true,
          });
        }
      } catch (notifErr) {
        // Don't fail the booking response if notification fails
        console.warn("Notification failed (non-blocking):", notifErr);
      }
      
      toast.success(
        action === "accept"
          ? "Booking accepted! Tenant has been notified."
          : "Booking declined. Tenant has been notified."
      );
    } catch (err) {
      console.error("respondBooking error:", err);
      
      // Extract user-friendly error message
      const errorMessage = err.message || 
                          err.response?.data?.message || 
                          err.response?.data?.detail ||
                          (err.response?.status === 404 
                            ? "Booking not found. It may have been deleted."
                            : err.response?.status === 500
                            ? "Server error. Please try again later."
                            : "Failed to respond to booking. Please try again.");
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Normalize status for consistent filtering
  const normalizeStatus = (status) => {
    if (!status) return "pending";
    const s = String(status).toLowerCase();
    if (["requested", "pending"].includes(s)) return "pending";
    if (["accepted", "approved"].includes(s)) return "accepted";
    if (["declined", "rejected"].includes(s)) return "declined";
    return s;
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    const status = normalizeStatus(b.status);
    if (filter === "pending") return status === "pending";
    if (filter === "accepted") return status === "accepted";
    if (filter === "declined") return status === "declined";
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => normalizeStatus(b.status) === "pending").length,
    accepted: bookings.filter((b) => normalizeStatus(b.status) === "accepted").length,
    declined: bookings.filter((b) => normalizeStatus(b.status) === "declined").length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Requests</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage viewing and booking requests for your properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              view === "calendar"
                ? "bg-[#0b6e4f] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Calendar size={18} />
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              view === "list"
                ? "bg-[#0b6e4f] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <List size={18} />
            List
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Declined</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.declined}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={18} className="text-gray-600 dark:text-gray-400" />
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#0b6e4f] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("accepted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "accepted"
              ? "bg-green-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter("declined")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "declined"
              ? "bg-red-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Declined
        </button>
      </div>

      {/* View Content */}
      {view === "calendar" ? (
        <BookingsCalendar bookings={bookings} filter={filter} normalizeStatus={normalizeStatus} />
      ) : (
        <EnhancedBookingList bookings={filteredBookings} onRespond={handleRespond} normalizeStatus={normalizeStatus} />
      )}
    </div>
  );
}

// Enhanced Booking List Component with Tenant Ratings & Trust Scores
function EnhancedBookingList({ bookings, onRespond, normalizeStatus }) {
  const [tenantRatings, setTenantRatings] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Normalize status function (use passed prop or define locally)
  const normalizeStatusLocal = normalizeStatus || ((status) => {
    if (!status) return "pending";
    const s = String(status).toLowerCase();
    if (["requested", "pending"].includes(s)) return "pending";
    if (["accepted", "approved"].includes(s)) return "accepted";
    if (["declined", "rejected"].includes(s)) return "declined";
    return s;
  });

  // Load tenant ratings for each booking
  useEffect(() => {
    const loadRatings = async () => {
      const ratings = {};
      for (const booking of bookings) {
        if (booking.tenantId || booking.applicantId) {
          try {
            const tenantId = booking.tenantId || booking.applicantId;
            const reviewsData = await getUserReviews(tenantId);
            ratings[tenantId] = {
              average_rating: reviewsData.average_rating || 0,
              total_reviews: reviewsData.total_reviews || 0,
              trust_score: calculateTrustScore(reviewsData),
            };
          } catch (err) {
            // Silently fail - tenant may not have reviews yet
          }
        }
      }
      setTenantRatings(ratings);
    };
    if (bookings.length > 0) {
      loadRatings();
    }
  }, [bookings]);

  const calculateTrustScore = (reviewsData) => {
    // Simple trust score calculation based on ratings and review count
    const avgRating = reviewsData.average_rating || 0;
    const reviewCount = reviewsData.total_reviews || 0;
    const baseScore = avgRating * 20; // 5 stars = 100 points
    const reviewBonus = Math.min(reviewCount * 2, 20); // Max 20 bonus points
    return Math.min(100, Math.round(baseScore + reviewBonus));
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
        <p className="text-gray-600 dark:text-gray-400">No booking requests match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const tenantId = booking.tenantId || booking.applicantId;
        const rating = tenantRatings[tenantId];
        
        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 hover:border-[#0b6e4f] transition-colors"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {booking.applicantName || "Unknown Tenant"}
                      </h3>
                      {tenantId && (
                        <Link
                          to={`/users/${tenantId}`}
                          className="text-[#0b6e4f] hover:text-[#095c42] dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="View tenant profile"
                        >
                          <User className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                    {/* Tenant Ratings & Trust Score */}
                    {rating && (
                      <div className="flex items-center gap-4 text-sm">
                        {rating.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <RatingDisplay rating={rating.average_rating} size="sm" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {rating.average_rating.toFixed(1)} ({rating.total_reviews} reviews)
                            </span>
                          </div>
                        )}
                        {rating.trust_score > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              Trust Score: {rating.trust_score}/100
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        normalizeStatusLocal(booking.status) === "accepted"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : normalizeStatusLocal(booking.status) === "declined"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      }`}
                    >
                      {booking.status || "pending"}
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-[#0b6e4f] dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      title="View booking details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                  <p>
                    <span className="font-medium">Property:</span>{" "}
                    {booking.propertyTitle || `ID: ${booking.propertyId}`}
                  </p>
                  {booking.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {booking.phone}
                    </p>
                  )}
                  {(booking.dateRequested || booking.preferred_date || booking.requestedDate) && (
                    <p>
                      <span className="font-medium">Requested:</span>{" "}
                      {new Date(booking.dateRequested || booking.preferred_date || booking.requestedDate).toLocaleString()}
                    </p>
                  )}
                  {booking.message && (
                    <p className="mt-3 italic text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{booking.message}"
                    </p>
                  )}
                </div>
              </div>
              {normalizeStatus(booking.status) === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onRespond(booking.id, "decline")}
                    className="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 font-medium transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onRespond(booking.id, "accept")}
                    className="px-5 py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] font-medium transition-colors shadow-sm"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      
      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            normalizeStatus={normalizeStatusLocal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose, normalizeStatus }) {
  const tenantId = booking.tenantId || booking.applicantId;
  const status = normalizeStatus(booking.status);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider ${
                status === "accepted"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : status === "declined"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
              }`}
            >
              {booking.status || "pending"}
            </span>
          </div>
          
          {/* Tenant Information */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Information</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {booking.applicantName || "Unknown Tenant"}
                </span>
              </div>
              {tenantId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tenant ID</span>
                  <Link
                    to={`/users/${tenantId}`}
                    className="text-sm text-[#0b6e4f] hover:text-[#095c42] dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                  >
                    View Profile →
                  </Link>
                </div>
              )}
              {booking.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                  <a
                    href={`tel:${booking.phone}`}
                    className="text-sm text-gray-900 dark:text-white font-medium hover:text-[#0b6e4f] dark:hover:text-emerald-400"
                  >
                    {booking.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Property Information */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Property Information</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Property</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {booking.propertyTitle || `Property ID: ${booking.propertyId || "N/A"}`}
                </span>
              </div>
              {booking.propertyId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Property ID</span>
                  <Link
                    to={`/properties/${booking.propertyId}`}
                    className="text-sm text-[#0b6e4f] hover:text-[#095c42] dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                  >
                    View Property →
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Request Details */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              {(booking.dateRequested || booking.preferred_date || booking.requestedDate) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Preferred Date</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {new Date(booking.dateRequested || booking.preferred_date || booking.requestedDate).toLocaleString()}
                  </span>
                </div>
              )}
              {booking.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Requested On</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {new Date(booking.created_at).toLocaleString()}
                  </span>
                </div>
              )}
              {booking.message && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Message</span>
                  <p className="text-sm text-gray-900 dark:text-white italic leading-relaxed bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                    "{booking.message}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}