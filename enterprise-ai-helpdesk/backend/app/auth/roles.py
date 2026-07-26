import logging
from typing import List
from fastapi import HTTPException, status, Depends
from app.auth.jwt import JWTManager
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger("app.auth.roles")

# Setup standard bearer token extractor schema matching FastAPI standard routing dependencies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class RoleChecker:
    """
    HTTP route guard that evaluates whether an authenticated user possesses 
    the necessary security clearances to interact with an endpoint.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, token: str = Depends(oauth2_scheme)) -> dict:
        # Decode and verify the incoming token signature payload
        payload = JWTManager.decode_and_verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials or active session expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user_role = payload.get("role", "Customer")
        user_role_upper = user_role.upper()
        
        # Super Admin has root access to all protected endpoints
        if user_role_upper in ["SUPER_ADMIN", "SUPERADMIN"]:
            return payload
            
        # Evaluate permissions matching
        is_authorized = False
        for allowed in self.allowed_roles:
            a_upper = allowed.upper()
            if a_upper in ["SUPER_ADMIN", "SUPERADMIN"]:
                if user_role_upper in ["SUPER_ADMIN", "SUPERADMIN"]:
                    is_authorized = True
                    break
            elif a_upper in ["ADMIN", "COMPANY_ADMIN", "COMPANYADMIN"]:
                if user_role_upper in ["ADMIN", "COMPANY_ADMIN", "COMPANYADMIN"]:
                    is_authorized = True
                    break
            elif a_upper in ["AGENT", "SUPPORT_AGENT", "SUPPORTAGENT"]:
                if user_role_upper in ["AGENT", "SUPPORT_AGENT", "SUPPORTAGENT"]:
                    is_authorized = True
                    break
            elif a_upper == "CUSTOMER":
                if user_role_upper == "CUSTOMER":
                    is_authorized = True
                    break
            elif user_role_upper == a_upper:
                is_authorized = True
                break
        
        # Check authorization match
        if not is_authorized:
            logger.warning(f"Unauthorized access attempt blocked. User role '{user_role}' lacks access.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have administrative permission to complete this action."
            )
            
        return payload