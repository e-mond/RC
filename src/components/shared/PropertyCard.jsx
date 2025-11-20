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
    <article className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        {images?.[0] ? (
          // lazy load image
          <img src={images[0]} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{address}</p>
            <p className="mt-2 text-sm text-gray-700">
              {bedrooms != null && <span>{bedrooms} bed • </span>}
              {bathrooms != null && <span>{bathrooms} bath • </span>}
              <span className="font-medium">
                {currency} {Number(price).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="text-right">
            <span
              className={`px-2 py-1 text-xs rounded ${status === "active" ? "bg-green-100 text-green-800" : status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"}`}
            >
              {status}
            </span>

            <div className="mt-3">
              <Link to={`/landlord/properties/${id}/edit`} className="text-sm text-[#0b6e4f] hover:underline">
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
