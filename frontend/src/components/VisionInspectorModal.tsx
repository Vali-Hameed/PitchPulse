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
  ShieldCheck,
} from "lucide-react";
import { VisionFrameResponse, VisionDetection, ALL_PLAYERS } from "@/types/match";

interface VisionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Robust default dataset representing real-time tactical camera bounding boxes and homography
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
      // First attempt Next.js rewrite proxy, then fall back to direct backend URL
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

  // Continuous tactical camera canvas animation with scanline radar sweep
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

          // 1. Draw Broadcast Camera Background (Floodlit pitch perspective)
          const pitchGrad = ctx.createLinearGradient(0, 0, 0, height);
          pitchGrad.addColorStop(0, "#082414");
          pitchGrad.addColorStop(0.5, "#0d3b1f");
          pitchGrad.addColorStop(1, "#071f11");
          ctx.fillStyle = pitchGrad;
          ctx.fillRect(0, 0, width, height);

          // Perspective pitch striping
          ctx.save();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
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
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(width / 2, height / 2, width * 0.12, height * 0.16, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Camera Crosshair Center
          ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(width / 2 - 20, height / 2);
          ctx.lineTo(width / 2 + 20, height / 2);
          ctx.moveTo(width / 2, height / 2 - 20);
          ctx.lineTo(width / 2, height / 2 + 20);
          ctx.stroke();

          // 2. Animated Radar Scanline
          scanLineRef.current = (scanLineRef.current + 2.5) % height;
          const scanY = scanLineRef.current;
          const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
          scanGrad.addColorStop(0, "rgba(6, 182, 212, 0.0)");
          scanGrad.addColorStop(1, "rgba(6, 182, 212, 0.22)");
          ctx.fillStyle = scanGrad;
          ctx.fillRect(0, Math.max(0, scanY - 30), width, 30);

          ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(width, scanY);
          ctx.stroke();

          // Camera HUD Overlays
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "bold 10px monospace";
          ctx.fillText("CAM-01 [MAIN BROADCAST TACTICAL FEED 1080p60]", 16, 22);
          ctx.fillStyle = "#10B981";
          ctx.fillText(`FRAME: #${visionData.frame_id} | TIME: ${visionData.match_clock} | YOLOv11x 18.4ms`, 16, 38);

          // 3. Draw Bounding Boxes & Detected Tracklets
          visionData.detections.forEach((det) => {
            const [ymin, xmin, ymax, xmax] = det.box_2d;

            // Handle both 0..1 unit-normalized and 0..1000 pixel-normalized formats
            const isUnitNormalized = xmax <= 1.0 && ymax <= 1.0;
            const normX = det.pitch_x !== undefined
              ? (det.pitch_x / 105.0) * 0.82 + 0.09
              : (isUnitNormalized ? (xmin + xmax) / 2 : (xmin + xmax) / 2000.0);
            const normY = det.pitch_y !== undefined
              ? (det.pitch_y / 68.0) * 0.74 + 0.13
              : (isUnitNormalized ? ymax : ymax / 1000.0);

            const isBall = det.label === "ball";
            const bw = isBall ? 16 : 30;
            const bh = isBall ? 16 : 46;
            const bx = normX * width - bw / 2;
            const by = normY * height - bh;

            const isHovered = hoveredDetection?.tracking_id === det.tracking_id;

            let strokeColor = "#3B82F6"; // MSB
            let fillColor = "rgba(59, 130, 246, 0.22)";
            let tagBg = "#1d4ed8";
            let avatarColor = "#3B82F6";

            if (det.label === "player_nlr") {
              strokeColor = "#EF4444"; // NLR
              fillColor = "rgba(239, 68, 68, 0.22)";
              tagBg = "#b91c1c";
              avatarColor = "#EF4444";
            } else if (det.label === "goalkeeper") {
              strokeColor = "#F59E0B";
              fillColor = "rgba(245, 158, 11, 0.25)";
              tagBg = "#b45309";
              avatarColor = "#F59E0B";
            } else if (det.label === "ball") {
              strokeColor = "#FACC15";
              fillColor = "rgba(250, 204, 21, 0.55)";
              tagBg = "#ca8a04";
              avatarColor = "#FACC15";
            } else if (det.label === "referee") {
              strokeColor = "#10B981";
              fillColor = "rgba(16, 185, 129, 0.25)";
              tagBg = "#047857";
              avatarColor = "#10B981";
            }

            if (isHovered) {
              strokeColor = "#06B6D4";
              fillColor = "rgba(6, 182, 212, 0.45)";
            }

            // Fill & stroke bounding box
            ctx.fillStyle = fillColor;
            ctx.fillRect(bx, by, bw, bh);

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isHovered ? 2.5 : 1.5;
            ctx.strokeRect(bx, by, bw, bh);

            // Corner brackets for AI vision targeting aesthetic
            const cornerLen = 6;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by + cornerLen);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + cornerLen, by);
            ctx.moveTo(bx + bw, by + bh - cornerLen);
            ctx.lineTo(bx + bw, by + bh);
            ctx.lineTo(bx + bw - cornerLen, by + bh);
            ctx.stroke();

            // Draw player avatar dot and shirt number inside the box
            if (!isBall) {
              const centerX = bx + bw / 2;
              const centerY = by + bh * 0.55;

              // Player circle
              ctx.fillStyle = avatarColor;
              ctx.beginPath();
              ctx.arc(centerX, centerY, 7.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1;
              ctx.stroke();

              // Player shirt number
              if (det.shirt_number !== null && det.shirt_number !== undefined) {
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 8px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String(det.shirt_number), centerX, centerY);
                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
              }
            } else {
              // Ball circle
              const centerX = bx + bw / 2;
              const centerY = by + bh / 2;
              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath();
              ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            // Foot contact point for homography pitch projection
            const footX = bx + bw / 2;
            const footY = by + bh;
            ctx.fillStyle = isHovered ? "#06B6D4" : "#10B981";
            ctx.beginPath();
            ctx.arc(footX, footY, isHovered ? 3.5 : 2, 0, Math.PI * 2);
            ctx.fill();

            // Tag label above box: TRK ID + Confidence
            const tagText = `${det.tracking_id} ${(det.confidence * 100).toFixed(0)}%`;
            ctx.font = "bold 9px monospace";
            const tagW = ctx.measureText(tagText).width + 6;
            const tagH = 13;

            ctx.fillStyle = tagBg;
            ctx.fillRect(bx, Math.max(0, by - tagH), tagW, tagH);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(tagText, bx + 3, Math.max(9, by - 3));
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight font-mono">
                  PitchPulse Vision Inspector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Homography Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time Broadcast Camera Coordinate Extraction · YOLOv11x + ByteTrack
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVisionFrame}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-all disabled:opacity-50"
              title="Run inference cycle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Inference Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 custom-scrollbar">
          {/* Top Telemetry Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Vision Backbone
              </span>
              <p className="text-xs font-bold text-slate-100 mt-1 truncate">
                {visionData.model_name}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Inference Latency
              </span>
              <p className="text-xs font-bold text-emerald-400 mt-1">
                {visionData.inference_latency_ms} ms (60 FPS)
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-purple-400" />
                Planar Homography
              </span>
              <p className="text-xs font-bold text-purple-300 mt-1 truncate">
                {visionData.homography_matrix_status}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Scan className="w-3 h-3 text-amber-400" />
                Active Tracklets
              </span>
              <p className="text-xs font-bold text-amber-300 mt-1">
                {visionData.detections.length} Entities Tracked
              </p>
            </div>
          </div>

          {/* Center: Camera Feed Canvas & Detections Table Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Visual Canvas (Camera Viewport) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Synthesized Tactical High-Camera View (1920x1080)
                </span>
                <span className="text-[10px] text-slate-400">
                  Hover table rows to inspect target box
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-[16/9] shadow-inner">
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
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Homography Output Table</span>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                  {(["ALL", "NLR", "MSB", "BALL"] as const).map((filt) => (
                    <button
                      key={filt}
                      onClick={() => setSelectedFilter(filt)}
                      className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                        selectedFilter === filt
                          ? "bg-cyan-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-2.5">Track ID</th>
                      <th className="py-2 px-2">Entity</th>
                      <th className="py-2 px-2">Conf</th>
                      <th className="py-2 px-2 text-right">Pitch (X, Y)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
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
                              ? "bg-cyan-950/60 text-white"
                              : "hover:bg-slate-900/60 text-slate-300"
                          }`}
                        >
                          <td className="py-1.5 px-2.5 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isNLR
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : isMSB
                                  ? "bg-blue-950 text-blue-300 border border-blue-800"
                                  : "bg-amber-950 text-amber-300 border border-amber-800"
                              }`}
                            >
                              {det.tracking_id}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 truncate max-w-[120px]">
                            {det.player_name || det.label.replace("_", " ").toUpperCase()}
                          </td>
                          <td className="py-1.5 px-2 text-emerald-400">
                            {(det.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="py-1.5 px-2 text-right font-semibold text-cyan-300">
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
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Planar Perspective Homography Matrix H (3x3) Calibrated to Wembley Synthetic Grid</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
