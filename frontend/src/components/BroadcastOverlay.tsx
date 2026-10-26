"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, X } from "lucide-react";
import {
  ALL_PLAYERS,
  BroadcastOverlayPayload,
  LanguageCode,
  PersonaMode,
} from "@/types/match";

interface BroadcastOverlayProps {
  overlay: BroadcastOverlayPayload | null;
  selectedPersona: PersonaMode;
  selectedLanguage: LanguageCode;
  selectedPlayerId?: string;
  onOpenReceipts: (overlay: BroadcastOverlayPayload) => void;
  onDismiss?: () => void;
}

export const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({
  overlay,
  selectedPersona,
  selectedLanguage,
  selectedPlayerId,
  onOpenReceipts,
  onDismiss,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (overlay) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 12000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [overlay?.overlay_id]);

  if (!overlay || !visible) return null;

  const translations = overlay.personas?.translations || {};
  const currentLangPack = translations[selectedLanguage] || translations["en"] || {};
  let subtext = currentLangPack[selectedPersona] || overlay.subtext;
  const headline = currentLangPack.headline || overlay.headline;
  const isArabic = selectedLanguage === "ar";

  // Dynamically adapt Player-Focus copy if viewer selected a specific player on the 22-player cam
  if (selectedPersona === "player_focus" && selectedPlayerId) {
    const focusedPlayer = ALL_PLAYERS.find((p) => p.id === selectedPlayerId);
    const targetId = overlay.personas?.player_cam_target_id;
    if (focusedPlayer && targetId && focusedPlayer.id !== targetId) {
      const cleanName = focusedPlayer.name.replace("-Sim", "");
      subtext = `[#${focusedPlayer.number} ${cleanName} (${focusedPlayer.role}) Spotlight] Off-ball spatial synchronization: maintains tactical compactness while ${subtext}`;
    }
  }

  const isCorrected = overlay.verification?.correction_applied;
  const correctedClaims = (overlay.verification?.checked_claims || []).filter(
    (c) => c.status === "CORRECTED"
  );

  const getOverlayLabel = (type: string) => {
    switch (type) {
      case "goal_threat":
        return "GOAL THREAT SEQUENCE";
      case "line_breaking_pass":
        return "LINE-BREAKING PASS";
      case "high_press_turnover":
        return "HIGH PRESS TURNOVER";
      case "chaos_surge":
        return "CHAOS TRANSITION";
      case "sprint_alert":
        return "RAPID SPRINT BURST";
      default:
        return type.replace(/_/g, " ").toUpperCase();
    }
  };

  return (
    <div
      className={`absolute bottom-3 left-4 right-4 z-20 transition-all duration-300 transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-[#090A0E]/94 border border-white/10 rounded-xl p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Left Vertical TV Chyron Accent Blade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isCorrected ? "bg-amber-400" : "bg-studio-gold"
          }`}
        />

        {/* Content Body */}
        <div className="flex-1 space-y-1.5 pl-2">
          {/* Top Line: Badge, Clock, Inline Hallucination Diff */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-300 uppercase">
              {getOverlayLabel(overlay.overlay_type)}
            </span>

            <span className="text-xs font-mono text-studio-gold font-bold tabular-nums">
              MIN {overlay.match_clock}
            </span>

            {isCorrected && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/85 border border-amber-500/70 text-amber-200 font-semibold">
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>VERIFIER INTERCEPTED:</span>
                {correctedClaims.length > 0 ? (
                  correctedClaims.map((c, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1">
                      <span className="line-through text-rose-400 opacity-90">{c.claim}</span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-emerald-400 font-bold">
                        {String(c.ground_truth)} ({c.metric_name.replace(/_/g, " ")})
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400 font-bold">Auto-Grounded to Telemetry</span>
                )}
              </div>
            )}
          </div>

          {/* Headline in Space Grotesk */}
          <h3 className="text-sm md:text-base font-display font-bold text-white tracking-tight line-clamp-1">
            {headline}
          </h3>

          {/* Narrative in Inter */}
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-sans">
            {subtext}
          </p>

          {/* Tabular Metric Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {Object.entries(overlay.metrics_badge || {}).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#13161C] border border-white/10 font-mono text-[10px] text-zinc-300"
              >
                <span className="text-zinc-500 uppercase">{key}:</span>
                <span className="text-zinc-100 font-bold tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Authoritative Verification Receipt Trigger & Dismiss Cross */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
          <button
            onClick={() => onOpenReceipts(overlay)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap border ${
              isCorrected
                ? "bg-[#181510] hover:bg-[#221C14] border-amber-500/40 text-amber-300"
                : "bg-[#12151B] hover:bg-[#1A1E26] border-white/15 text-zinc-200 hover:text-white"
            }`}
            title="Inspect raw telemetry vectors, defender distances, and claim audit logs"
          >
            {isCorrected ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>
              {isCorrected ? "Inspect Diff & Receipt" : "Verified Receipt"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
            className="p-1.5 rounded-lg bg-[#14171D] hover:bg-[#1E232D] border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Dismiss event overlay"
            aria-label="Dismiss event overlay"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
