import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getPropertyReviews, getUserReviews } from "@/services/reviewService";

export default function ReviewList({ propertyId, userId, reviewType = "property" }) {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
  }, [propertyId, userId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let data;
      if (propertyId) {
        data = await getPropertyReviews(propertyId);
      } else if (userId) {
        data = await getUserReviews(userId);
      } else {
        setError("No property or user ID provided");
        return;
      }
      setReviews(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!reviews || !reviews.results || reviews.results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No reviews yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Average Rating */}
      {reviews.average_rating && (
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center mb-2">
              <Star className="w-6 h-6 text-yellow-400 fill-current mr-2" />
              <span className="text-3xl font-bold">{reviews.average_rating}</span>
            </div>
            <p className="text-gray-600">Based on {reviews.total_reviews} reviews</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.results.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {review.reviewer?.full_name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

