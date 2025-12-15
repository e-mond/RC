// src/components/landlord/MapPicker.jsx
import React, { useState, useEffect } from "react";

/**
 * Simplified MapPicker
 * - Removes Leaflet/react-leaflet to avoid CSP + container reuse errors
 * - Provides address + lat/lng inputs and syncs them back to the form
 */
export default function MapPicker({ value = {}, onChange = () => {} }) {
  const [address, setAddress] = useState(value.address || "");
  const [lat, setLat] = useState(value.lat || "");
  const [lng, setLng] = useState(value.lng || "");

  useEffect(() => {
    onChange({
      address,
      lat: lat ? Number(lat) : "",
      lng: lng ? Number(lng) : "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Set your property location. (Interactive map is disabled for now to ensure stable behavior.)
      </p>

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Latitude (optional)"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          placeholder="Longitude (optional)"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}