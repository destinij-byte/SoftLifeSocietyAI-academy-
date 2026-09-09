from datetime import datetime
from enum import Enum
from typing import Annotated, Any

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

PyObjectId = Annotated[str, BeforeValidator(str)]


def new_object_id() -> str:
    return str(ObjectId())


class CourseTier(str, Enum):
    single = "single"
    bundle = "bundle"
    full_access = "full_access"


class CourseStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class EnrollmentStatus(str, Enum):
    active = "active"
    refunded = "refunded"


class EmailTriggerType(str, Enum):
    welcome = "welcome"
    mid_course_nudge = "mid_course_nudge"
    completion = "completion"
    upsell = "upsell"


class Resource(BaseModel):
    label: str
    url: str


class CourseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=new_object_id, alias="_id")
    slug: str
    title: str
    description: str = ""
    price: float
    tier: CourseTier = CourseTier.single
    status: CourseStatus = CourseStatus.draft
    thumbnail_url: str = ""
    modules: list[PyObjectId] = Field(default_factory=list)
    workbook_url: str = ""
    workbook_title: str = ""
    workbook_description: str = ""
    workbook_page_count: int | None = None
    workbook_file_size_mb: float | None = None
    recommended_next_course_id: PyObjectId | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ModuleModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=new_object_id, alias="_id")
    course_id: PyObjectId
    order: int
    title: str
    lessons: list[PyObjectId] = Field(default_factory=list)
    workbook_page_range: str | None = None


class LessonModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=new_object_id, alias="_id")
    module_id: PyObjectId
    order: int
    title: str
    video_url: str
    duration_seconds: int = 0
    transcript: str | None = None
    resources: list[Resource] = Field(default_factory=list)


class EnrollmentProgress(BaseModel):
    lessons_completed: list[PyObjectId] = Field(default_factory=list)
    percent_complete: int = 0
    current_lesson_id: PyObjectId | None = None
    completed_at: datetime | None = None
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)


class EnrollmentModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=new_object_id, alias="_id")
    user_id: PyObjectId
    course_id: PyObjectId
    purchased_at: datetime = Field(default_factory=datetime.utcnow)
    price_paid: float
    status: EnrollmentStatus = EnrollmentStatus.active
    progress: EnrollmentProgress = Field(default_factory=EnrollmentProgress)
    stripe_checkout_session_id: str | None = None


class EmailTriggerModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(default_factory=new_object_id, alias="_id")
    user_id: PyObjectId
    course_id: PyObjectId
    trigger_type: EmailTriggerType
    sent_at: datetime = Field(default_factory=datetime.utcnow)


def dump_for_mongo(model: BaseModel) -> dict[str, Any]:
    """Serialize a model to a Mongo-ready dict, converting the `id`/`_id`
    field back to an ObjectId and dropping it when empty."""
    data = model.model_dump(by_alias=True)
    if data.get("_id"):
        data["_id"] = ObjectId(data["_id"])
    for key in ("course_id", "module_id", "user_id"):
        if data.get(key):
            data[key] = ObjectId(data[key])
    return data
