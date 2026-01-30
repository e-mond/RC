/**
 * BookArtisanModal
 * 
 * Modal for tenants to book artisan services.
 * Features:
 * - Service type selection
 * - Description of work
 * - Preferred date and time
 * - Address/location input
 * - Form validation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, FileText, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { bookArtisan } from "@/services/tenantService";
import { createNotification } from "@/services/notificationService";

const SERVICE_TYPES = {
  plumber: ["Pipe Repair", "Drain Cleaning", "Faucet Installation", "Water Heater", "Other"],
  electrician: ["Wiring", "Light Installation", "Outlet Repair", "Panel Upgrade", "Other"],
  carpenter: ["Furniture Repair", "Cabinet Making", "Door Installation", "Shelving", "Other"],
  mason: ["Wall Repair", "Plastering", "Tiling", "Foundation Work", "Other"],
  painter: ["Interior Painting", "Exterior Painting", "Wall Prep", "Decorative Finish", "Other"],
  welder: ["Gate Repair", "Metal Fabrication", "Railings", "Security Doors", "Other"],
  tiler: ["Floor Tiling", "Wall Tiling", "Bathroom Renovation", "Kitchen Backsplash", "Other"],
  default: ["General Repair", "Installation", "Maintenance", "Consultation", "Other"],
};

export default function BookArtisanModal({ artisan, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const professionKey = artisan?.profession?.toLowerCase().replace(/\s+/g, "") || "default";
  const serviceOptions = SERVICE_TYPES[professionKey] || SERVICE_TYPES.default;

  const validate = () => {
    const newErrors = {};
    
    if (!form.serviceType) {
      newErrors.serviceType = "Please select a service type";
    }
    if (!form.description.trim()) {
      newErrors.description = "Please describe the work needed";
    }
    if (form.description.trim().length < 20) {
      newErrors.description = "Please provide more details (at least 20 characters)";
    }
    if (!form.preferredDate) {
      newErrors.preferredDate = "Please select a preferred date";
    }
    if (!form.address.trim()) {
      newErrors.address = "Please provide the service location";
    }
    
    // Date must be in the future
    const selectedDate = new Date(form.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.preferredDate = "Please select a future date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      await bookArtisan({
        artisan_id: artisan.id || artisan._id,
        service_type: form.serviceType,
        description: form.description.trim(),
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime || null,
        address: form.address.trim(),
      });

      // Create notification for self
      try {
        await createNotification({
          type: "artisan_booking_created",
          title: "Artisan Booking Submitted",
          message: `Your booking request for ${artisan.fullName || artisan.name} (${artisan.profession || "Service Provider"}) has been submitted. You'll be notified when they respond.`,
          actionUrl: "/tenant/artisan-bookings",
        });
      } catch (notifErr) {
        console.warn("Failed to create notification:", notifErr);
      }

      onSuccess?.();
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.message || "Failed to book artisan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      serviceType: "",
      description: "",
      preferredDate: "",
      preferredTime: "",
      address: "",
    });
    setErrors({});
    onClose();
  };

  // Minimum date is today
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 p-5 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Book Service
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Artisan Info */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0b6e4f] flex items-center justify-center text-white text-xl font-semibold">
                {(artisan.fullName || artisan.name)?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {artisan.fullName || artisan.name || "Unknown Artisan"}
                </h3>
                <p className="text-[#0b6e4f] text-sm font-medium">
                  {artisan.profession || "Service Provider"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
              >
                <option value="">Select service type...</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.serviceType}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description of Work <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the work you need done..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.preferredDate}
                  min={minDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
                />
                {errors.preferredDate && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.preferredDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Preferred Time
                </label>
                <select
                  value={form.preferredTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 5pm)</option>
                  <option value="evening">Evening (5pm - 8pm)</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1" />
                Service Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter the address where service is needed..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.address}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0b6e4f] hover:bg-[#095c42] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Book Artisan
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
