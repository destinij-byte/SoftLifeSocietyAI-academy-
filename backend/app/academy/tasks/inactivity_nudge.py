"""Scheduled job: nudge enrolled users who have gone quiet mid-course.

Not wired to a scheduler here — wire it into whatever the main SLS backend
already uses for periodic jobs (APScheduler, Celery beat, a cron-triggered
Cloud Function, etc). Run it roughly once a day:

    python -m app.academy.tasks.inactivity_nudge
"""

import asyncio
from datetime import datetime, timedelta

from app.academy import repository as repo
from app.academy.services.emails import ConsoleEmailSender, send_inactivity_nudge
from app.config import settings
from app.db import get_database


async def run_inactivity_nudge_job() -> int:
    db = get_database()
    sender = ConsoleEmailSender()
    cutoff = datetime.utcnow() - timedelta(days=settings.inactivity_nudge_days)

    stale_enrollments = await repo.list_stale_active_enrollments(db, cutoff)
    sent_count = 0
    for enrollment in stale_enrollments:
        course = await repo.get_course(db, str(enrollment["course_id"]))
        if course is None:
            continue

        user = await db.users.find_one({"_id": enrollment["user_id"]})
        if user is None or not user.get("email"):
            continue

        sent = await send_inactivity_nudge(
            db, sender, user_id=str(enrollment["user_id"]), user_email=user["email"], course=course
        )
        if sent:
            sent_count += 1

    return sent_count


if __name__ == "__main__":
    count = asyncio.run(run_inactivity_nudge_job())
    print(f"Sent {count} inactivity nudge email(s).")
