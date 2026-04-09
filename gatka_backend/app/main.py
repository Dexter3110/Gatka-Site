from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import auth, users, players, competitions, registrations
from app.database import engine, Base

# Create tables if they don't exist (use SQL migrations in production)
Base.metadata.create_all(bind=engine)

# Create upload directories
os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/aadhar", exist_ok=True)

app = FastAPI(
    title="Maharashtra Gatka Federation API",
    description="Backend API for the Gatka Federation portal",
    version="1.0.0",
)

# CORS — allow your React frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add production URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(players.router, prefix="/players", tags=["Players"])
app.include_router(competitions.router, prefix="/competitions", tags=["Competitions"])
app.include_router(registrations.router, prefix="/registrations", tags=["Registrations"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Gatka Federation API is running"}
