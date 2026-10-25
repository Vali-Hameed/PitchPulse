"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  Camera,
  Cpu,
  Crosshair,
  Layers,
  RefreshCw,
  CheckCircle2,
  Activity,
  Scan,
} from "lucide-react";
import { VisionFrameResponse, VisionDetection } from "@/types/match";

interface VisionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_VISION_DATA: VisionFrameResponse = {
  frame_id: 19420,
  match_clock: "64:12",
  fps: 60.0,
  inference_latency_ms: 18.4,
  model_name: "Azure AI Vision (YOLOv11x Football Model)",
  homography_matrix_status: "CALIBRATED (29 Keypoints, 0.04m RMSE)",
  detections: [
    // NLR Players
    { tracking_id: "TRK_NLR_8", label: "player_nlr", shirt_number: 8, player_name: "M. Vance-Sim", confidence: 0.984, box_2d: [420, 520, 500, 555], pitch_x: 56.0, pitch_y: 44.0 },
    { tracking_id: "TRK_NLR_20", label: "player_nlr", shirt_number: 20, player_name: "D. Rice-Sim", confidence: 0.971, box_2d: [400, 440, 480, 475], pitch_x: 48.0, pitch_y: 22.0 },
    { tracking_id: "TRK_NLR_7", label: "player_nlr", shirt_number: 7, player_name: "B. Saka-Sim", confidence: 0.989, box_2d: [490, 620, 570, 655], pitch_x: 68.0, pitch_y: 56.0 },
    { tracking_id: "TRK_NLR_9", label: "player_nlr", shirt_number: 9, player_name: "K. Havertz-Sim", confidence: 0.965, box_2d: [360, 650, 440, 685], pitch_x: 70.0, pitch_y: 34.0 },
    { tracking_id: "TRK_NLR_11", label: "player_nlr", shirt_number: 11, player_name: "G. Martinelli-Sim", confidence: 0.958, box_2d: [220, 620, 300, 655], pitch_x: 68.0, pitch_y: 12.0 },
    { tracking_id: "TRK_NLR_5", label: "player_nlr", shirt_number: 5, player_name: "T. Partey-Sim", confidence: 0.962, box_2d: [350, 380, 430, 415], pitch_x: 40.0, pitch_y: 34.0 },
    { tracking_id: "TRK_NLR_2", label: "player_nlr", shirt_number: 2, player_name: "W. Saliba-Sim", confidence: 0.978, box_2d: [430, 240, 510, 275], pitch_x: 24.0, pitch_y: 44.0 },
    { tracking_id: "TRK_NLR_6", label: "player_nlr", shirt_number: 6, player_name: "G. Magalhaes-Sim", confidence: 0.973, box_2d: [270, 240, 350, 275], pitch_x: 24.0, pitch_y: 24.0 },
    { tracking_id: "TRK_NLR_4", label: "player_nlr", shirt_number: 4, player_name: "B. White-Sim", confidence: 0.951, box_2d: [520, 280, 600, 315], pitch_x: 28.0, pitch_y: 58.0 },
    { tracking_id: "TRK_NLR_18", label: "player_nlr", shirt_number: 18, player_name: "J. Timber-Sim", confidence: 0.955, box_2d: [180, 280, 260, 315], pitch_x: 28.0, pitch_y: 10.0 },
    { tracking_id: "TRK_NLR_1", label: "goalkeeper", shirt_number: 1, player_name: "D. Raya-Sim", confidence: 0.992, box_2d: [340, 80, 420, 115], pitch_x: 6.0, pitch_y: 34.0 },
    // MSB Players
    { tracking_id: "TRK_MSB_32", label: "player_msb", shirt_number: 32, player_name: "J. Branthwaite-Sim", confidence: 0.968, box_2d: [440, 780, 520, 815], pitch_x: 82.0, pitch_y: 44.0 },
    { tracking_id: "TRK_MSB_6", label: "player_msb", shirt_number: 6, player_name: "J. Tarkowski-Sim", confidence: 0.964, box_2d: [280, 780, 360, 815], pitch_x: 82.0, pitch_y: 24.0 },
    { tracking_id: "TRK_MSB_27", label: "player_msb", shirt_number: 27, player_name: "I. Gueye-Sim", confidence: 0.972, box_2d: [360, 620, 440, 655], pitch_x: 66.0, pitch_y: 34.0 },
    { tracking_id: "TRK_MSB_8", label: "player_msb", shirt_number: 8, player_name: "A. Onana-Sim", confidence: 0.959, box_2d: [430, 540, 510, 575], pitch_x: 58.0, pitch_y: 44.0 },
    { tracking_id: "TRK_MSB_16", label: "player_msb", shirt_number: 16, player_name: "A. Doucoure-Sim", confidence: 0.961, box_2d: [270, 540, 350, 575], pitch_x: 58.0, pitch_y: 24.0 },
    { tracking_id: "TRK_MSB_9", label: "player_msb", shirt_number: 9, player_name: "D. Calvert-Sim", confidence: 0.975, box_2d: [350, 390, 430, 425], pitch_x: 40.0, pitch_y: 34.0 },
    { tracking_id: "TRK_MSB_19", label: "player_msb", shirt_number: 19, player_name: "V. Mykolenko-Sim", confidence: 0.952, box_2d: [530, 740, 610, 775], pitch_x: 78.0, pitch_y: 58.0 },
    { tracking_id: "TRK_MSB_2", label: "player_msb", shirt_number: 2, player_name: "N. Patterson-Sim", confidence: 0.948, box_2d: [170, 740, 250, 775], pitch_x: 78.0, pitch_y: 10.0 },
    { tracking_id: "TRK_MSB_7", label: "player_msb", shirt_number: 7, player_name: "D. McNeil-Sim", confidence: 0.954, box_2d: [510, 430, 590, 465], pitch_x: 45.0, pitch_y: 56.0 },
    { tracking_id: "TRK_MSB_11", label: "player_msb", shirt_number: 11, player_name: "J. Harrison-Sim", confidence: 0.956, box_2d: [200, 430, 280, 465], pitch_x: 45.0, pitch_y: 12.0 },
    { tracking_id: "TRK_MSB_1", label: "goalkeeper", shirt_number: 1, player_name: "J. Pickford-Sim", confidence: 0.995, box_2d: [340, 920, 420, 955], pitch_x: 99.0, pitch_y: 34.0 },
    // Ball & Referee
    { tracking_id: "TRK_BALL_1", label: "ball", shirt_number: null, player_name: "Match Ball", confidence: 0.991, box_2d: [415, 510, 435, 525], pitch_x: 52.5, pitch_y: 34.0 },
    { tracking_id: "TRK_REF_1", label: "referee", shirt_number: null, player_name: "Match Referee", confidence: 0.988, box_2d: [330, 480, 410, 515], pitch_x: 50.0, pitch_y: 38.0 },
  ],
};

export const VisionInspectorModal: React.FC<VisionInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [visionData, setVisionData] = useState<VisionFrameResponse>(DEFAULT_VISION_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "NLR" | "MSB" | "BALL">("ALL");
  const [hoveredDetection, setHoveredDetection] = useState<VisionDetection | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanLineRef = useRef<number>(0);

  const fetchVisionFrame = useCallback(async () => {
    setIsLoading(true);
    try {
      let res: Response | null = null;
      try {
        res = await fetch("/api/vision/inspect");
      } catch {
        res = null;
      }
      if (!res || !res.ok) {
        res = await fetch(`${API_BASE}/api/vision/inspect`);
      }
      if (res && res.ok) {
        const data: VisionFrameResponse = await res.json();
        if (data && Array.isArray(data.detections) && data.detections.length > 0) {
          setVisionData(data);
        }
      }
    } catch (err: any) {
      console.warn("Using edge tactical vision cache:", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchVisionFrame();
    }
  }, [isOpen, fetchVisionFrame]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Canvas render loop
  useEffect(() => {
    if (!isOpen) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Pitch perspective gradient (Obsidian Slate Turf)
          const pitchGrad = ctx.createLinearGradient(0, 0, 0, height);
          pitchGrad.addColorStop(0, "#06130C");
          pitchGrad.addColorStop(0.5, "#0A1D13");
          pitchGrad.addColorStop(1, "#05110B");
          ctx.fillStyle = pitchGrad;
          ctx.fillRect(0, 0, width, height);

          // Perspective pitch striping
          ctx.save();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 14; i++) {
            const y = (height / 14) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Perspective vertical guidelines
          for (let i = 0; i <= 10; i++) {
            const topX = (width / 10) * i * 0.8 + width * 0.1;
            const botX = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(topX, 0);
            ctx.lineTo(botX, height);
            ctx.stroke();
          }

          // Center Circle Perspective
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.ellipse(width / 2, height / 2, width * 0.12, height * 0.16, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Camera Crosshair Center
          ctx.strokeStyle = "rgba(229, 193, 88, 0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(width / 2 - 16, height / 2);
          ctx.lineTo(width / 2 + 16, height / 2);
          ctx.moveTo(width / 2, height / 2 - 16);
          ctx.lineTo(width / 2, height / 2 + 16);
          ctx.stroke();

          // Subtle Scanline
          scanLineRef.current = (scanLineRef.current + 2.0) % height;
          const scanY = scanLineRef.current;
          const scanGrad = ctx.createLinearGradient(0, scanY - 24, 0, scanY);
          scanGrad.addColorStop(0, "rgba(229, 193, 88, 0.0)");
          scanGrad.addColorStop(1, "rgba(229, 193, 88, 0.12)");
          ctx.fillStyle = scanGrad;
          ctx.fillRect(0, Math.max(0, scanY - 24), width, 24);

          ctx.strokeStyle = "rgba(229, 193, 88, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(width, scanY);
          ctx.stroke();

          // Camera HUD Overlays
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "bold 9px monospace";
          ctx.fillText("CAM-01 [MAIN BROADCAST TACTICAL FEED 1080p60]", 16, 20);
          ctx.fillStyle = "#E5C158";
          ctx.fillText(`FRAME: #${visionData.frame_id} | TIME: ${visionData.match_clock} | YOLOv11x 18.4ms`, 16, 34);

          // Draw Bounding Boxes
          visionData.detections.forEach((det) => {
            const [ymin, xmin, ymax, xmax] = det.box_2d;
            const isUnitNormalized = xmax <= 1.0 && ymax <= 1.0;
            const normX = det.pitch_x !== undefined
              ? (det.pitch_x / 105.0) * 0.82 + 0.09
              : (isUnitNormalized ? (xmin + xmax) / 2 : (xmin + xmax) / 2000.0);
            const normY = det.pitch_y !== undefined
              ? (det.pitch_y / 68.0) * 0.74 + 0.13
              : (isUnitNormalized ? ymax : ymax / 1000.0);

            const isBall = det.label === "ball";
            const bw = isBall ? 14 : 28;
            const bh = isBall ? 14 : 42;
            const bx = normX * width - bw / 2;
            const by = normY * height - bh;

            const isHovered = hoveredDetection?.tracking_id === det.tracking_id;

            let strokeColor = "#2563EB"; // MSB
            let fillColor = "rgba(37, 99, 235, 0.16)";
            let tagBg = "#1E3A8A";
            let avatarColor = "#2563EB";

            if (det.label === "player_nlr") {
              strokeColor = "#E11D48";
              fillColor = "rgba(225, 29, 72, 0.16)";
              tagBg = "#881337";
              avatarColor = "#E11D48";
            } else if (det.label === "goalkeeper") {
              strokeColor = "#F59E0B";
              fillColor = "rgba(245, 158, 11, 0.18)";
              tagBg = "#78350F";
              avatarColor = "#F59E0B";
            } else if (det.label === "ball") {
              strokeColor = "#E5C158";
              fillColor = "rgba(229, 193, 88, 0.4)";
              tagBg = "#715B1E";
              avatarColor = "#E5C158";
            } else if (det.label === "referee") {
              strokeColor = "#10B981";
              fillColor = "rgba(16, 185, 129, 0.18)";
              tagBg = "#064E3B";
              avatarColor = "#10B981";
            }

            if (isHovered) {
              strokeColor = "#FFFFFF";
              fillColor = "rgba(255, 255, 255, 0.25)";
            }

            // Fill & stroke
            ctx.fillStyle = fillColor;
            ctx.fillRect(bx, by, bw, bh);

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isHovered ? 2.0 : 1.25;
            ctx.strokeRect(bx, by, bw, bh);

            // Precision corner brackets
            const cornerLen = 5;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.moveTo(bx, by + cornerLen);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + cornerLen, by);
            ctx.moveTo(bx + bw, by + bh - cornerLen);
            ctx.lineTo(bx + bw, by + bh);
            ctx.lineTo(bx + bw - cornerLen, by + bh);
            ctx.stroke();

            // Player dot
            if (!isBall) {
              const centerX = bx + bw / 2;
              const centerY = by + bh * 0.55;

              ctx.fillStyle = avatarColor;
              ctx.beginPath();
              ctx.arc(centerX, centerY, 6.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 0.75;
              ctx.stroke();

              if (det.shirt_number !== null && det.shirt_number !== undefined) {
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 7px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String(det.shirt_number), centerX, centerY);
                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
              }
            }

            // Foot contact point
            const footX = bx + bw / 2;
            const footY = by + bh;
            ctx.fillStyle = isHovered ? "#FFFFFF" : "#E5C158";
            ctx.beginPath();
            ctx.arc(footX, footY, isHovered ? 3 : 2, 0, Math.PI * 2);
            ctx.fill();

            // Tag label
            const tagText = `${det.tracking_id} ${(det.confidence * 100).toFixed(0)}%`;
            ctx.font = "bold 8px monospace";
            const tagW = ctx.measureText(tagText).width + 6;
            const tagH = 12;

            ctx.fillStyle = tagBg;
            ctx.fillRect(bx, Math.max(0, by - tagH), tagW, tagH);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(tagText, bx + 3, Math.max(8, by - 3));
          });

          ctx.restore();
        }
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, visionData, hoveredDetection]);

  if (!isOpen) return null;

  const filteredDetections = visionData.detections.filter((det) => {
    if (selectedFilter === "NLR") return det.label === "player_nlr" || (det.label === "goalkeeper" && det.tracking_id.includes("NLR"));
    if (selectedFilter === "MSB") return det.label === "player_msb" || (det.label === "goalkeeper" && det.tracking_id.includes("MSB"));
    if (selectedFilter === "BALL") return det.label === "ball";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-[#090A0E] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F4F4F6]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0D0F12]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-studio-gold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-base tracking-tight">
                  PitchPulse Vision Inspector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Homography Calibrated
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Real-Time Broadcast Camera Coordinate Extraction · YOLOv11x + ByteTrack
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVisionFrame}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171D] hover:bg-[#1A1F28] border border-white/10 text-zinc-200 text-xs font-sans transition-all disabled:opacity-50"
              title="Run inference cycle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-studio-gold" : ""}`} />
              <span>Inference Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 custom-scrollbar">
          {/* Top Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                <Cpu className="w-3 h-3 text-studio-gold" />
                Vision Backbone
              </span>
              <p className="text-xs font-bold text-zinc-200 mt-1 truncate">
                {visionData.model_name}
              </p>
            </div>

            <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                <Activity className="w-3 h-3 text-emerald-400" />
                Inference Latency
              </span>
              <p className="text-xs font-bold text-emerald-400 mt-1 tabular-nums">
                {visionData.inference_latency_ms} ms (60 FPS)
              </p>
            </div>

            <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                <Crosshair className="w-3 h-3 text-zinc-400" />
                Planar Homography
              </span>
              <p className="text-xs font-bold text-zinc-200 mt-1 truncate">
                {visionData.homography_matrix_status}
              </p>
            </div>

            <div className="bg-[#0D0F12] border border-white/10 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
                <Scan className="w-3 h-3 text-studio-gold" />
                Active Tracklets
              </span>
              <p className="text-xs font-bold text-studio-gold mt-1 tabular-nums">
                {visionData.detections.length} Entities Tracked
              </p>
            </div>
          </div>

          {/* Center: Camera Feed Canvas & Detections Table Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Visual Canvas (Camera Viewport) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-sans text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Camera className="w-3.5 h-3.5 text-studio-gold" />
                  Tactical Broadcast Feed (1920x1080)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Hover table rows to inspect target box
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-[16/9] shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={540}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Detections & Homography Matrix Extraction Table */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-sans text-zinc-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Homography Output Table</span>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 bg-[#07080A] p-0.5 rounded border border-white/10 text-[10px] font-mono">
                  {(["ALL", "NLR", "MSB", "BALL"] as const).map((filt) => (
                    <button
                      key={filt}
                      onClick={() => setSelectedFilter(filt)}
                      className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                        selectedFilter === filt
                          ? "bg-white/15 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#07080A] border border-white/10 rounded-xl overflow-hidden flex-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="bg-[#0D0F12] sticky top-0 border-b border-white/10 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2 px-2.5">Track ID</th>
                      <th className="py-2 px-2">Entity</th>
                      <th className="py-2 px-2">Conf</th>
                      <th className="py-2 px-2 text-right">Pitch (X, Y)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredDetections.map((det) => {
                      const isHovered = hoveredDetection?.tracking_id === det.tracking_id;
                      const isNLR = det.label === "player_nlr" || (det.label === "goalkeeper" && det.tracking_id.includes("NLR"));
                      const isMSB = det.label === "player_msb" || (det.label === "goalkeeper" && det.tracking_id.includes("MSB"));

                      return (
                        <tr
                          key={det.tracking_id}
                          onMouseEnter={() => setHoveredDetection(det)}
                          onMouseLeave={() => setHoveredDetection(null)}
                          className={`cursor-pointer transition-colors ${
                            isHovered
                              ? "bg-white/10 text-white"
                              : "hover:bg-white/[0.03] text-zinc-300"
                          }`}
                        >
                          <td className="py-1.5 px-2.5 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isNLR
                                  ? "bg-rose-950/60 text-rose-300 border border-rose-800"
                                  : isMSB
                                  ? "bg-blue-950/60 text-blue-300 border border-blue-800"
                                  : "bg-amber-950/60 text-amber-300 border border-amber-800"
                              }`}
                            >
                              {det.tracking_id}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 truncate max-w-[120px] font-sans">
                            {det.player_name || det.label.replace("_", " ").toUpperCase()}
                          </td>
                          <td className="py-1.5 px-2 text-emerald-400 tabular-nums">
                            {(det.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="py-1.5 px-2 text-right font-semibold text-zinc-200 tabular-nums">
                            ({det.pitch_x.toFixed(1)}m, {det.pitch_y.toFixed(1)}m)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0D0F12] flex items-center justify-between text-xs font-sans text-zinc-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Planar Perspective Homography Matrix H (3x3) Calibrated to Wembley Synthetic Grid</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#14171D] hover:bg-[#1A1F28] border border-white/10 text-white font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};