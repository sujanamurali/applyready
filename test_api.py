from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home_endpoint():
	response = client.get("/")

	assert response.status_code == 200
	assert response.json()["status"] == "running"


def test_skill_match_endpoint():
	response = client.post(
		"/api/skills/match",
		json={
			"job_description": (
				"Python developer with FastAPI and MongoDB experience"
			),
			"user_skills": ["Python", "MongoDB"],
		},
	)

	assert response.status_code == 200

	data = response.json()

	assert data["match_percentage"] == 67
	assert data["matched_skills"] == ["Python", "MongoDB"]
	assert data["missing_skills"] == ["FastAPI"]
	assert len(data["learning_recommendations"]) == 1
