def pick_recommended_next(course: dict) -> str | None:
    """Recommended-next course id, sourced straight from the course doc's
    `recommended_next_course_id` field (set by admins in the course editor)."""
    value = course.get("recommended_next_course_id")
    return str(value) if value else None
