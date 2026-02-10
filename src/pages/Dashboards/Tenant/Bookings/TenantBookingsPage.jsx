// src/pages/Dashboards/Tenant/Bookings/TenantBookingsPage.jsx
import React, { useState, useEffect } from "react";
import { getTenantBookings, rescheduleBooking, cancelBooking } from "@/services/tenantService";
import { fetchProperty } from "@/services/propertyService";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";
import { Calendar, List, Filter, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, RefreshCw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import BookingsCalendar from "@/components/landlord/BookingsCalendar";
import RescheduleModal from "./components/RescheduleModal";
import CancelModal from "./components/CancelModal";
import { notifyBookingRescheduled, notifyBookingCancelled } from "@/utils/bookingNotifications";
import { useAuthStore } from "@/stores/authStore";

/**
 * TenantBookingsPage - Tenant booking management page
 * 
 * Features:
 * - View all bookings (pending, scheduled, cancelled, completed)
 * - Filter by status
 * - Calendar and list views
 * - Reschedule bookings
 * - Cancel bookings
 * - View booking details
 */
export default function TenantBookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Normalize status for consistent filtering
  const normalizeStatus = (status) => {
    if (!status) return "pending";
    const s = String(status).toLowerCase();
    if (["requested", "pending"].includes(s)) return "pending";
    if (["accepted", "approved", "scheduled"].includes(s)) return "scheduled";
    if (["declined", "rejected", "cancelled"].includes(s)) return "cancelled";
    if (["rescheduled"].includes(s)) return "rescheduled";
    if (["completed"].includes(s)) return "completed";
    if (["no-show"].includes(s)) return "no-show";
    return s;
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTenantBookings();

      // Enrich bookings with property details
      const enrichedBookings = await Promise.all(
        data.map(async (booking) => {
          if (booking.property_id || booking.propertyId) {
            try {
              const propertyId = booking.property_id || booking.propertyId;
              const propertyData = await fetchProperty(propertyId);
              const property = propertyData?.data || propertyData?.property || propertyData;

              return {
                ...booking,
                property: property || booking.property,
                propertyTitle: property?.title || booking.propertyTitle || "Unknown Property",
                propertyImage: getFirstValidImage(property?.images || [property?.image], getPlaceholderImage("Property")),
                propertyAddress: property?.address || property?.location,
              };
            } catch (err) {
              console.warn(`Failed to fetch property ${booking.property_id}:`, err);
              return booking;
            }
          }
          return booking;
        })
      );

      setBookings(enrichedBookings);
    } catch (err) {
      console.error("getTenantBookings error:", err);
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to load bookings. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadBookings();
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh bookings after reschedule/cancel
  const handleReschedule = async (bookingId, newDate, newTime, message) => {
    try {
      setError("");

      // Find the booking to get landlord and property info
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) {
        toast.error("Booking not found");
        return;
      }

      // Reschedule booking
      const updated = await rescheduleBooking(bookingId, newDate, newTime, message);

      // Update local state immediately
      const updatedBooking = { ...booking, ...updated, status: "rescheduled" };
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      // Trigger notifications (in-system + email) for landlord
      try {
        await notifyBookingRescheduled({
          booking: updatedBooking,
          landlord: booking.landlord || booking.property?.landlord || { id: booking.property?.landlord_id },
          property: booking.property || { id: booking.propertyId, title: booking.propertyTitle },
          newDate,
          newTime,
          message,
          sendEmail: true,
        });
      } catch (notifErr) {
        // Don't fail the reschedule if notification fails
        console.warn("Notification failed (non-blocking):", notifErr);
      }

      setRescheduleTarget(null);
      toast.success("Booking rescheduled successfully! The landlord has been notified.");

      // Refresh bookings to get latest data
      setTimeout(() => loadBookings(), 500);
    } catch (err) {
      console.error("rescheduleBooking error:", err);
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to reschedule booking. Please try again."));
      toast.error(getErrorMessage(err, "Failed to reschedule booking"));
    }
  };

  const handleCancel = async (bookingId, reason) => {
    try {
      setError("");

      // Find the booking to get landlord and property info
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) {
        toast.error("Booking not found");
        return;
      }

      // Cancel booking
      const updated = await cancelBooking(bookingId, reason);

      // Update local state immediately
      const updatedBooking = { ...booking, ...updated, status: "cancelled" };
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      // Trigger notifications (in-system + email) for landlord
      try {
        await notifyBookingCancelled({
          booking: updatedBooking,
          landlord: booking.landlord || booking.property?.landlord || { id: booking.property?.landlord_id },
          property: booking.property || { id: booking.propertyId, title: booking.propertyTitle },
          reason,
          sendEmail: true,
        });
      } catch (notifErr) {
        // Don't fail the cancel if notification fails
        console.warn("Notification failed (non-blocking):", notifErr);
      }

      setCancelTarget(null);
      toast.success("Booking cancelled successfully. The landlord has been notified.");

      // Refresh bookings to get latest data
      setTimeout(() => loadBookings(), 500);
    } catch (err) {
      console.error("cancelBooking error:", err);
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to cancel booking. Please try again."));
      toast.error(getErrorMessage(err, "Failed to cancel booking"));
    }
  };


  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    const status = normalizeStatus(b.status);
    if (filter === "pending") return status === "pending";
    if (filter === "scheduled") return status === "scheduled";
    if (filter === "cancelled") return status === "cancelled";
    if (filter === "completed") return status === "completed";
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => normalizeStatus(b.status) === "pending").length,
    scheduled: bookings.filter((b) => normalizeStatus(b.status) === "scheduled").length,
    cancelled: bookings.filter((b) => normalizeStatus(b.status) === "cancelled").length,
    completed: bookings.filter((b) => normalizeStatus(b.status) === "completed").length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your property viewing requests and scheduled bookings
          </p>
        </div>
        <button
          onClick={loadBookings}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          title="Refresh bookings"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${view === "list"
              ? "bg-[#0b6e4f] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            <List size={18} />
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${view === "calendar"
              ? "bg-[#0b6e4f] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            <Calendar size={18} />
            Calendar
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={Calendar} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={CheckCircle} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} color="red" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="emerald" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={18} className="text-gray-600 dark:text-gray-400" />
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
            ? "bg-[#0b6e4f] text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending"
            ? "bg-yellow-500 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("scheduled")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "scheduled"
            ? "bg-green-500 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "cancelled"
            ? "bg-red-500 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          Cancelled
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "completed"
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          Completed
        </button>
      </div>

      {/* View Content */}
      {view === "calendar" ? (
        <BookingsCalendar bookings={bookings} filter={filter} normalizeStatus={normalizeStatus} />
      ) : (
        <BookingListView
          bookings={filteredBookings}
          normalizeStatus={normalizeStatus}
          onReschedule={setRescheduleTarget}
          onCancel={setCancelTarget}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            booking={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onConfirm={handleReschedule}
          />
        )}
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onConfirm={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

// Booking List View Component
function BookingListView({ bookings, normalizeStatus, onReschedule, onCancel }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No bookings match your current filters. Start by requesting a property viewing!
        </p>
        <Link
          to="/tenant/properties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const status = normalizeStatus(booking.status);
        const canReschedule = ["pending", "scheduled", "approved"].includes(status);
        const canCancel = ["pending", "scheduled", "approved"].includes(status);
        const propertyId = booking.property_id || booking.propertyId;
        const scheduledDate = booking.scheduled_date || booking.preferred_date || booking.dateRequested;
        const scheduledTime = booking.scheduled_time;

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 hover:border-[#0b6e4f] transition-colors"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Property Image */}
              {booking.propertyImage && (
                <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={booking.propertyImage}
                    alt={booking.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Booking Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {booking.propertyTitle || "Unknown Property"}
                    </h3>
                    {booking.propertyAddress && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <MapPin size={14} />
                        {booking.propertyAddress}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${status === "scheduled"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        : status === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                      }`}
                  >
                    {booking.status || "pending"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        <span className="font-medium">Scheduled:</span>{" "}
                        {new Date(scheduledDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {scheduledTime && ` at ${scheduledTime}`}
                      </span>
                    </div>
                  )}
                  {booking.landlord && (
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>
                        <span className="font-medium">Landlord:</span>{" "}
                        {booking.landlord.full_name || booking.landlord.name || "Unknown"}
                      </span>
                    </div>
                  )}
                  {booking.message && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm italic text-gray-700 dark:text-gray-300">
                        "{booking.message}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {propertyId && (
                  <Link
                    to={`/tenant/properties/${propertyId}`}
                    className="px-4 py-2 text-sm bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium text-center"
                  >
                    View Property
                  </Link>
                )}
                {canReschedule && (
                  <button
                    onClick={() => onReschedule(booking)}
                    className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Reschedule
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => onCancel(booking)}
                    className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
