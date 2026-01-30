// src/pages/Dashboards/Tenant/components/UpcomingBookingsList.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, User, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

/**
 * UpcomingBookingsList - Displays scheduled bookings on tenant dashboard
 */
export default function UpcomingBookingsList({ bookings = [], loading = false }) {
  // Normalize status for filtering
  const normalizeStatus = (status) => {
    if (!status) return "pending";
    const s = String(status).toLowerCase();
    if (["requested", "pending"].includes(s)) return "pending";
    if (["accepted", "approved", "scheduled"].includes(s)) return "scheduled";
    return s;
  };

  // Filter to only show scheduled/approved bookings
  const scheduledBookings = bookings.filter((b) => {
    const status = normalizeStatus(b.status);
    return ["scheduled", "approved", "accepted"].includes(status);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (scheduledBookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Scheduled Bookings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You don't have any scheduled property viewings yet.
        </p>
        <Link
          to="/tenant/properties"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium"
        >
          Browse Properties
          <ExternalLink size={16} />
        </Link>
      </div>
    );
  }

  // Show next 3 upcoming bookings
  const upcomingBookings = scheduledBookings.slice(0, 3);

  return (
    <div className="space-y-4">
      {upcomingBookings.map((booking, index) => {
        const propertyId = booking.property_id || booking.propertyId;
        const scheduledDate = booking.scheduled_date || booking.preferred_date || booking.dateRequested;
        const scheduledTime = booking.scheduled_time;

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="shrink-0 w-12 h-12 bg-[#0b6e4f] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {booking.propertyTitle || "Unknown Property"}
              </h4>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {scheduledDate && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>
                      {format(new Date(scheduledDate), "EEEE, MMMM d, yyyy")}
                      {scheduledTime && ` at ${scheduledTime}`}
                    </span>
                  </div>
                )}
                {booking.propertyAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{booking.propertyAddress}</span>
                  </div>
                )}
                {booking.landlord && (
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{booking.landlord.full_name || booking.landlord.name || "Unknown Landlord"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {propertyId && (
                <Link
                  to={`/tenant/properties/${propertyId}`}
                  className="px-3 py-1.5 text-xs bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium text-center"
                >
                  View
                </Link>
              )}
              <Link
                to="/tenant/bookings"
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-center"
              >
                Manage
              </Link>
            </div>
          </motion.div>
        );
      })}

      {scheduledBookings.length > 3 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/tenant/bookings"
            className="flex items-center justify-center gap-2 text-sm text-[#0b6e4f] hover:text-[#095c42] dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
          >
            View all {scheduledBookings.length} scheduled bookings
            <ExternalLink size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
