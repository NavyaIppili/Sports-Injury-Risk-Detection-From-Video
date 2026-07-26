import logging
import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.database.config import get_database_url

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Shared SQLAlchemy base for all ORM models."""


engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Provide a database session per FastAPI request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create tables during local development when migrations have not been run."""
    if os.getenv('AUTO_CREATE_TABLES', 'true').lower() != 'true':
        return

    try:
        # Import models here so SQLAlchemy registers their metadata before creation.
        from app.models import athlete, user  # noqa: F401

        Base.metadata.create_all(bind=engine)

        from app.crud.user import seed_default_demo_user

        with SessionLocal() as db:
            seed_default_demo_user(db)

        logger.info('Database tables are ready.')
    except Exception:
        logger.exception('Unable to create database tables. Check DATABASE_URL and PostgreSQL status.')
        raise
