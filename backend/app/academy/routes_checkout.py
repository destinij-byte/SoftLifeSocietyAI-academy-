import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.academy import repository as repo
from app.academy.models import EnrollmentModel
from app.academy.schemas import CheckoutRequest, CheckoutResponse
from app.academy.services import stripe_service
from app.academy.services.emails import ConsoleEmailSender, send_welcome_email
from app.db import get_database
from app.security import CurrentUser, get_current_user

router = APIRouter(tags=["academy-checkout"])

# Swap for the app's real email sender when wiring into the main backend.
_email_sender = ConsoleEmailSender()


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    body: CheckoutRequest,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    course = await repo.get_course(db, body.course_id)
    if course is None or course.get("status") != "published":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

    existing = await repo.get_enrollment(db, user.id, body.course_id)
    if existing is not None and existing.get("status") == "active":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Already enrolled in this course")

    session = stripe_service.create_checkout_session(
        course=course, user_id=user.id, user_email=user.email
    )
    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


@router.post("/webhook/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: AsyncIOMotorDatabase = Depends(get_database)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Stripe webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        course_id = session["metadata"]["course_id"]

        course = await repo.get_course(db, course_id)
        if course is None:
            return {"received": True}

        existing = await repo.get_enrollment(db, user_id, course_id)
        if existing is None:
            enrollment = EnrollmentModel(
                user_id=user_id,
                course_id=course_id,
                price_paid=session["amount_total"] / 100,
                stripe_checkout_session_id=session["id"],
            )
            await repo.create_enrollment(db, enrollment)
            await send_welcome_email(
                db,
                _email_sender,
                user_id=user_id,
                user_email=session.get("customer_email") or session.get("customer_details", {}).get("email", ""),
                course=course,
            )

    return {"received": True}
