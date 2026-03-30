from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load sub-routers
from api.routers import auth, leads, analytics
from api.schemas import HealthResponse

load_dotenv()  # This loads the variables from your .env file

app = FastAPI(title="ProLaunch Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allows any "origin" (including your local file) to talk to the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(analytics.router)

# ─── Health check ─────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "service": "ProLaunch Monitor API"}
