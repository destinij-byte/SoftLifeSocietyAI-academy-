import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { academyApi } from "../api/academyApi";
import type { LessonDetail } from "../types";
import "./LessonPlayerPage.css";

export function LessonPlayerPage() {
  const navigate = useNavigate();
  const { courseId = "", lessonId = "" } = useParams();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [completing, setCompleting] = useState(false);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    hasAutoCompletedRef.current = false;
    setLesson(null);
    academyApi.getLesson(lessonId).then(setLesson);
  }, [lessonId]);

  async function handleComplete() {
    if (hasAutoCompletedRef.current) return;
    hasAutoCompletedRef.current = true;
    setCompleting(true);
    try {
      const result = await academyApi.completeLesson(lessonId);
      if (result.course_completed) {
        const params = result.recommended_next_course_id
          ? `?recommended=${result.recommended_next_course_id}`
          : "";
        navigate(`/courses/${courseId}/certificate${params}`, { replace: true });
      } else if (result.next_lesson_id) {
        navigate(`/courses/${courseId}/lessons/${result.next_lesson_id}`, { replace: true });
      } else {
        navigate(-1);
      }
    } finally {
      setCompleting(false);
    }
  }

  if (!lesson) {
    return <div className="page-centered page-centered--dark">Loading…</div>;
  }

  return (
    <main className="lesson-player-page">
      <video
        className="lesson-player-page__video"
        controls
        src={lesson.video_url}
        onEnded={handleComplete}
      />

      <div className="lesson-player-page__title">{lesson.title}</div>

      <div className="lesson-player-page__actions">
        <button
          className="lesson-player-page__complete-button"
          onClick={handleComplete}
          disabled={completing}
        >
          {completing ? "Saving…" : "Mark Complete & Continue"}
        </button>
        <button
          className="lesson-player-page__workbook-button"
          onClick={() => navigate(`/courses/${courseId}/workbook`)}
          aria-label="Download workbook"
        >
          ↓
        </button>
      </div>
    </main>
  );
}
