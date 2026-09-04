from pydantic import BaseModel

from typing import Dict

class ScoreRequest(BaseModel):
    answers: Dict[str, int] # question_id -> option_value

class Classification(BaseModel):
    tier: str
    color: str
    status: str
    recommendation: str

class GroupScore(BaseModel):
    title: str
    score: float

class ScoreResponse(BaseModel):
    score: int
    group_scores: Dict[str, GroupScore] # group_id -> GroupScore
    classification: Classification
