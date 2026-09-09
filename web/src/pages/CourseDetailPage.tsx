import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { academyApi } from "../api/academyApi";
import { LessonListItem } from "../components/LessonListItem";
import { ProgressBar } from "../components/ProgressBar";
import type { CourseDetail, ProgressResponse } from "../types";
import "./CourseDetailPage.css";

export function CourseDetailPage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await academyApi.getCourseDetail(slug);
      setCourse(detail);
      try {
        const prog = await academyApi.getProgress(detail.id);
        setProgress(prog);
        setEnrolled(true);
      } catch {
        setEnrolled(false);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEnroll() {
    if (!course) return;
    setEnrolling(true);
    try {
      const { checkout_url } = await academyApi.checkout(course.id);
      window.location.href = checkout_url;
    } finally {
      setEnrolling(false);
    }
  }

  if (loading || !course) {
    return <div className="page-centered">Loading…</div>;
  }

  const completedIds = new Set(progress?.lessons_completed ?? []);

  return (
    <main className="course-detail-page">
      <h1 className="course-detail-page__title display">{course.title}</h1>
      <p className="course-detail-page__description">{course.description}</p>

      {enrolled && progress ? (
        <div className="course-detail-page__progress">
          <ProgressBar percentComplete={progress.percent_complete} />
          <span className="course-detail-page__progress-label">
            {progress.percent_complete}% complete
          </span>
        </div>
      ) : (
        <button className="enroll-button" onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? "Redirecting to checkout…" : `Enroll — $${course.price.toFixed(0)}`}
        </button>
      )}

      {course.modules.map((courseModule) => (
        <div key={courseModule.id} className="module-block">
          <h2 className="module-block__title display">{courseModule.title}</h2>
          {courseModule.lessons.map((lesson) => (
            <LessonListItem
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedIds.has(lesson.id)}
              isCurrent={progress?.current_lesson_id === lesson.id}
              onClick={() => {
                if (!enrolled) return;
                navigate(`/courses/${course.id}/lessons/${lesson.id}`);
              }}
            />
          ))}
        </div>
      ))}

      {enrolled ? (
        <div className="course-detail-page__workbook">
          <button
            className="workbook-button"
            onClick={() => navigate(`/courses/${course.id}/workbook`)}
          >
            Download the Workbook
          </button>
        </div>
      ) : null}
    </main>
  );
}
