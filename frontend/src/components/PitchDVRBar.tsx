"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Pencil,
  Radio,
  Clock,
  Sparkles,
} from "lucide-react";

interface PitchDVRBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: 1 | 2 | 4;
  onChangeSpeed: (speed: 1 | 2 | 4) => void;
  isLive: boolean;
  secondsBehindLive: number;
  scrubIndex: number;
  dvrBufferLength: number;
  currentMatchClock: string;
  liveMatchClock: string;
  onNudge: (deltaSec: number) => void;
  onScrub: (fraction: number) => void;
  onJumpToLive: () => void;
  isTelestratorActive: boolean;
  onToggleTelestrator: () => void;
}

export const PitchDVRBar: React.FC<PitchDVRBarProps> = ({
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  isLive,
  secondsBehindLive,
  scrubIndex,
  dvrBufferLength,
  currentMatchClock,
  liveMatchClock,
  onNudge,
  onScrub,
  onJumpToLive,
  isTelestratorActive,
  onToggleTelestrator,
}) => {
  // Compute slider percentage (0 to 100)
  const sliderValue =
    isLive || dvrBufferLength <= 1
      ? 100
      : Math.round(((scrubIndex >= 0 ? scrubIndex : dvrBufferLength - 1) / (dvrBufferLength - 1)) * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onScrub(val / 100);
  };

  const formattedOffset =
    secondsBehindLive >= 60
      ? `-${Math.floor(secondsBehindLive / 60)}m ${Math.round(secondsBehindLive % 60)}s`
      : `-${secondsBehindLive.toFixed(1)}s`;

  return (
    <div className="w-full bg-[#090A0D]/95 border-x border-b border-white/10 rounded-b-xl px-4 py-2.5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 font-sans shadow-lg">
      {/* 1. Left Hardware Playback Console */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-1 bg-[#0D0F12] p-1 rounded-lg border border-white/10 shadow-inner">
          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-200 hover:text-white transition-colors"
            title={isPlaying ? "Freeze frame / Pause" : "Resume playback"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-studio-gold" />
            ) : (
              <Play className="w-4 h-4 text-white fill-current" />
            )}
          </button>

          {/* Nudge Back -5s */}
          <button
            onClick={() => onNudge(-5)}
            disabled={dvrBufferLength === 0}
            className="flex items-center gap-0.5 px-2 py-1 rounded text-xs font-mono font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            title="Step back 5 seconds in DVR buffer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">-5s</span>
          </button>

          {/* Nudge Forward +5s */}
          <button
            onClick={() => onNudge(5)}
            disabled={isLive || dvrBufferLength === 0}
            className="flex items-center gap-0.5 px-2 py-1 rounded text-xs font-mono font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            title="Step forward 5 seconds towards live"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="text-[10px]">+5s</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Playback Speed Multipliers */}
          <div className="flex items-center gap-0.5 text-[10px] font-mono">
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all tabular-nums ${
                  playbackSpeed === s
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Telestrator Drawing Suite Button */}
        <button
          onClick={onToggleTelestrator}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm active:scale-95 ${
            isTelestratorActive
              ? "bg-studio-gold/20 border-studio-gold text-studio-gold shadow-studio-gold/10"
              : "bg-[#14171D] hover:bg-[#1C2028] border-white/10 hover:border-white/20 text-zinc-200 hover:text-white"
          }`}
          title="Pause playback and draw tactical telestration on the pitch"
        >
          <Pencil className={`w-3.5 h-3.5 ${isTelestratorActive ? "text-studio-gold animate-bounce" : "text-zinc-400"}`} />
          <span>{isTelestratorActive ? "Telestrating..." : "Telestrate"}</span>
        </button>
      </div>

      {/* 2. Center 60-Second DVR Timeline Scrubber */}
      <div className="flex-1 w-full max-w-2xl flex items-center gap-3 px-1 md:px-3">
        {/* Current Scrubbed Clock */}
        <div className="flex flex-col items-end min-w-[70px]">
          <span
            className={`font-mono font-bold text-xs tracking-wider tabular-nums ${
              isLive ? "text-studio-gold" : "text-amber-400"
            }`}
          >
            {currentMatchClock}
          </span>
          {!isLive && (
            <span className="text-[9px] font-mono text-zinc-500 tabular-nums">
              LIVE {liveMatchClock}
            </span>
          )}
        </div>

        {/* Broadcast Time-Shift Scrub Track */}
        <div className="relative flex-1 flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={dvrBufferLength <= 1}
            className="w-full h-1.5 bg-[#181C23] rounded-lg appearance-none cursor-pointer accent-studio-gold focus:outline-none disabled:opacity-40"
          />

          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
            <span>-60s BUFFER</span>
            <span className="text-zinc-300">
              {isLive ? "REAL-TIME SYNC" : `SHIFT: ${formattedOffset}`}
            </span>
            <span>0s LIVE</span>
          </div>
        </div>
      </div>

      {/* 3. Right Status & Snap-to-Live Pill */}
      <div className="flex items-center gap-2">
        {isLive ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● LIVE</span>
          </div>
        ) : (
          <button
            onClick={onJumpToLive}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-amber-600/30 to-studio-gold/30 hover:from-amber-600/50 hover:to-studio-gold/50 border border-studio-gold/60 text-studio-gold text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 animate-pulse"
            title="Jump back to real-time live synchronization"
          >
            <Radio className="w-3.5 h-3.5 text-studio-gold" />
            <span>GO TO LIVE ({formattedOffset})</span>
          </button>
        )}
      </div>
    </div>
  );
};
