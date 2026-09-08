"""Classify a workbook_item string into a render plan: table / checklist / blank-template / freeform."""
import re

NUM_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def extract_quoted(text):
    raw = re.findall(r'"([^"]+)"', text)
    return [q.strip().rstrip(",.") for q in raw]


STOPWORDS = {"plus", "with", "each", "next", "for", "and", "the", "a", "an"}


def looks_enumerable(items):
    """Reject candidate lists that are really a sentence fragment, not parallel items."""
    for it in items:
        words = set(w.lower().strip(".,") for w in it.split())
        if not words:
            return False
        # a genuine list item usually isn't dominated by connective/filler words
        if words <= STOPWORDS:
            return False
    return True


def find_number_word(text):
    for w, n in NUM_WORDS.items():
        if re.search(r"\b" + w + r"\b", text, re.I):
            return n
    m = re.search(r"\b(\d+)\b", text)
    if m:
        return int(m.group(1))
    return None


def split_list(s):
    # split on commas, handle "and" before last item
    s = s.strip().rstrip(".")
    parts = re.split(r",\s*(?:and\s+)?|\s+and\s+", s)
    return [p.strip() for p in parts if p.strip()]


def classify_item(text):
    quoted = extract_quoted(text)
    head, _, rest = text.partition(":")
    label = head.strip()
    body = rest.strip() if rest else text

    # 1. fill-in-the-blank template(s) (quoted strings containing underscores)
    blank_quotes = [q for q in quoted if "___" in q]
    if blank_quotes:
        return {"type": "blank_template", "label": label, "prompt": text, "templates": blank_quotes}

    # 1b. numbered day/month grid: "days 1-7", "12-month grid", "seven-day ... days 1-7"
    m = re.search(r"days?\s*(\d+)\s*[–-]\s*(\d+)", text, re.I)
    if m:
        n = int(m.group(2)) - int(m.group(1)) + 1
        return {"type": "day_grid", "label": label, "prompt": text, "n": n, "unit": "Day"}
    m = re.search(r"(\d+)\s*-\s*month", text, re.I)
    if m:
        return {"type": "day_grid", "label": label, "prompt": text, "n": int(m.group(1)), "unit": "Month"}

    # 1c. week x slot grid: "four weeks, three post slots per week" / weekly rhythm planners
    if re.search(r"\bweeks?\b", text, re.I) and ("grid" in text.lower() or "calendar" in text.lower()):
        weeks = find_number_word(re.search(r"([a-z]+|\d+)\s+weeks?", text, re.I).group(0)) if re.search(r"([a-z]+|\d+)\s+weeks?", text, re.I) else 4
        slot_m = re.search(r"([a-z]+|\d+)\s+post slots?", text, re.I)
        slots = find_number_word(slot_m.group(0)) if slot_m else 3
        return {"type": "week_grid", "label": label, "prompt": text, "weeks": weeks or 4, "slots": slots or 3}

    # 2. table: "columns" + 2+ quoted phrases, or "columns for X, Y, Z"
    if "column" in text.lower():
        if len(quoted) >= 2:
            return {"type": "table", "label": label, "prompt": text, "headers": quoted, "rows": 4}
        m = re.search(r"columns? for (.+?)(?:,?\s+with\b|\.|$)", text, re.I)
        if m:
            heads = split_list(m.group(1))
            if len(heads) >= 2:
                return {"type": "table", "label": label, "prompt": text, "headers": heads, "rows": 4}
        # parenthetical column names, e.g. "(prompt / how it went)"
        pm = re.search(r"\(([^)]+)\)", text)
        if pm and ("/" in pm.group(1) or "," in pm.group(1)):
            sep = "/" if "/" in pm.group(1) else ","
            heads = [h.strip() for h in pm.group(1).split(sep) if h.strip()]
            if len(heads) >= 2:
                return {"type": "table", "label": label, "prompt": text, "headers": heads, "rows": 4}
        n = find_number_word(text) or 2
        return {"type": "table", "label": label, "prompt": text, "headers": ["", ""], "rows": 4}

    # 3. checklist: mentions "checkbox"
    if "checkbox" in text.lower():
        items = None
        # try segment before em-dash / before "checkbox" mention, look for comma list
        seg = body
        seg = re.split(r"—|-\s*a checkbox|checkbox", seg, flags=re.I)[0]
        candidate = split_list(seg)
        if len(candidate) >= 2 and all(len(c) < 60 for c in candidate) and looks_enumerable(candidate):
            items = candidate
        if not items:
            n = find_number_word(text) or 4
            items = [""] * n
        return {"type": "checklist", "label": label, "prompt": text, "items": items}

    # default freeform — scale line count gently with how many fields/commas are named
    comma_count = body.count(",")
    n_lines = max(3, min(6, 3 + comma_count // 2))
    return {"type": "freeform", "label": label, "prompt": text, "lines": n_lines}
