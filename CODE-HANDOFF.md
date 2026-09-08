# Soft Life Academy — code handoff

Two independent, self-contained pieces you can drop straight into a Claude Code
session (or any editor):

```
soft-life-academy-code/
├── content-pipeline/     Node + Python scripts that turn the curriculum markdown
│                         into slide decks, PDF workbooks, and app data
└── mobile-app/           An Expo (React Native + TypeScript) app implementing the
                           learner flow and the admin course-builder
```

## Where this came from

Both pieces started life as prototypes: a set of markdown curriculum documents, a
generated PowerPoint deck + fillable/print PDF workbook per course, and two Claude
Design canvas mockups (a learner-flow prototype and an admin course-builder
prototype). This handoff turns those prototypes into real, runnable code:

- **content-pipeline** is the same parse → slides / worksheets / canvas-preview
  pipeline that was already built and tested, reorganized into a clean project with
  one new script (`export_seed_ts.py`) that feeds the real curriculum content into
  the app below.
- **mobile-app** is a from-scratch React Native/Expo port of the two `.dc.html`
  canvas prototypes — every screen, every field, every button reproduces the
  original design and behavior, written as idiomatic React components + hooks
  instead of the canvas runtime's template syntax.

## Quick start

```bash
# 1. Regenerate the app's seed data from the curriculum docs (optional — the app
#    already ships with generated data in mobile-app/src/data/seed.ts)
cd content-pipeline/scripts
python3 -m pip install -r ../requirements.txt
python3 parse_curriculum.py ../curriculum-source ../output/json
python3 export_seed_ts.py ../output/json ../../mobile-app/src/data/seed.ts

# 2. Run the app
cd ../../mobile-app
npm install
npm start
```

See each folder's own README for details.

## Brand palette

Both halves share one palette (ink `#2B2521`, ivory `#FBF7F2`, cream `#F5EDE4`,
blush `#F0C9C9`, gold `#C9A15E`, rose `#D9A6A6`). It's defined once per project:
`content-pipeline/scripts/build_deck.js`'s `C` object for the slides/PDFs, and
`mobile-app/src/theme/colors.ts` for the app. If the brand palette ever changes,
update both.
