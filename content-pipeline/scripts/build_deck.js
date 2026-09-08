const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ---------- Brand ----------
const C = {
  ivory: "FBF7F2",
  cream: "F5EDE4",
  blush: "F0C9C9",
  gold: "C9A15E",
  rose: "D9A6A6",
  ink: "2B2521",
};

const SERIF = "Cambria";       // stand-in for Cormorant Garamond (not preinstalled)
const SANS = "Calibri";        // stand-in for DM Sans (not preinstalled)

const ICON_DIR = path.join(__dirname, "icons");
function iconData(file) {
  const p = path.join(ICON_DIR, file + ".png");
  return "image/png;base64," + fs.readFileSync(p).toString("base64");
}

const MODULE_ICON_KEYS = {
  1: ["c1m1", "c1m2", "c1m3", "c1m4", "c1m5", "c1m6", "c1m7"],
  2: ["c2m1", "c2m2", "c2m3", "c2m4", "c2m5", "c2m6"],
  3: ["c3m1", "c3m2", "c3m3", "c3m4", "c3m5", "c3m6"],
  4: ["c4m1", "c4m2", "c4m3", "c4m4", "c4m5", "c4m6"],
};

// ---------- Layout constants ----------
const PW = 13.333, PH = 7.5;
const MARGIN = 0.6;

function iconCircle(slide, x, y, d, iconFile, circleColor, iconInset) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: circleColor }, line: { type: "none" } });
  const inset = iconInset !== undefined ? iconInset : d * 0.26;
  slide.addImage({ data: iconData(iconFile), x: x + inset, y: y + inset, w: d - inset * 2, h: d - inset * 2 });
}

// Precomputed solid blends (never combine `transparency` with `charSpacing` in one
// run — LibreOffice's PDF export truncates trailing characters when both are set
// on the same <a:rPr>; verified via isolated repro). Use a flat blended hex instead.
const MUTED_ON_LIGHT = "89847F";  // ink @ 55% over ivory/cream
const MUTED_ON_DARK = "9D9994";   // ivory @ 55% over ink
const MUTED_MIN_LABEL = "7C756F"; // ink @ 60% over cream
const MUTED_KICKER = "746E6A";    // ink @ 65% over ivory

function footer(slide, courseTitle, pageLabel, dark) {
  const color = dark ? MUTED_ON_DARK : MUTED_ON_LIGHT;
  slide.addText(courseTitle.toUpperCase(), {
    x: MARGIN, y: PH - 0.5, w: 6, h: 0.35, fontFace: SANS, fontSize: 9,
    color, charSpacing: 2, isTextBox: true, margin: 0,
  });
  slide.addText(pageLabel, {
    x: PW - MARGIN - 4, y: PH - 0.5, w: 4, h: 0.35, fontFace: SANS, fontSize: 9,
    color, align: "right", isTextBox: true, margin: 0,
  });
}

// ---------- Slide builders ----------

function coverSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: C.ink };
  slide.addShape("ellipse", { x: PW - 4.2, y: -2.2, w: 6.4, h: 6.4, fill: { color: C.gold }, line: { type: "none" }, transparency: 82 });
  slide.addShape("ellipse", { x: -3.0, y: 5.6, w: 3.6, h: 3.6, fill: { color: C.rose }, line: { type: "none" }, transparency: 85 });

  slide.addText("SOFT LIFE SOCIETY  ·  AI ACADEMY", {
    x: MARGIN, y: 0.9, w: PW - MARGIN * 2, h: 0.4, fontFace: SANS, fontSize: 13,
    color: C.gold, charSpacing: 3, isTextBox: true, margin: 0,
  });
  slide.addText(data.title, {
    x: MARGIN, y: 2.6, w: PW - MARGIN * 2 - 1.2, h: 2.0, fontFace: SERIF, fontSize: 54,
    color: C.ivory, bold: true, isTextBox: true, margin: 0,
  });
  slide.addText(data.promise, {
    x: MARGIN, y: 4.55, w: PW - MARGIN * 2 - 2.4, h: 1.3, fontFace: SANS, fontSize: 16,
    color: C.ivory, italic: true, transparency: 12, isTextBox: true, margin: 0, lineSpacingMultiple: 1.3,
  });
  slide.addText(`${data.n_modules} MODULES   ·   ${data.n_lessons} LESSONS   ·   ${data.tier.toUpperCase()}`, {
    x: MARGIN, y: 6.5, w: 9, h: 0.4, fontFace: SANS, fontSize: 11,
    color: C.gold, charSpacing: 2, isTextBox: true, margin: 0,
  });
}

function whoItsForSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: C.ivory };
  slide.addText("Who This Is For", {
    x: MARGIN, y: 0.8, w: 8, h: 0.9, fontFace: SERIF, fontSize: 34, bold: true, color: C.ink, isTextBox: true, margin: 0,
  });
  slide.addShape("rect", { x: MARGIN, y: 2.0, w: PW - MARGIN * 2, h: 3.6, fill: { color: C.cream }, line: { type: "none" } });
  iconCircle(slide, PW - MARGIN - 1.3, 0.6, 1.1, "quote-gold", C.cream);
  slide.addText(`"${data.who}"`, {
    x: MARGIN + 0.6, y: 2.4, w: PW - MARGIN * 2 - 1.2, h: 2.9, fontFace: SERIF, fontSize: 22,
    italic: true, color: C.ink, isTextBox: true, margin: 0, lineSpacingMultiple: 1.35, valign: "middle",
  });
  footer(slide, data.title, "Course Overview");
}

function moduleMapSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: C.ink };
  slide.addText("The Path", {
    x: MARGIN, y: 0.6, w: 8, h: 0.8, fontFace: SERIF, fontSize: 32, bold: true, color: C.ivory, isTextBox: true, margin: 0,
  });
  const mods = data.modules;
  const n = mods.length;
  const cols = n > 4 ? Math.ceil(n / 2) : n;
  const rows = Math.ceil(n / cols);
  const cellW = (PW - MARGIN * 2) / cols;
  const cellH = 2.35;
  const startY = 1.7;
  const iconKeys = MODULE_ICON_KEYS[data._courseNum];
  mods.forEach((m, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = MARGIN + col * cellW;
    const y = startY + row * cellH;
    iconCircle(slide, x + cellW / 2 - 0.45, y, 0.9, iconKeys[i] + "-ink", C.gold, 0.24);
    slide.addText(`MODULE ${m.num}`, {
      x: x + 0.1, y: y + 1.0, w: cellW - 0.2, h: 0.3, fontFace: SANS, fontSize: 10,
      color: C.gold, align: "center", charSpacing: 2, isTextBox: true, margin: 0,
    });
    slide.addText(m.title, {
      x: x + 0.15, y: y + 1.3, w: cellW - 0.3, h: 0.9, fontFace: SANS, fontSize: 13, bold: true,
      color: C.ivory, align: "center", isTextBox: true, margin: 0,
    });
  });
  footer(slide, data.title, "Course Overview", true);
}

function moduleDividerSlide(pres, data, mod, iconKey) {
  const slide = pres.addSlide();
  slide.background = { color: C.ink };
  slide.addShape("ellipse", { x: -3, y: -3, w: 8, h: 8, fill: { color: C.rose }, line: { type: "none" }, transparency: 88 });
  iconCircle(slide, PW / 2 - 0.75, 1.3, 1.5, iconKey + "-ink", C.gold, 0.4);
  slide.addText(`MODULE ${mod.num}`, {
    x: MARGIN, y: 3.15, w: PW - MARGIN * 2, h: 0.45, fontFace: SANS, fontSize: 14,
    color: C.gold, align: "center", charSpacing: 3, isTextBox: true, margin: 0,
  });
  slide.addText(mod.title, {
    x: MARGIN + 1, y: 3.65, w: PW - MARGIN * 2 - 2, h: 1.1, fontFace: SERIF, fontSize: 36, bold: true,
    color: C.ivory, align: "center", isTextBox: true, margin: 0,
  });
  slide.addText(mod.framing, {
    x: MARGIN + 1.6, y: 4.85, w: PW - MARGIN * 2 - 3.2, h: 1.4, fontFace: SANS, fontSize: 15,
    italic: true, color: C.ivory, transparency: 12, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.3,
  });
  footer(slide, data.title, `Module ${mod.num} of ${data.modules.length}`, true);
}

function lessonTitleSlide(pres, data, mod, lesson, iconKey) {
  const slide = pres.addSlide();
  slide.background = { color: C.ivory };
  slide.addShape("rect", { x: 0, y: 0, w: 4.6, h: PH, fill: { color: C.cream }, line: { type: "none" } });
  iconCircle(slide, 1.5, 1.0, 1.6, iconKey + "-ink", C.blush, 0.42);
  slide.addText(`LESSON ${lesson.num}`, {
    x: 0.5, y: 2.9, w: 3.6, h: 0.4, fontFace: SANS, fontSize: 12, color: C.gold, charSpacing: 2, isTextBox: true, margin: 0,
  });
  slide.addText(`${lesson.duration} MIN`, {
    x: 0.5, y: 5.6, w: 3.6, h: 0.4, fontFace: SANS, fontSize: 11, color: MUTED_MIN_LABEL, charSpacing: 2, isTextBox: true, margin: 0,
  });
  slide.addText(lesson.title, {
    x: 5.0, y: 1.5, w: PW - 5.0 - MARGIN, h: 2.0, fontFace: SERIF, fontSize: 32, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: "top",
  });
  slide.addText("Objective", {
    x: 5.0, y: 3.7, w: 3, h: 0.35, fontFace: SANS, fontSize: 11, bold: true, color: C.gold, charSpacing: 1, isTextBox: true, margin: 0,
  });
  slide.addText(lesson.objective, {
    x: 5.0, y: 4.1, w: PW - 5.0 - MARGIN, h: 1.7, fontFace: SANS, fontSize: 15, color: C.ink, isTextBox: true, margin: 0, lineSpacingMultiple: 1.3,
  });
  footer(slide, data.title, `Module ${mod.num} · Lesson ${lesson.num}`);
}

function hookSlide(pres, data, mod, lesson) {
  const slide = pres.addSlide();
  slide.background = { color: C.ink };
  iconCircle(slide, PW / 2 - 0.55, 0.85, 1.1, "quote-ivory", C.gold, 0.28);
  slide.addText(`"${lesson.opening_line}"`, {
    x: 1.4, y: 2.4, w: PW - 2.8, h: 3.2, fontFace: SERIF, fontSize: 30, italic: true, bold: true,
    color: C.ivory, align: "center", valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.25,
  });
  footer(slide, data.title, `Module ${mod.num} · Lesson ${lesson.num}`, true);
}

// One slide per teaching-outline bullet
function teachingPointSlide(pres, data, mod, lesson, bullet, idx, total) {
  const slide = pres.addSlide();
  slide.background = { color: C.ivory };
  slide.addText(lesson.title, {
    x: MARGIN, y: 0.55, w: PW - MARGIN * 2 - 2, h: 0.5, fontFace: SANS, fontSize: 13,
    color: MUTED_KICKER, charSpacing: 1, isTextBox: true, margin: 0,
  });
  slide.addText(`${idx + 1} / ${total}`, {
    x: PW - MARGIN - 1.6, y: 0.55, w: 1.6, h: 0.5, fontFace: SANS, fontSize: 13,
    color: C.gold, align: "right", isTextBox: true, margin: 0,
  });
  slide.addShape("rect", { x: MARGIN, y: 1.25, w: 0.55, h: 0.55, fill: { color: C.blush }, line: { type: "none" }, rectRadius: 0.08 });
  slide.addText(String(idx + 1), {
    x: MARGIN, y: 1.25, w: 0.55, h: 0.55, fontFace: SERIF, fontSize: 20, bold: true, color: C.ink,
    align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
  slide.addText(bullet, {
    x: MARGIN + 0.85, y: 1.9, w: PW - MARGIN * 2 - 0.85, h: 4.4, fontFace: SERIF, fontSize: 24,
    color: C.ink, isTextBox: true, margin: 0, lineSpacingMultiple: 1.35, valign: "top",
  });
  footer(slide, data.title, `Module ${mod.num} · Lesson ${lesson.num}`);
}

function workbookTransitionSlide(pres, data, mod) {
  const slide = pres.addSlide();
  slide.background = { color: C.cream };
  iconCircle(slide, PW / 2 - 0.7, 1.1, 1.4, "workbook-ink", C.gold, 0.36);
  slide.addText("Workbook Time", {
    x: MARGIN, y: 2.85, w: PW - MARGIN * 2, h: 0.7, fontFace: SERIF, fontSize: 30, bold: true,
    color: C.ink, align: "center", isTextBox: true, margin: 0,
  });
  slide.addText(`Module ${mod.num}: ${mod.title}`, {
    x: MARGIN, y: 3.55, w: PW - MARGIN * 2, h: 0.45, fontFace: SANS, fontSize: 14,
    color: C.ink, transparency: 30, align: "center", isTextBox: true, margin: 0,
  });
  const items = mod.workbook_items.slice(0, 4);
  let y = 4.3;
  items.forEach((it) => {
    slide.addShape("ellipse", { x: 1.6, y: y + 0.1, w: 0.12, h: 0.12, fill: { color: C.rose }, line: { type: "none" } });
    slide.addText(it, {
      x: 1.95, y: y - 0.08, w: PW - 3.5, h: 0.6, fontFace: SANS, fontSize: 13, color: C.ink,
      isTextBox: true, margin: 0, lineSpacingMultiple: 1.2,
    });
    y += 0.62;
  });
  footer(slide, data.title, `Module ${mod.num} · Workbook`);
}

function closingSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: C.ink };
  iconCircle(slide, PW / 2 - 0.75, 1.1, 1.5, "complete-ink", C.gold, 0.4);
  slide.addText("You Built It.", {
    x: MARGIN, y: 2.95, w: PW - MARGIN * 2, h: 0.9, fontFace: SERIF, fontSize: 38, bold: true,
    color: C.ivory, align: "center", isTextBox: true, margin: 0,
  });
  slide.addText(data.promise, {
    x: 2.0, y: 4.0, w: PW - 4.0, h: 1.4, fontFace: SANS, fontSize: 15, italic: true,
    color: C.ivory, transparency: 12, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.3,
  });
  slide.addText("SOFT LIFE SOCIETY  ·  AI ACADEMY", {
    x: MARGIN, y: 6.6, w: PW - MARGIN * 2, h: 0.4, fontFace: SANS, fontSize: 11,
    color: C.gold, align: "center", charSpacing: 2, isTextBox: true, margin: 0,
  });
}

// ---------- Main build ----------
function buildDeck(jsonPath, courseNum, outPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  data._courseNum = courseNum;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";

  coverSlide(pres, data);
  whoItsForSlide(pres, data);
  moduleMapSlide(pres, data);

  const iconKeys = MODULE_ICON_KEYS[courseNum];
  data.modules.forEach((mod, mi) => {
    moduleDividerSlide(pres, data, mod, iconKeys[mi]);
    mod.lessons.forEach((lesson) => {
      lessonTitleSlide(pres, data, mod, lesson, iconKeys[mi]);
      if (lesson.opening_line) hookSlide(pres, data, mod, lesson);
      lesson.bullets.forEach((b, bi) => teachingPointSlide(pres, data, mod, lesson, b, bi, lesson.bullets.length));
    });
    if (mod.workbook_items.length) workbookTransitionSlide(pres, data, mod);
  });

  closingSlide(pres, data);

  return pres.writeFile({ fileName: outPath }).then(() => {
    console.log("Slides:", pres.slides ? pres.slides.length : "?");
    console.log("Wrote", outPath);
  });
}

const jsonPath = process.argv[2];
const courseNum = parseInt(process.argv[3], 10);
const outPath = process.argv[4];
buildDeck(jsonPath, courseNum, outPath).catch((e) => { console.error(e); process.exit(1); });
