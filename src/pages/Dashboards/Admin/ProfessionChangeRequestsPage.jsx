/**
 * ProfessionChangeRequestsPage
 * 
 * Admin page for reviewing artisan profession change requests.
 * Features:
 * - List of pending/all requests
 * - Filter by status
 * - Approve/reject actions with notes
 * - Document viewer
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Search,
  Filter,
  Eye,
  User,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getProfessionChangeRequests,
  approveProfessionChangeRequest,
  rejectProfessionChangeRequest,
} from "@/services/artisanService";
import { createNotification, triggerEmailNotification } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "Pending",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Rejected",
  },
};

export default function ProfessionChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject', request }
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  
  const currentUser = useAuthStore((state) => state.user);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfessionChangeRequests(filter !== "all" ? { status: filter } : {});
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load requests:", err);
      toast.error(err.message || "Failed to load profession change requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((req) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      req.artisan_name?.toLowerCase().includes(searchLower) ||
      req.artisan_email?.toLowerCase().includes(searchLower) ||
      req.current_profession?.toLowerCase().includes(searchLower) ||
      req.new_profession?.toLowerCase().includes(searchLower)
    );
  });

  const handleApprove = async () => {
    if (!actionModal?.request) return;
    
    try {
      setActionLoading(true);
      await approveProfessionChangeRequest(actionModal.request.id, approvalNotes);
      
      // Send notification to artisan
      try {
        await createNotification({
          type: "profession_change_approved",
          title: "Profession Change Approved",
          message: `Your profession change request to "${actionModal.request.new_profession}" has been approved by ${currentUser?.fullName || currentUser?.name || "an administrator"}. Your profile has been updated.`,
          actionUrl: "/artisan/profile",
          metadata: {
            request_id: actionModal.request.id,
            new_profession: actionModal.request.new_profession,
            approved_by: currentUser?.id,
          },
        });
        
        // Also trigger email notification
        triggerEmailNotification({
          type: "profession_change_approved",
          recipientId: actionModal.request.artisan_id,
          data: {
            new_profession: actionModal.request.new_profession,
            approved_by: currentUser?.fullName || currentUser?.name,
          },
        }).catch(console.warn);
      } catch (notifErr) {
        console.warn("Failed to send notification:", notifErr);
      }
      
      toast.success("Profession change request approved!");
      setActionModal(null);
      setApprovalNotes("");
      loadRequests();
    } catch (err) {
      toast.error(err.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal?.request) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      setActionLoading(true);
      await rejectProfessionChangeRequest(actionModal.request.id, rejectReason.trim());
      
      // Send notification to artisan
      try {
        await createNotification({
          type: "profession_change_rejected",
          title: "Profession Change Request Rejected",
          message: `Your profession change request to "${actionModal.request.new_profession}" has been rejected.\n\nReason: ${rejectReason.trim()}`,
          actionUrl: "/artisan/profile",
          metadata: {
            request_id: actionModal.request.id,
            new_profession: actionModal.request.new_profession,
            rejected_by: currentUser?.id,
            reason: rejectReason.trim(),
          },
        });
        
        // Also trigger email notification
        triggerEmailNotification({
          type: "profession_change_rejected",
          recipientId: actionModal.request.artisan_id,
          data: {
            new_profession: actionModal.request.new_profession,
            reason: rejectReason.trim(),
            rejected_by: currentUser?.fullName || currentUser?.name,
          },
        }).catch(console.warn);
      } catch (notifErr) {
        console.warn("Failed to send notification:", notifErr);
      }
      
      toast.success("Profession change request rejected");
      setActionModal(null);
      setRejectReason("");
      loadRequests();
    } catch (err) {
      toast.error(err.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <PageHeader
          title="Profession Change Requests"
          subtitle="Review and manage artisan profession change requests"
          badge="Admin"
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <SectionCard>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {search
                  ? "No requests match your search"
                  : `No ${filter === "all" ? "" : filter} profession change requests`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRequests.map((request) => {
                const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#0b6e4f] flex items-center justify-center text-white font-semibold shrink-0">
                        {request.artisan_name?.[0]?.toUpperCase() || "A"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {request.artisan_name || "Unknown Artisan"}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.artisan_email}
                        </p>
                        
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Current: </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {request.current_profession || "Not set"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Requested: </span>
                            <span className="font-medium text-[#0b6e4f]">
                              {request.new_profession}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>

                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          {request.documents_count > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              {request.documents_count} document{request.documents_count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          className="text-xs"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setActionModal({ type: "approve", request })}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActionModal({ type: "reject", request })}
                              className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* View Request Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-5 border-b border-gray-200 dark:border-gray-700 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Request Details
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Artisan Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0b6e4f] flex items-center justify-center text-white text-xl font-semibold">
                    {selectedRequest.artisan_name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.artisan_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRequest.artisan_email}</p>
                  </div>
                </div>

                {/* Profession Change */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Current Profession</span>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.current_profession || "Not set"}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 rounded-lg border border-[#0b6e4f]/30">
                    <span className="text-xs text-[#0b6e4f] dark:text-[#0b6e4f]">Requested Profession</span>
                    <p className="mt-1 font-semibold text-[#0b6e4f]">
                      {selectedRequest.new_profession}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reason for Change</h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>

                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supporting Documents</h4>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                            {doc.name || `Document ${index + 1}`}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status & Timeline */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Submitted: {new Date(selectedRequest.created_at).toLocaleString()}
                    </span>
                    {selectedRequest.status !== "pending" && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {selectedRequest.status === "approved" ? "Approved" : "Rejected"}:{" "}
                        {new Date(selectedRequest.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setSelectedRequest(null);
                        setActionModal({ type: "approve", request: selectedRequest });
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(null);
                        setActionModal({ type: "reject", request: selectedRequest });
                      }}
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Confirmation Modal */}
      {actionModal?.type === "approve" && (
        <ConfirmModal
          open={true}
          title="Approve Profession Change"
          message={
            <div className="space-y-4">
              <p>
                Are you sure you want to approve this profession change request?
              </p>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <p><strong>Artisan:</strong> {actionModal.request.artisan_name}</p>
                <p><strong>New Profession:</strong> {actionModal.request.new_profession}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes for the artisan..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
          }
          confirmText={actionLoading ? "Approving..." : "Approve"}
          confirmClass="bg-green-600 hover:bg-green-700 text-white"
          onClose={() => {
            setActionModal(null);
            setApprovalNotes("");
          }}
          onConfirm={handleApprove}
          loading={actionLoading}
        />
      )}

      {/* Reject Confirmation Modal */}
      {actionModal?.type === "reject" && (
        <ConfirmModal
          open={true}
          title="Reject Profession Change"
          message={
            <div className="space-y-4">
              <p>
                Please provide a reason for rejecting this request.
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                <p><strong>Artisan:</strong> {actionModal.request.artisan_name}</p>
                <p><strong>Requested:</strong> {actionModal.request.new_profession}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
            </div>
          }
          confirmText={actionLoading ? "Rejecting..." : "Reject Request"}
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onClose={() => {
            setActionModal(null);
            setRejectReason("");
          }}
          onConfirm={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
