"""
tickets.py
----------
Module 7 of the Intelligent Ticket AI Classification system.

FastAPI router for ticket CRUD operations. This is where the ML modules
(Modules 1-6) are wired together: when a ticket is created, it is
automatically run through the full AI pipeline:

    1. classify_ticket.py      -> predicted category
    2. priority_prediction.py  -> predicted priority
    3. duplicate_detector.py   -> duplicate check against open tickets
    4. sentiment_analysis.py   -> customer sentiment / frustration flag

The results are attached to the ticket record before it's saved, and also
returned to the frontend so the UI can show "AI suggested category: Network
(87% confidence)" etc., with the option for the user/agent to override.

Mount in main.py:
    from app.api import tickets
    app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models, schemas
from app.auth.jwt import get_current_user
from app.services.ticket_service import (
    create_ticket_record,
    get_open_tickets,
    get_ticket_by_id,
    update_ticket_ai_fields,
)

from app.ml.classify_ticket import get_classifier
from app.ml.priority_prediction import get_priority_predictor
from app.ml.duplicate_detector import DuplicateDetector
from app.ml.sentiment_analysis import get_sentiment_analyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api.tickets")

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #
class TicketCreateRequest(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    category_override: Optional[str] = None   # user can override the AI category
    priority_override: Optional[str] = None   # user can override the AI priority


class AIInsights(BaseModel):
    predicted_category: str
    category_confidence: float
    predicted_priority: str
    priority_confidence: float
    sentiment: str
    is_frustrated: bool
    escalation_recommended: bool
    is_duplicate: bool
    duplicate_matches: list[dict]


class TicketResponse(BaseModel):
    id: int
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    ai_insights: AIInsights

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# AI Pipeline
# --------------------------------------------------------------------------- #
def run_ai_pipeline(subject: str, description: str, db: Session) -> AIInsights:
    """
    Runs the full AI pipeline on new ticket text. Any individual model
    failure is caught and logged so one broken model doesn't block ticket
    creation entirely — it just degrades gracefully.
    """
    # 1. Category classification
    try:
        classifier = get_classifier()
        category_result = classifier.predict(subject, description)
    except Exception as e:
        logger.error("Category classification failed: %s", e)
        category_result = {"category": "Uncategorized", "confidence": 0.0}

    # 2. Priority prediction
    try:
        priority_predictor = get_priority_predictor()
        priority_result = priority_predictor.predict(
            subject, description, category=category_result["category"]
        )
    except Exception as e:
        logger.error("Priority prediction failed: %s", e)
        priority_result = {"priority": "Medium", "confidence": 0.0}

    # 3. Duplicate detection (fit live against currently open tickets)
    try:
        open_tickets = get_open_tickets(db)
        open_tickets_dicts = [
            {"id": t.id, "subject": t.subject, "description": t.description}
            for t in open_tickets
        ]
        duplicate_detector = DuplicateDetector(similarity_threshold=0.6)
        duplicate_detector.fit(open_tickets_dicts)
        duplicate_result = duplicate_detector.check(subject, description)
    except Exception as e:
        logger.error("Duplicate detection failed: %s", e)
        duplicate_result = {"is_duplicate": False, "matches": []}

    # 4. Sentiment analysis
    try:
        sentiment_analyzer = get_sentiment_analyzer()
        sentiment_result = sentiment_analyzer.analyze(description, subject)
    except Exception as e:
        logger.error("Sentiment analysis failed: %s", e)
        sentiment_result = {
            "sentiment": "Neutral",
            "is_frustrated": False,
            "escalation_recommended": False,
        }

    return AIInsights(
        predicted_category=category_result["category"],
        category_confidence=category_result["confidence"],
        predicted_priority=priority_result["priority"],
        priority_confidence=priority_result["confidence"],
        sentiment=sentiment_result["sentiment"],
        is_frustrated=sentiment_result["is_frustrated"],
        escalation_recommended=sentiment_result["escalation_recommended"],
        is_duplicate=duplicate_result["is_duplicate"],
        duplicate_matches=duplicate_result["matches"],
    )


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #
@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new support ticket. Automatically runs the AI pipeline
    (classification, priority, duplicate check, sentiment) unless the
    caller has explicitly overridden category/priority.
    """
    ai_insights = run_ai_pipeline(payload.subject, payload.description, db)

    final_category = payload.category_override or ai_insights.predicted_category
    final_priority = payload.priority_override or ai_insights.predicted_priority

    # If sentiment analysis flags an escalation and the ticket isn't already
    # marked Critical, bump it up so it doesn't sit unattended.
    if ai_insights.escalation_recommended and final_priority not in ("Critical",):
        logger.info(
            "Escalating ticket priority due to detected frustration (was %s)", final_priority
        )
        final_priority = "High"

    ticket = create_ticket_record(
        db=db,
        subject=payload.subject,
        description=payload.description,
        category=final_category,
        priority=final_priority,
        created_by=current_user.id,
        ai_category_confidence=ai_insights.category_confidence,
        ai_priority_confidence=ai_insights.priority_confidence,
        ai_sentiment=ai_insights.sentiment,
    )

    if ai_insights.is_duplicate:
        logger.info(
            "Ticket #%s flagged as possible duplicate of: %s",
            ticket.id,
            [m["ticket_id"] for m in ai_insights.duplicate_matches],
        )

    return TicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at,
        ai_insights=ai_insights,
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ai_insights = AIInsights(
        predicted_category=ticket.category,
        category_confidence=ticket.ai_category_confidence or 0.0,
        predicted_priority=ticket.priority,
        priority_confidence=ticket.ai_priority_confidence or 0.0,
        sentiment=ticket.ai_sentiment or "Neutral",
        is_frustrated=(ticket.ai_sentiment == "Frustrated"),
        escalation_recommended=(ticket.ai_sentiment == "Frustrated"),
        is_duplicate=False,
        duplicate_matches=[],
    )

    return TicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at,
        ai_insights=ai_insights,
    )


@router.post("/{ticket_id}/reclassify", response_model=AIInsights)
def reclassify_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Re-runs the AI pipeline on an existing ticket. Useful if the ticket was
    edited, or if the underlying models were retrained since it was created.
    """
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ai_insights = run_ai_pipeline(ticket.subject, ticket.description, db)
    update_ticket_ai_fields(
        db=db,
        ticket_id=ticket_id,
        category=ai_insights.predicted_category,
        priority=ai_insights.predicted_priority,
        category_confidence=ai_insights.category_confidence,
        priority_confidence=ai_insights.priority_confidence,
        sentiment=ai_insights.sentiment,
    )

    return ai_insights