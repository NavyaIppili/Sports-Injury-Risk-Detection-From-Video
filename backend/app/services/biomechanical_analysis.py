from __future__ import annotations

from math import acos, sqrt
from statistics import mean, pstdev
from typing import Any, Dict, List, Optional, Sequence


def _distance(a: Sequence[float], b: Sequence[float]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def _angle_between(a: Sequence[float], b: Sequence[float], c: Sequence[float]) -> Optional[float]:
    ab = [a[0] - b[0], a[1] - b[1]]
    cb = [c[0] - b[0], c[1] - b[1]]
    dot = ab[0] * cb[0] + ab[1] * cb[1]
    mag_ab = _distance(a, b)
    mag_cb = _distance(c, b)
    if mag_ab == 0 or mag_cb == 0:
        return None
    cos_value = max(-1.0, min(1.0, dot / (mag_ab * mag_cb)))
    return acos(cos_value) * 180.0 / 3.141592653589793


def _find_landmark(landmarks: Sequence[Dict[str, Any]], name: str) -> Optional[List[float]]:
    for item in landmarks:
        if item.get('name') == name:
            return [item.get('x', 0.0), item.get('y', 0.0), item.get('z', 0.0)]
    return None


def _safe_average(values: Sequence[float]) -> Optional[float]:
    if not values:
        return None
    return round(mean(values), 2)


def _safe_std(values: Sequence[float]) -> Optional[float]:
    if len(values) < 2:
        return 0.0
    return round(pstdev(values), 2)


def _summarize_series(values: Sequence[float]) -> Dict[str, Optional[float]]:
    if not values:
        return {'average': None, 'minimum': None, 'maximum': None, 'std_dev': None}
    return {
        'average': _safe_average(values),
        'minimum': round(min(values), 2),
        'maximum': round(max(values), 2),
        'std_dev': _safe_std(values),
    }


def _compute_side_metrics(frame_landmarks: Sequence[Dict[str, Any]]) -> Dict[str, Optional[float]]:
    left_hip = _find_landmark(frame_landmarks, 'LEFT_HIP')
    left_knee = _find_landmark(frame_landmarks, 'LEFT_KNEE')
    left_ankle = _find_landmark(frame_landmarks, 'LEFT_ANKLE')
    right_hip = _find_landmark(frame_landmarks, 'RIGHT_HIP')
    right_knee = _find_landmark(frame_landmarks, 'RIGHT_KNEE')
    right_ankle = _find_landmark(frame_landmarks, 'RIGHT_ANKLE')
    left_shoulder = _find_landmark(frame_landmarks, 'LEFT_SHOULDER')
    right_shoulder = _find_landmark(frame_landmarks, 'RIGHT_SHOULDER')

    metrics: Dict[str, Optional[float]] = {}

    if left_hip and left_knee and left_ankle:
        metrics['left_knee_angle'] = _angle_between(left_hip, left_knee, left_ankle)
    if right_hip and right_knee and right_ankle:
        metrics['right_knee_angle'] = _angle_between(right_hip, right_knee, right_ankle)
    if left_shoulder and left_hip and left_knee:
        metrics['left_hip_angle'] = _angle_between(left_shoulder, left_hip, left_knee)
    if right_shoulder and right_hip and right_knee:
        metrics['right_hip_angle'] = _angle_between(right_shoulder, right_hip, right_knee)

    if left_shoulder and right_shoulder:
        diff = abs(left_shoulder[1] - right_shoulder[1])
        metrics['shoulder_alignment_delta'] = diff
    if left_shoulder and right_shoulder and left_hip and right_hip:
        top_mid = [(left_shoulder[0] + right_shoulder[0]) / 2.0, (left_shoulder[1] + right_shoulder[1]) / 2.0]
        bottom_mid = [(left_hip[0] + right_hip[0]) / 2.0, (left_hip[1] + right_hip[1]) / 2.0]
        metrics['torso_lean'] = _angle_between([top_mid[0], top_mid[1], 0.0], [bottom_mid[0], bottom_mid[1], 0.0], [bottom_mid[0] + 0.1, bottom_mid[1], 0.0])
    if left_ankle and right_ankle and left_shoulder and right_shoulder:
        foot_span = abs(left_ankle[0] - right_ankle[0])
        shoulder_span = abs(left_shoulder[0] - right_shoulder[0])
        metrics['balance_score'] = max(0.0, min(100.0, 100.0 - abs(foot_span - shoulder_span) * 100.0))
    if left_ankle and right_ankle:
        metrics['stride_length'] = _distance(left_ankle, right_ankle)
    return metrics


def build_analysis_summary(pose_data: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregate biomechanical metrics across sampled pose frames."""
    if not pose_data:
        return {}

    metrics_by_frame: List[Dict[str, Optional[float]]] = []
    for frame in pose_data:
        landmarks = frame.get('landmarks', []) or []
        if isinstance(landmarks, list):
            metrics_by_frame.append(_compute_side_metrics(landmarks))

    if not metrics_by_frame:
        return {}

    left_knee_values = [m.get('left_knee_angle') for m in metrics_by_frame if isinstance(m.get('left_knee_angle'), (int, float))]
    right_knee_values = [m.get('right_knee_angle') for m in metrics_by_frame if isinstance(m.get('right_knee_angle'), (int, float))]
    left_hip_values = [m.get('left_hip_angle') for m in metrics_by_frame if isinstance(m.get('left_hip_angle'), (int, float))]
    right_hip_values = [m.get('right_hip_angle') for m in metrics_by_frame if isinstance(m.get('right_hip_angle'), (int, float))]
    torso_lean_values = [m.get('torso_lean') for m in metrics_by_frame if isinstance(m.get('torso_lean'), (int, float))]
    balance_values = [m.get('balance_score') for m in metrics_by_frame if isinstance(m.get('balance_score'), (int, float))]
    shoulder_delta_values = [m.get('shoulder_alignment_delta') for m in metrics_by_frame if isinstance(m.get('shoulder_alignment_delta'), (int, float))]
    stride_values = [m.get('stride_length') for m in metrics_by_frame if isinstance(m.get('stride_length'), (int, float))]

    analysis: Dict[str, Any] = {
        'frames_analyzed': len(metrics_by_frame),
        'average_left_knee_angle': _safe_average(left_knee_values),
        'average_right_knee_angle': _safe_average(right_knee_values),
        'average_left_hip_angle': _safe_average(left_hip_values),
        'average_right_hip_angle': _safe_average(right_hip_values),
        'average_torso_lean': _safe_average(torso_lean_values),
        'average_balance_score': _safe_average(balance_values),
        'average_shoulder_alignment_delta': _safe_average(shoulder_delta_values),
        'average_stride_length': _safe_average(stride_values),
        'left_knee_angle': _summarize_series(left_knee_values),
        'right_knee_angle': _summarize_series(right_knee_values),
        'left_hip_angle': _summarize_series(left_hip_values),
        'right_hip_angle': _summarize_series(right_hip_values),
        'torso_lean': _summarize_series(torso_lean_values),
        'balance_score': _summarize_series(balance_values),
        'shoulder_alignment': _summarize_series(shoulder_delta_values),
        'stride_length': _summarize_series(stride_values),
        'knee_asymmetry': round(abs((_safe_average(left_knee_values) or 0.0) - (_safe_average(right_knee_values) or 0.0)), 2),
        'hip_asymmetry': round(abs((_safe_average(left_hip_values) or 0.0) - (_safe_average(right_hip_values) or 0.0)), 2),
        'posture_stability': round(max(0.0, 100.0 - (abs(_safe_average(torso_lean_values) or 0.0) * 1.5 + abs(_safe_average(shoulder_delta_values) or 0.0) * 40.0)), 2),
    }

    return analysis
