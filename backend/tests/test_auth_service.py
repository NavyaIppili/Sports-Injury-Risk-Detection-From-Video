from app.crud.user import authenticate_user, get_user_by_email, seed_default_demo_user
from app.database.database import SessionLocal
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.services.auth_service import validate_login


def test_validate_login_accepts_default_demo_credentials():
    payload = LoginRequest(email='athlete@example.com', password='Athlete@123')
    assert validate_login(payload) is True


def test_validate_login_rejects_wrong_password():
    payload = LoginRequest(email='athlete@example.com', password='wrong-password')
    assert validate_login(payload) is False


def test_validate_login_accepts_trimmed_credentials():
    payload = LoginRequest(email='  athlete@example.com  ', password='  Athlete@123  ')
    assert validate_login(payload) is True


def test_seed_default_demo_user_creates_login_account():
    with SessionLocal() as db:
        db.query(User).filter(User.email == 'athlete@example.com').delete()
        db.commit()

        seed_default_demo_user(db)

        user = get_user_by_email(db, 'athlete@example.com')
        assert user is not None
        assert authenticate_user(db, 'athlete@example.com', 'Athlete@123') is not None
