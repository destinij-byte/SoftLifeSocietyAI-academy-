import type { Course, FlatLesson } from '../types';

/**
 * Marketing taglines for the catalog / "yours to unlock" cards. These are short
 * promotional lines, not curriculum content, so they live here rather than in the
 * generated seed data.
 */
export const CATALOG_TAGLINES: Record<string, string> = {
  c1: 'Idea to income, one offer at a time',
  c2: 'Budget, debt, savings, goals',
  c3: 'Planning, content, admin',
  c4: 'Presence, strategy, monetisation',
};

export function flattenLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = [];
  course.modules.forEach((m, mi) => {
    m.lessons.forEach((l, li) => {
      out.push({
        id: l.id,
        title: l.title,
        durationLabel: l.duration,
        moduleTitle: m.title,
        moduleNum: mi + 1,
        lessonNum: li + 1,
        moduleIndex: mi,
        lessonIndex: li,
      });
    });
  });
  return out;
}

export function clampDone(course: Course, done: number): number {
  const total = flattenLessons(course).length;
  return Math.max(0, Math.min(total, done));
}

export function percentComplete(course: Course, done: number): number {
  const total = flattenLessons(course).length;
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function moduleCount(course: Course): number {
  return course.modules.length;
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function otherPublishableCourses(courses: Course[], excludeId: string): Course[] {
  return courses.filter((c) => c.id !== excludeId);
}

export function priceLabel(price: number): string {
  return `$${Number.isFinite(price) ? price.toFixed(0) : '0'}`;
}

export function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
