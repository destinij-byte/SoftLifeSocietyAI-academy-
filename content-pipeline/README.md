# Content pipeline

Turns the curriculum markdown docs into everything else: slide decks, PDF
workbooks, design-canvas previews, and the app's seed data.

```
curriculum-source/*.md        Course scripts — the source of truth
scripts/
  parse_curriculum.py         .md -> structured JSON
  export_seed_ts.py           JSON -> mobile-app/src/data/seed.ts (real course content)
  build_deck.js                JSON -> branded .pptx slide deck (one slide per teaching
                                outline bullet, using pptxgenjs)
  render_icons.js / icon_jobs.json / icons/
                                Pre-rendered Phosphor-icon PNGs used by build_deck.js.
                                icons/ already has the 56 icons this content needs; only
                                re-run render_icons.js if you add new module icons.
  classify.py                  Rule-based classifier: turns a workbook prompt string into
                                a render plan (table / checklist / fill-in-blank / day
                                grid / week grid / freeform)
  build_worksheets.py          JSON -> fillable + printable PDF workbook (reportlab),
                                using classify.py for each workbook item's layout
  generate_canvas_previews.py  JSON -> a lightweight Claude Design canvas preview
                                (catalog + module map + one worked lesson per course).
                                Only usable inside a Claude Design canvas session — the
                                .dc.html files it emits are not standalone web pages.
output/                        Generated files land here (gitignored)
```

## Running the full pipeline

```bash
pip install -r requirements.txt
npm install   # only needed if you also want to rebuild slide decks (pptxgenjs, sharp, react-icons)

cd scripts

# 1. Curriculum markdown -> JSON
python3 parse_curriculum.py ../curriculum-source ../output/json

# 2. JSON -> mobile-app seed data (run this whenever the curriculum changes)
python3 export_seed_ts.py ../output/json ../../mobile-app/src/data/seed.ts

# 3. JSON -> slide decks (one .pptx per course)
mkdir -p ../output/decks
for f in ../output/json/*.json; do
  name=$(basename "$f" .json)
  course_num=$(echo "$name" | grep -oE '^[0-9]+' | sed 's/^0*//')
  node build_deck.js "$f" "$course_num" "../output/decks/${name}.pptx"
done

# 4. JSON -> fillable + printable PDF workbooks
mkdir -p ../output/worksheets
for f in ../output/json/*.json; do
  name=$(basename "$f" .json)
  python3 build_worksheets.py "$f" "../output/worksheets/${name}"
done
```

Step 2 is the one that matters for the app: it's what keeps
`mobile-app/src/data/seed.ts` in sync with the curriculum docs. Steps 3 and 4
regenerate the marketing/production deliverables (the actual PowerPoint decks and
PDF workbooks) and aren't required for the app to run.

## Editing the curriculum

Edit the markdown files in `curriculum-source/`, following the existing structure
exactly (`# Title — Full Curriculum`, `**Price:** ... **Tier:** ... **Modules:** N
**Lessons:** N`, `## Module N — Title`, `### Lesson N.N — Title (NN min)`,
`**Objective:**`, `Teaching outline:` bullet list, `**Opening line:** "..."`, and a
trailing `**Workbook — Module N: Title**` bullet list) — `parse_curriculum.py`'s
regexes depend on that exact shape. After editing, re-run steps 1 and 2 above.

## Notes

- `build_deck.js` uses Cambria/Calibri as safe substitutes for Cormorant
  Garamond/DM Sans (not preinstalled in most PowerPoint/LibreOffice environments).
- `build_worksheets.py` uses ReportLab's built-in core fonts for the same reason.
  If you want the real Cormorant Garamond/DM Sans in the PDFs, download the font
  files yourself, register them with `reportlab.pdfbase.pdfmetrics.registerFont`,
  and swap the font names in `build_worksheets.py` — the sandbox this was built in
  couldn't reach any font CDN to fetch and test that path.
- `generate_canvas_previews.py` only makes sense if you have access to a Claude
  Design canvas session — it emits `.dc.html` artboard files, not standalone HTML.
