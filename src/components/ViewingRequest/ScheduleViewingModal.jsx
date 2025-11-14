import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MessageSquare, Phone } from "lucide-react";
import { createViewingRequest } from "@/services/propertyService";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ScheduleViewingModal({ property, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    preferred_date: "",
    preferred_time: "",
    alternative_date: "",
    alternative_time: "",
    message: "",
    contact_phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can schedule viewings");
      return;
    }

    // Combine date and time
    const preferredDateTime = formData.preferred_date && formData.preferred_time
      ? `${formData.preferred_date}T${formData.preferred_time}:00`
      : null;

    const alternativeDateTime = formData.alternative_date && formData.alternative_time
      ? `${formData.alternative_date}T${formData.alternative_time}:00`
      : null;

    if (!preferredDateTime) {
      setError("Please select a preferred date and time");
      return;
    }

    setLoading(true);
    try {
      await createViewingRequest({
        property: property.id,
        preferred_date: preferredDateTime,
        alternative_date: alternativeDateTime || null,
        message: formData.message,
        contact_phone: formData.contact_phone,
      });
      onSuccess?.();
      onClose();
      setFormData({
        preferred_date: "",
        preferred_time: "",
        alternative_date: "",
        alternative_time: "",
        message: "",
        contact_phone: user?.phone || "",
      });
    } catch (err) {
      setError(err.message || "Failed to schedule viewing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Schedule Property Viewing</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{property?.title}</h3>
              <p className="text-gray-600">{property?.address}, {property?.city}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Date (Optional)
                </label>
                <input
                  type="date"
                  name="alternative_date"
                  value={formData.alternative_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Time (Optional)
                </label>
                <input
                  type="time"
                  name="alternative_time"
                  value={formData.alternative_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+233XXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional information or questions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Viewing"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

