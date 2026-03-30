import os
import json
import bcrypt
import secrets
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from googleapiclient.discovery import build
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)


from google.oauth2 import service_account

from dotenv import load_dotenv


load_dotenv()  # This loads the variables from your .env file

app = FastAPI(title="ProLaunch Monitor API")
security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allows any "origin" (including your local file) to talk to the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ─────────────────────────────────────────────────


def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Validate Team Credentials using direct bcrypt verification."""
    
    # Refresh/get environment variables to ensure we match the current .env state
    TEAM_ACCOUNTS = {
        "root": os.getenv("HASH_ROOT"),
        "sales": os.getenv("HASH_SALES"),
        "operations": os.getenv("HASH_OPS")
    }

    username = credentials.username.lower()
    stored_hash = TEAM_ACCOUNTS.get(username)

    if not stored_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    # Convert the input password and stored hash to bytes for bcrypt
    password_bytes = credentials.password.encode("utf-8")
    hash_bytes = stored_hash.encode("utf-8")

    # Verify: bcrypt.checkpw(password, hashed_password)
    if not bcrypt.checkpw(password_bytes, hash_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials


@app.get("/api/verify")
def verify_auth(credentials: HTTPBasicCredentials = Depends(verify_credentials)):
    """Lightweight endpoint to verify credentials during login."""
    return {"status": "ok"}


# ─── Leads endpoint ──────────────────────────────────────
@app.get("/api/leads")
def get_leads(credentials: HTTPBasicCredentials = Depends(verify_credentials)):
    """
    Fetch lead data from Google Sheets.
    Correctly maps 'First Name', 'Last Name', and 'Whatsapp Number'.
    """
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    sheet_id = os.environ.get("GOOGLE_SHEET_ID", "")
    tab_name = os.environ.get("SHEET_TAB_NAME", "Sheet1")

    if not api_key or not sheet_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_API_KEY and GOOGLE_SHEET_ID environment variables are missing.",
        )

    try:
        service = build("sheets", "v4", developerKey=api_key)
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=sheet_id, range=tab_name)
            .execute()
        )
        rows = result.get("values", [])

        if len(rows) < 2:
            return {"total_leads": 0, "leads": []}

        # Normalize headers to lowercase and remove spaces for flexible matching
        # "Whatsapp Number" becomes "whatsapp number"
        headers = [h.lower().strip() for h in rows[0]]
        leads = []

        for row in rows[1:]:
            obj = {}
            for i, h in enumerate(headers):
                obj[h] = row[i] if i < len(row) else ""

            # Combine names for cleaner UI
            first = obj.get("first name", "").strip()
            last = obj.get("last name", "").strip()
            full_name = f"{first} {last}".strip() or "Unknown Lead"

            leads.append(
                {
                    "name": full_name,
                    "email": obj.get("email") or "—",
                    "phone": obj.get("whatsapp number") or obj.get("whatsapp") or "—",
                    "timestamp": obj.get("timestamp") or obj.get("date") or "—",
                    # Business intelligence fields
                    "niche": obj.get("niche") or "General",
                    "interest": obj.get("interest") or "Inquiry",
                    "source": obj.get("source") or "Direct",
                }
            )

        # Newest leads first
        leads.reverse()

        return {"total_leads": len(leads), "leads": leads}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch from Google Sheets: {str(e)}",
        )


# ─── GA4 Analytics endpoint ────────────────────────────────
@app.get("/api/analytics")
def get_analytics(credentials: HTTPBasicCredentials = Depends(verify_credentials)):
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
            # Expanded to 30 days for better trend lines
            date_ranges=[DateRange(start_date="2026-03-30", end_date="today")],
        )

        response = client.run_report(request)
        daily_stats = []

        # ─── 2. Updated Parsing Logic ───
        # ─── 2. Updated Parsing Logic (Ordered Correcty) ───
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
                    "avg_duration": round(
                        float(row.metric_values[5].value), 2
                    ),  # averageSessionDuration
                    "engagement_total": float(
                        row.metric_values[6].value
                    ),  # userEngagementDuration
                    "bounce_rate": round(
                        float(row.metric_values[7].value) * 100, 1
                    ),  # bounceRate
                }
            )

        daily_stats.sort(key=lambda x: x["date"])
        return {"status": "ok", "daily_stats": daily_stats}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GA4 Error: {str(e)}",
        )


# ─── GA4 Events endpoint ──────────────────────────────────
@app.get("/api/events")
def get_events(credentials: HTTPBasicCredentials = Depends(verify_credentials)):
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
            metrics=[Metric(name="eventCount")],
            date_ranges=[DateRange(start_date="2026-03-30", end_date="today")],
        )
        response = client.run_report(request)

        events_dict = {}
        for row in response.rows:
            name = row.dimension_values[0].value
            count = int(row.metric_values[0].value)
            # Filter internal noise if desired (e.g. session_start, first_visit)
            if name not in ["session_start", "first_visit"]:
                events_dict[name] = count

        # Sort desc
        sorted_ev = sorted(events_dict.items(), key=lambda x: x[1], reverse=True)
        top_events = [
            {"name": k.replace("_", " ").title(), "count": v} for k, v in sorted_ev[:6]
        ]

        return {"status": "ok", "events": top_events}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GA4 Events Error: {str(e)}",
        )


# ─── Health check ─────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ProLaunch Monitor API"}
