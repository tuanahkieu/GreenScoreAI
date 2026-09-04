from fastapi import APIRouter
from app.schemas.score import ScoreRequest, ScoreResponse
from app.services.calculator import calculate_green_score

router = APIRouter()

@router.post("/calculate", response_model=ScoreResponse)
async def calculate_score(request: ScoreRequest):
    return await calculate_green_score(request)
