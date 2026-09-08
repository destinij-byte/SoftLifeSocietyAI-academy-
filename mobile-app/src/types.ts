/**
 * Domain types for Soft Life Academy.
 *
 * Mirrors the shape used by the two Claude Design canvas prototypes this app was ported
 * from (Main.dc.html / AcademyScreen.dc.html / AdminScreen.dc.html): a `Course` has
 * `Module`s, each `Module` has `Lesson`s. The admin screens edit this tree directly;
 * the learner screens derive read-only view-models from it (see src/state/selectors.ts).
 */

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseTier = 'single' | 'bundle' | 'full_access';

export type Resource = {
  id: string;
  label: string;
  url: string;
};

export type Lesson = {
  id: string;
  title: string;
  /** mm:ss as edited by the admin, e.g. "10:00" */
  duration: string;
  hasVideo: boolean;
  transcript: string;
  resources: Resource[];
  /**
   * Extra content carried over from the curriculum pipeline so the learner player
   * screen has real teaching copy to show, even though the admin UI itself only
   * edits title/duration/video/transcript/resources.
   */
  objective?: string;
  openingLine?: string;
  bullets?: string[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
  /** Workbook prompts for this module, carried over from the curriculum pipeline. */
  workbookItems?: string[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  tier: CourseTier;
  status: CourseStatus;
  modules: Module[];
};

/** A lesson flattened out of the module tree, with its position, for progress math. */
export type FlatLesson = {
  id: string;
  title: string;
  durationLabel: string;
  moduleTitle: string;
  moduleNum: number;
  lessonNum: number;
  moduleIndex: number;
  lessonIndex: number;
};
