/**
 * UserApprovalDetailPage - Detailed view for reviewing user signup applications
 * 
 * Features:
 * - Displays all user information and uploaded documents
 * - Secure document viewing
 * - Approve/Reject/Suspend actions
 * - Audit logging (handled by backend)
 * - Email notifications (handled by backend)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Ban, 
  FileText, 
  Image as ImageIcon,
  Download,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { getUserDetails, approveUser, rejectUser, suspendUser } from "@/services/adminService";
import DocumentViewer from "@/components/admin/DocumentViewer";
import PageHeader from "@/modules/dashboard/PageHeader";
import { validateId } from "@/utils/validateParams";
import SA_ApproveUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_ApproveUserModal";
import SA_RejectUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_RejectUserModal";
import SA_SuspendUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_SuspendUserModal";

export default function UserApprovalDetailPage() {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Validate and sanitize ID parameter
  const id = validateId(rawId);

  useEffect(() => {
    if (!id) {
      toast.error("Invalid user ID");
      navigate("/admin/approvals");
      return;
    }
    loadUserDetails();
  }, [id, navigate]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUserDetails(id);
      setUser(data.user || data);
    } catch (err) {
      console.error("Failed to load user details:", err);
      setError(err.message || "Failed to load user details");
      toast.error(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApproveModalOpen(true);
  };

  const handleReject = () => {
    setRejectModalOpen(true);
  };

  const confirmApprove = async (notes = "") => {
    setActionLoading("approve");
    try {
      await approveUser(id, notes ? { notes } : undefined);
      toast.success("User approved! Approval email has been sent.");
      setApproveModalOpen(false);
      navigate("/admin/approvals");
    } catch (err) {
      console.error("Approve error:", err);
      toast.error(err.message || "Failed to approve user");
      throw err; // Let modal handle error display
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async (reason) => {
    setActionLoading("reject");
    try {
      await rejectUser(id, reason);
      toast.success("User rejected! Rejection email has been sent.");
      setRejectModalOpen(false);
      navigate("/admin/approvals");
    } catch (err) {
      console.error("Reject error:", err);
      toast.error(err.message || "Failed to reject user");
      throw err; // Let modal handle error display
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = () => {
    setSuspendModalOpen(true);
  };

  const confirmSuspend = async (suspensionData) => {
    setActionLoading("suspend");
    try {
      await suspendUser(id, suspensionData);
      toast.success(
        suspensionData.duration_days
          ? `User suspended for ${suspensionData.duration_days} days. Suspension email has been sent.`
          : "User suspended permanently. Suspension email has been sent."
      );
      setSuspendModalOpen(false);
      navigate("/admin/approvals");
    } catch (err) {
      console.error("Suspend error:", err);
      toast.error(err.message || "Failed to suspend user");
      throw err; // Let modal handle error display
    } finally {
      setActionLoading(null);
    }
  };

  const getDocumentType = (url) => {
    if (!url) return "unknown";
    if (url.match(/\.(pdf)$/i)) return "pdf";
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "image";
    return "document";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
          <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error loading user details</p>
          </div>
          <p className="text-sm">{error || "User not found"}</p>
          <Button onClick={() => navigate("/admin/approvals")} className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals
          </Button>
        </div>
      </div>
    );
  }

  const documents = user.documents || {};
  const documentEntries = Object.entries(documents).filter(([_, url]) => url);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/approvals")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review User Application
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review submitted documents and profile information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.status === "pending" || user.status === "pending_approval"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : user.status === "approved"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : user.status === "rejected"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : user.status === "suspended"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {user.status || "pending"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#0b6e4f]" />
              User Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{user.fullName || user.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="capitalize">{user.role || "N/A"}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted At</label>
                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {user.submittedAt || user.createdAt 
                    ? new Date(user.submittedAt || user.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              {user.businessType && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.businessType}</p>
                </div>
              )}
              {user.profession && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.profession}</p>
                </div>
              )}
              {user.experience && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.experience} years</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0b6e4f]" />
              Uploaded Documents
            </h2>
            {documentEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents uploaded</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {documentEntries.map(([docName, docUrl]) => (
                  <div
                    key={docName}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getDocumentType(docUrl) === "image" ? (
                          <ImageIcon className="w-5 h-5 text-[#0b6e4f]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#0b6e4f]" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {docName.replace(/_/g, " ")}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingDocument({ url: docUrl, name: docName })}
                        className="flex items-center gap-1"
                      >
                        View
                      </Button>
                    </div>
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0b6e4f] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {actionLoading === "approve" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve User
                  </>
                )}
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading !== null}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {actionLoading === "reject" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject User
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSuspend()}
                disabled={actionLoading !== null}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                {actionLoading === "suspend" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Suspend User
                  </>
                )}
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All actions are logged in the audit log and trigger email notifications to the user.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          documentUrl={viewingDocument.url}
          documentName={viewingDocument.name}
          documentType={getDocumentType(viewingDocument.url)}
        />
      )}

      {/* Approve User Modal */}
      {approveModalOpen && (
        <SA_ApproveUserModal
          user={user}
          onClose={() => setApproveModalOpen(false)}
          onConfirm={confirmApprove}
        />
      )}

      {/* Reject User Modal */}
      {rejectModalOpen && (
        <SA_RejectUserModal
          user={user}
          onClose={() => setRejectModalOpen(false)}
          onConfirm={confirmReject}
        />
      )}

      {/* Suspend User Modal */}
      {suspendModalOpen && (
        <SA_SuspendUserModal
          user={user}
          onClose={() => setSuspendModalOpen(false)}
          onConfirm={confirmSuspend}
        />
      )}
    </div>
  );
}
