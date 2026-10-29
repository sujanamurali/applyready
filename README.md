
# ApplyReady — Job Search & Interview Readiness Platform

ApplyReady is a full-stack web application designed to help job seekers
organize job applications and compare their skills against job descriptions.

## Features

- Track job applications and their statuses.
- Store application records in MongoDB.
- Extract recognized technical skills from job descriptions.
- Calculate a candidate's skill match percentage.
- Identify missing skills and suggest learning steps.
- Test core functionality using automated Python tests.

## Technology Stack

- Frontend: React, Vite, CSS
- Backend: Python, FastAPI
- Database: MongoDB Atlas
- Database driver: PyMongo
- Validation: Pydantic
- Testing: pytest, FastAPI TestClient

## Project Structure

- `main.py` — FastAPI application and API endpoints
- `job_routes.py` — Job application endpoints
- `skill_matcher.py` — Skill matching and learning recommendations
- `test_skill_matcher.py` — Skill matcher unit tests
- `test_api.py` — API tests
- `frontend/` — React frontend
- `.env` — Local environment configuration

## Setup

### 1. Backend

Create and activate a Python virtual environment, then install the
project's required packages.

Configure these variables in the root `.env` file:

- `MONGODB_URI` — Your MongoDB connection string
- `MONGODB_DATABASE` — `applyready`

Start the backend:

`python -m uvicorn main:app --reload`

API documentation: http://127.0.0.1:8000/docs

### 2. Frontend

Open a second terminal:

`cd frontend`

Install frontend dependencies:

`npm install`

Start the development server:

`npm run dev`

Open the local URL shown in the terminal.

## Run Tests

From the root project folder:

`python -m pytest -v`

## Future Improvements

- User authentication and individual accounts
- Improved skill extraction and recommendation logic
- Deployment and production configuration
