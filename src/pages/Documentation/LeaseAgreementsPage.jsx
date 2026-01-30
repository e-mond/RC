// src/pages/Documentation/LeaseAgreementsPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import DocumentationHeader from "@/components/documentation/DocumentationHeader";
import { getSystemLeases, downloadSystemLease } from "@/services/leaseService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Lease Agreements Page
 * Provides standard lease agreement templates and documentation
 */
export default function LeaseAgreementsPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getSystemLeases();
      setTemplates(data.leases || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
      toast.error("Failed to load lease templates");
    } finally {
      setLoading(false);
    }
  };

  const defaultTemplates = [
    {
      id: "standard-residential",
      title: "Standard Residential Lease",
      description: "Standard lease agreement for residential properties in Ghana",
      duration: "12 months",
      features: [
        "Rent amount and payment terms",
        "Security deposit details",
        "Maintenance responsibilities",
        "Termination clauses",
        "Ghana legal compliance",
      ],
    },
    {
      id: "short-term",
      title: "Short-Term Rental Agreement",
      description: "For rentals less than 12 months",
      duration: "1-11 months",
      features: [
        "Flexible terms",
        "Monthly payment options",
        "Early termination options",
        "Furnished property clauses",
      ],
    },
    {
      id: "commercial",
      title: "Commercial Lease Agreement",
      description: "For commercial and business properties",
      duration: "24+ months",
      features: [
        "Business use clauses",
        "Renovation permissions",
        "Subletting terms",
        "Commercial rent escalations",
      ],
    },
  ];

  const handleDownload = async (templateId, format = "pdf") => {
    try {
      const blob = await downloadSystemLease(templateId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Lease downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download lease");
    }
  };

  const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <DocumentationHeader
          title="Lease Agreements"
          subtitle="Standard lease agreement templates compliant with Ghana rental laws. Download, customise, and use for your rental transactions."
        />

        {/* Templates Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {displayTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-[#0b6e4f]" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.duration}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {template.description}
              </p>

              <ul className="space-y-2 mb-6">
                {template.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="text-[#0b6e4f] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(template.id, "pdf")}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  PDF
                </Button>
                <Button
                  onClick={() => handleDownload(template.id, "docx")}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  DOCX
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <span>These templates are provided as a starting point. Consult with a legal professional for specific situations.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <span>All agreements should be reviewed and customised based on your specific property and tenant requirements.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Both parties should sign the agreement and keep copies for their records.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
