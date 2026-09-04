import os
import logging
from datetime import datetime, timezone
import requests
from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["PMI Applications"])

AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY", "")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appblPsnT3qBzA9yR")
AIRTABLE_WEBHOOK_URL = os.getenv("AIRTABLE_WEBHOOK_URL", "https://hooks.airtable.com/workflows/v1/genericWebhook/appblPsnT3qBzA9yR/wfliC6eLGKglaS2wz/wtr5ufD9XvD2lRTIM")
AIRTABLE_MENTEES_TABLE = os.getenv("AIRTABLE_MENTEES_TABLE", "Mentees")
AIRTABLE_MENTORS_TABLE = os.getenv("AIRTABLE_MENTORS_TABLE", "Mentors")

@router.post("/pmi-application", status_code=201)
async def submit_pmi_application(request: Request):
    """
    Accepts PMI application submissions (Mentee or Mentor) and syncs to Airtable.
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    role = data.get("role", "mentee")
    fields = data.get("fields", {})
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # 1. Forward to Airtable Webhook if configured
    if AIRTABLE_WEBHOOK_URL:
        try:
            requests.post(AIRTABLE_WEBHOOK_URL, json=data, timeout=10)
        except Exception as exc:
            logger.warning("Failed forwarding to Airtable webhook: %s", exc)

    # 2. Direct Airtable REST API if credentials exist
    if AIRTABLE_API_KEY and AIRTABLE_BASE_ID:
        table_name = AIRTABLE_MENTORS_TABLE if role == "mentor" else AIRTABLE_MENTEES_TABLE
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{table_name}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "records": [
                {
                    "fields": fields
                }
            ],
            "typecast": True
        }
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code >= 400:
                logger.error("Airtable API error (%s): %s", res.status_code, res.text)
            else:
                logger.info("Successfully created Airtable record in %s: %s", table_name, res.json())
        except Exception as exc:
            logger.error("Airtable connection error: %s", exc)

    return {
        "status": "success",
        "role": role,
        "timestamp": timestamp
    }
