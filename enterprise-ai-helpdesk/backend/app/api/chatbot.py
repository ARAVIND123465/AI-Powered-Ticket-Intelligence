from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from app.auth.roles import RoleChecker
from app.rag.chatbot import KBChatbot  # Imports the chatbot module built in the rag/ folder

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

# Allow any valid user (Customer, Agent, Admin) to converse with the KB chatbot
authenticated_guard = RoleChecker(allowed_roles=["Customer", "Agent", "Admin"])

# Pydantic Schemas for validation
class ChatQuery(BaseModel):
    question: str
    history: List[Dict[str, str]] = []  # Format: [{"sender": "user", "text": "..."}, {"sender": "bot", "text": "..."}]

class ChatResponse(BaseModel):
    answer: str
    citations: List[str]
    escalation_recommended: bool

@router.post("/ask", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def ask_knowledge_base(
    payload: ChatQuery,
    user_claim: dict = Depends(authenticated_guard)
):
    """
    Queries the RAG framework to generate an answer grounded securely 
    within the compiled vector index metadata.
    """
    try:
        # Utilize the process-wide singleton or class interface from your RAG layer
        reply = await KBChatbot.ask(question=payload.question, history=payload.history)
        
        return {
            "answer": reply.get("answer", ""),
            "citations": reply.get("citations", []),
            "escalation_recommended": reply.get("escalation_recommended", False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Chatbot pipeline encountered an operational error: {str(e)}"
        )