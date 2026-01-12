/**
 * PropertyImageGallery Component
 * 
 * Displays property images with navigation controls and thumbnail gallery.
 * Extracted from PropertyDetail.jsx for better code organization.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyImageGallery({ images = [], propertyTitle = "Property" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasImages = images.length > 0;
  const currentImage = hasImages
    ? images[currentImageIndex]?.image ||
      "https://placehold.co/800x600?text=Image+Not+Found"
    : "https://placehold.co/800x600?text=No+Images+Available";

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-80 sm:h-96 bg-gray-200 dark:bg-gray-700">
        <img
          src={currentImage}
          alt={propertyTitle}
          className="w-full h-full object-cover"
          onError={(e) =>
            (e.target.src = "https://placehold.co/800x600?text=Image+Error")
          }
        />

        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-gray-800 dark:text-gray-200" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-gray-800 dark:text-gray-200" />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "w-8 bg-white dark:bg-gray-200"
                      : "w-2 bg-white/60 dark:bg-gray-400"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasImages && images.length > 1 && (
        <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? "border-[#0b6e4f] dark:border-emerald-400 shadow-md"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={img.image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.target.src = "https://placehold.co/96x96?text=?")
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

