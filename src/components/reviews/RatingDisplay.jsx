/**
 * RatingDisplay Component
 * 
 * Displays a rating with stars and optional text.
 * Used for showing average ratings, individual ratings, etc.
 * 
 * Props:
 * - rating: number (0-5)
 * - showText: boolean (show rating number)
 * - size: 'sm' | 'md' | 'lg' (star size)
 * - className: string (additional classes)
 */

import { Star } from "lucide-react";

export default function RatingDisplay({ 
  rating = 0, 
  showText = false, 
  size = "md",
  className = "" 
}) {
  const ratingValue = Math.min(5, Math.max(0, parseFloat(rating) || 0));
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Full Stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSize} fill-yellow-400 text-yellow-400`}
        />
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${starSize} fill-gray-300 text-gray-300`} />
          <Star
            className={`${starSize} fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden`}
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}

      {/* Empty Stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${starSize} fill-gray-300 text-gray-300`}
        />
      ))}

      {/* Rating Text */}
      {showText && (
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {ratingValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}

