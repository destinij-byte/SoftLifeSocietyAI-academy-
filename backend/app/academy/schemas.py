from datetime import datetime

from pydantic import BaseModel

from app.academy.models import CourseStatus, CourseTier, Resource


# ---- Public storefront ----


class CourseSummary(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    price: float
    tier: CourseTier
    thumbnail_url: str


class LessonPublic(BaseModel):
    id: str
    order: int
    title: str
    duration_seconds: int


class ModulePublic(BaseModel):
    id: str
    order: int
    title: str
    lessons: list[LessonPublic]


class CourseDetail(CourseSummary):
    modules: list[ModulePublic]
    recommended_next_course_id: str | None = None


# ---- Learner-facing lesson content (requires active enrollment) ----


class LessonDetail(BaseModel):
    id: str
    module_id: str
    order: int
    title: str
    video_url: str
    duration_seconds: int
    transcript: str | None = None
    resources: list[Resource]


# ---- Checkout ----


class CheckoutRequest(BaseModel):
    course_id: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ---- Enrollments / progress ----


class ProgressResponse(BaseModel):
    course_id: str
    lessons_completed: list[str]
    percent_complete: int
    current_lesson_id: str | None
    completed_at: datetime | None


class MyCourseSummary(CourseSummary):
    enrollment_id: str
    percent_complete: int
    current_lesson_id: str | None


class LessonCompleteResponse(BaseModel):
    percent_complete: int
    next_lesson_id: str | None
    course_completed: bool
    recommended_next_course_id: str | None = None


class WorkbookResponse(BaseModel):
    download_url: str
    expires_at: datetime


# ---- Admin CRUD ----


class CourseCreate(BaseModel):
    slug: str
    title: str
    description: str = ""
    price: float
    tier: CourseTier = CourseTier.single
    status: CourseStatus = CourseStatus.draft
    thumbnail_url: str = ""
    workbook_url: str = ""
    recommended_next_course_id: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    tier: CourseTier | None = None
    status: CourseStatus | None = None
    thumbnail_url: str | None = None
    workbook_url: str | None = None
    recommended_next_course_id: str | None = None


class ModuleCreate(BaseModel):
    course_id: str
    order: int
    title: str


class LessonCreate(BaseModel):
    module_id: str
    order: int
    title: str
    video_url: str
    duration_seconds: int = 0
    transcript: str | None = None
    resources: list[Resource] = []
