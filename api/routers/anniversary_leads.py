import os
import json
import logging
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/anniversary-rsvp", tags=["anniversary-leads"])
logger = logging.getLogger("anniversary_leads")

LEADS_DIR = Path(__file__).resolve().parent.parent.parent / "leads"
LEADS_FILE = LEADS_DIR / "anniversary_leads.jsonl"


class AnniversaryRSVPPayload(BaseModel):
    full_name: str
    email: str
    whatsapp: str
    career_stage: Optional[str] = "Community Member"
    event_topic: Optional[str] = "Getting Hired is Only the Beginning: Build a Career That Creates Opportunities"
    event_date: Optional[str] = "2026-10-31 19:00 WAT"
    source: Optional[str] = "/anniversary"


@router.post("")
async def submit_anniversary_rsvp(payload: AnniversaryRSVPPayload):
    # 1. Ensure local backup directory exists
    LEADS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%m/%d/%Y %H:%M:%S")
    record = {
        "timestamp": timestamp,
        "full_name": payload.full_name.strip(),
        "email": payload.email.strip(),
        "whatsapp": payload.whatsapp.strip(),
        "career_stage": payload.career_stage.strip(),
        "event_topic": payload.event_topic,
        "event_date": payload.event_date,
        "source": payload.source,
        "giveaway_eligible": True,
        "status": "RSVP Confirmed"
    }

    try:
        with open(LEADS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as e:
        logger.error(f"Error logging anniversary lead locally: {e}")

    # 2. Forward to Zapier Webhook if set
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
        "message": "Anniversary RSVP received and entered into giveaway draw.",
        "record": record
    }
