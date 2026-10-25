"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Code2,
  Play,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import {
  ALL_PLAYERS,
  BroadcastOverlayPayload,
  CustomEventIngestRequest,
  EventType,
} from "@/types/match";

interface TelemetryIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: CustomEventIngestRequest) => Promise<BroadcastOverlayPayload | null>;
}

const PRESET_PAYLOADS: Record<
  string,
  { label: string; desc: string; payload: CustomEventIngestRequest }
> = {
  diagonal_switch: {
    label: "Cross-Field Diagonal Pass (External API Feed)",
    desc: "Declan Rice (#20) launches a 52m diagonal switch to Bukayo Saka (#7) in the right channel.",
    payload: {
      match_clock: "67:18",
      event_type: "pass",
      team: "NLR",
      actor_id: "NLR-20",
      target_id: "NLR-7",
      start_x: 42.0,
      start_y: 18.0,
      end_x: 78.0,
      end_y: 56.0,
      ball_speed_kmh: 79.5,
      nearest_defender_dist_m: 1.4,
      defenders_bypassed: 3,
      forced_draft: null,
    },
  },
  msb_counter_shot: {
    label: "Merseyside Blue Box Strike (Away Team Attack)",
    desc: "D. Calvert-Sim (#9) receives in the penalty box and fires a 98 km/h strike on goal.",
    payload: {
      match_clock: "71:04",
      event_type: "shot",
      team: "MSB",
      actor_id: "MSB-9",
      target_id: "MSB-7",
      start_x: 24.0,
      start_y: 38.0,
      end_x: 6.0,
      end_y: 34.0,
      ball_speed_kmh: 98.0,
      nearest_defender_dist_m: 0.9,
      defenders_bypassed: 2,
      forced_draft: null,
    },
  },
  custom_hallucination: {
    label: "Custom Verifier Guardrail Test (Hallucinated Speed & Defenders)",
    desc: "Feeds an unverified draft claiming 5 bypassed defenders and 115 km/h speed when ground truth is 2 defenders and 66 km/h.",
    payload: {
      match_clock: "79:30",
      event_type: "pass",
      team: "NLR",
      actor_id: "NLR-8",
      target_id: "NLR-9",
      start_x: 58.0,
      start_y: 30.0,
      end_x: 84.0,
      end_y: 34.0,
      ball_speed_kmh: 66.0,
      nearest_defender_dist_m: 1.1,
      defenders_bypassed: 2,
      forced_draft:
        "M. Vance-Sim slices a 115 km/h pass through the block, bypassing 5 defenders under 61% pressure (+0.29 xT).",
    },
  },
};

export const TelemetryIngestModal: React.FC<TelemetryIngestModalProps> = ({
  isOpen,
  onClose,
  onIngest,
}) => {
  const [formState, setFormState] = useState<CustomEventIngestRequest>(
    PRESET_PAYLOADS.diagonal_switch.payload
  );
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(PRESET_PAYLOADS.diagonal_switch.payload, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const syncFormToJson = (next: CustomEventIngestRequest) => {
    setFormState(next);
    setJsonText(JSON.stringify(next, null, 2));
    setJsonError(null);
  };

  const handleJsonChange = (raw: string) => {
    setJsonText(raw);
    try {
      const parsed = JSON.parse(raw);
      setFormState((prev) => ({ ...prev, ...parsed }));
      setJsonError(null);
    } catch (e: any) {
      setJsonError("Invalid JSON syntax");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || "");
      handleJsonChange(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (jsonError) return;
    setSubmitting(true);
    try {
      const parsed: CustomEventIngestRequest = JSON.parse(jsonText);
      await onIngest(parsed);
      onClose();
    } catch (e: any) {
      setJsonError(e?.message || "Failed to ingest payload");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#090A0E] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 text-[#F4F4F6] flex flex-col gap-4 max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-studio-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-white">
                  Synthetic Telemetry JSON Ingest & Verifier Lab
                </h2>
                <span className="text-[10px] bg-white/[0.06] border border-white/10 text-studio-gold font-mono px-2 py-0.5 rounded uppercase font-semibold">
                  POST /api/events/ingest
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Stream external JSON match payloads or custom spatial coordinates directly into the 5-stage pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#14171D] hover:bg-[#1A1F27] border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Templates & External File Upload */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 pr-1">
              Sample Payloads:
            </span>
            {Object.entries(PRESET_PAYLOADS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => syncFormToJson(item.payload)}
                className="px-2.5 py-1 rounded bg-[#14171D] hover:bg-[#1C2029] border border-white/10 text-xs font-sans text-zinc-200 transition-all"
                title={item.desc}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs font-sans text-studio-gold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Load External .JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Main Body: Interactive Parameters + Live JSON Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Parameter Controls */}
          <div className="lg:col-span-6 space-y-3 bg-[#0D0F12] border border-white/10 p-3.5 rounded-xl text-xs">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 border-b border-white/10 pb-1.5">
              Spatial Vector & Telemetry Parameters
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Event Type
                </label>
                <select
                  value={formState.event_type}
                  onChange={(e) =>
                    syncFormToJson({
                      ...formState,
                      event_type: e.target.value as EventType,
                    })
                  }
                  className="w-full bg-[#14171D] border border-white/10 rounded px-2 py-1.5 text-white font-sans"
                >
                  <option value="pass">Pass</option>
                  <option value="shot">Shot</option>
                  <option value="goal">Goal</option>
                  <option value="interception">Interception (High Press)</option>
                  <option value="turnover">Turnover (Chaos)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Actor Player
                </label>
                <select
                  value={formState.actor_id}
                  onChange={(e) => {
                    const p = ALL_PLAYERS.find((pl) => pl.id === e.target.value);
                    syncFormToJson({
                      ...formState,
                      actor_id: e.target.value,
                      team: p?.team || formState.team,
                    });
                  }}
                  className="w-full bg-[#14171D] border border-white/10 rounded px-2 py-1.5 text-white font-sans"
                >
                  {ALL_PLAYERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.team}] #{p.number} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Start (X, Y) Meters
                </label>
                <div className="grid grid-cols-2 gap-1.5 font-mono">
                  <input
                    type="number"
                    min={0}
                    max={105}
                    step={1}
                    value={formState.start_x}
                    onChange={(e) =>
                      syncFormToJson({ ...formState, start_x: Number(e.target.value) })
                    }
                    className="bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    max={68}
                    step={1}
                    value={formState.start_y}
                    onChange={(e) =>
                      syncFormToJson({ ...formState, start_y: Number(e.target.value) })
                    }
                    className="bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  End (X, Y) Meters
                </label>
                <div className="grid grid-cols-2 gap-1.5 font-mono">
                  <input
                    type="number"
                    min={0}
                    max={105}
                    step={1}
                    value={formState.end_x}
                    onChange={(e) =>
                      syncFormToJson({ ...formState, end_x: Number(e.target.value) })
                    }
                    className="bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    max={68}
                    step={1}
                    value={formState.end_y}
                    onChange={(e) =>
                      syncFormToJson({ ...formState, end_y: Number(e.target.value) })
                    }
                    className="bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Ball Speed (km/h)
                </label>
                <input
                  type="number"
                  min={10}
                  max={135}
                  value={formState.ball_speed_kmh}
                  onChange={(e) =>
                    syncFormToJson({
                      ...formState,
                      ball_speed_kmh: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Defenders Bypassed (Truth)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formState.defenders_bypassed}
                  onChange={(e) =>
                    syncFormToJson({
                      ...formState,
                      defenders_bypassed: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#14171D] border border-white/10 rounded px-2 py-1 text-white font-mono"
                />
              </div>
            </div>

            {/* Optional Unverified Draft Claim for Verifier Stress Testing */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <label className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Optional: Unverified Draft Claim (Test Hallucination Guardrail)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Leave empty for normal Agent 1 synthesis, or enter a draft with false numbers (e.g. 'bypassing 5 defenders at 115 km/h') to watch Agent 2 auto-correct it..."
                value={formState.forced_draft || ""}
                onChange={(e) =>
                  syncFormToJson({
                    ...formState,
                    forced_draft: e.target.value ? e.target.value : null,
                  })
                }
                className="w-full bg-[#14171D] border border-white/10 rounded p-2 text-zinc-200 font-sans text-xs focus:outline-none focus:border-studio-gold"
              />
            </div>
          </div>

          {/* Right: Raw Editable JSON Payload */}
          <div className="lg:col-span-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
              <span>Raw Synthetic Event JSON Payload</span>
              {jsonError ? (
                <span className="text-rose-400 font-bold">{jsonError}</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Schema Valid
                </span>
              )}
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="flex-1 min-h-[250px] bg-[#07080A] border border-white/10 rounded-xl p-3 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-studio-gold custom-scrollbar"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-sans">
            Computes live ΔxT, Pass Difficulty (0–99), Pressure %, and Verifier Audit Receipt on ingest.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#14171D] hover:bg-[#1A1F28] border border-white/10 text-zinc-300 text-xs font-sans"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !!jsonError}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-studio-gold hover:bg-[#ebd074] text-[#07080A] font-sans font-bold text-xs transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{submitting ? "Streaming..." : "Stream Into 5-Stage Pipeline"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

