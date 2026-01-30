/**
 * LeaseViewerModal Component
 * 
 * Allows users to view lease agreements before downloading
 * Supports PDF, DOCX, and DOC formats
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { downloadSystemLease, downloadCustomLease } from "@/services/leaseService";
import { toast } from "react-hot-toast";

export default function LeaseViewerModal({ isOpen, onClose, lease, isSystem = true }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && lease) {
      loadPreview();
    } else {
      setPreviewUrl(null);
      setError("");
    }
  }, [isOpen, lease]);

  const loadPreview = async () => {
    if (!lease) return;

    try {
      setLoading(true);
      setError("");

      // Download lease as blob
      const blob = isSystem
        ? await downloadSystemLease(lease.id, "pdf", lease)
        : await downloadCustomLease(lease.id);

      // Create object URL for preview
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Failed to load lease preview:", err);
      const errorMessage = err.message || "Failed to load lease preview";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format = "pdf") => {
    if (!lease) return;

    try {
      const blob = isSystem
        ? await downloadSystemLease(lease.id, format, lease)
        : await downloadCustomLease(lease.id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lease.id || lease.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Lease downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err.message || "Failed to download lease";
      toast.error(errorMessage);
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
                  {lease.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lease.description}
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

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg"
                title="Lease Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No preview available
              </div>
            )}
          </div>

          {/* Footer with Download Options */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex gap-2">
              {isSystem && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("pdf")}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("docx")}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    DOCX
                  </Button>
                </>
              )}
              {!isSystem && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload()}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
