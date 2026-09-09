import type { LessonPublic } from "../types";
import "./LessonListItem.css";

interface LessonListItemProps {
  lesson: LessonPublic;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function LessonListItem({ lesson, isCompleted, isCurrent, onClick }: LessonListItemProps) {
  return (
    <button
      className={`lesson-row${isCurrent ? " lesson-row--current" : ""}`}
      onClick={onClick}
    >
      <div className="lesson-row__text">
        <span className={`lesson-row__title${isCompleted ? " lesson-row__title--done" : ""}`}>
          {lesson.order}. {lesson.title}
        </span>
        <span className="lesson-row__duration">{formatDuration(lesson.duration_seconds)}</span>
      </div>
      {isCompleted ? <span className="lesson-row__check">✓</span> : null}
    </button>
  );
}
