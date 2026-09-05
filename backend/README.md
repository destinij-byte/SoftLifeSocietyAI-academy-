# Soft Life Academy — Backend Module

FastAPI + MongoDB (Motor) implementation of the Academy module described in
the spec. This is built to be **merged into the existing Soft Life Society
backend**, not run as a separate service.

## What's here

```
app/
  config.py           Settings (env prefix ACADEMY_)
  db.py                Motor client/database accessor — replace with the app's shared client
  security.py          JWT auth stand-in — replace with the app's real get_current_user/require_admin
  academy/
    models.py           Mongo document models (courses, modules, lessons, enrollments, email_triggers)
    schemas.py           Request/response DTOs
    repository.py        Mongo CRUD helpers
    services/
      progress.py         Pure percent-complete / auto-advance logic (unit tested)
      upsell.py            "Recommended next" selection
      emails.py            Email trigger dispatch + idempotent email_triggers logging
      stripe_service.py    Stripe Checkout session + webhook verification
      workbook.py           Signed, time-limited workbook download URLs
    tasks/
      inactivity_nudge.py  Standalone job — run on a daily schedule
    routes_public.py       GET /academy/courses, GET /academy/courses/{slug}
    routes_checkout.py     POST /academy/checkout, POST /academy/webhook/stripe
    routes_learner.py      GET /academy/my-courses, GET /academy/courses/{id}/progress,
                            GET /academy/lessons/{id}, POST /academy/lessons/{id}/complete,
                            GET /academy/courses/{id}/workbook
    routes_admin.py         Admin-only course/module/lesson CRUD
    router.py               Combines the above under prefix /academy
main.py                Standalone dev server (NOT for production — see Integration below)
tests/                 Unit tests for pure logic (progress calc, upsell, workbook signing)
```

Note: `GET /academy/lessons/{id}` is not in the original endpoint list but is
required for the video player — the public course-detail response
deliberately omits `video_url` (so unpurchased users can't see paid content
links), so an enrolled learner needs a way to fetch it. It's gated behind
the same active-enrollment check as everything else lesson-related.

## Integration into the main SLS backend

1. Copy `app/academy/` into the main backend's app package.
2. Delete `app/security.py` and `app/db.py` here — in `academy/routes_*.py`,
   swap the `from app.security import ...` / `from app.db import get_database`
   imports for the app's real auth dependency and shared Mongo client.
3. Add `app.include_router(academy_router)` to the main FastAPI app (see
   `app/main.py` for the shape).
4. Point `ACADEMY_MONGO_URI`/`ACADEMY_MONGO_DB_NAME` env vars at the same
   database the rest of the app uses (or drop `config.py` entirely and reuse
   the app's existing settings object).
5. Set `ACADEMY_STRIPE_SECRET_KEY` / `ACADEMY_STRIPE_WEBHOOK_SECRET` and
   register the `/academy/webhook/stripe` URL in the Stripe dashboard.
6. Swap `ConsoleEmailSender` (used in `routes_checkout.py` and
   `routes_learner.py`) for a real `EmailSender` implementation that calls
   the app's existing SendGrid/Postmark integration.
7. Schedule `app.academy.tasks.inactivity_nudge.run_inactivity_nudge_job`
   to run daily via whatever job runner the app already uses.
8. Give at least one user `is_admin: true` in the `users` collection (or
   swap in the app's real admin check) so the admin CRUD endpoints are
   reachable, then create the first course ("Build Your Digital Empire")
   through them.

## Running tests

```
pip install -r requirements.txt pytest
PYTHONPATH=. pytest tests/ -v
```

Tests cover pure business logic only (progress %, lesson auto-advance,
upsell selection, workbook URL signing) — they don't require a MongoDB
instance. Route-level integration tests would need a running Mongo (or
`mongomock`) and are left for whoever integrates this into the app with
its existing test fixtures.
