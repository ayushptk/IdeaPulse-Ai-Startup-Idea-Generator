"""
SQLAlchemy ORM model for the `saved_ideas` table.
Stores AI-generated SaaS ideas saved by the user.
"""

import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base

class SavedIdea(Base):
    """
    Stores an idea saved by a specific user.
    Uses JSONB to flexibly store the full payload of the idea.
    """

    __tablename__ = "saved_ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    idea_key: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    idea_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "idea_key", name="uix_user_idea_key"),
    )

    def __repr__(self) -> str:
        return f"<SavedIdea id={self.id} user_id={self.user_id} idea_key={self.idea_key}>"
