"""
Seed script to create the initial admin user.
Run: python seed_admin.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/saas_pm")


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db_name = MONGO_URI.split("/")[-1].split("?")[0] or "saas_pm"
    db = client[db_name]

    existing = await db.users.find_one({"email": "admin@example.com"})
    if existing:
        print("Admin user already exists.")
        client.close()
        return

    admin_doc = {
        "name": "Admin",
        "email": "admin@example.com",
        "password": pwd_context.hash("admin123"),
        "role": "ADMIN",
        "created_at": datetime.now(timezone.utc),
    }

    await db.users.insert_one(admin_doc)
    print("Admin user created successfully!")
    print("  Email: admin@example.com")
    print("  Password: admin123")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
