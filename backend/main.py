"""
Root-level entry point for deployment platforms (e.g., Render).
Re-exports the FastAPI app from the app package.
"""
from app.main import app  # noqa: F401
