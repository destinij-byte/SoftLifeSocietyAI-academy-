import type { CourseSummary, MyCourseSummary } from "../types";
import { ProgressBar } from "./ProgressBar";
import "./CourseCard.css";

interface CourseCardProps {
  course: CourseSummary | MyCourseSummary;
  onClick: () => void;
}

function isEnrolled(course: CourseSummary | MyCourseSummary): course is MyCourseSummary {
  return "percent_complete" in course;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const enrolled = isEnrolled(course);

  return (
    <button className="course-card" onClick={onClick}>
      {course.thumbnail_url ? (
        <img className="course-card__thumbnail" src={course.thumbnail_url} alt="" />
      ) : (
        <div className="course-card__thumbnail course-card__thumbnail--placeholder" />
      )}
      <div className="course-card__title display">{course.title}</div>
      <div className="course-card__description">{course.description}</div>

      {enrolled ? (
        <div className="course-card__progress-row">
          <ProgressBar percentComplete={course.percent_complete} />
          <span className="course-card__progress-label">{course.percent_complete}%</span>
        </div>
      ) : (
        <div className="course-card__price">${course.price.toFixed(0)}</div>
      )}
    </button>
  );
}
