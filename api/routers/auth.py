import os
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

router = APIRouter(prefix="/api", tags=["Auth"])
security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Validate Team Credentials using direct bcrypt verification."""
    
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

    password_bytes = credentials.password.encode("utf-8")
    hash_bytes = stored_hash.encode("utf-8")

    if not bcrypt.checkpw(password_bytes, hash_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials

@router.get("/verify")
def verify_auth(credentials: HTTPBasicCredentials = Depends(verify_credentials)):
    """Lightweight endpoint to verify credentials during login."""
    return {"status": "ok"}
