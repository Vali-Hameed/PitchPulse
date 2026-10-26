"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  BroadcastOverlayPayload,
  CustomEventIngestRequest,
  DVRFrameSnapshot,
  FramePayload,
  HealthResponse,
  LanguageCode,
  MatchTickPayload,
  PersonaMode,
  RecapResponse,
  ScoreState,
  TeamCode,
} from "@/types/match";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useMatchStream() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [scoreState, setScoreState] = useState<ScoreState>({
    nlr_score: 1,
    msb_score: 0,
    match_clock: "64:12",
    status: "live",
  });
  const [latestTick, setLatestTick] = useState<MatchTickPayload | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<BroadcastOverlayPayload | null>(null);
  const [overlayHistory, setOverlayHistory] = useState<BroadcastOverlayPayload[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // 60-Second Rolling Circular DVR Buffer (600 frames at 10Hz)
  const dvrBufferRef = useRef<DVRFrameSnapshot[]>([]);
  const [dvrBufferLength, setDvrBufferLength] = useState<number>(0);
  const [scrubIndex, setScrubIndex] = useState<number>(-1); // -1 indicates LIVE stream head
  const latestMatchClockRef = useRef<string>("64:12");

  // Buffer of incoming frames for the 300ms LERP canvas interpolator
  // Stored in a ref to decouple 10Hz stream ingestion from React component render tree
  const frameBufferRef = useRef<FramePayload[]>([]);

  // Periodic health check
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data: HealthResponse = await res.json();
        setHealth(data);
      }
    } catch {
      // Offline fallback state
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 4000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Connect to SSE stream
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    function connect() {
      try {
        es = new EventSource(`${API_BASE}/api/stream`);

        es.onopen = () => {
          setIsConnected(true);
        };

        es.addEventListener("snapshot", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.score) setScoreState(data.score);
            if (data.history) setOverlayHistory(data.history);
            if (data.active_overlay) setActiveOverlay(data.active_overlay);
          } catch (err) {
            console.error("Failed to parse snapshot", err);
          }
        });

        es.addEventListener("frame", (e: MessageEvent) => {
          try {
            const frame: FramePayload = JSON.parse(e.data);
            // Push frame to LERP buffer (keep last 12 frames)
            const buf = frameBufferRef.current;
            buf.push(frame);
            if (buf.length > 12) {
              buf.shift();
            }

            // Push to rolling 60s DVR circular buffer (600 frames at 10Hz)
            const snap: DVRFrameSnapshot = {
              frame,
              matchClock: latestMatchClockRef.current || "64:12",
              timestampSec: Date.now() / 1000,
            };
            const dvr = dvrBufferRef.current;
            dvr.push(snap);
            if (dvr.length > 600) {
              dvr.shift();
              setScrubIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
            setDvrBufferLength(dvr.length);
          } catch (err) {
            console.error("Failed to parse frame", err);
          }
        });

        es.addEventListener("tick", (e: MessageEvent) => {
          try {
            const tick: MatchTickPayload = JSON.parse(e.data);
            setLatestTick(tick);
            latestMatchClockRef.current = tick.match_clock;
            setScoreState((prev) => ({
              ...prev,
              match_clock: tick.match_clock,
            }));
          } catch (err) {
            console.error("Failed to parse tick", err);
          }
        });

        es.addEventListener("score", (e: MessageEvent) => {
          try {
            const score: ScoreState = JSON.parse(e.data);
            setScoreState(score);
          } catch (err) {
            console.error("Failed to parse score", err);
          }
        });

        es.addEventListener("overlay", (e: MessageEvent) => {
          try {
            const overlay: BroadcastOverlayPayload = JSON.parse(e.data);
            setActiveOverlay(overlay);
            setOverlayHistory((prev) => [overlay, ...prev.filter((o) => o.overlay_id !== overlay.overlay_id)].slice(0, 20));
          } catch (err) {
            console.error("Failed to parse overlay", err);
          }
        });

        es.onerror = () => {
          setIsConnected(false);
          if (es) {
            es.close();
          }
          reconnectTimer = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.error("SSE connection error", err);
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (es) es.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const control = useCallback(
    async (action: "play" | "pause" | "reset" | "speed", speed?: 1 | 2 | 4) => {
      try {
        if (action === "play") setIsPlaying(true);
        if (action === "pause") setIsPlaying(false);
        if (action === "speed" && speed) setPlaybackSpeed(speed);
        if (action === "reset") {
          setIsPlaying(true);
          setActiveOverlay(null);
          setOverlayHistory([]);
          frameBufferRef.current = [];
          dvrBufferRef.current = [];
          setScrubIndex(-1);
          setDvrBufferLength(0);
        }

        await fetch(`${API_BASE}/api/control`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, speed }),
        });
      } catch (err) {
        console.error("Control API call failed", err);
      }
    },
    []
  );

  const injectScenario = useCallback(async (scenarioId: string) => {
    try {
      // Clear buffer on injection to prevent interpolation rubber-banding
      frameBufferRef.current = [];
      const res = await fetch(`${API_BASE}/api/inject/${scenarioId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.overlay) {
          setActiveOverlay(data.overlay);
          setOverlayHistory((prev) => [data.overlay, ...prev.filter((o) => o.overlay_id !== data.overlay.overlay_id)]);
        }
      }
    } catch (err) {
      console.error("Scenario injection failed", err);
    }
  }, []);

  const ingestCustomEvent = useCallback(
    async (payload: CustomEventIngestRequest): Promise<BroadcastOverlayPayload | null> => {
      try {
        frameBufferRef.current = [];
        const res = await fetch(`${API_BASE}/api/events/ingest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.overlay) {
            setActiveOverlay(data.overlay);
            setOverlayHistory((prev) => [
              data.overlay,
              ...prev.filter((o) => o.overlay_id !== data.overlay.overlay_id),
            ]);
            return data.overlay;
          }
        }
      } catch (err) {
        console.error("Custom event ingest failed", err);
      }
      return null;
    },
    []
  );

  const askStudioPundit = useCallback(
    async (
      question: string,
      persona: PersonaMode,
      lang: LanguageCode,
      playerId?: string,
      club: "ALL" | "NLR" | "MSB" = "ALL"
    ): Promise<BroadcastOverlayPayload | null> => {
      try {
        const payload = {
          question,
          persona,
          lang,
          player_id: playerId || "NLR-8",
          club,
        };

        let res: Response | null = null;
        try {
          res = await fetch("/api/studio/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {
          res = null;
        }

        if (!res || !res.ok) {
          res = await fetch(`${API_BASE}/api/studio/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.overlay) {
            setActiveOverlay(data.overlay);
            setOverlayHistory((prev) => [
              data.overlay,
              ...prev.filter((o) => o.overlay_id !== data.overlay.overlay_id),
            ]);
            return data.overlay;
          }
        }
      } catch (err) {
        console.error("Studio Q&A failed", err);
      }
      return null;
    },
    []
  );

  const fetchRecap = useCallback(
    async (
      persona: PersonaMode,
      lang: LanguageCode,
      club: TeamCode
    ): Promise<RecapResponse | null> => {
      try {
        const url = `${API_BASE}/api/recap?persona=${persona}&lang=${lang}&club=${club}`;
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch recap", err);
      }
      return null;
    },
    []
  );

  // Step through historical DVR frames when playing back behind live
  useEffect(() => {
    if (!isPlaying || scrubIndex < 0) return;

    const intervalMs = Math.max(25, Math.floor(100 / playbackSpeed));
    const timer = setInterval(() => {
      setScrubIndex((prev) => {
        if (prev < 0) return -1;
        const total = dvrBufferRef.current.length;
        if (prev + 1 >= total - 1) {
          return -1; // Caught back up to live!
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, scrubIndex, playbackSpeed]);

  const scrubToFraction = useCallback((frac: number) => {
    const total = dvrBufferRef.current.length;
    if (total === 0) return;
    if (frac >= 0.98) {
      setScrubIndex(-1); // Live
    } else {
      const idx = Math.min(total - 1, Math.max(0, Math.floor(frac * (total - 1))));
      setScrubIndex(idx);
    }
  }, []);

  const nudgeDVR = useCallback((deltaSeconds: number) => {
    const total = dvrBufferRef.current.length;
    if (total === 0) return;
    const deltaFrames = Math.round(deltaSeconds * 10);
    setScrubIndex((prev) => {
      const current = prev < 0 ? total - 1 : prev;
      const target = current + deltaFrames;
      if (target >= total - 1) {
        return -1; // Back to live
      }
      return Math.max(0, target);
    });
  }, []);

  const jumpToLive = useCallback(() => {
    setScrubIndex(-1);
  }, []);

  const isLive = scrubIndex === -1;
  const timeShiftedSnapshot: DVRFrameSnapshot | null =
    scrubIndex >= 0 && dvrBufferRef.current[scrubIndex]
      ? dvrBufferRef.current[scrubIndex]
      : null;
  const secondsBehindLive =
    scrubIndex >= 0
      ? Math.max(
          0,
          Math.round(((dvrBufferRef.current.length - 1 - scrubIndex) * 0.1) * 10) / 10
        )
      : 0;

  return {
    isConnected,
    scoreState,
    latestTick,
    activeOverlay,
    overlayHistory,
    health,
    playbackSpeed,
    isPlaying,
    frameBufferRef,
    dvrBufferRef,
    dvrBufferLength,
    scrubIndex,
    isLive,
    secondsBehindLive,
    timeShiftedSnapshot,
    scrubToFraction,
    nudgeDVR,
    jumpToLive,
    control,
    injectScenario,
    ingestCustomEvent,
    askStudioPundit,
    fetchRecap,
    setActiveOverlay,
    setIsPlaying,
  };
}
