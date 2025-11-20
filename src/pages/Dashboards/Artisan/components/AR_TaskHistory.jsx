// src/pages/Dashboards/Artisan/components/AR_TaskHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchArtisanTasks } from "@/services/artisanService";
import { CheckCircle, Clock, XCircle, MapPin, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/**
 * AR_TaskHistory - Completed and cancelled tasks
 */
export default function AR_TaskHistory() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchArtisanTasks({ status: "completed" });
        if (mounted) {
          const allTasks = res.tasks || res.data || res || [];
          // Also get cancelled tasks
          const cancelledRes = await fetchArtisanTasks({ status: "cancelled" }).catch(() => ({ tasks: [] }));
          const cancelledTasks = cancelledRes.tasks || [];
          setTasks([...allTasks, ...cancelledTasks]);
        }
      } catch (err) {
        console.error("fetchArtisanTasks:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="font-semibold mb-4">Task History</h3>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="font-semibold mb-4">Task History</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No completed tasks yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="font-semibold mb-4">Task History</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/artisan/tasks/${task.id}`)}
            className="p-4 border border-gray-200 rounded-lg hover:border-[#0b6e4f] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={12} />
                  {task.address}
                </p>
                {task.completedDate && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    Completed: {new Date(task.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {task.payment && (
                <div className="text-right">
                  <p className="font-semibold text-[#0b6e4f] flex items-center gap-1">
                    <DollarSign size={16} />
                    ₵{task.payment.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
