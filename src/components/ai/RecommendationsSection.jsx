/**
 * RecommendationsSection Component
 * 
 * Displays AI-powered recommendations for properties or artisans.
 * Used in tenant dashboard, search results, property detail, and artisan pages.
 * 
 * Features:
 * - Loading states
 * - Empty states
 * - Error handling with retry
 * - Responsive grid layout
 * - Smooth animations
 * 
 * @module RecommendationsSection
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getPropertyRecommendations, getArtisanRecommendations } from "@/services/aiService";
import { useAuthStore } from "@/stores/authStore";
import PropertyCard from "@/components/shared/PropertyCard";
import { Link } from "react-router-dom";

/**
 * RecommendationsSection - Property Recommendations
 * 
 * @param {Object} props
 * @param {string} props.type - "properties" | "artisans"
 * @param {Object} [props.context] - Additional context for recommendations
 * @param {string} [props.title] - Section title
 * @param {number} [props.limit] - Maximum number of recommendations
 * @param {Function} [props.onRecommendationClick] - Callback when recommendation is clicked
 */
export default function RecommendationsSection({
  type = "properties",
  context = {},
  title = null,
  limit = 6,
  onRecommendationClick = null,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const isMountedRef = useRef(true);
  const requestInFlightRef = useRef(false);
  const geolocationRequestedRef = useRef(false);

  const defaultTitle = type === "properties" 
    ? "Recommended for you" 
    : "Artisans near you with high trust scores";

  const sectionTitle = title || defaultTitle;

  useEffect(() => {
    isMountedRef.current = true;
    requestInFlightRef.current = false;
    geolocationRequestedRef.current = false;
    
    loadRecommendations();

    return () => {
      isMountedRef.current = false;
      requestInFlightRef.current = false;
      geolocationRequestedRef.current = false;
    };
  }, [type]); // Only depend on type, not context to prevent excessive re-renders

  const loadRecommendations = async () => {
    // Prevent multiple simultaneous requests
    if (requestInFlightRef.current) {
      return;
    }

    try {
      requestInFlightRef.current = true;
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);

      // Prepare context
      const recommendationContext = {
        user_role: user?.role || "tenant",
        ...context,
      };

      // Get user location if available (only once per mount)
      if (!context.location && navigator.geolocation && !geolocationRequestedRef.current) {
        geolocationRequestedRef.current = true;
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isMountedRef.current || !requestInFlightRef.current) return;
            
            recommendationContext.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            // Fetch with location
            fetchRecommendations(recommendationContext);
          },
          () => {
            // Location denied - continue without it
            if (isMountedRef.current && requestInFlightRef.current) {
              fetchRecommendations(recommendationContext);
            }
          },
          { timeout: 2000, maximumAge: 300000 } // Cache location for 5 minutes
        );
      } else {
        // No geolocation needed or already requested
        fetchRecommendations(recommendationContext);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      if (isMountedRef.current) {
        // Check for rate limit error (429)
        const isRateLimit = err.response?.status === 429 || err.message?.includes("429") || err.message?.toLowerCase().includes("too many");
        
        if (isRateLimit) {
          setError("We're receiving too many requests right now. Please wait a moment and refresh the page. This helps ensure everyone gets fast recommendations!");
        } else {
          setError(err.message || "Failed to load recommendations");
        }
        
        setLoading(false);
        requestInFlightRef.current = false;
      }
    }
  };

  const fetchRecommendations = async (recommendationContext) => {
    if (!isMountedRef.current || !requestInFlightRef.current) return;

    try {
      let data;
      if (type === "properties") {
        data = await getPropertyRecommendations(recommendationContext);
      } else {
        data = await getArtisanRecommendations(recommendationContext);
      }

      if (!isMountedRef.current) return;

      const items = data.recommendations || [];
      setRecommendations(items.slice(0, limit));
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      if (isMountedRef.current) {
        // Check for rate limit error (429)
        const isRateLimit = err.response?.status === 429 || err.message?.includes("429") || err.message?.toLowerCase().includes("too many");
        
        if (isRateLimit) {
          setError("We're receiving too many requests right now. Please wait a moment and refresh the page. This helps ensure everyone gets fast recommendations!");
        } else {
          setError(err.message || "Failed to load recommendations");
        }
        
        setLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        requestInFlightRef.current = false;
      }
    }
  };

  const handleRetry = () => {
    // Reset flags before retry
    requestInFlightRef.current = false;
    geolocationRequestedRef.current = false;
    loadRecommendations();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-[#0b6e4f] dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sectionTitle}</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f] dark:text-emerald-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Finding recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-[#0b6e4f] dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sectionTitle}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-[#0b6e4f] hover:bg-[#095c42] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-[#0b6e4f] dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sectionTitle}</h3>
        </div>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No recommendations yet. Keep browsing to get personalized suggestions!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-[#0b6e4f] dark:text-emerald-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sectionTitle}</h3>
      </div>

      {type === "properties" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((property, idx) => (
            <motion.div
              key={property.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Link
                to={`/properties/${property.id}`}
                onClick={() => onRecommendationClick?.(property)}
              >
                <PropertyCard property={property} />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((artisan, idx) => (
            <motion.div
              key={artisan.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{artisan.full_name}</h4>
                {artisan.trust_score && (
                  <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded">
                    {artisan.trust_score}/100
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {artisan.service_type}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {artisan.location}
              </p>
              {artisan.reasoning && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                  {artisan.reasoning}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
