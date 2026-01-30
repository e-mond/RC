/**
 * ReviewCard Component
 * 
 * Displays a single review with rating, comment, reviewer info, and moderation status.
 * Supports moderation-ready display (shows pending/approved status).
 * 
 * Props:
 * - review: object (review data)
 * - showModerationStatus: boolean (show pending/approved badge)
 * - className: string (additional classes)
 */

import { Star, CheckCircle, Clock, Shield } from "lucide-react";
import RatingDisplay from "./RatingDisplay";

export default function ReviewCard({ 
  review, 
  showModerationStatus = false,
  className = "" 
}) {
  if (!review) return null;

  const {
    id,
    rating = 0,
    comment = "",
    reviewer_name = "Anonymous",
    reviewer_role = "user",
    reviewee_name,
    property_title,
    artisan_name,
    status = "approved",
    is_verified = false,
    created_at,
  } = review;

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      label: "Approved",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      label: "Pending Review",
    },
    rejected: {
      icon: Clock,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: "Rejected",
    },
  };

  const statusInfo = statusConfig[status] || statusConfig.approved;
  const StatusIcon = statusInfo.icon;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine review context
  const reviewContext = property_title
    ? `for ${property_title}`
    : artisan_name
    ? `for ${artisan_name}`
    : reviewee_name
    ? `for ${reviewee_name}`
    : "";

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {reviewer_name}
            </h4>
            {is_verified && (
              <Shield className="w-4 h-4 text-blue-500" title="Verified Review" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {reviewer_role}
            </span>
          </div>
          {reviewContext && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {reviewContext}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex-shrink-0">
          <RatingDisplay rating={rating} showText size="sm" />
        </div>
      </div>

      {/* Comment */}
      {comment && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {comment}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(created_at)}
        </span>

        {/* Moderation Status */}
        {showModerationStatus && status !== "approved" && (
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusInfo.bg} ${statusInfo.border} border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </div>
        )}
      </div>
    </div>
  );
}

