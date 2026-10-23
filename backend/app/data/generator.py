"""Continuous 22-player pitch simulation and synthetic event generator.

Simulates organic match flow at 10Hz physics frames and 1Hz match events,
tracking player locomotion, ball dynamics, stamina decay, and Star Player (#8 Vance) metrics.
"""

from __future__ import annotations

import math
import random
from typing import Dict, List, Literal, Optional, Tuple

from app.data.rosters import (
    MSB_ROSTER,
    NLR_ROSTER,
    get_all_initial_players,
)
from app.models.schemas import (
    BallPosition,
    FramePayload,
    PlayerPosition,
    RawMatchEvent,
)

PITCH_LENGTH = 105.0
PITCH_WIDTH = 68.0


class PitchSimulator:
    """Stateful 22-player pitch dynamics engine."""

    def __init__(self, seed: int = 42) -> None:
        self.rng = random.Random(seed)
        self.reset()

    def reset(self) -> None:
        """Reset simulation to initial kick-off state."""
        self.players: Dict[str, PlayerPosition] = {
            p.player_id: p for p in get_all_initial_players()
        }
        self.ball = BallPosition(x=52.5, y=34.0, z=0.0, speed_kmh=0.0)
        self.possession_team: Literal["NLR", "MSB"] = "NLR"
        self.current_carrier_id: str = "NLR-20"  # Rice on ball
        self.match_sec: float = 3852.0  # Min 64:12 baseline (matches spec scoreboard)
        self.event_counter: int = 1000

        # Comprehensive 22-player telemetry stats tracking
        self.player_stats: Dict[str, Dict[str, float]] = {
            pid: {
                "distance_m": 8400.0 if pid == "NLR-8" else 7200.0 + float(abs(hash(pid)) % 1500),
                "touches": 54.0 if pid == "NLR-8" else 30.0 + float(abs(hash(pid)) % 25),
                "sprints": 14.0 if pid == "NLR-8" else 8.0 + float(abs(hash(pid)) % 10),
            }
            for pid in self.players.keys()
        }
        self.vance_distance_m: float = self.player_stats["NLR-8"]["distance_m"]
        self.vance_touches: int = int(self.player_stats["NLR-8"]["touches"])
        self.vance_sprints: int = int(self.player_stats["NLR-8"]["sprints"])

    @property
    def match_clock_str(self) -> str:
        minutes = int(self.match_sec // 60)
        seconds = int(self.match_sec % 60)
        return f"{minutes:02d}:{seconds:02d}"

    def set_match_clock(self, clock_str: str) -> None:
        """Jump match clock to specified string e.g. '18:42'."""
        try:
            parts = clock_str.split(":")
            mins = int(parts[0])
            secs = int(parts[1]) if len(parts) > 1 else 0
            self.match_sec = float(mins * 60 + secs)
        except Exception:
            pass

    def step_physics_frame(self, dt: float = 0.1) -> FramePayload:
        """Advance player and ball physical positions by 100ms (10Hz)."""
        self.match_sec += dt

        carrier = self.players.get(self.current_carrier_id)
        ball_target_x = carrier.x if carrier else 52.5
        ball_target_y = carrier.y if carrier else 34.0

        # Ball moves smoothly toward current carrier / target
        dx = ball_target_x - self.ball.x
        dy = ball_target_y - self.ball.y
        dist = math.hypot(dx, dy)
        if dist > 0.3:
            step = min(dist, 14.0 * dt)
            self.ball.x += (dx / dist) * step
            self.ball.y += (dy / dist) * step
            self.ball.speed_kmh = round((step / dt) * 3.6, 1)
        else:
            self.ball.speed_kmh = 0.0

        # Update all 22 players with tactical anchor drift and pressing
        for pid, p in list(self.players.items()):
            team = p.team
            is_carrier = pid == self.current_carrier_id

            # Base anchor lookup
            roster = NLR_ROSTER if team == "NLR" else MSB_ROSTER
            meta = next((item for item in roster if item["id"] == pid), None)
            anchor = meta["anchor"] if meta else (52.5, 34.0)

            # Move towards anchor with dynamic ball shift
            shift_x = (self.ball.x - 52.5) * 0.35
            target_x = min(PITCH_LENGTH - 2.0, max(2.0, float(anchor[0]) + shift_x))
            target_y = min(PITCH_WIDTH - 2.0, max(2.0, float(anchor[1])))

            if is_carrier:
                # Carrier drives slightly forward
                drive = 1.0 if team == "NLR" else -1.0
                target_x = min(100.0, max(5.0, p.x + (drive * 3.0)))

            pdx = target_x - p.x
            pdy = target_y - p.y
            pdist = math.hypot(pdx, pdy)

            # Speed calculation
            if is_carrier:
                speed_target = 18.0 + self.rng.uniform(-2.0, 4.0)
            elif pdist > 8.0:
                speed_target = 22.0 + self.rng.uniform(-2.0, 6.0)
            else:
                speed_target = 7.0 + self.rng.uniform(-1.0, 3.0)

            # Cap speed at 38 km/h (under schemas le=40.0)
            current_speed = min(38.0, max(0.0, speed_target))

            if pdist > 0.1:
                step_m = (current_speed / 3.6) * dt
                new_x = min(PITCH_LENGTH - 1.0, max(1.0, p.x + (pdx / pdist) * step_m))
                new_y = min(PITCH_WIDTH - 1.0, max(1.0, p.y + (pdy / pdist) * step_m))
            else:
                new_x, new_y = p.x, p.y

            # Stamina slow decay
            decay = (current_speed / 40.0) * 0.003 * dt
            new_stamina = max(45.0, p.stamina_pct - decay)

            # Track locomotion metrics for all players
            moved = math.hypot(new_x - p.x, new_y - p.y)
            if pid not in self.player_stats:
                self.player_stats[pid] = {"distance_m": 7200.0, "touches": 30.0, "sprints": 8.0}
            self.player_stats[pid]["distance_m"] += moved
            if current_speed >= 25.0:
                self.player_stats[pid]["sprints"] += 1

            if pid == "NLR-8":
                self.vance_distance_m = self.player_stats["NLR-8"]["distance_m"]
                self.vance_sprints = int(self.player_stats["NLR-8"]["sprints"])

            self.players[pid] = PlayerPosition(
                player_id=p.player_id,
                name=p.name,
                shirt_number=p.shirt_number,
                team=p.team,
                x=round(new_x, 2),
                y=round(new_y, 2),
                speed_kmh=round(current_speed, 1),
                stamina_pct=round(new_stamina, 1),
            )

        return FramePayload(
            match_clock=self.match_clock_str,
            timestamp_sec=round(self.match_sec, 2),
            players=list(self.players.values()),
            ball=self.ball,
            is_cut=False,
        )

    def generate_next_event(self) -> RawMatchEvent:
        """Synthesize a discrete 1Hz match event based on pitch state."""
        self.event_counter += 1

        carrier = self.players.get(self.current_carrier_id)
        if not carrier:
            carrier = self.players["NLR-20"]
            self.current_carrier_id = "NLR-20"

        team = carrier.team
        opp_team: Literal["NLR", "MSB"] = "MSB" if team == "NLR" else "NLR"

        # Find teammates and opponents
        teammates = [p for p in self.players.values() if p.team == team and p.player_id != carrier.player_id]
        opponents = [p for p in self.players.values() if p.team == opp_team]

        # Calculate nearest defender proximity
        dists = [math.hypot(p.x - carrier.x, p.y - carrier.y) for p in opponents]
        nearest_def_dist = round(min(dists), 2) if dists else 4.0

        # Event type selection based on pitch zone
        is_attacking_third = (carrier.x >= 70.0 and team == "NLR") or (carrier.x <= 35.0 and team == "MSB")

        roll = self.rng.random()
        if is_attacking_third and roll < 0.22:
            event_type: Literal["pass", "shot", "tackle", "interception", "pressure", "carry", "turnover", "goal"] = "shot"
            target = None
            end_x = 104.5 if team == "NLR" else 0.5
            end_y = 34.0 + self.rng.uniform(-6.0, 6.0)
            ball_speed = round(self.rng.uniform(78.0, 98.0), 1)
            bypassed = self.rng.randint(1, 3)
        elif nearest_def_dist < 1.2 and roll < 0.35:
            event_type = self.rng.choice(["pressure", "tackle", "turnover"])
            target = None
            end_x = carrier.x + self.rng.uniform(-3.0, 3.0)
            end_y = carrier.y + self.rng.uniform(-3.0, 3.0)
            ball_speed = round(self.rng.uniform(25.0, 48.0), 1)
            bypassed = 0
            if event_type == "turnover":
                # Switch possession
                closest_opp = min(opponents, key=lambda p: math.hypot(p.x - carrier.x, p.y - carrier.y))
                self.possession_team = opp_team
                self.current_carrier_id = closest_opp.player_id
        else:
            event_type = "pass"
            # Choose progressive target teammate
            forward_mates = [
                m for m in teammates
                if (team == "NLR" and m.x > carrier.x - 5.0) or (team == "MSB" and m.x < carrier.x + 5.0)
            ]
            target = self.rng.choice(forward_mates) if forward_mates else self.rng.choice(teammates)
            end_x = target.x
            end_y = target.y
            ball_speed = round(self.rng.uniform(45.0, 72.0), 1)
            # Count opponents bypassed
            min_x, max_x = min(carrier.x, end_x), max(carrier.x, end_x)
            bypassed = sum(
                1 for op in opponents
                if min_x <= op.x <= max_x and abs(op.y - (carrier.y + end_y) / 2) < 10.0
            )
            # Switch carrier to receiver
            self.current_carrier_id = target.player_id

        if carrier.player_id == "NLR-8" or (target and target.player_id == "NLR-8"):
            self.vance_touches += 1

        return RawMatchEvent(
            event_id=self.event_counter,
            match_clock=self.match_clock_str,
            timestamp_sec=round(self.match_sec, 2),
            event_type=event_type,
            team=team,
            actor_id=carrier.player_id,
            actor_name=carrier.name,
            actor_number=carrier.shirt_number,
            target_id=target.player_id if target else None,
            target_name=target.name if target else None,
            target_number=target.shirt_number if target else None,
            start_x=round(carrier.x, 2),
            start_y=round(carrier.y, 2),
            end_x=round(end_x, 2),
            end_y=round(end_y, 2),
            ball_speed_kmh=ball_speed,
            nearest_defender_dist_m=nearest_def_dist,
            defenders_bypassed=bypassed,
            players_snapshot=list(self.players.values()),
        )
