// src/components/landlord/BookingsCalendar.jsx
import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-calendar/dist/Calendar.css";

/**
 * BookingsCalendar - Calendar view for viewing requests
 * Shows bookings on their requested dates with status indicators
 */
export default function BookingsCalendar({ bookings = [], onDateClick }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = {};
    bookings.forEach((booking) => {
      if (booking.dateRequested || booking.requestedDate) {
        const dateKey = format(
          new Date(booking.dateRequested || booking.requestedDate),
          "yyyy-MM-dd"
        );
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(booking);
      }
    });
    return grouped;
  }, [bookings]);

  const getBookingsForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return bookingsByDate[dateKey] || [];
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return null;

    const pendingCount = dayBookings.filter((b) => ["requested", "pending"].includes(b.status)).length;
    const acceptedCount = dayBookings.filter((b) => ["accepted", "approved"].includes(b.status)).length;
    const declinedCount = dayBookings.filter((b) => ["declined", "rejected"].includes(b.status)).length;

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {pendingCount > 0 && (
          <div className="h-1 w-full bg-yellow-500 rounded" title={`${pendingCount} pending`} />
        )}
        {acceptedCount > 0 && (
          <div className="h-1 w-full bg-green-500 rounded" title={`${acceptedCount} accepted`} />
        )}
        {declinedCount > 0 && (
          <div className="h-1 w-full bg-red-500 rounded" title={`${declinedCount} declined`} />
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    return getBookingsForDate(date).length > 0 ? "has-bookings" : null;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateClick?.(date, getBookingsForDate(date));
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} />
            Booking Calendar
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Accepted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Declined</span>
            </div>
          </div>
        </div>

        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="w-full border-0"
        />

        <style jsx>{`
          .react-calendar {
            background: transparent;
            font-family: inherit;
            line-height: 1.25;
          }
          .react-calendar__tile {
            padding: 0.75rem 0.5rem;
            position: relative;
          }
          .react-calendar__tile.has-bookings {
            background-color: rgb(240 253 244 / 0.6);
            font-weight: 600;
          }
          .react-calendar__tile--active {
            background: #0b6e4f !important;
            color: white !important;
          }
          .react-calendar__tile--active.has-bookings {
            background: #095c42 !important;
          }
          .react-calendar__tile:hover {
            background-color: #e0f2e9;
          }
          .dark .react-calendar__tile.has-bookings {
            background-color: rgb(34 197 94 / 0.15);
          }
          .dark .react-calendar__tile:hover {
            background-color: rgb(34 197 94 / 0.1);
          }
          .react-calendar__navigation button {
            color: #0b6e4f;
            font-weight: 600;
            font-size: 1rem;
          }
          .react-calendar__navigation button:hover {
            background-color: #e0f2e9;
          }
          .dark .react-calendar__navigation button {
            color: #4ade80;
          }
          .dark .react-calendar__navigation button:hover {
            background-color: rgb(34 197 94 / 0.2);
          }
          .react-calendar__month-view__days__day--weekend {
            color: inherit;
          }
          .dark .react-calendar__tile {
            color: #e5e7eb;
          }
        `}</style>
      </div>

      {/* Selected Date Details */}
      {selectedDateBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bookings on {format(selectedDate, "MMMM d, yyyy")}
          </h4>
          <div className="space-y-4">
            {selectedDateBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#0b6e4f] dark:hover:border-[#0b6e4f] transition-colors bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-base">
                      {booking.applicantName || "Unknown Applicant"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {booking.propertyTitle || `Property ID: ${booking.propertyId}`}
                    </div>
                    {booking.phone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Phone: {booking.phone}
                      </div>
                    )}
                    {booking.message && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic leading-relaxed">
                        "{booking.message}"
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider ${
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}