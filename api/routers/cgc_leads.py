import os
import json
import logging
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/cgc-interest", tags=["cgc-leads"])
logger = logging.getLogger("cgc_leads")

LEADS_DIR = Path(__file__).resolve().parent.parent.parent / "leads"
LEADS_FILE = LEADS_DIR / "cgc_interest_leads.jsonl"


class CGCInterestPayload(BaseModel):
    full_name: str
    email: str
    whatsapp: str
    location: str
    niche: str
    experience: str
    aware_date: str
    aware_cost: str
    readiness: str
    source_page: Optional[str] = "/cgc"


@router.post("")
async def submit_cgc_interest(payload: CGCInterestPayload):
    # 1. Ensure local backup storage exists
    LEADS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%m/%d/%Y %H:%M:%S")
    record = {
        "timestamp": timestamp,
        "email": payload.email.strip(),
        "full_name": payload.full_name.strip(),
        "confirm_email": payload.email.strip(),
        "location": payload.location.strip(),
        "whatsapp": payload.whatsapp.strip(),
        "niche": payload.niche.strip(),
        "experience": payload.experience.strip(),
        "aware_date": payload.aware_date.strip(),
        "aware_cost": payload.aware_cost.strip(),
        "readiness": payload.readiness.strip(),
        "status": "Pending Support Follow-up",
        "source_page": payload.source_page
    }

    try:
        with open(LEADS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as e:
        logger.error(f"Error logging CGC lead locally: {e}")

    # 2. Forward to Google Sheet Webhook if configured
    sheet_webhook = os.getenv("CGC_SHEET_WEBHOOK_URL")
    if sheet_webhook:
        try:
            req_data = json.dumps(record).encode("utf-8")
            req = urllib.request.Request(
                sheet_webhook,
                data=req_data,
                headers={"Content-Type": "application/json", "User-Agent": "ProLaunch-Backend/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                logger.info(f"Google Sheet Webhook response: {resp.status}")
        except Exception as e:
            logger.error(f"Failed to post to Google Sheet Webhook: {e}")

    # 3. Forward to Zapier Webhook if configured
    zapier_webhook = os.getenv("ZAPIER_WEBHOOK_URL")
    if zapier_webhook:
        try:
            req_data = json.dumps(record).encode("utf-8")
            req = urllib.request.Request(
                zapier_webhook,
                data=req_data,
                headers={"Content-Type": "application/json", "User-Agent": "ProLaunch-Backend/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                logger.info(f"Zapier Webhook response: {resp.status}")
        except Exception as e:
            logger.error(f"Failed to post to Zapier Webhook: {e}")

    return {
        "status": "success",
        "message": "Interest recorded successfully. Customer support will follow up.",
        "record": record
    }
