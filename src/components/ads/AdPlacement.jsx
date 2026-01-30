// src/components/ads/AdPlacement.jsx
/**
 * AdPlacement Component
 * 
 * Smart ad placement component that automatically fetches and displays ads
 * based on placement type, user role, and random rotation.
 * 
 * Features:
 * - Automatic ad fetching with useAds hook
 * - Role-aware filtering
 * - Random rotation
 * - View/click tracking
 * - Loading and error handling
 * - Multiple placement types (banner, card, inline)
 * 
 * Props:
 * - placement: string - Placement type ('banner', 'card', 'inline')
 * - limit: number - Maximum number of ads to show (default: 1)
 * - className: string - Additional CSS classes
 * - showIfEmpty: boolean - Show placeholder if no ads (default: false)
 */

import useAds from "@/hooks/useAds";
import AdBanner from "./AdBanner";
import AdCard from "./AdCard";
import AdInline from "./AdInline";

export default function AdPlacement({
  placement = "banner",
  limit = 1,
  className = "",
  showIfEmpty = false,
}) {
  const { ads, loading, error, trackView, trackClick } = useAds({
    placement,
    limit,
    useCache: true,
  });

  // Don't render if no ads and showIfEmpty is false
  if (!loading && (!ads || ads.length === 0) && !showIfEmpty) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-xs text-gray-400">Loading ad...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    // Silent fail - don't show error to users
    return null;
  }

  // No ads
  if (!ads || ads.length === 0) {
    if (showIfEmpty) {
      return (
        <div className={`p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center ${className}`}>
          <div className="text-sm text-gray-400">Ad space available</div>
        </div>
      );
    }
    return null;
  }

  // Render ads based on placement type
  return (
    <div className={className}>
      {ads.map((ad, index) => {
        const key = ad.id || `ad-${placement}-${index}`;
        
        switch (placement.toLowerCase()) {
          case "banner":
            return (
              <AdBanner
                key={key}
                ad={ad}
                onTrackView={trackView}
                onTrackClick={trackClick}
              />
            );
          
          case "card":
            return (
              <AdCard
                key={key}
                ad={ad}
                onTrackView={trackView}
                onTrackClick={trackClick}
                className={index > 0 ? "mt-4" : ""}
              />
            );
          
          case "inline":
            return (
              <AdInline
                key={key}
                ad={ad}
                onTrackView={trackView}
                onTrackClick={trackClick}
              />
            );
          
          default:
            // Default to banner
            return (
              <AdBanner
                key={key}
                ad={ad}
                onTrackView={trackView}
                onTrackClick={trackClick}
              />
            );
        }
      })}
    </div>
  );
}

