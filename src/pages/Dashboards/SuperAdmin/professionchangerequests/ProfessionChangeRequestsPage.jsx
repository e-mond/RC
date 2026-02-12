/**
 * ProfessionChangeRequestsPage
 * 
 * Super Admin page for reviewing and managing artisan profession change requests.
 * 
 * Features:
 * - Responsive card layout with skeleton loader
 * - Status filter + real-time search
 * - Approve/reject with optional notes & notifications
 * - Document viewer in accessible modal
 * - Full mobile support & accessibility
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
  Calendar,
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

// Status badge styles
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/30",
    label: "Pending",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/30",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/30",
    label: "Rejected",
  },
};

// Skeleton Loader (realistic placeholders with shimmer)
const SkeletonLoader = () => (
  <div className="space-y-8 animate-pulse">
    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-12 w-full sm:w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
              </div>
              <div className="h-7 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="h-4 w-2/5 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-2/5 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-20 w-full bg-gray-300 dark:bg-gray-600 rounded" />
            </div>

            <div className="flex gap-6">
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
      console.error("Failed to load profession change requests:", err);
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((req) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
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
      await approveProfessionChangeRequest(actionModal.request.id, approvalNotes.trim());

      // Send notification + email
      try {
        await createNotification({
          type: "profession_change_approved",
          title: "Profession Change Approved",
          message: `Your request to change profession to "${actionModal.request.new_profession}" has been approved by ${currentUser?.fullName || currentUser?.name || "an administrator"}. Your profile has been updated.`,
          actionUrl: "/artisan/profile",
          metadata: {
            request_id: actionModal.request.id,
            new_profession: actionModal.request.new_profession,
            approved_by: currentUser?.id,
          },
        });

        triggerEmailNotification({
          type: "profession_change_approved",
          recipientId: actionModal.request.artisan_id,
          data: {
            new_profession: actionModal.request.new_profession,
            approved_by: currentUser?.fullName || currentUser?.name,
          },
        }).catch(console.warn);
      } catch (notificationErr) {
        console.warn("Failed to send notification/email:", notificationErr);
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
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setActionLoading(true);
      await rejectProfessionChangeRequest(actionModal.request.id, rejectReason.trim());

      // Send notification + email
      try {
        await createNotification({
          type: "profession_change_rejected",
          title: "Profession Change Request Rejected",
          message: `Your profession change request to "${actionModal.request.new_profession}" was rejected.\n\nReason: ${rejectReason.trim()}`,
          actionUrl: "/artisan/profile",
          metadata: {
            request_id: actionModal.request.id,
            new_profession: actionModal.request.new_profession,
            rejected_by: currentUser?.id,
            reason: rejectReason.trim(),
          },
        });

        triggerEmailNotification({
          type: "profession_change_rejected",
          recipientId: actionModal.request.artisan_id,
          data: {
            new_profession: actionModal.request.new_profession,
            reason: rejectReason.trim(),
            rejected_by: currentUser?.fullName || currentUser?.name,
          },
        }).catch(console.warn);
      } catch (notificationErr) {
        console.warn("Failed to send notification/email:", notificationErr);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header */}
        <PageHeader
          title="Profession Change Requests"
          subtitle="Review, approve or reject updates to artisan professions"
          badge="Verification"
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name, email or profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
              aria-label="Search profession change requests"
            />
          </div>

          <div className="flex items-center gap-3 min-w-[180px]">
            <Filter className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
              aria-label="Filter by request status"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Requests</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <SectionCard
          title={`Requests (${filteredRequests.length})`}
          description={loading ? "Loading requests..." : `${filteredRequests.length} profession change request${filteredRequests.length !== 1 ? "s" : ""} found`}
          className="bg-white dark:bg-gray-800 shadow-sm"
        >
          {loading ? (
            <SkeletonLoader />
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <FileText className="w-20 h-20 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-medium mb-2">No requests found</h3>
              <p className="text-lg">
                {search.trim()
                  ? "Try adjusting your search"
                  : `No ${filter === "all" ? "" : filter.toLowerCase()} requests at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => {
                const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <motion.article
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 transition-all duration-200"
                    role="article"
                    aria-labelledby={`request-title-${request.id}`}
                    tabIndex={0}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
                            {request.artisan_name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div className="min-w-0">
                            <h3 id={`request-title-${request.id}`} className="font-semibold text-xl text-gray-900 dark:text-white truncate">
                              {request.artisan_name || "Unknown Artisan"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                              {request.artisan_email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.color} border ${status.color.replace("text-", "border-")}/30`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 dark:text-gray-400">Current Profession</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.current_profession || "Not set"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 dark:text-gray-400">Requested Profession</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {request.new_profession}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Change</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                          {request.reason || "No reason provided"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.documents_count > 0 && (
                          <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {request.documents_count} document{request.documents_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setSelectedRequest(request)}
                        className="flex-1 text-base py-3"
                        aria-label={`View details for ${request.artisan_name || "artisan"}'s request`}
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        View Details
                      </Button>

                      {request.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                          <Button
                            size="md"
                            onClick={() => setActionModal({ type: "approve", request })}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-base py-3"
                            aria-label={`Approve profession change request from ${request.artisan_name}`}
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="md"
                            onClick={() => setActionModal({ type: "reject", request })}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-base py-3"
                            aria-label={`Reject profession change request from ${request.artisan_name}`}
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRequest(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-details-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
                <h2 id="request-details-title" className="text-xl font-bold text-gray-900 dark:text-white">
                  Profession Change Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Close details modal"
                >
                  <XCircle size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal body content */}
              <div className="p-6 space-y-8">
                {/* Artisan Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {selectedRequest.artisan_name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.artisan_name || "Unknown Artisan"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {selectedRequest.artisan_email}
                    </p>
                  </div>
                </div>

                {/* Profession Change */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Profession</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {selectedRequest.current_profession || "Not set"}
                    </p>
                  </div>
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Requested Profession</p>
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                      {selectedRequest.new_profession}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Reason for Change
                  </h4>
                  <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                    {selectedRequest.reason || "No reason provided"}
                  </div>
                </div>

                {/* Documents */}
                {selectedRequest.documents?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Supporting Documents ({selectedRequest.documents.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedRequest.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          aria-label={`Open supporting document ${doc.name || index + 1}`}
                        >
                          <FileText className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {doc.name || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Click to view
                            </p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-4">
                    <span>
                      Submitted: {new Date(selectedRequest.created_at).toLocaleString()}
                    </span>
                    {selectedRequest.status !== "pending" && (
                      <span>
                        {selectedRequest.status === "approved" ? "Approved" : "Rejected"} on{" "}
                        {new Date(selectedRequest.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              {selectedRequest.status === "pending" && (
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      setSelectedRequest(null);
                      setActionModal({ type: "approve", request: selectedRequest });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
                    aria-label="Approve this profession change request"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(null);
                      setActionModal({ type: "reject", request: selectedRequest });
                    }}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 text-base font-medium"
                    aria-label="Reject this profession change request"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Request
                  </Button>
                </div>
              )}
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
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to approve this profession change request?
              </p>

              <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">Artisan</dt>
                    <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {actionModal.request.artisan_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">New Profession</dt>
                    <dd className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                      {actionModal.request.new_profession}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approval Notes <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes visible to the artisan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {approvalNotes.length}/500
                </p>
              </div>
            </div>
          }
          confirmText={actionLoading ? "Approving..." : "Confirm Approval"}
          confirmClass="bg-green-600 hover:bg-green-700 text-white"
          cancelText="Cancel"
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
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                Please provide a clear reason for rejecting this request.
              </p>

              <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">Artisan</dt>
                    <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {actionModal.request.artisan_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">Requested Profession</dt>
                    <dd className="mt-1 font-semibold text-red-700 dark:text-red-300">
                      {actionModal.request.new_profession}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this request cannot be approved..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {rejectReason.length}/1000
                </p>
              </div>
            </div>
          }
          confirmText={actionLoading ? "Rejecting..." : "Confirm Rejection"}
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          cancelText="Cancel"
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