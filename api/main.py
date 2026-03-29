import os
import json
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
    allow_origins=["*"], # Allows any "origin" (including your local file) to talk to the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ─────────────────────────────────────────────────
# Hardcoded for internal team access as requested
ADMIN_USER = "admin"
ADMIN_PASS = "prolaunch2026"


def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Validate HTTP Basic Auth using timing-safe comparison."""
    username_ok = secrets.compare_digest(
        credentials.username.encode("utf-8"),
        ADMIN_USER.encode("utf-8"),
    )
    password_ok = secrets.compare_digest(
        credentials.password.encode("utf-8"),
        ADMIN_PASS.encode("utf-8"),
    )
    if not (username_ok and password_ok):
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
    """
    Fetch active users (visitors) and sessions from GA4 for the last 7 days.
    """
    gac = os.environ.get("GA4_SERVICE_ACCOUNT_JSON", "")
    property_id = os.environ.get("GA4_PROPERTY_ID", "")

    if not gac or not property_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_APPLICATION_CREDENTIALS and GA4_PROPERTY_ID environment variables are missing.",
        )

    try:
        # Handle stringified JSON from Vercel env var or file path
        if gac.strip().startswith("{") and gac.strip().endswith("}"):
            json_creds = json.loads(gac)
            creds = service_account.Credentials.from_service_account_info(json_creds)
            client = BetaAnalyticsDataClient(credentials=creds)
        else:
            # Fallback for local development if it's a file path
            client = BetaAnalyticsDataClient()

        request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[Dimension(name="date")],
            metrics=[Metric(name="activeUsers"), Metric(name="sessions")],
            date_ranges=[DateRange(start_date="6daysAgo", end_date="today")],
        )
        response = client.run_report(request)

        # Parse data
        from datetime import datetime

        daily_stats = []

        for row in response.rows:
            date_str = row.dimension_values[0].value
            # GA4 returns date as YYYYMMDD, convert to YYYY-MM-DD
            formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"

            visitors = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)

            daily_stats.append(
                {"date": formatted_date, "visitors": visitors, "sessions": sessions}
            )

        # Sort chronologically
        daily_stats.sort(key=lambda x: x["date"])

        return {"status": "ok", "daily_stats": daily_stats}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch from Google Analytics 4: {str(e)}",
        )


# ─── Health check ─────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ProLaunch Monitor API"}
