import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

# Import ML modules
from app.ml.classify_ticket import TicketClassifier
from app.ml.priority_prediction import PriorityPredictor
from app.ml.duplicate_detector import DuplicateDetector
from app.ml.sentiment_analysis import SentimentAnalyzer

# Import AI modules
from app.ai.root_cause import RootCauseAnalyzer
from app.ai.resolution import ResolutionGenerator

logger = logging.getLogger("app.services.ticket_service")

class TicketService:
    """
    Handles core business orchestration rules for ticket entities, seamlessly
    marrying traditional CRUD events with intelligence pipelines.
    """

    @classmethod
    async def process_new_ticket(cls, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingests raw ticket inputs, passes them through the ML classification suite,
        checks for duplicates, and assigns intelligent operational routing fields.
        """
        title = ticket_data.get("title", "")
        desc = ticket_data.get("description", "")
        user_id = ticket_data.get("user_id", "")
        full_text = f"{title} {desc}"

        logger.info(f"Processing intelligence metrics for new ticket from user: {user_id}")

        # 1. Pipeline execution across your 4 core ML modules
        is_duplicate = DuplicateDetector.check_duplicate(title, desc, user_id=user_id)
        category = TicketClassifier.predict(full_text)
        predicted_priority = PriorityPredictor.predict(full_text)
        sentiment_res = SentimentAnalyzer.analyze(full_text)

        # 2. Smart Business Rules (Override logic based on client frustration)
        final_priority = predicted_priority
        if sentiment_res.get("sentiment") == "Frustrated" or sentiment_res.get("escalation_recommended"):
            final_priority = "Urgent"

        # Mock database payload structure mapping to models.py requirements
        processed_record = {
            "id": f"tkt_{int(datetime.utcnow().timestamp())}",
            "title": title,
            "description": desc,
            "user_id": user_id,
            "category": category,
            "priority": final_priority,
            "sentiment": sentiment_res.get("sentiment", "Neutral"),
            "is_duplicate": is_duplicate,
            "status": "Open",
            "escalate_recommended": sentiment_res.get("escalation_recommended", False),
            "ai_diagnostics": None,
            "created_at": datetime.utcnow()
        }

        return processed_record

    @classmethod
    async def enrich_with_ai_diagnostics(cls, ticket_id: str, title: str, description: str) -> Dict[str, Any]:
        """
        Invoked on-demand when an agent opens a ticket. Attaches deep generative
        root cause mapping and a matching suggested resolution draft.
        """
        logger.info(f"Running generative AI enrichment for ticket ID: {ticket_id}")
        
        # Concurrent evaluation of root cause and resolutions
        root_cause_task = RootCauseAnalyzer.analyze_ticket(title, description)
        resolution_task = ResolutionGenerator.generate_draft(title, description)
        
        import asyncio
        root_cause, initial_draft = await asyncio.gather(root_cause_task, resolution_task)

        return {
            "ticket_id": ticket_id,
            "root_cause_analysis": root_cause,
            "suggested_resolution_draft": initial_draft,
            "enriched_at": datetime.utcnow()
        }

# --------------------------------------------------------------------------- #
# Module-level database CRUD helpers imported by app.api.tickets
# --------------------------------------------------------------------------- #
from sqlalchemy.orm import Session
from app.database import models

def create_ticket_record(
    db: Session,
    subject: str,
    description: str,
    category: str,
    priority: str,
    created_by: str,
    ai_category_confidence: float = 0.0,
    ai_priority_confidence: float = 0.0,
    ai_sentiment: str = "Neutral",
) -> models.Ticket:
    import uuid
    ticket_id = f"TKT-{uuid.uuid4().hex[:6].upper()}"
    db_ticket = models.Ticket(
        id=ticket_id,
        title=subject,
        description=description,
        user_id=created_by,
        status="Open",
        category=category,
        priority=priority,
        sentiment=ai_sentiment,
        is_duplicate=False,
        escalate_recommended=(priority in ("Critical", "Urgent")),
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_open_tickets(db: Session) -> List[models.Ticket]:
    return db.query(models.Ticket).filter(models.Ticket.status == "Open").all()

def get_ticket_by_id(db: Session, ticket_id: str) -> Optional[models.Ticket]:
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

def update_ticket_ai_fields(
    db: Session,
    ticket_id: str,
    category: str,
    priority: str,
    category_confidence: float,
    priority_confidence: float,
    sentiment: str,
) -> Optional[models.Ticket]:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket:
        ticket.category = category
        ticket.priority = priority
        ticket.sentiment = sentiment
        db.commit()
        db.refresh(ticket)
    return ticket