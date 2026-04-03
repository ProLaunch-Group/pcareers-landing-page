from pydantic import BaseModel
from typing import List

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
