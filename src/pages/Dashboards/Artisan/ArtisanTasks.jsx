// src/pages/Dashboards/Artisan/ArtisanTasks.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchArtisanTasks } from "@/services/artisanService";
import { Filter, Search, Clock, CheckCircle, AlertCircle, MapPin, DollarSign, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ArtisanTasks Page - Enhanced Task Management
 * - Task list with filters
 * - Status updates
 * - Task details navigation
 */
export default function ArtisanTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'in_progress', 'completed'
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const filters = {};
        if (filter !== "all") filters.status = filter;
        if (priorityFilter !== "all") filters.priority = priorityFilter;

        const res = await fetchArtisanTasks(filters);
        if (mounted) {
          let taskList = res.tasks || res.data || res || [];
          // Client-side search
          if (searchQuery) {
            taskList = taskList.filter(
              (t) =>
                t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setTasks(taskList);
        }
      } catch (err) {
        console.error("fetchArtisanTasks:", err);
        if (mounted) setError(err.message || "Failed to load tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [filter, priorityFilter, searchQuery]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your assigned maintenance tasks</p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Tasks" value={stats.total} color="bg-blue-500" />
        <StatsCard title="Pending" value={stats.pending} color="bg-yellow-500" />
        <StatsCard title="In Progress" value={stats.inProgress} color="bg-blue-600" />
        <StatsCard title="Completed" value={stats.completed} color="bg-green-500" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <EmptyTasksState />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/artisan/tasks/${task.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color.replace("bg-", "text-")}`}>{value}</p>
    </motion.div>
  );
}

// Task Card Component
function TaskCard({ task, onClick }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
    in_progress: { color: "bg-blue-100 text-blue-700", icon: AlertCircle, label: "In Progress" },
    completed: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Completed" },
  };

  const priorityConfig = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const status = task.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{task.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
              <StatusIcon size={14} />
              {config.label}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[task.priority] || priorityConfig.medium}`}>
              {task.priority || "medium"}
            </span>
          </div>
          <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
            <MapPin size={14} />
            {task.address || "Address not specified"}
          </p>
          {task.description && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {task.propertyTitle && (
            <span>
              <span className="font-medium">Property:</span> {task.propertyTitle}
            </span>
          )}
          {task.estimatedHours && (
            <span>
              <span className="font-medium">Est. Time:</span> {task.estimatedHours}h
            </span>
          )}
          {task.dueDate && (
            <span>
              <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.payment && (
          <div className="flex items-center gap-1 text-lg font-bold text-[#0b6e4f]">
            <DollarSign size={18} />
            ₵{task.payment.toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Empty State
function EmptyTasksState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        You don't have any tasks matching your current filters. Check back later for new assignments.
      </p>
    </div>
  );
}
