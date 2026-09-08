#!/usr/bin/env python3
"""Parse the curriculum markdown files into structured JSON for slide/worksheet generation."""
import re
import json
import sys
import os

def parse_file(path):
    text = open(path, encoding="utf-8").read()

    title_m = re.search(r"^# (.+?) — Full Curriculum", text, re.M)
    title = title_m.group(1).strip()

    meta_m = re.search(r"\*\*Price:\*\* (.+?) · \*\*Tier:\*\* (.+?) · \*\*Modules:\*\* (\d+) · \*\*Lessons:\*\* (\d+)", text)
    price, tier, n_modules, n_lessons = meta_m.groups()

    promise_m = re.search(r"\*\*The promise:\*\* (.+?)\n", text)
    promise = promise_m.group(1).strip() if promise_m else ""

    who_m = re.search(r"\*\*Who it's for:\*\* (.+?)\n", text)
    who = who_m.group(1).strip() if who_m else ""

    note_m = re.search(r"\*\*Note before recording:\*\* (.+?)\n", text)
    note = note_m.group(1).strip() if note_m else ""

    # Split into module blocks on "## Module"
    module_blocks = re.split(r"^## Module ", text, flags=re.M)[1:]

    modules = []
    for mb in module_blocks:
        head_m = re.match(r"(\d+) — (.+?)\n", mb)
        mod_num = int(head_m.group(1))
        mod_title = head_m.group(2).strip()

        framing_m = re.search(r"\*Framing: (.+?)\*", mb)
        framing = framing_m.group(1).strip() if framing_m else ""

        # Lessons: split on "### Lesson"
        lesson_blocks = re.split(r"^### Lesson ", mb, flags=re.M)[1:]
        lessons = []
        for lb in lesson_blocks:
            lhead_m = re.match(r"([\d.]+) — (.+?) \((\d+) min\)\n", lb)
            lesson_num = lhead_m.group(1)
            lesson_title = lhead_m.group(2).strip()
            duration = int(lhead_m.group(3))

            obj_m = re.search(r"\*\*Objective:\*\* (.+?)\n", lb)
            objective = obj_m.group(1).strip() if obj_m else ""

            outline_m = re.search(r"Teaching outline:\n((?:- .+\n?)+)", lb)
            bullets = []
            if outline_m:
                bullets = [b.strip("- ").strip() for b in outline_m.group(1).strip().split("\n")]

            opening_m = re.search(r"\*\*Opening line:\*\* \"(.+?)\"", lb)
            opening = opening_m.group(1).strip() if opening_m else ""

            lessons.append({
                "num": lesson_num,
                "title": lesson_title,
                "duration": duration,
                "objective": objective,
                "bullets": bullets,
                "opening_line": opening,
            })

        # Workbook section for this module
        wb_m = re.search(r"\*\*Workbook — Module \d+: (.+?)\*\*\n((?:- .+\n?)+)", mb)
        workbook_items = []
        if wb_m:
            workbook_items = [b.strip("- ").strip() for b in wb_m.group(2).strip().split("\n")]

        modules.append({
            "num": mod_num,
            "title": mod_title,
            "framing": framing,
            "lessons": lessons,
            "workbook_items": workbook_items,
        })

    return {
        "title": title,
        "price": price,
        "tier": tier,
        "n_modules": int(n_modules),
        "n_lessons": int(n_lessons),
        "promise": promise,
        "who": who,
        "note": note,
        "modules": modules,
    }


if __name__ == "__main__":
    src_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    os.makedirs(out_dir, exist_ok=True)
    for fname in sorted(os.listdir(src_dir)):
        if fname.endswith(".md"):
            data = parse_file(os.path.join(src_dir, fname))
            out_path = os.path.join(out_dir, fname.replace(".md", ".json"))
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            actual_lessons = sum(len(m["lessons"]) for m in data["modules"])
            actual_modules = len(data["modules"])
            ok = "OK" if (actual_lessons == data["n_lessons"] and actual_modules == data["n_modules"]) else "MISMATCH"
            print(f"{fname}: {actual_modules} modules, {actual_lessons} lessons (declared {data['n_modules']}/{data['n_lessons']}) [{ok}] -> {out_path}")
