from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy.models import (
    CourseModel,
    CourseStatus,
    EmailTriggerModel,
    EnrollmentModel,
    EnrollmentStatus,
    LessonModel,
    ModuleModel,
    dump_for_mongo,
)


def courses(db: AsyncIOMotorDatabase):
    return db.courses


def modules(db: AsyncIOMotorDatabase):
    return db.modules


def lessons(db: AsyncIOMotorDatabase):
    return db.lessons


def enrollments(db: AsyncIOMotorDatabase):
    return db.enrollments


def email_triggers(db: AsyncIOMotorDatabase):
    return db.email_triggers


# ---- courses ----


async def list_published_courses(db: AsyncIOMotorDatabase) -> list[dict]:
    cursor = courses(db).find({"status": CourseStatus.published.value})
    return [doc async for doc in cursor]


async def get_course_by_slug(db: AsyncIOMotorDatabase, slug: str) -> dict | None:
    return await courses(db).find_one({"slug": slug})


async def get_course(db: AsyncIOMotorDatabase, course_id: str) -> dict | None:
    return await courses(db).find_one({"_id": ObjectId(course_id)})


async def create_course(db: AsyncIOMotorDatabase, course: CourseModel) -> dict:
    doc = dump_for_mongo(course)
    await courses(db).insert_one(doc)
    return doc


async def update_course(db: AsyncIOMotorDatabase, course_id: str, fields: dict) -> dict | None:
    fields["updated_at"] = datetime.utcnow()
    await courses(db).update_one({"_id": ObjectId(course_id)}, {"$set": fields})
    return await get_course(db, course_id)


async def add_module_to_course(db: AsyncIOMotorDatabase, course_id: str, module_id: str) -> None:
    await courses(db).update_one(
        {"_id": ObjectId(course_id)}, {"$push": {"modules": ObjectId(module_id)}}
    )


# ---- modules ----


async def get_module(db: AsyncIOMotorDatabase, module_id: str) -> dict | None:
    return await modules(db).find_one({"_id": ObjectId(module_id)})


async def list_modules_for_course(db: AsyncIOMotorDatabase, course_id: str) -> list[dict]:
    cursor = modules(db).find({"course_id": ObjectId(course_id)}).sort("order", 1)
    return [doc async for doc in cursor]


async def create_module(db: AsyncIOMotorDatabase, module: ModuleModel) -> dict:
    doc = dump_for_mongo(module)
    await modules(db).insert_one(doc)
    await add_module_to_course(db, str(doc["course_id"]), str(doc["_id"]))
    return doc


async def add_lesson_to_module(db: AsyncIOMotorDatabase, module_id: str, lesson_id: str) -> None:
    await modules(db).update_one(
        {"_id": ObjectId(module_id)}, {"$push": {"lessons": ObjectId(lesson_id)}}
    )


# ---- lessons ----


async def get_lesson(db: AsyncIOMotorDatabase, lesson_id: str) -> dict | None:
    return await lessons(db).find_one({"_id": ObjectId(lesson_id)})


async def list_lessons_for_module(db: AsyncIOMotorDatabase, module_id: str) -> list[dict]:
    cursor = lessons(db).find({"module_id": ObjectId(module_id)}).sort("order", 1)
    return [doc async for doc in cursor]


async def create_lesson(db: AsyncIOMotorDatabase, lesson: LessonModel) -> dict:
    doc = dump_for_mongo(lesson)
    await lessons(db).insert_one(doc)
    await add_lesson_to_module(db, str(doc["module_id"]), str(doc["_id"]))
    return doc


async def list_all_lesson_ids_for_course(db: AsyncIOMotorDatabase, course_id: str) -> list[str]:
    """Ordered flat list of lesson ids across all modules of a course."""
    mods = await list_modules_for_course(db, course_id)
    ordered_lesson_ids: list[str] = []
    for mod in mods:
        for lesson_id in mod.get("lessons", []):
            ordered_lesson_ids.append(str(lesson_id))
    return ordered_lesson_ids


# ---- enrollments ----


async def get_enrollment(db: AsyncIOMotorDatabase, user_id: str, course_id: str) -> dict | None:
    return await enrollments(db).find_one(
        {"user_id": ObjectId(user_id), "course_id": ObjectId(course_id)}
    )


async def get_enrollment_by_id(db: AsyncIOMotorDatabase, enrollment_id: str) -> dict | None:
    return await enrollments(db).find_one({"_id": ObjectId(enrollment_id)})


async def list_enrollments_for_user(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    cursor = enrollments(db).find(
        {"user_id": ObjectId(user_id), "status": EnrollmentStatus.active.value}
    )
    return [doc async for doc in cursor]


async def create_enrollment(db: AsyncIOMotorDatabase, enrollment: EnrollmentModel) -> dict:
    doc = dump_for_mongo(enrollment)
    await enrollments(db).insert_one(doc)
    return doc


async def update_enrollment_progress(
    db: AsyncIOMotorDatabase, enrollment_id: str, progress_fields: dict
) -> dict | None:
    await enrollments(db).update_one(
        {"_id": ObjectId(enrollment_id)},
        {"$set": {f"progress.{k}": v for k, v in progress_fields.items()}},
    )
    return await get_enrollment_by_id(db, enrollment_id)


async def list_stale_active_enrollments(db: AsyncIOMotorDatabase, cutoff: datetime) -> list[dict]:
    """Active, incomplete enrollments whose last activity predates `cutoff` —
    candidates for the inactivity nudge email."""
    cursor = enrollments(db).find(
        {
            "status": EnrollmentStatus.active.value,
            "progress.completed_at": None,
            "progress.last_activity_at": {"$lt": cutoff},
        }
    )
    return [doc async for doc in cursor]


# ---- email triggers ----


async def has_sent_trigger(
    db: AsyncIOMotorDatabase, user_id: str, course_id: str, trigger_type: str
) -> bool:
    existing = await email_triggers(db).find_one(
        {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "trigger_type": trigger_type,
        }
    )
    return existing is not None


async def log_email_trigger(db: AsyncIOMotorDatabase, trigger: EmailTriggerModel) -> dict:
    doc = dump_for_mongo(trigger)
    await email_triggers(db).insert_one(doc)
    return doc
