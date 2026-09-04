from pydantic import BaseModel, Field
from typing import List

class Option(BaseModel):
    label: str
    value: int # Score points

class Question(BaseModel):
    id: str
    title: str # "Tần suất thu nhập của bạn như thế nào?"
    options: List[Option]

class Group(BaseModel):
    id: str
    title: str # "Nhóm 1: Độ ổn định dòng tiền"
    weight: float # e.g. 0.35
    questions: List[Question]

class QuestionnaireModel(BaseModel):
    groups: List[Group]
