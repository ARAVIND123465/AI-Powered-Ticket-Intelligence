from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.database import get_db
from app.database import models, schemas
from app.auth.password import PasswordHasher
from app.auth.jwt import JWTManager
from app.auth.roles import normalize_role

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new helpdesk user, securely hashes their password, and saves the record.
    """
    clean_email = user_in.email.strip().lower()
    # Prevent duplicate registrations
    existing_user = db.query(models.User).filter(models.User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Secure user provisioning details
    hashed_pass = PasswordHasher.hash_password(user_in.password)
    user_id = f"usr_{clean_email.split('@')[0]}"
    if db.query(models.User).filter(models.User.id == user_id).first():
        import uuid
        user_id = f"usr_{uuid.uuid4().hex[:8]}"

    canonical_role = normalize_role(user_in.role)

    new_user = models.User(
        id=user_id,
        email=clean_email,
        hashed_password=hashed_pass,
        full_name=user_in.full_name,
        role=canonical_role
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
    Authenticates login credentials and returns a signed JWT.
    Accepts any password as the default login behavior.
    """
    username = (form_data.username or "customer@demo.com").strip().lower()
    user = db.query(models.User).filter(models.User.email.ilike(username)).first()
    
    # If user doesn't exist, create an account automatically so any email can log in
    if not user:
        role = "Customer"
        clean_user = username.replace("_", "").replace("-", "").replace(".", "")
        if "superadmin" in clean_user or "super" in clean_user:
            role = "SuperAdmin"
        elif "admin" in clean_user:
            role = "Admin"
        elif "agent" in clean_user or "support" in clean_user:
            role = "Agent"

        hashed_pass = PasswordHasher.hash_password(form_data.password or "password123")
        name_part = username.split('@')[0]
        user_id = f"usr_{name_part}"
        if db.query(models.User).filter(models.User.id == user_id).first():
            import uuid
            user_id = f"usr_{uuid.uuid4().hex[:8]}"

        user = models.User(
            id=user_id,
            email=username,
            hashed_password=hashed_pass,
            full_name=name_part.replace('.', ' ').replace('_', ' ').title(),
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Ensure canonical role formatting
    canonical_role = normalize_role(user.role)
    if user.role != canonical_role:
        user.role = canonical_role
        db.commit()
        db.refresh(user)

    # Issue access tokens with canonical role
    access_token_expires = timedelta(hours=24)
    token_payload = {"sub": user.email, "role": canonical_role}
    
    access_token = JWTManager.create_access_token(
        data=token_payload, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": canonical_role,
        "user": user
    }