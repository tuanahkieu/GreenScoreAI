from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import score, auth, history, admin, questionnaire

app = FastAPI(title="Green Score AI Backend")

# Cấu hình CORS (Cho phép Frontend gọi API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong thực tế nên để URL của frontend
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

@app.get("/")
def read_root():
    return {"message": "Welcome to GreenScore AI API"}
