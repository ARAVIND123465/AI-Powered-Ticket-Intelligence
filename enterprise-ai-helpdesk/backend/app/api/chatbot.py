from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from app.auth.roles import RoleChecker
from app.rag.chatbot import KBChatbot, ChatMessage  # Imports the chatbot module built in the rag/ folder

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

# Allow any valid user (Customer, Agent, Admin, SuperAdmin) to converse with the KB chatbot
authenticated_guard = RoleChecker(allowed_roles=["Customer", "Agent", "Admin", "SuperAdmin"])

# Process-wide chatbot instance
_chatbot_instance = None

def get_chatbot() -> KBChatbot:
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = KBChatbot()
    return _chatbot_instance

# Pydantic Schemas for validation
class ChatQuery(BaseModel):
    question: str
    history: List[Dict[str, str]] = []  # Format: [{"sender": "user", "text": "..."}, {"sender": "bot", "text": "..."}]

class ChatResponse(BaseModel):
    answer: str
    citations: List[str]
    escalation_recommended: bool

@router.post("/ask", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def ask_knowledge_base(
    payload: ChatQuery,
    user_claim: dict = Depends(authenticated_guard)
):
    """
    Queries the RAG framework to generate an answer grounded securely 
    within the compiled vector index metadata.
    """
    try:
        chatbot = get_chatbot()
        formatted_history = [
            ChatMessage(
                role="assistant" if h.get("sender") in ("bot", "assistant") else "user",
                content=h.get("text", "") or h.get("content", "")
            )
            for h in payload.history
        ]
        
        reply = chatbot.ask(question=payload.question, history=formatted_history)
        
        citation_titles = [c.title or c.doc_id for c in reply.citations]
        return {
            "answer": reply.answer,
            "citations": citation_titles,
            "escalation_recommended": not reply.used_context
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Chatbot pipeline encountered an operational error: {str(e)}"
        )