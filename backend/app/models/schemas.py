"""Strict Pydantic v2 schemas for all PitchPulse Studio pipeline stages."""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class PlayerPosition(BaseModel):
    """Instantaneous spatial and physical telemetry for an on-pitch player."""

    player_id: str
    name: str
    shirt_number: int
    team: Literal["NLR", "MSB"]
    x: float = Field(..., ge=0.0, le=105.0, description="Pitch length coordinate in meters [0.0 - 105.0]")
    y: float = Field(..., ge=0.0, le=68.0, description="Pitch width coordinate in meters [0.0 - 68.0]")
    speed_kmh: float = Field(..., ge=0.0, le=40.0, description="Player locomotion velocity capped at 40 km/h")
    stamina_pct: float = Field(default=100.0, ge=0.0, le=100.0, description="Physiological stamina percentage")


class BallPosition(BaseModel):
    """3D ball coordinates and velocity."""

    x: float = Field(..., ge=0.0, le=105.0)
    y: float = Field(..., ge=0.0, le=68.0)
    z: float = Field(default=0.0, ge=0.0, le=30.0)
    speed_kmh: float = Field(default=0.0, ge=0.0)


class RawMatchEvent(BaseModel):
    """Discrete match event with spatial vector and synchronized 22-player snapshot."""

    event_id: int
    match_clock: str
    timestamp_sec: float
    event_type: Literal[
        "pass", "shot", "tackle", "interception", "pressure", "carry", "turnover", "goal"
    ]
    team: Literal["NLR", "MSB"]
    actor_id: str
    actor_name: str
    actor_number: int
    target_id: Optional[str] = None
    target_name: Optional[str] = None
    target_number: Optional[int] = None
    start_x: float
    start_y: float
    end_x: float
    end_y: float
    ball_speed_kmh: float
    nearest_defender_dist_m: float
    defenders_bypassed: int
    players_snapshot: List[PlayerPosition]


class ComputedMetrics(BaseModel):
    """Deterministic spatial, threat, and chaos metrics computed without LLM speculation."""

    xt_start: float
    xt_end: float
    xt_delta: float
    pass_difficulty_score: float = Field(..., ge=0.0, le=100.0)
    pressure_index: float = Field(..., ge=0.0, le=100.0)
    control_chaos_index: float = Field(..., ge=0.0, le=100.0)
    field_tilt_nlr_pct: float = Field(..., ge=0.0, le=100.0)
    sprint_burst_triggered: bool = False
    is_key_moment: bool = False
    trigger_reason: Optional[str] = None


class CheckedClaim(BaseModel):
    """Individual assertion extracted from draft narrative audited against telemetry."""

    claim: str
    ground_truth: Any
    status: Literal["MATCH", "CORRECTED"]
    metric_name: str


class VerificationReceipt(BaseModel):
    """Studio Verifier cryptographic-style receipt providing an auditable proof trail."""

    verified: bool
    confidence_score: float
    checked_claims: List[CheckedClaim]
    source_event_ids: List[int]
    correction_applied: bool
    audit_notes: str
    raw_telemetry_snapshot: Dict[str, Any]


class PersonaOutputs(BaseModel):
    """Audience-tailored copies across 3 viewing personas and 7 broadcast languages."""

    analyst: str
    casual: str
    player_focus: str
    player_cam_target_id: Optional[str] = None
    translations: Dict[str, Dict[str, str]]



class VisionDetection(BaseModel):
    """Simulated Azure AI Vision / YOLO coordinate extraction detection."""

    tracking_id: str
    label: Literal["player_nlr", "player_msb", "goalkeeper", "ball", "referee"]
    shirt_number: Optional[int] = None
    player_name: Optional[str] = None
    confidence: float
    box_2d: List[float]  # [ymin, xmin, ymax, xmax] in normalized 0-1 video frame coordinates
    pitch_x: float  # Homography-mapped pitch length (0.0 to 105.0m)
    pitch_y: float  # Homography-mapped pitch width (0.0 to 68.0m)


class VisionFrameResponse(BaseModel):
    """Computer vision auto-eventing frame analysis."""

    frame_id: int
    match_clock: str
    fps: float = 30.0
    inference_latency_ms: float = 18.4
    detections: List[VisionDetection]
    model_name: str = "Azure AI Vision (YOLOv8x Football Model)"
    homography_matrix_status: str = "CALIBRATED (Pitch Keypoints: 29)"


class BroadcastOverlayPayload(BaseModel):
    """Standardized television broadcast lower-third graphic payload."""

    overlay_id: str
    match_clock: str
    overlay_type: Literal[
        "line_breaking_pass",
        "high_press_turnover",
        "chaos_surge",
        "goal_threat",
        "sprint_alert",
    ]
    headline: str
    subtext: str
    highlight_player_ids: List[str]
    vector_coords: Dict[str, float]
    metrics_badge: Dict[str, str]
    verification: VerificationReceipt
    personas: PersonaOutputs

    # Additive fields for client receipts drawer & verification evidence
    draft_narrative: Optional[str] = None
    verified_narrative: Optional[str] = None
    model_mode: Optional[str] = None
    pipeline_latency_ms: Optional[float] = None


class MatchTickPayload(BaseModel):
    """1Hz full telemetry and metrics tick payload emitted to subscribers."""

    match_clock: str
    timestamp_sec: float
    current_event: RawMatchEvent
    metrics: ComputedMetrics
    active_overlay: Optional[BroadcastOverlayPayload] = None


class FramePayload(BaseModel):
    """High-frequency 10Hz pitch rendering frame containing 22 players and ball."""

    match_clock: str
    timestamp_sec: float
    players: List[PlayerPosition]
    ball: BallPosition
    is_cut: bool = False


class ControlRequest(BaseModel):
    """Broadcast deck playback and simulation control."""

    action: Literal["play", "pause", "reset", "speed"]
    speed: Optional[Literal[1, 2, 4]] = None


class CustomEventIngestRequest(BaseModel):
    """Custom synthetic telemetry event payload for live 5-stage pipeline ingestion."""

    match_clock: Optional[str] = Field(default=None, description="Optional match clock override e.g. '71:40'")
    event_type: Literal[
        "pass", "shot", "tackle", "interception", "pressure", "carry", "turnover", "goal"
    ] = "pass"
    team: Literal["NLR", "MSB"] = "NLR"
    actor_id: str = "NLR-8"
    target_id: Optional[str] = "NLR-7"
    start_x: float = Field(default=54.0, ge=0.0, le=105.0)
    start_y: float = Field(default=32.0, ge=0.0, le=68.0)
    end_x: float = Field(default=84.0, ge=0.0, le=105.0)
    end_y: float = Field(default=46.0, ge=0.0, le=68.0)
    ball_speed_kmh: float = Field(default=68.0, ge=0.0, le=140.0)
    nearest_defender_dist_m: float = Field(default=0.8, ge=0.0, le=40.0)
    defenders_bypassed: int = Field(default=3, ge=0, le=11)
    forced_draft: Optional[str] = Field(
        default=None,
        description="Optional unverified LLM narrative draft to test the Studio Verifier hallucination guardrail.",
    )


class StudioAskRequest(BaseModel):
    """Interactive studio pundit tactical question payload."""

    question: str = Field(..., min_length=2, max_length=320)
    persona: Literal["analyst", "casual", "player_focus"] = "analyst"
    lang: Literal["en", "es", "ar", "ko", "fr", "pt", "de"] = "en"
    player_id: Optional[str] = "NLR-8"
    club: Literal["ALL", "NLR", "MSB"] = "ALL"


class ScoreState(BaseModel):
    """Scoreboard state."""

    nlr_score: int = 1
    msb_score: int = 0
    match_clock: str = "64:12"
    status: Literal["live", "paused", "halftime", "fulltime"] = "live"


class RecapBullet(BaseModel):
    """A single tactical narrative event in the 30-second catch-up recap."""

    minute: str
    headline: str
    text: str
    event_id: int
    tag: str
    scenario_id: Optional[str] = None


class RecapResponse(BaseModel):
    """Catch-up 30s recap response tailored to persona, language, and club."""

    match_clock: str
    score: str
    headline: str
    bullets: List[RecapBullet]
    persona: str
    lang: str
    club: str


class HealthResponse(BaseModel):
    """Engine health, model status, and verified telemetry audit stats."""

    status: str
    model_mode: str
    hosting_label: str
    running_on_aca: bool
    avg_pipeline_latency_ms: float
    last_pipeline_latency_ms: float
    grounded_pct: float
    uptime_s: float
