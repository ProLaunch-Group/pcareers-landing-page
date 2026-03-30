from pydantic import BaseModel
from typing import List

class EventItem(BaseModel):
    name: str
    count: int
    sessions: int

class EventsResponse(BaseModel):
    status: str
    events: List[EventItem]

class LeadItem(BaseModel):
    name: str
    email: str
    phone: str
    timestamp: str
    niche: str
    interest: str
    source: str

class LeadsResponse(BaseModel):
    total_leads: int
    leads: List[LeadItem]

class DailyStatItem(BaseModel):
    date: str
    visitors: int
    new_users: int
    sessions: int
    event_count: int
    page_views: int
    avg_duration: float
    engagement_total: float
    # bounce_rate: float

class AnalyticsResponse(BaseModel):
    status: str
    daily_stats: List[DailyStatItem]
    total_sessions: int

class HealthResponse(BaseModel):
    status: str
    service: str
