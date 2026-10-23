"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Eye, Grid, Layers, Zap } from "lucide-react";
import {
  BroadcastOverlayPayload,
  FramePayload,
  MatchTickPayload,
  PlayerPosition,
} from "@/types/match";

interface PitchCanvasProps {
  frameBufferRef: React.MutableRefObject<FramePayload[]>;
  latestTick: MatchTickPayload | null;
  activeOverlay: BroadcastOverlayPayload | null;
  isPlayerCamActive: boolean;
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
}

const PITCH_LENGTH = 105.0;
const PITCH_WIDTH = 68.0;

const XT_HEAT = [
  [0.005, 0.006, 0.008, 0.010, 0.014, 0.018, 0.024, 0.032, 0.042, 0.055, 0.070, 0.085],
  [0.006, 0.007, 0.010, 0.013, 0.018, 0.024, 0.035, 0.050, 0.075, 0.110, 0.170, 0.220],
  [0.007, 0.009, 0.012, 0.016, 0.024, 0.035, 0.055, 0.085, 0.125, 0.190, 0.310, 0.430],
  [0.008, 0.010, 0.014, 0.019, 0.028, 0.042, 0.065, 0.090, 0.130, 0.220, 0.380, 0.650],
  [0.008, 0.010, 0.014, 0.019, 0.028, 0.042, 0.065, 0.090, 0.130, 0.220, 0.380, 0.650],
  [0.007, 0.009, 0.012, 0.016, 0.024, 0.035, 0.055, 0.085, 0.125, 0.190, 0.430, 0.430],
  [0.006, 0.007, 0.010, 0.013, 0.018, 0.024, 0.035, 0.050, 0.075, 0.110, 0.170, 0.220],
  [0.005, 0.006, 0.008, 0.010, 0.014, 0.018, 0.024, 0.032, 0.042, 0.055, 0.070, 0.085],
];

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  frameBufferRef,
  latestTick,
  activeOverlay,
  isPlayerCamActive,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showXtGrid, setShowXtGrid] = useState<boolean>(false);
  const [showVoronoi, setShowVoronoi] = useState<boolean>(false);

  // Store the latest rendered player list for click-to-select detection
  const latestRenderedPlayersRef = useRef<PlayerPosition[]>([]);

  // Telemetry HUD state for active focused player
  const [focusedPlayerStats, setFocusedPlayerStats] = useState({
    id: "NLR-8",
    name: "M. Vance-Sim",
    number: 8,
    team: "NLR",
    speed: 14.2,
    stamina: 88,
    distanceKm: 8.4,
    touches: 54,
  });

  // Click-to-select player directly on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickCanvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickCanvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const pitchX = (clickCanvasX / canvas.width) * PITCH_LENGTH;
    const pitchY = (clickCanvasY / canvas.height) * PITCH_WIDTH;

    // Search for closest player within 4.5 meters
    const players = latestRenderedPlayersRef.current;
    let closest: PlayerPosition | null = null;
    let minDist = 4.5;

    for (const p of players) {
      const d = Math.hypot(p.x - pitchX, p.y - pitchY);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }

    if (closest) {
      onSelectPlayer(closest.player_id);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / PITCH_LENGTH;
      const scaleY = height / PITCH_WIDTH;

      const toCanvasX = (mx: number) => mx * scaleX;
      const toCanvasY = (my: number) => my * scaleY;

      ctx.clearRect(0, 0, width, height);

      // Pitch background (Broadcast deep emerald grass)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#064e3b");
      grad.addColorStop(0.5, "#065f46");
      grad.addColorStop(1, "#044e39");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grass cut stripes
      const stripeCount = 12;
      const stripeW = width / stripeCount;
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      for (let s = 1; s < stripeCount; s += 2) {
        ctx.fillRect(s * stripeW, 0, stripeW, height);
      }

      // Jitter-Proof LERP Playback Buffer
      const buffer = frameBufferRef.current;
      let displayPlayers: PlayerPosition[] = [];
      let ballX = 52.5;
      let ballY = 34.0;
      let ballSpeed = 0.0;

      if (buffer.length >= 2) {
        const f0 = buffer[0];
        const f1 = buffer[1];
        const alpha = 0.5;

        displayPlayers = f1.players.map((p1) => {
          const p0 = f0.players.find((p) => p.player_id === p1.player_id) || p1;
          return {
            ...p1,
            x: p0.x + (p1.x - p0.x) * alpha,
            y: p0.y + (p1.y - p0.y) * alpha,
          };
        });

        ballX = f0.ball.x + (f1.ball.x - f0.ball.x) * alpha;
        ballY = f0.ball.y + (f1.ball.y - f0.ball.y) * alpha;
        ballSpeed = f1.ball.speed_kmh;
      } else if (buffer.length === 1) {
        displayPlayers = buffer[0].players;
        ballX = buffer[0].ball.x;
        ballY = buffer[0].ball.y;
        ballSpeed = buffer[0].ball.speed_kmh;
      }

      latestRenderedPlayersRef.current = displayPlayers;

      // Update focused player HUD stats
      const focused = displayPlayers.find((p) => p.player_id === selectedPlayerId);
      if (focused) {
        setFocusedPlayerStats((prev) => ({
          ...prev,
          id: focused.player_id,
          name: focused.name,
          number: focused.shirt_number,
          team: focused.team,
          speed: focused.speed_kmh,
          stamina: Math.round(focused.stamina_pct),
        }));
      }

      // 1. Dynamic Voronoi Pitch Control Shading
      if (showVoronoi && displayPlayers.length >= 10) {
        const gridCols = 35;
        const gridRows = 22;
        const cellW = width / gridCols;
        const cellH = height / gridRows;

        ctx.save();
        for (let r = 0; r < gridRows; r++) {
          const sampleY = ((r + 0.5) / gridRows) * PITCH_WIDTH;
          for (let c = 0; c < gridCols; c++) {
            const sampleX = ((c + 0.5) / gridCols) * PITCH_LENGTH;

            // Find closest player to sample coordinate
            let closestTeam: "NLR" | "MSB" = "NLR";
            let minDistSq = Infinity;

            for (const p of displayPlayers) {
              const dSq = (p.x - sampleX) ** 2 + (p.y - sampleY) ** 2;
              if (dSq < minDistSq) {
                minDistSq = dSq;
                closestTeam = p.team;
              }
            }

            // Alpha scales subtly with proximity
            const fillStyle =
              closestTeam === "NLR"
                ? "rgba(239, 68, 68, 0.16)" // NLR crimson control
                : "rgba(59, 130, 246, 0.16)"; // MSB royal blue control

            ctx.fillStyle = fillStyle;
            ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
          }
        }
        ctx.restore();
      }

      // 2. Optional xT Grid Heatmap Overlay
      if (showXtGrid) {
        const rows = 8;
        const cols = 12;
        const cellW = width / cols;
        const cellH = height / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const val = XT_HEAT[r][c];
            let fillAlpha = Math.min(0.55, val * 0.85);
            let color = "rgba(6, 182, 212,";
            if (val > 0.3) color = "rgba(239, 68, 68,";
            else if (val > 0.15) color = "rgba(245, 158, 11,";
            else if (val > 0.05) color = "rgba(16, 185, 129,";

            ctx.fillStyle = `${color} ${fillAlpha})`;
            ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);

            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.font = "9px monospace";
            ctx.fillText(`+${val.toFixed(2)}`, c * cellW + 4, r * cellH + 12);
          }
        }
      }

      // 3. Official Pitch Markings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 1.8;

      ctx.strokeRect(toCanvasX(0), toCanvasY(0), toCanvasX(PITCH_LENGTH), toCanvasY(PITCH_WIDTH));

      // Halfway line
      ctx.beginPath();
      ctx.moveTo(toCanvasX(52.5), toCanvasY(0));
      ctx.lineTo(toCanvasX(52.5), toCanvasY(PITCH_WIDTH));
      ctx.stroke();

      // Center Circle & Center Spot
      ctx.beginPath();
      ctx.arc(toCanvasX(52.5), toCanvasY(34.0), 9.15 * scaleX, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(toCanvasX(52.5), toCanvasY(34.0), 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      // Home Penalty Box & Spots
      ctx.strokeRect(toCanvasX(0), toCanvasY(13.84), toCanvasX(16.5), toCanvasY(40.32));
      ctx.strokeRect(toCanvasX(0), toCanvasY(24.84), toCanvasX(5.5), toCanvasY(18.32));
      ctx.beginPath();
      ctx.arc(toCanvasX(11.0), toCanvasY(34.0), 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Away Penalty Box & Spots
      ctx.strokeRect(toCanvasX(105.0 - 16.5), toCanvasY(13.84), toCanvasX(16.5), toCanvasY(40.32));
      ctx.strokeRect(toCanvasX(105.0 - 5.5), toCanvasY(24.84), toCanvasX(5.5), toCanvasY(18.32));
      ctx.beginPath();
      ctx.arc(toCanvasX(105.0 - 11.0), toCanvasY(34.0), 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Pass/Vector Line Drawing
      if (activeOverlay && activeOverlay.vector_coords) {
        const coords = activeOverlay.vector_coords;
        const sx = toCanvasX(coords.start_x);
        const sy = toCanvasY(coords.start_y);
        const ex = toCanvasX(coords.end_x);
        const ey = toCanvasY(coords.end_y);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);

        const isPress = activeOverlay.overlay_type === "high_press_turnover";
        ctx.strokeStyle = isPress ? "#F59E0B" : "#10B981";
        ctx.lineWidth = 3.0;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = isPress ? "rgba(245, 158, 11, 0.8)" : "rgba(16, 185, 129, 0.8)";
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.fillStyle = isPress ? "#F59E0B" : "#10B981";
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Dynamic Player-Cam Spotlight & Field of View on Selected Player
      if (isPlayerCamActive && focused) {
        const fx = toCanvasX(focused.x);
        const fy = toCanvasY(focused.y);

        ctx.save();
        const spotColor = focused.team === "NLR" ? "rgba(239, 68, 68," : "rgba(59, 130, 246,";
        const spotGrad = ctx.createRadialGradient(fx, fy, 10, fx, fy, 110);
        spotGrad.addColorStop(0, `${spotColor} 0.35)`);
        spotGrad.addColorStop(0.7, `${spotColor} 0.1)`);
        spotGrad.addColorStop(1, `${spotColor} 0)`);
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, 110, 0, Math.PI * 2);
        ctx.fill();

        // Field of view cone
        const forwardDirection = focused.team === "NLR" ? 0 : Math.PI;
        ctx.fillStyle = `${spotColor} 0.14)`;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.arc(fx, fy, 80, forwardDirection - 0.45, forwardDirection + 0.45);
        ctx.closePath();
        ctx.fill();

        // Pulsing reticle ring
        ctx.strokeStyle = focused.team === "NLR" ? "#EF4444" : "#3B82F6";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(fx, fy, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Render 22 Players
      displayPlayers.forEach((p) => {
        const px = toCanvasX(p.x);
        const py = toCanvasY(p.y);
        const isSelected = p.player_id === selectedPlayerId;
        const radius = isSelected ? 10.0 : 8.5;

        const isNLR = p.team === "NLR";
        const primaryColor = isNLR ? "#EF4444" : "#3B82F6";
        const isHighlighted = activeOverlay?.highlight_player_ids?.includes(p.player_id);

        ctx.save();

        if (isHighlighted || isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? "rgba(6, 182, 212, 0.6)"
            : isNLR
            ? "rgba(239, 68, 68, 0.5)"
            : "rgba(59, 130, 246, 0.5)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 4;
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#06B6D4" : p.shirt_number === 8 ? "#FACC15" : "#FFFFFF";
        ctx.lineWidth = isSelected ? 2.5 : p.shirt_number === 8 ? 2.0 : 1.2;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${radius > 9 ? 9 : 8}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.shirt_number), px, py);

        ctx.font = "8px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillText(p.name.split("-")[0], px, py + radius + 8);

        // Sprint speed badge for players over 30 km/h
        if (p.speed_kmh >= 30.0) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 1;
          const badgeW = 54;
          const badgeH = 14;
          ctx.fillRect(px - badgeW / 2, py - radius - 16, badgeW, badgeH);
          ctx.strokeRect(px - badgeW / 2, py - radius - 16, badgeW, badgeH);

          ctx.fillStyle = "#FACC15";
          ctx.font = "bold 8px monospace";
          ctx.fillText(`⚡ ${p.speed_kmh.toFixed(1)} km/h`, px, py - radius - 7);
        }

        ctx.restore();
      });

      // 7. Render Ball
      const bx = toCanvasX(ballX);
      const by = toCanvasY(ballY);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + 1.5, by + 1.5, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showXtGrid, showVoronoi, activeOverlay, isPlayerCamActive, selectedPlayerId]);

  return (
    <div className="relative w-full aspect-[105/68] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1050}
        height={680}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain cursor-crosshair"
        title="Click on any player to focus Player-Cam"
      />

      {/* Top Left Pitch Canvas Overlays Toolbar */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 flex-wrap">
        <button
          onClick={() => setShowVoronoi(!showVoronoi)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all backdrop-blur-md border ${
            showVoronoi
              ? "bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-md shadow-purple-950"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
          title="Dynamic Voronoi territory control mesh"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pitch Control (Voronoi: {showVoronoi ? "ON" : "OFF"})</span>
        </button>

        <button
          onClick={() => setShowXtGrid(!showXtGrid)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all backdrop-blur-md border ${
            showXtGrid
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-950"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
          title="Toggle Expected Threat 8x12 grid overlay"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>xT Heatmap</span>
        </button>
      </div>

      {/* Dynamic Player-Cam Floating HUD */}
      {isPlayerCamActive && (
        <div className="absolute top-2.5 right-2.5 bg-slate-950/95 border border-cyan-500/70 rounded-xl p-3.5 text-white backdrop-blur-md shadow-2xl font-mono text-xs flex flex-col gap-2 z-10 w-60 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-white text-[12px] truncate">
                #{focusedPlayerStats.number} {focusedPlayerStats.name.split("-")[0]}
              </span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                focusedPlayerStats.team === "NLR"
                  ? "bg-red-950 text-red-300 border border-red-700"
                  : "bg-blue-950 text-blue-300 border border-blue-700"
              }`}
            >
              {focusedPlayerStats.team}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block">LIVE SPEED</span>
              <div className="font-bold text-slate-200 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{focusedPlayerStats.speed.toFixed(1)} km/h</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">DISTANCE</span>
              <div className="font-bold text-slate-200">{focusedPlayerStats.distanceKm.toFixed(1)} km</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">TOUCHES</span>
              <div className="font-bold text-slate-200">{focusedPlayerStats.touches}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">STAMINA</span>
              <div className="font-bold text-emerald-400">{focusedPlayerStats.stamina}%</div>
            </div>
          </div>

          {/* Stamina bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${focusedPlayerStats.stamina}%` }}
            />
          </div>

          <span className="text-[9px] text-slate-400 text-center font-sans">
            Tip: Click any player on pitch to switch
          </span>
        </div>
      )}
    </div>
  );
};
