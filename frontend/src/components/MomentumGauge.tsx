"use client";

import React from "react";
import { Activity } from "lucide-react";
import { ComputedMetrics } from "@/types/match";

interface MomentumGaugeProps {
  metrics: ComputedMetrics | null;
}

export const MomentumGauge: React.FC<MomentumGaugeProps> = ({ metrics }) => {
  const chaos = metrics?.control_chaos_index ?? 28.0;
  const fieldTilt = metrics?.field_tilt_nlr_pct ?? 58.0;
  const msbTilt = Math.round(100 - fieldTilt);

  let statusText = "Methodical Buildup";
  let statusBadgeStyle = "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";
  if (chaos >= 75) {
    statusText = "Transitional Chaos";
    statusBadgeStyle = "text-rose-400 bg-rose-950/40 border-rose-800/60";
  } else if (chaos >= 50) {
    statusText = "Contested Rhythm";
    statusBadgeStyle = "text-studio-gold bg-amber-950/40 border-amber-800/60";
  }

  return (
    <div className="w-full bg-[#0D0F12] border border-white/10 rounded-xl p-3.5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      {/* Left: Precision Linear Tick Scale for Control vs. Chaos */}
      <div className="flex flex-col gap-2 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-0 md:pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-studio-gold" />
            <span>Control vs. Chaos Index</span>
          </div>

          <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded border ${statusBadgeStyle}`}>
            {statusText}
          </span>
        </div>

        {/* Big Tabular Readout */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-bold text-white tabular-nums tracking-tight">
            {chaos.toFixed(0)}
          </span>
          <span className="text-zinc-500 font-mono text-xs">/ 100</span>
        </div>

        {/* F1-Style Precision Linear Scale */}
        <div className="space-y-1">
          <div className="relative w-full h-2.5 bg-[#07080A] rounded-full border border-white/10 overflow-hidden">
            {/* Active Range Fill */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-studio-gold to-rose-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, chaos))}%` }}
            />
          </div>

          {/* Tick Scale Calibration Labels */}
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 tabular-nums pt-0.5">
            <span>00 POSITIONAL</span>
            <span className="text-zinc-600">| 50 |</span>
            <span>100 CHAOS</span>
          </div>
        </div>
      </div>

      {/* Right: Territorial Dominance Matrix with 50% Centerline */}
      <div className="flex flex-col gap-2 pl-0 md:pl-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-nlr" />
            <span className="font-semibold text-[11px]">NLR Territory</span>
            <span className="text-white font-display font-bold tabular-nums ml-1">
              {Math.round(fieldTilt)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-white font-display font-bold tabular-nums mr-1">
              {msbTilt}%
            </span>
            <span className="font-semibold text-[11px]">MSB Territory</span>
            <span className="w-2 h-2 rounded-full bg-msb" />
          </div>
        </div>

        {/* Dual Segmented Bar with Center 50% Marker */}
        <div className="relative w-full bg-[#07080A] h-2.5 rounded-full overflow-hidden border border-white/10 flex shadow-inner">
          {/* 50% Center Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 z-10 -translate-x-1/2 pointer-events-none" />

          {/* Home Fill */}
          <div
            className="bg-nlr h-full transition-all duration-700 ease-out"
            style={{ width: `${fieldTilt}%` }}
          />

          {/* Away Fill */}
          <div
            className="bg-msb h-full transition-all duration-700 ease-out"
            style={{ width: `${msbTilt}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
          <span>Final-Third Possession Dominance</span>
          <span>Rolling 40-Event Window</span>
        </div>
      </div>
    </div>
  );
};