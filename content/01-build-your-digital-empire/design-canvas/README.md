# Learner-Flow Design Canvas (source)

The raw Claude Design canvas export this course's learner-flow screens were
ported from. Kept here so the design intent stays traceable — the actual
runtime code lives in `frontend/academy/screens/` (`HomeScreen.tsx`,
`CourseDetailScreen.tsx`, `LessonPlayerScreen.tsx`, `WorkbookScreen.tsx`,
`CertificateScreen.tsx`).

- `Soft Life Academy.dc.html` — the canvas cover artboard: nav pills to
  switch screens, wraps `AcademyScreen` in an iOS device frame.
- `AcademyScreen.dc.html` — the actual 5 screens (Home, Course/Lesson list,
  Player, Workbook, Certificate), each gated behind a `<sc-if>` on a shared
  view-model.
- `ios-frame.jsx` — the iOS device-frame chrome component the canvas uses
  for preview (status bar, home indicator).
- `support.js` — the Claude Design canvas runtime (`dc-runtime`) these
  `.dc.html` files depend on to render. Generated, not hand-written.
- `.thumbnail` — the canvas's thumbnail image.

These are **not runnable app code** — `<x-dc>`, `<sc-if>`, `<sc-for>`, and
`{{ }}` bindings only resolve inside Claude Design's canvas editor/runtime.
Treat this as a visual/structural reference (open the `.dc.html` files to
read the markup) rather than something to import or execute directly.
