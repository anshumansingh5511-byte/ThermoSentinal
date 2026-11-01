"use client";

import React from "react";
import { Flame, Radio, Satellite, AlertTriangle, ShieldCheck, RefreshCw, Key } from "lucide-react";

interface HeaderProps {
  criticalCount: number;
  totalCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenKeyModal: () => void;
  hasGeminiKey: boolean;
  dataMode: string;
  cacheStatus: string;
}

export default function Header({
  criticalCount,
  totalCount,
  onRefresh,
  isRefreshing,
  onOpenKeyModal,
  hasGeminiKey,
  dataMode,
  cacheStatus,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-[#0b0f17]/95 backdrop-blur px-4 py-3 sticky top-0 z-30 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md">
      {/* Brand & Problem Statement Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-amber-600 shadow-lg shadow-rose-950/50">
          <Flame className="w-6 h-6 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              ThermoSentinel
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              NASA FIRMS LIVE (API KEY CONNECTED)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-Time Satellite Thermal Intelligence (VIIRS SNPP & NOAA-20) • Indian Industrial Zones
          </p>
        </div>
      </div>

      {/* Center Ticker: Sensor & Orbital Flyby Status */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-mono bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-md">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>SATELLITE DATA:</span>
          <span className="text-cyan-300 font-semibold uppercase">{dataMode || "RECENT ORBIT FLYBY"}</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow"></span>
          <span className="text-slate-300">GEO BOUND:</span>
          <span className="text-emerald-400 font-semibold">INDIA (68°-98°E)</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>FEED:</span>
          <span className="text-amber-300 uppercase">{cacheStatus === "nasa-firms-live" ? "FRESH PASS" : "LIVE NRT"}</span>
        </div>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-2">
        {/* Critical Alerts Counter */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold ${
            criticalCount > 0
              ? "bg-rose-950/60 border-rose-600/80 text-rose-300 animate-pulse"
              : "bg-slate-900 border-slate-800 text-slate-300"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>CRITICAL:</span>
          <span className="text-white font-mono bg-rose-600 px-1.5 py-0.2 rounded text-[11px]">
            {criticalCount}
          </span>
        </div>

        {/* Total Active Hotspots from NASA */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>NASA TARGETS:</span>
          <span className="text-cyan-300 font-mono font-bold">{totalCount}</span>
        </div>

        {/* Gemini API Key config button */}
        <button
          onClick={onOpenKeyModal}
          title={hasGeminiKey ? "Gemini API Configured" : "Configure Gemini API Key"}
          className={`p-1.5 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
            hasGeminiKey
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60"
              : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline font-mono">Gemini AI</span>
        </button>

        {/* Live NASA FIRMS Sync button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
          title="Force Query NASA Earthdata API"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          <span className="hidden sm:inline">Sync NASA</span>
        </button>
      </div>
    </header>
  );
}
