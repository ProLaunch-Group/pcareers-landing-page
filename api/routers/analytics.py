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

        # ─── 1. Updated Request with New Metrics ───
        request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="date")],
            metrics=[
                Metric(name="activeUsers"),
                Metric(name="newUsers"),
                Metric(name="sessions"),
                Metric(name="eventCount"),
                Metric(name="screenPageViews"),
                Metric(name="averageSessionDuration"),
                Metric(name="userEngagementDuration"),
                Metric(name="bounceRate"),
            ],
            # Dynamic date range based on period query param
            date_ranges=[_get_ga4_range(period)],
        )

        response = client.run_report(request)
        daily_stats = []

        # ─── 2. Updated Parsing Logic ───
        for row in response.rows:
            date_str = row.dimension_values[0].value
            formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"

            # Map values based on the Metric() list order above
            daily_stats.append(
                {
                    "date": formatted_date,
                    "visitors": int(row.metric_values[0].value),  # activeUsers
                    "new_users": int(row.metric_values[1].value),  # newUsers
                    "sessions": int(row.metric_values[2].value),  # sessions
                    "event_count": int(row.metric_values[3].value),  # eventCount
                    "page_views": int(row.metric_values[4].value),  # screenPageViews
                    "avg_duration": round(float(row.metric_values[5].value), 2),  # averageSessionDuration
                    "engagement_total": float(row.metric_values[6].value),  # userEngagementDuration
                    "bounce_rate": round(float(row.metric_values[7].value) * 100, 1),  # bounceRate
                }
            )

        daily_stats.sort(key=lambda x: x["date"])

        # Calculate simple Conversion Rate for the "Week 2" summary
        total_sessions = sum(d["sessions"] for d in daily_stats)

        return {"status": "ok", "daily_stats": daily_stats, "total_sessions": total_sessions}

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
            metrics=[Metric(name="eventCount"), Metric(name="sessions")],
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
        events_dict = {v: {"count": 0, "sessions": 0} for v in set(PRIORITY_MAP.values())}

        # 2. Fill in the actual counts from GA4
        for row in response.rows:
            name = row.dimension_values[0].value
            count = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)

            if name in PRIORITY_MAP:
                clean_name = PRIORITY_MAP[name]
                # Increment to allow consolidation of similar events
                events_dict[clean_name]["count"] += count
                events_dict[clean_name]["sessions"] += sessions
            elif name not in ["session_start", "first_visit", "user_engagement"]:
                clean_name = name.replace("_", " ").title()
                if clean_name not in events_dict:
                    events_dict[clean_name] = {"count": 0, "sessions": 0}
                events_dict[clean_name]["count"] += count
                events_dict[clean_name]["sessions"] += sessions

        # 3. Convert to list and ensure Priority Events are ALWAYS at the top
        final_events = [{"name": k, "count": v["count"], "sessions": v["sessions"]} for k, v in events_dict.items()]
        
        # Sort so highest counts are first, but Priority Events exist
        final_events.sort(key=lambda x: x["count"], reverse=True)
        
        return {"status": "ok", "events": final_events[:10]}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GA4 Events Error: {str(e)}",
        )
