from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import auth, admin, employee, client, messages


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="SaaS Project Management API",
    description="Full-stack SaaS Project Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(employee.router)
app.include_router(client.router)
app.include_router(messages.router)


@app.get("/")
async def root():
    return {"message": "SaaS Project Management API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
