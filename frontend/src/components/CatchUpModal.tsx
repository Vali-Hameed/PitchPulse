"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  Sparkles,
  Trophy,
  X,
  Zap,
  Volume2,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  LanguageCode,
  PersonaMode,
  RecapResponse,
  TeamCode,
} from "@/types/match";

interface CatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: PersonaMode;
  selectedLanguage: LanguageCode;
  onFetchRecap: (
    persona: PersonaMode,
    lang: LanguageCode,
    club: TeamCode
  ) => Promise<RecapResponse | null>;
  onSpeakText?: (text: string, lang: LanguageCode) => void;
}

export const CatchUpModal: React.FC<CatchUpModalProps> = ({
  isOpen,
  onClose,
  selectedPersona,
  selectedLanguage,
  onFetchRecap,
  onSpeakText,
}) => {
  const [club, setClub] = useState<TeamCode>("NLR");
  const [recapData, setRecapData] = useState<RecapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      onFetchRecap(selectedPersona, selectedLanguage, club).then((data) => {
        setRecapData(data);
        setLoading(false);
      });
    }
  }, [isOpen, selectedPersona, selectedLanguage, club, onFetchRecap]);

  if (!isOpen) return null;

  const isArabic = selectedLanguage === "ar";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  {recapData?.headline || "Full-Match Tactical Recap (1'-90')"}
                </h2>
                <span className="text-[10px] bg-amber-950/80 border border-amber-700 text-amber-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  WHOLE GAME
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                All pivotal turning points across the entire match timeline
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

        {/* Match Overview Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase">Match Score</span>
            <span className="text-sm font-bold text-white mt-0.5">
              {recapData?.score || "NLR 1 - 0 MSB"}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase">Key Moments</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5">
              {recapData?.bullets.length || 5} Pivotal Events
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase">Active Persona</span>
            <span className="text-xs font-bold text-amber-400 mt-0.5 capitalize">
              {selectedPersona.replace("_", " ")}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase">Language</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 uppercase">
              {selectedLanguage} Edition
            </span>
          </div>
        </div>

        {/* Club Perspective Preference */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs font-mono">
          <span className="text-slate-400 pl-1">Perspective Filter:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setClub("NLR")}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                club === "NLR"
                  ? "bg-nlr text-white shadow-md shadow-red-900/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              North London Red (NLR)
            </button>
            <button
              onClick={() => setClub("MSB")}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                club === "MSB"
                  ? "bg-msb text-white shadow-md shadow-blue-900/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Merseyside Blue (MSB)
            </button>
          </div>
        </div>

        {/* Content Body: Whole Match Key Moments Timeline */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p>Synthesizing full 90-minute chronological tactical timeline...</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-3.5 pl-5 space-y-4 pt-2">
            {recapData?.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="relative bg-slate-900/75 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-2 transition-all shadow-md group"
              >
                {/* Timeline node icon */}
                <span className="absolute -left-[27px] top-4.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                      Min {bullet.minute}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      {bullet.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSpeakText && (
                      <button
                        onClick={() => onSpeakText(`${bullet.headline}. ${bullet.text}`, selectedLanguage)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Listen to this moment"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      Key Moment #{idx + 1}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs md:text-sm font-bold text-white tracking-tight">
                  {bullet.headline}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {bullet.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Match Clock: {recapData?.match_clock || "64:12"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all text-xs"
          >
            Resume Live Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};
