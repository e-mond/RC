/**
 * TrustScore Component
 * 
 * Displays an AI-calculated trust score (0-100) with color-coded badge and tooltip.
 * Used on user profiles, property cards, artisan cards, and admin dashboards.
 * 
 * Features:
 * - Color-coded badge based on score range
 * - Tooltip explaining trust score calculation
 * - Read-only display (not editable)
 * - Responsive design
 * - Dark mode support
 * 
 * @module TrustScore
 */

import React, { useState, useEffect } from "react";
import { Shield, Info } from "lucide-react";
import { getTrustScore } from "@/services/aiService";

/**
 * Get color class based on trust score
 * @param {number} score - Trust score (0-100)
 * @returns {string} Tailwind color classes
 */
const getScoreColor = (score) => {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
  if (score >= 60) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  if (score >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
};

/**
 * Get score label
 * @param {number} score - Trust score (0-100)
 * @returns {string} Label text
 */
const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
};

/**
 * TrustScore Component
 * 
 * @param {Object} props
 * @param {string|number} props.userId - User ID to fetch trust score for
 * @param {number} [props.score] - Pre-fetched trust score (optional, will fetch if not provided)
 * @param {string} [props.size] - Size variant: "sm" | "md" | "lg" (default: "md")
 * @param {boolean} [props.showLabel] - Show score label (default: true)
 * @param {boolean} [props.showTooltip] - Show tooltip on hover (default: true)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function TrustScore({
  userId,
  score: initialScore = null,
  size = "md",
  showLabel = true,
  showTooltip = true,
  className = "",
}) {
  const [score, setScore] = useState(initialScore);
  const [loading, setLoading] = useState(!initialScore);
  const [error, setError] = useState(null);
  const [showTooltipContent, setShowTooltipContent] = useState(false);

  useEffect(() => {
    // If score is provided, use it directly
    if (initialScore !== null) {
      setScore(initialScore);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    if (!userId) {
      setError("User ID required");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrustScore(userId);
        if (isMounted) {
          setScore(data.trust_score || 50);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to fetch trust score:", err);
          setScore(50); // Fallback to default
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchScore();

    return () => {
      isMounted = false;
    };
  }, [userId, initialScore]);

  // Size variants
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${sizeClasses[size]} ${className}`}
      >
        <Shield className="animate-pulse" size={iconSizes[size]} />
        <span className="text-gray-500 dark:text-gray-400">...</span>
      </div>
    );
  }

  if (error && score === null) {
    return null; // Don't show anything if there's an error and no score
  }

  const displayScore = score ?? 50;
  const colorClasses = getScoreColor(displayScore);
  const label = getScoreLabel(displayScore);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border ${colorClasses} ${sizeClasses[size]} transition-colors`}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
      >
        <Shield size={iconSizes[size]} className="flex-shrink-0" />
        <span className="font-semibold">{displayScore}</span>
        {showLabel && (
          <span className="text-xs opacity-75">({label})</span>
        )}
        {showTooltip && (
          <Info size={iconSizes[size] - 2} className="flex-shrink-0 opacity-60" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg border border-gray-700">
          <div className="font-semibold mb-1">Trust Score</div>
          <div className="text-gray-300">
            Trust Score is calculated based on verification status, activity history, reviews, and system behavior.
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-gray-400 text-xs">
              Score: {displayScore}/100 ({label})
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 rotate-45" />
        </div>
      )}
    </div>
  );
}

/**
 * TrustScoreBadge - Simplified badge-only version
 * 
 * @param {Object} props
 * @param {number} props.score - Trust score (0-100)
 * @param {string} [props.size] - Size variant
 */
export function TrustScoreBadge({ score, size = "sm" }) {
  const colorClasses = getScoreColor(score ?? 50);
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded border ${colorClasses} ${sizeClasses[size]}`}>
      <Shield size={size === "sm" ? 10 : size === "md" ? 12 : 16} />
      <span className="font-semibold">{score ?? 50}</span>
    </div>
  );
}
