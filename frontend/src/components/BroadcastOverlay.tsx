"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import {
  BroadcastOverlayPayload,
  LanguageCode,
  PersonaMode,
} from "@/types/match";

interface BroadcastOverlayProps {
  overlay: BroadcastOverlayPayload | null;
  selectedPersona: PersonaMode;
  selectedLanguage: LanguageCode;
  onOpenReceipts: (overlay: BroadcastOverlayPayload) => void;
}

export const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({
  overlay,
  selectedPersona,
  selectedLanguage,
  onOpenReceipts,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (overlay) {
      setVisible(true);
      // Auto-hide lower-third after 10 seconds of idle display
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [overlay?.overlay_id]);

  if (!overlay || !visible) return null;

  // Retrieve persona and language localized text
  const translations = overlay.personas?.translations || {};
  const currentLangPack = translations[selectedLanguage] || translations["en"] || {};
  const subtext = currentLangPack[selectedPersona] || overlay.subtext;
  const headline = currentLangPack.headline || overlay.headline;
  const isArabic = selectedLanguage === "ar";

  const isCorrected = overlay.verification?.correction_applied;

  const getOverlayBadgeColor = (type: string) => {
    switch (type) {
      case "goal_threat":
        return "bg-rose-600 text-white border-rose-400";
      case "line_breaking_pass":
        return "bg-cyan-600 text-white border-cyan-400";
      case "high_press_turnover":
        return "bg-emerald-600 text-white border-emerald-400";
      case "chaos_surge":
        return "bg-amber-600 text-white border-amber-400";
      case "sprint_alert":
        return "bg-purple-600 text-white border-purple-400";
      default:
        return "bg-slate-700 text-white border-slate-500";
    }
  };

  return (
    <div
      className={`absolute bottom-3 left-4 right-4 z-20 transition-all duration-500 transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-slate-950/95 border-2 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isCorrected
            ? "border-amber-500/80 shadow-amber-950/50"
            : "border-cyan-500/60 shadow-cyan-950/50"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Left: Event Tag, Headline, Subtext */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border shadow-sm ${getOverlayBadgeColor(
                overlay.overlay_type
              )}`}
            >
              {overlay.overlay_type.replace(/_/g, " ")}
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Min {overlay.match_clock}
            </span>
            {isCorrected && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                AUTO-CORRECTED
              </span>
            )}
          </div>

          <h3 className="text-sm md:text-base font-black text-white tracking-tight line-clamp-1">
            {headline}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {subtext}
          </p>

          {/* Metrics Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {Object.entries(overlay.metrics_badge || {}).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-slate-300"
              >
                <span className="text-slate-500 uppercase">{key}:</span>
                <span className="text-cyan-300 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Studio Verifier Verification Receipt Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <button
            onClick={() => onOpenReceipts(overlay)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap ${
              isCorrected
                ? "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 shadow-amber-900/30"
                : "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 shadow-emerald-900/30"
            }`}
            title="Inspect raw telemetry vectors, defender distances, and claim audit logs"
          >
            {isCorrected ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {isCorrected
                ? "AUTO-CORRECTED BY STUDIO AGENT"
                : "VERIFIED BY STUDIO AGENT"}
            </span>
            <span className="text-[10px] opacity-75 font-normal">(Receipts)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
