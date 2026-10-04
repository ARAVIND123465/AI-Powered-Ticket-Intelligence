from fastapi import APIRouter, Depends, status
from typing import Dict, Any, List

from app.auth.roles import RoleChecker
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Secure analytics tracking exclusively for staff operators and system admins
internal_staff_guard = RoleChecker(allowed_roles=["Agent", "Admin", "SuperAdmin"])

@router.get("/predictions", status_code=status.HTTP_200_OK)
async def get_predictive_volume_analysis(
    staff_claim: dict = Depends(internal_staff_guard)
) -> Dict[str, Any]:
    """
    Exposes advanced predictive forecasting arrays extracted via the ML pipeline.
    """
    predictions = await AnalyticsService.get_predictive_analysis()
    return predictions


@router.get("/sentiment", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_customer_sentiment_trends(
    staff_claim: dict = Depends(internal_staff_guard)
) -> List[Dict[str, Any]]:
    """
    Retrieves comparative breakdown rows of customer frustration markers across team history.
    """
    trends = await AnalyticsService.get_sentiment_trends()
    return trends