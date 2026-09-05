from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy import repository as repo
from app.academy.schemas import (
    LessonCompleteResponse,
    LessonDetail,
    MyCourseSummary,
    ProgressResponse,
    WorkbookResponse,
)
from app.academy.services import upsell
from app.academy.services.emails import ConsoleEmailSender, send_completion_and_upsell
from app.academy.services.progress import apply_lesson_completion
from app.academy.services.workbook import generate_signed_workbook_url
from app.db import get_database
from app.security import CurrentUser, get_current_user

router = APIRouter(tags=["academy-learner"])

_email_sender = ConsoleEmailSender()


@router.get("/my-courses", response_model=list[MyCourseSummary])
async def my_courses(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    enrollments = await repo.list_enrollments_for_user(db, user.id)
    results: list[MyCourseSummary] = []
    for enrollment in enrollments:
        course = await repo.get_course(db, str(enrollment["course_id"]))
        if course is None:
            continue
        progress = enrollment.get("progress", {})
        results.append(
            MyCourseSummary(
                id=str(course["_id"]),
                slug=course["slug"],
                title=course["title"],
                description=course.get("description", ""),
                price=course["price"],
                tier=course["tier"],
                thumbnail_url=course.get("thumbnail_url", ""),
                enrollment_id=str(enrollment["_id"]),
                percent_complete=progress.get("percent_complete", 0),
                current_lesson_id=(
                    str(progress["current_lesson_id"]) if progress.get("current_lesson_id") else None
                ),
            )
        )
    return results


async def _require_active_enrollment(db, user_id: str, course_id: str) -> dict:
    enrollment = await repo.get_enrollment(db, user_id, course_id)
    if enrollment is None or enrollment.get("status") != "active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enrolled in this course")
    return enrollment


@router.get("/courses/{course_id}/progress", response_model=ProgressResponse)
async def get_progress(
    course_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    enrollment = await _require_active_enrollment(db, user.id, course_id)
    progress = enrollment.get("progress", {})
    return ProgressResponse(
        course_id=course_id,
        lessons_completed=[str(x) for x in progress.get("lessons_completed", [])],
        percent_complete=progress.get("percent_complete", 0),
        current_lesson_id=(
            str(progress["current_lesson_id"]) if progress.get("current_lesson_id") else None
        ),
        completed_at=progress.get("completed_at"),
    )


async def _resolve_lesson_and_course_id(db, lesson_id: str) -> tuple[dict, str]:
    lesson = await repo.get_lesson(db, lesson_id)
    if lesson is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")

    module = await repo.get_module(db, str(lesson["module_id"]))
    if module is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")

    return lesson, str(module["course_id"])


@router.get("/lessons/{lesson_id}", response_model=LessonDetail)
async def get_lesson_detail(
    lesson_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Full lesson content (video URL, transcript, resources) — gated behind
    an active enrollment since `video_url` is not exposed by the public
    course-detail endpoint."""
    lesson, course_id = await _resolve_lesson_and_course_id(db, lesson_id)
    await _require_active_enrollment(db, user.id, course_id)

    return LessonDetail(
        id=str(lesson["_id"]),
        module_id=str(lesson["module_id"]),
        order=lesson["order"],
        title=lesson["title"],
        video_url=lesson["video_url"],
        duration_seconds=lesson.get("duration_seconds", 0),
        transcript=lesson.get("transcript"),
        resources=lesson.get("resources", []),
    )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
async def complete_lesson(
    lesson_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    lesson, course_id = await _resolve_lesson_and_course_id(db, lesson_id)
    enrollment = await _require_active_enrollment(db, user.id, course_id)

    ordered_lesson_ids = await repo.list_all_lesson_ids_for_course(db, course_id)
    progress = enrollment.get("progress", {})
    completed_ids = [str(x) for x in progress.get("lessons_completed", [])]

    new_fields = apply_lesson_completion(ordered_lesson_ids, completed_ids, lesson_id)
    await repo.update_enrollment_progress(db, str(enrollment["_id"]), new_fields)

    course_completed = new_fields["percent_complete"] >= 100
    recommended_next_course_id: str | None = None

    if course_completed:
        course = await repo.get_course(db, course_id)
        recommended_next_course_id = upsell.pick_recommended_next(course)
        recommended_course = (
            await repo.get_course(db, recommended_next_course_id)
            if recommended_next_course_id
            else None
        )
        await send_completion_and_upsell(
            db,
            _email_sender,
            user_id=user.id,
            user_email=user.email,
            course=course,
            recommended_next_course=recommended_course,
        )

    next_lesson_id = new_fields["current_lesson_id"]
    return LessonCompleteResponse(
        percent_complete=new_fields["percent_complete"],
        next_lesson_id=next_lesson_id if next_lesson_id != lesson_id else None,
        course_completed=course_completed,
        recommended_next_course_id=recommended_next_course_id,
    )


@router.get("/courses/{course_id}/workbook", response_model=WorkbookResponse)
async def get_workbook(
    course_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    await _require_active_enrollment(db, user.id, course_id)
    course = await repo.get_course(db, course_id)
    if course is None or not course.get("workbook_url"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workbook not available for this course")

    download_url, expires_at = generate_signed_workbook_url(course_id, course["workbook_url"])
    return WorkbookResponse(download_url=download_url, expires_at=expires_at)
