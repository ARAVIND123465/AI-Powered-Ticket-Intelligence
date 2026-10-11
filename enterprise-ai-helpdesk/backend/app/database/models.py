from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, Float
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

    # Relationship to attachments
    attachments = relationship("TicketAttachment", back_populates="ticket", cascade="all, delete-orphan")


class TicketAttachment(Base):
    """
    Stores metadata for PDF files uploaded by customers or agents
    and associated with specific support tickets.
    """
    __tablename__ = "ticket_attachments"

    id = Column(String, primary_key=True, index=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    uploader_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)          # Original filename from user
    stored_filename = Column(String, nullable=False)   # UUID-based filename on disk
    file_size = Column(Integer, nullable=False)        # Size in bytes
    content_type = Column(String, default="application/pdf")
    page_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ticket = relationship("Ticket", back_populates="attachments")
    uploader = relationship("User")
    analyses = relationship("PDFAnalysis", back_populates="attachment", cascade="all, delete-orphan")


class PDFAnalysis(Base):
    """
    Stores the results of an AI-powered PDF analysis performed by a support agent.
    Links back to the specific attachment and ticket for traceability.
    """
    __tablename__ = "pdf_analyses"

    id = Column(String, primary_key=True, index=True)
    attachment_id = Column(String, ForeignKey("ticket_attachments.id"), nullable=False, index=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False, index=True)
    analyzed_by = Column(String, ForeignKey("users.id"), nullable=False)

    # Extracted source text from PDF
    extracted_text = Column(Text, nullable=True)

    # Structured AI analysis result (stored as JSON string)
    analysis_result = Column(Text, nullable=False)

    # Metadata
    model_used = Column(String, default="gemini-2.5-flash")
    sandbox_mode = Column(Boolean, default=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attachment = relationship("TicketAttachment", back_populates="analyses")
    ticket = relationship("Ticket")
    analyst = relationship("User")