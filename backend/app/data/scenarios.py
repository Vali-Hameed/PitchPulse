"""Five deterministic multi-step tactical demo scenarios.

Complies strictly with the hackathon specification and approved revisions:
- Scenario 1: Half-Space Line Breaker (Min 18:42, ΔxT: +0.34, 0.34m proximity / 86% pressure, 74 km/h, 3 bypassed)
- Scenario 2: High-Press Trap & Rapid Counter (Min 34:15, Rice interception at x=76m, Saka sprint burst 33.4 km/h)
- Scenario 3: Game Rhythm Shift: Control to Chaos (Min 58:05, Chaos Index spikes 24 -> 88)
- Scenario 4: Decoy Run & Clinical Goal (Min 73:50, Havertz decoy, Vance 106 km/h finish, ΔxT: +0.52, Goal NLR)
- Scenario 5: Hallucination Guardrail Stress-Test (Min 84:10, forced 4 bypassed vs truth 2, auto-correction triggered)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.data.rosters import get_all_initial_players
from app.models.schemas import PlayerPosition, RawMatchEvent


class ScenarioStep:
    def __init__(
        self,
        event: RawMatchEvent,
        score_delta_nlr: int = 0,
        score_delta_msb: int = 0,
        forced_draft: Optional[str] = None,
        force_chaos: Optional[float] = None,
    ) -> None:
        self.event = event
        self.score_delta_nlr = score_delta_nlr
        self.score_delta_msb = score_delta_msb
        self.forced_draft = forced_draft
        self.force_chaos = force_chaos


class ScenarioDefinition:
    def __init__(
        self,
        scenario_id: str,
        name: str,
        match_clock: str,
        steps: List[ScenarioStep],
        description: str,
    ) -> None:
        self.scenario_id = scenario_id
        self.name = name
        self.match_clock = match_clock
        self.steps = steps
        self.description = description


def _clone_snapshot_with_updates(
    updates: Dict[str, Dict[str, Any]]
) -> List[PlayerPosition]:
    """Return a fresh 22-player snapshot applying position/speed overrides."""
    players = get_all_initial_players()
    result: List[PlayerPosition] = []

    for p in players:
        if p.player_id in updates:
            upd = updates[p.player_id]
            result.append(
                PlayerPosition(
                    player_id=p.player_id,
                    name=p.name,
                    shirt_number=p.shirt_number,
                    team=p.team,
                    x=upd.get("x", p.x),
                    y=upd.get("y", p.y),
                    speed_kmh=upd.get("speed_kmh", p.speed_kmh),
                    stamina_pct=upd.get("stamina_pct", p.stamina_pct),
                )
            )
        else:
            result.append(p)
    return result


def build_scenario_1() -> ScenarioDefinition:
    """Scenario 1: Half-Space Line Breaker (Min 18:42).

    NLR #8 Marcus Vance receives under 0.34m defender proximity (Pressure: 86%),
    threads a 28m pass at 74 km/h bypassing 3 MSB midfielders into the right half-space
    (ΔxT: +0.34).
    """
    snapshot = _clone_snapshot_with_updates(
        {
            "NLR-8": {"x": 64.0, "y": 35.0, "speed_kmh": 14.2, "stamina_pct": 89.0},
            "MSB-8": {"x": 64.3, "y": 35.15, "speed_kmh": 12.0},  # 0.34m defender proximity
            "MSB-16": {"x": 72.0, "y": 38.0, "speed_kmh": 11.5},
            "MSB-27": {"x": 76.0, "y": 42.0, "speed_kmh": 13.0},
            "NLR-7": {"x": 90.0, "y": 45.0, "speed_kmh": 22.4, "stamina_pct": 91.0},
        }
    )

    event = RawMatchEvent(
        event_id=101,
        match_clock="18:42",
        timestamp_sec=1122.0,
        event_type="pass",
        team="NLR",
        actor_id="NLR-8",
        actor_name="M. Vance-Sim",
        actor_number=8,
        target_id="NLR-7",
        target_name="B. Saka-Sim",
        target_number=7,
        start_x=64.0,
        start_y=35.0,  # col 7, row 4 -> xT = 0.090
        end_x=90.0,
        end_y=45.0,  # col 10, row 5 -> xT = 0.430 (ΔxT = +0.340)
        ball_speed_kmh=74.0,
        nearest_defender_dist_m=0.34,  # Formula yields 85.8% (~86% pressure)
        defenders_bypassed=3,
        players_snapshot=snapshot,
    )

    return ScenarioDefinition(
        scenario_id="scenario_1",
        name="Half-Space Line Breaker",
        match_clock="18:42",
        steps=[ScenarioStep(event=event)],
        description="Vance receives under 0.34m proximity (86% pressure) and threads 28m pass bypassing 3 defenders (+0.34 xT).",
    )


def build_scenario_2() -> ScenarioDefinition:
    """Scenario 2: High-Press Trap & Rapid Counter (Min 34:15).

    NLR triggers high press; #20 D. Rice-Sim intercepts at x=76m, finding #7 B. Saka-Sim
    hitting a 33.4 km/h sprint burst (Sprint Alert Triggered) for a cutback.
    """
    snapshot = _clone_snapshot_with_updates(
        {
            "NLR-20": {"x": 76.0, "y": 28.0, "speed_kmh": 18.5, "stamina_pct": 84.0},
            "NLR-7": {"x": 88.0, "y": 54.0, "speed_kmh": 33.4, "stamina_pct": 82.0},  # ⚡ 33.4 km/h sprint burst!
            "MSB-19": {"x": 84.0, "y": 50.0, "speed_kmh": 26.8},
            "NLR-8": {"x": 78.0, "y": 38.0, "speed_kmh": 16.0, "stamina_pct": 83.5},
        }
    )

    event = RawMatchEvent(
        event_id=201,
        match_clock="34:15",
        timestamp_sec=2055.0,
        event_type="interception",
        team="NLR",
        actor_id="NLR-20",
        actor_name="D. Rice-Sim",
        actor_number=20,
        target_id="NLR-7",
        target_name="B. Saka-Sim",
        target_number=7,
        start_x=76.0,
        start_y=28.0,
        end_x=88.0,
        end_y=54.0,
        ball_speed_kmh=62.0,
        nearest_defender_dist_m=1.8,
        defenders_bypassed=1,
        players_snapshot=snapshot,
    )

    return ScenarioDefinition(
        scenario_id="scenario_2",
        name="High-Press Trap & Counter",
        match_clock="34:15",
        steps=[ScenarioStep(event=event)],
        description="Rice intercepts at x=76m, triggering a rapid counter with Saka sprinting at 33.4 km/h.",
    )


def build_scenario_3() -> ScenarioDefinition:
    """Scenario 3: Game Rhythm Shift: Control to Chaos (Min 58:05).

    4 consecutive turnovers in 35 seconds spike the Control vs. Chaos Index from 24 to 88,
    triggering a tactical chaos surge overlay.
    """
    snapshot = _clone_snapshot_with_updates(
        {
            "NLR-8": {"x": 54.0, "y": 30.0, "speed_kmh": 21.0, "stamina_pct": 74.0},
            "MSB-8": {"x": 56.0, "y": 32.0, "speed_kmh": 22.5},
        }
    )

    steps: List[ScenarioStep] = []

    # Rapid turnover chain
    sub_events = [
        ("57:35", 3455.0, "turnover", "NLR", "NLR-5", "T. Partey-Sim", 5, "MSB-8", "A. Onana-Sim", 8, 48.0, 32.0, 52.0, 36.0, 42.0),
        ("57:48", 3468.0, "tackle", "MSB", "MSB-8", "A. Onana-Sim", 8, "NLR-20", "D. Rice-Sim", 20, 52.0, 36.0, 50.0, 30.0, 58.0),
        ("57:58", 3478.0, "interception", "NLR", "NLR-20", "D. Rice-Sim", 20, "MSB-27", "I. Gueye-Sim", 27, 50.0, 30.0, 55.0, 40.0, 68.0),
        ("58:05", 3485.0, "turnover", "MSB", "MSB-27", "I. Gueye-Sim", 27, "NLR-8", "M. Vance-Sim", 8, 55.0, 40.0, 58.0, 25.0, 72.0),
    ]

    for i, (clk, sec, etype, team, a_id, a_name, a_num, t_id, t_name, t_num, sx, sy, ex, ey, bspd) in enumerate(sub_events):
        ev = RawMatchEvent(
            event_id=301 + i,
            match_clock=clk,
            timestamp_sec=sec,
            event_type=etype,  # type: ignore
            team=team,  # type: ignore
            actor_id=a_id,
            actor_name=a_name,
            actor_number=a_num,
            target_id=t_id,
            target_name=t_name,
            target_number=t_num,
            start_x=sx,
            start_y=sy,
            end_x=ex,
            end_y=ey,
            ball_speed_kmh=bspd,
            nearest_defender_dist_m=0.8,
            defenders_bypassed=1,
            players_snapshot=snapshot,
        )
        # Final step forces chaos to 88.0
        force = 88.0 if i == len(sub_events) - 1 else (24.0 + (i * 18.0))
        steps.append(ScenarioStep(event=ev, force_chaos=force))

    return ScenarioDefinition(
        scenario_id="scenario_3",
        name="Control to Chaos Rhythm Shift",
        match_clock="58:05",
        steps=steps,
        description="4 turnovers in 35 seconds spike Control vs. Chaos Index from 24 to 88.",
    )


def build_scenario_4() -> ScenarioDefinition:
    """Scenario 4: Decoy Run & Clinical Goal (Min 73:50).

    #9 K. Havertz-Sim drags two defenders away with a decoy run, allowing #8 Marcus Vance
    to arrive unmarked and strike a 106 km/h shot into the bottom corner (ΔxT: +0.52, Goal NLR).
    NLR score increases by 1.
    """
    snapshot = _clone_snapshot_with_updates(
        {
            "NLR-9": {"x": 94.0, "y": 20.0, "speed_kmh": 27.5, "stamina_pct": 68.0},  # Decoy run pulling CBs wide
            "MSB-6": {"x": 92.0, "y": 22.0, "speed_kmh": 24.0},  # Dragged CB
            "MSB-32": {"x": 93.0, "y": 25.0, "speed_kmh": 23.5},  # Dragged CB
            "NLR-8": {"x": 76.0, "y": 34.0, "speed_kmh": 24.8, "stamina_pct": 71.0},  # Vance arrives central
            "MSB-1": {"x": 102.5, "y": 34.0, "speed_kmh": 6.0},  # GK
        }
    )

    event = RawMatchEvent(
        event_id=401,
        match_clock="73:50",
        timestamp_sec=4430.0,
        event_type="goal",
        team="NLR",
        actor_id="NLR-8",
        actor_name="M. Vance-Sim",
        actor_number=8,
        target_id=None,
        target_name=None,
        target_number=None,
        start_x=76.0,
        start_y=34.0,  # col 8, row 4 -> xT = 0.130
        end_x=104.0,
        end_y=31.0,  # col 11, row 3 -> xT = 0.650 (ΔxT = +0.520)
        ball_speed_kmh=106.0,  # 106 km/h clinical rocket!
        nearest_defender_dist_m=3.8,  # Unmarked due to decoy run
        defenders_bypassed=2,
        players_snapshot=snapshot,
    )

    return ScenarioDefinition(
        scenario_id="scenario_4",
        name="Decoy Run & Clinical Goal",
        match_clock="73:50",
        steps=[ScenarioStep(event=event, score_delta_nlr=1)],
        description="Havertz decoy pulls defenders; Vance strikes 106 km/h shot (+0.52 xT) for NLR goal.",
    )


def build_scenario_5() -> ScenarioDefinition:
    """Scenario 5: Hallucination Guardrail Stress-Test (Min 84:10).

    Feeds an unverified draft claiming '4 defenders bypassed'. The Verifier Agent detects
    the discrepancy against ground truth (2 defenders), auto-corrects the copy, and flags
    correction_applied: True in the receipts drawer.
    """
    snapshot = _clone_snapshot_with_updates(
        {
            "NLR-8": {"x": 68.0, "y": 32.0, "speed_kmh": 17.5, "stamina_pct": 65.0},
            "MSB-8": {"x": 72.0, "y": 30.0, "speed_kmh": 15.0},
            "MSB-16": {"x": 73.0, "y": 35.0, "speed_kmh": 14.5},
            "NLR-11": {"x": 92.0, "y": 18.0, "speed_kmh": 21.0, "stamina_pct": 68.0},
        }
    )

    event = RawMatchEvent(
        event_id=501,
        match_clock="84:10",
        timestamp_sec=5050.0,
        event_type="pass",
        team="NLR",
        actor_id="NLR-8",
        actor_name="M. Vance-Sim",
        actor_number=8,
        target_id="NLR-11",
        target_name="G. Martinelli-Sim",
        target_number=11,
        start_x=68.0,
        start_y=32.0,
        end_x=92.0,
        end_y=18.0,
        ball_speed_kmh=78.0,
        nearest_defender_dist_m=1.2,
        defenders_bypassed=2,  # Ground truth is 2 defenders bypassed
        players_snapshot=snapshot,
    )

    # Intentionally hallucinated draft claiming 4 defenders bypassed
    forced_draft = (
        "Vance threads a penetrating 28m pass bypassing 4 defenders to advance into dangerous space."
    )

    return ScenarioDefinition(
        scenario_id="scenario_5",
        name="Hallucination Guardrail Stress-Test",
        match_clock="84:10",
        steps=[ScenarioStep(event=event, forced_draft=forced_draft)],
        description="Feeds draft claiming 4 defenders bypassed against ground truth of 2; Verifier auto-corrects.",
    )


SCENARIOS: Dict[str, ScenarioDefinition] = {
    "1": build_scenario_1(),
    "scenario_1": build_scenario_1(),
    "2": build_scenario_2(),
    "scenario_2": build_scenario_2(),
    "3": build_scenario_3(),
    "scenario_3": build_scenario_3(),
    "4": build_scenario_4(),
    "scenario_4": build_scenario_4(),
    "5": build_scenario_5(),
    "scenario_5": build_scenario_5(),
}


def get_scenario(scenario_key: str) -> Optional[ScenarioDefinition]:
    return SCENARIOS.get(str(scenario_key).lower().strip())
