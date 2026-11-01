"use client";

import React, { useState } from "react";
import { HotspotRecord } from "@/lib/types";
import {
  Flame,
  AlertTriangle,
  ArrowUpDown,
  Compass,
  ExternalLink,
  ShieldAlert,
  Clock,
  Calendar,
} from "lucide-react";

interface HotspotTableProps {
  hotspots: HotspotRecord[];
  selectedHotspot: HotspotRecord | null;
  onSelectHotspot: (hotspot: HotspotRecord) => void;
}

type SortField = "frp" | "ratio_to_baseline" | "anomaly_score" | "confidence" | "distance" | "timestamp";

export default function HotspotTable({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
}: HotspotTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedHotspots = [...hotspots].sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    switch (sortField) {
      case "frp":
        valA = a.frp;
        valB = b.frp;
        break;
      case "ratio_to_baseline":
        valA = a.ratio_to_baseline;
        valB = b.ratio_to_baseline;
        break;
      case "anomaly_score":
        valA = a.anomaly_score;
        valB = b.anomaly_score;
        break;
      case "confidence":
        valA = a.confidence;
        valB = b.confidence;
        break;
      case "distance":
        valA = a.nearest_facility.distance_m;
        valB = b.nearest_facility.distance_m;
        break;
      case "timestamp":
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
        break;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-[#0b0f19] border-t border-slate-800 flex flex-col h-64 text-xs">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 tracking-wide uppercase text-[11px] font-mono">
            Live NASA Satellite Thermal Target Register ({hotspots.length} Detections)
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
          Sorted by Acquisition Date & Time (Indian Standard Time)
        </span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left font-mono text-[11px] border-collapse">
          <thead className="sticky top-0 bg-[#0e1424] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="p-2.5">Status</th>
              <th
                className="p-2.5 cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Acquisition Date & Time (IST)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-2.5">Target ID</th>
              <th className="p-2.5">Classification</th>
              <th className="p-2.5">Nearest Facility</th>
              <th
                className="p-2.5 cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("distance")}
              >
                <div className="flex items-center gap-1">
                  <span>Dist (m)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("frp")}
              >
                <div className="flex items-center gap-1">
                  <span>FRP (MW)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="p-2.5 cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("ratio_to_baseline")}
              >
                <div className="flex items-center gap-1">
                  <span>Multiplier</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-2.5">Sensor</th>
              <th className="p-2.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedHotspots.map((hotspot) => {
              const isSelected = selectedHotspot?.id === hotspot.id;
              return (
                <tr
                  key={hotspot.id}
                  onClick={() => onSelectHotspot(hotspot)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-cyan-950/40 border-l-2 border-l-cyan-400"
                      : hotspot.is_critical
                      ? "bg-rose-950/20 hover:bg-rose-950/40"
                      : "hover:bg-slate-900/60"
                  }`}
                >
                  {/* Status */}
                  <td className="p-2.5">
                    {hotspot.is_critical ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> CRITICAL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        NOMINAL
                      </span>
                    )}
                  </td>

                  {/* Incident Real Date & Time (IST) */}
                  <td className="p-2.5 whitespace-nowrap">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="text-amber-300">{hotspot.formatted_time_ist || hotspot.acq_date}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Zulu: {hotspot.formatted_time_utc || new Date(hotspot.timestamp).toUTCString().slice(17, 22) + " UTC"}
                    </div>
                  </td>

                  {/* ID */}
                  <td className="p-2.5 font-bold text-slate-300">
                    {hotspot.id}
                  </td>

                  {/* Classification */}
                  <td className="p-2.5 font-sans whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        hotspot.classification === "Abnormal Industrial Fire"
                          ? "text-rose-400"
                          : hotspot.classification === "Normal Industrial Flare"
                          ? "text-amber-400"
                          : hotspot.classification === "Agricultural Burn"
                          ? "text-emerald-400"
                          : "text-orange-400"
                      }`}
                    >
                      {hotspot.classification}
                    </span>
                  </td>

                  {/* Facility */}
                  <td className="p-2.5 font-sans truncate max-w-[200px]" title={hotspot.nearest_facility.name}>
                    <div className="font-medium text-slate-200 truncate">
                      {hotspot.nearest_facility.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {hotspot.nearest_facility.city}, {hotspot.nearest_facility.state}
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="p-2.5">
                    <span
                      className={`${
                        hotspot.nearest_facility.distance_m < 500
                          ? "text-rose-400 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {hotspot.nearest_facility.distance_m} m
                    </span>
                  </td>

                  {/* FRP */}
                  <td className="p-2.5">
                    <span
                      className={`font-bold ${
                        hotspot.is_critical ? "text-rose-400" : "text-cyan-300"
                      }`}
                    >
                      {hotspot.frp} MW
                    </span>
                  </td>

                  {/* Anomaly Ratio */}
                  <td className="p-2.5">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        hotspot.ratio_to_baseline > 2.5
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                          : hotspot.ratio_to_baseline > 1.5
                          ? "bg-amber-950/60 text-amber-300"
                          : "text-slate-400"
                      }`}
                    >
                      {hotspot.ratio_to_baseline}x
                    </span>
                  </td>

                  {/* Sensor */}
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">
                    {hotspot.satellite_sensor}
                  </td>

                  {/* Action */}
                  <td className="p-2.5 text-right pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHotspot(hotspot);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-cyan-600 hover:text-black rounded text-slate-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Focus</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
