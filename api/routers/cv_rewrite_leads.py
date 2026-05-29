import os
import logging
from datetime import datetime, timezone

import requests
from fastapi import APIRouter, HTTPException

from api.schemas import CvRewriteLeadsSubmission, CvRewriteLeadItem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["CvRewrite Leads"])

# ─── Configuration ────────────────────────────────────────────────────────────

HUBSPOT_ACCESS_TOKEN = os.getenv("HUBSPOT_ACCESS_TOKEN")
HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts"

if not HUBSPOT_ACCESS_TOKEN:
    raise RuntimeError(
        "HUBSPOT_ACCESS_TOKEN is not set. "
        "Add it to your .env file or environment before starting the server."
    )

# ─── HubSpot CvRewrite Object Creation helper ───────────────────────────────────────────────────────────
def create_hubspot_cvrewrite_lead(contact: CvRewriteLeadsSubmission, timestamp: str) -> dict:
    """
    POST a new cvrewrite lead to HubSpot CRM.
    """
    headers = {
        "Authorization": f"Bearer {HUBSPOT_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "properties": {
            "firstname":   contact.firstname,
            "lastname":    contact.lastname,
            "email":       contact.email,
            "phone":       contact.phone,
            "niche":       contact.niche,
            "lead_source":       "LinkedIn",
            "form_submitted_at": timestamp,
        }
    }

    try:
        response = requests.post(HUBSPOT_CVREWRITE_API_URL, json=payload, headers=headers, timeout=10)
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="HubSpot API timed out. Try again.")
    except requests.exceptions.RequestException as exc:
        logger.error("HubSpot request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach HubSpot API.")

        if response.status_code == 409:
            raise HTTPException(
                status_code=409,
                detail="A user with this email already exists.",
            )

    if response.status_code >= 400:
        logger.error("HubSpot error %s: %s", response.status_code, response.text)
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json(),
        )

    return response.json()

    # ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/cvrewrite-form-submit", status_code=201)
def submit_form(contact: CvRewriteLeadsSubmission):
    """
    Accept a landing page form submission as a json file and create cvrewrite lead in HubSpot CRM.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    hubspot_response = create_hubspot_cvrewrite_lead(contact, timestamp)

    return {
        "status": "success",
        "hubspot_id": hubspot_response.get("id"),
        "timestamp": timestamp,
    }