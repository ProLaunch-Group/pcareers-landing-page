from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

from api.routers import auth
from api.schemas import HealthResponse

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"

app = FastAPI(title="ProLaunch Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/api/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "service": "ProLaunch Monitor API"}

@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not Found")

    candidate = PUBLIC_DIR / full_path
    if candidate.is_dir():
        candidate = candidate / "index.html"

    if candidate.is_file():
        return FileResponse(candidate)

    if not Path(full_path).suffix:
        html_candidate = PUBLIC_DIR / f"{full_path}.html"
        if html_candidate.is_file():
            return FileResponse(html_candidate)

    if full_path in {"", "."}:
        return FileResponse(PUBLIC_DIR / "index.html")

    return FileResponse(PUBLIC_DIR / "index.html")