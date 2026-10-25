"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Flame,
  Globe,
  Radio,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Volume2,
} from "lucide-react";
import {
  ALL_PLAYERS,
  BroadcastOverlayPayload,
  ClubLens,
  CULTURAL_DIALECT_LABELS,
  LanguageCode,
  MetricLens,
  PersonaMode,
} from "@/types/match";

interface PersonaFeedProps {
  overlays: BroadcastOverlayPayload[];
  selectedPersona: PersonaMode;
  selectedLanguage: LanguageCode;
  selectedPlayerId?: string;
  onSelectPersona: (persona: PersonaMode) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenReceipts: (overlay: BroadcastOverlayPayload) => void;
  onSpeakText?: (text: string, lang: LanguageCode) => void;
}

export const PersonaFeed: React.FC<PersonaFeedProps> = ({
  overlays,
  selectedPersona,
  selectedLanguage,
  selectedPlayerId,
  onSelectPersona,
  onSelectLanguage,
  onOpenReceipts,
  onSpeakText,
}) => {
  const [clubLens, setClubLens] = useState<ClubLens>("ALL");
  const [metricLens, setMetricLens] = useState<MetricLens>("all");

  const isArabic = selectedLanguage === "ar";
  const activePlayer =
    ALL_PLAYERS.find((p) => p.id === selectedPlayerId) ||
    ALL_PLAYERS.find((p) => p.id === "NLR-8");
  const playerLabel = activePlayer
    ? `#${activePlayer.number} ${activePlayer.name.replace("-Sim", "").split(" ").slice(-1)[0]}`
    : "#8 Vance";

  const dialectInfo =
    CULTURAL_DIALECT_LABELS[selectedLanguage] || CULTURAL_DIALECT_LABELS.en;

  const isMetricPinned = (badgeKey: string): boolean => {
    const k = badgeKey.toLowerCase();
    if (metricLens === "xt") return k.includes("xt");
    if (metricLens === "difficulty") return k.includes("diff");
    if (metricLens === "pressure") return k.includes("pres");
    if (metricLens === "speed") return k.includes("speed");
    return false;
  };

  return (
    <aside className="w-full flex flex-col bg-[#0D0F12] border border-white/10 rounded-xl overflow-hidden shadow-2xl h-[740px]">
      {/* Header with Segmented Persona, Cultural Dialect & Audience Lenses */}
      <div className="p-3 border-b border-white/10 bg-[#090A0D]/90 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-studio-gold" />
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
              Studio Intelligence Feed
            </h2>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#07080A] border border-white/10 rounded-md p-0.5 text-xs font-mono">
            {(["en", "es", "ar", "ko", "fr", "pt", "de"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`px-1.5 py-0.5 rounded transition-all text-[11px] uppercase ${
                  selectedLanguage === lang
                    ? "bg-white/15 text-white font-bold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={`${lang.toUpperCase()} — ${CULTURAL_DIALECT_LABELS[lang].dialect}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Cultural Broadcast Idiom Banner */}
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[#07080A] border border-white/[0.06] text-[10px]">
          <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
            <Globe className="w-3 h-3 text-studio-gold" />
            <span>CULTURAL IDIOM:</span>
          </span>
          <span className="text-zinc-200 font-sans font-medium truncate">
            {dialectInfo.region} · <strong className="text-studio-gold">{dialectInfo.dialect}</strong>
          </span>
        </div>

        {/* 3-Way Persona Segmented Selector */}
        <div className="grid grid-cols-3 gap-1 bg-[#07080A] p-1 rounded-lg border border-white/10 text-xs font-sans">
          <button
            onClick={() => onSelectPersona("analyst")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all font-medium ${
              selectedPersona === "analyst"
                ? "bg-[#181C23] border border-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Analyst</span>
          </button>

          <button
            onClick={() => onSelectPersona("casual")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all font-medium ${
              selectedPersona === "casual"
                ? "bg-[#181C23] border border-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-zinc-400" />
            <span>Casual</span>
          </button>

          <button
            onClick={() => onSelectPersona("player_focus")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all font-medium ${
              selectedPersona === "player_focus"
                ? "bg-[#181C23] border border-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title={`Focus on ${activePlayer?.name || "Player"}`}
          >
            <Target className="w-3.5 h-3.5 text-studio-gold" />
            <span className="truncate">{playerLabel}</span>
          </button>
        </div>

        {/* Audience Personalization Lenses: Club Bias & Single Performance Metric (Hackathon Brief Req i.e) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-white/[0.06] text-[10px] font-mono">
          {/* Club Perspective Filter */}
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 uppercase">Club:</span>
            <div className="flex items-center bg-[#07080A] border border-white/10 rounded p-0.5">
              {(["ALL", "NLR", "MSB"] as const).map((club) => (
                <button
                  key={club}
                  onClick={() => setClubLens(club)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    clubLens === club
                      ? club === "NLR"
                        ? "bg-nlr text-white font-bold"
                        : club === "MSB"
                        ? "bg-msb text-white font-bold"
                        : "bg-white/15 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>

          {/* Single Metric Focus Filter */}
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500 uppercase">Metric:</span>
            <div className="flex items-center bg-[#07080A] border border-white/10 rounded p-0.5">
              {(
                [
                  { id: "all", label: "ALL" },
                  { id: "xt", label: "ΔxT" },
                  { id: "difficulty", label: "DIFF" },
                  { id: "pressure", label: "PRESS" },
                  { id: "speed", label: "SPD" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetricLens(m.id)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    metricLens === m.id
                      ? "bg-studio-gold/20 border border-studio-gold/50 text-studio-gold font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Cards Chronological Spine Feed (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {overlays.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-2 font-sans text-xs">
            <Radio className="w-8 h-8 text-zinc-600 animate-pulse" />
            <p className="font-semibold text-zinc-300">Listening to Live Stream</p>
            <p className="text-[11px] text-zinc-500 max-w-xs">
              Key tactical moments, scenario injections, and custom JSON telemetry events will appear here with verified receipts.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-2 pl-4 space-y-3">
            {overlays.map((ovl) => {
              const trans = ovl.personas?.translations || {};
              const langPack = trans[selectedLanguage] || trans["en"] || {};
              let copy = langPack[selectedPersona] || ovl.subtext;
              const head = langPack.headline || ovl.headline;
              const isCorrected = ovl.verification?.correction_applied;
              const correctedClaims = (ovl.verification?.checked_claims || []).filter(
                (c) => c.status === "CORRECTED"
              );

              // Dynamically adapt Player-Focus to whichever of the 22 players is selected
              if (selectedPersona === "player_focus" && activePlayer) {
                const targetId = ovl.personas?.player_cam_target_id;
                if (targetId && activePlayer.id !== targetId) {
                  const cleanName = activePlayer.name.replace("-Sim", "");
                  copy = `[#${activePlayer.number} ${cleanName} (${activePlayer.role}) Tactical Tracking] Holds off-ball spatial zone while ${copy}`;
                }
              }

              // Sort badge entries so the user's pinned Single Performance Metric appears first
              const badgeEntries = Object.entries(ovl.metrics_badge || {}).sort(
                ([kA], [kB]) => (isMetricPinned(kB) ? 1 : 0) - (isMetricPinned(kA) ? 1 : 0)
              );

              return (
                <div
                  key={ovl.overlay_id}
                  className={`relative bg-[#090A0D]/90 border rounded-xl p-3 space-y-2 transition-all hover:border-white/20 shadow-sm ${
                    isCorrected ? "border-amber-500/40" : "border-white/10"
                  }`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {/* Timeline Node Pip */}
                  <span
                    className={`absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D0F12] ${
                      isCorrected ? "bg-amber-400" : "bg-studio-gold"
                    }`}
                  />

                  {/* Card Top: Clock, Badge, Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-studio-gold bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded tabular-nums">
                        {ovl.match_clock}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                        {ovl.overlay_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    {isCorrected ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60">
                        CORRECTED
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>GROUNDED</span>
                      </div>
                    )}
                  </div>

                  {/* Inline Hallucination Strikethrough Diff */}
                  {isCorrected && correctedClaims.length > 0 && (
                    <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg px-2 py-1 text-[10px] font-mono flex flex-wrap items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-amber-300 font-bold">INTERCEPTED:</span>
                      {correctedClaims.map((c, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          <span className="line-through text-rose-400">{c.claim}</span>
                          <span className="text-zinc-500">→</span>
                          <span className="text-emerald-400 font-bold">
                            {String(c.ground_truth)} ({c.metric_name.replace(/_/g, " ")})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Headline */}
                  <h4 className="text-xs md:text-sm font-display font-bold text-white tracking-tight leading-snug">
                    {head}
                  </h4>

                  {/* Persona Copy */}
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                    {copy}
                  </p>

                  {/* Club Perspective Callout when NLR or MSB Club Lens is active */}
                  {clubLens !== "ALL" && (
                    <div
                      className={`text-[10px] font-sans px-2 py-1 rounded border ${
                        clubLens === "NLR"
                          ? "bg-rose-950/25 border-rose-800/50 text-rose-200"
                          : "bg-blue-950/25 border-blue-800/50 text-blue-200"
                      }`}
                    >
                      <strong className="font-mono uppercase">{clubLens} Lens:</strong>{" "}
                      {clubLens === "NLR"
                        ? "North London Red territorial progression increases final-third box entry probability."
                        : "Merseyside Blue mid-block compactness tested; recovery line must drop 8m to seal half-space."}
                    </div>
                  )}

                  {/* Metrics Badge Row with Single Metric Highlighting */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {badgeEntries.map(([k, v]) => {
                      const pinned = isMetricPinned(k);
                      return (
                        <span
                          key={k}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border tabular-nums transition-all ${
                            pinned
                              ? "bg-studio-gold/20 border-studio-gold text-studio-gold font-bold shadow-sm"
                              : "bg-[#13161C] border-white/10 text-zinc-300"
                          }`}
                        >
                          <strong
                            className={`font-normal uppercase ${
                              pinned ? "text-studio-gold" : "text-zinc-500"
                            }`}
                          >
                            {k}:
                          </strong>{" "}
                          <span className={pinned ? "text-white font-bold" : "text-zinc-100 font-semibold"}>
                            {v}
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Card Footer: View Receipts & Audio Speak */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    {onSpeakText && (
                      <button
                        onClick={() => onSpeakText(`${head}. ${copy}`, selectedLanguage)}
                        className="flex items-center gap-1 text-[10px] font-sans text-zinc-400 hover:text-white transition-colors"
                        title="Speak this commentary card"
                      >
                        <Volume2 className="w-3 h-3 text-studio-gold" />
                        <span>Listen</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenReceipts(ovl)}
                      className="flex items-center gap-1 text-[10px] font-sans text-zinc-300 hover:text-white font-medium hover:underline transition-all ml-auto"
                    >
                      <Receipt className="w-3 h-3 text-zinc-400" />
                      <span>Audit Receipts →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
