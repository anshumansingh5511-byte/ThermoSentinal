"use client";

import React, { useState } from "react";
import {
  X,
  Bot,
  AlertOctagon,
  ShieldAlert,
  Wind,
  Flame,
  FileText,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { HotspotRecord, AiAnalysisResult } from "@/lib/types";

interface AiAssessmentModalProps {
  hotspot: HotspotRecord | null;
  isOpen: boolean;
  onClose: () => void;
  geminiApiKey: string;
}

export default function AiAssessmentModal({
  hotspot,
  isOpen,
  onClose,
  geminiApiKey,
}: AiAssessmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [source, setSource] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && hotspot) {
      runAnalysis();
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, hotspot?.id]);

  const runAnalysis = async () => {
    if (!hotspot) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotspot,
          apiKey: geminiApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result);
      setSource(data.source || "gemini-api");
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI disaster assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMemo = () => {
    if (!result?.ndrfDispatchMemo) return;
    navigator.clipboard.writeText(result.ndrfDispatchMemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !hotspot) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Gemini AI Disaster Triage & Containment Assessment
                </h3>
                {source === "gemini-api" ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> Gemini 1.5 Flash
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                    Industrial Heuristic Model
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Target: {hotspot.id} • {hotspot.nearest_facility.name} ({hotspot.nearest_facility.city})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="font-mono text-xs">
                Synthesizing NASA FIRMS satellite thermal telemetry & chemical safety models...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300">
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-xs mt-1">{error}</p>
              <button
                onClick={runAnalysis}
                className="mt-3 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded font-mono text-xs"
              >
                Retry
              </button>
            </div>
          ) : result ? (
            <>
              {/* Hazard Banner */}
              <div
                className={`p-3.5 rounded-lg border flex items-center justify-between ${
                  result.hazardLevel === "CRITICAL"
                    ? "bg-rose-950/60 border-rose-600 text-rose-200"
                    : result.hazardLevel === "HIGH"
                    ? "bg-amber-950/60 border-amber-600 text-amber-200"
                    : "bg-emerald-950/60 border-emerald-600 text-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm tracking-wide">
                      HAZARD CLASSIFICATION: {result.hazardLevel}
                    </span>
                    <p className="text-xs opacity-90 mt-0.5">
                      Containment Status: {result.combustionProfile.containmentStatus}
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div>Flame Temp (Est): ~{result.combustionProfile.estimatedFlameTempK} K</div>
                  <div>Plume Radius: ~{result.environmentalRisk.affectedRadiusMeters} m</div>
                </div>
              </div>

              {/* Root Cause Diagnosis */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5 font-mono">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Root Cause & Thermal Signature Diagnosis
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {result.rootCauseDiagnosis}
                </p>
              </div>

              {/* Chemical & Environmental Risk Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 font-mono">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    Combustion & Environmental Dispersion
                  </div>
                  <p className="text-slate-400 text-xs mb-2">
                    {result.environmentalRisk.plumeDispersionRisk}
                  </p>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-slate-400">Suspected Toxic Effluents:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.environmentalRisk.toxicGases.map((gas, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-cyan-300"
                        >
                          {gas}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Target Hydrocarbon Profile
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <span className="text-slate-400">Combustion Feedstock: </span>
                      <span className="text-amber-300 font-semibold">
                        {result.combustionProfile.hydrocarbonTypeLikelihood}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Thermal Output: </span>
                      <span className="text-cyan-300">{hotspot.frp} MW</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Baseline Multiplier: </span>
                      <span className="text-rose-400 font-bold">{hotspot.ratio_to_baseline}x Normal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Immediate Mitigation & Operator Checklist
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {result.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono font-bold mt-0.5">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* NDRF / Fire Department Dispatch Memo */}
              <div className="bg-[#080c14] border border-slate-800 rounded-lg p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
                    <FileText className="w-4 h-4 text-rose-400" />
                    Official Emergency Dispatch Memo
                  </div>
                  <button
                    onClick={handleCopyMemo}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Memo
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-900 whitespace-pre-wrap leading-relaxed">
                  {result.ndrfDispatchMemo}
                </pre>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Powered by Google Gemini Multimodal Reasoning Engine
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Re-analyze
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

