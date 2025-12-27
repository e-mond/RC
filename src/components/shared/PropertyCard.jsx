// src/components/property/PropertyCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Reusable PropertyCard for tenant browse & detail pages
 * Supports boosted/promoted state with visual indicators
 */
export default function PropertyCard({
  property,
  isFavorited = false,
  onToggleFavorite,
  showActions = true,
  isBoosted = false,
}) {
  const {
    id,
    title,
    address,
    price,
    currency = "GHS",
    images = [],
    bedrooms,
    bathrooms,
    period = "month",
  } = property;

  const imageUrl = images[0]?.image || images[0] || "https://placehold.co/400x300?text=No+Image";

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all hover:shadow-2xl ${
        isBoosted ? "ring-4 ring-amber-400/50 shadow-amber-500/20" : "shadow-lg"
      }`}
    >
      {/* Boosted Ribbon Badge */}
      {isBoosted && (
        <div className="absolute top-0 left-0 z-10">
          <div className="relative overflow-hidden">
            <div className="bg-linear-to-br from-amber-500 to-orange-600 text-white px-8 py-2 rounded-br-3xl font-bold text-sm flex items-center gap-2 shadow-xl">
              <Zap className="w-5 h-5 animate-pulse" />
              BOOSTED
            </div>
            <div className="absolute top-full left-0 w-0 h-0 border-l-12 border-l-amber-600 border-b-12 border-b-transparent" />
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-56 bg-gray-100 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Favorite Button */}
        {showActions && onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(id)}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
              isFavorited
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white"
            } backdrop-blur-sm`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {title || "Untitled Property"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {address || "Location not specified"}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-5 h-5" />
              {bedrooms} bed{bedrooms > 1 ? "s" : ""}
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-5 h-5" />
              {bathrooms} bath{bathrooms > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-3xl font-bold text-[#0b6e4f]">
              {currency === "GHS" ? "₵" : "$"}
              {Number(price).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              /{period}
            </span>
          </div>

          <Link to={`/tenant/properties/${id}`}>
            <Button size="sm" className="flex items-center gap-2">
              View Details
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Boosted Footer Note */}
        {isBoosted && (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium pt-2">
            <Star className="w-5 h-5 fill-current" />
            <span>Promoted for maximum visibility • More views & faster inquiries</span>
          </div>
        )}
      </div>
    </div>
  );
}