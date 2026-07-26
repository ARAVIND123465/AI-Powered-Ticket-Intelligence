import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger("app.services.notification_service")

class NotificationService:
    """
    Manages operational event alerts, surfacing real-time system notifications
    for human support representatives and system administrators.
    """
    
    # In-memory store placeholder for active notifications before database commit
    _notifications_buffer: List[Dict[str, Any]] = []

    @classmethod
    async def trigger_escalation_alert(cls, ticket_id: str, reason: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates an explicit high-priority escalation alert when an ML or AI 
        module identifies a critical ticket failure state.
        """
        logger.warning(f"CRITICAL ESCALATION TRIGGERED for Ticket {ticket_id}. Reason: {reason}")
        
        alert_payload = {
            "id": f"notif_{int(datetime.utcnow().timestamp())}",
            "ticket_id": ticket_id,
            "type": "CRITICAL_ESCALATION",
            "title": "Immediate Review Required",
            "message": f"Ticket #{ticket_id} has been forcefully escalated due to: {reason}",
            "severity": "High",
            "read": False,
            "created_at": datetime.utcnow()
        }
        
        cls._notifications_buffer.append(alert_payload)
        
        # Real-time synchronization layer hook (e.g., WebSocket broadcast would happen here)
        # emit_websocket_event("agent_alerts", alert_payload)
        
        return alert_payload

    @classmethod
    async def get_unread_alerts(cls) -> List[Dict[str, Any]]:
        """
        Retrieves active unread notifications to populate the agent's 
        top utility navbar bell icon in the dashboard.
        """
        # Returns buffered events filtering down to unread flags
        return [n for n in cls._notifications_buffer if not n.get("read", False)]

    @classmethod
    async def mark_as_read(cls, notification_id: str) -> bool:
        """
        Dismisses an active system warning notification frame.
        """
        for notif in cls._notifications_buffer:
            if notif.get("id") == notification_id:
                notif["read"] = True
                return True
        return False