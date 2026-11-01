"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Flame, ShieldCheck, AlertTriangle } from "lucide-react";

interface HistoricalChartProps {
  data?: {
    time: string;
    frp: number;
    baseline: number;
  }[];
  currentFrp: number;
  baselineFrp: number;
  isCritical: boolean;
}

export default function HistoricalChart({
  data,
  currentFrp,
  baselineFrp,
  isCritical,
}: HistoricalChartProps) {
  const criticalThreshold = Number((baselineFrp * 2.5).toFixed(1));
  const ratio = (currentFrp / (baselineFrp || 1)).toFixed(2);

  // When only single pass detection exists from NASA FIRMS
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-[#0b0f19] p-3.5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Thermal FRP vs Safety Threshold
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
            Latest Orbit Pass
          </span>
        </div>

        {/* Visual Comparison Bar */}
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Observed Satellite FRP:
            </span>
            <span className={`font-bold ${isCritical ? "text-rose-400" : "text-cyan-300"}`}>
              {currentFrp} MW
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Plant Baseline FRP:</span>
            <span>{baselineFrp} MW</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>2.5x Critical Danger Limit:</span>
            <span className="text-rose-400 font-bold">{criticalThreshold} MW</span>
          </div>

          {/* Meter Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 relative">
            <div
              className={`h-full transition-all ${
                isCritical ? "bg-rose-500" : Number(ratio) > 1.5 ? "bg-amber-500" : "bg-cyan-500"
              }`}
              style={{
                width: `${Math.min(100, (currentFrp / (criticalThreshold * 1.4)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span>Multiplier: <strong className={isCritical ? "text-rose-400" : "text-slate-300"}>{ratio}x Baseline</strong></span>
          <span className={isCritical ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
            {isCritical ? "CRITICAL OUTBURST" : "PERMISSIBLE LIMIT"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          24h Thermal FRP Profile (MW) vs Baseline
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400"></span>
            <span>Observed FRP</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-0.5 bg-slate-500 stroke-dashed"></span>
            <span>Baseline</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-500"></span>
            <span>2.5x Anomaly Limit</span>
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFrp" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isCritical ? "#f43f5e" : "#06b6d4"}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={isCritical ? "#f43f5e" : "#06b6d4"}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
              unit="M"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
              formatter={(value: any, name: string) => [
                `${value} MW`,
                name === "frp" ? "Observed FRP" : "Operational Baseline",
              ]}
              labelFormatter={(label) => `Acquisition: ${label}`}
            />
            <ReferenceLine
              y={criticalThreshold}
              stroke="#e11d48"
              strokeDasharray="3 3"
              label={{
                value: `Critical Alert: ${criticalThreshold} MW`,
                fill: "#f43f5e",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />
            <Area
              type="monotone"
              dataKey="frp"
              stroke={isCritical ? "#f43f5e" : "#06b6d4"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFrp)"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
        <div>
          <span>Current: </span>
          <span className={`font-bold ${isCritical ? "text-rose-400" : "text-cyan-300"}`}>
            {currentFrp} MW
          </span>
        </div>
        <div>
          <span>Baseline: </span>
          <span className="text-slate-300">{baselineFrp} MW</span>
        </div>
        <div>
          <span>Ratio: </span>
          <span className={`font-bold ${isCritical ? "text-rose-400" : "text-amber-300"}`}>
            {ratio}x
          </span>
        </div>
      </div>
    </div>
  );
}
