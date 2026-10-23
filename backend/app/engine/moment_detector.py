"""Evaluator for key tactical moment triggers."""

from __future__ import annotations

from typing import List, Literal, Optional, Tuple
from app.models.schemas import ComputedMetrics, RawMatchEvent

OverlayType = Literal[
    "line_breaking_pass",
    "high_press_turnover",
    "chaos_surge",
    "goal_threat",
    "sprint_alert",
]


def evaluate_moment(
    event: RawMatchEvent, metrics: ComputedMetrics
) -> Tuple[bool, Optional[OverlayType], List[str]]:
    """Evaluate event and metrics against deterministic broadcast trigger thresholds.

    Priority order:
    1. goal_threat (shot or goal)
    2. line_breaking_pass (ΔxT >= 0.18 AND defenders_bypassed >= 2)
    3. high_press_turnover (interception/tackle/turnover AND start_x >= 68.0)
    4. chaos_surge (control_chaos_index >= 75.0)
    5. sprint_alert (any player speed >= 30.0 km/h)

    Returns (is_key_moment, trigger_reason, highlight_player_ids).
    """
    highlights: List[str] = [event.actor_id]
    if event.target_id:
        highlights.append(event.target_id)

    # 1. Goal threat
    if event.event_type in ("shot", "goal"):
        return True, "goal_threat", highlights

    # 2. Line-breaking pass
    if (
        event.event_type in ("pass", "carry")
        and metrics.xt_delta >= 0.18
        and event.defenders_bypassed >= 2
    ):
        return True, "line_breaking_pass", highlights

    # 3. High-press turnover (in final third, x >= 68.0m)
    if event.event_type in ("interception", "tackle", "turnover") and event.start_x >= 68.0:
        return True, "high_press_turnover", highlights

    # 4. Chaos surge
    if metrics.control_chaos_index >= 75.0:
        return True, "chaos_surge", highlights

    # 5. Sprint alert
    sprinting_players = [
        p.player_id for p in event.players_snapshot if p.speed_kmh >= 30.0
    ]
    if sprinting_players:
        return True, "sprint_alert", sprinting_players

    return False, None, []
