from __future__ import annotations

from typing import Any, Dict, List


def _numeric_metric(analysis: Dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        value = analysis.get(key)
        if isinstance(value, (int, float)):
            return float(value)
    return None


def score_risk(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Return a weighted injury risk score and issue flags from aggregated pose metrics."""
    if not analysis:
        return {'risk_score': 0, 'injury_risk': 'low', 'issues': []}

    avg_torso_lean = _numeric_metric(analysis, 'average_torso_lean', 'torso_lean')
    avg_balance = _numeric_metric(analysis, 'average_balance_score', 'balance_score')
    avg_shoulder_delta = _numeric_metric(analysis, 'average_shoulder_alignment_delta', 'shoulder_alignment_delta')
    knee_asymmetry = _numeric_metric(analysis, 'knee_asymmetry')
    hip_asymmetry = _numeric_metric(analysis, 'hip_asymmetry')
    posture_stability = _numeric_metric(analysis, 'posture_stability')

    issues: List[str] = []
    score = 0.0

    if avg_torso_lean is not None and avg_torso_lean > 25:
        issues.append('excessive_torso_lean')
        score += 22.0
    if avg_balance is not None and avg_balance < 60:
        issues.append('posture_instability')
        score += 18.0
    if knee_asymmetry is not None and knee_asymmetry > 10:
        issues.append('knee_valgus')
        score += 20.0
    if hip_asymmetry is not None and hip_asymmetry > 10:
        issues.append('hip_drop')
        score += 16.0
    if avg_shoulder_delta is not None and avg_shoulder_delta > 0.05:
        issues.append('shoulder_imbalance')
        score += 12.0
    if posture_stability is not None and posture_stability < 50:
        issues.append('poor_squat_depth')
        score += 12.0

    score = min(100.0, round(score, 2))
    if score >= 70:
        injury_risk = 'high'
    elif score >= 35:
        injury_risk = 'medium'
    else:
        injury_risk = 'low'

    return {
        'risk_score': score,
        'injury_risk': injury_risk,
        'issues': issues,
    }
