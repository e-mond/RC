/**
 * SA_UserApprovalDetailPage - Super Admin User Approval Detail Page
 * 
 * Dedicated detailed view for Super Admins to review user signup applications.
 * 
 * Features:
 * - Displays all user information and uploaded documents
 * - Secure document viewing
 * - Approve/Reject/Suspend actions
 * - Audit logging (handled by backend)
 * - Email notifications (handled by backend)
 * - Navigates back to super admin pending users page
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
  AlertCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { getUserDetailsSA, approveUserSA, rejectUserSA, suspendUser } from "@/services/adminService";
import DocumentViewer from "@/components/admin/DocumentViewer";
import PageHeader from "@/modules/dashboard/PageHeader";
import { validateId } from "@/utils/validateParams";
import SA_ApproveUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_ApproveUserModal";
import SA_RejectUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_RejectUserModal";
import SA_SuspendUserModal from "@/pages/Dashboards/SuperAdmin/components/SA_SuspendUserModal";

export default function SA_UserApprovalDetailPage() {
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
      navigate("/super-admin/users/pending");
      return;
    }
    loadUserDetails();
  }, [id, navigate]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUserDetailsSA(id);
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
      await approveUserSA(id, notes ? { notes } : undefined);
      toast.success("User approved! Approval email has been sent.");
      setApproveModalOpen(false);
      navigate("/super-admin/users/pending");
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
      await rejectUserSA(id, reason);
      toast.success("User rejected! Rejection email has been sent.");
      setRejectModalOpen(false);
      navigate("/super-admin/users/pending");
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
      navigate("/super-admin/users/pending");
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0b6e4f]" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Error Loading User</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/super-admin/users/pending")}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pending Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const documents = user.documents || {};
  const documentKeys = Object.keys(documents);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <PageHeader
          title="User Approval Details"
          subtitle={`Reviewing application for ${user.fullName || user.name || "Unknown User"}`}
          badge="Super Admin"
          align="between"
          actions={
            <Button
              onClick={() => navigate("/super-admin/users/pending")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Pending Users
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.fullName || user.name || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.email || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.phone || user.phoneNumber || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">{user.role || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Registration Date
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {user.createdAt || user.submittedAt
                      ? new Date(user.createdAt || user.submittedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        user.status === "pending_approval"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : user.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {user.status || "pending_approval"}
                    </span>
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{user.bio}</p>
                </div>
              )}
            </motion.div>

            {/* Documents Card */}
            {documentKeys.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Uploaded Documents
                </h2>

                <div className="space-y-4">
                  {documentKeys.map((key) => {
                    const docUrl = documents[key];
                    const isImage = getDocumentType(docUrl) === "image";

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">{key.replace(/_/g, " ")}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getDocumentType(docUrl).toUpperCase()} Document
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingDocument({ url: docUrl, name: key })}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <a
                            href={docUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {documentKeys.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No documents uploaded</p>
                </div>
              </motion.div>
            )}
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
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
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
                  onClick={handleSuspend}
                  disabled={actionLoading !== null}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
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
    </div>
  );
}
