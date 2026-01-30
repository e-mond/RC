/**
 * DocumentViewer - Secure document viewing component
 * 
 * Features:
 * - Displays PDF, images, and other document types
 * - Secure iframe embedding for PDFs
 * - Download functionality
 * - Error handling for inaccessible documents
 * - Cloudinary integration support
 */

import React, { useState } from "react";
import { X, Download, FileText, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function DocumentViewer({ 
  isOpen, 
  onClose, 
  documentUrl, 
  documentName = "Document",
  documentType = "pdf" 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDownload = () => {
    if (!documentUrl) return;
    
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = documentName || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = documentType?.toLowerCase().includes("image") || 
                  documentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = documentType?.toLowerCase() === "pdf" || 
                documentUrl?.match(/\.pdf$/i);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {isPdf ? (
                <FileText className="w-6 h-6 text-[#0b6e4f]" />
              ) : isImage ? (
                <ImageIcon className="w-6 h-6 text-[#0b6e4f]" />
              ) : (
                <FileText className="w-6 h-6 text-[#0b6e4f]" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {documentName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isPdf ? "PDF Document" : isImage ? "Image" : "Document"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close document viewer"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading document...</p>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Unable to load document
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-auto bg-gray-100 dark:bg-gray-800">
                {isImage ? (
                  <img
                    src={documentUrl}
                    alt={documentName}
                    className="w-full h-auto object-contain"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError("Failed to load image");
                    }}
                  />
                ) : isPdf ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full min-h-[600px] border-0"
                    title={documentName}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError("Failed to load PDF. Please download the file instead.");
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Document Preview Not Available
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        This document type cannot be previewed. Please download to view.
                      </p>
                      <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
