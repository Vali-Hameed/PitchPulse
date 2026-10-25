"""Tests for 5 pre-configured tactical scenarios."""

import pytest
from app.data.scenarios import (
    build_scenario_1,
    build_scenario_2,
    build_scenario_3,
    build_scenario_4,
    build_scenario_5,
)
from app.engine.metrics import MetricsEngine
from app.engine.moment_detector import evaluate_moment


def test_scenario_1_half_space_line_breaker():
    s1 = build_scenario_1()
    assert s1.match_clock == "18:42"
    ev = s1.steps[0].event
    metrics = MetricsEngine().compute(ev)

    assert metrics.xt_delta == 0.34
    assert 85.0 <= metrics.pressure_index <= 86.5
    assert ev.defenders_bypassed == 3
    assert ev.ball_speed_kmh == 74.0

    is_key, reason, _ = evaluate_moment(ev, metrics)
    assert is_key is True
    assert reason == "line_breaking_pass"


def test_scenario_2_high_press_counter():
    s2 = build_scenario_2()
    assert s2.match_clock == "34:15"
    ev = s2.steps[0].event
    metrics = MetricsEngine().compute(ev)

    saka = next(p for p in ev.players_snapshot if p.player_id == "NLR-7")
    assert saka.speed_kmh == 33.4
    assert metrics.sprint_burst_triggered is True

    is_key, reason, _ = evaluate_moment(ev, metrics)
    assert is_key is True
    assert reason in ("high_press_turnover", "sprint_alert")


def test_scenario_3_chaos_surge():
    s3 = build_scenario_3()
    assert s3.match_clock == "58:05"
    assert len(s3.steps) == 4
    final_step = s3.steps[-1]
    assert final_step.force_chaos == 88.0


def test_scenario_4_clinical_goal():
    s4 = build_scenario_4()
    assert s4.match_clock == "73:50"
    ev = s4.steps[0].event
    assert s4.steps[0].score_delta_nlr == 1
    metrics = MetricsEngine().compute(ev)

    assert metrics.xt_delta == 0.52
    assert ev.ball_speed_kmh == 106.0
    assert ev.event_type == "goal"

    is_key, reason, _ = evaluate_moment(ev, metrics)
    assert is_key is True
    assert reason == "goal_threat"


def test_scenario_5_hallucination_stress():
    s5 = build_scenario_5()
    assert s5.match_clock == "84:10"
    ev = s5.steps[0].event
    assert ev.defenders_bypassed == 2
    assert s5.steps[0].forced_draft is not None
    assert "4 defenders" in s5.steps[0].forced_draft


def test_orchestrator_badges_and_cultural_idioms():
    import asyncio
    from app.agents.orchestrator import AgentOrchestrator

    async def _run():
        orch = AgentOrchestrator()
        s1 = build_scenario_1()
        ev1 = s1.steps[0].event
        m1 = MetricsEngine().compute(ev1)
        ovl1 = await orch.run(ev1, m1, "line_breaking_pass")

        assert "Difficulty" in ovl1.metrics_badge
        assert "Dist" in ovl1.metrics_badge
        assert set(ovl1.personas.translations.keys()) == {"en", "es", "ar", "ko", "fr", "pt", "de"}

        s4 = build_scenario_4()
        ev4 = s4.steps[0].event
        m4 = MetricsEngine().compute(ev4)
        ovl4 = await orch.run(ev4, m4, "goal_threat")

        # Goal threat must have a distinct narrative from line-breaking pass
        assert ovl4.personas.translations["en"]["headline"] != ovl1.personas.translations["en"]["headline"]
        assert "106" in ovl4.personas.translations["de"]["headline"]

    asyncio.run(_run())
