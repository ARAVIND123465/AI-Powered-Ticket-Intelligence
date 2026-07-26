from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "Customer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- TICKET SCHEMAS ---
class TicketBase(BaseModel):
    title: str
    description: str

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None

class TicketResponse(TicketBase):
    id: str
    user_id: str
    status: str
    category: Optional[str] = None
    priority: Optional[str] = None
    sentiment: Optional[str] = None
    is_duplicate: bool
    escalate_recommended: bool
    ai_root_cause: Optional[str] = None
    ai_suggested_resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- AUTHENTICATION SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None