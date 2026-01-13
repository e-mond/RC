/**
 * Enhanced PropertyMapSearch Component
 * 
 * Interactive map showing all properties with advanced features:
 * - Location detection (GPS)
 * - Satellite/2D view toggle
 * - Sound feedback
 * - Address autocomplete
 * - Click markers to view property details
 * - Shows properties even in mock mode
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, ExternalLink, X, Navigation, Layers, Loader2 } from "lucide-react";
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
import { playNotificationSound } from "@/utils/soundNotifications";

const GHANA_CENTER = fromLonLat([-0.186964, 5.603717]); // Accra, Ghana

// Satellite tile source
const satelliteTiles = new XYZ({
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attributions: "© Esri",
});

// Street view tile source (OpenStreetMap with street view style)
const streetViewTiles = new XYZ({
  url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attributions: "© OpenStreetMap contributors",
});

export default function EnhancedPropertyMapSearch({ properties = [], onPropertySelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersSource = useRef(new VectorSource());
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapView, setMapView] = useState("2d"); // "2d", "satellite", or "street"
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Play sound when location is detected
  const playLocationSound = useCallback(() => {
    playNotificationSound("message", 0.2);
  }, []);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(8));
        const lng = Number(pos.coords.longitude.toFixed(8));
        const location = { lat, lng };

        setUserLocation(location);
        
        // Center map on user location
        if (mapInstance.current) {
          const coords = fromLonLat([lng, lat]);
          mapInstance.current.getView().animate({
            center: coords,
            zoom: 15,
            duration: 800,
          });
        }

        playLocationSound();
        setLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please allow access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Map tile sources
    const lightTiles = new OSM();
    const darkTiles = new XYZ({
      url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attributions: "© OpenStreetMap © CARTO",
    });

    // Create markers for all properties
    markersSource.current.clear();
    
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const marker = new Feature({
          geometry: new Point(
            fromLonLat([Number(lng), Number(lat)])
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

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new Feature({
        geometry: new Point(
          fromLonLat([userLocation.lng, userLocation.lat])
        ),
        type: "user",
      });

      userMarker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzAwN2NmZiIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K",
            scale: 1.2,
          }),
        })
      );

      markersSource.current.addFeature(userMarker);
    }

    const markersLayer = new VectorLayer({
      source: markersSource.current,
    });

    // Calculate bounds if we have properties
    let center = GHANA_CENTER;
    let zoom = 7;

    if (properties.length > 0) {
      const validProperties = properties.filter(
        (p) => (p.latitude || p.lat || p.location?.lat) && (p.longitude || p.lng || p.location?.lng)
      );
      
      if (validProperties.length > 0) {
        const lats = validProperties.map((p) => Number(p.latitude || p.lat || p.location?.lat));
        const lngs = validProperties.map((p) => Number(p.longitude || p.lng || p.location?.lng));
        
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

    // Select tile source based on view mode
    let baseLayer;
    if (mapView === "satellite") {
      baseLayer = new TileLayer({ source: satelliteTiles });
    } else if (mapView === "street") {
      baseLayer = new TileLayer({ source: streetViewTiles });
    } else {
      baseLayer = new TileLayer({ source: isDark ? darkTiles : lightTiles });
    }

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, markersLayer],
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
      
      if (feature && feature.get("property")) {
        const property = feature.get("property");
        setSelectedProperty(property);
        playLocationSound();
        if (onPropertySelect) {
          onPropertySelect(property);
        }
      }
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [properties, isDark, mapView, userLocation, onPropertySelect, playLocationSound]);

  const handleViewProperty = () => {
    if (selectedProperty) {
      navigate(`/tenant/properties/${selectedProperty.id}`);
    }
  };

  const toggleMapView = () => {
    setMapView(mapView === "2d" ? "satellite" : "2d");
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {properties.filter((p) => (p.latitude || p.lat || p.location?.lat) && (p.longitude || p.lng || p.location?.lng)).length} properties
          </span>
          <button
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Get current location"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0b6e4f]" />
            ) : (
              <Navigation className="w-4 h-4 text-[#0b6e4f]" />
            )}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMapView(mapView === "2d" ? "satellite" : mapView === "satellite" ? "street" : "2d")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={`Switch view: ${mapView === "2d" ? "Satellite" : mapView === "satellite" ? "Street" : "2D"}`}
            >
              <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mapView}</span>
          </div>
        </div>
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
