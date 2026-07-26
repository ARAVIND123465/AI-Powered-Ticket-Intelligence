import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("app.database.database")

# Extract connection string from app configuration; default to local development SQLite
DATABASE_URL = getattr(settings, "DATABASE_URL", "sqlite:///./enterprise_helpdesk.db")

# Setup engine configurations. Include specialized parameters if using SQLite for test setups
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True,  # Automatically tests connection health before executing commands
        connect_args=connect_args
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("SQLAlchemy database connection engine successfully established.")
except Exception as e:
    logger.critical(f"Failed to bind SQLAlchemy database engine layer: {str(e)}")
    raise e

# Core model metadata mapper class inheritance layer
Base = declarative_base()

def get_db() -> Generator:
    """
    FastAPI request lifecycle dependency provider. Yields a fresh database session 
    and guarantees structural closing when the transaction thread resolves.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()