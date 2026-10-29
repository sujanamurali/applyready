
import re

SKILL_KEYWORDS = {
    "Python": ["python"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "Flask": ["flask"],
    "JavaScript": ["javascript", "js"],
    "React": ["react", "react.js"],
    "Node.js": ["node.js", "nodejs"],
    "SQL": ["sql"],
    "MongoDB": ["mongodb", "mongo db"],
    "PostgreSQL": ["postgresql", "postgres"],
    "REST API": ["rest api", "restful api"],
    "Git": ["git", "github"],
    "Docker": ["docker"],
    "AWS": ["aws", "amazon web services"],
    "HTML": ["html"],
    "CSS": ["css"],
    "Machine Learning": ["machine learning"],
    "Data Analysis": ["data analysis", "data analytics"],
}


def normalize_text(text: str) -> str:
    """Normalize text to make keyword matching more reliable."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_skills(text: str) -> list[str]:
    """Return the known skills found in a job description."""
    normalized_text = normalize_text(text)
    found_skills = []

    for skill, keywords in SKILL_KEYWORDS.items():
        for keyword in keywords:
            pattern = (
                r"(?<![a-z0-9+#])"
                + re.escape(keyword.lower())
                + r"(?![a-z0-9+#])"
            )

            if re.search(pattern, normalized_text):
                found_skills.append(skill)
                break

    return found_skills


def compare_skills(
    job_description: str,
    user_skills: list[str],
) -> dict:
    """Compare a candidate's skills with those found in a job description."""
    required_skills = extract_skills(job_description)

    normalized_user_skills = {
        normalize_text(skill) for skill in user_skills
    }

    matched_skills = [
        skill
        for skill in required_skills
        if normalize_text(skill) in normalized_user_skills
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if normalize_text(skill) not in normalized_user_skills
    ]

    total_required = len(required_skills)
    match_percentage = (
        round(len(matched_skills) / total_required * 100)
        if total_required
        else 0
    )

    return {
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
        "total_required": total_required,
    }

LEARNING_RESOURCES = {
    "Python": "Practice Python basics, functions, and data structures.",
    "FastAPI": "Learn routes, request validation, and API responses.",
    "Django": "Learn models, views, URLs, and Django ORM.",
    "Flask": "Build small web applications using routes and templates.",
    "JavaScript": "Practice ES6+, arrays, objects, promises, and async/await.",
    "React": "Learn components, props, state, hooks, and API integration.",
    "Node.js": "Learn modules, asynchronous programming, and server-side JavaScript.",
    "SQL": "Practice SELECT, JOIN, GROUP BY, and subqueries.",
    "MongoDB": "Learn CRUD operations, document design, and queries.",
    "PostgreSQL": "Practice relational tables, joins, indexes, and transactions.",
    "REST API": "Learn HTTP methods, status codes, validation, and API design.",
    "Git": "Practice commits, branches, merges, and GitHub workflows.",
    "Docker": "Learn images, containers, Dockerfiles, and port mapping.",
    "AWS": "Study EC2, S3, IAM, and basic cloud deployment.",
    "HTML": "Practice semantic elements, forms, and accessible page structure.",
    "CSS": "Learn Flexbox, Grid, responsive design, and layouts.",
    "Machine Learning": "Study train/test splits, model training, and evaluation metrics.",
    "Data Analysis": "Practice data cleaning, Pandas, visualization, and reporting.",
}


def get_learning_recommendations(missing_skills: list[str]) -> list[dict]:
    """Suggest learning topics for skills missing from a job match."""

    recommendations = []

    for skill in missing_skills:
        recommendations.append({
            "skill": skill,
            "recommendation": LEARNING_RESOURCES.get(
                skill,
                f"Study the fundamentals of {skill} and build a small practical project.",
            ),
        })

    return recommendations
