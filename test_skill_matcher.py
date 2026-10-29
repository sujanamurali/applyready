
from skill_matcher import (
    compare_skills,
    get_learning_recommendations,
)


def test_match_percentage():
    result = compare_skills(
        "Python, FastAPI, MongoDB",
        ["Python", "MongoDB"],
    )

    assert result["match_percentage"] == 67
    assert result["matched_skills"] == ["Python", "MongoDB"]
    assert result["missing_skills"] == ["FastAPI"]


def test_no_recognized_skills():
    result = compare_skills(
        "Good communication and teamwork",
        ["Python"],
    )

    assert result["match_percentage"] == 0
    assert result["required_skills"] == []


def test_learning_recommendations():
    recommendations = get_learning_recommendations(["FastAPI"])

    assert len(recommendations) == 1
    assert recommendations[0]["skill"] == "FastAPI"
    assert "request validation" in recommendations[0]["recommendation"]
