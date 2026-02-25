from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    global client, database
    try:
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
        )
        db_name = settings.MONGO_URI.split("/")[-1].split("?")[0]
        if not db_name:
            db_name = "saas_pm"
        database = client[db_name]
        # Quick ping to verify connection
        await client.admin.command("ping")
        await database.users.create_index("email", unique=True)
        print(f"Connected to MongoDB: {db_name}")
    except Exception as e:
        print(f"WARNING: MongoDB connection failed: {e}")
        print("The app will start but database operations will fail.")
        print(f"MONGO_URI starts with: {settings.MONGO_URI[:30]}...")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    return database
