/**
 * ReviewsList Component
 * 
 * Displays a list of reviews with filtering, sorting, and pagination support.
 * Shows average rating, rating breakdown, and individual reviews.
 * 
 * Props:
 * - reviews: array (list of reviews)
 * - averageRating: number (average rating)
 * - totalReviews: number (total review count)
 * - ratingBreakdown: object (rating distribution)
 * - showModerationStatus: boolean (show pending/approved badges)
 * - onLoadMore: function (optional pagination callback)
 * - className: string (additional classes)
 */

import { useState } from "react";
import { Star, Filter, SortAsc, SortDesc } from "lucide-react";
import ReviewCard from "./ReviewCard";
import RatingDisplay from "./RatingDisplay";

export default function ReviewsList({
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  ratingBreakdown = {},
  showModerationStatus = false,
  onLoadMore,
  className = "",
}) {
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'highest' | 'lowest'
  const [filterRating, setFilterRating] = useState(null); // null | 5 | 4 | 3 | 2 | 1

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Filter by rating
  const filteredReviews = filterRating
    ? sortedReviews.filter((r) => r.rating === filterRating)
    : sortedReviews;

  // Calculate rating percentages
  const getRatingPercentage = (rating) => {
    if (totalReviews === 0) return 0;
    const count = ratingBreakdown[rating] || 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Average Rating */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <RatingDisplay rating={averageRating} size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          {Object.keys(ratingBreakdown).length > 0 && (
            <div className="flex-1 max-w-md">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating Distribution
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = getRatingPercentage(rating);
                  const count = ratingBreakdown[rating] || 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {rating}
                        </span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {/* Filter by Rating */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRating || ""}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-[#0b6e4f] hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              {filterRating
                ? `No reviews with ${filterRating} star${filterRating > 1 ? "s" : ""}`
                : "No reviews yet"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showModerationStatus={showModerationStatus}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {onLoadMore && filteredReviews.length > 0 && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-[#0b6e4f] hover:text-[#095c42] transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}

