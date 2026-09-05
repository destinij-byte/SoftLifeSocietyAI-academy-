from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy import repository as repo
from app.academy.models import CourseModel, LessonModel, ModuleModel
from app.academy.schemas import CourseCreate, CourseUpdate, LessonCreate, ModuleCreate
from app.db import get_database
from app.security import CurrentUser, require_admin

router = APIRouter(prefix="/admin", tags=["academy-admin"])


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def admin_create_course(
    body: CourseCreate,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    existing = await repo.get_course_by_slug(db, body.slug)
    if existing is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A course with this slug already exists")

    course = CourseModel(**body.model_dump())
    doc = await repo.create_course(db, course)
    return {"id": str(doc["_id"])}


@router.patch("/courses/{course_id}")
async def admin_update_course(
    course_id: str,
    body: CourseUpdate,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    updated = await repo.update_course(db, course_id, fields)
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return {"id": str(updated["_id"])}


@router.post("/modules", status_code=status.HTTP_201_CREATED)
async def admin_create_module(
    body: ModuleCreate,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    course = await repo.get_course(db, body.course_id)
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

    module = ModuleModel(**body.model_dump())
    doc = await repo.create_module(db, module)
    return {"id": str(doc["_id"])}


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
async def admin_create_lesson(
    body: LessonCreate,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    module = await repo.get_module(db, body.module_id)
    if module is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")

    lesson = LessonModel(**body.model_dump())
    doc = await repo.create_lesson(db, lesson)
    return {"id": str(doc["_id"])}
