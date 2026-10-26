"use client";

import React, { useEffect, useRef, useState } from "react";
import { Grid, Layers, Zap } from "lucide-react";
import {
  BroadcastOverlayPayload,
  DVRFrameSnapshot,
  FramePayload,
  MatchTickPayload,
  PlayerPosition,
} from "@/types/match";
import { PitchTelestrator } from "@/components/PitchTelestrator";

interface PitchCanvasProps {
  frameBufferRef: React.MutableRefObject<FramePayload[]>;
  latestTick: MatchTickPayload | null;
  activeOverlay: BroadcastOverlayPayload | null;
  isPlayerCamActive: boolean;
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
  timeShiftedSnapshot?: DVRFrameSnapshot | null;
  isLive?: boolean;
  isTelestratorActive?: boolean;
  isPlaying?: boolean;
  onCloseTelestrator?: () => void;
  onAskPunditAboutArea?: (centroidX: number, centroidY: number) => void;
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
  activeOverlay,
  isPlayerCamActive,
  selectedPlayerId,
  onSelectPlayer,
  timeShiftedSnapshot = null,
  isLive = true,
  isTelestratorActive = false,
  isPlaying = true,
  onCloseTelestrator,
  onAskPunditAboutArea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showXtGrid, setShowXtGrid] = useState<boolean>(false);
  const [showVoronoi, setShowVoronoi] = useState<boolean>(false);

  // Store latest rendered players for click detection
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

  // Click-to-select player directly on pitch
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isTelestratorActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickCanvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickCanvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const pitchX = (clickCanvasX / canvas.width) * PITCH_LENGTH;
    const pitchY = (clickCanvasY / canvas.height) * PITCH_WIDTH;

    const players = latestRenderedPlayersRef.current;
    let closest: PlayerPosition | null = null;
    let minDist = 5.0;

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

      // 1. Dark Tactical Slate-Turf (Obsidian Emerald Gradient)
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.7
      );
      grad.addColorStop(0, "#0A1B14");
      grad.addColorStop(0.6, "#07140F");
      grad.addColorStop(1, "#050F0B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle tonal mowing bands (16 vertical stripes)
      const stripeCount = 16;
      const stripeW = width / stripeCount;
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
      for (let s = 1; s < stripeCount; s += 2) {
        ctx.fillRect(s * stripeW, 0, stripeW, height);
      }

      // Buffer interpolation & Time-Shifted DVR Snapshot
      let displayPlayers: PlayerPosition[] = [];
      let ballX = 52.5;
      let ballY = 34.0;

      if (!isLive && timeShiftedSnapshot) {
        displayPlayers = timeShiftedSnapshot.frame.players;
        ballX = timeShiftedSnapshot.frame.ball.x;
        ballY = timeShiftedSnapshot.frame.ball.y;
      } else {
        const buffer = frameBufferRef.current;
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
        } else if (buffer.length === 1) {
          displayPlayers = buffer[0].players;
          ballX = buffer[0].ball.x;
          ballY = buffer[0].ball.y;
        }
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

      // 2. Dynamic Voronoi Pitch Control
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

            let closestTeam: "NLR" | "MSB" = "NLR";
            let minDistSq = Infinity;

            for (const p of displayPlayers) {
              const dSq = (p.x - sampleX) ** 2 + (p.y - sampleY) ** 2;
              if (dSq < minDistSq) {
                minDistSq = dSq;
                closestTeam = p.team;
              }
            }

            const fillStyle =
              closestTeam === "NLR"
                ? "rgba(225, 29, 72, 0.12)" // Refined NLR crimson
                : "rgba(37, 99, 235, 0.12)"; // Refined MSB cobalt

            ctx.fillStyle = fillStyle;
            ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
          }
        }
        ctx.restore();
      }

      // 3. Expected Threat (xT) Grid Overlay
      if (showXtGrid) {
        const rows = 8;
        const cols = 12;
        const cellW = width / cols;
        const cellH = height / rows;

        ctx.save();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const val = XT_HEAT[r][c];
            let fillAlpha = Math.min(0.45, val * 0.7);
            let color = "rgba(229, 193, 88,"; // Gold accent base
            if (val > 0.3) color = "rgba(225, 29, 72,";
            else if (val > 0.12) color = "rgba(245, 158, 11,";
            else if (val > 0.04) color = "rgba(56, 189, 248,";

            ctx.fillStyle = `${color} ${fillAlpha})`;
            ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);

            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.font = "8px monospace";
            ctx.fillText(`+${val.toFixed(2)}`, c * cellW + 4, r * cellH + 11);
          }
        }
        ctx.restore();
      }

      // 4. Complete FIFA Pitch Geometry (Hairline Precision)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1.25;

      // Outer Pitch Boundary
      ctx.strokeRect(toCanvasX(0), toCanvasY(0), toCanvasX(PITCH_LENGTH), toCanvasY(PITCH_WIDTH));

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(toCanvasX(52.5), toCanvasY(0));
      ctx.lineTo(toCanvasX(52.5), toCanvasY(PITCH_WIDTH));
      ctx.stroke();

      // Center Circle & Center Spot
      ctx.beginPath();
      ctx.arc(toCanvasX(52.5), toCanvasY(34.0), 9.15 * scaleX, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(toCanvasX(52.5), toCanvasY(34.0), 2.0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fill();

      // Home Penalty Box (16.5m), Goal Area (5.5m), Penalty Spot (11m), and D-Arc
      ctx.strokeRect(toCanvasX(0), toCanvasY(13.84), toCanvasX(16.5), toCanvasY(40.32));
      ctx.strokeRect(toCanvasX(0), toCanvasY(24.84), toCanvasX(5.5), toCanvasY(18.32));
      ctx.beginPath();
      ctx.arc(toCanvasX(11.0), toCanvasY(34.0), 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Home Penalty D-Arc (Missing in original!)
      ctx.beginPath();
      ctx.arc(toCanvasX(11.0), toCanvasY(34.0), 9.15 * scaleX, -0.927, 0.927);
      ctx.stroke();

      // Home Goal Net Frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(toCanvasX(-2.0), toCanvasY(30.34), toCanvasX(2.0), toCanvasY(7.32));

      // Away Penalty Box, Goal Area, Penalty Spot, and D-Arc
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.strokeRect(toCanvasX(105.0 - 16.5), toCanvasY(13.84), toCanvasX(16.5), toCanvasY(40.32));
      ctx.strokeRect(toCanvasX(105.0 - 5.5), toCanvasY(24.84), toCanvasX(5.5), toCanvasY(18.32));
      ctx.beginPath();
      ctx.arc(toCanvasX(105.0 - 11.0), toCanvasY(34.0), 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Away Penalty D-Arc (Missing in original!)
      ctx.beginPath();
      ctx.arc(toCanvasX(105.0 - 11.0), toCanvasY(34.0), 9.15 * scaleX, Math.PI - 0.927, Math.PI + 0.927);
      ctx.stroke();

      // Away Goal Net Frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(toCanvasX(105.0), toCanvasY(30.34), toCanvasX(2.0), toCanvasY(7.32));

      // 4 Corner Arcs (1m radius - Missing in original!)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      const cornerR = 1.0 * scaleX;
      // Top-Left (0, 0)
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(0), cornerR, 0, Math.PI / 2);
      ctx.stroke();
      // Bottom-Left (0, 68)
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(68), cornerR, -Math.PI / 2, 0);
      ctx.stroke();
      // Top-Right (105, 0)
      ctx.beginPath();
      ctx.arc(toCanvasX(105), toCanvasY(0), cornerR, Math.PI / 2, Math.PI);
      ctx.stroke();
      // Bottom-Right (105, 68)
      ctx.beginPath();
      ctx.arc(toCanvasX(105), toCanvasY(68), cornerR, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      ctx.restore();

      // 5. Tactical Pass / Press Vectors with Directional Arrow
      if (activeOverlay && activeOverlay.vector_coords) {
        const coords = activeOverlay.vector_coords;
        const sx = toCanvasX(coords.start_x);
        const sy = toCanvasY(coords.start_y);
        const ex = toCanvasX(coords.end_x);
        const ey = toCanvasY(coords.end_y);

        ctx.save();
        const isPress = activeOverlay.overlay_type === "high_press_turnover";
        const strokeColor = isPress ? "#F59E0B" : "#E5C158"; // Studio gold pass or amber press

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.0;
        ctx.setLineDash([5, 4]);
        ctx.stroke();

        // Directional arrowhead
        const angle = Math.atan2(ey - sy, ex - sx);
        const arrowLen = 9;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - arrowLen * Math.cos(angle - Math.PI / 6),
          ey - arrowLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ex - arrowLen * Math.cos(angle + Math.PI / 6),
          ey - arrowLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.restore();
      }

      // 6. Dynamic Player-Cam Spotlight on Selected Player
      if (isPlayerCamActive && focused) {
        const fx = toCanvasX(focused.x);
        const fy = toCanvasY(focused.y);

        ctx.save();
        const spotColor = focused.team === "NLR" ? "rgba(225, 29, 72," : "rgba(37, 99, 235,";
        const spotGrad = ctx.createRadialGradient(fx, fy, 8, fx, fy, 90);
        spotGrad.addColorStop(0, `${spotColor} 0.28)`);
        spotGrad.addColorStop(0.7, `${spotColor} 0.08)`);
        spotGrad.addColorStop(1, `${spotColor} 0)`);
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, 90, 0, Math.PI * 2);
        ctx.fill();

        // Field of view cone
        const forwardDirection = focused.team === "NLR" ? 0 : Math.PI;
        ctx.fillStyle = `${spotColor} 0.1)`;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.arc(fx, fy, 75, forwardDirection - 0.42, forwardDirection + 0.42);
        ctx.closePath();
        ctx.fill();

        // Precision champagne reticle ring
        ctx.strokeStyle = "#E5C158";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(fx, fy, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Render 22 Anodized Player Tokens
      displayPlayers.forEach((p) => {
        const px = toCanvasX(p.x);
        const py = toCanvasY(p.y);
        const isSelected = p.player_id === selectedPlayerId;
        const radius = isSelected ? 9.5 : 8.0;

        const isNLR = p.team === "NLR";
        const teamColor = isNLR ? "#E11D48" : "#2563EB";
        const isHighlighted = activeOverlay?.highlight_player_ids?.includes(p.player_id);

        ctx.save();

        // Highlight ring
        if (isHighlighted || isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, radius + 4.5, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? "#E5C158" : teamColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Anodized dark core token
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#12151B";
        ctx.fill();

        // Outer precision rim
        ctx.strokeStyle = isSelected ? "#E5C158" : teamColor;
        ctx.lineWidth = isSelected ? 2.5 : 2.0;
        ctx.stroke();

        // Tabular Shirt Number
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${radius > 8.5 ? 9 : 8}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.shirt_number), px, py);

        // Architectural Nameplate Pill
        const shortName = p.name.split("-")[0];
        ctx.font = "8px 'Inter', sans-serif";
        const nameW = ctx.measureText(shortName).width + 6;
        const nameH = 11;
        ctx.fillStyle = "rgba(10, 12, 16, 0.85)";
        ctx.fillRect(px - nameW / 2, py + radius + 3, nameW, nameH);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px - nameW / 2, py + radius + 3, nameW, nameH);

        ctx.fillStyle = "rgba(244, 244, 246, 0.85)";
        ctx.fillText(shortName, px, py + radius + 8.5);

        // Sprint Speed Telemetry Tag (No emojis!)
        if (p.speed_kmh >= 30.0) {
          const sprintText = `${p.speed_kmh.toFixed(1)} KM/H`;
          ctx.font = "bold 8px monospace";
          const tagW = ctx.measureText(sprintText).width + 8;
          const tagH = 13;
          ctx.fillStyle = "#12151C";
          ctx.fillRect(px - tagW / 2, py - radius - 15, tagW, tagH);
          ctx.strokeStyle = "#E5C158";
          ctx.lineWidth = 1;
          ctx.strokeRect(px - tagW / 2, py - radius - 15, tagW, tagH);

          ctx.fillStyle = "#E5C158";
          ctx.fillText(sprintText, px, py - radius - 6.5);
        }

        ctx.restore();
      });

      // 8. Render Ball
      const bx = toCanvasX(ballX);
      const by = toCanvasY(ballY);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + 1, by + 1, 4.0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 4.0, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.strokeStyle = "#12151B";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    showXtGrid,
    showVoronoi,
    activeOverlay,
    isPlayerCamActive,
    selectedPlayerId,
    isLive,
    timeShiftedSnapshot,
  ]);

  return (
    <div className="relative w-full aspect-[105/68] bg-[#07080A] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1050}
        height={680}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain cursor-crosshair"
        title="Click on any player to focus Player-Cam"
      />

      {/* Interactive Broadcast Telestrator Drawing Layer */}
      <PitchTelestrator
        isActive={isTelestratorActive}
        isPlaying={isPlaying}
        onClose={onCloseTelestrator ?? (() => {})}
        onAskPunditAboutArea={onAskPunditAboutArea}
      />

      {/* Top Left Pitch Canvas Overlays Toolbar */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 flex-wrap">
        <button
          onClick={() => setShowVoronoi(!showVoronoi)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans transition-all backdrop-blur-xl border ${
            showVoronoi
              ? "bg-[#181C24] border-white/30 text-white font-semibold shadow-md"
              : "bg-[#090A0D]/90 border-white/10 text-zinc-300 hover:text-white"
          }`}
          title="Dynamic Voronoi territory control mesh"
        >
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span>Pitch Control {showVoronoi ? "(Active)" : ""}</span>
        </button>

        <button
          onClick={() => setShowXtGrid(!showXtGrid)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans transition-all backdrop-blur-xl border ${
            showXtGrid
              ? "bg-[#181C24] border-white/30 text-white font-semibold shadow-md"
              : "bg-[#090A0D]/90 border-white/10 text-zinc-300 hover:text-white"
          }`}
          title="Toggle Expected Threat 8x12 grid overlay"
        >
          <Grid className="w-3.5 h-3.5 text-zinc-400" />
          <span>xT Heatmap</span>
        </button>
      </div>

      {/* Dynamic Player-Cam Floating HUD */}
      {isPlayerCamActive && (
        <div className="absolute top-2.5 right-2.5 bg-[#090A0D]/92 border border-white/10 rounded-lg p-3 text-white backdrop-blur-xl shadow-2xl font-sans text-xs flex flex-col gap-2 z-10 w-56 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-gold" />
              <span className="font-display font-bold text-white text-[12px] truncate">
                #{focusedPlayerStats.number} {focusedPlayerStats.name.split("-")[0]}
              </span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                focusedPlayerStats.team === "NLR"
                  ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                  : "bg-blue-950/80 text-blue-300 border border-blue-800"
              }`}
            >
              {focusedPlayerStats.team}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-zinc-400 text-[9px] font-sans block">LIVE SPEED</span>
              <div className="font-bold text-zinc-200 tabular-nums flex items-center gap-1">
                <Zap className="w-3 h-3 text-studio-gold" />
                <span>{focusedPlayerStats.speed.toFixed(1)} km/h</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-400 text-[9px] font-sans block">DISTANCE</span>
              <div className="font-bold text-zinc-200 tabular-nums">
                {focusedPlayerStats.distanceKm.toFixed(1)} km
              </div>
            </div>
            <div>
              <span className="text-zinc-400 text-[9px] font-sans block">TOUCHES</span>
              <div className="font-bold text-zinc-200 tabular-nums">{focusedPlayerStats.touches}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[9px] font-sans block">STAMINA</span>
              <div className="font-bold text-emerald-400 tabular-nums">{focusedPlayerStats.stamina}%</div>
            </div>
          </div>

          {/* Segmented Stamina Bar */}
          <div className="w-full bg-[#181C23] h-1.5 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${focusedPlayerStats.stamina}%` }}
            />
          </div>

          <span className="text-[9px] text-zinc-400 text-center font-sans">
            Click any player on pitch to inspect
          </span>
        </div>
      )}
    </div>
  );
};