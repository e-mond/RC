// src/pages/Dashboards/Tenant/TenantMaintenance.jsx
import React, { useEffect, useState } from "react";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
} from "@/services/tenantService";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Crown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/landlord/ImageUploader";

export default function TenantMaintenance() {
  const { isPremium } = useFeatureAccess();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Replace with your real Paystack public key
  const PAYSTACK_PUBLIC_KEY = "pk_test_your_actual_key_here"; // Use pk_live_... in production
  const amountInKobo = 2900; // GHS 29.00

  // Load Paystack script only once
  useEffect(() => {
    if (paystackLoaded) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      setMessage({ text: "Failed to load payment system", type: "error" });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paystackLoaded]);

  // Load maintenance requests only for premium users
  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMaintenanceRequests();
        if (mounted) {
          const list = Array.isArray(data) ? data : data?.results || data?.data || [];
          setRequests(list);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setRequests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [isPremium]);

  // Handle Upgrade with Paystack
  const handleUpgrade = () => {
    if (!paystackLoaded) {
      setMessage({ text: "Payment system loading... please wait", type: "error" });
      return;
    }

    setPaymentLoading(true);
    setMessage({ text: "", type: "" });

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: "user@example.com", // In real app, get from user profile
      amount: amountInKobo,
      currency: "GHS",
      ref: `rc_maintenance_${Date.now()}`,
      callback: (response) => {
        // In real app: verify on backend
        console.log("Payment successful:", response);
        setMessage({ text: "Upgrade successful! 🎉 You now have Premium access.", type: "success" });
        // Refresh page or update context/store to reflect premium status
        window.location.reload(); // Simple way for demo
      },
      onClose: () => {
        setPaymentLoading(false);
        setMessage({ text: "Payment cancelled", type: "error" });
      },
    });

    handler.openIframe();
  };

  // Freemium → upgrade prompt with real payment
  if (!isPremium) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-[#0b6e4f] rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mb-6">
            Available on Premium plans only
          </p>

          {message.text && (
            <div
              className={`p-3 rounded-xl text-sm mb-4 border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={paymentLoading}
            className="px-6 py-2 text-sm bg-[#0b6e4f] text-white rounded-xl flex items-center gap-2 mx-auto disabled:opacity-70"
          >
            {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upgrade to Premium
          </button>

          <p className="text-xs text-gray-400 mt-4">
            GHS 29.00 one-time (demo)
          </p>
        </div>
      </div>
    );
  }

  // Loading state for premium users
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#0b6e4f]" />
            Maintenance Requests
          </h2>
          <p className="text-sm text-gray-500">Report and track repair issues</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#0b6e4f] text-white text-sm rounded-xl flex items-center gap-2"
        >
          <Plus size={14} /> New Request
        </button>
      </header>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MaintenanceRequestForm
            onClose={() => setShowForm(false)}
            onSuccess={(req) => {
              setRequests((prev) => [req, ...prev]);
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* List or Empty */}
      {requests.length === 0 ? (
        <EmptyState onNewRequest={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <MaintenanceRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}

// ========================
// FORM - SIMPLE & COMPACT
// ========================
function MaintenanceRequestForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("priority", formData.priority);
      formData.images.forEach((img) => {
        if (img instanceof File) payload.append("images", img);
      });

      const res = await createMaintenanceRequest(payload);
      onSuccess(res.request || res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">New Request</h3>
          <button onClick={onClose}>
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f]"
          />

          <textarea
            rows={4}
            placeholder="Describe the issue"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f] resize-none"
          />

          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b6e4f]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Photos (optional)</label>
            <ImageUploader
              value={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              multiple
              maxFiles={5}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-[#0b6e4f] text-white rounded-xl flex items-center gap-2 disabled:opacity-70"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ========================
// CARD - SIMPLE
// ========================
function MaintenanceRequestCard({ request }) {
  const statusMap = {
    pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
    in_progress: { icon: AlertCircle, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    completed: { icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    cancelled: { icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  };

  const status = (request.status || "pending").toLowerCase();
  const { icon: Icon, color } = statusMap[status] || statusMap.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {request.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {request.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="capitalize">{request.priority || "medium"}</span>
            {request.createdAt && (
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${color}`}>
          <Icon size={14} />
          {status.replace("_", " ")}
        </span>
      </div>

      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {request.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={typeof img === "string" ? img : img.url || img.preview}
              alt="issue"
              className="w-full h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ========================
// EMPTY STATE - SIMPLE
// ========================
function EmptyState({ onNewRequest }) {
  return (
    <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
      <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        No requests yet
      </h3>
      <p className="text-sm text-gray-500 mb-4">Everything is working fine</p>
      <button
        onClick={onNewRequest}
        className="px-5 py-2 text-sm bg-[#0b6e4f] text-white rounded-xl flex items-center gap-2 mx-auto"
      >
        <Plus size={14} /> New Request
      </button>
    </div>
  );
}