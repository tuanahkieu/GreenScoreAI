"""
Script tạo tài khoản admin trong MongoDB.
Chạy một lần duy nhất: python create_admin.py
"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from passlib.context import CryptContext
import motor.motor_asyncio

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
    db = client["greenscore"]
    
    # Kiểm tra xem admin đã tồn tại chưa
    existing = await db.users.find_one({"username": "admin"})
    if existing:
        print("✅ Tài khoản admin đã tồn tại!")
        return
    
    # Tạo tài khoản admin
    admin_user = {
        "email": "admin@greenscore.ai",
        "username": "admin",
        "hashed_password": pwd_context.hash("admin123")
    }
    
    result = await db.users.insert_one(admin_user)
    print(f"✅ Tạo tài khoản admin thành công! ID: {result.inserted_id}")
    print("   Username: admin")
    print("   Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_admin())
