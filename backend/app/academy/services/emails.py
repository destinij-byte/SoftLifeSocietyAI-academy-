"""Email sending. Academy doesn't own an email provider — it sends through
whatever the rest of SLS already uses (SendGrid, Postmark, ...). Implement
`EmailSender` against that provider and pass it in; `ConsoleEmailSender`
below is a dev-only stand-in that just logs.
"""

from typing import Protocol

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy import repository as repo
from app.academy.models import EmailTriggerModel, EmailTriggerType


class EmailSender(Protocol):
    async def send(self, to_email: str, template: str, context: dict) -> None: ...


class ConsoleEmailSender:
    async def send(self, to_email: str, template: str, context: dict) -> None:
        print(f"[academy email] to={to_email} template={template} context={context}")


async def _send_once(
    db: AsyncIOMotorDatabase,
    sender: EmailSender,
    *,
    user_id: str,
    user_email: str,
    course_id: str,
    course_title: str,
    trigger_type: EmailTriggerType,
    template: str,
    extra_context: dict | None = None,
) -> bool:
    """Sends the templated email and logs it to `email_triggers`, unless one
    of this type was already logged for this user/course (idempotent)."""
    if await repo.has_sent_trigger(db, user_id, course_id, trigger_type.value):
        return False

    context = {"course_title": course_title, **(extra_context or {})}
    await sender.send(user_email, template, context)
    await repo.log_email_trigger(
        db,
        EmailTriggerModel(user_id=user_id, course_id=course_id, trigger_type=trigger_type),
    )
    return True


async def send_welcome_email(
    db: AsyncIOMotorDatabase, sender: EmailSender, *, user_id: str, user_email: str, course: dict
) -> bool:
    return await _send_once(
        db,
        sender,
        user_id=user_id,
        user_email=user_email,
        course_id=str(course["_id"]),
        course_title=course["title"],
        trigger_type=EmailTriggerType.welcome,
        template="academy_welcome",
    )


async def send_inactivity_nudge(
    db: AsyncIOMotorDatabase, sender: EmailSender, *, user_id: str, user_email: str, course: dict
) -> bool:
    return await _send_once(
        db,
        sender,
        user_id=user_id,
        user_email=user_email,
        course_id=str(course["_id"]),
        course_title=course["title"],
        trigger_type=EmailTriggerType.mid_course_nudge,
        template="academy_inactivity_nudge",
    )


async def send_completion_and_upsell(
    db: AsyncIOMotorDatabase,
    sender: EmailSender,
    *,
    user_id: str,
    user_email: str,
    course: dict,
    recommended_next_course: dict | None,
) -> None:
    await _send_once(
        db,
        sender,
        user_id=user_id,
        user_email=user_email,
        course_id=str(course["_id"]),
        course_title=course["title"],
        trigger_type=EmailTriggerType.completion,
        template="academy_completion",
    )
    if recommended_next_course is not None:
        await _send_once(
            db,
            sender,
            user_id=user_id,
            user_email=user_email,
            course_id=str(course["_id"]),
            course_title=course["title"],
            trigger_type=EmailTriggerType.upsell,
            template="academy_upsell",
            extra_context={
                "recommended_course_title": recommended_next_course["title"],
                "recommended_course_slug": recommended_next_course["slug"],
            },
        )
