import os

from app.schemas.auth import LoginRequest, SignupRequest


DEFAULT_LOGIN_EMAIL = 'athlete@example.com'
DEFAULT_LOGIN_PASSWORD = 'Athlete@123'

REGISTERED_ACCOUNTS = {
    DEFAULT_LOGIN_EMAIL.lower(): {
        'fullName': 'Athlete',
        'email': DEFAULT_LOGIN_EMAIL,
        'password': DEFAULT_LOGIN_PASSWORD,
        'role': 'athlete',
    }
}


def register_account(payload: SignupRequest) -> dict:
    normalized_email = payload.email.lower()

    if normalized_email in REGISTERED_ACCOUNTS:
        raise ValueError('An account with this email already exists.')

    account = {
        'fullName': payload.fullName.strip(),
        'email': payload.email,
        'password': payload.password,
        'role': payload.role,
    }
    REGISTERED_ACCOUNTS[normalized_email] = account
    return account


def validate_login(payload: LoginRequest) -> bool:
    expected_email = os.getenv('LOGIN_EMAIL', DEFAULT_LOGIN_EMAIL)
    expected_password = os.getenv('LOGIN_PASSWORD', DEFAULT_LOGIN_PASSWORD)

    if payload.email.lower() == expected_email.lower() and payload.password == expected_password:
        return True

    account = REGISTERED_ACCOUNTS.get(payload.email.lower())
    return bool(account and account['password'] == payload.password)
