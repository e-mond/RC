/**
 * PropertyMapSearch Component
 * 
 * Interactive map showing all properties with markers
 * Users can click markers to view property details
 * Supports filtering and search
 */

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, X } from "lucide-react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

const GHANA_CENTER = fromLonLat([-0.186964, 5.603717]); // Accra, Ghana

export default function PropertyMapSearch({ properties = [], onPropertySelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersSource = useRef(new VectorSource());
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dark/light map tiles
    const lightTiles = new OSM();
    const darkTiles = new XYZ({
      url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attributions: "© OpenStreetMap contributors",
    });

    // Create markers for all properties
    markersSource.current.clear();
    
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const marker = new Feature({
          geometry: new Point(
            fromLonLat([Number(property.longitude), Number(property.latitude)])
          ),
          property: property,
        });

        // Custom style with price label
        const price = property.price || property.priceGhs || property.rent || 0;
        const currency = property.currency || "GHS";
        const priceLabel = `${currency === "GHS" ? "₵" : "$"}${price.toLocaleString()}`;

        marker.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: "https://openlayers.org/en/latest/examples/data/icon.png",
              scale: 0.7,
            }),
            text: new Text({
              text: priceLabel,
              offsetY: -35,
              fill: new Fill({ color: "#0b6e4f" }),
              stroke: new Stroke({ color: "#fff", width: 2 }),
              font: "bold 12px sans-serif",
            }),
          })
        );

        markersSource.current.addFeature(marker);
      }
    });

    const markersLayer = new VectorLayer({
      source: markersSource.current,
    });

    // Calculate bounds if we have properties
    let center = GHANA_CENTER;
    let zoom = 7;

    if (properties.length > 0) {
      const validProperties = properties.filter(
        (p) => p.latitude && p.longitude
      );
      
      if (validProperties.length > 0) {
        const lats = validProperties.map((p) => Number(p.latitude));
        const lngs = validProperties.map((p) => Number(p.longitude));
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        center = fromLonLat([
          (minLng + maxLng) / 2,
          (minLat + maxLat) / 2,
        ]);
        
        // Adjust zoom based on spread
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        
        if (maxDiff < 0.01) zoom = 15;
        else if (maxDiff < 0.05) zoom = 13;
        else if (maxDiff < 0.1) zoom = 11;
        else zoom = 9;
      }
    }

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: isDark ? darkTiles : lightTiles }),
        markersLayer,
      ],
      view: new View({
        center: center,
        zoom: zoom,
      }),
    });

    // Handle marker click
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );
      
      if (feature) {
        const property = feature.get("property");
        if (property) {
          setSelectedProperty(property);
          if (onPropertySelect) {
            onPropertySelect(property);
          }
        }
      }
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [properties, isDark, onPropertySelect]);

  const handleViewProperty = () => {
    if (selectedProperty) {
      navigate(`/tenant/properties/${selectedProperty.id}`);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0b6e4f]" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Map View
          </h3>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {properties.filter((p) => p.latitude && p.longitude).length} properties
        </span>
      </div>
      
      <div className="h-96 sm:h-[500px] w-full relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Property Info Popup */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {selectedProperty.title || "Untitled Property"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedProperty.address || selectedProperty.location}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#0b6e4f] font-bold">
                    {selectedProperty.currency === "GHS" ? "₵" : "$"}
                    {(selectedProperty.price || selectedProperty.priceGhs || selectedProperty.rent || 0).toLocaleString()}
                    <span className="text-gray-500 font-normal">/month</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewProperty}
                  className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
