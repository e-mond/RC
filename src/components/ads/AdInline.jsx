// src/components/ads/AdInline.jsx
/**
 * AdInline Component
 * 
 * Inline-style advertisement component for displaying inline ads within content.
 * Used in: Article content, between list items, within text flows
 * 
 * Features:
 * - Compact inline layout
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

export default function AdInline({ ad, className = "", onTrackView, onTrackClick }) {
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
    <div className={`w-full my-4 ${className}`}>
      {ad.link_url ? (
        <a
          href={ad.link_url}
          onClick={handleClick}
          className="flex group items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[#0b6e4f]/50 transition-all duration-200"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={ad.title || "Advertisement"}
        >
          {/* Image */}
          {ad.image_url && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 text-xs">
                  Image
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {ad.title && (
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {ad.title}
              </h4>
            )}
            {ad.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {ad.description}
              </p>
            )}
            {ad.link_url && (
              <div className="flex items-center gap-1 mt-2 text-xs text-[#0b6e4f] font-medium">
                Learn more
                {isExternal && <ExternalLink className="w-3 h-3" />}
              </div>
            )}
          </div>

          {/* Ad label */}
          <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
            Ad
          </div>
        </a>
      ) : (
        // Non-clickable ad
        <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {ad.image_url && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 text-xs">
                  Image
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {ad.title && (
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {ad.title}
              </h4>
            )}
            {ad.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{ad.description}</p>
            )}
          </div>
          <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
            Ad
          </div>
        </div>
      )}
    </div>
  );
}

