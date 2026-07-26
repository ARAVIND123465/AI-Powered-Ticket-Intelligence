from fastapi import APIRouter, Depends, status
from typing import Dict, Any, List

from app.auth.roles import RoleChecker
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Secure endpoints so they are only viewable by corporate helpdesk agents or admins
internal_staff_guard = RoleChecker(allowed_roles=["Agent", "Admin"])

@router.get("/summary", status_code=status.HTTP_200_OK)
async def get_dashboard_summary(
    staff_claim: dict = Depends(internal_staff_guard)
) -> Dict[str, Any]:
    """
    Fetches the operational status snapshot, distribution trends, 
    and systemic helpdesk metrics for management views.
    """
    snapshot = await DashboardService.get_system_snapshot()
    return snapshot


@router.get("/weekly-load", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_weekly_load_trends(
    staff_claim: dict = Depends(internal_staff_guard)
) -> List[Dict[str, Any]]:
    """
    Retrieves incoming vs. resolved ticket volume progressions over the trailing 7 days.
    Feeds dashboard charts seamlessly.
    """
    load_metrics = await DashboardService.get_weekly_load_metrics()
    return load_metrics