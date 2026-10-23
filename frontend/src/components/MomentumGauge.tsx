"use client";

import React from "react";
import { Activity, Flame, Shield } from "lucide-react";
import { ComputedMetrics } from "@/types/match";

interface MomentumGaugeProps {
  metrics: ComputedMetrics | null;
}

export const MomentumGauge: React.FC<MomentumGaugeProps> = ({ metrics }) => {
  const chaos = metrics?.control_chaos_index ?? 28.0;
  const fieldTilt = metrics?.field_tilt_nlr_pct ?? 58.0;
  const msbTilt = Math.round(100 - fieldTilt);

  // Gauge needle rotation angle (-90deg to +90deg for 0 to 100)
  const angle = (chaos / 100) * 180 - 90;

  // Determine chaos status description
  let statusText = "Methodical Buildup";
  let statusColor = "text-emerald-400";
  if (chaos >= 75) {
    statusText = "Transitional Chaos";
    statusColor = "text-rose-400";
  } else if (chaos >= 50) {
    statusText = "Contested Rhythm";
    statusColor = "text-amber-400";
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      {/* Left: Control vs Chaos Semicircle Gauge */}
      <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-0 md:pr-4">
        {/* SVG Semicircle Gauge */}
        <div className="relative w-28 h-16 flex items-center justify-center">
          <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
            {/* Background Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#1E293B"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored Gradient Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#chaosGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (chaos / 100) * 125.6}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="chaosGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>

            {/* Needle Pivot & Needle */}
            <g
              transform={`translate(50, 50) rotate(${angle})`}
              className="transition-transform duration-700 ease-out"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-38"
                stroke="#F8FAFC"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="4" fill="#06B6D4" />
            </g>
          </svg>
        </div>

        {/* Text Stats */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Control vs. Chaos</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {chaos.toFixed(0)}
            </span>
            <span className={`text-xs font-bold font-mono ${statusColor}`}>
              {statusText}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            0 = Positional structure · 100 = End-to-end chaos
          </span>
        </div>
      </div>

      {/* Right: Territorial Field Tilt % Bar */}
      <div className="flex flex-col gap-1.5 pl-0 md:pl-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-nlr" />
            <span className="font-bold">NLR Territory Tilt</span>
            <span className="text-nlr font-black">{Math.round(fieldTilt)}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-msb font-black">{msbTilt}%</span>
            <span className="font-bold">MSB Territory</span>
            <span className="w-2 h-2 rounded-full bg-msb" />
          </div>
        </div>

        {/* Dual-ended Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 flex shadow-inner">
          <div
            className="bg-gradient-to-r from-red-600 to-nlr h-full rounded-l-full transition-all duration-700 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            style={{ width: `${fieldTilt}%` }}
          />
          <div
            className="bg-gradient-to-r from-msb to-blue-600 h-full rounded-r-full transition-all duration-700 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{ width: `${msbTilt}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Final-Third Possession Dominance</span>
          <span>Rolling 40-Event Window</span>
        </div>
      </div>
    </div>
  );
};
