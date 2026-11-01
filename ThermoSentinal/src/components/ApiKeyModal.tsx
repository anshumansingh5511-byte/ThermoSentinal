"use client";

import React, { useState } from "react";
import { X, Key, Check, ShieldCheck, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-slate-700 w-full max-w-md rounded-xl shadow-2xl p-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Google Gemini API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-slate-300">
            ThermoSentinel connects to Google Gemini to perform automated industrial disaster triage, flame temperature modeling, and emergency dispatch memos.
          </p>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-400">Environment variable:</div>
            <div className="text-cyan-300 font-semibold">GEMINI_API_KEY</div>
            <div className="text-slate-500 text-[10px]">
              If set in .env.local or process environment, it is automatically detected. You can also override it below.
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-slate-400 mb-1">
              Gemini API Key (Optional):
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              If left blank, the built-in SIH26162 high-fidelity heuristic disaster reasoning engine is used.
            </span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5 transition-colors"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              "Apply Key"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

