import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { academyApi } from "../api/academyApi";
import { getCurrentUserProfile } from "../auth/session";
import { ProgressBar } from "../components/ProgressBar";
import type { CourseSummary, MyCourseSummary } from "../types";
import "./HomePage.css";

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomePage() {
  const navigate = useNavigate();
  const [continueCourse, setContinueCourse] = useState<MyCourseSummary | null>(null);
  const [currentLessonLabel, setCurrentLessonLabel] = useState("Start the first lesson");
  const [catalog, setCatalog] = useState<CourseSummary[]>([]);
  const [avatarInitial, setAvatarInitial] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, published] = await Promise.all([
        academyApi.myCourses(),
        academyApi.listCourses(),
      ]);
      const enrolledIds = new Set(mine.map((c) => c.id));
      setCatalog(published.filter((c) => !enrolledIds.has(c.id)));

      const primary = mine[0] ?? null;
      setContinueCourse(primary);

      if (primary) {
        try {
          const detail = await academyApi.getCourseDetail(primary.slug);
          let found: string | null = null;
          for (const courseModule of detail.modules) {
            const lesson = courseModule.lessons.find((l) => l.id === primary.current_lesson_id);
            if (lesson) {
              found = `Module ${courseModule.order} · ${lesson.title}`;
              break;
            }
          }
          if (!found && detail.modules[0]?.lessons[0]) {
            found = `Module ${detail.modules[0].order} · ${detail.modules[0].lessons[0].title}`;
          }
          setCurrentLessonLabel(found ?? "Start the first lesson");
        } catch {
          // Course detail lookup is a nice-to-have for the label only.
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    getCurrentUserProfile()
      .then((profile) => setAvatarInitial(profile?.name?.[0]?.toUpperCase() ?? ""))
      .catch(() => setAvatarInitial(""));
  }, [load]);

  if (loading) {
    return <div className="page-centered">Loading…</div>;
  }

  return (
    <main className="home-page">
      <header className="home-page__header">
        <div>
          <div className="home-page__greeting">{greetingForNow()}</div>
          <h1 className="home-page__title display">Academy</h1>
        </div>
        <div className="home-page__avatar">{avatarInitial}</div>
      </header>

      {continueCourse ? (
        <section className="home-page__section">
          <div className="eyebrow">Continue</div>
          <button
            className="continue-card"
            onClick={() => navigate(`/courses/${continueCourse.slug}`)}
          >
            <div className="continue-card__row">
              <div className="continue-card__thumb" />
              <div className="continue-card__text">
                <div className="continue-card__title display">{continueCourse.title}</div>
                <div className="continue-card__meta">{currentLessonLabel}</div>
              </div>
            </div>
            <div className="continue-card__progress">
              <ProgressBar percentComplete={continueCourse.percent_complete} />
              <span className="continue-card__progress-label">
                {continueCourse.percent_complete}% complete
              </span>
            </div>
          </button>
        </section>
      ) : null}

      {catalog.length > 0 ? (
        <section className="home-page__section">
          <div className="eyebrow">Yours to Unlock</div>
          <div className="catalog-list">
            {catalog.map((course) => (
              <button
                key={course.id}
                className="catalog-row"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                <div className="catalog-row__thumb" />
                <div className="catalog-row__text">
                  <div className="catalog-row__title display">{course.title}</div>
                  <div className="catalog-row__tagline">{course.description}</div>
                </div>
                <div className="catalog-row__price">${course.price.toFixed(0)}</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {continueCourse ? (
        <button
          className="workbook-shortcut"
          onClick={() => navigate(`/courses/${continueCourse.id}/workbook`)}
        >
          <div>
            <div className="workbook-shortcut__title">Your workbooks</div>
            <div className="workbook-shortcut__meta">1 available to download</div>
          </div>
          <span className="workbook-shortcut__arrow">→</span>
        </button>
      ) : null}
    </main>
  );
}
