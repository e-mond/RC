/**
 * PropertyMapView Component
 * 
 * Displays an interactive map showing property location.
 * Used in PropertyDetail page to show property on map.
 * 
 * Features:
 * - Interactive map with property marker
 * - Click to open in Google Maps
 * - Responsive design
 * - Dark/light mode support
 */

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import { useTheme } from "@/context/ThemeContext";

export default function PropertyMapView({ latitude, longitude, address, propertyTitle }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    // Dark/light map tiles
    const lightTiles = new OSM();
    const darkTiles = new XYZ({
      url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attributions: "© OpenStreetMap contributors",
    });

    // Create marker
    const markerSource = new VectorSource();
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([Number(longitude), Number(latitude)])),
    });
    markerSource.addFeature(markerFeature);

    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          scale: 0.8,
        }),
      }),
    });

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: isDark ? darkTiles : lightTiles }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([Number(longitude), Number(latitude)]),
        zoom: 15,
      }),
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [latitude, longitude, isDark]);

  if (!latitude || !longitude) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <p className="text-gray-500 dark:text-gray-400">Location not available</p>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0b6e4f]" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Property Location</h3>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#0b6e4f] hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </a>
      </div>
      <div className="h-64 sm:h-80 w-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
      {address && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{address}</p>
        </div>
      )}
    </div>
  );
}

