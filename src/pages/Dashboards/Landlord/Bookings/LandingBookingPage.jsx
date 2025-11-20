// src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx
import React, { useState, useEffect } from "react";
import { fetchBookings, respondBooking } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";
import BookingsCalendar from "@/components/landlord/BookingsCalendar";
import { Calendar, List, Filter, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

/**
 * LandingBookingPage - Full booking management page
 * - Calendar view
 * - List view with filters
 * - Approval/rejection workflow
 */
export default function LandingBookingPage() {
  const user = useAuthStore((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("calendar"); // 'calendar' or 'list'
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'accepted', 'declined'

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchBookings(user?.id);
        if (!mounted) return;
        setBookings(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("fetchBookings:", err);
        if (mounted) setError(err.message || "Unable to load bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user?.id) load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleRespond = async (id, action) => {
    try {
      await respondBooking(id, action);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: action === "accept" ? "accepted" : "declined" } : b))
      );
    } catch (err) {
      console.error("respondBooking:", err);
      setError(err.message || "Action failed");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    const status = b.status?.toLowerCase();
    if (filter === "pending") return status === "requested" || status === "pending";
    if (filter === "accepted") return status === "accepted" || status === "approved";
    if (filter === "declined") return status === "declined" || status === "rejected";
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "requested" || b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted" || b.status === "approved").length,
    declined: bookings.filter((b) => b.status === "declined" || b.status === "rejected").length,
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
          <h2 className="text-2xl font-bold text-[#0f1724]">Booking Requests</h2>
          <p className="text-sm text-gray-600">Manage viewing and booking requests for your properties</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              view === "calendar"
                ? "bg-[#0b6e4f] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <List size={18} />
            List
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={18} className="text-gray-600" />
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#0b6e4f] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("accepted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "accepted"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter("declined")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "declined"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Declined
        </button>
      </div>

      {/* View Content */}
      {view === "calendar" ? (
        <BookingsCalendar
          bookings={filteredBookings}
          onDateClick={(date, dayBookings) => {
            console.log("Selected date:", date, "Bookings:", dayBookings);
          }}
        />
      ) : (
        <EnhancedBookingList bookings={filteredBookings} onRespond={handleRespond} />
      )}
    </div>
  );
}

// Enhanced Booking List Component
function EnhancedBookingList({ bookings, onRespond }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
        <p className="text-gray-600">No booking requests match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-[#0b6e4f] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{booking.applicantName || "Unknown"}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "accepted" || booking.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "declined" || booking.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status || "pending"}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Property:</span> {booking.propertyTitle || `ID: ${booking.propertyId}`}
                </p>
                {booking.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {booking.phone}
                  </p>
                )}
                {booking.dateRequested && (
                  <p>
                    <span className="font-medium">Requested:</span>{" "}
                    {new Date(booking.dateRequested).toLocaleString()}
                  </p>
                )}
                {booking.message && (
                  <p className="mt-2 italic text-gray-700">"{booking.message}"</p>
                )}
              </div>
            </div>
            {(booking.status === "requested" || booking.status === "pending") && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onRespond(booking.id, "decline")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => onRespond(booking.id, "accept")}
                  className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] font-medium transition-colors"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
