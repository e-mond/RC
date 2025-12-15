// src/pages/Dashboards/Artisan/ArtisanTasks.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchArtisanTasks } from "@/services/artisanService";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  DollarSign,
  Loader2,
  Briefcase,
  Timer,
  Calendar,
  AlertOctagon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ArtisanTasks - Premium Task Management Dashboard
 * Full dark mode + glassmorphism + smooth animations
 */
export default function ArtisanTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
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
          let taskList = res?.tasks || res?.data || res || [];

          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            taskList = taskList.filter(
              (t) =>
                t.title?.toLowerCase().includes(query) ||
                t.address?.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
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
    return () => { mounted = false; };
  }, [filter, priorityFilter, searchQuery]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Manage and track all your assigned maintenance jobs
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

      {/* Stats Cards - Gradient + Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Tasks" value={stats.total} icon={Briefcase} gradient="from-blue-500 to-blue-600" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} gradient="from-amber-500 to-amber-600" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Timer} gradient="from-indigo-500 to-indigo-600" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} gradient="from-emerald-500 to-emerald-600" />
      </div>

      {/* Filters - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, address, or description..."
              className="w-full pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter size={20} />
              <span className="text-sm font-medium">Filter:</span>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyTasksState searchQuery={searchQuery} filter={filter} priorityFilter={priorityFilter} />
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => navigate(`/artisan/tasks/${task.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Premium Gradient Stats Card
function StatsCard({ title, value, icon: Icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale:  1.03 }}
      className={`bg-linear-to-br ${gradient} p-6 rounded-2xl shadow-lg text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {Icon && <Icon size={32} className="opacity-80" />}
      </div>
    </motion.div>
  );
}

// Premium Task Card with Glassmorphism
function TaskCard({ task, index, onClick }) {
  const statusConfig = {
    pending: { color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", icon: Clock, label: "Pending" },
    in_progress: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", icon: Timer, label: "In Progress" },
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: CheckCircle, label: "Completed" },
  };

  const priorityConfig = {
    low: "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300",
    medium: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    high: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    urgent: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-500/50",
  };

  const status = task.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, x: 10 }}
      onClick={onClick}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-2xl hover:border-[#0b6e4f] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {task.title || "Untitled Task"}
            </h3>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${config.color}`}>
              <StatusIcon size={16} />
              {config.label}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${priorityConfig[task.priority || "medium"]}`}>
              {task.priority ? task.priority.toUpperCase() : "MEDIUM"}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-[#0b6e4f]" />
            {task.address || "No location specified"}
          </p>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-6 text-sm">
          {task.propertyTitle && (
            <span className="text-gray-600 dark:text-gray-400">
              Property: <span className="font-medium text-gray-900 dark:text-white">{task.propertyTitle}</span>
            </span>
          )}
          {task.estimatedHours && (
            <span className="text-gray-600 dark:text-gray-400">
              Est. Time: <span className="font-medium text-gray-900 dark:text-white">{task.estimatedHours}h</span>
            </span>
          )}
          {task.dueDate && (
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar size={16} />
              Due: <span className="font-medium text-gray-900 dark:text-white">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </span>
          )}
        </div>

        {task.payment > 0 && (
          <div className="flex items-center gap-2 text-2xl font-bold text-[#0b6e4f]">
            <DollarSign size={28} />
            ₵{task.payment.toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Beautiful Empty State
function EmptyTasksState({ searchQuery, filter, priorityFilter }) {
  const hasActiveFilter = searchQuery || filter !== "all" || priorityFilter !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <AlertOctagon size={64} className="text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {hasActiveFilter ? "No Tasks Match Your Filters" : "No Tasks Assigned Yet"}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {hasActiveFilter
          ? "Try adjusting your search or filters to see more tasks."
          : "You currently have no assigned tasks. New jobs will appear here when assigned!"}
      </p>
    </motion.div>
  );
}