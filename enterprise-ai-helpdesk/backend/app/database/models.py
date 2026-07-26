from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class User(Base):
    """
    Represents corporate employees, administrative managers, and support agents.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="Customer", nullable=False)  # Customer, Agent, Admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship linking back to tickets filed by this specific user
    tickets = relationship("Ticket", back_populates="creator")


class Ticket(Base):
    """
    The heart of the intelligent ticketing platform. Contains standard support text
    alongside fields populated by your ML classification and generative AI suites.
    """
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="Open", nullable=False)  # Open, In_Progress, Resolved, Closed

    # Machine Learning Meta-Tags
    category = Column(String, nullable=True)        # Predicted via TicketClassifier
    priority = Column(String, nullable=True)        # Predicted via PriorityPredictor (or overridden)
    sentiment = Column(String, nullable=True)       # Parsed via SentimentAnalyzer
    is_duplicate = Column(Boolean, default=False)   # Flagged via DuplicateDetector
    escalate_recommended = Column(Boolean, default=False)

    # Generative AI Enriched Logs
    ai_root_cause = Column(Text, nullable=True)      # Extracted JSON from RootCauseAnalyzer
    ai_suggested_resolution = Column(Text, nullable=True) # Drafted steps from ResolutionGenerator

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Link back to user model map
    creator = relationship("User", back_populates="tickets")