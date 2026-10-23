"""Agent 1: Narrator Agent.

Formulates tactical explanations of why moments matter strictly from
computed mathematical facts, producing a ~7-word headline and ~22-word causal narrative.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.agents.llm import llm_client
from app.models.schemas import ComputedMetrics, RawMatchEvent


class NarratorDraft(BaseModel):
    headline: str
    explanation: str
    claims: List[Dict[str, Any]]
    used_llm: bool = False


class NarratorAgent:
    """Agent 1: Tactical Narrative Generator."""

    def __init__(self) -> None:
        self.llm = llm_client

    def _generate_template_draft(
        self,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: Optional[str],
    ) -> NarratorDraft:
        """Deterministic template fallback guaranteeing strict broadcast format."""
        dist = math.hypot(event.end_x - event.start_x, event.end_y - event.start_y)
        rounded_dist = round(dist, 1)

        if trigger_reason == "line_breaking_pass":
            headline = f"{event.actor_name} Penetrates Midfield Block With Precision"
            explanation = (
                f"Under high pressure ({event.nearest_defender_dist_m}m proximity, {metrics.pressure_index:.0f}% pressure), "
                f"{event.actor_name} threads a {rounded_dist:.0f}m pass at {event.ball_speed_kmh:.0f} km/h "
                f"bypassing {event.defenders_bypassed} defenders into space (+{metrics.xt_delta:.2f} xT)."
            )
        elif trigger_reason == "high_press_turnover":
            headline = f"High-Press Turnover Triggered in Final Third"
            explanation = (
                f"{event.actor_name} intercepts in the attacking zone ({event.start_x:.0f}m), "
                f"releasing an immediate counter-attack transition before defensive organization resets."
            )
        elif trigger_reason == "chaos_surge":
            headline = f"Tactical Chaos Spikes as Transition Accelerates"
            explanation = (
                f"Consecutive turnovers drive the Control vs Chaos Index to {metrics.control_chaos_index:.0f}, "
                f"breaking structured positional play into frantic end-to-end transitional warfare."
            )
        elif trigger_reason == "goal_threat":
            if event.event_type == "goal":
                headline = f"Clinical Finish Seals Crucial Breakout Goal"
                explanation = (
                    f"{event.actor_name} strikes an emphatic {event.ball_speed_kmh:.0f} km/h finish into the net, "
                    f"capitalizing on offensive spacing to generate +{metrics.xt_delta:.2f} xT."
                )
            else:
                headline = f"Dangerous Strike Tests Goalkeeper Spatial Coverage"
                explanation = (
                    f"{event.actor_name} unleashes a {event.ball_speed_kmh:.0f} km/h shot towards target, "
                    f"generating +{metrics.xt_delta:.2f} Expected Threat in a high-danger central zone."
                )
        elif trigger_reason == "sprint_alert":
            sprinter = next(
                (p for p in event.players_snapshot if p.speed_kmh >= 30.0), None
            )
            name = sprinter.name if sprinter else event.actor_name
            spd = sprinter.speed_kmh if sprinter else event.ball_speed_kmh
            headline = f"High-Velocity Sprint Burst Stretches Defensive Line"
            explanation = (
                f"{name} hits an explosive top speed of {spd:.1f} km/h, "
                f"stretching vertical compactness and exploiting open transition channels."
            )
        else:
            headline = f"{event.actor_name} Advances Play in Key Zone"
            explanation = (
                f"{event.actor_name} executes a {rounded_dist:.0f}m play with {metrics.pressure_index:.0f}% pressure, "
                f"advancing tactical field tilt to {metrics.field_tilt_nlr_pct:.0f}%."
            )

        claims = [
            {"metric": "defenders_bypassed", "value": event.defenders_bypassed},
            {"metric": "xt_delta", "value": metrics.xt_delta},
            {"metric": "ball_speed_kmh", "value": event.ball_speed_kmh},
            {"metric": "pressure_index", "value": metrics.pressure_index},
            {"metric": "nearest_defender_dist_m", "value": event.nearest_defender_dist_m},
            {"metric": "actor_name", "value": event.actor_name},
        ]

        return NarratorDraft(headline=headline, explanation=explanation, claims=claims, used_llm=False)

    async def draft(
        self,
        event: RawMatchEvent,
        metrics: ComputedMetrics,
        trigger_reason: Optional[str],
        forced_draft: Optional[str] = None,
    ) -> NarratorDraft:
        """Formulate tactical explanation using Azure GPT-4o with instant local fallback."""
        if forced_draft:
            # Used for hallucination stress test (Scenario 5)
            return NarratorDraft(
                headline="Penetrating Line-Breaking Pass Advances Possession",
                explanation=forced_draft,
                claims=[
                    # Simulated hallucinated claim
                    {"metric": "defenders_bypassed", "value": 4},
                    {"metric": "actor_name", "value": event.actor_name},
                ],
                used_llm=False,
            )

        fallback = self._generate_template_draft(event, metrics, trigger_reason)

        if not self.llm.is_available:
            return fallback

        system_prompt = (
            "You are the Premier League live television tactical broadcast narrator. "
            "Write causal tactical explanations based strictly on the provided telemetry facts. "
            "Never invent names, stats, or ungrounded claims. "
            "Output valid JSON with keys: headline (max 8 words), explanation (approx 22 words)."
        )

        user_prompt = (
            f"Event Telemetry:\n"
            f"- Event Type: {event.event_type} by {event.actor_name} (#{event.actor_number}, Team: {event.team})\n"
            f"- Target: {event.target_name or 'None'}\n"
            f"- Start: ({event.start_x:.1f}m, {event.start_y:.1f}m) -> End: ({event.end_x:.1f}m, {event.end_y:.1f}m)\n"
            f"- Ball Speed: {event.ball_speed_kmh:.1f} km/h\n"
            f"- Nearest Defender Distance: {event.nearest_defender_dist_m:.2f}m\n"
            f"- Defenders Bypassed: {event.defenders_bypassed}\n"
            f"- Expected Threat Delta (ΔxT): +{metrics.xt_delta:.3f}\n"
            f"- Pressure Index: {metrics.pressure_index:.1f}%\n"
            f"- Control vs Chaos: {metrics.control_chaos_index:.1f}\n"
            f"- Trigger Reason: {trigger_reason}\n"
        )

        res = await self.llm.complete_json(system_prompt, user_prompt)
        if res and "headline" in res and "explanation" in res:
            return NarratorDraft(
                headline=str(res["headline"]).strip(),
                explanation=str(res["explanation"]).strip(),
                claims=fallback.claims,
                used_llm=True,
            )

        return fallback
