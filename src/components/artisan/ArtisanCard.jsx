/**
 * ArtisanCard Component
 * 
 * Displays an artisan's summary information in a card format.
 * Used in artisan listings and search results.
 * 
 * Features:
 * - Profile photo with fallback
 * - Name, profession, location
 * - Trust score and rating
 * - Availability indicator
 * - Book now button
 */

import { Link } from "react-router-dom";
import { Star, MapPin, Shield, CheckCircle, Calendar, Image as ImageIcon } from "lucide-react";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";
import { useState } from "react";

export default function ArtisanCard({ artisan, onBook, className = "" }) {
  const profileImage = getFirstValidImage(
    [artisan.profile_photo, artisan.profilePhoto, artisan.avatar, artisan.image],
    getPlaceholderImage(artisan.fullName?.[0] || artisan.name?.[0] || "A", 200, 200)
  );
  
  const [imgSrc, setImgSrc] = useState(profileImage);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(getPlaceholderImage(artisan.fullName?.[0] || artisan.name?.[0] || "A", 200, 200));
    }
  };

  const rating = artisan.rating || artisan.averageRating || artisan.average_rating || 0;
  const reviewCount = artisan.reviewCount || artisan.review_count || artisan.totalReviews || 0;
  const trustScore = artisan.trustScore || artisan.trust_score || 0;
  const isVerified = artisan.isVerified || artisan.is_verified || artisan.verified || false;
  const isAvailable = artisan.isAvailable ?? artisan.is_available ?? artisan.available ?? true;
  
  // Get work samples
  const workSamples = artisan.workSamples || artisan.work_samples || artisan.portfolio || [];
  const hasWorkSamples = Array.isArray(workSamples) && workSamples.length > 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with profile photo */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
        <img
          src={imgSrc}
          alt={artisan.fullName || artisan.name || "Artisan"}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Availability badge */}
        {isAvailable ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Available
          </span>
        ) : (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
            Not Available
          </span>
        )}

        {/* Verified badge */}
        {isVerified && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and profession */}
        <Link 
          to={`/tenant/artisans/${artisan.id || artisan._id}`}
          className="block hover:text-[#0b6e4f] transition-colors"
        >
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
            {artisan.fullName || artisan.name || "Unknown Artisan"}
          </h3>
        </Link>
        <p className="text-[#0b6e4f] font-medium text-sm">
          {artisan.profession || artisan.trade || "General Services"}
        </p>

        {/* Location */}
        <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mt-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{artisan.location || artisan.address || artisan.region || "Not specified"}</span>
        </p>

        {/* Rating and trust score */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
          
          {trustScore > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Shield className="w-4 h-4 text-[#0b6e4f]" />
              <span className="text-gray-600 dark:text-gray-400">
                Trust: <span className="font-medium text-[#0b6e4f]">{trustScore}%</span>
              </span>
            </div>
          )}
        </div>

        {/* Experience badge */}
        {artisan.experience && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {artisan.experience} years experience
          </p>
        )}

        {/* Work Samples Preview */}
        {hasWorkSamples && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {workSamples.length} work sample{workSamples.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-1.5">
              {workSamples.slice(0, 4).map((sample, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
                >
                  <img
                    src={typeof sample === "string" ? sample : sample.url || sample.image}
                    alt={`Work sample ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
              {workSamples.length > 4 && (
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">+{workSamples.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/tenant/artisans/${artisan.id || artisan._id}`}
            className="flex-1 text-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
          >
            View Profile
          </Link>
          <button
            onClick={() => onBook?.(artisan)}
            disabled={!isAvailable}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0b6e4f] text-white rounded-lg font-medium hover:bg-[#095c42] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
