import type { CourseDetail, CourseSummary } from "../types";
import "./RecommendedNextCard.css";

interface RecommendedNextCardProps {
  course: CourseSummary | CourseDetail;
  onClick: () => void;
}

export function RecommendedNextCard({ course, onClick }: RecommendedNextCardProps) {
  return (
    <button className="recommended-card" onClick={onClick}>
      <span className="recommended-card__badge">Recommended Next</span>
      <div className="recommended-card__title display">{course.title}</div>
      <div className="recommended-card__description">{course.description}</div>
      <div className="recommended-card__cta">Continue your journey →</div>
    </button>
  );
}
