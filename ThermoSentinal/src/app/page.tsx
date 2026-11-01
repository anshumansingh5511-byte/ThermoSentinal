"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import TelemetryPanel from "@/components/TelemetryPanel";
import HotspotTable from "@/components/HotspotTable";
import AiAssessmentModal from "@/components/AiAssessmentModal";
import ApiKeyModal from "@/components/ApiKeyModal";
import { HotspotRecord, FilterState } from "@/lib/types";
import { Loader2, AlertCircle } from "lucide-react";

// Dynamic import of Map to prevent SSR Leaflet window errors
const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080c14] text-slate-500 font-mono text-xs">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
      <span>INITIALIZING NASA SATELLITE RADAR TILES...</span>
    </div>
  ),
});

export default function Home() {
  const [allHotspots, setAllHotspots] = useState<HotspotRecord[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotRecord | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataMode, setDataMode] = useState("Live NRT Satellite Feed");
  const [cacheStatus, setCacheStatus] = useState("nasa-firms-live");
  const [hasLoaded, setHasLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    classifications: [],
    minFrp: 0,
    sensor: "ALL",
    searchQuery: "",
    onlyCritical: false,
  });

  // Fetch authentic hotspots directly from NASA FIRMS API
  const fetchHotspots = useCallback(async (forceRefresh = false) => {
    setIsRefreshing(true);
    try {
      const url = new URL("/api/hotspots", window.location.origin);
      if (forceRefresh) {
        url.searchParams.set("refresh", "true");
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        const incomingData: HotspotRecord[] = json.data || [];
        setAllHotspots(incomingData);
        if (json.data_mode) {
          setDataMode(json.data_mode);
        }
        if (json.cache_status) {
          setCacheStatus(json.cache_status);
        }
      }
    } catch (err) {
      console.error("Failed to load live /api/hotspots", err);
    } finally {
      setIsRefreshing(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchHotspots(false);
    // Retrieve stored Gemini key if present
    const saved = localStorage.getItem("thermosentinel_gemini_key");
    if (saved) setGeminiApiKey(saved);
  }, [fetchHotspots]);

  // Set default selected hotspot to highest FRP or critical event once data arrives
  useEffect(() => {
    if (!selectedHotspot && allHotspots.length > 0) {
      const criticalOne = allHotspots.find((h) => h.is_critical) || allHotspots[0];
      setSelectedHotspot(criticalOne);
    }
  }, [allHotspots, selectedHotspot]);

  const handleSaveKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem("thermosentinel_gemini_key", key);
  };

  // Client-side filtering
  const filteredHotspots = allHotspots.filter((h) => {
    // Classification filter
    if (
      filters.classifications.length > 0 &&
      !filters.classifications.includes(h.classification)
    ) {
      return false;
    }

    // Min FRP filter
    if (h.frp < filters.minFrp) {
      return false;
    }

    // Only Critical
    if (filters.onlyCritical && !h.is_critical) {
      return false;
    }

    // Sensor filter
    if (filters.sensor !== "ALL" && !h.satellite_sensor.startsWith(filters.sensor)) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = h.nearest_facility.name.toLowerCase().includes(q);
      const matchCity = h.nearest_facility.city.toLowerCase().includes(q);
      const matchState = h.nearest_facility.state.toLowerCase().includes(q);
      const matchId = h.id.toLowerCase().includes(q);
      const matchClass = h.classification.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchState && !matchId && !matchClass) {
        return false;
      }
    }

    return true;
  });

  // Calculate counts for badges
  const counts = {
    all: allHotspots.length,
    abnormal: allHotspots.filter((h) => h.classification === "Abnormal Industrial Fire").length,
    flare: allHotspots.filter((h) => h.classification === "Normal Industrial Flare").length,
    agri: allHotspots.filter((h) => h.classification === "Agricultural Burn").length,
    wildfire: allHotspots.filter((h) => h.classification === "Wildfire").length,
  };

  const criticalCount = allHotspots.filter((h) => h.is_critical).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100">
      {/* Top Tactical Header */}
      <Header
        criticalCount={criticalCount}
        totalCount={allHotspots.length}
        onRefresh={() => fetchHotspots(true)}
        isRefreshing={isRefreshing}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasGeminiKey={!!geminiApiKey}
        dataMode={dataMode}
        cacheStatus={cacheStatus}
      />

      {/* Filter Control Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        counts={counts}
      />

      {/* Main Tactical Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / Center: Interactive Map + Hotspot Table */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Map View */}
          <div className="flex-1 relative z-0">
            {hasLoaded && allHotspots.length === 0 ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#080c14]/90 p-6 text-center text-slate-400 font-mono">
                <AlertCircle className="w-10 h-10 text-cyan-400 mb-3" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  No Thermal Anomalies on Latest Satellite Flyby
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  NASA VIIRS (Suomi-NPP / NOAA-20) has recorded no active thermal sources across the queried Indian sector. Click "Sync NASA" to check for newly published passes.
                </p>
              </div>
            ) : null}

            <DynamicMap
              hotspots={filteredHotspots}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </div>

          {/* Bottom Table: Active Detection Register */}
          <HotspotTable
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
          />
        </div>

        {/* Right Side: Telemetry Panel */}
        <div className="w-[420px] h-full flex-shrink-0 hidden md:block">
          <TelemetryPanel
            hotspot={selectedHotspot}
            onOpenAiAssessment={() => setIsAiModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AiAssessmentModal
        hotspot={selectedHotspot}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        geminiApiKey={geminiApiKey}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={geminiApiKey}
        onSaveKey={handleSaveKey}
      />
    </div>
  );
}
