"""
SQLAlchemy ORM Models — fitness-dev
"""
from __future__ import annotations

from sqlalchemy import Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class TrainingHistory(Base):
    __tablename__ = "training_history"

    id                : Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    date              : Mapped[str]   = mapped_column(String,  nullable=False)
    session_id        : Mapped[str | None] = mapped_column(String, nullable=True)
    workout_id        : Mapped[str]   = mapped_column(String,  nullable=False)
    exercise_id       : Mapped[str]   = mapped_column(String,  nullable=False)
    display_name      : Mapped[str]   = mapped_column(String,  nullable=False)
    sets              : Mapped[int]   = mapped_column(Integer, nullable=False, default=0)
    reps              : Mapped[int]   = mapped_column(Integer, nullable=False, default=0)
    weight            : Mapped[float] = mapped_column(Float,   nullable=False, default=0.0)
    rpe               : Mapped[int]   = mapped_column(Integer, nullable=False, default=0)
    done              : Mapped[int]   = mapped_column(Integer, nullable=False, default=0)
    notes             : Mapped[str]   = mapped_column(Text,    nullable=False, default="")
    pain              : Mapped[str]   = mapped_column(Text,    nullable=False, default="")
    completion_status : Mapped[str]   = mapped_column(String,  nullable=False, default="completed")

    __table_args__ = (
        Index("idx_th_exercise_date", "exercise_id", "date"),
    )

    def __repr__(self) -> str:
        return f"<TrainingHistory {self.date} {self.exercise_id} done={self.done}>"
