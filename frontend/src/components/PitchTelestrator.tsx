"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  ArrowUpRight,
  CircleDot,
  Undo2,
  Trash2,
  Pin,
  PinOff,
  Sparkles,
  X,
} from "lucide-react";
import {
  TelestrationColor,
  TelestrationPoint,
  TelestrationStroke,
  TelestrationTool,
} from "@/types/match";

interface PitchTelestratorProps {
  isActive: boolean;
  isPlaying: boolean;
  onClose: () => void;
  onAskPunditAboutArea?: (centroidX: number, centroidY: number) => void;
}

const PITCH_LENGTH = 105.0;
const PITCH_WIDTH = 68.0;

const COLORS: { label: string; color: TelestrationColor; bgClass: string }[] = [
  { label: "Premier League Gold", color: "#E5C158", bgClass: "bg-[#E5C158]" },
  { label: "NLR Crimson", color: "#E11D48", bgClass: "bg-[#E11D48]" },
  { label: "MSB Cobalt", color: "#2563EB", bgClass: "bg-[#2563EB]" },
  { label: "Broadcast White", color: "#FFFFFF", bgClass: "bg-white" },
];

export const PitchTelestrator: React.FC<PitchTelestratorProps> = ({
  isActive,
  isPlaying,
  onClose,
  onAskPunditAboutArea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTool, setCurrentTool] = useState<TelestrationTool>("pen");
  const [currentColor, setCurrentColor] = useState<TelestrationColor>("#E5C158");
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<TelestrationStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentPointsRef = useRef<TelestrationPoint[]>([]);

  // Smooth broadcast fade animation state
  const fadeStartTimeRef = useRef<number | null>(null);
  const [fadeAlpha, setFadeAlpha] = useState<number>(1.0);

  // Convert mouse pixel coordinates to pitch meter coordinates (0..105, 0..68)
  const getPitchCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): TelestrationPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 52.5, y: 34.0 };
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    const x = Math.max(0, Math.min(PITCH_LENGTH, (px / canvas.width) * PITCH_LENGTH));
    const y = Math.max(0, Math.min(PITCH_WIDTH, (py / canvas.height) * PITCH_WIDTH));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    setIsDrawing(true);
    fadeStartTimeRef.current = null;
    setFadeAlpha(1.0);
    const pt = getPitchCoords(e);
    currentPointsRef.current = [pt];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    const pt = getPitchCoords(e);
    const pts = currentPointsRef.current;

    if (currentTool === "pen") {
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(last.x - pt.x, last.y - pt.y) > 0.4) {
        pts.push(pt);
      }
    } else {
      // For arrow and ring, point 0 is start, point 1 is current drag tip
      if (pts.length > 1) {
        pts[1] = pt;
      } else {
        pts.push(pt);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pts = [...currentPointsRef.current];
    if (pts.length >= 2 || (pts.length === 1 && currentTool === "ring")) {
      const newStroke: TelestrationStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tool: currentTool,
        color: currentColor,
        width: 3.5,
        points: pts,
        timestamp: Date.now(),
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    currentPointsRef.current = [];
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    setStrokes([]);
    currentPointsRef.current = [];
  };

  // Broadcast Auto-Fade Effect: When playing and not pinned, fade out over 3.5s
  useEffect(() => {
    if (!isPlaying) {
      fadeStartTimeRef.current = null;
      setFadeAlpha(1.0);
      return;
    }

    if (isPinned || strokes.length === 0) {
      setFadeAlpha(1.0);
      return;
    }

    if (fadeStartTimeRef.current === null) {
      fadeStartTimeRef.current = performance.now();
    }

    let animId: number;
    const durationMs = 3500;

    const tickFade = (now: number) => {
      if (!fadeStartTimeRef.current) return;
      const elapsed = now - fadeStartTimeRef.current;
      const remaining = Math.max(0, 1.0 - elapsed / durationMs);
      setFadeAlpha(remaining);

      if (remaining > 0) {
        animId = requestAnimationFrame(tickFade);
      } else {
        setStrokes([]);
        fadeStartTimeRef.current = null;
        setFadeAlpha(1.0);
      }
    };

    animId = requestAnimationFrame(tickFade);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPinned, strokes.length]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const toX = (mx: number) => (mx / PITCH_LENGTH) * w;
      const toY = (my: number) => (my / PITCH_WIDTH) * h;

      ctx.clearRect(0, 0, w, h);

      if (fadeAlpha <= 0 || (strokes.length === 0 && currentPointsRef.current.length === 0)) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.globalAlpha = fadeAlpha;

      // Helper to draw a single stroke
      const drawStroke = (s: TelestrationStroke | { tool: TelestrationTool; color: TelestrationColor; points: TelestrationPoint[]; width: number }) => {
        const pts = s.points;
        if (!pts || pts.length === 0) return;

        ctx.strokeStyle = s.color;
        ctx.fillStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Enhanced studio glow shadow
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;

        if (s.tool === "pen") {
          if (pts.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(toX(pts[0].x), toY(pts[0].y));
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(toX(pts[i].x), toY(pts[i].y));
          }
          ctx.stroke();

          // Draw arrowhead at end of freehand path
          if (pts.length >= 3) {
            const last = pts[pts.length - 1];
            const prev = pts[Math.max(0, pts.length - 4)];
            const angle = Math.atan2(toY(last.y) - toY(prev.y), toX(last.x) - toX(prev.x));
            const headLen = 14;

            ctx.beginPath();
            ctx.moveTo(toX(last.x), toY(last.y));
            ctx.lineTo(
              toX(last.x) - headLen * Math.cos(angle - Math.PI / 6),
              toY(last.y) - headLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              toX(last.x) - headLen * Math.cos(angle + Math.PI / 6),
              toY(last.y) - headLen * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        } else if (s.tool === "arrow") {
          if (pts.length < 2) return;
          const p0 = pts[0];
          const p1 = pts[1];
          const x0 = toX(p0.x);
          const y0 = toY(p0.y);
          const x1 = toX(p1.x);
          const y1 = toY(p1.y);

          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(y1 - y0, x1 - x0);
          const headLen = 16;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(
            x1 - headLen * Math.cos(angle - Math.PI / 6),
            y1 - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            x1 - headLen * Math.cos(angle + Math.PI / 6),
            y1 - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        } else if (s.tool === "ring") {
          const p0 = pts[0];
          const p1 = pts.length > 1 ? pts[1] : { x: p0.x + 3.0, y: p0.y + 3.0 };
          const cx = toX(p0.x);
          const cy = toY(p0.y);
          const rx = Math.hypot(toX(p1.x) - cx, toY(p1.y) - cy);
          const radius = Math.max(16, rx);

          // 1. Soft inner spotlight glow
          const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          radial.addColorStop(0, `${s.color}33`);
          radial.addColorStop(0.7, `${s.color}18`);
          radial.addColorStop(1, `${s.color}00`);
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // 2. Solid ring perimeter
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Dashed outer tactical halo
          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      };

      // 1. Draw confirmed strokes
      strokes.forEach(drawStroke);

      // 2. Draw live stroke currently in progress
      if (isDrawing && currentPointsRef.current.length > 0) {
        drawStroke({
          tool: currentTool,
          color: currentColor,
          points: currentPointsRef.current,
          width: 3.5,
        });
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [strokes, isDrawing, currentTool, currentColor, fadeAlpha]);

  // Handle "Ask Studio Pundit About This Space"
  const handleAskPundit = () => {
    if (!onAskPunditAboutArea || strokes.length === 0) return;
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    strokes.forEach((s) => {
      s.points.forEach((pt) => {
        sumX += pt.x;
        sumY += pt.y;
        count++;
      });
    });

    if (count > 0) {
      const avgX = Math.round((sumX / count) * 10) / 10;
      const avgY = Math.round((sumY / count) * 10) / 10;
      onAskPunditAboutArea(avgX, avgY);
    }
  };

  return (
    <div className={`absolute inset-0 z-30 ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* HTML5 Telestration Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={1050}
        height={680}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full object-contain ${
          isActive ? "cursor-crosshair" : "cursor-default"
        }`}
      />

      {/* Floating Tactical Director Telestrator Toolbar */}
      {isActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#090A0D]/95 border border-white/20 shadow-2xl rounded-xl px-3 py-1.5 backdrop-blur-xl flex items-center gap-2 text-white animate-fade-in font-sans">
          <div className="flex items-center gap-1 pr-2 border-r border-white/10">
            <span className="text-[10px] font-mono font-bold text-studio-gold tracking-wider uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-studio-gold animate-pulse" />
              TELESTRATOR
            </span>
          </div>

          {/* Tools Palette */}
          <div className="flex items-center gap-1 bg-[#14171D] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setCurrentTool("pen")}
              className={`p-1.5 rounded transition-colors ${
                currentTool === "pen"
                  ? "bg-white/20 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Tactical Pen (Freehand + Arrowhead)"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentTool("arrow")}
              className={`p-1.5 rounded transition-colors ${
                currentTool === "arrow"
                  ? "bg-white/20 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Vector Arrow (Passing Lane / Run Vector)"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool("ring")}
              className={`p-1.5 rounded transition-colors ${
                currentTool === "ring"
                  ? "bg-white/20 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Spotlight Halo Ring (Circle Player or Space)"
            >
              <CircleDot className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Palette Chips */}
          <div className="flex items-center gap-1.5 bg-[#14171D] px-2 py-1.5 rounded-lg border border-white/10">
            {COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => setCurrentColor(c.color)}
                className={`w-4 h-4 rounded-full transition-transform ${c.bgClass} ${
                  currentColor === c.color
                    ? "ring-2 ring-white scale-125"
                    : "opacity-60 hover:opacity-100 hover:scale-110"
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Actions: Undo / Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1.5 rounded bg-[#14171D] hover:bg-[#1E232D] border border-white/10 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo last stroke"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-1.5 rounded bg-[#14171D] hover:bg-rose-950/80 border border-white/10 hover:border-rose-700/50 text-zinc-300 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Clear all drawings"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pin Toggle */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans border transition-colors ${
              isPinned
                ? "bg-amber-950/60 border-amber-600/60 text-amber-300 font-semibold"
                : "bg-[#14171D] border-white/10 text-zinc-400 hover:text-zinc-200"
            }`}
            title="When unpinned, drawings automatically fade out over 3.5s upon resuming play"
          >
            {isPinned ? <Pin className="w-3 h-3 text-studio-gold" /> : <PinOff className="w-3 h-3" />}
            <span>{isPinned ? "Pinned" : "Auto-Fade"}</span>
          </button>

          {/* Ask Studio Pundit About This Space */}
          {strokes.length > 0 && onAskPunditAboutArea && (
            <button
              onClick={handleAskPundit}
              className="flex items-center gap-1.5 bg-gradient-to-r from-studio-gold/20 to-amber-500/20 hover:from-studio-gold/30 hover:to-amber-500/30 border border-studio-gold/40 text-studio-gold px-2.5 py-1 rounded text-[11px] font-semibold transition-all shadow-sm active:scale-95"
              title="Submit highlighted zone to Studio Pundit Q&A for telemetry analysis"
            >
              <Sparkles className="w-3 h-3 text-studio-gold" />
              <span>Ask Pundit</span>
            </button>
          )}

          {/* Close Telestrator Mode */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-1"
            title="Exit Telestrator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

