from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_database
from app.api.admin import get_admin_user
from app.schemas.questionnaire import QuestionnaireModel

router = APIRouter()

@router.get("/", response_model=QuestionnaireModel)
async def get_questionnaire():
    db = get_database()
    # We store the questionnaire as a single document in the 'questionnaire' collection
    # with a specific ID or just get the first one
    doc = await db.questionnaire.find_one({"is_active": True})
    
    if not doc:
        # Return empty if none found
        return QuestionnaireModel(groups=[])
        
    return QuestionnaireModel(**doc)

@router.put("/", response_model=QuestionnaireModel)
async def update_questionnaire(data: QuestionnaireModel, admin_user: dict = Depends(get_admin_user)):
    db = get_database()
    
    # Validate weights sum to 1.0 (or close to it due to float precision)
    total_weight = sum(group.weight for group in data.groups)
    if not (0.99 <= total_weight <= 1.01):
        raise HTTPException(status_code=400, detail="Total weights of all groups must sum to exactly 1.0 (100%)")
        
    doc_dict = data.dict()
    doc_dict["is_active"] = True
    
    # Replace the existing active document or insert a new one
    await db.questionnaire.replace_one(
        {"is_active": True},
        doc_dict,
        upsert=True
    )
    
    return data
