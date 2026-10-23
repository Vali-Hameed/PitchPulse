"""Multi-Agent Orchestrator.

Coordinates Narrator (Agent 1) -> Verifier (Agent 2) -> Persona Router (Agent 3)
to produce standardized, frame-accurate BroadcastOverlayPayload objects.
"""

from __future__ import annotations

import time
import uuid
from typing import List, Literal, Optional
from app.agents.narrator import NarratorAgent
from app.agents.persona_router import PersonaRouter
from app.agents.verifier import VerifierAgent
from app.config import settings
from app.models.schemas import (
    BroadcastOverlayPayload,
    ComputedMetrics,
    RawMatchEvent,
)

OverlayType = Literal[
    "line_breaking_pass",
    "high_press_turnover",
    "chaos_surge",
    "goal_threat",
    "sprint_alert",
]


class AgentOrchestrator:
    """Coordinates the 3-agent Narrator-Verifier-Persona pipeline."""

    def __init__(self) -> None:
        self.narrator = NarratorAgent()
        self.verifier = VerifierAgent()
        self.persona_router = PersonaRouter()

    async def run(
        self,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: OverlayType,
        highlight_player_ids: Optional[List[str]] = None,
        forced_draft: Optional[str] = None,
    ) -> BroadcastOverlayPayload:
        """Run the full 3-stage agentic verification pipeline."""
        start_ts = time.perf_counter()

        # Step 1: Draft tactical narrative
        draft = await self.narrator.draft(
            event=event,
            metrics=metrics,
            trigger_reason=trigger_reason,
            forced_draft=forced_draft,
        )

        # Step 2: Audit and ground with Studio Verifier
        verified_narrative, receipt = self.verifier.verify(
            draft=draft,
            event=event,
            metrics=metrics,
        )

        # Step 3: Audience persona routing & multilingual translations
        personas = await self.persona_router.route(
            verified_narrative=verified_narrative,
            event=event,
            metrics=metrics,
            trigger_reason=trigger_reason,
        )

        elapsed_ms = round((time.perf_counter() - start_ts) * 1000.0, 1)

        # Format metrics badge values
        badge = {
            "ΔxT": f"+{metrics.xt_delta:.2f}" if metrics.xt_delta >= 0 else f"{metrics.xt_delta:.2f}",
            "Pressure": f"{metrics.pressure_index:.0f}%",
            "Speed": f"{event.ball_speed_kmh:.0f} km/h",
        }
        if event.defenders_bypassed > 0:
            badge["Bypassed"] = f"{event.defenders_bypassed} Def"

        highlights = highlight_player_ids or [event.actor_id]

        overlay = BroadcastOverlayPayload(
            overlay_id=f"ovl_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
            match_clock=event.match_clock,
            overlay_type=trigger_reason,
            headline=draft.headline,
            subtext=verified_narrative,
            highlight_player_ids=highlights,
            vector_coords={
                "start_x": event.start_x,
                "start_y": event.start_y,
                "end_x": event.end_x,
                "end_y": event.end_y,
            },
            metrics_badge=badge,
            verification=receipt,
            personas=personas,
            draft_narrative=draft.explanation,
            verified_narrative=verified_narrative,
            model_mode=settings.model_mode,
            pipeline_latency_ms=elapsed_ms,
        )

        return overlay
