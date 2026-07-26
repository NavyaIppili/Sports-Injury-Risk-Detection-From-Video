from __future__ import annotations

from typing import Any, Dict, List


def build_recommendations(analysis: Dict[str, Any], issues: List[str]) -> List[str]:
    """Generate dynamic recommendations based on the detected movement issues."""
    recommendations: List[str] = []

    if 'excessive_torso_lean' in issues:
        recommendations.append('Reduce forward torso lean by keeping the chest upright and shifting weight through the heels.')
    if 'posture_instability' in issues:
        recommendations.append('Strengthen core and balance work to improve squat stability and control.')
    if 'knee_valgus' in issues:
        recommendations.append('Improve knee tracking by keeping knees aligned with the toes during the squat.')
    if 'hip_drop' in issues:
        recommendations.append('Address hip asymmetry with unilateral strength and mobility drills.')
    if 'shoulder_imbalance' in issues:
        recommendations.append('Practice shoulder alignment and posture control during the movement.')
    if 'poor_squat_depth' in issues:
        recommendations.append('Use a controlled range of motion and avoid collapsing into excessive depth.')

    if not recommendations:
        return [
            'Movement pattern appears stable.',
            'Continue maintaining current technique.',
        ]

    return recommendations
