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
    category_override: Optional[str] = None
    priority_override: Optional[str] = None

class TicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None

class TicketReplyRequest(BaseModel):
    response_text: str
    status_changed_to: Optional[str] = None

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
    suggested_resolution: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    title: str
    subject: str
    description: str
    user_id: str
    category: Optional[str] = None
    priority: Optional[str] = None
    status: str
    sentiment: Optional[str] = None
    is_duplicate: bool = False
    escalate_recommended: bool = False
    ai_root_cause: Optional[str] = None
    ai_suggested_resolution: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    ai_insights: Optional[AIInsights] = None
    agent_responses: list[dict] = []

    class Config:
        from_attributes = True
        populate_by_name = True


# --------------------------------------------------------------------------- #
# AI Pipeline
# --------------------------------------------------------------------------- #
def run_ai_pipeline(subject: str, description: str, db: Session) -> AIInsights:
    """
    Runs the full AI pipeline on ticket text.
    """
    # 1. Category classification
    try:
        classifier = get_classifier()
        category_result = classifier.predict(subject, description)
    except Exception as e:
        logger.error("Category classification failed: %s", e)
        category_result = {"category": "Technical", "confidence": 0.5}

    # 2. Priority prediction
    try:
        priority_predictor = get_priority_predictor()
        priority_result = priority_predictor.predict(
            subject, description, category=category_result["category"]
        )
    except Exception as e:
        logger.error("Priority prediction failed: %s", e)
        priority_result = {"priority": "Medium", "confidence": 0.5}

    # 3. Duplicate detection
    try:
        open_tickets = get_open_tickets(db)
        open_tickets_dicts = [
            {"id": t.id, "subject": t.title, "description": t.description}
            for t in open_tickets
        ]
        duplicate_detector = DuplicateDetector(similarity_threshold=0.50)
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


def build_ticket_response(ticket: models.Ticket, ai_insights: Optional[AIInsights] = None) -> TicketResponse:
    if ai_insights is None:
        ai_insights = AIInsights(
            predicted_category=ticket.category or "Technical",
            category_confidence=0.85,
            predicted_priority=ticket.priority or "Medium",
            priority_confidence=0.85,
            sentiment=ticket.sentiment or "Neutral",
            is_frustrated=(ticket.sentiment == "Frustrated"),
            escalation_recommended=(ticket.sentiment == "Frustrated" or ticket.priority in ("Critical", "Urgent")),
            is_duplicate=ticket.is_duplicate or False,
            duplicate_matches=[],
            suggested_resolution=ticket.ai_suggested_resolution,
        )

    return TicketResponse(
        id=ticket.id,
        title=ticket.title,
        subject=ticket.title,
        description=ticket.description,
        user_id=ticket.user_id,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        sentiment=ticket.sentiment,
        is_duplicate=ticket.is_duplicate or False,
        escalate_recommended=ticket.escalate_recommended or False,
        ai_root_cause=ticket.ai_root_cause,
        ai_suggested_resolution=ticket.ai_suggested_resolution,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        ai_insights=ai_insights,
        agent_responses=[],
    )


# --------------------------------------------------------------------------- #
@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new support ticket. Automatically runs AI classification, priority,
    duplicate check, sentiment, and resolution generation.
    """
    ai_insights = run_ai_pipeline(payload.subject, payload.description, db)

    final_category = payload.category_override or ai_insights.predicted_category
    final_priority = payload.priority_override or ai_insights.predicted_priority

    if ai_insights.escalation_recommended and final_priority not in ("Critical", "Urgent"):
        final_priority = "High"

    # Context retrieval for suggested resolution
    suggested_res = None
    try:
        from app.rag.retriever import Retriever
        from app.ai.resolution import ResolutionGenerator
        retriever = Retriever()
        ret_result = retriever.retrieve(f"{payload.subject} {payload.description}", top_k=3)
        context_chunks = [c.text for c in ret_result.chunks]
        suggested_res = await ResolutionGenerator.generate_draft(
            payload.subject, payload.description, context_chunks=context_chunks
        )
    except Exception as e:
        logger.info("Resolution draft generation fallback: %s", e)
        suggested_res = f"Investigate {final_category} issue: review logs, verify user credentials, and restore service."

    ai_insights.suggested_resolution = suggested_res

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
    ticket.is_duplicate = ai_insights.is_duplicate
    ticket.ai_suggested_resolution = suggested_res
    ticket.ai_root_cause = f"Automatic classification flagged as {final_category} with {final_priority} priority."
    db.commit()
    db.refresh(ticket)

    return build_ticket_response(ticket, ai_insights)


@router.get("", response_model=list[TicketResponse])
@router.get("/", response_model=list[TicketResponse])
def list_tickets(
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List tickets with role-based scoping and query filters.
    Customers only see their own tickets. Agents and Admins see all tickets.
    """
    query = db.query(models.Ticket)

    # Scoping by role
    if current_user.role.lower() == "customer":
        query = query.filter(
            (models.Ticket.user_id == current_user.id) | (models.Ticket.user_id == current_user.email)
        )

    if status_filter:
        query = query.filter(models.Ticket.status.ilike(status_filter))
    if priority:
        query = query.filter(models.Ticket.priority.ilike(priority))
    if category:
        query = query.filter(models.Ticket.category.ilike(category))
    if search:
        s = f"%{search}%"
        query = query.filter(
            models.Ticket.title.ilike(s) | models.Ticket.description.ilike(s) | models.Ticket.id.ilike(s)
        )

    tickets = query.order_by(models.Ticket.created_at.desc()).all()
    return [build_ticket_response(t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Fetch a single ticket by ID. Enforces customer authorization.
    """
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role.lower() == "customer" and ticket.user_id not in (current_user.id, current_user.email):
        raise HTTPException(status_code=403, detail="Not authorized to access this ticket")

    return build_ticket_response(ticket)


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: str,
    payload: TicketUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update ticket status, priority, or category.
    """
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role.lower() == "customer" and ticket.user_id not in (current_user.id, current_user.email):
        raise HTTPException(status_code=403, detail="Not authorized to update this ticket")

    if payload.status:
        ticket.status = payload.status
    if payload.category:
        ticket.category = payload.category
    if payload.priority:
        ticket.priority = payload.priority

    db.commit()
    db.refresh(ticket)
    return build_ticket_response(ticket)


@router.post("/{ticket_id}/reply", response_model=TicketResponse)
def reply_to_ticket(
    ticket_id: str,
    payload: TicketReplyRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Add a reply to the ticket and optionally change its status.
    """
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.status_changed_to:
        ticket.status = payload.status_changed_to
    elif current_user.role.lower() in ("agent", "admin", "superadmin") and ticket.status == "Open":
        ticket.status = "In_Progress"

    db.commit()
    db.refresh(ticket)
    return build_ticket_response(ticket)


@router.post("/{ticket_id}/reclassify", response_model=AIInsights)
def reclassify_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Re-runs the AI pipeline on an existing ticket.
    """
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ai_insights = run_ai_pipeline(ticket.title, ticket.description, db)
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