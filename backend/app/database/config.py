import os


def get_database_url() -> str:
    return os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/sports_injury_risk_detection')
