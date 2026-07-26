from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.database import get_db
from app.database import models, schemas
from app.auth.password import PasswordHasher
from app.auth.jwt import JWTManager

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new helpdesk user, securely hashes their password, and saves the record.
    """
    # Prevent duplicate registrations
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Secure user provisioning details
    hashed_pass = PasswordHasher.hash_password(user_in.password)
    user_id = f"usr_{user_in.email.split('@')[0]}"

    new_user = models.User(
        id=user_id,
        email=user_in.email,
        hashed_password=hashed_pass,
        full_name=user_in.full_name,
        role=user_in.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authenticates plain text login credentials and returns a secure signed JWT.
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not PasswordHasher.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password combination.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue access tokens
    access_token_expires = timedelta(hours=8)
    token_payload = {"sub": user.email, "role": user.role}
    
    access_token = JWTManager.create_access_token(
        data=token_payload, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }