/**
 * Landlord Leases Page
 * 
 * Allows landlords to:
 * - View system lease templates
 * - Download system leases
 * - Upload custom leases
 * - View uploaded custom leases
 * - Download custom leases
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Upload,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import {
  getSystemLeases,
  downloadSystemLease,
  getLandlordLeases,
  uploadCustomLease,
  downloadCustomLease,
} from "@/services/leaseService";
import { generateCustomizedLease, previewCustomizedLease } from "@/services/leaseTemplateService";
import { useAuthStore } from "@/stores/authStore";
import CustomizeLeaseModal from "@/components/lease/CustomizeLeaseModal";
// Note: In production, upload would go through backend API
// For now, we'll use the lease service directly

export default function LandlordLeasesPage() {
  const [systemLeases, setSystemLeases] = useState([]);
  const [customLeases, setCustomLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [viewingLease, setViewingLease] = useState(null);
  const [isViewingSystemLease, setIsViewingSystemLease] = useState(false);

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    try {
      setLoading(true);
      const [systemData, customData] = await Promise.all([
        getSystemLeases(),
        getLandlordLeases(),
      ]);
      setSystemLeases(systemData.leases || []);
      setCustomLeases(customData.leases || []);
    } catch (err) {
      console.error("Failed to load leases:", err);
      toast.error("Failed to load leases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSystemLease = async (leaseId, format = "pdf") => {
    try {
      // Validate blob before download
      const blob = await downloadSystemLease(leaseId, format);
      
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lease-${leaseId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Lease downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err.message || "Failed to download lease";
      toast.error(errorMessage);
    }
  };

  const handleDownloadCustomLease = async (leaseId) => {
    try {
      // Validate blob before download
      const blob = await downloadCustomLease(leaseId);
      
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lease-${leaseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Lease downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err.message || "Failed to download lease";
      toast.error(errorMessage);
    }
  };

  const handleUploadLease = async () => {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      
      // Upload lease (backend handles file storage)
      const lease = await uploadCustomLease(
        uploadFile,
        null, // propertyId - can be added later
        uploadTitle || uploadFile.name,
        uploadDescription
      );

      setCustomLeases((prev) => [lease, ...prev]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      toast.success("Lease uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload lease");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lease Agreements"
        subtitle="Manage your lease templates and agreements"
        badge="Leases"
      />

      {/* Upload Custom Lease Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Custom Lease
        </Button>
      </div>

      {/* System Leases */}
      <SectionCard title="System Lease Templates" description="Download standard lease templates">
        <div className="grid md:grid-cols-3 gap-4">
          {systemLeases.map((lease) => (
            <motion.div
              key={lease.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-6 h-6 text-[#0b6e4f] flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {lease.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lease.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingLease(lease);
                    setIsViewingSystemLease(true);
                  }}
                  className="flex-1 min-w-[80px]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setCustomizingLease(lease);
                    setShowCustomizeModal(true);
                  }}
                  className="flex-1 min-w-[100px] bg-[#0b6e4f] hover:bg-[#095c42] text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSystemLease(lease.id, "pdf")}
                  className="flex-1 min-w-[80px]"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSystemLease(lease.id, "docx")}
                  className="flex-1 min-w-[80px]"
                >
                  <Download className="w-4 h-4 mr-1" />
                  DOCX
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Custom Leases */}
      <SectionCard
        title="Your Custom Leases"
        description="Leases you've uploaded"
      >
        {customLeases.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No custom leases uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {customLeases.map((lease) => (
              <motion.div
                key={lease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {lease.title}
                    </h3>
                    {lease.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lease.description}
                      </p>
                    )}
                    {lease.property_title && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Property: {lease.property_title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingLease(lease);
                      setIsViewingSystemLease(false);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCustomLease(lease.id)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Customize Lease Modal */}
      {showCustomizeModal && customizingLease && (
        <CustomizeLeaseModal
          isOpen={showCustomizeModal}
          onClose={() => {
            setShowCustomizeModal(false);
            setCustomizingLease(null);
          }}
          lease={customizingLease}
          propertyId={null}
        />
      )}

      {/* Lease Viewer Modal */}
      {viewingLease && (
        <LeaseViewerModal
          isOpen={!!viewingLease}
          onClose={() => {
            setViewingLease(null);
            setIsViewingSystemLease(false);
          }}
          lease={viewingLease}
          isSystem={isViewingSystemLease}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadLeaseModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadLease}
          file={uploadFile}
          setFile={setUploadFile}
          title={uploadTitle}
          setTitle={setUploadTitle}
          description={uploadDescription}
          setDescription={setUploadDescription}
          uploading={uploading}
        />
      )}
    </div>
  );
}

function UploadLeaseModal({
  onClose,
  onUpload,
  file,
  setFile,
  title,
  setTitle,
  description,
  setDescription,
  uploading,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload Custom Lease
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lease File (PDF, DOCX, or DOC)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {file && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Custom Lease Agreement"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this lease agreement..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={onUpload} className="flex-1" disabled={uploading || !file}>
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
