"""Tests for Studio Verifier and telemetry receipts."""

import pytest
from app.agents.narrator import NarratorDraft
from app.agents.verifier import VerifierAgent
from app.data.scenarios import build_scenario_1, build_scenario_5
from app.engine.metrics import MetricsEngine


def test_verifier_grounds_accurate_draft():
    """Verify clean MATCH receipt when draft is factually accurate."""
    s1 = build_scenario_1()
    event = s1.steps[0].event
    metrics = MetricsEngine().compute(event)

    draft = NarratorDraft(
        headline="Vance Slices Line",
        explanation=f"Under high pressure ({event.nearest_defender_dist_m}m proximity, 86% pressure), Vance threads a 28m pass at 74 km/h bypassing 3 defenders into space (+0.34 xT).",
        claims=[],
    )

    verifier = VerifierAgent()
    verified_text, receipt = verifier.verify(draft, event, metrics)

    assert receipt.verified is True
    assert receipt.correction_applied is False
    assert receipt.confidence_score == 1.0
    assert any(c.metric_name == "defenders_bypassed" and c.status == "MATCH" for c in receipt.checked_claims)


def test_verifier_corrects_hallucinated_claims():
    """Verify auto-correction in Scenario 5 (claimed 4 defenders vs ground truth 2)."""
    s5 = build_scenario_5()
    event = s5.steps[0].event
    metrics = MetricsEngine().compute(event)

    forced_draft = s5.steps[0].forced_draft
    assert forced_draft is not None

    draft = NarratorDraft(
        headline="Stress Test",
        explanation=forced_draft,
        claims=[],
    )

    verifier = VerifierAgent()
    verified_text, receipt = verifier.verify(draft, event, metrics)

    # Must detect discrepancy and correct 4 to 2
    assert receipt.correction_applied is True
    assert "bypassing 2 defenders" in verified_text
    assert "bypassing 4 defenders" not in verified_text
    assert any(
        c.metric_name == "defenders_bypassed" and c.status == "CORRECTED"
        for c in receipt.checked_claims
    )
