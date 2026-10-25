"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Camera,
  Volume2,
  VolumeX,
  Target,
  Layers,
} from "lucide-react";
import { ALL_PLAYERS, HealthResponse, ScoreState } from "@/types/match";

interface TopControlBarProps {
  score: ScoreState;
  health: HealthResponse | null;
  isPlaying: boolean;
  playbackSpeed: 1 | 2 | 4;
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onControl: (action: "play" | "pause" | "reset" | "speed", speed?: 1 | 2 | 4) => void;
  onInject: (scenarioId: string) => void;
  onOpenRecap: () => void;
  onOpenVision: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  score,
  health,
  isPlaying,
  playbackSpeed,
  selectedPlayerId,
  onSelectPlayer,
  isAudioEnabled,
  onToggleAudio,
  onControl,
  onInject,
  onOpenRecap,
  onOpenVision,
}) => {
  const modelMode = health?.model_mode || "Deterministic Engine";
  const isAzure = modelMode.includes("Azure");
  const hostingLabel = health?.hosting_label || "ACA-WestUS";
  const latency = health?.last_pipeline_latency_ms || 340;

  return (
    <header className="w-full bg-[#090A0D]/95 border-b border-white/10 text-[#F4F4F6] px-4 py-2 backdrop-blur-xl flex flex-col gap-2 z-40">
      {/* Top Tier: Brand, Scorebug, Restrained Telemetry Status, Action Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand Aperture Mark & TV Split Scorebug */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* Custom Minimalist Studio Aperture Mark */}
            <div className="w-7 h-7 rounded-md bg-[#14171D] border border-white/15 flex items-center justify-center text-white relative overflow-hidden group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="transition-transform duration-500 group-hover:rotate-45">
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="#F4F4F6" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="12" cy="12" r="4.5" stroke="#E5C158" strokeWidth="1.75" />
                <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="#F4F4F6" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-bold tracking-tight text-white text-sm">
                  PITCHPULSE
                </span>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-studio-gold tracking-widest uppercase">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans tracking-tight pt-0.5">
                Premier League Telemetry Intelligence
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Broadcast Television Split Scorebug */}
          <div className="flex items-center bg-[#0D0F12] border border-white/10 rounded-lg px-2.5 py-1 shadow-sm font-sans">
            {/* Home NLR */}
            <div className="flex items-center gap-1.5 pr-2.5">
              <span className="w-1.5 h-4 rounded-full bg-nlr" />
              <span className="font-semibold text-xs text-zinc-300 tracking-wider">NLR</span>
              <span className="text-base font-display font-bold text-white tabular-nums ml-1">
                {score.nlr_score}
              </span>
            </div>

            <span className="text-zinc-600 font-bold text-xs px-1 select-none">−</span>

            {/* Away MSB */}
            <div className="flex items-center gap-1.5 pl-2.5">
              <span className="text-base font-display font-bold text-white tabular-nums mr-1">
                {score.msb_score}
              </span>
              <span className="font-semibold text-xs text-zinc-300 tracking-wider">MSB</span>
              <span className="w-1.5 h-4 rounded-full bg-msb" />
            </div>

            {/* Match Clock */}
            <div className="ml-3 pl-2.5 border-l border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono font-bold text-studio-gold tabular-nums tracking-wide">
                {score.match_clock}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Restrained Studio Engine Telemetry & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Telemetry Status Strip */}
          <div className="hidden xl:flex items-center gap-2.5 bg-[#0D0F12] border border-white/10 rounded-md px-3 py-1 font-mono text-[11px] text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">ENGINE:</span>
              <span className="font-semibold text-zinc-200">
                {isAzure ? `AZURE OPENAI (${hostingLabel})` : `OPENAI-READY (${hostingLabel})`}
              </span>
            </div>

            <span className="text-zinc-700">|</span>

            <div>
              <span className="text-zinc-400">LATENCY:</span>{" "}
              <span className="font-bold text-zinc-200 tabular-nums">{latency}ms</span>
            </div>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIER: 100%</span>
            </div>
          </div>

          {/* Vision AI Inspector Button */}
          <button
            onClick={onOpenVision}
            className="flex items-center gap-1.5 bg-[#14171D] hover:bg-[#1A1F27] border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white font-sans font-semibold px-3 py-1.5 rounded-md text-xs transition-all active:scale-95"
            title="Open AI Vision Auto-Eventing & Homography Inspector"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-400" />
            <span>Vision AI</span>
          </button>

          {/* Catch-Up Action Button (Champagne Broadcast Accent) */}
          <button
            onClick={onOpenRecap}
            className="flex items-center gap-1.5 bg-[#171A21] hover:bg-[#1E232D] border border-studio-gold/40 hover:border-studio-gold text-studio-gold font-sans font-semibold px-3 py-1.5 rounded-md text-xs transition-all active:scale-95 shadow-sm"
            title="Generate 30-second personalized tactical summary"
          >
            <Layers className="w-3.5 h-3.5 text-studio-gold" />
            <span>Joined Late? 30s Recap</span>
          </button>
        </div>
      </div>

      {/* Bottom Tier: Hardware Director Transport Ribbon & Scenario Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Playback Transport Console */}
          <div className="flex items-center gap-1 bg-[#0D0F12] p-1 rounded-md border border-white/10">
            <button
              onClick={() => onControl(isPlaying ? "pause" : "play")}
              className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title={isPlaying ? "Pause simulation" : "Resume simulation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => onControl("reset")}
              className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-0.5" />

            {/* Speeds */}
            <div className="flex items-center gap-0.5 text-[10px] font-mono">
              {([1, 2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onControl("speed", s)}
                  className={`px-2 py-0.5 rounded font-bold transition-all tabular-nums ${
                    playbackSpeed === s
                      ? "bg-white/15 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* 22-Player Cam Spotlight Selector */}
          <div className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded-md border border-white/10">
            <Target className="w-3.5 h-3.5 text-studio-gold" />
            <span className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider font-semibold">
              Player Cam:
            </span>
            <select
              value={selectedPlayerId}
              onChange={(e) => onSelectPlayer(e.target.value)}
              className="bg-[#14171D] border border-white/10 text-zinc-200 text-xs font-sans rounded px-2 py-0.5 focus:outline-none focus:border-studio-gold/60 cursor-pointer"
            >
              <optgroup label="North London Red (NLR)">
                {ALL_PLAYERS.filter((p) => p.team === "NLR").map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.role})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Merseyside Blue (MSB)">
                {ALL_PLAYERS.filter((p) => p.team === "MSB").map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.role})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Live Audio Commentary Synthesis Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-sans transition-all active:scale-95 ${
              isAudioEnabled
                ? "bg-white/10 border-studio-gold/60 text-studio-gold shadow-sm"
                : "bg-[#0D0F12] border-white/10 text-zinc-400 hover:text-zinc-200"
            }`}
            title={isAudioEnabled ? "Live Commentary Audio Active (Click to mute)" : "Enable Web Speech Commentary Audio"}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-studio-gold" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span className="font-semibold">{isAudioEnabled ? "Audio: ON" : "Audio: OFF"}</span>
          </button>
        </div>

        {/* Unified Hardware Scenario Switcher Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-sans uppercase tracking-wider text-zinc-400 font-semibold mr-1">
            Director Scenarios:
          </span>

          <button
            onClick={() => onInject("1")}
            className="px-2.5 py-1 rounded bg-[#0D0F12] hover:bg-[#14171D] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 active:scale-95"
            title="Inject Scenario 1: Line-Breaking Through Pass"
          >
            <span className="text-zinc-500 font-mono text-[10px] font-bold">01</span>
            <span>Line Breaker</span>
          </button>

          <button
            onClick={() => onInject("2")}
            className="px-2.5 py-1 rounded bg-[#0D0F12] hover:bg-[#14171D] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 active:scale-95"
            title="Inject Scenario 2: High Press Turnover & Counter"
          >
            <span className="text-zinc-500 font-mono text-[10px] font-bold">02</span>
            <span>Press Counter</span>
          </button>

          <button
            onClick={() => onInject("3")}
            className="px-2.5 py-1 rounded bg-[#0D0F12] hover:bg-[#14171D] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 active:scale-95"
            title="Inject Scenario 3: End-to-End Chaos Surge"
          >
            <span className="text-zinc-500 font-mono text-[10px] font-bold">03</span>
            <span>Chaos Surge</span>
          </button>

          <button
            onClick={() => onInject("4")}
            className="px-2.5 py-1 rounded bg-[#0D0F12] hover:bg-[#14171D] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 active:scale-95"
            title="Inject Scenario 4: Clinical Goal Finish"
          >
            <span className="text-zinc-500 font-mono text-[10px] font-bold">04</span>
            <span>Clinical Goal</span>
          </button>

          <button
            onClick={() => onInject("5")}
            className="px-2.5 py-1 rounded bg-[#13161C] hover:bg-[#1A1F28] border border-studio-gold/30 hover:border-studio-gold/70 text-zinc-200 hover:text-white text-xs font-sans transition-all flex items-center gap-1.5 active:scale-95"
            title="Inject Scenario 5: Deliberately feeds draft with 4 bypassed defenders; Verifier auto-corrects to 2"
          >
            <span className="text-studio-gold font-mono text-[10px] font-bold">05</span>
            <ShieldCheck className="w-3.5 h-3.5 text-studio-gold" />
            <span>Verifier Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};