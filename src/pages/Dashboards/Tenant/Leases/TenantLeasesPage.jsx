/**
 * Tenant Leases Page
 * 
 * Allows tenants to:
 * - View available leases (system and landlord custom)
 * - Download leases
 * - Sign leases and send back to landlord
 * - View signed lease status
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  PenTool,
  CheckCircle,
  Clock,
  Loader2,
  Upload,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import {
  getSystemLeases,
  downloadSystemLease,
  getLandlordLeases,
  downloadCustomLease,
  signLease,
  getSignedLeases,
} from "@/services/leaseService";
import { useAuthStore } from "@/stores/authStore";
import LeaseViewerModal from "@/components/lease/LeaseViewerModal";

export default function TenantLeasesPage() {
  const { user } = useAuthStore();
  const [systemLeases, setSystemLeases] = useState([]);
  const [availableLeases, setAvailableLeases] = useState([]);
  const [signedLeases, setSignedLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);
  const [signedFile, setSignedFile] = useState(null);
  const [signing, setSigning] = useState(false);
  const [viewingLease, setViewingLease] = useState(null);
  const [isViewingSystemLease, setIsViewingSystemLease] = useState(true);

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    try {
      setLoading(true);
      const [systemData, signedData] = await Promise.all([
        getSystemLeases(),
        getSignedLeases(null), // Get all signed leases for current tenant
      ]);
      setSystemLeases(systemData.leases || []);
      setSignedLeases(signedData.leases || []);
      
      // In production, this would fetch leases available to tenant from landlords
      // For now, we'll show system leases as available
      setAvailableLeases(systemData.leases || []);
    } catch (err) {
      console.error("Failed to load leases:", err);
      toast.error("Failed to load leases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLease = async (leaseId, isSystem = true) => {
    try {
      // Validate blob before download
      const blob = isSystem
        ? await downloadSystemLease(leaseId, "pdf")
        : await downloadCustomLease(leaseId);
      
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

  const handleSignLease = async () => {
    if (!signedFile) {
      toast.error("Please upload the signed lease file");
      return;
    }

    if (!selectedLease) {
      toast.error("No lease selected");
      return;
    }

    try {
      setSigning(true);
      const result = await signLease(
        selectedLease.id,
        signedFile,
        selectedLease.property_id || null,
        selectedLease.landlord_id || null
      );
      
      setSignedLeases((prev) => [result, ...prev]);
      setShowSignModal(false);
      setSelectedLease(null);
      setSignedFile(null);
      toast.success("Lease signed and sent to landlord successfully");
    } catch (err) {
      console.error("Sign lease error:", err);
      toast.error(err.message || "Failed to sign lease");
    } finally {
      setSigning(false);
    }
  };

  const openSignModal = (lease) => {
    setSelectedLease(lease);
    setShowSignModal(true);
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
        subtitle="View, download, and sign lease agreements"
        badge="Leases"
      />

      {/* Available Leases */}
      <SectionCard
        title="Available Leases"
        description="Leases available for download and signing"
      >
        {availableLeases.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No leases available at the moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {availableLeases.map((lease) => (
              <motion.div
                key={lease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingLease(lease);
                      setIsViewingSystemLease(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadLease(lease.id, true)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openSignModal(lease)}
                    className="flex-1"
                  >
                    <PenTool className="w-4 h-4 mr-1" />
                    Sign
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Signed Leases */}
      <SectionCard
        title="Signed Leases"
        description="Leases you have signed and sent"
      >
        {signedLeases.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No signed leases yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signedLeases.map((lease) => (
              <motion.div
                key={lease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {lease.lease_title || "Signed Lease"}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Signed on {new Date(lease.signed_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          lease.status === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : lease.status === "pending_landlord_approval"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {lease.status === "approved"
                          ? "Approved"
                          : lease.status === "pending_landlord_approval"
                          ? "Pending Approval"
                          : "Processing"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Lease Viewer Modal */}
      {viewingLease && (
        <LeaseViewerModal
          isOpen={!!viewingLease}
          onClose={() => {
            setViewingLease(null);
            setIsViewingSystemLease(true);
          }}
          lease={viewingLease}
          isSystem={isViewingSystemLease}
        />
      )}

      {/* Sign Lease Modal */}
      {showSignModal && selectedLease && (
        <SignLeaseModal
          lease={selectedLease}
          onClose={() => {
            setShowSignModal(false);
            setSelectedLease(null);
            setSignedFile(null);
          }}
          onSign={handleSignLease}
          signedFile={signedFile}
          setSignedFile={setSignedFile}
          signing={signing}
        />
      )}
    </div>
  );
}

function SignLeaseModal({
  lease,
  onClose,
  onSign,
  signedFile,
  setSignedFile,
  signing,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sign Lease Agreement
        </h3>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {lease.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lease.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Signed Lease File (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSignedFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {signedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {signedFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Please download the lease, sign it, and upload the signed version here.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={signing}>
            Cancel
          </Button>
          <Button onClick={onSign} className="flex-1" disabled={signing || !signedFile}>
            {signing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Sign & Send
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
