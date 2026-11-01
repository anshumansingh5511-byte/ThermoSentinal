"use client";

import React, { useEffect, useRef, useState } from "react";
import { HotspotRecord } from "@/lib/types";
import { Satellite, Map as MapIcon, Layers, ShieldAlert } from "lucide-react";

interface MapProps {
  hotspots: HotspotRecord[];
  selectedHotspot: HotspotRecord | null;
  onSelectHotspot: (hotspot: HotspotRecord) => void;
}

type TileProvider = "satellite" | "dark" | "osm";

export default function Map({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const circleGroupRef = useRef<any>(null);
  const [tileProvider, setTileProvider] = useState<TileProvider>("satellite");
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      if (!isMounted) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Initialize Map centered over India
        const map = L.map(mapContainerRef.current, {
          center: [22.0, 78.5],
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
        });

        // Add custom top-right zoom control
        L.control.zoom({ position: "topright" }).addTo(map);

        // Attribution
        L.control
          .attribution({ position: "bottomleft" })
          .addAttribution("NASA FIRMS | Esri | ISRO NRSC")
          .addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);
        circleGroupRef.current = L.layerGroup().addTo(map);

        // Initial Tile Layer
        updateTileLayer(map, L, tileProvider);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when provider changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      updateTileLayer(mapInstanceRef.current, L, tileProvider);
    });
  }, [tileProvider]);

  const updateTileLayer = (map: any, L: any, provider: TileProvider) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    let maxZoom = 19;

    if (provider === "dark") {
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (provider === "osm") {
      url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    const layer = L.tileLayer(url, {
      maxZoom,
      subdomains: provider === "dark" ? "abcd" : "abc",
    }).addTo(map);

    tileLayerRef.current = layer;
  };

  // Render Hotspot Markers and 500m Safety Perimeters
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    import("leaflet").then((L) => {
      const markersGroup = markersGroupRef.current;
      const circleGroup = circleGroupRef.current;
      markersGroup.clearLayers();
      circleGroup.clearLayers();

      hotspots.forEach((hotspot) => {
        const isSelected = selectedHotspot?.id === hotspot.id;

        // Custom HTML Marker icon based on classification and critical status
        let iconHtml = "";
        let className = "";

        if (hotspot.is_critical) {
          className = "critical-pin";
          iconHtml = `
            <div class="pulse-marker-critical flex items-center justify-center cursor-pointer">
              <div class="w-7 h-7 rounded-full bg-rose-600 border-2 ${
                isSelected ? "border-white scale-125" : "border-rose-300"
              } flex items-center justify-center shadow-lg shadow-rose-950">
                <svg class="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
            </div>
          `;
        } else if (hotspot.classification === "Normal Industrial Flare") {
          iconHtml = `
            <div class="flex items-center justify-center cursor-pointer">
              <div class="w-6 h-6 rounded-full bg-amber-500 border-2 ${
                isSelected ? "border-white scale-125" : "border-amber-200"
              } flex items-center justify-center shadow-md shadow-amber-950">
                <span class="text-xs">🔥</span>
              </div>
            </div>
          `;
        } else if (hotspot.classification === "Agricultural Burn") {
          iconHtml = `
            <div class="flex items-center justify-center cursor-pointer">
              <div class="w-5 h-5 rounded-full bg-emerald-600 border-2 ${
                isSelected ? "border-white scale-125" : "border-emerald-200"
              } flex items-center justify-center shadow-md shadow-emerald-950">
                <span class="text-[10px]">🌾</span>
              </div>
            </div>
          `;
        } else {
          // Wildfire
          iconHtml = `
            <div class="flex items-center justify-center cursor-pointer">
              <div class="w-5 h-5 rounded-full bg-orange-600 border-2 ${
                isSelected ? "border-white scale-125" : "border-orange-200"
              } flex items-center justify-center shadow-md shadow-orange-950">
                <span class="text-[10px]">🌲</span>
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: iconHtml,
          className: className,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([hotspot.lat, hotspot.lng], {
          icon: customIcon,
        });

        // Popup content
        const popupHtml = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px; min-width: 200px;">
            <div style="font-weight: bold; color: ${hotspot.is_critical ? '#f43f5e' : '#38bdf8'}; margin-bottom: 4px;">
              ${hotspot.is_critical ? '⚠️ CRITICAL ANOMALOUS FIRE' : hotspot.classification}
            </div>
            <div style="color: #cbd5e1; font-weight: bold; margin-bottom: 2px;">
              ${hotspot.nearest_facility.name}
            </div>
            <div style="color: #94a3b8; margin-bottom: 4px;">
              ${hotspot.nearest_facility.city}, ${hotspot.nearest_facility.state}
            </div>
            <div style="color: #38bdf8; font-weight: bold; margin-bottom: 6px; font-size: 10px;">
              🕒 ${hotspot.formatted_time_ist || new Date(hotspot.timestamp).toLocaleString()}
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 4px; margin-bottom: 2px;">
              <span style="color: #94a3b8;">Current FRP:</span>
              <span style="color: #f59e0b; font-weight: bold;">${hotspot.frp} MW</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #94a3b8;">Baseline:</span>
              <span style="color: #94a3b8;">${hotspot.baseline_frp} MW (${hotspot.ratio_to_baseline}x)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94a3b8;">Plant Proximity:</span>
              <span style="color: ${hotspot.nearest_facility.distance_m < 500 ? '#f43f5e' : '#38bdf8'}; font-weight: bold;">
                ${hotspot.nearest_facility.distance_m}m
              </span>
            </div>
            <button id="btn-${hotspot.id}" style="
              width: 100%;
              background: #0284c7;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 4px 8px;
              font-weight: bold;
              cursor: pointer;
            ">
              INSPECT TELEMETRY
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-${hotspot.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectHotspot(hotspot);
            };
          }
        });

        marker.on("click", () => {
          onSelectHotspot(hotspot);
        });

        markersGroup.addLayer(marker);

        // Draw 500m Safety Perimeter Circle around Critical Anomalies
        if (hotspot.is_critical) {
          const perimeter = L.circle([hotspot.lat, hotspot.lng], {
            radius: 500, // 500 meters
            color: "#f43f5e",
            fillColor: "#ef4444",
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: "4 4",
          });
          perimeter.bindTooltip("500m Industrial Safety Perimeter", {
            permanent: false,
            direction: "center",
            className: "bg-slate-900 text-rose-300 font-mono text-[10px] px-1 border border-rose-800 rounded",
          });
          circleGroup.addLayer(perimeter);
        }
      });
    });
  }, [hotspots, selectedHotspot]);

  // Center on selected hotspot with smooth flyTo
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.flyTo(
      [selectedHotspot.lat, selectedHotspot.lng],
      13,
      {
        duration: 1.2,
      }
    );
  }, [selectedHotspot]);

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Tile Switcher (Satellite vs Tactical Dark vs OSM) */}
      <div className="absolute top-4 left-4 z-[400] flex items-center bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 shadow-xl text-xs">
        <button
          onClick={() => setTileProvider("satellite")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
            tileProvider === "satellite"
              ? "bg-cyan-600 text-black font-semibold shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
        <button
          onClick={() => setTileProvider("dark")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
            tileProvider === "dark"
              ? "bg-cyan-600 text-black font-semibold shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Tactical Dark</span>
        </button>
        <button
          onClick={() => setTileProvider("osm")}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors ${
            tileProvider === "osm"
              ? "bg-cyan-600 text-black font-semibold shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Streets</span>
        </button>
      </div>

      {/* Legend & Telemetry Key overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-xl text-[11px] font-mono space-y-1.5 hidden md:block">
        <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
          Satellite Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 border border-white animate-pulse"></span>
          <span className="text-rose-300 font-bold">Critical Abnormal Industrial Event</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-amber-300">Normal Industrial Flare</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-emerald-300">Agricultural Burn (Stubble)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-orange-300">Wildfire</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
          <span className="w-3 h-3 border border-rose-500 border-dashed rounded-full bg-rose-500/20"></span>
          <span>500m Safety Perimeter Circle</span>
        </div>
      </div>
    </div>
  );
}

