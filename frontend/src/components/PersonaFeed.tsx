"use client";

import React from "react";
import {
  BarChart3,
  Flame,
  Radio,
  Receipt,
  ShieldCheck,
  Target,
  Volume2,
} from "lucide-react";
import {
  ALL_PLAYERS,
  BroadcastOverlayPayload,
  LanguageCode,
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
  const isArabic = selectedLanguage === "ar";
  const activePlayer =
    ALL_PLAYERS.find((p) => p.id === selectedPlayerId) ||
    ALL_PLAYERS.find((p) => p.id === "NLR-8");
  const playerLabel = activePlayer
    ? `#${activePlayer.number} ${activePlayer.name.replace("-Sim", "").split(" ").slice(-1)[0]}`
    : "#8 Vance";

  return (
    <aside className="w-full flex flex-col bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md h-[680px]">
      {/* Header with Persona & Language Selectors */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Studio Intelligence Feed
            </h2>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => onSelectLanguage("en")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "en"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage("es")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "es"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Español"
            >
              ES
            </button>
            <button
              onClick={() => onSelectLanguage("ar")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "ar"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="العربية (Arabic)"
            >
              AR
            </button>
            <button
              onClick={() => onSelectLanguage("ko")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "ko"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="한국어 (Korean)"
            >
              KO
            </button>
            <button
              onClick={() => onSelectLanguage("fr")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "fr"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Français (French)"
            >
              FR
            </button>
            <button
              onClick={() => onSelectLanguage("pt")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "pt"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Português (Portuguese)"
            >
              PT
            </button>
            <button
              onClick={() => onSelectLanguage("de")}
              className={`px-1.5 py-0.5 rounded transition-all text-[11px] ${
                selectedLanguage === "de"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Deutsch (German)"
            >
              DE
            </button>
          </div>
        </div>

        {/* 3-Way Persona Segmented Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => onSelectPersona("analyst")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all ${
              selectedPersona === "analyst"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analyst</span>
          </button>

          <button
            onClick={() => onSelectPersona("casual")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all ${
              selectedPersona === "casual"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Casual</span>
          </button>

          <button
            onClick={() => onSelectPersona("player_focus")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded transition-all ${
              selectedPersona === "player_focus"
                ? "bg-purple-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Focus on ${activePlayer?.name || "Player"}`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="truncate">{playerLabel}</span>
          </button>
        </div>
      </div>

      {/* Narrative Cards Stream (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {overlays.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2 font-mono text-xs">
            <Radio className="w-8 h-8 text-slate-600 animate-pulse" />
            <p className="font-bold text-slate-300">Listening to Live Stream</p>
            <p className="text-[11px] text-slate-400">
              Key tactical moments and scenario injections will appear here with verified telemetry receipts.
            </p>
          </div>
        ) : (
          overlays.map((ovl) => {
            const trans = ovl.personas?.translations || {};
            const langPack = trans[selectedLanguage] || trans["en"] || {};
            const copy = langPack[selectedPersona] || ovl.subtext;
            const head = langPack.headline || ovl.headline;
            const isCorrected = ovl.verification?.correction_applied;

            return (
              <div
                key={ovl.overlay_id}
                className={`bg-slate-950/80 border rounded-xl p-3 space-y-2 transition-all hover:border-slate-600 shadow-md ${
                  isCorrected ? "border-amber-500/50" : "border-slate-800"
                }`}
                dir={isArabic ? "rtl" : "ltr"}
              >
                {/* Card Top: Clock, Badge, Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded">
                      {ovl.match_clock}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      {ovl.overlay_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  {isCorrected ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                      CORRECTED
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>GROUNDED</span>
                    </div>
                  )}
                </div>

                {/* Headline */}
                <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                  {head}
                </h4>

                {/* Persona Copy */}
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {copy}
                </p>

                {/* Metrics Badge Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {Object.entries(ovl.metrics_badge || {}).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      <strong className="text-slate-400 font-normal">{k}:</strong>{" "}
                      <span className="text-cyan-300 font-semibold">{v}</span>
                    </span>
                  ))}
                </div>

                {/* Card Footer: View Telemetry Receipts Button & Audio Speak */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  {onSpeakText && (
                    <button
                      onClick={() => onSpeakText(`${head}. ${copy}`, selectedLanguage)}
                      className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Speak this commentary card"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>Speak</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenReceipts(ovl)}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-all ml-auto"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>View Telemetry Receipts</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
