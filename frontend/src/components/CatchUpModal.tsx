"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  X,
  Zap,
  Volume2,
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
        className="w-full max-w-2xl bg-[#090A0E] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 text-[#F4F4F6] flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-studio-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-white">
                  {recapData?.headline || "Full-Match Tactical Recap (1'-90')"}
                </h2>
                <span className="text-[10px] bg-white/[0.06] border border-white/10 text-studio-gold font-mono px-2 py-0.5 rounded uppercase font-semibold">
                  Full 90'
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                All pivotal turning points across the match timeline
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

        {/* Match Overview 4-Column Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-sans">Score</span>
            <span className="text-sm font-bold font-display text-white mt-0.5 tabular-nums">
              {recapData?.score || "NLR 1 - 0 MSB"}
            </span>
          </div>

          <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-sans">Key Moments</span>
            <span className="text-sm font-bold font-display text-studio-gold mt-0.5 tabular-nums">
              {recapData?.bullets.length || 5} Pivotal
            </span>
          </div>

          <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-sans">Active Persona</span>
            <span className="text-xs font-semibold text-zinc-200 mt-0.5 capitalize font-sans">
              {selectedPersona.replace("_", " ")}
            </span>
          </div>

          <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-sans">Edition</span>
            <span className="text-xs font-semibold text-zinc-200 mt-0.5 uppercase">
              {selectedLanguage} Stream
            </span>
          </div>
        </div>

        {/* Club Perspective Switcher */}
        <div className="flex items-center justify-between bg-[#0D0F12] border border-white/10 p-1.5 rounded-xl text-xs font-sans">
          <span className="text-zinc-400 pl-2">Perspective Filter:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setClub("NLR")}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                club === "NLR"
                  ? "bg-nlr text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              North London Red (NLR)
            </button>
            <button
              onClick={() => setClub("MSB")}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                club === "MSB"
                  ? "bg-msb text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Merseyside Blue (MSB)
            </button>
          </div>
        </div>

        {/* Content Body: Whole Match Key Moments Timeline */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400 font-sans text-xs">
            <Loader2 className="w-8 h-8 text-studio-gold animate-spin" />
            <p>Synthesizing full 90-minute chronological tactical timeline...</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3.5 pl-5 space-y-3.5 pt-2">
            {recapData?.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="relative bg-[#0D0F12]/80 border border-white/10 hover:border-white/20 p-3.5 rounded-xl space-y-1.5 transition-all shadow-sm"
              >
                {/* Timeline node */}
                <span className="absolute -left-[25px] top-4 w-2.5 h-2.5 rounded-full bg-studio-gold border-2 border-[#090A0E]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-studio-gold bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded tabular-nums">
                      MIN {bullet.minute}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                      {bullet.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSpeakText && (
                      <button
                        onClick={() => onSpeakText(`${bullet.headline}. ${bullet.text}`, selectedLanguage)}
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Listen to this moment"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-zinc-500">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs md:text-sm font-display font-bold text-white tracking-tight">
                  {bullet.headline}
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {bullet.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs font-sans text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-studio-gold" />
            <span>Match Clock: {recapData?.match_clock || "64:12"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#14171D] hover:bg-[#1A1F28] border border-white/15 text-white font-semibold transition-all text-xs"
          >
            Resume Live Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};