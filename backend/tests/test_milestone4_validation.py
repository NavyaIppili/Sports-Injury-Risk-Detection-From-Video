from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.crud.user import create_user
from app.database.database import Base, get_db
from app.main import app
from app.models.user import User
from app.schemas.auth import SignupRequest
from app.services.injury_prediction import predict_injury

client = TestClient(app)


def _override_db(db_session):
    def _override():
        try:
            yield db_session
        finally:
            pass

    return _override


def _make_session():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)


def test_login_invalid_credentials_return_401():
    TestingSessionLocal = _make_session()
    with TestingSessionLocal() as db:
        create_user(db, SignupRequest(fullName='Test Athlete', email='athlete@test.com', password='StrongPass123', role='athlete'))
        app.dependency_overrides[get_db] = _override_db(db)
        try:
            response = client.post('/api/v1/auth/login', json={'email': 'athlete@test.com', 'password': 'WrongPass123'})
        finally:
            app.dependency_overrides.clear()

    assert response.status_code == 401
    assert response.json()['detail'] == 'Invalid email or password.'


def test_athlete_profile_creation_and_duplicate_protection():
    TestingSessionLocal = _make_session()
    with TestingSessionLocal() as db:
        user = create_user(db, SignupRequest(fullName='Test Athlete', email='profile@test.com', password='StrongPass123', role='athlete'))
        app.dependency_overrides[get_db] = _override_db(db)
        try:
            profile_payload = {
                'user_id': user.user_id,
                'full_name': 'Test Athlete',
                'age': 24,
                'gender': 'Male',
                'height': '180 cm',
                'weight': '75 kg',
                'sport': 'Basketball',
                'playing_position': 'Guard',
                'dominant_side': 'Right',
                'experience_years': 7,
                'previous_injuries': 'None',
            }
            response = client.post('/api/v1/athlete/profile', json=profile_payload)
            duplicate = client.post('/api/v1/athlete/profile', json=profile_payload)
        finally:
            app.dependency_overrides.clear()

    assert response.status_code == 201
    assert response.json()['user_id'] == user.user_id
    assert duplicate.status_code == 409
    assert 'already exists' in duplicate.json()['detail']


def test_video_upload_rejects_invalid_file_and_accepts_valid_video():
    invalid = client.post('/api/v1/videos/upload', files={'video': ('photo.jpg', b'not-a-video', 'image/jpeg')})
    assert invalid.status_code == 400

    valid = client.post('/api/v1/videos/upload', files={'video': ('clip.mp4', b'1234567890', 'video/mp4')})
    assert valid.status_code == 200
    payload = valid.json()
    assert payload['status'] == 'uploaded'
    assert payload['original_filename'] == 'clip.mp4'
    assert payload['video_id']


def test_injury_prediction_handles_empty_analysis_data():
    result = predict_injury(analysis={})

    assert result['risk_score'] >= 0
    assert result['risk_level'] in {'Low', 'Medium', 'High'}
    assert result['detected_issues'] == []
    assert result['recommendations'][0]['title'] == 'Maintain Current Form'


def test_dashboard_summary_returns_zero_metrics_when_no_history_exists():
    TestingSessionLocal = _make_session()
    with TestingSessionLocal() as db:
        user = User(full_name='Solo Athlete', email='solo@test.com', password_hash='hashed-password', role='athlete')
        db.add(user)
        db.commit()
        db.refresh(user)

        app.dependency_overrides[get_db] = _override_db(db)
        try:
            response = client.get('/api/v1/dashboard/summary', headers={'X-Current-User-Id': str(user.user_id)})
        finally:
            app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload['scope'] == 'self'
    assert payload['metrics']['analysis_count'] == 0
    assert payload['metrics']['high_risk_count'] == 0
    assert payload['recent_analyses'] == []


def test_dashboard_summary_rejects_missing_auth_header():
    response = client.get('/api/v1/dashboard/summary')

    assert response.status_code == 401
    assert response.json()['detail'] == 'Authentication required.'
