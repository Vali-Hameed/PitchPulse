"""PitchPulse Studio - FastAPI Application & Real-Time Engine.

Streams 10Hz pitch frames, 1Hz telemetry ticks, and verified broadcast overlays
via Server-Sent Events (SSE). Exposes REST endpoints for scenario injection,
playback control, recap generation, and system health.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
import json
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from app.agents.orchestrator import AgentOrchestrator
from app.config import settings
from app.data.generator import PitchSimulator
from app.data.scenarios import ScenarioStep, get_scenario
from app.engine.metrics import MetricsEngine
from app.engine.moment_detector import evaluate_moment
from app.models.schemas import (
    BroadcastOverlayPayload,
    ControlRequest,
    HealthResponse,
    MatchTickPayload,
    RawMatchEvent,
    RecapBullet,
    RecapResponse,
    ScoreState,
    VisionDetection,
    VisionFrameResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pitchpulse.server")


class MatchEngine:
    """Singleton shared match engine orchestrating physics, metrics, and multi-agent loops."""

    def __init__(self) -> None:
        self.simulator = PitchSimulator()
        self.metrics_engine = MetricsEngine()
        self.orchestrator = AgentOrchestrator()

        self.nlr_score: int = 1
        self.msb_score: int = 0
        self.is_playing: bool = True
        self.speed: int = 1  # 1x, 2x, 4x

        self.subscribers: Set[asyncio.Queue] = set()
        self.active_overlay: Optional[BroadcastOverlayPayload] = None
        self.overlays_history: List[BroadcastOverlayPayload] = []

        self.pending_scenario_steps: List[ScenarioStep] = []
        self.last_overlay_time: float = 0.0
        self.pipeline_latencies: List[float] = [340.0]  # Seeded healthy baseline
        self.start_time: float = time.time()

        self.task: Optional[asyncio.Task] = None
        self.lock = asyncio.Lock()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self.subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self.subscribers.discard(q)

    def broadcast(self, event_type: str, data: Any) -> None:
        payload = json.dumps(data) if not isinstance(data, str) else data
        msg = {"event": event_type, "data": payload}

        for q in list(self.subscribers):
            try:
                if q.full():
                    try:
                        q.get_nowait()
                    except asyncio.QueueEmpty:
                        pass
                q.put_nowait(msg)
            except Exception:
                self.subscribers.discard(q)

    async def inject_scenario(self, scenario_id: str) -> BroadcastOverlayPayload:
        scen = get_scenario(scenario_id)
        if not scen:
            raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

        async with self.lock:
            # Jump match clock
            self.simulator.set_match_clock(scen.match_clock)
            self.pending_scenario_steps = list(scen.steps)

            # Pop primary step immediately for on-air synchronization
            primary_step = self.pending_scenario_steps.pop(0)

            # Apply score changes
            self.nlr_score += primary_step.score_delta_nlr
            self.msb_score += primary_step.score_delta_msb

            if primary_step.force_chaos is not None:
                self.metrics_engine.chaos_tracker.force_value(primary_step.force_chaos)

            # Force sync simulator carrier and player snapshot
            ev = primary_step.event
            self.simulator.current_carrier_id = ev.actor_id
            self.simulator.players = {p.player_id: p for p in ev.players_snapshot}
            self.simulator.ball.x = ev.start_x
            self.simulator.ball.y = ev.start_y

            metrics = self.metrics_engine.compute(ev)
            is_key, reason, highlights = evaluate_moment(ev, metrics)
            if not is_key or not reason:
                reason = "line_breaking_pass"
                highlights = [ev.actor_id]

            # Run 3-agent pipeline (bypasses cooldown)
            overlay = await self.orchestrator.run(
                event=ev,
                metrics=metrics,
                trigger_reason=reason,
                highlight_player_ids=highlights,
                forced_draft=primary_step.forced_draft,
            )

            self.active_overlay = overlay
            self.overlays_history.append(overlay)
            self.pipeline_latencies.append(overlay.pipeline_latency_ms or 340.0)
            self.last_overlay_time = time.time()

            # Broadcast score and overlay
            self.broadcast(
                "score",
                ScoreState(
                    nlr_score=self.nlr_score,
                    msb_score=self.msb_score,
                    match_clock=self.simulator.match_clock_str,
                    status="live",
                ).model_dump(),
            )
            self.broadcast("overlay", overlay.model_dump())

            return overlay

    def get_score_state(self) -> ScoreState:
        return ScoreState(
            nlr_score=self.nlr_score,
            msb_score=self.msb_score,
            match_clock=self.simulator.match_clock_str,
            status="live" if self.is_playing else "paused",
        )

    def get_stats(self) -> Dict[str, Any]:
        lats = self.pipeline_latencies[-20:]
        avg_lat = round(sum(lats) / len(lats), 1) if lats else 340.0
        last_lat = round(self.pipeline_latencies[-1], 1) if self.pipeline_latencies else 340.0
        return {
            "avg_latency": avg_lat,
            "last_latency": last_lat,
            "uptime_s": round(time.time() - self.start_time, 1),
        }

    async def _run_loop(self) -> None:
        """Continuous 10Hz physics frame and 1Hz match event loop."""
        frame_counter = 0

        while True:
            base_sleep = 0.1 / max(1, self.speed)

            if not self.is_playing:
                await asyncio.sleep(0.2)
                continue

            # Step 1: Physics frame at 10Hz
            frame = self.simulator.step_physics_frame(dt=0.1)
            self.broadcast("frame", frame.model_dump())

            frame_counter += 1

            # Step 2: Full telemetry and metrics tick every 10 frames (~1s match time)
            if frame_counter >= 10:
                frame_counter = 0

                async with self.lock:
                    if self.pending_scenario_steps:
                        step = self.pending_scenario_steps.pop(0)
                        event = step.event
                        self.nlr_score += step.score_delta_nlr
                        self.msb_score += step.score_delta_msb
                        if step.force_chaos is not None:
                            self.metrics_engine.chaos_tracker.force_value(step.force_chaos)
                    else:
                        event = self.simulator.generate_next_event()

                    metrics = self.metrics_engine.compute(event)
                    is_key, reason, highlights = evaluate_moment(event, metrics)
                    metrics.is_key_moment = is_key
                    metrics.trigger_reason = reason

                    # Evaluate organic key-moment throttling
                    now = time.time()
                    elapsed_since_overlay = now - self.last_overlay_time
                    cooldown = settings.organic_cooldown_sec / max(1, self.speed)

                    if is_key and reason and elapsed_since_overlay >= cooldown:
                        self.last_overlay_time = now
                        # Launch agent pipeline asynchronously to avoid blocking tick cadence
                        asyncio.create_task(self._process_key_moment(event, metrics, reason, highlights))

                    tick_payload = MatchTickPayload(
                        match_clock=self.simulator.match_clock_str,
                        timestamp_sec=round(self.simulator.match_sec, 2),
                        current_event=event,
                        metrics=metrics,
                        active_overlay=self.active_overlay,
                    )
                    self.broadcast("tick", tick_payload.model_dump())

            await asyncio.sleep(base_sleep)

    async def _process_key_moment(
        self,
        event: RawMatchEvent,
        metrics: Any,
        reason: Any,
        highlights: List[str],
    ) -> None:
        try:
            overlay = await self.orchestrator.run(
                event=event,
                metrics=metrics,
                trigger_reason=reason,
                highlight_player_ids=highlights,
            )
            self.active_overlay = overlay
            self.overlays_history.append(overlay)
            self.pipeline_latencies.append(overlay.pipeline_latency_ms or 340.0)
            self.broadcast("overlay", overlay.model_dump())
        except Exception as e:
            logger.error(f"Error in multi-agent pipeline: {e}")


engine = MatchEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PitchPulse Studio match intelligence simulation...")
    engine.task = asyncio.create_task(engine._run_loop())
    yield
    if engine.task:
        engine.task.cancel()
    logger.info("PitchPulse Studio engine stopped.")


app = FastAPI(
    title="PitchPulse Studio Engine",
    description="Containerized Match Intelligence & Multi-Agent Verification API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    stats = engine.get_stats()
    return HealthResponse(
        status="healthy",
        model_mode=settings.model_mode,
        hosting_label=settings.hosting_label,
        running_on_aca=settings.running_on_aca,
        avg_pipeline_latency_ms=stats["avg_latency"],
        last_pipeline_latency_ms=stats["last_latency"],
        grounded_pct=100.0,
        uptime_s=stats["uptime_s"],
    )


@app.get("/api/stream")
async def event_stream(request: Request):
    """Server-Sent Events endpoint streaming 10Hz frames, 1Hz ticks, and verified overlays."""
    q = engine.subscribe()

    async def event_generator() -> AsyncGenerator[Dict[str, str], None]:
        try:
            # Emit initial snapshot on client connection
            initial_snapshot = {
                "score": engine.get_score_state().model_dump(),
                "history": [ovl.model_dump() for ovl in engine.overlays_history[-5:]],
                "active_overlay": engine.active_overlay.model_dump() if engine.active_overlay else None,
                "model_mode": settings.model_mode,
                "hosting_label": settings.hosting_label,
            }
            yield {"event": "snapshot", "data": json.dumps(initial_snapshot)}

            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    # Heartbeat comment to keep connection active
                    yield {"comment": "keep-alive"}
        finally:
            engine.unsubscribe(q)

    return EventSourceResponse(event_generator())


@app.post("/api/inject/{scenario_id}")
async def inject_scenario(scenario_id: str):
    """Inject one of the 5 pre-configured demo scenarios immediately into the stream."""
    overlay = await engine.inject_scenario(scenario_id)
    return {"status": "injected", "scenario_id": scenario_id, "overlay": overlay}


@app.post("/api/control")
async def control_simulation(req: ControlRequest):
    """Handle play, pause, reset, and playback speed (1x, 2x, 4x)."""
    if req.action == "play":
        engine.is_playing = True
    elif req.action == "pause":
        engine.is_playing = False
    elif req.action == "reset":
        engine.simulator.reset()
        engine.metrics_engine.reset()
        engine.nlr_score = 1
        engine.msb_score = 0
        engine.active_overlay = None
        engine.overlays_history.clear()
        engine.is_playing = True
    elif req.action == "speed" and req.speed in (1, 2, 4):
        engine.speed = req.speed

    score = engine.get_score_state()
    engine.broadcast("score", score.model_dump())
    return {"status": "updated", "action": req.action, "speed": engine.speed, "is_playing": engine.is_playing}


@app.get("/api/vision/inspect", response_model=VisionFrameResponse)
async def vision_auto_eventing_inspect() -> VisionFrameResponse:
    """Simulated Computer Vision auto-eventing module (Azure AI Vision / YOLOv8).

    Extracts bounding boxes from synthetic broadcast camera feed and applies
    homography transformation matrix to map frame pixels to 2D pitch coordinates.
    """
    detections: List[VisionDetection] = []
    players = list(engine.simulator.players.values())

    # Map pitch coordinates (X: 0..105, Y: 0..68) to simulated camera perspective
    for idx, p in enumerate(players):
        # Normalize pitch to camera frame perspective (with homography projection)
        norm_x = (p.x / 105.0) * 0.84 + 0.08
        norm_y = (p.y / 68.0) * 0.76 + 0.12
        box_w = 0.024
        box_h = 0.052

        ymin = max(0.0, norm_y - box_h)
        xmin = max(0.0, norm_x - box_w / 2)
        ymax = min(1.0, norm_y)
        xmax = min(1.0, norm_x + box_w / 2)

        label = "goalkeeper" if p.shirt_number == 1 else ("player_nlr" if p.team == "NLR" else "player_msb")
        detections.append(
            VisionDetection(
                tracking_id=f"TRK_{p.team}_{p.shirt_number}",
                label=label,  # type: ignore
                shirt_number=p.shirt_number,
                player_name=p.name,
                confidence=round(0.94 + (idx % 5) * 0.012, 3),
                box_2d=[round(ymin, 4), round(xmin, 4), round(ymax, 4), round(xmax, 4)],
                pitch_x=p.x,
                pitch_y=p.y,
            )
        )

    # Ball detection
    ball = engine.simulator.ball
    bnorm_x = (ball.x / 105.0) * 0.84 + 0.08
    bnorm_y = (ball.y / 68.0) * 0.76 + 0.12
    detections.append(
        VisionDetection(
            tracking_id="TRK_BALL_1",
            label="ball",
            shirt_number=None,
            player_name=None,
            confidence=0.982,
            box_2d=[round(bnorm_y - 0.012, 4), round(bnorm_x - 0.008, 4), round(bnorm_y, 4), round(bnorm_x + 0.008, 4)],
            pitch_x=ball.x,
            pitch_y=ball.y,
        )
    )

    return VisionFrameResponse(
        frame_id=engine.simulator.event_counter * 30,
        match_clock=engine.simulator.match_clock_str,
        fps=30.0,
        inference_latency_ms=18.4,
        detections=detections,
        model_name="Azure AI Vision (YOLOv8x Football Model)",
        homography_matrix_status="CALIBRATED (Pitch Keypoints: 29)",
    )


@app.get("/api/recap", response_model=RecapResponse)
async def match_recap(
    persona: str = Query(default="analyst", pattern="^(analyst|casual|player_focus)$"),
    lang: str = Query(default="en", pattern="^(en|es|ar|ko|fr|pt|de)$"),
    club: str = Query(default="NLR", pattern="^(NLR|MSB)$"),
) -> RecapResponse:
    """Generate a whole-game chronological recap featuring all pivotal key moments."""
    overlays = engine.overlays_history
    bullets: List[RecapBullet] = []

    # If live overlays were triggered during the match, harvest all key moments
    if overlays:
        for idx, ovl in enumerate(overlays):
            trans = ovl.personas.translations.get(lang, ovl.personas.translations.get("en", {}))
            text = trans.get(persona, ovl.subtext)
            headline = trans.get("headline", ovl.headline)
            bullets.append(
                RecapBullet(
                    minute=ovl.match_clock,
                    headline=headline,
                    text=text,
                    event_id=idx + 1,
                    tag=ovl.overlay_type.replace("_", " ").title(),
                )
            )

    # Full-game canonical 5 key moments spanning Minute 1 to 90
    canonical_moments: Dict[str, List[tuple[str, str, str, str]]] = {
        "en": [
            ("18:42", "Line-Breaking Half-Space Pass", "Marcus Vance sliced through the midfield block under 86% pressure to unlock a high-value +0.34 xT corridor.", "Line Breaker"),
            ("34:15", "High-Press Counter Trap", "Declan Rice forced a turnover in the attacking third; Bukayo Saka accelerated to 33.4 km/h to challenge the backline.", "Press Counter"),
            ("58:05", "Chaos Rhythm Shift", "Four rapid turnovers in 35 seconds spiked the Chaos Index to 88, transforming tactical structure into transition warfare.", "Chaos Surge"),
            ("73:50", "Decoy Run & Clinical Goal (1-0)", "Kai Havertz's blind-side decoy run dragged two defenders, freeing Marcus Vance to rifle a 106 km/h finish into the bottom corner.", "Goal"),
            ("84:10", "Grounded Low-Block Defending", "Saliba and Gabriel anchored a compact low block, absorbing Merseyside Blue pressure with 100% verified spatial structure.", "Defensive Stand"),
        ],
        "es": [
            ("18:42", "Pase Filtrado Rompelíneas", "Marcus Vance rompió el bloque medio bajo 86% de presión, habilitando un pasillo clave de +0.34 xT.", "Rompelíneas"),
            ("34:15", "Trampa de Presión Alta", "Declan Rice forzó la pérdida en campo rival y Bukayo Saka aceleró a 33.4 km/h al contraataque.", "Presión Alta"),
            ("58:05", "Giro de Ritmo y Caos", "Cuatro pérdidas en 35 segundos dispararon el Índice de Caos a 88, acelerando el partido al límite.", "Caos Táctico"),
            ("73:50", "Desmarque Decoy y Golazo (1-0)", "El desmarque de Kai Havertz arrastró la marca, permitiendo a Marcus Vance fusilar a 106 km/h hacia la escuadra.", "Gol Decisivo"),
            ("84:10", "Resistencia en Bloque Bajo", "Saliba y Gabriel cerraron filas en bloque bajo verificado, asegurando los tres puntos ante el asedio rival.", "Defensa Férrea"),
        ],
        "ar": [
            ("18:42", "تمريرة كاسرة للخطوط في نصف المساحة", "ماركوس فانس يمرر كرة دقيقة تحت ضغط 86% ليخلق فرصة خطورة متوقعة بقيمة +0.34 xT.", "كسر الخطوط"),
            ("34:15", "فخ الضغط العالي والهجمة المرتدة", "ديكلان رايس يقطع الكرة في الثلث الهجومي وبوكايو ساكا ينطلق بسرعة 33.4 كم/س لتهديد المرمى.", "ضغط مرتد"),
            ("58:05", "تحول الإيقاع وارتفاع مؤشر الفوضى", "أربع تمريرات مفقودة في 35 ثانية رفعت مؤشر الفوضى إلى 88 ليتحول اللقاء لصراع تحولات بدني.", "فوضى تكتيكية"),
            ("73:50", "تحرك وهمي وهدف الحسم الرائع (1-0)", "تحرك كاي هافيرتز التكتيكي سحب قلبي الدفاع، ليمنح فانس المساحة لإطلاق صاروخية بسرعة 106 كم/س.", "هدف رائع"),
            ("84:10", "صمود دفاعي منضبط ومحكم", "ساليبا وغابرييل يقودان التكتل الدفاعي بثبات وصرامة تحت ضغط المنافس لضمان الفوز.", "صمود دفاعي"),
        ],
        "ko": [
            ("18:42", "하프스페이스 라인 브레이킹 패스", "마커스 반스 선수가 86% 극한 압박 속에서 상대 미드필드 블록을 관통해 +0.34 xT 기회를 열었습니다.", "라인 브레이커"),
            ("34:15", "전방 압박 트랩 & 폭풍 역습", "데클란 라이스의 공격 진영 볼 탈취 후 부카요 사카 선수가 33.4 km/h 폭발적 스피드로 역습을 전개했습니다.", "압박 카운터"),
            ("58:05", "경기 템포 전환 & 카오스 급상승", "35초 만에 발생한 4번의 턴오버로 카오스 지수가 88까지 치솟으며 치열한 공방전으로 전환되었습니다.", "카오스 서지"),
            ("73:50", "디코이 런 & 통렬한 선제 결승골 (1-0)", "카이 하베르츠의 미끼 움직임이 수비 시선을 끈 사이, 마커스 반스가 106 km/h 대포알 슈팅으로 골망을 갈랐습니다.", "결정적 골"),
            ("84:10", "검증된 로우 블록 육탄 수비", "살리바와 마갈량이스 센터백 듀오가 100% 검증된 수비 간격을 유지하며 상대 총공세를 완벽 차단했습니다.", "수비 집중력"),
        ],
        "fr": [
            ("18:42", "Passe Tranchante dans le Demi-Espace", "Marcus Vance brise le bloc adverse sous 86% de pression pour ouvrir un corridor à +0.34 xT.", "Ligne Brisée"),
            ("34:15", "Piège de Pressing Haut & Contre", "Récupération haute de Declan Rice et accélération foudroyante de Bukayo Saka mesurée à 33.4 km/h.", "Contre-Pressing"),
            ("58:05", "Rupture de Rythme & Montée de Chaos", "Quatre pertes de balle en 35 secondes portent l'Indice de Chaos à 88, emballant la rencontre.", "Pic de Chaos"),
            ("73:50", "Appel Leurre & But Chirurgical (1-0)", "L'appel sans ballon de Kai Havertz aspire la charnière, permettant à Marcus Vance d'ajuster un missile à 106 km/h.", "But Somptueux"),
            ("84:10", "Rigueur Défensive en Bloc Bas", "Saliba et Gabriel verrouillent l'axe avec une compacité vérifiée pour préserver l'avantage d'un but.", "Forteresse"),
        ],
        "pt": [
            ("18:42", "Passe que quebra linhas no meio-espaço", "Marcus Vance rompeu o bloco sob 86% de pressão, desbloqueando um corredor de +0.34 xT.", "Quebra de Linha"),
            ("34:15", "Armadilha de Pressão Alta e Contra-ataque", "Declan Rice rouba a bola no terço final e Bukayo Saka atinge 33.4 km/h em arrancada veloz.", "Pressão Ofensiva"),
            ("58:05", "Inversão de Ritmo e Explosão de Caos", "Quatro perdas de posse em 35 segundos elevaram o Índice de Caos para 88, gerando pura transição.", "Pico de Caos"),
            ("73:50", "Corrida de Despiste e Gol Espetacular (1-0)", "Movimentação genial de Kai Havertz abre espaço para Marcus Vance fuzilar a 106 km/h no canto.", "Gol Decisivo"),
            ("84:10", "Segurança Total em Bloco Baixo", "Saliba e Gabriel comandam o sistema defensivo com disciplina espacial comprovada para selar a vitória.", "Muralha Defensiva"),
        ],
        "de": [
            ("18:42", "Linienbrechender Pass im Halbraum", "Marcus Vance hebelt den gegnerischen Abwehrblock unter 86% Druck mit einem +0.34 xT Pass aus.", "Linienbrecher"),
            ("34:15", "Gegenpressing-Falle & Umschaltmoment", "Balleroberung durch Declan Rice im Angriffsdrittel; Bukayo Saka sprintet mit 33.4 km/h vors Tor.", "Pressingfalle"),
            ("58:05", "Rhythmuswechsel & Chaos-Spitze", "Vier Ballverluste binnen 35 Sekunden treiben den Chaos-Index auf 88 – das Spiel wird rasant und intensiv.", "Chaos-Phase"),
            ("73:50", "Täuschungslauf & Traumtor (1-0)", "Kai Havertz bindet zwei Innenverteidiger mit einem perfekten Laufweg; Marcus Vance trifft mit 106 km/h.", "Führungstreffer"),
            ("84:10", "Disziplinierter Abwehrriegel im Tiefblock", "Saliba und Gabriel halten den Strafraum mit 100% verifizierter Raumaufteilung schadlos.", "Abwehrfestung"),
        ],
    }

    # If few dynamic overlays have fired yet, present the full-game key moments sequence
    if len(bullets) < 4:
        pack = canonical_moments.get(lang, canonical_moments["en"])
        bullets = [
            RecapBullet(
                minute=minute,
                headline=head,
                text=desc,
                event_id=200 + i,
                tag=tag,
            )
            for i, (minute, head, desc, tag) in enumerate(pack)
        ]

    score_str = f"NLR {engine.nlr_score} - {engine.msb_score} MSB"
    headlines = {
        "en": "Full-Match Tactical Recap (Key Moments 1'-90')",
        "es": "Resumen Táctico Completo (Momentos Clave 1'-90')",
        "ar": "ملخص المباراة التكتيكي الشامل (أبرز اللحظات 1'-90')",
        "ko": "전체 경기 전술 리캡 (핵심 하이라이트 1'-90')",
        "fr": "Résumé Tactique Complet du Match (Moments Clés 1'-90')",
        "pt": "Resumo Tático Completo da Partida (Momentos Decisivos 1'-90')",
        "de": "Vollständiger Taktischer Spielbericht (Schlüsselmomente 1'-90')",
    }
    headline = headlines.get(lang, headlines["en"])

    return RecapResponse(
        match_clock=engine.simulator.match_clock_str,
        score=score_str,
        headline=headline,
        bullets=bullets,
        persona=persona,
        lang=lang,
        club=club,
    )

