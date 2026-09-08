import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { buildInitialCourses } from '../data/initialCourses';
import type { Course, Lesson, Module, Resource } from '../types';
import { clampDone, flattenLessons } from './selectors';

/**
 * Central app state, ported from the `state`/`setState` block and the
 * buildCoursesVm / buildCourseVm / buildModuleVm / buildLessonVm / buildLearnerVm
 * methods of the original Main.dc.html prototype's `Component extends DCLogic` class.
 *
 * There it was one mutable `this.state.courses` tree mutated in place and re-rendered
 * via `this.setState({ courses })`. Here the same operations are expressed as a
 * reducer over an immutable tree, which is the idiomatic React/RN equivalent — every
 * action below corresponds 1:1 to a handler you'll find in that original file
 * (onTitleInput, onAddModule, onUp/onDown, onRemove, onToggleVideo, etc).
 */

type LearnerState = {
  /** Which course the learner screens are currently showing. */
  activeCourseId: string;
  /** Manual override for "lessons completed" — mirrors learnerOverrideDone in the prototype. */
  overrideDone: number | null;
  learnerName: string;
};

type State = {
  courses: Course[];
  learner: LearnerState;
};

type Action =
  | { type: 'course/add'; id: string }
  | { type: 'course/update'; courseId: string; patch: Partial<Pick<Course, 'title' | 'description' | 'price' | 'tier' | 'status'>> }
  | { type: 'module/add'; courseId: string }
  | { type: 'module/update'; courseId: string; moduleId: string; patch: Partial<Pick<Module, 'title'>> }
  | { type: 'module/move'; courseId: string; moduleId: string; direction: 'up' | 'down' }
  | { type: 'module/remove'; courseId: string; moduleId: string }
  | { type: 'lesson/add'; courseId: string; moduleId: string }
  | { type: 'lesson/update'; courseId: string; moduleId: string; lessonId: string; patch: Partial<Pick<Lesson, 'title' | 'duration' | 'transcript'>> }
  | { type: 'lesson/toggleVideo'; courseId: string; moduleId: string; lessonId: string }
  | { type: 'lesson/move'; courseId: string; moduleId: string; lessonId: string; direction: 'up' | 'down' }
  | { type: 'lesson/remove'; courseId: string; moduleId: string; lessonId: string }
  | { type: 'resource/add'; courseId: string; moduleId: string; lessonId: string }
  | { type: 'resource/update'; courseId: string; moduleId: string; lessonId: string; resourceId: string; patch: Partial<Pick<Resource, 'label' | 'url'>> }
  | { type: 'resource/remove'; courseId: string; moduleId: string; lessonId: string; resourceId: string }
  | { type: 'learner/setActiveCourse'; courseId: string }
  | { type: 'learner/setOverrideDone'; value: number }
  | { type: 'learner/completeCurrent' };

function swap<T>(arr: T[], i: number, j: number): T[] {
  const next = arr.slice();
  const tmp = next[i];
  next[i] = next[j];
  next[j] = tmp;
  return next;
}

function mapCourse(state: State, courseId: string, fn: (c: Course) => Course): Course[] {
  return state.courses.map((c) => (c.id === courseId ? fn(c) : c));
}

function mapModule(course: Course, moduleId: string, fn: (m: Module) => Module): Module[] {
  return course.modules.map((m) => (m.id === moduleId ? fn(m) : m));
}

function mapLesson(mod: Module, lessonId: string, fn: (l: Lesson) => Lesson): Lesson[] {
  return mod.lessons.map((l) => (l.id === lessonId ? fn(l) : l));
}

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'course/add': {
      const id = action.id;
      const course: Course = {
        id,
        title: 'New course',
        description: '',
        price: 0,
        tier: 'single',
        status: 'draft',
        modules: [],
      };
      return { ...state, courses: [...state.courses, course] };
    }

    case 'course/update':
      return { ...state, courses: mapCourse(state, action.courseId, (c) => ({ ...c, ...action.patch })) };

    case 'module/add': {
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: [...c.modules, { id: newId('m'), title: 'New module', lessons: [] }],
        })),
      };
    }

    case 'module/update':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({ ...m, ...action.patch })),
        })),
      };

    case 'module/move':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => {
          const idx = c.modules.findIndex((m) => m.id === action.moduleId);
          if (idx === -1) return c;
          const target = action.direction === 'up' ? idx - 1 : idx + 1;
          if (target < 0 || target >= c.modules.length) return c;
          return { ...c, modules: swap(c.modules, idx, target) };
        }),
      };

    case 'module/remove':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: c.modules.filter((m) => m.id !== action.moduleId),
        })),
      };

    case 'lesson/add':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: [
              ...m.lessons,
              { id: newId('l'), title: 'New lesson', duration: '0:00', hasVideo: false, transcript: '', resources: [] },
            ],
          })),
        })),
      };

    case 'lesson/update':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: mapLesson(m, action.lessonId, (l) => ({ ...l, ...action.patch })),
          })),
        })),
      };

    case 'lesson/toggleVideo':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: mapLesson(m, action.lessonId, (l) => ({ ...l, hasVideo: !l.hasVideo })),
          })),
        })),
      };

    case 'lesson/move':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => {
            const idx = m.lessons.findIndex((l) => l.id === action.lessonId);
            if (idx === -1) return m;
            const target = action.direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= m.lessons.length) return m;
            return { ...m, lessons: swap(m.lessons, idx, target) };
          }),
        })),
      };

    case 'lesson/remove':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: m.lessons.filter((l) => l.id !== action.lessonId),
          })),
        })),
      };

    case 'resource/add':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: mapLesson(m, action.lessonId, (l) => ({
              ...l,
              resources: [...l.resources, { id: newId('r'), label: '', url: '' }],
            })),
          })),
        })),
      };

    case 'resource/update':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: mapLesson(m, action.lessonId, (l) => ({
              ...l,
              resources: l.resources.map((r) => (r.id === action.resourceId ? { ...r, ...action.patch } : r)),
            })),
          })),
        })),
      };

    case 'resource/remove':
      return {
        ...state,
        courses: mapCourse(state, action.courseId, (c) => ({
          ...c,
          modules: mapModule(c, action.moduleId, (m) => ({
            ...m,
            lessons: mapLesson(m, action.lessonId, (l) => ({
              ...l,
              resources: l.resources.filter((r) => r.id !== action.resourceId),
            })),
          })),
        })),
      };

    case 'learner/setActiveCourse':
      return { ...state, learner: { ...state.learner, activeCourseId: action.courseId, overrideDone: null } };

    case 'learner/setOverrideDone':
      return { ...state, learner: { ...state.learner, overrideDone: action.value } };

    case 'learner/completeCurrent': {
      const course = state.courses.find((c) => c.id === state.learner.activeCourseId);
      if (!course) return state;
      const total = flattenLessons(course).length;
      const current = state.learner.overrideDone ?? 5;
      const next = clampDone(course, current + 1);
      return { ...state, learner: { ...state.learner, overrideDone: Math.min(next, total) } };
    }

    default:
      return state;
  }
}

function initialState(): State {
  return {
    courses: buildInitialCourses(),
    learner: { activeCourseId: 'c1', overrideDone: 5, learnerName: 'Jasmine Carter' },
  };
}

type ContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  getCourse: (id: string) => Course | undefined;
  /** Creates a new draft course and returns its id synchronously, for navigating straight into its editor. */
  createCourse: () => string;
};

const AcademyStateContext = createContext<ContextValue | null>(null);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const getCourse = useCallback((id: string) => state.courses.find((c) => c.id === id), [state.courses]);

  const createCourse = useCallback(() => {
    const id = newId('c');
    dispatch({ type: 'course/add', id });
    return id;
  }, [dispatch]);

  const value = useMemo(() => ({ state, dispatch, getCourse, createCourse }), [state, getCourse, createCourse]);

  return <AcademyStateContext.Provider value={value}>{children}</AcademyStateContext.Provider>;
}

export function useAcademy(): ContextValue {
  const ctx = useContext(AcademyStateContext);
  if (!ctx) throw new Error('useAcademy must be used within an AcademyProvider');
  return ctx;
}
