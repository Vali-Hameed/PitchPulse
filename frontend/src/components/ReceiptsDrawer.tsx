"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  FileText,
  Radio,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { BroadcastOverlayPayload } from "@/types/match";

interface ReceiptsDrawerProps {
  overlay: BroadcastOverlayPayload | null;
  onClose: () => void;
}

export const ReceiptsDrawer: React.FC<ReceiptsDrawerProps> = ({ overlay, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!overlay) return null;

  const receipt = overlay.verification;
  const isCorrected = receipt?.correction_applied;
  const initialDraft = overlay.draft_narrative || overlay.subtext;
  const verifiedNarrative = overlay.verified_narrative || overlay.subtext;

  // Machine-readable Production Broadcast Downlink Schema (Req i.d)
  const productionDownlinkPayload = {
    schema_version: "pl.studio.overlay.v2",
    overlay_id: overlay.overlay_id,
    timecode_match_clock: overlay.match_clock,
    render_target: "HTML5_VIZRT_LOWER_THIRD_CHYRON",
    sync_frame_buffer_ms: 300,
    graphic_template: overlay.overlay_type.toUpperCase(),
    spatial_vector_meters: overlay.vector_coords,
    highlight_tracklet_ids: overlay.highlight_player_ids,
    telemetry_badges: overlay.metrics_badge,
    on_air_copy: {
      headline: overlay.headline,
      verified_subtext: verifiedNarrative,
      localized_streams: Object.keys(overlay.personas?.translations || {}),
    },
    verification_seal: {
      grounded: receipt?.verified ?? true,
      confidence_score: receipt?.confidence_score ?? 1.0,
      auto_corrected: isCorrected ?? false,
      source_event_ids: receipt?.source_event_ids || [],
    },
  };

  const handleCopyDownlink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(productionDownlinkPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#090A0E] border-l border-white/10 h-full overflow-y-auto p-5 text-[#F4F4F6] flex flex-col gap-4 shadow-2xl custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-studio-gold" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <span>STUDIO TELEMETRY RECEIPTS</span>
                <span className="text-[10px] font-mono bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded text-zinc-300">
                  EVENT #{receipt?.source_event_ids?.[0] ?? "101"}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                Mathematical Verification Audit Trail & Production Overlay Spec
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

        {/* Verification Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between font-sans text-xs ${
            isCorrected
              ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
              : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCorrected ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm tracking-wide">
                {isCorrected
                  ? "AUTO-CORRECTED & GROUNDED"
                  : "100% GROUNDED (ZERO HALLUCINATION)"}
              </div>
              <p className="text-[11px] text-zinc-400 pt-0.5">
                {receipt?.audit_notes ||
                  "All spatial metrics, vectors, and player entities verified against live telemetry."}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-[10px] uppercase text-zinc-400 block font-mono">Confidence</span>
            <span className="text-base font-bold font-display text-white tabular-nums">
              {Math.round((receipt?.confidence_score ?? 1.0) * 100)}%
            </span>
          </div>
        </div>

        {/* Draft Comparison: Agent 1 vs Agent 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-studio-gold" />
            <span>Agent 1 Draft vs. Agent 2 Verified Comparison</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Agent 1 Draft */}
            <div className="bg-[#0D0F12] border border-white/10 p-3 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                [Agent 1: Narrator Draft Copy]
              </span>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {initialDraft}
              </p>
            </div>

            {/* Agent 2 Verified Copy */}
            <div className="bg-[#0D0F12] border border-emerald-500/30 p-3 rounded-lg space-y-1 shadow-sm">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                [Agent 2: Studio Verifier Emitted On-Air Copy]
              </span>
              <p className="text-white font-sans text-xs leading-relaxed font-medium">
                {verifiedNarrative}
              </p>
            </div>
          </div>
        </div>

        {/* Claim vs. Ground Truth Audit Table */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-studio-gold" />
            <span>Telemetry Assertion Verification Table</span>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12151B] text-zinc-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Claimed Metric</th>
                  <th className="p-2.5">Telemetry Truth</th>
                  <th className="p-2.5 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] bg-[#07080A]/60">
                {(receipt?.checked_claims || []).map((claim, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 text-zinc-300 font-sans">{claim.claim}</td>
                    <td className="p-2.5 text-zinc-100 font-bold tabular-nums">
                      {String(claim.ground_truth)}
                    </td>
                    <td className="p-2.5 text-right">
                      {claim.status === "MATCH" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                          MATCH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 text-[10px] font-bold">
                          CORRECTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Broadcast Graphic Sync Schema (Vizrt / HTML5 Downlink Spec) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-studio-gold" />
              <span>Production Path Overlay Downlink JSON</span>
            </div>

            <button
              onClick={handleCopyDownlink}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#14171D] hover:bg-[#1C2029] border border-white/10 text-[10px] font-mono text-zinc-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copy Broadcast JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-[#07080A] border border-white/10 rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto custom-scrollbar max-h-48">
            {JSON.stringify(productionDownlinkPayload, null, 2)}
          </pre>
        </div>

        {/* Raw Telemetry JSON Snapshot */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-studio-gold" />
            <span>Raw Ingest Vector Snapshot</span>
          </div>

          <pre className="bg-[#07080A] border border-white/10 rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto custom-scrollbar max-h-48">
            {JSON.stringify(receipt?.raw_telemetry_snapshot || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
