from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routers import auth, community_leads, grooming_leads, cv_rewrite_leads, linkedin_leads, portfolio_leads
from api.schemas import HealthResponse

app = FastAPI(title="ProLaunch Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(community_leads.router)
app.include_router(grooming_leads.router)
app.include_router(cv_rewrite_leads.router)
app.include_router(linkedin_leads.router)
app.include_router(portfolio_leads.router)
@app.get("/api/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "service": "ProLaunch Monitor API"}