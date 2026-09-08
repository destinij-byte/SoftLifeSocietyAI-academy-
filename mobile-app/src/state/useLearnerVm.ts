import { useMemo } from 'react';
import { useAcademy } from './AcademyContext';
import { CATALOG_TAGLINES, clampDone, firstName, flattenLessons, percentComplete, priceLabel } from './selectors';
import type { FlatLesson } from '../types';

export type ModuleRowVm = {
  key: string;
  title: string;
  numLabel: string;
  lessons: {
    key: string;
    title: string;
    metaLabel: string;
    dotLabel: string;
    isDone: boolean;
    isCurrent: boolean;
    flatIndex: number;
  }[];
};

/**
 * The learner-side "view model" — a direct port of `buildLearnerVm` from the original
 * Main.dc.html prototype. There it recomputed this object on every render from
 * `this.state` + `this.props`; here it's a memoized selector hook over the same
 * reducer state, consumed by all five learner screens (Home, Course, Player, Workbook,
 * Certificate) exactly the way `vm` was passed into AcademyScreen.dc.html.
 */
export function useLearnerVm() {
  const { state, dispatch, getCourse } = useAcademy();
  const { activeCourseId, overrideDone, learnerName } = state.learner;
  const course = getCourse(activeCourseId) ?? state.courses[0];

  return useMemo(() => {
    const flat: FlatLesson[] = flattenLessons(course);
    const total = flat.length;
    const done = clampDone(course, overrideDone ?? 0);
    const pct = percentComplete(course, done);
    const currentIndex = Math.min(done, Math.max(total - 1, 0));
    const current = flat[currentIndex];
    const next = flat[Math.min(currentIndex + 1, total - 1)];
    const isLast = done >= total - 1;

    const modules: ModuleRowVm[] = course.modules.map((m, mi) => ({
      key: m.id,
      title: m.title,
      numLabel: String(mi + 1).padStart(2, '0'),
      lessons: m.lessons.map((l, li) => {
        const flatIndex = flat.findIndex((f) => f.moduleIndex === mi && f.lessonIndex === li);
        const isDone = flatIndex < done;
        const isCurrent = flatIndex === currentIndex;
        return {
          key: l.id,
          title: l.title,
          metaLabel: isDone ? `Completed · ${l.duration}` : isCurrent ? `Continue · ${l.duration}` : l.duration,
          dotLabel: isDone ? '✓' : String(li + 1),
          isDone,
          isCurrent,
          flatIndex,
        };
      }),
    }));

    const catalog = state.courses
      .filter((c) => c.id !== course.id)
      .map((c) => ({
        id: c.id,
        title: c.title,
        tagline: CATALOG_TAGLINES[c.id] ?? '',
        price: priceLabel(c.price),
      }));

    return {
      course,
      flat,
      total,
      done,
      pct,
      pctLabel: `${pct}%`,
      currentIndex,
      current,
      next,
      isLast,
      greeting: `Good morning, ${firstName(learnerName)}`,
      learnerName,
      modules,
      priceLabel: priceLabel(course.price),
      currentModuleLabel: current ? `Module ${current.moduleNum}` : '',
      catalog,
      goToLesson: (flatIndex: number) => dispatch({ type: 'learner/setOverrideDone', value: flatIndex }),
      markComplete: () => dispatch({ type: 'learner/completeCurrent' }),
      setActiveCourse: (courseId: string) => dispatch({ type: 'learner/setActiveCourse', courseId }),
    };
  }, [course, state.courses, overrideDone, learnerName, dispatch]);
}
