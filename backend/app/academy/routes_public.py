from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy import repository as repo
from app.academy.schemas import CourseDetail, CourseSummary, LessonPublic, ModulePublic
from app.db import get_database

router = APIRouter(tags=["academy-public"])


def _to_summary(course: dict) -> CourseSummary:
    return CourseSummary(
        id=str(course["_id"]),
        slug=course["slug"],
        title=course["title"],
        description=course.get("description", ""),
        price=course["price"],
        tier=course["tier"],
        thumbnail_url=course.get("thumbnail_url", ""),
    )


@router.get("/courses", response_model=list[CourseSummary])
async def list_courses(db: AsyncIOMotorDatabase = Depends(get_database)):
    courses = await repo.list_published_courses(db)
    return [_to_summary(c) for c in courses]


@router.get("/courses/{slug}", response_model=CourseDetail)
async def get_course_detail(slug: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    course = await repo.get_course_by_slug(db, slug)
    if course is None or course.get("status") != "published":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

    modules = await repo.list_modules_for_course(db, str(course["_id"]))
    module_payloads: list[ModulePublic] = []
    for module in modules:
        lessons = await repo.list_lessons_for_module(db, str(module["_id"]))
        module_payloads.append(
            ModulePublic(
                id=str(module["_id"]),
                order=module["order"],
                title=module["title"],
                workbook_page_range=module.get("workbook_page_range"),
                lessons=[
                    LessonPublic(
                        id=str(lesson["_id"]),
                        order=lesson["order"],
                        title=lesson["title"],
                        duration_seconds=lesson.get("duration_seconds", 0),
                    )
                    for lesson in lessons
                ],
            )
        )

    summary = _to_summary(course)
    return CourseDetail(
        **summary.model_dump(),
        modules=module_payloads,
        recommended_next_course_id=(
            str(course["recommended_next_course_id"])
            if course.get("recommended_next_course_id")
            else None
        ),
    )
