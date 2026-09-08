#!/usr/bin/env python3
"""Generate branded workbook PDFs (fillable + printable) from parsed curriculum JSON."""
import json
import re
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
from classify import classify_item

# ---------- Brand ----------
INK = HexColor("#2B2521")
GOLD = HexColor("#C9A15E")
ROSE = HexColor("#D9A6A6")
BLUSH = HexColor("#F0C9C9")
CREAM = HexColor("#F5EDE4")
IVORY = HexColor("#FBF7F2")
MUTED = HexColor("#8A8078")
WHITE = HexColor("#FFFFFF")

SERIF = "Times-Bold"
SERIF_IT = "Times-Italic"
SANS = "Helvetica"
SANS_B = "Helvetica-Bold"

PW, PH = letter
MARGIN = 0.75 * 72


class Doc:
    def __init__(self, path, fillable):
        self.c = canvas.Canvas(path, pagesize=letter)
        self.fillable = fillable
        self.field_i = 0
        self.y = PH - MARGIN
        self.page_no = 0
        self.course_title = ""
        self.module_label = ""

    def next_field_name(self):
        self.field_i += 1
        return f"field_{self.field_i}"

    def new_page(self, header=True):
        self.c.showPage()
        self.page_no += 1
        self.y = PH - MARGIN
        if header:
            self.draw_running_header()

    def draw_running_header(self):
        c = self.c
        c.setFont(SANS, 8.5)
        c.setFillColor(MUTED)
        c.drawString(MARGIN, PH - 0.5 * 72, self.course_title.upper())
        c.drawRightString(PW - MARGIN, PH - 0.5 * 72, self.module_label)
        c.setStrokeColor(HexColor("#E5DCD0"))
        c.setLineWidth(0.75)
        c.line(MARGIN, PH - 0.58 * 72, PW - MARGIN, PH - 0.58 * 72)
        self.y = PH - 0.85 * 72

    def ensure_space(self, needed):
        if self.y - needed < MARGIN:
            self.new_page()

    def wrapped_text(self, text, font, size, color, x, width, leading=None, max_width=None):
        leading = leading or size * 1.35
        lines = simpleSplit(text, font, size, width)
        self.ensure_space(leading * len(lines) + 4)
        c = self.c
        c.setFont(font, size)
        c.setFillColor(color)
        for ln in lines:
            c.drawString(x, self.y - size, ln)
            self.y -= leading
        return len(lines)

    def rule_line(self, x, width, color=HexColor("#C9BEB2")):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(0.75)
        c.line(x, self.y, x + width, self.y)

    def blank_line(self, x, width, height=0.32 * 72, field_name=None, indent=0):
        self.ensure_space(height)
        self.y -= height
        if self.fillable:
            self.c.acroForm.textfield(
                name=field_name or self.next_field_name(),
                tooltip="Your answer",
                x=x, y=self.y, width=width, height=height - 4,
                borderStyle="underlined", borderColor=HexColor("#C9BEB2"),
                fillColor=WHITE, textColor=INK, fontSize=11, forceBorder=True,
            )
        else:
            self.rule_line(x, width)

    def checkbox_row(self, x, width, label_text):
        size = 12
        self.ensure_space(0.30 * 72)
        c = self.c
        box_y = self.y - 10
        if self.fillable:
            self.c.acroForm.checkbox(
                name=self.next_field_name(), tooltip=label_text[:60] or "Check",
                x=x, y=box_y, size=size, borderColor=INK, fillColor=WHITE,
                buttonStyle="check", forceBorder=True,
            )
        else:
            c.setStrokeColor(INK)
            c.setLineWidth(1)
            c.rect(x, box_y, size, size)
        tx = x + size + 8
        if label_text:
            c.setFont(SANS, 10.5)
            c.setFillColor(INK)
            c.drawString(tx, self.y - 9, label_text)
        else:
            self.rule_line(tx, width - size - 8) if not self.fillable else None
            if self.fillable:
                self.c.acroForm.textfield(
                    name=self.next_field_name(), tooltip="Label",
                    x=tx, y=box_y - 2, width=width - size - 8, height=16,
                    borderStyle="underlined", borderColor=HexColor("#C9BEB2"),
                    fillColor=WHITE, textColor=INK, fontSize=10,
                )
        self.y -= 0.34 * 72

    def spacer(self, h):
        self.ensure_space(h)
        self.y -= h


def draw_cover(doc, data):
    c = doc.c
    c.setFillColor(INK)
    c.rect(0, 0, PW, PH, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(PW - 0.3 * 72, PH - 0.2 * 72, 2.6 * 72, fill=1, stroke=0)
    c.setFillColor(ROSE)
    c.circle(0.0, -0.3 * 72, 1.0 * 72, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.setFont(SANS_B, 11)
    c.drawString(MARGIN, PH - 1.6 * 72, "SOFT LIFE SOCIETY  ·  AI ACADEMY")

    c.setFillColor(IVORY)
    c.setFont(SERIF, 30)
    lines = simpleSplit(data["title"], SERIF, 30, PW - 2 * MARGIN)
    ty = PH - 2.6 * 72
    for ln in lines:
        c.drawString(MARGIN, ty, ln)
        ty -= 36

    c.setFont(SERIF_IT, 13)
    c.setFillColor(IVORY)
    wrap = simpleSplit("The Companion Workbook", SERIF_IT, 13, PW - 2 * MARGIN)
    ty -= 10
    for ln in wrap:
        c.drawString(MARGIN, ty, ln)
        ty -= 18

    c.setFont(SANS, 10.5)
    c.setFillColor(GOLD)
    c.drawString(MARGIN, 1.3 * 72, f"{data['n_modules']} MODULES   ·   {data['n_lessons']} LESSONS")


def render_item(doc, item, x, width, idx):
    plan = classify_item(item)
    doc.ensure_space(0.5 * 72)
    # label / number chip
    c = doc.c
    c.setFillColor(BLUSH)
    c.rect(x, doc.y - 20, 22, 20, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(SERIF, 12)
    c.drawCentredString(x + 11, doc.y - 15, str(idx))
    doc.wrapped_text(plan["prompt"], SANS, 10.5, INK, x + 32, width - 32, leading=14.5)
    doc.spacer(6)

    t = plan["type"]
    if t == "table":
        headers = plan["headers"]
        rows = plan.get("rows", 4)
        ncols = max(2, len(headers))
        col_w = (width - 40) / ncols
        row_h = 0.32 * 72
        head_lines = [simpleSplit(h, SANS_B, 8.5, col_w - 10) for h in (headers[:ncols] + [""] * (ncols - len(headers)))]
        head_h = max(1, max(len(hl) for hl in head_lines)) * 10.5 + 8
        doc.ensure_space(head_h + row_h * rows + 10)
        tx = x + 40
        ty0 = doc.y
        # header row
        c.setFillColor(CREAM)
        c.rect(tx, ty0 - head_h, col_w * ncols, head_h, fill=1, stroke=0)
        c.setFont(SANS_B, 8.5)
        c.setFillColor(INK)
        for i, hl in enumerate(head_lines):
            ty = ty0 - 12
            for ln in hl:
                c.drawString(tx + i * col_w + 5, ty, ln)
                ty -= 10.5
        cy = ty0 - head_h
        for r in range(rows):
            cy -= row_h
            c.setStrokeColor(HexColor("#C9BEB2"))
            c.setLineWidth(0.6)
            c.line(tx, cy, tx + col_w * ncols, cy)
            if doc.fillable:
                for i in range(ncols):
                    doc.c.acroForm.textfield(
                        name=doc.next_field_name(), tooltip="Cell",
                        x=tx + i * col_w + 3, y=cy + 3, width=col_w - 6, height=row_h - 6,
                        borderStyle="solid", borderWidth=0, fillColor=WHITE, textColor=INK, fontSize=9.5,
                    )
        for i in range(ncols + 1):
            c.line(tx + i * col_w, ty0 - head_h, tx + i * col_w, cy)
        c.setLineWidth(0.8)
        c.line(tx, ty0, tx + col_w * ncols, ty0)
        doc.y = cy - 8

    elif t == "checklist":
        for label in plan["items"]:
            doc.checkbox_row(x + 32, width - 32, label)
        doc.spacer(4)

    elif t == "blank_template":
        for tmpl_raw in plan["templates"]:
            tmpl = re.sub(r"_{3,}", lambda m: "_" * max(10, len(m.group(0))), tmpl_raw)
            doc.wrapped_text(f'"{tmpl}"', SERIF_IT, 12, HexColor("#6B5F52"), x + 32, width - 32, leading=17)
            doc.spacer(4)
            doc.blank_line(x + 32, width - 32)
            doc.spacer(8)

    elif t == "day_grid":
        n = plan["n"]
        unit = plan["unit"]
        row_h = 0.30 * 72
        lx = x + 32 + 55
        lw = width - 32 - 55
        for i in range(1, n + 1):
            doc.ensure_space(row_h)
            row_top = doc.y
            c.setFont(SANS_B, 9)
            c.setFillColor(GOLD)
            c.drawString(x + 32, row_top - 9, f"{unit} {i}")
            line_y = row_top - 17
            if doc.fillable:
                doc.c.acroForm.textfield(
                    name=doc.next_field_name(), tooltip="Your answer",
                    x=lx, y=line_y - 2, width=lw, height=14,
                    borderStyle="underlined", borderColor=HexColor("#C9BEB2"),
                    fillColor=WHITE, textColor=INK, fontSize=10, forceBorder=True,
                )
            else:
                c.setStrokeColor(HexColor("#C9BEB2"))
                c.setLineWidth(0.75)
                c.line(lx, line_y, lx + lw, line_y)
            doc.y = row_top - row_h
        doc.spacer(6)

    elif t == "week_grid":
        weeks, slots = plan["weeks"], plan["slots"]
        col_w = (width - 40) / (slots + 1)
        row_h = 0.34 * 72
        doc.ensure_space(row_h * (weeks + 1) + 10)
        tx = x + 40
        ty0 = doc.y
        c.setFont(SANS_B, 9)
        c.setFillColor(INK)
        for s in range(slots):
            c.drawCentredString(tx + col_w + s * col_w + col_w / 2, ty0 - 12, f"Post {s+1}")
        cy = ty0 - row_h
        for w in range(weeks):
            c.setFont(SANS_B, 9)
            c.setFillColor(GOLD)
            c.drawString(tx, cy - row_h / 2 - 3, f"Wk {w+1}")
            for s in range(slots):
                bx = tx + col_w + s * col_w
                c.setStrokeColor(HexColor("#C9BEB2"))
                c.rect(bx, cy - row_h, col_w - 4, row_h)
                if doc.fillable:
                    doc.c.acroForm.textfield(
                        name=doc.next_field_name(), tooltip="Post",
                        x=bx + 2, y=cy - row_h + 2, width=col_w - 8, height=row_h - 4,
                        borderStyle="solid", borderWidth=0, fillColor=WHITE, textColor=INK, fontSize=8.5,
                    )
            cy -= row_h
        doc.y = cy - 8

    else:  # freeform
        for _ in range(plan["lines"]):
            doc.blank_line(x + 32, width - 32, height=0.30 * 72)
        doc.spacer(6)


def draw_module(doc, data, mod):
    doc.module_label = f"Module {mod['num']} · Workbook"
    doc.new_page()
    c = doc.c
    c.setFillColor(CREAM)
    c.rect(0, PH - 1.9 * 72, PW, 1.9 * 72, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont(SANS_B, 10)
    c.drawString(MARGIN, PH - 1.15 * 72, f"MODULE {mod['num']}")
    c.setFillColor(INK)
    c.setFont(SERIF, 22)
    c.drawString(MARGIN, PH - 1.5 * 72, mod["title"])
    doc.y = PH - 2.25 * 72

    for idx, item in enumerate(mod["workbook_items"], start=1):
        render_item(doc, item, MARGIN, PW - 2 * MARGIN, idx)
        doc.spacer(10)


def build(json_path, out_prefix):
    data = json.load(open(json_path, encoding="utf-8"))
    for fillable, suffix in [(True, "fillable"), (False, "print")]:
        doc = Doc(f"{out_prefix}-workbook-{suffix}.pdf", fillable)
        doc.course_title = data["title"]
        draw_cover(doc, data)
        for mod in data["modules"]:
            draw_module(doc, data, mod)
        doc.c.showPage()
        doc.c.save()
        print("wrote", f"{out_prefix}-workbook-{suffix}.pdf")


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
