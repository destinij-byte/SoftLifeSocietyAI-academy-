# Soft Life Academy

A course/learning module for the Soft Life Society app: browse and purchase
courses, work through modules and lessons with progress tracking, download
gated workbooks, and get automated lifecycle emails (welcome, inactivity
nudge, completion, upsell). It's built to reuse the existing SLS user
accounts, auth, and subscription infrastructure — there's no separate login
system.

This repo contains the Academy module on its own (backend + frontend),
meant to be merged into the main Soft Life Society app rather than deployed
as a standalone service.

## Structure

- [`backend/`](backend/README.md) — FastAPI routes, MongoDB models, Stripe
  checkout/webhook, email triggers, progress tracking. See its README for
  the full endpoint list and integration steps.
- [`frontend/`](frontend/README.md) — Expo/React Native screens and
  components for the Academy tab (course list, lesson player, progress,
  completion/upsell), styled to match the existing SLS brand palette and
  typography.

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
