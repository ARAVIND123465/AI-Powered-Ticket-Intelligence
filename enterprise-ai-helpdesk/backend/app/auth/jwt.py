import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt
from app.core.config import settings

logger = logging.getLogger("app.auth.jwt")

# Algorithmic signature fallback standard for enterprise tokens
ALGORITHM = "HS256"

class JWTManager:
    """
    Central cryptographical suite for handling JSON Web Token signing, 
    decoding, and systemic security verification.
    """
    
    @classmethod
    def create_access_token(cls, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Signs a secure token with user identification keys and metadata claims.
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            # Default to a safe 8-hour shift lifespan standard if omitted
            expire = datetime.utcnow() + timedelta(hours=8)
            
        to_encode.update({"exp": expire})
        
        secret_key = getattr(settings, "SECRET_KEY", "SUPER_SECRET_SANDBOX_KEY_DO_NOT_USE_IN_PROD")
        encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
        return encoded_jwt

    @classmethod
    def decode_and_verify_token(cls, token: str) -> Optional[Dict[str, Any]]:
        """
        Decodes incoming HTTP token strings, verifying timestamp expiration 
        and key authenticity.
        """
        try:
            secret_key = getattr(settings, "SECRET_KEY", "SUPER_SECRET_SANDBOX_KEY_DO_NOT_USE_IN_PROD")
            payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
            
            # Check if user subject exists within token boundaries
            if payload.get("sub") is None:
                return None
                
            return payload
            
        except JWTError as e:
            logger.warning(f"Failed JWT verification sequence: {str(e)}")
            return None

# FastAPI dependency helper to retrieve the logged-in User
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import models
from app.database.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    Decodes the active token from the request header, verifies it,
    and returns the corresponding database User record.
    """
    payload = JWTManager.decode_and_verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or active session expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = (payload.get("sub") or "").strip().lower()
    user = db.query(models.User).filter(models.User.email.ilike(email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return user