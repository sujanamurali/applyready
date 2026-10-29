
import os
from unittest import result

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from pydantic import BaseModel, Field
from skill_matcher import (
    compare_skills,
    get_learning_recommendations,
)
load_dotenv()

app = FastAPI(title="ApplyReady API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SkillMatchRequest(BaseModel):
    job_description: str = Field(min_length=1, max_length=20000)
    user_skills: list[str] = Field(min_length=1, max_length=50)


MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "applyready")

client = None
database = None

if MONGODB_URI:
    client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,
    )
    database = client[MONGODB_DATABASE]


@app.get("/")
def home():
    return {
        "message": "Welcome to ApplyReady!",
        "status": "running",
    }


@app.get("/health/db")
def database_health():
    if database is None:
        return {
            "status": "error",
            "message": "MONGODB_URI is missing from the .env file",
        }

    try:
        database.command("ping")
        return {
            "status": "success",
            "message": "MongoDB Atlas connected successfully!",
            "database": MONGODB_DATABASE,
        }
    except PyMongoError as exc:
        print("MongoDB connection diagnostic:", repr(exc))
    return {
        "status": "error",
        "message": "MongoDB connection failed. Check the VS Code terminal for details.",
    }
@app.post("/test-db")
def test_database_write():
    if database is None:
        return {
            "status": "error",
            "message": "Database is not configured",
        }

    try:
        result = database["test_records"].insert_one({
            "project": "ApplyReady",
            "purpose": "Testing MongoDB document insertion",
            "status": "success",
        })

        return {
            "status": "success",
            "message": "Document inserted successfully!",
            "inserted_id": str(result.inserted_id),
        }

    except PyMongoError as exc:
        print("MongoDB write diagnostic:", repr(exc))
        return {
            "status": "error",
            "message": "Could not insert document. Check the terminal.",
        }
from job_routes import router as job_router
@app.post("/api/skills/match")
def match_job_skills(request: SkillMatchRequest):
    result = compare_skills(
        job_description=request.job_description,
        user_skills=request.user_skills,
    )
    result["learning_recommendations"] = (
    get_learning_recommendations(result["missing_skills"])
)
    return result
app.include_router(job_router)

