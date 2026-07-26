import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Centralized configuration engine that safely manages schema validation,
    cryptographic application parameters, and multi-backend API keys.
    """
    
    # Core Application Properties
    PROJECT_NAME: str = "Enterprise AI Helpdesk Core API Gateway"
    SECRET_KEY: str = "SUPER_SECRET_SANDBOX_KEY_DO_NOT_USE_IN_PROD_1234567890"
    DATABASE_URL: str = "sqlite:///./enterprise_helpdesk.db"
    
    # External Generative Engines & Language Analytics Backend Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Operational SMTP Mail Server Configuration Parameters
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "support@enterprise-ai.local"

    # Pydantic Configuration to seamlessly ingest environment profiles
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"  # Gracefully ignores extra parameters appended in local profiles
    )

# Instantiate a single process-wide configuration controller singleton
settings = Settings()