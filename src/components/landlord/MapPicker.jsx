// src/components/landlord/MapPicker.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import "ol/ol.css";

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
import { Style, Icon } from "ol/style";
import Modify from "ol/interaction/Modify";
import { defaults as defaultInteractions } from "ol/interaction";
import { Loader2, Navigation } from "lucide-react";

/**
 * MapPicker – Professional interactive location selector with audio feedback
 *
 * Features:
 * • Address autocomplete (Nominatim, Ghana-biased)
 * • Current location button with high-accuracy GPS
 * • Click/drag marker with reverse geocoding
 * • Dark/light tiles based on system preference
 * • Plays subtle success chime when location is detected
 * • Full two-way sync with parent form
 */
export default function MapPicker({ value = {}, onChange = () => {} }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerSource = useRef(new VectorSource());

  const [query, setQuery] = useState(value.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [locating, setLocating] = useState(false);

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const lightTiles = new OSM();
  const darkTiles = new XYZ({
    url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attributions: "© OpenStreetMap © CARTO",
  });

  /**
   * Play subtle success chime using Web Audio API
   * Gracefully fails silently if blocked by browser autoplay policy
   */
  const playLocationSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch {
      // Silent fallback – common on mobile due to autoplay restrictions
      // No console noise needed
    }
  };

  /**
   * Forward geocoding: autocomplete address search
   */
  const searchAddress = useCallback(async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input + ", Ghana"
        )}&limit=6&countrycodes=gh&addressdetails=1`
      );
      const data = await res.json();

      const formatted = data.map((item) => ({
        display: item.display_name.split(", Ghana")[0].trim(),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      setSuggestions(formatted);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  /**
   * Reverse geocoding: coordinates → readable address
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await res.json();

      if (data?.display_name) {
        const cleanAddress = data.display_name.split(", Ghana")[0].trim();
        onChange({ lat, lng, address: cleanAddress });
        setQuery(cleanAddress);
      }
    } catch {
      // Silent fail – coordinates remain valid
    }
  };

  /**
   * Handle selection from autocomplete suggestions
   */
  const selectSuggestion = (suggestion) => {
    onChange({
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.display,
    });
    setQuery(suggestion.display);
    setShowSuggestions(false);

    const coords = fromLonLat([suggestion.lng, suggestion.lat]);
    markerSource.current.clear();
    markerSource.current.addFeature(new Feature(new Point(coords)));

    mapInstance.current?.getView().animate({
      center: coords,
      zoom: 16,
      duration: 600,
    });
  };

  /**
   * Keyboard navigation for autocomplete dropdown
   */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  /**
   * Use device GPS for current location
   * Plays success sound on acquisition
   */
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(8));
        const lng = Number(pos.coords.longitude.toFixed(8));

        const coords = fromLonLat([lng, lat]);

        markerSource.current.clear();
        markerSource.current.addFeature(new Feature(new Point(coords)));

        mapInstance.current?.getView().animate({
          center: coords,
          zoom: 16,
          duration: 800,
        });

        onChange({ lat, lng });
        await reverseGeocode(lat, lng);

        // Success feedback
        playLocationSuccessSound();

        setLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please allow access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  /**
   * Initialize OpenLayers map (runs once)
   */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const GHANA_CENTER = fromLonLat([-0.1870, 5.6037]); // Accra coords
    const hasCoords = Boolean(value?.lat && value?.lng);

    const markerLayer = new VectorLayer({
      source: markerSource.current,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "https://openlayers.org/en/latest/examples/data/icon.png",
          scale: 0.9,
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      interactions: defaultInteractions({ pinchRotate: false }),
      layers: [
        new TileLayer({ source: isDark ? darkTiles : lightTiles }),
        markerLayer,
      ],
      view: new View({
        center: hasCoords ? fromLonLat([Number(value.lng), Number(value.lat)]) : GHANA_CENTER,
        zoom: hasCoords ? 16 : 7,
      }),
    });

    mapInstance.current = map;

    // Draggable marker
    const modify = new Modify({ source: markerSource.current });
    map.addInteraction(modify);

    modify.on("modifyend", (e) => {
      const feature = e.features.item(0);
      if (!feature) return;

      const [lng, lat] = toLonLat(feature.getGeometry().getCoordinates());
      const fixedLat = Number(lat.toFixed(8));
      const fixedLng = Number(lng.toFixed(8));

      onChange({ lat: fixedLat, lng: fixedLng });
      reverseGeocode(fixedLat, fixedLng);
    });

    // Click to place marker
    map.on("click", (evt) => {
      const [lng, lat] = toLonLat(evt.coordinate);
      const fixedLat = Number(lat.toFixed(8));
      const fixedLng = Number(lng.toFixed(8));

      markerSource.current.clear();
      markerSource.current.addFeature(new Feature(new Point(evt.coordinate)));

      onChange({ lat: fixedLat, lng: fixedLng });
      reverseGeocode(fixedLat, fixedLng);
    });

    // Cleanup
    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Sync external value changes (e.g., form editing address)
   */
  useEffect(() => {
    if (!mapInstance.current) return;

    if (value?.lat && value?.lng) {
      const coords = fromLonLat([Number(value.lng), Number(value.lat)]);
      markerSource.current.clear();
      markerSource.current.addFeature(new Feature(new Point(coords)));

      mapInstance.current.getView().animate({
        center: coords,
        zoom: 16,
        duration: 600,
      });
    } else {
      markerSource.current.clear();
    }

    if (value?.address !== query) {
      setQuery(value.address || "");
    }
  }, [value.lat, value.lng, value.address, query]);

  /**
   * Debounced address search – correctly includes 'query' in dependencies
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchAddress(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchAddress]);

  return (
    <div className="relative w-full h-full">
      {/* Address Search Bar – Centered Top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-30">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search address in Ghana..."
          className="w-full px-6 py-3.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-300 dark:border-gray-600 shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#0b6e4f]/30 text-base font-medium transition-all"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => selectSuggestion(sug)}
                className={`w-full px-6 py-4 text-left text-sm transition-all ${
                  idx === highlightedIndex
                    ? "bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {sug.display}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        onClick={handleCurrentLocation}
        disabled={locating}
        className="absolute top-4 right-4 z-30 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-2xl hover:shadow-3xl transition-all border border-gray-300 dark:border-gray-600"
        title="Use my current location"
      >
        {locating ? (
          <Loader2 className="w-7 h-7 animate-spin text-[#0b6e4f]" />
        ) : (
          <Navigation className="w-7 h-7 text-[#0b6e4f]" />
        )}
      </button>

      {/* Map Container */}
      <div className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Instruction Tooltip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl text-sm font-semibold text-gray-800 dark:text-gray-200">
        Tap to place pin • Drag to adjust position
      </div>
    </div>
  );
}