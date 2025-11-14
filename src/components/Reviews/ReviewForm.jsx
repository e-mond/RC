import { useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/services/reviewService";
import Button from "@/components/ui/Button";

export default function ReviewForm({ propertyId, revieweeId, reviewType, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        review_type: reviewType,
        rating,
        comment,
      };

      if (reviewType === "property" && propertyId) {
        reviewData.property_id = propertyId;
      } else if (revieweeId) {
        reviewData.reviewee_id = revieweeId;
      }

      await createReview(reviewData);
      setComment("");
      setRating(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <Button type="submit" loading={loading}>
        Submit Review
      </Button>
    </form>
  );
}

