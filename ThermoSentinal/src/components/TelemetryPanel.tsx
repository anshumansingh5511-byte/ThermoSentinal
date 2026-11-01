"use client";

import React from "react";
import {
  AlertOctagon,
  Flame,
  Activity,
  Compass,
  Thermometer,
  Shield,
  Bot,
  Building2,
  Calendar,
  Clock,
  Satellite,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { HotspotRecord } from "@/lib/types";
import HistoricalChart from "./HistoricalChart";

interface TelemetryPanelProps {
  hotspot: HotspotRecord | null;
  onOpenAiAssessment: () => void;
  onClose?: () => void;
}

export default function TelemetryPanel({
  hotspot,
  onOpenAiAssessment,
  onClose,
}: TelemetryPanelProps) {
  if (!hotspot) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#0a0e18] border-l border-slate-800">
        <Activity className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-400">No Target Selected</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-[240px]">
          Click any satellite thermal marker on the map or detection register to inspect live telemetry and incident timestamp.
        </p>
      </div>
    );
  }

  const tempCelsius = (hotspot.brightness_temp - 273.15).toFixed(1);
  const isNearPlant = hotspot.nearest_facility.distance_m < 500;

  return (
    <div className="h-full flex flex-col bg-[#090d16] border-l border-slate-800 overflow-y-auto text-xs">
      {/* Header Banner */}
      <div
        className={`p-4 border-b ${
          hotspot.is_critical
            ? "bg-rose-950/40 border-rose-900/60"
            : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-slate-400">
            TARGET // {hotspot.id}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              {hotspot.satellite_sensor}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 lg:hidden"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Classification & Alert Title */}
        <div className="mt-2 flex items-start gap-2.5">
          {hotspot.is_critical ? (
            <div className="p-1.5 rounded bg-rose-600 text-white animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Flame className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-sm font-bold tracking-tight ${
                  hotspot.is_critical ? "text-rose-400" : "text-white"
                }`}
              >
                {hotspot.is_critical ? "CRITICAL ABNORMAL INDUSTRIAL EVENT" : hotspot.classification}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Land Cover: <span className="text-slate-300 font-medium">{hotspot.land_cover}</span>
            </p>
          </div>
        </div>

        {/* Anomaly Ratio Warning Pill */}
        <div className="mt-3 bg-black/40 p-2 rounded border border-slate-800/80 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Baseline Multiplier:</span>
          </div>
          <span
            className={`font-bold text-xs ${
              hotspot.ratio_to_baseline > 2.5
                ? "text-rose-400"
                : hotspot.ratio_to_baseline > 1.5
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {hotspot.ratio_to_baseline}x Baseline FRP
          </span>
        </div>
      </div>

      {/* Body Telemetry */}
      <div className="p-4 space-y-4 flex-1">
        {/* NEW: Prominent Real Time & Date of Incident Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#101b30] border border-cyan-900/60 rounded-lg p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> SATELLITE ACQUISITION TIMESTAMP
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {hotspot.daynight === "D" ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Day Pass</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-cyan-300" />
                  <span>Night Pass</span>
                </>
              )}
            </div>
          </div>

          {/* Formatted Date & IST Time */}
          <div className="space-y-1">
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{hotspot.formatted_time_ist || new Date(hotspot.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Orbital Zulu Time:</span>
              <span className="text-cyan-300 font-semibold">{hotspot.formatted_time_utc || new Date(hotspot.timestamp).toUTCString()}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>NASA Acquisition Date:</span>
              <span className="text-slate-300">{hotspot.acq_date || "Today"}</span>
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* FRP Metric */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Fire Radiative Power
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-xl font-bold font-mono ${hotspot.is_critical ? "text-rose-400" : "text-cyan-300"}`}>
                {hotspot.frp}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">MW</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Baseline: {hotspot.baseline_frp} MW
            </span>
          </div>

          {/* Brightness Temperature */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-cyan-400" /> Brightness Temp
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {hotspot.brightness_temp}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">K</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Approx {tempCelsius} °C
            </span>
          </div>

          {/* Anomaly Engine Score */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-rose-400" /> Anomaly Score
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`text-xl font-bold font-mono ${
                  hotspot.anomaly_score > 0.75
                    ? "text-rose-400"
                    : hotspot.anomaly_score > 0.4
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {(hotspot.anomaly_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
              <div
                className={`h-full ${
                  hotspot.anomaly_score > 0.75
                    ? "bg-rose-500"
                    : hotspot.anomaly_score > 0.4
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${hotspot.anomaly_score * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Sensor Confidence
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-emerald-300">
                {hotspot.confidence}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              FIRMS Quality: High
            </span>
          </div>
        </div>

        {/* Nearest Facility Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Nearest Industrial Plant
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                isNearPlant
                  ? "bg-rose-950/60 border-rose-700 text-rose-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              {hotspot.nearest_facility.distance_m}m Distance
            </span>
          </div>
          <div className="font-semibold text-slate-200 text-xs">
            {hotspot.nearest_facility.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
            <span>Type: <strong className="text-slate-300">{hotspot.nearest_facility.type}</strong></span>
            <span>•</span>
            <span>Location: <strong className="text-slate-300">{hotspot.nearest_facility.city}, {hotspot.nearest_facility.state}</strong></span>
          </div>
          {isNearPlant && (
            <div className="mt-2.5 bg-rose-950/50 border border-rose-900/70 p-2 rounded text-[11px] text-rose-300 flex items-center gap-1.5 font-mono">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>Plant Buffer Zone Violated: &lt;500m to installation.</span>
            </div>
          )}
        </div>

        {/* Satellite Coordinates & Scan Specs */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Coordinates:</span>
            <span className="text-cyan-300">{hotspot.lat.toFixed(4)}°N, {hotspot.lng.toFixed(4)}°E</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Scan / Track Pixel:</span>
            <span className="text-slate-300">{hotspot.scan} km / {hotspot.track} km</span>
          </div>
        </div>

        {/* 24-hour Diurnal FRP Chart */}
        <HistoricalChart
          data={hotspot.history_24h || []}
          currentFrp={hotspot.frp}
          baselineFrp={hotspot.baseline_frp}
          isCritical={hotspot.is_critical}
        />

        {/* Gemini AI Assessment Trigger Button */}
        <button
          onClick={onOpenAiAssessment}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <Bot className="w-4 h-4 text-cyan-200" />
          <span>RUN GEMINI AI DISASTER TRIAGE & REPORT</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
