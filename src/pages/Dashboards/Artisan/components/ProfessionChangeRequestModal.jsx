/**
 * ProfessionChangeRequestModal
 * 
 * Modal for artisans to submit a profession change request.
 * Includes:
 * - New profession selection
 * - Reason for change
 * - Supporting documents upload
 * - Current request status display
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Upload, Loader2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import {
  submitProfessionChangeRequest,
  getProfessionChangeRequestStatus,
  cancelProfessionChangeRequest,
} from "@/services/artisanService";
import { createNotification } from "@/services/notificationService";

const PROFESSION_OPTIONS = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Mason",
  "Painter",
  "Welder",
  "Tiler",
  "Roofer",
  "HVAC Technician",
  "Landscaper",
  "General Handyman",
  "Other",
];

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    label: "Pending Review",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    label: "Rejected",
  },
};

export default function ProfessionChangeRequestModal({ open, onClose, currentProfession, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  
  const [form, setForm] = useState({
    newProfession: "",
    customProfession: "",
    reason: "",
    documents: [],
  });
  const [errors, setErrors] = useState({});

  // Load existing request status
  useEffect(() => {
    if (open) {
      loadExistingRequest();
    }
  }, [open]);

  const loadExistingRequest = async () => {
    try {
      setLoading(true);
      const request = await getProfessionChangeRequestStatus();
      setExistingRequest(request);
    } catch (err) {
      console.error("Failed to load existing request:", err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const profession = form.newProfession === "Other" ? form.customProfession.trim() : form.newProfession;
    
    if (!profession) {
      newErrors.profession = "Please select a new profession";
    }
    if (profession.toLowerCase() === currentProfession?.toLowerCase()) {
      newErrors.profession = "New profession must be different from your current profession";
    }
    if (!form.reason.trim()) {
      newErrors.reason = "Please provide a reason for this change";
    }
    if (form.reason.trim().length < 20) {
      newErrors.reason = "Please provide a more detailed reason (at least 20 characters)";
    }
    if (form.documents.length === 0) {
      newErrors.documents = "Please upload at least one supporting document";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    
    if (validFiles.length !== files.length) {
      toast.error("Some files were rejected. Use PDF or images (max 10MB each).");
    }
    
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, ...validFiles].slice(0, 5), // Max 5 files
    }));
  };

  const removeFile = (index) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      const profession = form.newProfession === "Other" ? form.customProfession.trim() : form.newProfession;
      formData.append("new_profession", profession);
      formData.append("reason", form.reason.trim());
      form.documents.forEach((doc) => {
        formData.append("supporting_documents", doc);
      });

      await submitProfessionChangeRequest(formData);
      
      // Create notification for self
      try {
        await createNotification({
          type: "profession_change_submitted",
          title: "Profession Change Request Submitted",
          message: `Your request to change your profession to "${profession}" has been submitted and is pending review. You will be notified once it's processed.`,
          actionUrl: "/artisan/profile",
        });
      } catch (notifErr) {
        console.warn("Failed to create notification:", notifErr);
      }
      
      toast.success("Profession change request submitted successfully!");
      setForm({ newProfession: "", customProfession: "", reason: "", documents: [] });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!existingRequest?.id) return;
    
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
      setCancelling(true);
      await cancelProfessionChangeRequest();
      toast.success("Request cancelled successfully");
      setExistingRequest(null);
    } catch (err) {
      toast.error(err.message || "Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0b6e4f]" />
                Request Profession Change
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
              </div>
            ) : existingRequest && existingRequest.status === "pending" ? (
              // Show existing pending request
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${STATUS_CONFIG.pending.bgColor} ${STATUS_CONFIG.pending.borderColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`w-5 h-5 ${STATUS_CONFIG.pending.color}`} />
                    <span className={`font-semibold ${STATUS_CONFIG.pending.color}`}>
                      Pending Request
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You have a pending profession change request. Please wait for admin review.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Requested Profession</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {existingRequest.new_profession}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Reason</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {existingRequest.reason}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Submitted</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(existingRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Request"
                  )}
                </Button>
              </div>
            ) : existingRequest && existingRequest.status === "rejected" ? (
              // Show rejected request and allow resubmission
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${STATUS_CONFIG.rejected.bgColor} ${STATUS_CONFIG.rejected.borderColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className={`w-5 h-5 ${STATUS_CONFIG.rejected.color}`} />
                    <span className={`font-semibold ${STATUS_CONFIG.rejected.color}`}>
                      Previous Request Rejected
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {existingRequest.rejection_reason || "Your previous request was not approved."}
                  </p>
                </div>
                
                {/* Show form for new request */}
                {renderForm()}
              </div>
            ) : (
              // Show form for new request
              renderForm()
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  function renderForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Profession Display */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">Current Profession</span>
          <p className="font-semibold text-gray-900 dark:text-white">
            {currentProfession || "Not set"}
          </p>
        </div>

        {/* New Profession Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Profession <span className="text-red-500">*</span>
          </label>
          <select
            value={form.newProfession}
            onChange={(e) => setForm((prev) => ({ ...prev, newProfession: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
          >
            <option value="">Select new profession...</option>
            {PROFESSION_OPTIONS.filter(p => p.toLowerCase() !== currentProfession?.toLowerCase()).map((prof) => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
          {form.newProfession === "Other" && (
            <input
              type="text"
              value={form.customProfession}
              onChange={(e) => setForm((prev) => ({ ...prev, customProfession: e.target.value }))}
              placeholder="Enter your profession..."
              className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
            />
          )}
          {errors.profession && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.profession}</p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Reason for Change <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Explain why you want to change your profession..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent resize-none"
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reason}</p>
          )}
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Supporting Documents <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Upload certificates, licenses, or other proof of your new profession (PDF or images, max 10MB each)
          </p>
          
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#0b6e4f] transition">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload documents
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {form.documents.length > 0 && (
            <div className="mt-3 space-y-2">
              {form.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.documents && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.documents}</p>
          )}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">Review Process</p>
            <p className="mt-1">
              Your request will be reviewed by an administrator. You'll receive a notification 
              once your request is approved or rejected.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#0b6e4f] hover:bg-[#095c42] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    );
  }
}
