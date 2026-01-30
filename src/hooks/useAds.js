// src/hooks/useAds.js
/**
 * useAds Hook
 * 
 * Custom hook for fetching and managing ads with role-aware filtering,
 * random rotation, and placement-based selection.
 * 
 * Features:
 * - Role-aware ad filtering
 * - Random rotation from available ads
 * - Placement-based ad selection (banner, card, inline)
 * - View/click tracking
 * - Caching to reduce API calls
 * 
 * Usage:
 * const { ads, loading, error, refreshAds } = useAds({
 *   placement: 'banner',
 *   limit: 1,
 *   autoRefresh: false
 * });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getAds, trackAdView, trackAdClick } from "@/services/adsService";
import { useAuthStore } from "@/stores/authStore";

// Cache for ads to reduce API calls
const adsCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Filter ads by role
 * @param {Array} ads - Array of ads
 * @param {string} userRole - Current user role
 * @returns {Array} Filtered ads
 */
const filterAdsByRole = (ads, userRole) => {
  if (!ads || !Array.isArray(ads)) return [];
  
  // If user has no role or role is invalid, return empty
  if (!userRole) return [];
  
  return ads.filter((ad) => {
    // If ad has no target_roles, show to everyone
    if (!ad.target_roles || ad.target_roles.length === 0) return true;
    
    // Check if user role is in target roles (case-insensitive)
    const normalizedUserRole = userRole.toLowerCase();
    return ad.target_roles.some(
      (targetRole) => targetRole.toLowerCase() === normalizedUserRole
    );
  });
};

/**
 * Filter and rotate ads by placement
 * @param {Array} ads - Array of ads
 * @param {string} placement - Ad placement (banner, card, inline)
 * @param {number} limit - Maximum number of ads to return
 * @returns {Array} Filtered and rotated ads
 */
const filterAndRotateAds = (ads, placement, limit = 1) => {
  if (!ads || !Array.isArray(ads)) return [];
  
  // Filter by placement type (ad_type field)
  const placementAds = ads.filter((ad) => {
    if (!ad.ad_type) return false;
    return ad.ad_type.toLowerCase() === placement.toLowerCase();
  });
  
  // Filter active ads only
  const activeAds = placementAds.filter((ad) => ad.is_active !== false);
  
  // Shuffle for random rotation
  const shuffled = shuffleArray(activeAds);
  
  // Return limited number
  return shuffled.slice(0, limit);
};

/**
 * useAds Hook
 * @param {Object} options - Hook options
 * @param {string} options.placement - Ad placement type (banner, card, inline)
 * @param {number} options.limit - Maximum number of ads to return (default: 1)
 * @param {boolean} options.autoRefresh - Auto-refresh ads periodically (default: false)
 * @param {number} options.refreshInterval - Refresh interval in ms (default: 300000 = 5 min)
 * @param {boolean} options.useCache - Use cached ads if available (default: true)
 * @returns {Object} { ads, loading, error, refreshAds, trackView, trackClick }
 */
export default function useAds({
  placement = "banner",
  limit = 1,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  useCache = true,
} = {}) {
  const { user } = useAuthStore();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache && adsCache.data && adsCache.timestamp) {
        const cacheAge = Date.now() - adsCache.timestamp;
        if (cacheAge < adsCache.ttl) {
          const cachedAds = adsCache.data;
          const roleFiltered = filterAdsByRole(cachedAds, user?.role);
          const placementFiltered = filterAndRotateAds(roleFiltered, placement, limit);
          setAds(placementFiltered);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await getAds({ is_active: true });
      const allAds = response.results || response.data || Array.isArray(response) ? response : [];

      // Update cache
      if (useCache) {
        adsCache.data = allAds;
        adsCache.timestamp = Date.now();
      }

      // Filter by role
      const roleFiltered = filterAdsByRole(allAds, user?.role);

      // Filter by placement and rotate
      const placementFiltered = filterAndRotateAds(roleFiltered, placement, limit);

      setAds(placementFiltered);
    } catch (err) {
      console.error("useAds: Failed to fetch ads", err);
      setError(err.message || "Failed to load ads");
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [placement, limit, useCache, user?.role]);

  // Initial fetch
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      fetchAds();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchAds]);

  // Track ad view
  const trackView = useCallback(
    async (adId) => {
      if (!adId) return;
      try {
        await trackAdView(adId);
      } catch (err) {
        // Silent fail - tracking is not critical
        console.warn("Failed to track ad view:", err);
      }
    },
    []
  );

  // Track ad click
  const trackClick = useCallback(
    async (adId) => {
      if (!adId) return;
      try {
        await trackAdClick(adId);
      } catch (err) {
        // Silent fail - tracking is not critical
        console.warn("Failed to track ad click:", err);
      }
    },
    []
  );

  // Refresh ads manually
  const refreshAds = useCallback(() => {
    // Clear cache
    if (useCache) {
      adsCache.data = null;
      adsCache.timestamp = null;
    }
    fetchAds();
  }, [fetchAds, useCache]);

  return {
    ads,
    loading,
    error,
    refreshAds,
    trackView,
    trackClick,
  };
}
