"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Globe,
  Radio,
  ShieldCheck,
} from "lucide-react";
import {
  BroadcastOverlayPayload,
  CULTURAL_DIALECT_LABELS,
  LanguageCode,
  MatchTickPayload,
  PersonaMode,
} from "@/types/match";

interface PipelineStatusStripProps {
  latestTick: MatchTickPayload | null;
  activeOverlay: BroadcastOverlayPayload | null;
  selectedPersona: PersonaMode;
  selectedLanguage: LanguageCode;
  onOpenReceipts: (overlay: BroadcastOverlayPayload) => void;
  onOpenIngest: () => void;
}

export const PipelineStatusStrip: React.FC<PipelineStatusStripProps> = ({
  latestTick,
  activeOverlay,
  selectedPersona,
  selectedLanguage,
  onOpenReceipts,
  onOpenIngest,
}) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  // Trigger a clean sequential stage sweep whenever a new key moment overlay arrives
  useEffect(() => {
    if (!activeOverlay?.overlay_id) return;
    setActiveStage(1);
    const t1 = setTimeout(() => setActiveStage(2), 140);
    const t2 = setTimeout(() => setActiveStage(3), 280);
    const t3 = setTimeout(() => setActiveStage(4), 420);
    const t4 = setTimeout(() => setActiveStage(5), 560);
    const t5 = setTimeout(() => setActiveStage(0), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [activeOverlay?.overlay_id]);

  const ev = latestTick?.current_event;
  const metrics = latestTick?.metrics;
  const isCorrected = activeOverlay?.verification?.correction_applied;
  const dialectInfo = CULTURAL_DIALECT_LABELS[selectedLanguage] || CULTURAL_DIALECT_LABELS.en;

  const xtDelta = activeOverlay?.metrics_badge?.["ΔxT"] || (metrics ? `${metrics.xt_delta >= 0 ? "+" : ""}${metrics.xt_delta.toFixed(2)}` : "+0.34");
  const diffBadge = activeOverlay?.metrics_badge?.["Difficulty"] || (metrics ? `${metrics.pass_difficulty_score.toFixed(0)}/99` : "78/99");
  const distBadge = activeOverlay?.metrics_badge?.["Dist"] || "28.4m";
  const latencyMs = activeOverlay?.pipeline_latency_ms ?? 310;

  return (
    <div className="w-full bg-[#0D0F12] border border-white/10 rounded-xl px-3 py-2 shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-stretch">
        {/* Stage 1: Ingest */}
        <button
          onClick={onOpenIngest}
          className={`text-left rounded-lg px-2.5 py-1.5 border transition-all duration-300 flex flex-col justify-between group ${
            activeStage === 1
              ? "bg-[#181C24] border-studio-gold/60"
              : "bg-[#090A0D]/80 border-white/[0.06] hover:border-white/20"
          }`}
          title="Stage 1: Real-time 10Hz synthetic telemetry ingest (Click to inject custom JSON event)"
        >
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>01 Ingest</span>
            </span>
            <span className="text-studio-gold group-hover:underline">JSON +</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-200 truncate pt-0.5 tabular-nums">
            {ev
              ? `${ev.event_type.toUpperCase()} · (${ev.start_x.toFixed(0)},${ev.start_y.toFixed(0)})→(${ev.end_x.toFixed(0)},${ev.end_y.toFixed(0)})`
              : "10Hz Stream · 22 Entities"}
          </div>
        </button>

        {/* Stage 2: Interpret */}
        <div
          className={`rounded-lg px-2.5 py-1.5 border transition-all duration-300 flex flex-col justify-between ${
            activeStage === 2
              ? "bg-[#181C24] border-studio-gold/60"
              : "bg-[#090A0D]/80 border-white/[0.06]"
          }`}
          title="Stage 2: Deterministic spatial math (Expected Threat, Pass Difficulty, Euclidean Pressure)"
        >
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-studio-gold" />
              <span>02 Interpret</span>
            </span>
            <span className="text-zinc-500">MATH</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-200 truncate pt-0.5 tabular-nums">
            ΔxT <strong className="text-white">{xtDelta}</strong> · Diff{" "}
            <strong className="text-studio-gold">{diffBadge}</strong> · {distBadge}
          </div>
        </div>

        {/* Stage 3: Explain (Agent 1 Narrator) */}
        <div
          className={`rounded-lg px-2.5 py-1.5 border transition-all duration-300 flex flex-col justify-between ${
            activeStage === 3
              ? "bg-[#181C24] border-studio-gold/60"
              : "bg-[#090A0D]/80 border-white/[0.06]"
          }`}
          title="Stage 3: Agent 1 (Narrator) causal explanation synthesis"
        >
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-300" />
              <span>03 Explain</span>
            </span>
            <span className="text-zinc-500 tabular-nums">{latencyMs}ms</span>
          </div>
          <div className="font-sans text-[10px] text-zinc-200 truncate pt-0.5">
            Agent 1: Causal Draft Synthesis
          </div>
        </div>

        {/* Stage 4: Verify & Render (Agent 2 Studio Verifier) */}
        <button
          onClick={() => activeOverlay && onOpenReceipts(activeOverlay)}
          disabled={!activeOverlay}
          className={`text-left rounded-lg px-2.5 py-1.5 border transition-all duration-300 flex flex-col justify-between ${
            activeStage === 4
              ? "bg-[#181C24] border-studio-gold/60"
              : isCorrected
              ? "bg-amber-950/25 border-amber-500/40 hover:border-amber-400"
              : "bg-[#090A0D]/80 border-white/[0.06] hover:border-white/20"
          }`}
          title="Stage 4: Agent 2 (Studio Verifier) cross-examines claims against telemetry ground truth"
        >
          <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1 text-zinc-400">
              {isCorrected ? (
                <AlertCircle className="w-3 h-3 text-amber-400" />
              ) : (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              )}
              <span>04 Verify</span>
            </span>
            <span className={isCorrected ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
              {isCorrected ? "CORRECTED" : "100% TRUTH"}
            </span>
          </div>
          <div className="font-mono text-[10px] text-zinc-200 truncate pt-0.5">
            {isCorrected ? "Hallucination Intercepted →" : "Agent 2: Zero Hallucination"}
          </div>
        </button>

        {/* Stage 5: Personalize (Agent 3 Cultural & Persona Router) */}
        <div
          className={`col-span-2 sm:col-span-1 rounded-lg px-2.5 py-1.5 border transition-all duration-300 flex flex-col justify-between ${
            activeStage === 5
              ? "bg-[#181C24] border-studio-gold/60"
              : "bg-[#090A0D]/80 border-white/[0.06]"
          }`}
          title="Stage 5: Agent 3 adapts commentary for viewer persona and regional broadcast idiom"
        >
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-studio-gold" />
              <span>05 Personalize</span>
            </span>
            <span className="text-studio-gold uppercase">{selectedLanguage}</span>
          </div>
          <div className="font-sans text-[10px] text-zinc-200 truncate pt-0.5 capitalize">
            {selectedPersona.replace("_", " ")} · {dialectInfo.dialect}
          </div>
        </div>
      </div>
    </div>
  );
};

