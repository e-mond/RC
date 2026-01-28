// src/components/shared/PropertyCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import TrustScore from "@/components/ai/TrustScore";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";

/**
 * PropertyCard - small, reusable card
 * props:
 *  - property: object
 *  - actions?: JSX (optional action buttons)
 *  - showTrustScore?: boolean - Show landlord trust score (default: false)
 *  - linkTo?: string - Custom link destination (default: /properties/:id)
 */
export default function PropertyCard({ property = {}, actions = null, showTrustScore = false, linkTo = null }) {
  const {
    id,
    title,
    address,
    price,
    priceGhs,
    rent,
    currency = "GHS",
    images = [],
    image,
    bedrooms,
    bathrooms,
    status = "draft",
    landlord,
  } = property;

  // Normalize images - handle both array and single image
  const normalizedImages = React.useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images;
    }
    if (image) {
      return [image];
    }
    return [];
  }, [images, image]);

  // Get first valid image with fallback
  const imageUrl = getFirstValidImage(
    normalizedImages,
    getPlaceholderImage(title || "Property", 400, 300)
  );

  // Normalize price
  const normalizedPrice = price || priceGhs || rent || 0;

  const defaultLink = linkTo || (id ? `/properties/${id}` : "#");

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-none overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors hover:shadow-md">
      <div className="w-full h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || "Property"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on image error
              e.target.src = getPlaceholderImage(title || "Property", 400, 300);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{title || "Untitled Property"}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{address || "Location not specified"}</p>
            {showTrustScore && landlord?.id && (
              <div className="mt-2">
                <TrustScore userId={landlord.id} size="sm" showLabel={false} />
              </div>
            )}
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {bedrooms != null && <span>{bedrooms} bed • </span>}
              {bathrooms != null && <span>{bathrooms} bath • </span>}
              <span className="font-medium">
                {currency === "GHS" ? "₵" : "$"} {Number(normalizedPrice).toLocaleString()}
              </span>
            </p>
          </div>

          {status && (
            <div className="text-right">
              <span
                className={`px-2 py-1 text-xs rounded ${
                  status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                    : status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {status}
              </span>
            </div>
          )}
        </div>

        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </article>
  );
}