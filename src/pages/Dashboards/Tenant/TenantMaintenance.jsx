// src/pages/Dashboards/Tenant/TenantMaintenance.jsx
import React, { useEffect, useState } from "react";
import { getMaintenanceRequests, createMaintenanceRequest } from "@/services/tenantService";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { Wrench, Plus, Camera, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureProtectedRoute from "@/routes/FeatureProtectedRoute";
import ImageUploader from "@/components/landlord/ImageUploader";

/**
 * TenantMaintenance - Maintenance Requests (Premium Feature)
 * - Create maintenance requests
 * - Track request status
 * - Upload photos
 * - Communication with landlord
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
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0f1724]">Maintenance Requests</h2>
          <p className="text-sm text-gray-600">Track and manage your maintenance requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          New Request
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <MaintenanceRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={(newRequest) => {
            setRequests((prev) => [newRequest, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {requests.length === 0 ? (
        <EmptyState onNewRequest={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">New Maintenance Request</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <XCircle size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            placeholder="e.g., Leaking faucet in kitchen"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b6e4f]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
          <ImageUploader
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            multiple
            maxFiles={5}
          />
        </div>

        <div className="flex items-center gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus size={18} />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Maintenance Request Card
function MaintenanceRequestCard({ request }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
  };

  const status = request.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{request.title}</h3>
          <p className="text-sm text-gray-600">{request.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
          <StatusIcon size={14} />
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <Wrench size={14} />
          Priority: <span className="font-medium capitalize">{request.priority || "medium"}</span>
        </span>
        {request.createdAt && (
          <span>
            Created: {new Date(request.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {request.images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={typeof img === "string" ? img : img.url}
              alt={`Request ${idx + 1}`}
              className="w-full h-20 object-cover rounded"
            />
          ))}
        </div>
      )}

      {request.landlordResponse && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium text-blue-900 mb-1">Landlord Response:</p>
          <p className="text-blue-700">{request.landlordResponse}</p>
        </div>
      )}
    </motion.div>
  );
}

// Empty State
function EmptyState({ onNewRequest }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Submit a maintenance request if you need repairs or assistance with your rental property.
      </p>
      <button
        onClick={onNewRequest}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium"
      >
        <Plus size={18} />
        Create Request
      </button>
    </div>
  );
}

// Upgrade Prompt
function UpgradePrompt() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
      <div className="mx-auto w-24 h-24 bg-[#0b6e4f]/10 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-12 h-12 text-[#0b6e4f]" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Feature</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Maintenance request tracking is available with a Premium subscription. Upgrade to access this feature.
      </p>
      <button className="px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium">
        Upgrade to Premium
      </button>
    </div>
  );
}
