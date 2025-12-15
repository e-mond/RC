// src/pages/Dashboards/Artisan/Schedule/ArtisanSchedule.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { getSchedule } from "@/services/artisanService";

// Lucide Icons
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// CRITICAL: motion + AnimatePresence both imported
// Without AnimatePresence → "ReferenceError: AnimatePresence is not defined"
import { motion, AnimatePresence } from "framer-motion";

import "react-calendar/dist/Calendar.css";

/**
 * ArtisanSchedule - Premium Job Scheduling Dashboard
 * Features:
 * • Full dark mode support with glassmorphism
 * • Smooth task animations when switching dates
 * • Visual indicators on calendar (colored dots + count)
 * • Responsive layout (mobile → desktop)
 * • Error handling & loading states
 */
export default function ArtisanSchedule() {
  // Current selected date on the calendar
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Full schedule data from API
  const [schedule, setSchedule] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ========================================
     Fetch schedule data (past 1 month → next 2 months)
     ======================================== */
  useEffect(() => {
    let mounted = true;

    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError("");

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // 1 month back

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2); // 2 months forward

        const response = await getSchedule(
          startDate.toISOString(),
          endDate.toISOString()
        );

        if (mounted) {
          // Handle various API response shapes
          const data = response?.schedule || response?.data || response || [];
          setSchedule(data);
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
        if (mounted) {
          setError(err.message || "Unable to load your schedule");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSchedule();

    // Cleanup: prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  /* ========================================
     Group tasks by date (yyyy-MM-dd) for fast lookup
     ======================================== */
  const scheduleByDate = schedule.reduce((acc, item) => {
    const dateKey = format(
      new Date(item.start || item.assignedDate),
      "yyyy-MM-dd"
    );
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  // Helper: get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return scheduleByDate[dateKey] || [];
  };

  /* ========================================
     Calendar tile content – shows colored dots
     ======================================== */
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {/* Show up to 4 colored dots */}
        {dayTasks.slice(0, 4).map((task, idx) => (
          <div
            key={idx}
            className={`h-1 w-full rounded ${task.status === "completed"
              ? "bg-green-500"
              : task.status === "in_progress"
                ? "bg-blue-500"
                : "bg-yellow-500"
              }`}
            title={task.title}
          />
        ))}
        {/* Show "+X" if more than 4 tasks */}
        {dayTasks.length > 4 && (
          <div className="text-[10px] text-center text-gray-600 dark:text-gray-400 font-medium">
            +{dayTasks.length - 4}
          </div>
        )}
      </div>
    );
  };

  // Tasks for the currently selected date
  const selectedDateTasks = getTasksForDate(selectedDate);

  /* ========================================
     Loading State
     ======================================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  /* ========================================
     Main Render
     ======================================== */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Schedule</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your task schedule and availability</p>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <CalendarIcon size={20} />
              Schedule Calendar
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            className="w-full border-0"
          />

          <style>{`
            .react-calendar {
              border: none;
              font-family: inherit;
              background: transparent;
              width: 100%;
            }
            .react-calendar__tile {
              padding: 0.5rem;
              position: relative;
              color: inherit;
            }
            .react-calendar__tile--active {
              background: #0b6e4f !important;
              color: white;
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
            .react-calendar__month-view__weekdays {
              color: inherit;
            }
            .react-calendar__month-view__days__day {
              color: inherit;
            }
            .react-calendar__month-view__days__day--neighboringMonth {
              color: #9ca3af;
            }
            /* Dark mode styles */
            .dark .react-calendar {
              color: white;
            }
            .dark .react-calendar__tile:hover {
              background-color: #374151;
            }
            .dark .react-calendar__navigation button:hover {
              background-color: #374151;
            }
            .dark .react-calendar__month-view__days__day--neighboringMonth {
              color: #6b7280;
            }
          `}</style>
        </div>

        {/* Selected Date Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">
            Tasks on {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map((task) => (
                <TaskScheduleItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================== Custom Calendar Styling ==================== */}
      <style jsx>{`
        .custom-calendar {
          background: transparent;
          font-family: inherit;
          line-height: 1.5;
        }
        .custom-calendar .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        .custom-calendar .react-calendar__navigation button {
          color: #0b6e4f;
          font-weight: 600;
          font-size: 1rem;
          background: none;
          border-radius: 8px;
        }
        .custom-calendar .react-calendar__navigation button:hover {
          background-color: #e0f2e9;
          color: #095c42;
        }
        .custom-calendar .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .custom-calendar .react-calendar__tile {
          padding: 0.75rem 0.5rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        .custom-calendar .react-calendar__tile:hover {
          background-color: #e0f2e9;
          transform: translateY(-2px);
        }
        .custom-calendar .react-calendar__tile--now {
          background: #0b6e4f10;
          font-weight: bold;
        }
        .custom-calendar .react-calendar__tile--active {
          background: #0b6e4f !important;
          color: white !important;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(11, 110, 79, 0.3);
        }

        /* Dark Mode Overrides */
        .dark .custom-calendar .react-calendar__navigation button:hover {
          background-color: #095c4230;
        }
        .dark .custom-calendar .react-calendar__tile:hover {
          background-color: #095c4240;
        }
        .dark .custom-calendar .react-calendar__tile--now {
          background: #095c4230;
        }
      `}</style>
    </div>
  );
}

/* ========================================
   Task Card Component (Individual Task)
   ======================================== */
function TaskScheduleItem({ task }) {
  const statusConfig = {
    pending: {
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      icon: Clock,
      label: "Pending",
    },
    in_progress: {
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      icon: AlertCircle,
      label: "In Progress",
    },
    completed: {
      color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      icon: CheckCircle,
      label: "Completed",
    },
  };

  const status = task.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#0b6e4f] transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h4>
        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${config.color}`}>
          <StatusIcon size={12} />
        </span>
      </div>

      {/* Location */}
      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
        <MapPin size={16} className="text-[#0b6e4f]" />
        {task.address || "Location not specified"}
      </p>

      {/* Time Range */}
      {task.start && task.end && (
        <p className="text-gray-500 dark:text-gray-500 flex items-center gap-2 text-sm mt-2">
          <Clock size={16} />
          {format(new Date(task.start), "h:mm a")} →{" "}
          {format(new Date(task.end), "h:mm a")}
        </p>
      )}
    </motion.div>
  );
}