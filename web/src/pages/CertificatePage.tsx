import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { academyApi } from "../api/academyApi";
import { getCurrentUserProfile } from "../auth/session";
import { RecommendedNextCard } from "../components/RecommendedNextCard";
import type { CourseSummary } from "../types";
import "./CertificatePage.css";

function monthYear(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function CertificatePage() {
  const navigate = useNavigate();
  const { courseId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const recommendedNextCourseId = searchParams.get("recommended");

  const [courseTitle, setCourseTitle] = useState("");
  const [totalLessons, setTotalLessons] = useState<number | null>(null);
  const [learnerName, setLearnerName] = useState("You");
  const [recommended, setRecommended] = useState<CourseSummary | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    academyApi.myCourses().then((courses) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) setCourseTitle(course.title);
    });
    academyApi.getProgress(courseId).then((progress) => {
      setTotalLessons(progress.lessons_completed.length);
    });
    getCurrentUserProfile()
      .then((profile) => setLearnerName(profile?.name || "You"))
      .catch(() => setLearnerName("You"));
    if (recommendedNextCourseId) {
      academyApi
        .listCourses()
        .then((courses) => courses.find((c) => c.id === recommendedNextCourseId) ?? null)
        .then(setRecommended);
    }
  }, [courseId, recommendedNextCourseId]);

  async function shareCertificate() {
    const message = `I just completed ${courseTitle || "a course"} on Soft Life Academy.`;
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        // Share sheet dismissed — nothing to recover from here.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setShareStatus("Copied to clipboard");
      setTimeout(() => setShareStatus(""), 2000);
    } catch {
      setShareStatus("");
    }
  }

  return (
    <main className="certificate-page">
      <div className="certificate-page__intro">
        <span className="certificate-page__badge">Certificate Earned</span>
        <h1 className="certificate-page__headline display">Course Complete</h1>
        <p className="certificate-page__subhead">
          You finished all {totalLessons ?? ""} lessons of {courseTitle || "this course"}. Now go
          and launch it.
        </p>
      </div>

      <div className="certificate-card">
        <div className="certificate-card__check">✓</div>
        <div className="certificate-card__certifies">Soft Life Academy Certifies</div>
        <div className="certificate-card__name display">{learnerName}</div>
        <div className="certificate-card__meta">
          {courseTitle} · {monthYear()}
        </div>
        <div className="certificate-card__actions">
          <button className="certificate-card__save" onClick={shareCertificate}>
            Save certificate
          </button>
          <button className="certificate-card__share" onClick={shareCertificate}>
            Share
          </button>
        </div>
        {shareStatus ? <div className="certificate-card__status">{shareStatus}</div> : null}
      </div>

      {recommended ? (
        <div className="certificate-page__recommended">
          <div className="eyebrow">Recommended Next</div>
          <RecommendedNextCard
            course={recommended}
            onClick={() => navigate(`/courses/${recommended.slug}`)}
          />
        </div>
      ) : null}

      <button className="certificate-page__back" onClick={() => navigate("/")}>
        Back to Academy
      </button>
    </main>
  );
}
