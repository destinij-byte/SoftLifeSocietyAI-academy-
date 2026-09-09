# Course Content Deliverables

Finished course media, produced outside this repo's code (a slide-deck and
workbook pipeline) and checked in here so they travel with the module and
have a stable place to be referenced from (`courses.workbook_url`,
marketing pages, admin uploads).

## 01 — Build Your Digital Empire

`01-build-your-digital-empire/` — the first course from the Academy build
order (spec section 4, step 1). 7 modules, 16 lessons, $149 single-course
tier. Content matches the curriculum seeded into the welcome-page demo
artifact.

- `deck.pptx` — 130-slide full-script teaching deck (cover, module dividers,
  one slide per teaching-outline bullet, opening-line pull quotes,
  workbook-transition slides). Brand colors (ivory/cream/blush/gold/rose/ink),
  Cambria/Calibri as PowerPoint-safe stands-ins for Cormorant Garamond/DM Sans.
- `workbook-fillable.pdf` — 10-page companion workbook with 135 real PDF
  AcroForm fields, one section per lesson, grouped by module. This is the
  file `workbook_url` should point to (or a signed copy of it) once this
  course exists in the `courses` collection.
- `workbook-print.pdf` — same 10-page layout with static ruled
  lines/checkboxes for handwriting, no form fields.
- `design-canvas/` — the source Claude Design canvas the app's learner-flow
  screens (`frontend/academy/screens/`) were ported from. See its own
  README for what's in it — it's a design reference, not runnable code.

## Regenerating or extending

These were produced by a curriculum → deck/workbook pipeline (curriculum
markdown → structured JSON → pptxgenjs deck + reportlab workbook pair) that
does not live in this repo. If you have the source curriculum docs and
build scripts, regenerate rather than hand-editing these binaries; otherwise
treat them as the source of truth for Course 1's content.
