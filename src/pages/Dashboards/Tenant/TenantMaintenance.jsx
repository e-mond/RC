// src/pages/Dashboards/Tenant/TenantMaintenance.jsx
import React, { useEffect, useState } from "react";
import { getMaintenanceRequests, createMaintenanceRequest } from "@/services/tenantService";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { Wrench, Plus, Camera, Clock, CheckCircle, XCircle, AlertCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureProtectedRoute from "@/routes/FeatureProtectedRoute";
import ImageUploader from "@/components/landlord/ImageUploader";

/**
 * TenantMaintenance - Maintenance Requests (Premium Feature)
 */
export default function TenantMaintenance() {
  const { isPremium } = useFeatureAccess();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMaintenanceRequests();
        if (mounted) setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getMaintenanceRequests:", err);
        if (mounted) setError(err.message || "Failed to load maintenance requests");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!isPremium) {
    return (
      <FeatureProtectedRoute feature="TENANT_MAINTENANCE">
        <div className="p-6">
          <UpgradePrompt />
        </div>
      </FeatureProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Maintenance Requests
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your maintenance requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">New</span>
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {/* New Request Form Modal/Overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <MaintenanceRequestForm
                onClose={() => setShowForm(false)}
                onSuccess={(newRequest) => {
                  setRequests((prev) => [newRequest, ...prev]);
                  setShowForm(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {requests.length === 0 ? (
        <EmptyState onNewRequest={() => setShowForm(true)} />
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <AnimatePresence>
            {requests.map((request) => (
              <MaintenanceRequestCard key={request.id} request={request} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Maintenance Request Form
function MaintenanceRequestForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    propertyId: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("priority", formData.priority);
      if (formData.propertyId) payload.append("propertyId", formData.propertyId);

      formData.images.forEach((img) => {
        if (img instanceof File) {
          payload.append("images", img);
        }
      });

      const result = await createMaintenanceRequest(payload);
      onSuccess(result.request || result);
    } catch (err) {
      console.error("createMaintenanceRequest:", err);
      setError(err.message || "Failed to create maintenance request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          New Maintenance Request
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Close"
        >
          <X size={24} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., Leaking faucet in kitchen"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photos (Optional - up to 5)
          </label>
          <ImageUploader
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            multiple
            maxFiles={5}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus size={20} />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Maintenance Request Card
function MaintenanceRequestCard({ request }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", icon: Clock },
    in_progress: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", icon: AlertCircle },
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: CheckCircle },
    cancelled: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", icon: XCircle },
  };

  const status = request.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            {request.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {request.description}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}>
          <StatusIcon size={16} />
          {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <span className="flex items-center gap-1.5">
          <Wrench size={16} />
          Priority:{" "}
          <span className="font-medium capitalize">{request.priority || "medium"}</span>
        </span>
        {request.createdAt && (
          <span className="text-gray-500 dark:text-gray-500">
            • {new Date(request.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {request.images.slice(0, 8).map((img, idx) => (
            <img
              key={idx}
              src={typeof img === "string" ? img : img.url || URL.createObjectURL(img)}
              alt={`Issue ${idx + 1}`}
              className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
            />
          ))}
          {request.images.length > 8 && (
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
              +{request.images.length - 8} more
            </div>
          )}
        </div>
      )}

      {request.landlordResponse && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
            Landlord Response:
          </p>
          <p className="text-blue-800 dark:text-blue-400 text-sm">
            {request.landlordResponse}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Empty State
function EmptyState({ onNewRequest }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 sm:p-16 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-8">
        <Wrench className="w-14 h-14 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Maintenance Requests Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base">
        Submit a request if you need repairs or assistance with your rental property.
      </p>
      <button
        onClick={onNewRequest}
        className="inline-flex items-center gap-3 px-8 py-4 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-medium shadow-lg text-lg"
      >
        <Plus size={22} />
        Create Your First Request
      </button>
    </div>
  );
}

// Upgrade Prompt
function UpgradePrompt() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 sm:p-16 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-28 h-28 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 rounded-full flex items-center justify-center mb-8">
        <Wrench className="w-14 h-14 text-[#0b6e4f]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Premium Feature
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base">
        Maintenance request tracking is available with a Premium subscription. Upgrade to access this powerful tool.
      </p>
      <button className="px-8 py-4 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-medium shadow-lg text-lg">
        Upgrade to Premium
      </button>
    </div>
  );
}