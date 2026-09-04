from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_database
from app.api.auth import get_current_user
from app.schemas.history import HistoryCreate, HistoryResponse
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[HistoryResponse])
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.history.find({"user_id": current_user["_id"]}).sort("id", -1) # id here is the timestamp we generated in frontend, or we can just sort by _id
    histories = await cursor.to_list(length=100)
    
    results = []
    for h in histories:
        results.append(HistoryResponse(
            id=str(h["_id"]),
            user_id=str(h["user_id"]),
            date=h["date"],
            monthYear=h.get("monthYear", ""),
            score=h["score"],
            tier=h["tier"],
            color=h["color"]
        ))
    
    # Sắp xếp lại danh sách từ mới đến cũ theo date nếu cần, tạm thời trả về
    return results

@router.post("/", response_model=HistoryResponse)
async def create_history(history: HistoryCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check if a record for the same monthYear exists, and delete it to overwrite
    await db.history.delete_many({
        "user_id": current_user["_id"],
        "monthYear": history.monthYear
    })
    
    history_dict = history.dict()
    history_dict["user_id"] = current_user["_id"]
    
    result = await db.history.insert_one(history_dict)
    
    return HistoryResponse(
        id=str(result.inserted_id),
        user_id=str(current_user["_id"]),
        **history.dict()
    )

@router.delete("/")
async def clear_history(current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db.history.delete_many({"user_id": current_user["_id"]})
    return {"message": "All history cleared"}

@router.delete("/{history_id}")
async def delete_history_item(history_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(history_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid history ID")
        
    result = await db.history.delete_one({"_id": obj_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History not found or unauthorized")
        
    return {"message": "History item deleted"}
