import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasicCredentials
from googleapiclient.discovery import build

from api.routers.auth import verify_credentials
from api.schemas import LeadsResponse

router = APIRouter(prefix="/api", tags=["Leads"])

@router.get("/leads", response_model=LeadsResponse)
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
