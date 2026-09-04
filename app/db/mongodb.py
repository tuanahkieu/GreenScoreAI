import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Tạm thời dùng localhost. Khi có chuỗi kết nối từ Atlas, ta thay vào biến môi trường hoặc sửa trực tiếp ở đây.
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)

database = client.greenscore

def get_database():
    return database
