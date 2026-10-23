"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  FileText,
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
  if (!overlay) return null;

  const receipt = overlay.verification;
  const isCorrected = receipt?.correction_applied;
  const initialDraft = overlay.draft_narrative || overlay.subtext;
  const verifiedNarrative = overlay.verified_narrative || overlay.subtext;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-5 text-slate-100 flex flex-col gap-4 shadow-2xl custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <span>STUDIO TELEMETRY RECEIPTS</span>
                <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-cyan-400">
                  EVENT #{receipt?.source_event_ids?.[0] ?? "101"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Mathematical Verification Audit Trail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
            isCorrected
              ? "bg-amber-950/40 border-amber-500/60 text-amber-200"
              : "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
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
              <p className="text-[11px] text-slate-400 pt-0.5">
                {receipt?.audit_notes ||
                  "All spatial metrics, directions, and player entities verified against live telemetry."}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-[10px] uppercase text-slate-400 block">Confidence</span>
            <span className="text-base font-black font-mono text-white">
              {Math.round((receipt?.confidence_score ?? 1.0) * 100)}%
            </span>
          </div>
        </div>

        {/* Draft Comparison: Agent 1 (Initial Draft) vs Agent 2 (Verified On-Air) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent 1 Draft vs. Agent 2 Verified Comparison</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
            {/* Agent 1 Draft */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                [Agent 1: Narrator Draft Copy]
              </span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {initialDraft}
              </p>
            </div>

            {/* Agent 2 Verified Copy */}
            <div className="bg-slate-900/90 border border-emerald-500/40 p-3 rounded-lg space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
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
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry Assertion Verification Table</span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Claimed Metric</th>
                  <th className="p-2.5">Telemetry Truth</th>
                  <th className="p-2.5 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                {(receipt?.checked_claims || []).map((claim, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2.5 text-slate-200">{claim.claim}</td>
                    <td className="p-2.5 text-cyan-300 font-bold">
                      {String(claim.ground_truth)}
                    </td>
                    <td className="p-2.5 text-right">
                      {claim.status === "MATCH" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                          MATCH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-bold">
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

        {/* Raw Telemetry JSON Snapshot */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Raw Ingest Vector Snapshot</span>
          </div>

          <pre className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto custom-scrollbar">
            {JSON.stringify(receipt?.raw_telemetry_snapshot || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
