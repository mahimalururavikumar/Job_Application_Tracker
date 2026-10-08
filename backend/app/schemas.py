from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, List, Dict
from datetime import date, datetime

# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

# Job Application Schemas
class ApplicationBase(BaseModel):
    company: str
    role: str
    link: Optional[str] = None
    status: str = "Applied" # Wishlist, Applied, Interview, Offer, Rejected
    date_applied: date
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    link: Optional[str] = None
    status: Optional[str] = None
    date_applied: Optional[date] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedApplications(BaseModel):
    items: List[ApplicationResponse]
    total: int
    page: int
    limit: int
    pages: int

# Analytics Schemas
class StatusCount(BaseModel):
    status: str
    count: int

class MonthlyApplicationCount(BaseModel):
    month: str
    count: int

class AnalyticsSummary(BaseModel):
    total_applications: int
    status_counts: Dict[str, int]
    response_rate: float
    interview_rate: float
    overdue_follow_ups: int
    monthly_trend: List[MonthlyApplicationCount]
