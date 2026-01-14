/**
 * CustomizeLeaseModal Component
 * 
 * Allows landlords to customize lease templates with property and tenant details
 * Generates lease with system logo and branding
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Eye, Loader2, FileText, Building2, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { generateCustomizedLease, previewCustomizedLease } from "@/services/leaseTemplateService";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { fetchProperties } from "@/services/landlordService";
import { sanitizeLeaseContentSync } from "@/utils/sanitize";

export default function CustomizeLeaseModal({ isOpen, onClose, lease, propertyId = null }) {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tenantData, setTenantData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [customFields, setCustomFields] = useState({
    lease_duration: "12 months",
    deposit_amount: "",
    start_date: "",
  });
  const [previewHtml, setPreviewHtml] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (isOpen && user?.role === "landlord") {
      loadProperties();
      if (propertyId) {
        // Load property details if propertyId is provided
        fetchProperties(user.id).then((res) => {
          // Handle different response formats: { data: [...] }, { properties: [...] }, { results: [...] }, or direct array
          const props = Array.isArray(res) ? res :
                       Array.isArray(res?.data) ? res.data :
                       Array.isArray(res?.properties) ? res.properties :
                       Array.isArray(res?.results) ? res.results : [];
          const prop = props.find((p) => p.id === propertyId);
          if (prop) setSelectedProperty(prop);
        });
      }
    }
  }, [isOpen, propertyId, user]);

  const loadProperties = async () => {
    try {
      const res = await fetchProperties(user.id);
      // Handle different response formats: { data: [...] }, { properties: [...] }, { results: [...] }, or direct array
      const propertiesList = Array.isArray(res) ? res :
                            Array.isArray(res?.data) ? res.data :
                            Array.isArray(res?.properties) ? res.properties :
                            Array.isArray(res?.results) ? res.results : [];
      setProperties(propertiesList);
    } catch (err) {
      console.error("Failed to load properties:", err);
      toast.error("Failed to load properties");
    }
  };

  const handlePreview = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    try {
      setPreviewing(true);
      const html = await previewCustomizedLease({
        leaseId: lease.id,
        propertyData: selectedProperty,
        landlordData: user,
        tenantData: tenantData.full_name ? tenantData : null,
        customFields,
      });
      setPreviewHtml(html);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to generate preview");
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async (format = "pdf") => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    try {
      setGenerating(true);
      const blob = await generateCustomizedLease({
        leaseId: lease.id,
        propertyData: selectedProperty,
        landlordData: user,
        tenantData: tenantData.full_name ? tenantData : null,
        customFields,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lease-${selectedProperty.id || "custom"}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Customized lease downloaded as ${format.toUpperCase()}`);
      onClose();
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Failed to generate customized lease");
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen || !lease) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#0b6e4f]" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customize Lease: {lease.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add property and tenant details. System logo and branding will be included automatically.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Property Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Select Property *
                  </label>
                  <select
                    value={selectedProperty?.id || ""}
                    onChange={(e) => {
                      const prop = properties.find((p) => p.id === e.target.value);
                      setSelectedProperty(prop);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a property...</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title} - {prop.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tenant Information (Optional) */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    <User className="w-4 h-4 inline mr-1" />
                    Tenant Information (Optional)
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tenant Full Name"
                      value={tenantData.full_name}
                      onChange={(e) => setTenantData({ ...tenantData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="email"
                      placeholder="Tenant Email"
                      value={tenantData.email}
                      onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Tenant Phone"
                      value={tenantData.phone}
                      onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Additional Details
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Lease Duration (e.g., 12 months)"
                      value={customFields.lease_duration}
                      onChange={(e) => setCustomFields({ ...customFields, lease_duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Deposit Amount (GHS)"
                      value={customFields.deposit_amount}
                      onChange={(e) => setCustomFields({ ...customFields, deposit_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="date"
                      placeholder="Lease Start Date"
                      value={customFields.start_date}
                      onChange={(e) => setCustomFields({ ...customFields, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Preview</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    disabled={!selectedProperty || previewing}
                  >
                    {previewing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
                {previewHtml ? (
                  <div
                    className="bg-white rounded-lg p-4 max-h-[500px] overflow-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeLeaseContentSync(previewHtml || '')
                    }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a property and click Preview to see the customized lease</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>✓ System logo and branding will be automatically included</p>
              <p>✓ All fields will be filled with provided information</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => handleGenerate("pdf")}
                disabled={!selectedProperty || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerate("docx")}
                disabled={!selectedProperty || generating}
              >
                <Download className="w-4 h-4 mr-2" />
                DOCX
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
