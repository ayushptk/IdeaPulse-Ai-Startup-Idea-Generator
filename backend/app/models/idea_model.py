"""
SQLAlchemy ORM model for the `ideas` table.
Stores AI-generated SaaS ideas linked to their discovery platform.
"""

import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class Idea(Base):
    """
    Core entity — one row per generated SaaS idea.

    Fields mirror the AI output:
      problem      → real-world pain point extracted from posts
      users        → target audience for the SaaS
      idea         → proposed product concept
      features     → list of MVP feature suggestions (JSON array)
      monetization → pricing / revenue model suggestion
      score        → AI-assigned viability score (1–10)
    """

    __tablename__ = "ideas"
    __table_args__ = (
        Index("ix_ideas_platform_created_score", "platform", "created_at", "score"),
        Index("ix_ideas_created_score", "created_at", "score"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    platform: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    users: Mapped[str] = mapped_column(Text, nullable=False)
    idea: Mapped[str] = mapped_column(Text, nullable=False)
    features: Mapped[list | None] = mapped_column(JSONB, default=list)
    monetization: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, index=True)

    source_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    engagement: Mapped[int | None] = mapped_column(Integer, nullable=True)
    content_hash: Mapped[str | None] = mapped_column(
        String(64), unique=True, nullable=True, index=True,
        comment="SHA-256 of problem+idea to prevent duplicates"
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

    def __repr__(self) -> str:
        return f"<Idea id={self.id} platform={self.platform} score={self.score}>"
