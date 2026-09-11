from pydantic import BaseModel

from typing import Dict, Optional, List

class ScoreRequest(BaseModel):
    answers: Dict[str, int] # question_id -> option_value
    verification_status: Optional[str] = None

class Classification(BaseModel):
    tier: str
    color: str
    status: str
    recommendation: str

class GroupScore(BaseModel):
    title: str
    score: float

class ScoreExplanation(BaseModel):
    strengths: List[str]
    improvements: List[str]
    impacts: Dict[str, str]

class FinancialInsights(BaseModel):
    current_status: str
    strengths: str
    risks: str
    priority: str

class PersonalizedRecommendation(BaseModel):
    condition: str
    action: str

class FinancialProgressItem(BaseModel):
    month_label: str
    score: int

class FinancialProgress(BaseModel):
    history: List[FinancialProgressItem]
    trend: str
    changed_factors: str
    next_recommendation: str

class ScoreResponse(BaseModel):
    score: int
    group_scores: Dict[str, GroupScore] # group_id -> GroupScore
    classification: Classification
    is_consistent: bool = True
    inconsistent_reason: Optional[str] = None
    data_confidence: str = "Medium"
    data_confidence_reason: str = ""
    score_explanation: Optional[ScoreExplanation] = None
    financial_insights: Optional[FinancialInsights] = None
    personalized_recommendations: Optional[List[PersonalizedRecommendation]] = None
    financial_progress: Optional[FinancialProgress] = None
