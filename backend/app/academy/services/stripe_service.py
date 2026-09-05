import stripe

from app.config import settings

stripe.api_key = settings.stripe_secret_key


def create_checkout_session(*, course: dict, user_id: str, user_email: str) -> stripe.checkout.Session:
    return stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        customer_email=user_email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": round(course["price"] * 100),
                    "product_data": {"name": course["title"]},
                },
                "quantity": 1,
            }
        ],
        success_url=f"{settings.stripe_success_url}?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.stripe_cancel_url,
        client_reference_id=user_id,
        metadata={"course_id": str(course["_id"]), "user_id": user_id},
    )


def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
