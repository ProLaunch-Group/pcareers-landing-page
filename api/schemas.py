from typing import List
from pydantic import BaseModel, EmailStr, field_validator

class EventItem(BaseModel):
    name: str
    interactions: int  # eventCount
    unique_users: int  # totalUsers

class EventsResponse(BaseModel):
    status: str
    events: List[EventItem]

class AnalyticsTotals(BaseModel):
    active_users: int
    total_users: int
    sessions: int
    new_users: int
    page_views: int
    event_count: int
    avg_engagement_time: float

class CommunityLeadSubmission(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr       
    phone: str
    niche: str
    interest: str
    # source: Optional[str] = "Website"
 
    @field_validator("firstname", "lastname", "phone", "niche", "interest", mode="before")
    @classmethod
    def strip_and_require(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()
 
 
class CommunityLeadItem(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str
    interest: str
 
 
class CommunityLeadsResponse(BaseModel):
    total_leads: int
    leads: List[CommunityLeadItem]

class GroomingLeadSubmission(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr       
    phone: str
    niche: str
 
    @field_validator("firstname", "lastname", "phone", "niche", mode="before")
    @classmethod
    def strip_and_require(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()

class GroomingLeadItem(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str

class GroomingLeadsResponse(BaseModel):
    total_leads: int
    leads: List[GroomingLeadItem]


class CvRewriteLeadsSubmission(BaseModel):
    total_leads: int
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str

 
    @field_validator("firstname", "lastname", "phone", "niche", mode="before")
    @classmethod
    def strip_and_require(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()

class CvRewriteLeadItem(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str

class CvRewriteLeadsResponse(BaseModel):
    total_leads: int
    leads: List[CVRewriteLeadItem]

class LinkedinLeadsSubmission(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone: str
    niche: str
 
    @field_validator("firstname", "lastname", "phone", "niche", mode="before")
    @classmethod
    def strip_and_require(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()
 
 
class LinkedinLeadItem(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str
 
 
class LinkedinLeadsResponse(BaseModel):
    total_leads: int
    leads: List[LinkedinLeadItem]

class PortfolioLeadsSubmission(BaseModel):
    """
    Payload accepted from the Portfolio landing page form.
    - `total_leads` removed — that belongs on response models, not submissions
    - `timestamp` removed — server stamps it on arrival
    """
    firstname: str
    lastname: str
    email: EmailStr
    phone: str
    niche: str
 
    @field_validator("firstname", "lastname", "phone", "niche", mode="before")
    @classmethod
    def strip_and_require(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()
 
 
class PortfolioLeadItem(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str
    timestamp: str
    niche: str
 
 
class PortfolioLeadsResponse(BaseModel):
    total_leads: int
    leads: List[PortfolioLeadItem]

class DailyStatItem(BaseModel):
    date: str
    active_users: int
    total_users: int
    new_users: int
    sessions: int
    event_count: int
    page_views: int
    avg_duration: float
    engagement_total: float

class AnalyticsResponse(BaseModel):
    status: str
    daily_stats: List[DailyStatItem]
    totals: AnalyticsTotals

class HealthResponse(BaseModel):
    status: str
    service: str
