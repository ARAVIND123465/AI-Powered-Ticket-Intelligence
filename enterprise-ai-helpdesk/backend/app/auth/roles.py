import logging
from typing import List
from fastapi import HTTPException, status, Depends
from app.auth.jwt import JWTManager
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger("app.auth.roles")

# Canonical roles across the entire enterprise platform:
# 'SuperAdmin' | 'Admin' | 'Agent' | 'Customer'

def normalize_role(role: str | None) -> str:
    """
    Normalizes any role representation into one of four canonical roles:
    'SuperAdmin' | 'Admin' | 'Agent' | 'Customer'
    """
    if not role:
        return "Customer"
    cleaned = str(role).strip().upper().replace("-", "").replace("_", "").replace(" ", "")
    if cleaned in ("SUPERADMIN", "SUPER"):
        return "SuperAdmin"
    if cleaned in ("ADMIN", "COMPANYADMIN"):
        return "Admin"
    if cleaned in ("AGENT", "SUPPORTAGENT", "SUPPORT"):
        return "Agent"
    if cleaned == "CUSTOMER":
        return "Customer"
    return "Customer"

# Setup standard bearer token extractor schema matching FastAPI standard routing dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class RoleChecker:
    """
    HTTP route guard that evaluates whether an authenticated user possesses 
    the necessary security clearances to interact with an endpoint.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [normalize_role(r) for r in allowed_roles]

    def __call__(self, token: str = Depends(oauth2_scheme)) -> dict:
        # Decode and verify the incoming token signature payload
        payload = JWTManager.decode_and_verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials or active session expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user_role = normalize_role(payload.get("role"))
        
        # Super Admin has root access to all protected endpoints
        if user_role == "SuperAdmin":
            return payload
            
        # Evaluate permissions matching against canonical roles
        if user_role in self.allowed_roles:
            return payload
        
        # Check authorization match
        logger.warning(f"Unauthorized access attempt blocked. User role '{user_role}' lacks access (allowed: {self.allowed_roles}).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Insufficient permissions for role '{user_role}'."
        )