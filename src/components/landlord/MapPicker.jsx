// src/components/landlord/MapPicker.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import "leaflet/dist/leaflet.css";

// Lazy-load Leaflet only when needed (code-splitting + safe fallback)
const MapContainer = lazy(() =>
  import("react-leaflet").then((m) => ({ default: m.MapContainer }))
);
const TileLayer = lazy(() =>
  import("react-leaflet").then((m) => ({ default: m.TileLayer }))
);
const Marker = lazy(() =>
  import("react-leaflet").then((m) => ({ default: m.Marker }))
);
const useMapEvents = lazy(() =>
  import("react-leaflet").then((m) => ({ default: m.useMapEvents }))
);

// Fix Leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true";

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
  }, [address, lat, lng, onChange]);

  // ==================== MOCK MODE ====================
  if (USE_MOCK) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location (Mock Mode)
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. East Legon, Accra"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Mock mode — set <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">VITE_USE_MOCK=false</code> for real map.
        </p>
      </div>
    );
  }

  // ==================== REAL MAP WITH FALLBACK ====================
  const MapComponent = () => {
    try {
      const ClickHandler = () => {
        useMapEvents({
          click(e) {
            setLat(e.latlng.lat.toFixed(6));
            setLng(e.latlng.lng.toFixed(6));
          },
        });
        return null;
      };

      const center = lat && lng ? [Number(lat), Number(lng)] : [5.6037, -0.1870];

      return (
        <div className="space-y-4">
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                Loading map...
              </div>
            }>
              <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {lat && lng && <Marker position={[Number(lat), Number(lng)]} />}
                <ClickHandler />
              </MapContainer>
            </Suspense>
          </div>

          <div className="grid grid-cols-2 gap- Scol-4">
            <input
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      );
    } catch {
      // Fallback when react-leaflet not installed
      return (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-lg">
          <p className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Interactive Map Not Available</p>
          <p className="text-sm text-amber-800 dark:text-amber-400 mb-4">
            Install the required packages:
            <br />
            <code className="bg-amber-100 dark:bg-amber-800/50 px-2 py-1 rounded text-xs font-mono text-amber-900 dark:text-amber-200">
              npm install leaflet react-leaflet
            </code>
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Address"
_like
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Latitude (e.g. 5.6037)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Longitude (e.g. -0.1870)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return <MapComponent />;
}