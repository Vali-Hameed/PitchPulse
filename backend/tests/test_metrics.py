"""Tests for deterministic spatial mathematics and physics engine."""

import math
import pytest
from app.engine.metrics import (
    XT_GRID,
    compute_pass_difficulty,
    compute_pressure_index,
    compute_xt_delta,
    lookup_xt,
)


def test_xt_grid_properties():
    """Verify XT_GRID dimensions and bounds."""
    assert XT_GRID.shape == (8, 12)
    # Corner threat is low (0.005)
    assert XT_GRID[0, 0] == 0.005
    # Central six-yard zone threat is maximum (0.650)
    assert XT_GRID[3, 11] == 0.650
    assert XT_GRID[4, 11] == 0.650


def test_xt_team_mirroring():
    """Verify coordinate mirroring between NLR (attacking right) and MSB (attacking left)."""
    # NLR near MSB goal (x=102, y=34) has high xT
    nlr_threat = lookup_xt(102.0, 34.0, team="NLR")
    assert nlr_threat == 0.650

    # MSB near NLR goal (x=3.0, y=34) has mirrored high xT
    msb_threat = lookup_xt(3.0, 34.0, team="MSB")
    assert msb_threat == 0.650


def test_pressure_index_formula():
    """Verify 100 * exp(-0.45 * distance) with Option A calibration."""
    # 0.34m proximity yields ~85.8% (~86.0%)
    p_close = compute_pressure_index(0.34)
    assert 85.0 <= p_close <= 86.5

    # 0m proximity is 100%
    assert compute_pressure_index(0.0) == 100.0

    # Far proximity (5m) is very low
    p_far = compute_pressure_index(5.0)
    assert p_far < 12.0


def test_pass_difficulty_score():
    """Verify pass difficulty bounds and components."""
    dist, pressure, score = compute_pass_difficulty(
        start_x=64.0,
        start_y=35.0,
        end_x=90.0,
        end_y=45.0,
        nearest_defender_dist_m=0.34,
        defenders_bypassed=3,
        ball_speed_kmh=74.0,
    )
    assert 25.0 <= dist <= 30.0
    assert 85.0 <= pressure <= 86.5
    assert 50.0 <= score <= 99.0
