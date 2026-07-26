from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models, schemas
from app.auth.roles import RoleChecker

router = APIRouter(prefix="/users", tags=["Users"])

# Define explicit role dependencies matching your security clearances
admin_guard = RoleChecker(allowed_roles=["Admin"])
all_authenticated_guard = RoleChecker(allowed_roles=["Customer", "Agent", "Admin"])

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user_claim: dict = Depends(all_authenticated_guard), 
    db: Session = Depends(get_db)
):
    """
    Retrieves the contextual profile details belonging to the actively logged-in identity token.
    """
    user_email = current_user_claim.get("sub")
    user = db.query(models.User).filter(models.User.email == user_email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User identity record no longer active in database store."
        )
    return user


@router.get("/", response_model=List[schemas.UserResponse])
def get_all_users_list(
    admin_claim: dict = Depends(admin_guard), 
    db: Session = Depends(get_db)
):
    """
    Administrative endpoint used to audit all accounts registered inside the enterprise ecosystem.
    """
    users = db.query(models.User).all()
    return users