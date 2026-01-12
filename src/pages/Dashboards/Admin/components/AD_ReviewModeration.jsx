/**
 * AD_ReviewModeration Component
 * 
 * Admin interface for moderating reviews (approve/reject).
 * Shows pending reviews with full details and moderation actions.
 * 
 * Features:
 * - List pending reviews
 * - Approve/reject reviews
 * - Filter by review type (property, tenant, artisan)
 * - Search reviews
 * - Moderation history
 */

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Filter, Search, Loader2, Star, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { getReviews, updateReview, deleteReview } from "@/services/reviewService";
import ReviewCard from "@/components/reviews/ReviewCard";
import Button from "@/components/ui/Button";

export default function AD_ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'property' | 'tenant' | 'artisan'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // 'all' | 'pending' | 'approved' | 'rejected'

  useEffect(() => {
    loadReviews();
  }, [filterType, statusFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter === "all" ? null : statusFilter,
        review_type: filterType === "all" ? null : filterType,
      };
      const response = await getReviews(params);
      const reviewsList = response.results || response.reviews || response.data || response || [];
      setReviews(Array.isArray(reviewsList) ? reviewsList : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!confirm("Approve this review? It will be visible to all users.")) return;

    setActionLoading(reviewId);
    try {
      await updateReview(reviewId, { status: "approved" });
      toast.success("Review approved successfully");
      loadReviews();
    } catch (err) {
      console.error("Failed to approve review:", err);
      toast.error(err.message || "Failed to approve review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return; // User cancelled

    setActionLoading(reviewId);
    try {
      await updateReview(reviewId, { status: "rejected", rejection_reason: reason });
      toast.success("Review rejected");
      loadReviews();
    } catch (err) {
      console.error("Failed to reject review:", err);
      toast.error(err.message || "Failed to reject review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Permanently delete this review? This action cannot be undone.")) return;

    setActionLoading(reviewId);
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted");
      loadReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(err.message || "Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter reviews by search query
  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (review.comment || "").toLowerCase().includes(query) ||
      (review.reviewer_name || "").toLowerCase().includes(query) ||
      (review.property_title || "").toLowerCase().includes(query) ||
      (review.artisan_name || "").toLowerCase().includes(query)
    );
  });

  // Group reviews by status
  const pendingReviews = filteredReviews.filter((r) => r.status === "pending");
  const approvedReviews = filteredReviews.filter((r) => r.status === "approved");
  const rejectedReviews = filteredReviews.filter((r) => r.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0b6e4f]" />
            Review Moderation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Moderate reviews to ensure quality and compliance
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {pendingReviews.length} pending, {approvedReviews.length} approved, {rejectedReviews.length} rejected
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Review Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
          >
            <option value="all">All Types</option>
            <option value="property">Property Reviews</option>
            <option value="tenant">Tenant Reviews</option>
            <option value="artisan">Artisan Reviews</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No reviews found matching your search" : "No reviews to moderate"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <ReviewCard review={review} showModerationStatus={true} />

              {/* Moderation Actions */}
              {review.status === "pending" && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handleApprove(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-2"
                    variant="success"
                  >
                    {actionLoading === review.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReject(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-2"
                    variant="danger"
                  >
                    {actionLoading === review.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDelete(review.id)}
                    disabled={actionLoading === review.id}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    Delete
                  </Button>
                </div>
              )}

              {/* Rejection Reason */}
              {review.status === "rejected" && review.rejection_reason && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Rejection Reason:</strong> {review.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

