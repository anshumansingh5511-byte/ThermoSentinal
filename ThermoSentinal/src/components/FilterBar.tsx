"use client";

import React from "react";
import { Filter, Search, Flame, AlertCircle, Layers, SlidersHorizontal } from "lucide-react";
import { FilterState, ThermalClassification } from "@/lib/types";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  counts: {
    all: number;
    abnormal: number;
    flare: number;
    agri: number;
    wildfire: number;
  };
}

const CLASSIFICATIONS: { label: string; value: ThermalClassification; color: string; countKey: keyof FilterBarProps["counts"] }[] = [
  { label: "Abnormal Industrial Fire", value: "Abnormal Industrial Fire", color: "text-rose-400 border-rose-800/80 bg-rose-950/40", countKey: "abnormal" },
  { label: "Normal Industrial Flare", value: "Normal Industrial Flare", color: "text-amber-400 border-amber-800/80 bg-amber-950/40", countKey: "flare" },
  { label: "Agricultural Burn", value: "Agricultural Burn", color: "text-emerald-400 border-emerald-800/80 bg-emerald-950/40", countKey: "agri" },
  { label: "Wildfire", value: "Wildfire", color: "text-orange-400 border-orange-800/80 bg-orange-950/40", countKey: "wildfire" },
];

export default function FilterBar({ filters, onChange, counts }: FilterBarProps) {
  const toggleClassification = (cls: ThermalClassification) => {
    let updated = [...filters.classifications];
    if (updated.includes(cls)) {
      // Don't allow empty list if only one left, or allow clearing
      updated = updated.filter((c) => c !== cls);
    } else {
      updated.push(cls);
    }
    onChange({ ...filters, classifications: updated });
  };

  const handleSelectAllClassifications = () => {
    if (filters.classifications.length === CLASSIFICATIONS.length) {
      onChange({ ...filters, classifications: [] });
    } else {
      onChange({ ...filters, classifications: CLASSIFICATIONS.map((c) => c.value) });
    }
  };

  return (
    <div className="bg-[#0e1424] border-b border-slate-800 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Classification Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 font-mono flex items-center gap-1 uppercase tracking-wider text-[11px]">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          Classification:
        </span>

        {/* All button */}
        <button
          onClick={handleSelectAllClassifications}
          className={`px-2.5 py-1 rounded border font-medium transition-colors ${
            filters.classifications.length === CLASSIFICATIONS.length || filters.classifications.length === 0
              ? "bg-cyan-950/60 border-cyan-500 text-cyan-200"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          All ({counts.all})
        </button>

        {CLASSIFICATIONS.map((item) => {
          const isSelected = filters.classifications.includes(item.value);
          const count = counts[item.countKey];
          return (
            <button
              key={item.value}
              onClick={() => toggleClassification(item.value)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 font-medium ${
                isSelected
                  ? item.color + " ring-1 ring-white/20"
                  : "bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-current" : "bg-slate-500"}`}></span>
              <span>{item.label}</span>
              <span className="font-mono text-[10px] opacity-80 px-1 bg-black/40 rounded">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Min FRP, Sensor, Search */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Only Critical Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 text-slate-300">
          <input
            type="checkbox"
            checked={filters.onlyCritical}
            onChange={(e) => onChange({ ...filters, onlyCritical: e.target.checked })}
            className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-rose-500"
          />
          <span className="flex items-center gap-1 text-rose-400 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Critical Only
          </span>
        </label>

        {/* Min FRP Slider */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>Min FRP:</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minFrp}
            onChange={(e) => onChange({ ...filters, minFrp: Number(e.target.value) })}
            className="w-20 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="font-mono text-cyan-300 w-12 text-right">
            {filters.minFrp} MW
          </span>
        </div>

        {/* Satellite Sensor Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sensor:</span>
          <select
            value={filters.sensor}
            onChange={(e) => onChange({ ...filters, sensor: e.target.value })}
            className="bg-transparent text-cyan-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-100">ALL (VIIRS + MODIS)</option>
            <option value="VIIRS" className="bg-slate-900 text-slate-100">VIIRS (375m)</option>
            <option value="MODIS" className="bg-slate-900 text-slate-100">MODIS (1km)</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search facility, city..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="bg-slate-900/90 border border-slate-800 rounded pl-8 pr-3 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}

