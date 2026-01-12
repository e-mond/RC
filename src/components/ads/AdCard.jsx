// src/components/ads/AdCard.jsx
/**
 * AdCard Component
 * 
 * Card-style advertisement component for displaying card-style ads.
 * Used in: Sidebars, card grids, between content cards
 * 
 * Features:
 * - Card layout with image and content
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

export default function AdCard({ ad, className = "", onTrackView, onTrackClick }) {
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
          className="block group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-[#0b6e4f]/50 transition-all duration-200"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={ad.title || "Advertisement"}
        >
          {/* Image */}
          {ad.image_url && (
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs">
                  Image not available
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {ad.title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {ad.title}
              </h3>
            )}
            {ad.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                {ad.description}
              </p>
            )}
            {ad.link_url && (
              <div className="flex items-center gap-2 text-sm text-[#0b6e4f] font-medium group-hover:underline">
                Learn more
                {isExternal && <ExternalLink className="w-4 h-4" />}
              </div>
            )}
          </div>

          {/* Ad label */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
            Ad
          </div>
        </a>
      ) : (
        // Non-clickable ad
        <div className="block relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {ad.image_url && (
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs">
                  Image not available
                </div>
              )}
            </div>
          )}
          <div className="p-4">
            {ad.title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {ad.title}
              </h3>
            )}
            {ad.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{ad.description}</p>
            )}
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
            Ad
          </div>
        </div>
      )}
    </div>
  );
}

