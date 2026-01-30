// src/components/ads/AdBanner.jsx
/**
 * AdBanner Component
 * 
 * Banner-style advertisement component for displaying horizontal banner ads.
 * Used in: Header sections, between content sections, top of pages
 * 
 * Features:
 * - Responsive banner layout
 * - Click tracking
 * - View tracking (on mount)
 * - External/internal link handling
 * - Loading and error states
 * 
 * Props:
 * - ad: object - Ad object from API
 * - className: string - Additional CSS classes
 * - onTrackView: function - Callback for view tracking
 * - onTrackClick: function - Callback for click tracking
 */

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdBanner({ ad, className = "", onTrackView, onTrackClick }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Track view on mount
  useEffect(() => {
    if (ad?.id && onTrackView) {
      onTrackView(ad.id);
    }
  }, [ad?.id, onTrackView]);

  if (!ad) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    
    // Track click
    if (onTrackClick && ad.id) {
      await onTrackClick(ad.id);
    }

    // Handle navigation
    if (ad.link_url) {
      const isExternal = ad.link_url.startsWith("http://") || ad.link_url.startsWith("https://");
      if (isExternal) {
        window.open(ad.link_url, "_blank", "noopener,noreferrer");
      } else {
        navigate(ad.link_url);
      }
    }
  };

  const isExternal = ad.link_url?.startsWith("http://") || ad.link_url?.startsWith("https://");

  return (
    <div className={`w-full ${className}`}>
      {ad.link_url ? (
        <a
          href={ad.link_url}
          onClick={handleClick}
          className="block group relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={ad.title || "Advertisement"}
        >
          {/* Image */}
          {ad.image_url && (
            <div className="relative w-full aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] bg-gray-100 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
              <img
                src={ad.image_url}
                alt={ad.title || ad.description || "Advertisement"}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-sm">
                  Image not available
                </div>
              )}
            </div>
          )}

          {/* Content overlay (if no image or as fallback) */}
          {(!ad.image_url || imageError) && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {ad.title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {ad.title}
                    </h3>
                  )}
                  {ad.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {ad.description}
                    </p>
                  )}
                </div>
                {isExternal && (
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#0b6e4f] transition-colors flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Ad label */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
            Ad
          </div>
        </a>
      ) : (
        // Non-clickable ad
        <div className="block relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {ad.image_url && (
            <div className="relative w-full aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] bg-gray-100 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
              <img
                src={ad.image_url}
                alt={ad.title || ad.description || "Advertisement"}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-sm">
                  Image not available
                </div>
              )}
            </div>
          )}
          {(!ad.image_url || imageError) && (
            <div className="p-4 sm:p-6">
              {ad.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {ad.title}
                </h3>
              )}
              {ad.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{ad.description}</p>
              )}
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
            Ad
          </div>
        </div>
      )}
    </div>
  );
}

