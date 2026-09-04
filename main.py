from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api import score, auth, history, admin, questionnaire
import os

app = FastAPI(title="Green Score AI Backend")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các router
app.include_router(score.router, prefix="/api/score", tags=["Score"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(questionnaire.router, prefix="/api/questionnaire", tags=["Questionnaire"])

# Serve React frontend (chỉ khi đã build - khi deploy production)
FRONTEND_DIST = "frontend/dist"
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(f"{FRONTEND_DIST}/index.html")
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to GreenScore AI API"}
