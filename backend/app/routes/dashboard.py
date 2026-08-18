from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.crud.analysis_history import get_analysis_history_by_user
from app.crud.user import get_user_by_id
from app.database.database import get_db
from app.models.analysis_history import AnalysisHistory
from app.models.user import User

router = APIRouter(prefix='/api/v1/dashboard', tags=['dashboard'])

ROLE_LABELS = {
    'athlete': 'Athlete',
    'admin': 'Admin',
    'coach': 'Coach',
    'physiotherapist': 'Physiotherapist',
    'sports-scientist': 'Sports Scientist',
}

STAFF_ROLES = {'admin', 'coach', 'physiotherapist', 'sports-scientist'}


def _normalize_role(role: str | None) -> str:
    return (role or '').strip().lower()


def _normalize_level(value: str | None) -> str:
    normalized = (value or '').strip().lower()
    if normalized in {'high', 'medium', 'low'}:
        return normalized
    return 'unknown'


def _analysis_timestamp(entry: AnalysisHistory) -> Any:
    return entry.analysis_time or entry.created_at


def _serialize_history_entry(entry: AnalysisHistory, athlete_name: str | None = None) -> dict[str, Any]:
    timestamp = _analysis_timestamp(entry)

    return {
        'history_id': entry.history_id,
        'user_id': entry.user_id,
        'athlete_name': athlete_name,
        'video_id': entry.video_id,
        'video_name': entry.video_name,
        'risk_score': entry.risk_score,
        'risk_level': _normalize_level(entry.risk_level),
        'balance_score': entry.balance_score,
        'stability_score': entry.stability_score,
        'pose_quality_score': entry.pose_quality_score,
        'total_issues': entry.total_issues or entry.total_issues_detected or 0,
        'processing_status': entry.processing_status or 'Completed',
        'analysis_time': timestamp.isoformat() if timestamp else None,
        'created_at': entry.created_at.isoformat() if entry.created_at else None,
    }


def _empty_summary(current_user: User, scope: str) -> dict[str, Any]:
    return {
        'current_user': {
            'user_id': current_user.user_id,
            'full_name': current_user.full_name,
            'role': current_user.role,
            'role_label': ROLE_LABELS.get(_normalize_role(current_user.role), current_user.role.title()),
        },
        'scope': scope,
        'metrics': {
            'analysis_count': 0,
            'athlete_count': 0,
            'average_risk_score': None,
            'latest_risk_score': None,
            'latest_risk_level': None,
            'high_risk_count': 0,
            'medium_risk_count': 0,
            'low_risk_count': 0,
            'average_balance_score': None,
            'average_stability_score': None,
            'average_pose_quality_score': None,
            'total_issues': 0,
        },
        'latest_analysis': None,
        'recent_analyses': [],
        'athlete_summaries': [],
    }


def _build_summary(current_user: User, entries: list[tuple[AnalysisHistory, str]]) -> dict[str, Any]:
    if not entries:
        scope = 'self' if _normalize_role(current_user.role) == 'athlete' else 'team'
        return _empty_summary(current_user, scope)

    summary_map: dict[int, dict[str, Any]] = {}
    latest_entry: dict[str, Any] | None = None
    latest_timestamp = None
    recent_analyses: list[dict[str, Any]] = []

    risk_total = 0.0
    risk_count = 0
    balance_total = 0.0
    balance_count = 0
    stability_total = 0.0
    stability_count = 0
    pose_quality_total = 0.0
    pose_quality_count = 0
    total_issues = 0
    risk_distribution = defaultdict(int)

    for entry, athlete_name in entries:
        serialized = _serialize_history_entry(entry, athlete_name)
        recent_analyses.append(serialized)

        timestamp = _analysis_timestamp(entry)
        if latest_timestamp is None or (timestamp is not None and timestamp > latest_timestamp):
            latest_timestamp = timestamp
            latest_entry = serialized

        normalized_level = _normalize_level(entry.risk_level)
        if normalized_level in {'high', 'medium', 'low'}:
            risk_distribution[normalized_level] += 1

        if isinstance(entry.risk_score, (int, float)):
            risk_total += float(entry.risk_score)
            risk_count += 1

        if isinstance(entry.balance_score, (int, float)):
            balance_total += float(entry.balance_score)
            balance_count += 1

        if isinstance(entry.stability_score, (int, float)):
            stability_total += float(entry.stability_score)
            stability_count += 1

        if isinstance(entry.pose_quality_score, (int, float)):
            pose_quality_total += float(entry.pose_quality_score)
            pose_quality_count += 1

        total_issues += int(entry.total_issues or entry.total_issues_detected or 0)

        athlete_summary = summary_map.setdefault(
            entry.user_id,
            {
                'user_id': entry.user_id,
                'full_name': athlete_name,
                'analysis_count': 0,
                'risk_total': 0.0,
                'risk_score_count': 0,
                'latest_risk_score': None,
                'latest_risk_level': None,
                'latest_analysis_time': None,
                'highest_risk_score': None,
                'total_issues': 0,
            },
        )

        athlete_summary['analysis_count'] += 1
        athlete_summary['total_issues'] += int(entry.total_issues or entry.total_issues_detected or 0)

        if isinstance(entry.risk_score, (int, float)):
            score_value = float(entry.risk_score)
            athlete_summary['risk_total'] += score_value
            athlete_summary['risk_score_count'] += 1
            athlete_summary['highest_risk_score'] = (
                score_value
                if athlete_summary['highest_risk_score'] is None
                else max(athlete_summary['highest_risk_score'], score_value)
            )

        if athlete_summary['latest_analysis_time'] is None or (timestamp is not None and timestamp > athlete_summary['latest_analysis_time']):
            athlete_summary['latest_analysis_time'] = timestamp
            athlete_summary['latest_risk_score'] = entry.risk_score
            athlete_summary['latest_risk_level'] = normalized_level

    athlete_summaries: list[dict[str, Any]] = []
    for athlete_summary in summary_map.values():
        average_risk_score = None
        if athlete_summary['risk_score_count']:
            average_risk_score = round(athlete_summary['risk_total'] / athlete_summary['risk_score_count'], 2)

        athlete_summaries.append(
            {
                'user_id': athlete_summary['user_id'],
                'full_name': athlete_summary['full_name'],
                'analysis_count': athlete_summary['analysis_count'],
                'average_risk_score': average_risk_score,
                'latest_risk_score': athlete_summary['latest_risk_score'],
                'latest_risk_level': athlete_summary['latest_risk_level'],
                'highest_risk_score': athlete_summary['highest_risk_score'],
                'latest_analysis_time': athlete_summary['latest_analysis_time'].isoformat() if athlete_summary['latest_analysis_time'] else None,
                'total_issues': athlete_summary['total_issues'],
            },
        )

    athlete_summaries.sort(
        key=lambda item: (
            item['average_risk_score'] is not None,
            item['average_risk_score'] or 0,
            item['analysis_count'],
            item['latest_analysis_time'] or '',
        ),
        reverse=True,
    )

    average_risk_score = round(risk_total / risk_count, 2) if risk_count else None
    average_balance_score = round(balance_total / balance_count, 2) if balance_count else None
    average_stability_score = round(stability_total / stability_count, 2) if stability_count else None
    average_pose_quality_score = round(pose_quality_total / pose_quality_count, 2) if pose_quality_count else None

    scope = 'self' if _normalize_role(current_user.role) == 'athlete' else 'team'

    return {
        'current_user': {
            'user_id': current_user.user_id,
            'full_name': current_user.full_name,
            'role': current_user.role,
            'role_label': ROLE_LABELS.get(_normalize_role(current_user.role), current_user.role.title()),
        },
        'scope': scope,
        'metrics': {
            'analysis_count': len(entries),
            'athlete_count': len(summary_map) if scope == 'team' else 1,
            'average_risk_score': average_risk_score,
            'latest_risk_score': latest_entry['risk_score'] if latest_entry else None,
            'latest_risk_level': latest_entry['risk_level'] if latest_entry else None,
            'high_risk_count': risk_distribution['high'],
            'medium_risk_count': risk_distribution['medium'],
            'low_risk_count': risk_distribution['low'],
            'average_balance_score': average_balance_score,
            'average_stability_score': average_stability_score,
            'average_pose_quality_score': average_pose_quality_score,
            'total_issues': total_issues,
        },
        'latest_analysis': latest_entry,
        'recent_analyses': recent_analyses[:6],
        'athlete_summaries': athlete_summaries[:5],
    }


@router.get('/summary')
def get_dashboard_summary(
    db: Session = Depends(get_db),
    x_current_user_id: int | None = Header(default=None, alias='X-Current-User-Id'),
) -> dict[str, Any]:
    if x_current_user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required.')

    current_user = get_user_by_id(db, x_current_user_id)
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required.')

    normalized_role = _normalize_role(current_user.role)
    if normalized_role not in ROLE_LABELS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access to this dashboard is not allowed.')

    if normalized_role == 'athlete':
        history = get_analysis_history_by_user(db, current_user.user_id)
        entries = [(entry, current_user.full_name) for entry in history]
        return _build_summary(current_user, entries)

    if normalized_role in STAFF_ROLES:
        accessible_history = (
            db.query(AnalysisHistory, User.full_name)
            .join(User, AnalysisHistory.user_id == User.user_id)
            .filter(User.role == 'athlete')
            .order_by(func.coalesce(AnalysisHistory.analysis_time, AnalysisHistory.created_at).desc(), AnalysisHistory.history_id.desc())
            .all()
        )
        return _build_summary(current_user, accessible_history)

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access to this dashboard is not allowed.')