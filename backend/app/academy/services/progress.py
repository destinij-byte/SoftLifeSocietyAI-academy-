"""Progress calculation. The pure functions here take plain lists/ids so they
can be unit tested without a database."""

from datetime import datetime


def compute_percent_complete(lesson_ids: list[str], completed_ids: list[str]) -> int:
    if not lesson_ids:
        return 0
    completed_set = set(completed_ids)
    done = sum(1 for lid in lesson_ids if lid in completed_set)
    return round((done / len(lesson_ids)) * 100)


def next_lesson_after(lesson_ids: list[str], lesson_id: str) -> str | None:
    try:
        idx = lesson_ids.index(lesson_id)
    except ValueError:
        return None
    if idx + 1 < len(lesson_ids):
        return lesson_ids[idx + 1]
    return None


def apply_lesson_completion(
    lesson_ids: list[str],
    completed_ids: list[str],
    just_completed_lesson_id: str,
) -> dict:
    """Returns the new progress fields after marking one lesson complete and
    auto-advancing `current_lesson_id` to the next lesson (or leaving it on
    the last lesson if the course is finished)."""
    completed = list(dict.fromkeys([*completed_ids, just_completed_lesson_id]))
    percent = compute_percent_complete(lesson_ids, completed)
    upcoming = next_lesson_after(lesson_ids, just_completed_lesson_id)
    course_completed = percent >= 100

    fields: dict = {
        "lessons_completed": completed,
        "percent_complete": percent,
        "current_lesson_id": upcoming or just_completed_lesson_id,
        "last_activity_at": datetime.utcnow(),
    }
    if course_completed:
        fields["completed_at"] = datetime.utcnow()
    return fields
