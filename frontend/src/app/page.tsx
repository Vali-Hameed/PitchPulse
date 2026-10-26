"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { TopControlBar } from "@/components/TopControlBar";
import { PipelineStatusStrip } from "@/components/PipelineStatusStrip";
import { PitchCanvas } from "@/components/PitchCanvas";
import { BroadcastOverlay } from "@/components/BroadcastOverlay";
import { MomentumGauge } from "@/components/MomentumGauge";
import { PersonaFeed } from "@/components/PersonaFeed";
import { ReceiptsDrawer } from "@/components/ReceiptsDrawer";
import { CatchUpModal } from "@/components/CatchUpModal";
import { VisionInspectorModal } from "@/components/VisionInspectorModal";
import { TelemetryIngestModal } from "@/components/TelemetryIngestModal";
import { useMatchStream } from "@/hooks/useMatchStream";
import {
  BroadcastOverlayPayload,
  LanguageCode,
  PersonaMode,
} from "@/types/match";

export default function BroadcastControlDeckPage() {
  const {
    isConnected,
    scoreState,
    latestTick,
    activeOverlay,
    overlayHistory,
    health,
    playbackSpeed,
    isPlaying,
    frameBufferRef,
    control,
    injectScenario,
    ingestCustomEvent,
    askStudioPundit,
    fetchRecap,
  } = useMatchStream();

  const [selectedPersona, setSelectedPersona] = useState<PersonaMode>("analyst");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("NLR-8");
  const [inspectedOverlay, setInspectedOverlay] = useState<BroadcastOverlayPayload | null>(null);
  const [isRecapOpen, setIsRecapOpen] = useState<boolean>(false);
  const [isVisionOpen, setIsVisionOpen] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // Persistent refs for bulletproof Web Speech API audio lifecycle & GC protection
  const isAudioEnabledRef = useRef<boolean>(false);
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const lastSpokenOverlayIdRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
    if (!isAudioEnabled) {
      // Immediately silence any ongoing or queued synthesis when toggled OFF
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      activeUtterancesRef.current = [];
    }
  }, [isAudioEnabled]);

  // Player-Cam mode is active when user selects player_focus persona
  const isPlayerCamActive = selectedPersona === "player_focus";

  // Web Speech API multilingual speech synthesis with Chromium GC protection & voice matching
  const speakText = useCallback((text: string, lang: LanguageCode, force: boolean = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // If audio toggle is OFF, strictly do not play audio
    if (!isAudioEnabledRef.current && !force) return;

    try {
      // 1. Cancel previous speech to prevent overlapping queues
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Supported language mappings for 7 broadcast languages
      const langMap: Record<LanguageCode, string> = {
        en: "en-US",
        es: "es-ES",
        ar: "ar-SA",
        ko: "ko-KR",
        fr: "fr-FR",
        pt: "pt-BR",
        de: "de-DE",
      };

      const targetLang = langMap[lang] || "en-US";
      utterance.lang = targetLang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // 2. Intelligent voice detection across available browser voices
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = lang.toLowerCase();
        let matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(langPrefix) ||
            v.lang.toLowerCase().replace("_", "-").startsWith(targetLang.toLowerCase())
        );

        // Special handling for Arabic if host OS lacks ar-SA voice pack
        if (!matchedVoice && lang === "ar") {
          matchedVoice = voices.find(
            (v) =>
              v.name.toLowerCase().includes("arabic") ||
              v.lang.toLowerCase().includes("ar")
          );
          if (!matchedVoice) {
            // Friendly fallback: if no Arabic voice is installed in Windows, use international English voice
            matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0];
          }
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      // 3. Prevent Chromium garbage collection bug (which causes speech cutoff after 0.5s)
      // By keeping a strong reference in a persistent React ref and window global
      activeUtterancesRef.current.push(utterance);
      (window as any).__pp_active_utterance = utterance;

      utterance.onend = () => {
        activeUtterancesRef.current = activeUtterancesRef.current.filter((u) => u !== utterance);
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis completed or cancelled:", e);
        activeUtterancesRef.current = activeUtterancesRef.current.filter((u) => u !== utterance);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }, []);

  // When live audio is toggled ON, vocalize new key overlay narratives as they arrive
  useEffect(() => {
    if (!isAudioEnabled || !activeOverlay) return;

    // Avoid repeating the exact same overlay continuously
    if (lastSpokenOverlayIdRef.current === activeOverlay.overlay_id) return;
    lastSpokenOverlayIdRef.current = activeOverlay.overlay_id;

    const trans = activeOverlay.personas?.translations || {};
    const langPack = trans[selectedLanguage] || trans["en"] || {};
    const copy = langPack[selectedPersona] || activeOverlay.subtext;
    const head = langPack.headline || activeOverlay.headline;

    speakText(`${head}. ${copy}`, selectedLanguage, false);
  }, [activeOverlay?.overlay_id, isAudioEnabled, selectedLanguage, selectedPersona, speakText]);

  // Master Audio Toggle Handler
  const handleToggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const nextState = !prev;
      if (!nextState) {
        // Turning OFF: instantly silence all speech
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        activeUtterancesRef.current = [];
      } else {
        // Turning ON: vocalize the current active moment if one exists
        if (activeOverlay) {
          const trans = activeOverlay.personas?.translations || {};
          const langPack = trans[selectedLanguage] || trans["en"] || {};
          const copy = langPack[selectedPersona] || activeOverlay.subtext;
          const head = langPack.headline || activeOverlay.headline;
          setTimeout(() => {
            speakText(`${head}. ${copy}`, selectedLanguage, true);
          }, 50);
        }
      }
      return nextState;
    });
  };

  const handleSelectPlayer = (id: string) => {
    setSelectedPlayerId(id);
    setSelectedPersona("player_focus");
  };

  return (
    <main className="min-h-screen bg-[#07080A] flex flex-col text-[#F4F4F6]">
      {/* 1. Master Top Control Bar */}
      <TopControlBar
        score={scoreState}
        health={health}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={handleSelectPlayer}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onControl={control}
        onInject={injectScenario}
        onOpenRecap={() => setIsRecapOpen(true)}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenIngest={() => setIsIngestOpen(true)}
      />

      {/* 2. Master Broadcast Layout Grid */}
      <div className="flex-1 p-3 md:p-4 max-w-[1780px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: 5-Stage Pipeline Strip + Interactive 2D Pitch Canvas + TV Chyron + Linear Telemetry */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          {/* Live 5-Stage Telemetry & Multi-Agent Pipeline Visualizer */}
          <PipelineStatusStrip
            latestTick={latestTick}
            activeOverlay={activeOverlay}
            selectedPersona={selectedPersona}
            selectedLanguage={selectedLanguage}
            onOpenReceipts={(ovl) => setInspectedOverlay(ovl)}
            onOpenIngest={() => setIsIngestOpen(true)}
          />

          {/* Pitch Container with Embedded Lower-Third Broadcast Chyron */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#07080A]">
            <PitchCanvas
              frameBufferRef={frameBufferRef}
              latestTick={latestTick}
              activeOverlay={activeOverlay}
              isPlayerCamActive={isPlayerCamActive}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={handleSelectPlayer}
            />

            {/* Broadcast Lower-Third Chyron Graphic */}
            <BroadcastOverlay
              overlay={activeOverlay}
              selectedPersona={selectedPersona}
              selectedLanguage={selectedLanguage}
              selectedPlayerId={selectedPlayerId}
              onOpenReceipts={(ovl) => setInspectedOverlay(ovl)}
              onDismiss={() => setActiveOverlay(null)}
            />
          </div>

          {/* F1-Style Precision Linear Telemetry Strip & Territory Bar */}
          <MomentumGauge metrics={latestTick?.metrics ?? null} />
        </section>

        {/* Right Column: Multilingual Studio Persona Stream */}
        <section className="lg:col-span-4 w-full">
          <PersonaFeed
            overlays={overlayHistory}
            selectedPersona={selectedPersona}
            selectedLanguage={selectedLanguage}
            selectedPlayerId={selectedPlayerId}
            onSelectPersona={setSelectedPersona}
            onSelectLanguage={setSelectedLanguage}
            onOpenReceipts={(ovl) => setInspectedOverlay(ovl)}
            onSpeakText={(text, lang) => speakText(text, lang, true)}
            onAskPundit={(q, club) =>
              askStudioPundit(q, selectedPersona, selectedLanguage, selectedPlayerId, club)
            }
          />
        </section>
      </div>

      {/* 3. Telemetry Receipts Inspector Slide-Over Drawer */}
      <ReceiptsDrawer
        overlay={inspectedOverlay}
        onClose={() => setInspectedOverlay(null)}
      />

      {/* 4. Full-Match 30-Second Catch-Up Recap Modal */}
      <CatchUpModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
        selectedPersona={selectedPersona}
        selectedLanguage={selectedLanguage}
        onFetchRecap={fetchRecap}
        onReplayScenario={injectScenario}
        onSpeakText={(text, lang) => speakText(text, lang, true)}
      />

      {/* 5. AI Vision Auto-Eventing & Homography Inspector Modal */}
      <VisionInspectorModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        onIngestAutoEvent={ingestCustomEvent}
      />

      {/* 6. Custom Synthetic Telemetry JSON Ingest & Verifier Lab Modal */}
      <TelemetryIngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngest={ingestCustomEvent}
      />
    </main>
  );
}
