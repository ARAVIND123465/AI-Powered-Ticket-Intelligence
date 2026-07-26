from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from app.auth.roles import RoleChecker
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications Alert Sync"])

# Secure alerts strictly for active helpdesk operators and team managers
internal_staff_guard = RoleChecker(allowed_roles=["Agent", "Admin"])

@router.get("/", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_active_system_alerts(
    staff_claim: dict = Depends(internal_staff_guard)
):
    """
    Retrieves live unread system alert payloads to populate the agent's workspace badge.
    """
    active_alerts = await NotificationService.get_unread_alerts()
    return active_alerts


@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_alert_as_resolved(
    notification_id: str,
    staff_claim: dict = Depends(internal_staff_guard)
):
    """
    Updates the read state of a specific notification.
    """
    success = await NotificationService.mark_as_read(notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested notification identifier does not exist or has already been cleared."
        )
    return {"status": "success", "message": "Notification successfully marked as read."}