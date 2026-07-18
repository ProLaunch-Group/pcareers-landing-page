import os
import json
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasicCredentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2 import service_account

from api.routers.auth import verify_credentials
from api.schemas import AnalyticsResponse, EventsResponse

router = APIRouter(prefix="/api", tags=["Analytics"])

def _get_ga4_range(period: str):
    if period == "today":
        return DateRange(start_date="today", end_date="today")
    if period == "yesterday":
        return DateRange(start_date="yesterday", end_date="yesterday")
    # Default: since official launch Mar 31
    return DateRange(start_date="2026-03-31", end_date="today")

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(period: str = "cumulative", credentials: HTTPBasicCredentials = Depends(verify_credentials)):
    gac = os.environ.get("GA4_SERVICE_ACCOUNT_JSON", "")
    property_id = os.environ.get("GA4_PROPERTY_ID", "")

    if not gac or not property_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Environment variables missing.",
        )

    try:
        json_creds = json.loads(gac)
        creds = service_account.Credentials.from_service_account_info(json_creds)
        client = BetaAnalyticsDataClient(credentials=creds)

        date_range = _get_ga4_range(period)
        
        # ─── New: Shared Metrics List ───
        metrics = [
            Metric(name="activeUsers"),
            Metric(name="totalUsers"),
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="eventCount"),
            Metric(name="screenPageViews"),
            Metric(name="userEngagementDuration"),
        ]

        # ─── Query 1: Daily Stats (with dimensions) ───
        daily_request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="date")],
            metrics=metrics,
            date_ranges=[date_range],
        )

        # ─── Query 2: Totals (NO dimensions = accurate deduplication) ───
        total_request = RunReportRequest(
            property=f"properties/{property_id}",
            metrics=metrics,
            date_ranges=[date_range],
        )

        daily_response = client.run_report(daily_request)
        total_response = client.run_report(total_request)

        daily_stats = []
        for row in daily_response.rows:
            date_str = row.dimension_values[0].value
            formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
            
            # Map metrics: activeUsers(0), totalUsers(1), newUsers(2), sessions(3), eventCount(4), screenPageViews(5), userEngagementDuration(6)
            active_users = int(row.metric_values[0].value)
            engagement_time = float(row.metric_values[6].value)
            
            daily_stats.append(
                {
                    "date": formatted_date,
                    "active_users": active_users,
                    "total_users": int(row.metric_values[1].value),
                    "new_users": int(row.metric_values[2].value),
                    "sessions": int(row.metric_values[3].value),
                    "event_count": int(row.metric_values[4].value),
                    "page_views": int(row.metric_values[5].value),
                    "avg_duration": round(engagement_time / active_users, 2) if active_users > 0 else 0,
                    "engagement_total": engagement_time,
                }
            )

        daily_stats.sort(key=lambda x: x["date"])

        # ─── Parse Totals ───
        t_row = total_response.rows[0] if total_response.rows else None
        if t_row:
            t_active = int(t_row.metric_values[0].value)
            t_engagement = float(t_row.metric_values[6].value)
            
            totals = {
                "active_users": t_active,
                "total_users": int(t_row.metric_values[1].value),
                "new_users": int(t_row.metric_values[2].value),
                "sessions": int(t_row.metric_values[3].value),
                "event_count": int(t_row.metric_values[4].value),
                "page_views": int(t_row.metric_values[5].value),
                "avg_engagement_time": round(t_engagement / t_active, 2) if t_active > 0 else 0,
            }
        else:
            totals = {
                "active_users": 0, "total_users": 0, "new_users": 0, "sessions": 0, 
                "event_count": 0, "page_views": 0, "avg_engagement_time": 0
            }

        return {"status": "ok", "daily_stats": daily_stats, "totals": totals}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GA4 Error: {str(e)}",
        )


@router.get("/events", response_model=EventsResponse)
def get_events(period: str = "cumulative", credentials: HTTPBasicCredentials = Depends(verify_credentials)):
    gac = os.environ.get("GA4_SERVICE_ACCOUNT_JSON", "")
    property_id = os.environ.get("GA4_PROPERTY_ID", "")

    if not gac or not property_id:
        return {"status": "ok", "events": []}

    try:
        json_creds = json.loads(gac)
        creds = service_account.Credentials.from_service_account_info(json_creds)
        client = BetaAnalyticsDataClient(credentials=creds)

        request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount"), Metric(name="totalUsers")],
            date_ranges=[_get_ga4_range(period)],
        )
        response = client.run_report(request)

        # ─── New: High-Intent Event Mapping with Normalization ───
        PRIORITY_MAP = {
            "lead_form_submitted": "Form Submitted",
            "form_submitted": "Form Submitted",
            "form_submit": "Form Submitted",
            "Form Submit": "Form Submitted",
            "open_registration_modal": "Intent (Opened Form)",
            "click_cv_tool": "AI CV Tool Usage",
            "scroll": "Page Reads",
            "form_start": "Form Started"
        }

        # 1. Initialize our Priority Events with 0
        events_dict = {v: {"interactions": 0, "unique_users": 0} for v in set(PRIORITY_MAP.values())}

        # 2. Fill in the actual counts from GA4
        for row in response.rows:
            name = row.dimension_values[0].value
            interactions = int(row.metric_values[0].value)
            unique_users = int(row.metric_values[1].value)

            if name in PRIORITY_MAP:
                clean_name = PRIORITY_MAP[name]
                # Increment to allow consolidation of similar events
                events_dict[clean_name]["interactions"] += interactions
                events_dict[clean_name]["unique_users"] += unique_users
            elif name not in ["session_start", "first_visit", "user_engagement"]:
                clean_name = name.replace("_", " ").title()
                if clean_name not in events_dict:
                    events_dict[clean_name] = {"interactions": 0, "unique_users": 0}
                events_dict[clean_name]["interactions"] += interactions
                events_dict[clean_name]["unique_users"] += unique_users

        # 3. Convert to list and ensure Priority Events are ALWAYS at the top
        final_events = [
            {"name": k, "interactions": v["interactions"], "unique_users": v["unique_users"]} 
            for k, v in events_dict.items()
        ]
        
        # Sort so highest counts are first
        final_events.sort(key=lambda x: x["interactions"], reverse=True)
        
        return {"status": "ok", "events": final_events[:10]}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GA4 Events Error: {str(e)}",
        )
