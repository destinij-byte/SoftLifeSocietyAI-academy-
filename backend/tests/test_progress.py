from app.academy.services.progress import (
    apply_lesson_completion,
    compute_percent_complete,
    next_lesson_after,
)


def test_compute_percent_complete_empty_course():
    assert compute_percent_complete([], []) == 0


def test_compute_percent_complete_partial():
    lessons = ["l1", "l2", "l3", "l4"]
    assert compute_percent_complete(lessons, ["l1", "l2"]) == 50


def test_compute_percent_complete_full():
    lessons = ["l1", "l2", "l3"]
    assert compute_percent_complete(lessons, ["l1", "l2", "l3"]) == 100


def test_next_lesson_after_middle():
    lessons = ["l1", "l2", "l3"]
    assert next_lesson_after(lessons, "l1") == "l2"


def test_next_lesson_after_last_returns_none():
    lessons = ["l1", "l2", "l3"]
    assert next_lesson_after(lessons, "l3") is None


def test_next_lesson_after_unknown_lesson_returns_none():
    assert next_lesson_after(["l1", "l2"], "unknown") is None


def test_apply_lesson_completion_advances_and_tracks_percent():
    lessons = ["l1", "l2", "l3"]
    result = apply_lesson_completion(lessons, ["l1"], "l2")

    assert result["lessons_completed"] == ["l1", "l2"]
    assert result["percent_complete"] == 67
    assert result["current_lesson_id"] == "l3"
    assert "completed_at" not in result


def test_apply_lesson_completion_marks_course_complete_on_last_lesson():
    lessons = ["l1", "l2"]
    result = apply_lesson_completion(lessons, ["l1"], "l2")

    assert result["percent_complete"] == 100
    assert result["current_lesson_id"] == "l2"
    assert "completed_at" in result


def test_apply_lesson_completion_is_idempotent_for_repeat_completion():
    lessons = ["l1", "l2"]
    result = apply_lesson_completion(lessons, ["l1", "l2"], "l2")

    assert result["lessons_completed"] == ["l1", "l2"]
    assert result["percent_complete"] == 100
