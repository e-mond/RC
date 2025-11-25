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
            className={`h-1.5 w-full rounded-full ${
              task.status === "completed"
                ? "bg-green-500"
                : task.status === "in_progress"
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
            title={task.title || "Task"}
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Job Schedule
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          View and manage your upcoming tasks and availability
        </p>
      </header>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl backdrop-blur-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== Calendar Panel ==================== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon size={24} className="text-[#0b6e4f]" />
                Schedule Calendar
              </h3>

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="custom-calendar w-full"
              locale="en-US"
            />
          </div>
        </motion.div>

        {/* ==================== Selected Date Tasks Panel ==================== */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Date Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/60">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedDateTasks.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <CalendarIcon size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No tasks scheduled
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Enjoy your day off!
                </p>
              </div>
            ) : (
              /* Tasks with smooth enter/exit animations */
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {selectedDateTasks.map((task) => (
                    <TaskScheduleItem key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
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
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl hover:border-[#0b6e4f] transition-all duration-300"
    >
      {/* Title + Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-base">
          {task.title || "Untitled Task"}
        </h4>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${config.color}`}
        >
          <StatusIcon size={14} />
          {config.label}
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