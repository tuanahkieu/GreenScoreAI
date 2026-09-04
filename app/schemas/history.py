from pydantic import BaseModel, Field
from typing import Optional

class HistoryCreate(BaseModel):
    date: str
    monthYear: str
    score: int
    tier: str
    color: str

class HistoryResponse(HistoryCreate):
    id: str
    user_id: str
