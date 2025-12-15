// src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx
import React, { useState, useEffect } from "react";
import { fetchBookings, respondBooking } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";
import BookingsCalendar from "@/components/landlord/BookingsCalendar";
import { Calendar, List, Filter, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
        const list = await fetchBookings();
        if (!mounted) return;
        setBookings(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("fetchBookings:", err);
        if (mounted) setError(err.message || "Unable to load bookings");
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
    try {
      await respondBooking(id, action); // ← fixed: was "respond_certBooking"
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: action === "accept" ? "accepted" : "declined" } : b
        )
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
    pending: bookings.filter((b) => ["requested", "pending"].includes(b.status)).length,
    accepted: bookings.filter((b) => ["accepted", "approved"].includes(b.status)).length,
    declined: bookings.filter((b) => ["declined", "rejected"].includes(b.status)).length,
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
        <BookingsCalendar bookings={filteredBookings} />
      ) : (
        <EnhancedBookingList bookings={filteredBookings} onRespond={handleRespond} />
      )}
    </div>
  );
}

// Enhanced Booking List Component (dark-mode ready)
function EnhancedBookingList({ bookings, onRespond }) {
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
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 hover:border-[#0b6e4f] transition-colors"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {booking.applicantName || "Unknown"}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    ["accepted", "approved"].includes(booking.status)
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : ["declined", "rejected"].includes(booking.status)
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                  }`}
                >
                  {booking.status || "pending"}
                </span>
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
                {booking.dateRequested && (
                  <p>
                    <span className="font-medium">Requested:</span>{" "}
                    {new Date(booking.dateRequested).toLocaleString()}
                  </p>
                )}
                {booking.message && (
                  <p className="mt-3 italic text-gray-700 dark:text-gray-300 leading-relaxed">
                    "{booking.message}"
                  </p>
                )}
              </div>
            </div>
            {(booking.status === "requested" || booking.status === "pending") && (
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
      ))}
    </div>
  );
}