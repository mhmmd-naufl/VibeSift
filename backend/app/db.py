"""Database engine, session factory, and declarative base."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base shared by all ORM models."""


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for request handlers."""
    async with SessionLocal() as session:
        yield session
