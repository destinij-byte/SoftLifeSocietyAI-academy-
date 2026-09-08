#!/usr/bin/env python3
"""Generate the course-content preview canvas artboards from parsed curriculum JSON."""
import json
import html
import os

SRC = "../deck/json"
OUT = "."

INK = "#2B2521"
IVORY = "#FBF7F2"
CREAM = "#F5EDE4"
BLUSH = "#F0C9C9"
GOLD = "#C9A15E"
ROSE = "#D9A6A6"

FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,500&family=DM+Sans:wght@400;500;700&display=swap">'
SERIF = "'Cormorant Garamond', Georgia, serif"
SANS = "'DM Sans', Helvetica, Arial, sans-serif"

COURSES = [
    ("01-build-your-digital-empire", "c1", GOLD),
    ("02-soft-life-financial-reset", "c2", ROSE),
    ("03-ai-for-the-modern-woman", "c3", GOLD),
    ("04-personal-brand-glow-up", "c4", ROSE),
]


def e(s):
    return html.escape(s, quote=True)


def load(slug):
    return json.load(open(os.path.join(SRC, f"{slug}.json"), encoding="utf-8"))


def wrap(body_html, extra_style=""):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {FONT_LINK}
  <style>
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; font-family: {SANS}; }}
    a {{ color: {GOLD}; }} a:hover {{ color: {INK}; }}
    {extra_style}
  </style>
</helmet>
{body_html}
</x-dc>
</body>
</html>
"""


def gen_main():
    cards = []
    for slug, cid, accent in COURSES:
        d = load(slug)
        cards.append(f"""
        <div style="background:{IVORY}; border-radius:4px; padding:36px 34px; display:flex; flex-direction:column; gap:14px; min-height:230px;">
          <div style="font-family:{SANS}; font-size:11px; letter-spacing:2px; color:{accent}; font-weight:700;">{e(d['tier'].upper())} &middot; {d['n_modules']} MODULES &middot; {d['n_lessons']} LESSONS</div>
          <div style="font-family:{SERIF}; font-size:30px; font-weight:700; color:{INK}; line-height:1.15;">{e(d['title'])}</div>
          <div style="font-family:{SANS}; font-size:13.5px; color:{INK}; opacity:0.72; line-height:1.55; flex-grow:1;">{e(d['promise'][0].upper() + d['promise'][1:])}</div>
          <div style="font-family:{SANS}; font-size:11px; font-weight:700; letter-spacing:1px; color:{INK};">{e(d['price'])}</div>
        </div>""")

    body = f"""
<div style="width:1200px; min-height:820px; background:{INK}; padding:64px 72px; display:flex; flex-direction:column; gap:44px;">
  <div style="display:flex; flex-direction:column; gap:10px;">
    <div style="font-family:{SANS}; font-size:12px; letter-spacing:3px; color:{GOLD}; font-weight:700;">SOFT LIFE SOCIETY &middot; AI ACADEMY</div>
    <div style="font-family:{SERIF}; font-size:52px; font-weight:700; color:{IVORY};">The Course Catalog</div>
    <div style="font-family:{SERIF}; font-style:italic; font-size:18px; color:{IVORY}; opacity:0.82; max-width:640px;">Four courses toward the same promise: a calmer, more capable, more fully-funded version of her life.</div>
  </div>
  <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:24px;">
    {''.join(cards)}
  </div>
</div>"""
    return wrap(body)


MODULE_ICONS_SIMPLE = None  # using numbered chips, not per-module icon set, for this lighter canvas


def gen_path(slug, cid, accent):
    d = load(slug)
    mods = d["modules"]
    n = len(mods)
    cols = 4 if n > 4 else n
    cards = []
    for m in mods:
        cards.append(f"""
        <div style="display:flex; flex-direction:column; gap:10px; padding:22px 6px;">
          <div style="width:52px; height:52px; border-radius:999px; background:{accent}; display:flex; align-items:center; justify-content:center; font-family:{SERIF}; font-size:22px; font-weight:700; color:{INK};">{m['num']}</div>
          <div style="font-family:{SANS}; font-size:10.5px; letter-spacing:1.5px; color:{accent}; font-weight:700;">MODULE {m['num']}</div>
          <div style="font-family:{SERIF}; font-size:19px; font-weight:700; color:{IVORY}; line-height:1.25;">{e(m['title'])}</div>
          <div style="font-family:{SANS}; font-size:12px; color:{IVORY}; opacity:0.68; line-height:1.5;">{e(m['framing'])}</div>
        </div>""")

    body = f"""
<div style="width:1200px; min-height:760px; background:{INK}; padding:56px 64px; display:flex; flex-direction:column; gap:36px;">
  <div style="display:flex; flex-direction:column; gap:8px;">
    <div style="font-family:{SANS}; font-size:11px; letter-spacing:2px; color:{accent}; font-weight:700;">{e(d['title'].upper())}</div>
    <div style="font-family:{SERIF}; font-size:38px; font-weight:700; color:{IVORY};">The Path</div>
  </div>
  <div style="display:grid; grid-template-columns:repeat({cols}, minmax(0,1fr)); gap:8px 28px;">
    {''.join(cards)}
  </div>
</div>"""
    return wrap(body)


def gen_lesson(slug, cid, accent):
    d = load(slug)
    m = d["modules"][0]
    l = m["lessons"][0]
    bullets = "".join(
        f"""
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <div style="min-width:30px; height:30px; border-radius:6px; background:{BLUSH}; display:flex; align-items:center; justify-content:center; font-family:{SERIF}; font-weight:700; font-size:14px; color:{INK};">{i+1}</div>
          <div style="font-family:{SANS}; font-size:14px; color:{INK}; line-height:1.55; padding-top:4px;">{e(b)}</div>
        </div>"""
        for i, b in enumerate(l["bullets"])
    )
    workbook_line = m["workbook_items"][0] if m["workbook_items"] else ""

    body = f"""
<div style="width:1200px; min-height:900px; background:{IVORY}; display:flex;">
  <div style="width:340px; background:{CREAM}; padding:56px 40px; display:flex; flex-direction:column; gap:18px;">
    <div style="width:88px; height:88px; border-radius:999px; background:{BLUSH}; display:flex; align-items:center; justify-content:center; font-family:{SERIF}; font-size:15px; font-weight:700; color:{INK};">{e(l['num'])}</div>
    <div style="font-family:{SANS}; font-size:11px; letter-spacing:2px; color:{accent}; font-weight:700;">MODULE {m['num']} &middot; LESSON {e(l['num'])}</div>
    <div style="font-family:{SANS}; font-size:12px; color:{INK}; opacity:0.6;">{l['duration']} MIN</div>
    <div style="flex-grow:1;"></div>
    <div style="font-family:{SERIF}; font-style:italic; font-size:16px; color:{INK}; opacity:0.85; line-height:1.5; border-top:1px solid rgba(43,37,33,0.15); padding-top:18px;">&ldquo;{e(l['opening_line'])}&rdquo;</div>
  </div>
  <div style="flex-grow:1; padding:56px 60px; display:flex; flex-direction:column; gap:30px;">
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="font-family:{SERIF}; font-size:34px; font-weight:700; color:{INK}; line-height:1.15;">{e(l['title'])}</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="font-family:{SANS}; font-size:11px; letter-spacing:1px; color:{accent}; font-weight:700;">OBJECTIVE</div>
        <div style="font-family:{SANS}; font-size:14.5px; color:{INK}; opacity:0.82; line-height:1.55; max-width:640px;">{e(l['objective'])}</div>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:16px;">
      {bullets}
    </div>
    <div style="margin-top:auto; padding-top:22px; border-top:1px solid rgba(43,37,33,0.12); display:flex; gap:14px; align-items:center;">
      <div style="font-family:{SANS}; font-size:10.5px; letter-spacing:1.5px; color:{accent}; font-weight:700; white-space:nowrap;">IN THE WORKBOOK</div>
      <div style="font-family:{SANS}; font-size:12.5px; color:{INK}; opacity:0.65; line-height:1.4;">{e(workbook_line)}</div>
    </div>
  </div>
</div>"""
    return wrap(body)


if __name__ == "__main__":
    with open(os.path.join(OUT, "Main.dc.html"), "w", encoding="utf-8") as f:
        f.write(gen_main())
    print("wrote Main.dc.html")

    for slug, cid, accent in COURSES:
        path_html = gen_path(slug, cid, accent)
        lesson_html = gen_lesson(slug, cid, accent)
        pname = f"{cid.upper()}Path.dc.html"
        lname = f"{cid.upper()}Lesson.dc.html"
        with open(os.path.join(OUT, pname), "w", encoding="utf-8") as f:
            f.write(path_html)
        with open(os.path.join(OUT, lname), "w", encoding="utf-8") as f:
            f.write(lesson_html)
        print("wrote", pname, lname)
