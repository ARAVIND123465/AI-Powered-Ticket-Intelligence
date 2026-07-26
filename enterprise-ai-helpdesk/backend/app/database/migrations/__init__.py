import logging
from app.database.database import Base, engine
from app.database import models

logger = logging.getLogger("app.database.migrations")

def run_essential_migrations() -> bool:
    """
    Bootstrap operation that ensures all tables mapped by Base (models.User, models.Ticket)
    are created in SQLite/PostgreSQL on application startup.
    """
    try:
        logger.info("Initializing essential database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
        return True
    except Exception as e:
        logger.critical(f"Failed to bootstrap database tables: {e}", exc_info=True)
        return False
