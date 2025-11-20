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
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(booking);
      }
    });
    return grouped;
  }, [bookings]);

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return bookingsByDate[dateKey] || [];
  };

  // Custom tile content to show booking indicators
  const tileContent = ({ date, view: tileView }) => {
    if (tileView !== "month") return null;

    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return null;

    const pendingCount = dayBookings.filter((b) => b.status === "requested" || b.status === "pending").length;
    const acceptedCount = dayBookings.filter((b) => b.status === "accepted" || b.status === "approved").length;
    const declinedCount = dayBookings.filter((b) => b.status === "declined" || b.status === "rejected").length;

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

  // Custom tile className for dates with bookings
  const tileClassName = ({ date, view: tileView }) => {
    if (tileView !== "month") return null;

    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return null;

    return "has-bookings";
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, getBookingsForDate(date));
    }
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={20} />
            Booking Calendar
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Accepted</span>
            </div>
            <div className="flex items-center gap-1">
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

        <style>{`
          .react-calendar {
            border: none;
            font-family: inherit;
          }
          .react-calendar__tile {
            padding: 0.5rem;
            position: relative;
          }
          .react-calendar__tile.has-bookings {
            background-color: #f0fdf4;
          }
          .react-calendar__tile--active {
            background: #0b6e4f !important;
            color: white;
          }
          .react-calendar__tile--active.has-bookings {
            background: #095c42 !important;
          }
          .react-calendar__tile:hover {
            background-color: #e0f2e9;
          }
          .react-calendar__navigation button {
            color: #0b6e4f;
            font-weight: 600;
          }
          .react-calendar__navigation button:hover {
            background-color: #e0f2e9;
          }
        `}</style>
      </div>

      {/* Selected Date Bookings */}
      {selectedDateBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Bookings on {format(selectedDate, "MMMM d, yyyy")}
          </h4>
          <div className="space-y-3">
            {selectedDateBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#0b6e4f] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{booking.applicantName || "Unknown"}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {booking.propertyTitle || `Property ID: ${booking.propertyId}`}
                    </div>
                    {booking.phone && (
                      <div className="text-sm text-gray-500 mt-1">Phone: {booking.phone}</div>
                    )}
                    {booking.message && (
                      <div className="text-sm text-gray-600 mt-2 italic">"{booking.message}"</div>
                    )}
                  </div>
                  <div className="ml-4">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

