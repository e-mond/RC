/**
 * ReviewForm Component
 * 
 * Form for submitting reviews (property, tenant, artisan).
 * Supports different review types and validation.
 * 
 * Props:
 * - reviewType: 'property' | 'tenant' | 'artisan'
 * - targetId: string|number (property_id, tenant_id, or artisan_id)
 * - targetName: string (property title, tenant name, or artisan name)
 * - onSubmit: function (callback with review data)
 * - onCancel: function (cancel callback)
 * - className: string (additional classes)
 */

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ReviewForm({
  reviewType = "property",
  targetId,
  targetName = "",
  onSubmit,
  onCancel,
  className = "",
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        review_type: reviewType,
        rating,
        comment: comment.trim(),
      };

      // Add target ID based on review type
      if (reviewType === "property") {
        reviewData.property_id = targetId;
      } else if (reviewType === "tenant") {
        reviewData.tenant_id = targetId;
      } else if (reviewType === "artisan") {
        reviewData.artisan_id = targetId;
      }

      await onSubmit(reviewData);
      
      // Reset form
      setRating(0);
      setComment("");
      setHoveredRating(0);
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getReviewTypeLabel = () => {
    switch (reviewType) {
      case "property":
        return "Property";
      case "tenant":
        return "Tenant";
      case "artisan":
        return "Artisan";
      default:
        return "Review";
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Write a {getReviewTypeLabel()} Review
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {targetName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Reviewing: <span className="font-medium">{targetName}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoveredRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  disabled={submitting}
                >
                  <Star
                    className={`w-6 h-6 ${
                      isFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {rating} {rating === 1 ? "star" : "stars"}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="review-comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 10 characters ({comment.length}/10)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || rating === 0 || comment.trim().length < 10}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

