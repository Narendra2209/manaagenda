import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/saas_pm")

async def reset():
    client = AsyncIOMotorClient(MONGO_URI)
    db_name = MONGO_URI.split("/")[-1].split("?")[0] or "saas_pm"
    db = client[db_name]
    result = await db.users.update_one(
        {"email": "abhi@gmail.com"},
        {"$set": {"password": pwd_context.hash("abhi123")}}
    )
    print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
    if result.matched_count:
        print("Password reset successfully!")
        print("  Email: abhi@gmail.com")
        print("  New Password: abhi123")
    else:
        print("User not found!")
    client.close()

asyncio.run(reset())
