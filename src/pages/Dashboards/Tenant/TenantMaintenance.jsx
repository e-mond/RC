// src/pages/Dashboards/Tenant/TenantMaintenance.jsx
import React, { useEffect, useState } from "react";
import { getMaintenanceRequests, createMaintenanceRequest } from "@/services/tenantService";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { Wrench, Plus, Camera, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureProtectedRoute from "@/routes/FeatureProtectedRoute";
import ImageUploader from "@/components/landlord/ImageUploader";

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
    return () => { mounted = false; };
  }, []);

  if (!isPremium) {
    return (
      <FeatureProtectedRoute feature="TENANT_MAINTENANCE">
        <div className="p-6"><UpgradePrompt /></div>
      </FeatureProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track and manage your property issues</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          New Request
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <MaintenanceRequestForm
            onClose={() => setShowForm(false)}
            onSuccess={(newRequest) => {
              setRequests((prev) => [newRequest, ...prev]);
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {requests.length === 0 ? (
        <EmptyState onNewRequest={() => setShowForm(true)} />
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {requests.map((request) => (
              <MaintenanceRequestCard key={request.id} request={request} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Premium Form 
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
        if (img instanceof File) payload.append("images", img);
      });

      const result = await createMaintenanceRequest(payload);
      onSuccess(result.request || result);
    } catch (err) {
      setError(err.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">New Maintenance Request</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <XCircle size={24} />
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photos (Optional)</label>
          <ImageUploader
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            multiple
            maxFiles={5}
          />
        </div>

        <div className="flex items-center gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] font-semibold transition shadow-md hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
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
    </motion.div>
  );
}

// Beautiful Request Card
function MaintenanceRequestCard({ request }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", icon: Clock },
    in_progress: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: AlertCircle },
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle },
    cancelled: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", icon: XCircle },
  };

  const status = request.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl dark:hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{request.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{request.description}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 ${config.color}`}>
          <StatusIcon size={16} />
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mb-5">
        <span className="flex items-center gap-2 font-medium">
          <Wrench size={16} />
          Priority: <span className="capitalize">{request.priority || "medium"}</span>
        </span>
        {request.createdAt && (
          <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
        )}
      </div>

      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {request.images.slice(0, 4).map((img, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-lg">
              <img
                src={typeof img === "string" ? img : img.url}
                alt={`Issue ${idx + 1}`}
                className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {idx === 3 && request.images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
                  +{request.images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {request.landlordResponse && (
        <div className="p-4 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Landlord Response:</p>
          <p className="text-blue-800 dark:text-blue-300 text-sm">{request.landlordResponse}</p>
        </div>
      )}
    </motion.div>
  );
}

// Gorgeous Empty & Upgrade States
function EmptyState({ onNewRequest }) {
  return (
    <div className="text-center py-24 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-8">
        <Wrench className="w-14 h-14 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Maintenance Requests</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Submit a request if you need repairs or assistance with your rental.
      </p>
      <button
        onClick={onNewRequest}
        className="inline-flex items-center gap-3 px-8 py-4 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
      >
        <Plus size={24} />
        Create First Request
      </button>
    </div>
  );
}

function UpgradePrompt() {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-28 h-28 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 rounded-full flex items-center justify-center mb-8">
        <Wrench className="w-14 h-14 text-[#0b6e4f]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Premium Feature</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
        Maintenance request tracking is available with a Premium subscription.
      </p>
      <button className="px-8 py-4 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-bold text-lg shadow-lg hover:shadow-xl">
        Upgrade to Premium
      </button>
    </div>
  );
}