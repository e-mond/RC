// src/components/shared/PropertyCard.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * PropertyCard - small, reusable card
 * props:
 *  - property: object
 *  - actions?: JSX (optional action buttons)
 */
export default function PropertyCard({ property = {}, actions = null }) {
  const {
    id,
    title,
    address,
    price,
    currency = "GHS",
    images = [],
    bedrooms,
    bathrooms,
    status = "draft",
  } = property;

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-none overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
      <div className="w-full h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {images?.[0] ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{address}</p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {bedrooms != null && <span>{bedrooms} bed • </span>}
              {bathrooms != null && <span>{bathrooms} bath • </span>}
              <span className="font-medium">
                {currency} {Number(price).toLocaleString()}
              </span>
            </p>
          </div>

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

            <div className="mt-3">
              <Link
                to={`/landlord/properties/${id}/edit`}
                className="text-sm text-[#0b6e4f] hover:underline"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>

        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </article>
  );
}