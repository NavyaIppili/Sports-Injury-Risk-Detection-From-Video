from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.database import Base, get_db
from app.main import app
from app.models.analysis_history import AnalysisHistory
from app.models.user import User

client = TestClient(app)


def _build_session_override(db_session):
    def _override():
        try:
            yield db_session
        finally:
            pass

    return _override


def _seed_analysis(db_session, user, video_id, risk_score, risk_level, total_issues, analysis_time):
    entry = AnalysisHistory(
        user_id=user.user_id,
        video_id=video_id,
        video_name=f'{video_id}.mp4',
        risk_score=risk_score,
        risk_level=risk_level,
        balance_score=80.0 - total_issues,
        stability_score=70.0 - total_issues,
        pose_quality_score=75.0 - total_issues,
        total_issues=total_issues,
        total_issues_detected=total_issues,
        detected_issues=['issue-a'] if total_issues else [],
        recommendations=['Keep training'] if total_issues else [],
        frames_processed=100,
        duration=12.5,
        processing_status='Completed',
        analysis_time=analysis_time,
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)
    return entry


def test_dashboard_summary_returns_team_metrics_for_staff_role():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        admin = User(full_name='Admin User', email='admin@example.com', password_hash='hash', role='admin')
        athlete_one = User(full_name='Athlete One', email='athlete1@example.com', password_hash='hash', role='athlete')
        athlete_two = User(full_name='Athlete Two', email='athlete2@example.com', password_hash='hash', role='athlete')
        db.add_all([admin, athlete_one, athlete_two])
        db.commit()
        db.refresh(admin)
        db.refresh(athlete_one)
        db.refresh(athlete_two)

        _seed_analysis(db, athlete_one, 'video-1', 82.5, 'high', 3, datetime(2026, 8, 10, 12, 0, 0))
        _seed_analysis(db, athlete_one, 'video-2', 34.0, 'medium', 1, datetime(2026, 8, 11, 12, 0, 0))
        _seed_analysis(db, athlete_two, 'video-3', 22.0, 'low', 0, datetime(2026, 8, 12, 12, 0, 0))

        app.dependency_overrides[get_db] = _build_session_override(db)
        try:
            response = client.get('/api/v1/dashboard/summary', headers={'X-Current-User-Id': str(admin.user_id)})
        finally:
            app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload['scope'] == 'team'
    assert payload['metrics']['analysis_count'] == 3
    assert payload['metrics']['athlete_count'] == 2
    assert payload['metrics']['high_risk_count'] == 1
    assert payload['metrics']['medium_risk_count'] == 1
    assert payload['metrics']['low_risk_count'] == 1
    assert len(payload['recent_analyses']) == 3
    assert len(payload['athlete_summaries']) == 2


def test_dashboard_summary_limits_athlete_to_own_history():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        athlete_one = User(full_name='Athlete One', email='athlete1@example.com', password_hash='hash', role='athlete')
        athlete_two = User(full_name='Athlete Two', email='athlete2@example.com', password_hash='hash', role='athlete')
        db.add_all([athlete_one, athlete_two])
        db.commit()
        db.refresh(athlete_one)
        db.refresh(athlete_two)

        _seed_analysis(db, athlete_one, 'video-1', 82.5, 'high', 3, datetime(2026, 8, 10, 12, 0, 0))
        _seed_analysis(db, athlete_two, 'video-2', 22.0, 'low', 0, datetime(2026, 8, 12, 12, 0, 0))

        app.dependency_overrides[get_db] = _build_session_override(db)
        try:
            response = client.get('/api/v1/dashboard/summary', headers={'X-Current-User-Id': str(athlete_one.user_id)})
        finally:
            app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload['scope'] == 'self'
    assert payload['metrics']['analysis_count'] == 1
    assert payload['metrics']['athlete_count'] == 1
    assert payload['metrics']['high_risk_count'] == 1
    assert len(payload['recent_analyses']) == 1
    assert payload['recent_analyses'][0]['user_id'] == athlete_one.user_id