from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.api import score, auth, history, admin, questionnaire
import os

app = FastAPI(title="Green Score AI Backend", redirect_slashes=True)

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

    # Dùng middleware để serve SPA - không can thiệp vào API routes
    class SPAMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            response = await call_next(request)
            # Nếu là 404 và KHÔNG phải API route → serve index.html cho React Router
            if response.status_code == 404 and not request.url.path.startswith("/api"):
                index_path = f"{FRONTEND_DIST}/index.html"
                if os.path.exists(index_path):
                    return FileResponse(index_path)
            return response

    app.add_middleware(SPAMiddleware)

    @app.get("/")
    async def serve_root():
        return FileResponse(f"{FRONTEND_DIST}/index.html")
