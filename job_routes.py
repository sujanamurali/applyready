
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from main import database

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


class JobApplication(BaseModel):
    company: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=100)
    status: str = "Applied"
    job_url: str | None = None
    notes: str | None = None


def serialize_job(job: dict) -> dict:
    job["id"] = str(job.pop("_id"))
    return job


@router.post("/")
def create_job(application: JobApplication):
    if database is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured",
        )

    allowed_statuses = {
        "Applied",
        "Interview",
        "Offer",
        "Rejected",
    }

    if application.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    job = application.model_dump()
    job["created_at"] = datetime.now(timezone.utc)

    result = database["jobs"].insert_one(job)
    job["_id"] = result.inserted_id

    return serialize_job(job)


@router.get("/")
def list_jobs():
    if database is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured",
        )

    jobs = database["jobs"].find().sort("created_at", -1)
    return [serialize_job(job) for job in jobs]

@router.patch("/{job_id}/status")
def update_job_status(job_id: str, status: str):
    if database is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured",
        )

    allowed_statuses = {
        "Applied",
        "Interview",
        "Offer",
        "Rejected",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID",
        )

    result = database["jobs"].update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": status}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Job application not found",
        )

    return {
        "message": "Job application status updated successfully",
        "job_id": job_id,
        "status": status,
    }

@router.delete("/{job_id}")
def delete_job(job_id: str):
    if database is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured",
        )

    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID",
        )

    result = database["jobs"].delete_one(
        {"_id": ObjectId(job_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Job application not found",
        )

    return {
        "message": "Job application deleted successfully",
        "job_id": job_id,
    }
