# Soft Life Academy

A course/learning module for the Soft Life Society app: browse and purchase
courses, work through modules and lessons with progress tracking, download
gated workbooks, and get automated lifecycle emails (welcome, inactivity
nudge, completion, upsell). It's built to reuse the existing SLS user
accounts, auth, and subscription infrastructure — there's no separate login
system.

This repo contains the Academy module on its own (backend + two frontends),
meant to be merged into the main Soft Life Society app rather than deployed
as a standalone service.

## Structure

- [`backend/`](backend/README.md) — FastAPI routes, MongoDB models, Stripe
  checkout/webhook, email triggers, progress tracking. See its README for
  the full endpoint list and integration steps.
- [`web/`](web/README.md) — the Academy **website** (React + Vite): Home,
  Course Detail, Lesson Player, Workbook, and Certificate pages, calling the
  same backend API.
- [`frontend/`](frontend/README.md) — the Academy **mobile app** (Expo/React
  Native): the same five screens, built for iOS/Android instead of the web.

Both frontends implement the same learner flow and brand tokens against the
same backend — pick whichever surface (or both) the main SLS app needs.

## Build order

1. Courses/modules/lessons collections + admin CRUD (backend)
2. Stripe checkout + webhook → enrollment creation
3. Academy tab UI: course list → module/lesson view → video player → progress
4. Workbook download, gated behind purchase
5. Email trigger hooks (welcome, nudge, completion, upsell)
6. "Recommended next" upsell logic + UI card

All six are implemented here. See each module's README for what still needs
wiring (auth, email provider, Stripe keys, design tokens) once this is
merged into the real app.

## First course

**Build Your Digital Empire** — 7 modules, ~$149, single-course tier.
