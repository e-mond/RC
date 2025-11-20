// src/pages/Dashboards/Artisan/Schedule/ArtisanSchedule.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { getSchedule } from "@/services/artisanService";
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import "react-calendar/dist/Calendar.css";

/**
 * ArtisanSchedule - Job scheduling and availability management
 */
export default function ArtisanSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);

        const res = await getSchedule(
          startDate.toISOString(),
          endDate.toISOString()
        );
        if (mounted) {
          setSchedule(res.schedule || res.data || res || []);
        }
      } catch (err) {
        console.error("getSchedule:", err);
        if (mounted) setError(err.message || "Failed to load schedule");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Group schedule by date
  const scheduleByDate = schedule.reduce((acc, item) => {
    const dateKey = format(new Date(item.start || item.assignedDate), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  const getTasksForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return scheduleByDate[dateKey] || [];
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {dayTasks.map((task, idx) => (
          <div
            key={idx}
            className={`h-1 w-full rounded ${
              task.status === "completed"
                ? "bg-green-500"
                : task.status === "in_progress"
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
            title={task.title}
          />
        ))}
      </div>
    );
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[#0f1724]">Job Schedule</h2>
        <p className="text-sm text-gray-600">Manage your task schedule and availability</p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
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
            }
            .react-calendar__tile {
              padding: 0.5rem;
              position: relative;
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
          `}</style>
        </div>

        {/* Selected Date Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-md font-semibold mb-4">
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
    </div>
  );
}

// Task Schedule Item
function TaskScheduleItem({ task }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  };

  const status = task.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 border border-gray-200 rounded-lg hover:border-[#0b6e4f] transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${config.color}`}>
          <StatusIcon size={12} />
        </span>
      </div>
      <p className="text-xs text-gray-600 flex items-center gap-1">
        <MapPin size={12} />
        {task.address || "Address not specified"}
      </p>
      {task.start && task.end && (
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(task.start), "h:mm a")} - {format(new Date(task.end), "h:mm a")}
        </p>
      )}
    </motion.div>
  );
}

