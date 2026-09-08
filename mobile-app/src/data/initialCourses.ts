import { COURSES } from './seed';
import type { Course } from '../types';

/**
 * Builds the app's initial editable course tree from the generated curriculum seed
 * (src/data/seed.ts, produced by content-pipeline/scripts/export_seed_ts.py).
 *
 * This is the equivalent of `ADMIN_SEED` in the original Main.dc.html prototype: real
 * lesson titles and durations from the curriculum, wrapped in the admin-editable shape
 * (hasVideo/transcript/resources default to "not uploaded yet", since those are
 * per-account production assets, not curriculum content).
 */
function minutesToDuration(min: number): string {
  return `${min}:00`;
}

export function buildInitialCourses(): Course[] {
  return COURSES.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.promise,
    price: c.price,
    tier: c.tier,
    status: c.status,
    modules: c.modules.map((m) => ({
      id: `${c.id}-m${m.num}`,
      title: m.title,
      workbookItems: m.workbookItems,
      lessons: m.lessons.map((l) => ({
        id: `${c.id}-m${m.num}-l${l.num}`,
        title: l.title,
        duration: minutesToDuration(l.durationMin),
        // Only the flagship course (c1) ships with placeholder videos already "recorded"
        // in this seed, matching the original prototype's ADMIN_SEED (course 1 published
        // with hasVideo: true throughout, the other three still in draft with no video).
        hasVideo: c.id === 'c1',
        transcript: '',
        resources: [],
        objective: l.objective,
        openingLine: l.openingLine,
        bullets: l.bullets,
      })),
    })),
  }));
}
