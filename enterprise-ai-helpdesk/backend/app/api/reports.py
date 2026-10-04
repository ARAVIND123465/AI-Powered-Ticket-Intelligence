from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.auth.roles import RoleChecker
from app.ai.insights import SupportInsightsGenerator

router = APIRouter(prefix="/reports", tags=["Reports Management"])

# Lock reporting routines down strictly to administrative management roles
admin_guard = RoleChecker(allowed_roles=["Admin", "SuperAdmin"])

class ReportRequest(BaseModel):
    report_name: str
    target_category: Optional[str] = None
    lookback_days: int = 30

class ReportResponse(BaseModel):
    report_id: str
    generated_at: datetime
    scope: str
    metrics_summary: Dict[str, Any]

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_systemic_insight_report(
    payload: ReportRequest,
    admin_claim: dict = Depends(admin_guard)
):
    """
    Assembles real-time operational ticket historical trends and passes the batch 
    payload through the AI synthesis layer to generate a master insight report.
    """
    try:
        # Mock pulling recent closed ticket records within lookback window range
        # In a production context, this would execute a quick query against database models
        mock_ticket_batch = [
            {"category": "Billing", "priority": "High", "title": "Payment gateway timeout error", "description": "Users encountering 504 gateway failures during Stripe subscription checkout loops."},
            {"category": "Technical", "priority": "Medium", "title": "SSO authentication failure", "description": "Active Directory federation assertions failing intermittently on OAuth callbacks."}
        ]

        # Process the aggregated collection using the core AI cluster engine
        compiled_insights = await SupportInsightsGenerator.generate_batch_insights(tickets=mock_ticket_batch)

        return {
            "report_id": f"rep_{int(datetime.utcnow().timestamp())}",
            "generated_at": datetime.utcnow(),
            "scope": f"All Departments | Lookback: {payload.lookback_days} Days",
            "metrics_summary": compiled_insights
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report orchestration pipeline encountered an operational failure: {str(e)}"
        )