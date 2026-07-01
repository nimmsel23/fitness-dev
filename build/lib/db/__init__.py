"""
fitness-dev DB Layer — SQLAlchemy + Alembic

engine      — SQLAlchemy Engine (SQLite, ~/.aos/fitness/sessions/training_history.sqlite)
SessionLocal — Session factory (context manager)
Base        — DeclarativeBase für alle Models
"""
from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

_RUNTIME = Path(os.environ.get("FITNESS_RUNTIME", Path.home() / ".aos" / "fitness"))
DB_PATH  = _RUNTIME / "sessions" / "training_history.sqlite"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI Dependency — yields eine DB-Session, schließt sie danach."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
