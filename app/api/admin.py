from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_database
from app.api.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.history import HistoryResponse
from bson import ObjectId

router = APIRouter()

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("username") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized, admin only")
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    db = get_database()
    cursor = db.users.find({})
    users = await cursor.to_list(length=1000)
    
    results = []
    for u in users:
        results.append(UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            username=u["username"]
        ))
    return results

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    db = get_database()
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Don't allow admin to delete themselves
    if str(admin_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    # Delete all history of this user
    await db.history.delete_many({"user_id": obj_id})
    
    # Delete the user
    result = await db.users.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User and associated history deleted successfully"}

@router.get("/users/{user_id}/history", response_model=List[HistoryResponse])
async def get_user_history(user_id: str, admin_user: dict = Depends(get_admin_user)):
    db = get_database()
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    cursor = db.history.find({"user_id": obj_id}).sort("id", -1)
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
    return results
