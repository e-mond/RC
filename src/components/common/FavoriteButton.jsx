// src/components/common/FavoriteButton.jsx
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/services/tenantService";
import { useAuthStore } from "@/stores/authStore";

/**
 * FavoriteButton - Add/remove property from favorites
 * Used on property cards and property detail pages
 */
export default function FavoriteButton({ propertyId, className = "" }) {
  const user = useAuthStore((state) => state.user);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "tenant") {
      setChecking(false);
      return;
    }

    let mounted = true;
    const check = async () => {
      try {
        const result = await isFavorited(propertyId);
        if (mounted) setFavorited(result);
      } catch (err) {
        console.error("isFavorited:", err);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [propertyId, user]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!user || user.role !== "tenant") {
      alert("Please log in as a tenant to save favorites");
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await removeFromFavorites(propertyId);
        setFavorited(false);
      } else {
        await addToFavorites(propertyId);
        setFavorited(true);
      }
    } catch (err) {
      console.error("toggleFavorite:", err);
      alert(err.message || "Failed to update favorites");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "tenant") {
    return null; // Don't show for non-tenants
  }

  if (checking) {
    return (
      <button
        className={`p-2 rounded-full bg-white shadow-md ${className}`}
        disabled
        aria-label="Loading"
      >
        <Heart className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors disabled:opacity-50 ${className}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          favorited ? "text-red-600 fill-red-600" : "text-gray-400"
        }`}
      />
    </button>
  );
}

