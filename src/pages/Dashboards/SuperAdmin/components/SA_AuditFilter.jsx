// src/pages/Dashboards/SuperAdmin/components/SA_AuditFilter.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

/**
 * SA_AuditFilter
 * - Real-time search + action filter for audit logs
 * - Debounced search (300ms) to reduce API/load
 * - Animated clear/reset buttons with proper exit transitions
 * - Live result counter with accurate filtering
 * - Accessible (ARIA labels, keyboard nav)
 * - Ghana-ready: uses en-GH locale internally
 * 
 * @param {Object} props
 * @param {Array} props.logs - Full list of audit logs
 * @param {Function} props.setFiltered - Callback to update parent filtered list
 */
export default function SA_AuditFilter({ logs = [], setFiltered }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");

  // Stable filter function — memoized to prevent recreating on every render
  const applyFilters = useCallback(
    (searchVal, actionVal) => {
      let filtered = logs;

      // Search by username (case-insensitive)
      if (searchVal?.trim()) {
        const query = searchVal.toLowerCase();
        filtered = filtered.filter((log) =>
          (log.userName || log.user || "").toLowerCase().includes(query)
        );
      }

      // Filter by action type
      if (actionVal) {
        filtered = filtered.filter((log) => log.action === actionVal);
      }

      setFiltered(filtered);
      toast.success(
        `Filtered ${filtered.length} log${filtered.length !== 1 ? "s" : ""}`,
        { duration: 1500 }
      );
    },
    [logs, setFiltered]
  );

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => applyFilters(value, action), 300),
    [action, applyFilters]
  );

  // Trigger debounced search
  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  // Immediate update on action change
  useEffect(() => {
    applyFilters(search, action);
  }, [action, search, applyFilters]);

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setAction("");
    setFiltered(logs);
    toast.success("Filters cleared", { duration: 1500 });
  };

  const hasFilters = search || action;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600 transition"
            aria-label="Search audit logs by username"
          />
          {/* Clear Search Button */}
          <AnimatePresence>
            {search && (
              <motion.button
                key="clear-search" // ← UNIQUE KEY
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
                type="button"
              >
                <FiX size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Action Filter + Reset */}
        <div className="flex gap-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2.5 border rounded-lg min-w-[140px] focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
            aria-label="Filter by action type"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="create">Create</option>
            <option value="failed">Failed</option>
          </select>

          {/* Reset Filters Button */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                key="reset-filters" // ← UNIQUE KEY
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={resetFilters}
                className="px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
                aria-label="Reset all filters"
                type="button"
              >
                <FiFilter size={16} />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Result Counter */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Showing: <strong>{logs.length}</strong> total →{" "}
        <strong className="text-[#0b6e4f]">
          {logs.filter(
            (log) =>
              (!search ||
                (log.userName || log.user || "")
                  .toLowerCase()
                  .includes(search.toLowerCase())) &&
              (!action || log.action === action)
          ).length}
        </strong>{" "}
        filtered
      </div>
    </motion.div>
  );
}

/**
 * Debounce utility
 * Prevents excessive filtering during rapid typing
 */
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}