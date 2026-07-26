from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional

from app.auth.roles import RoleChecker
from app.rag.index import KBIndex  # Imports your FAISS index query controller

router = APIRouter(prefix="/search", tags=["Semantic Search"])

# Secure access so that authenticated technicians or users can run KB semantic looks
authenticated_guard = RoleChecker(allowed_roles=["Customer", "Agent", "Admin"])

@router.get("/", status_code=status.HTTP_200_OK)
async def semantic_knowledge_search(
    q: str = Query(..., description="The query string to evaluate against the index"),
    limit: int = Query(5, description="Maximum number of context chunks to return"),
    source: Optional[str] = Query(None, description="Optional filter to limit chunks by a specific source file or origin"),
    user_claim: dict = Depends(authenticated_guard)
) -> List[Dict[str, Any]]:
    """
    Queries the underlying vector store directly for top-k contextual matches, 
    returning relevant documentation snippets with title links and accuracy scores.
    """
    # Load the process-wide structural persistent database index
    index = KBIndex.load_or_create()
    
    # Run structural matching over the FAISS or Pure-Python local vector backend
    results = index.search(query=q, k=limit, source_filter=source)
    
    # Format and present sanitized matches to match frontend component needs
    search_payload = []
    for match in results:
        search_payload.append({
            "score": float(match.get("score", 0.0)),
            "text": match.get("text", ""),
            "metadata": {
                "title": match.get("title", "Reference Documentation"),
                "url": match.get("url", "#"),
                "source": match.get("source", "Internal KB")
            }
        })
        
    return search_payload