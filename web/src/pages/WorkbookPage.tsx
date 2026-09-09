import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { academyApi } from "../api/academyApi";
import type { WorkbookResponse } from "../types";
import "./WorkbookPage.css";

export function WorkbookPage() {
  const navigate = useNavigate();
  const { courseId = "" } = useParams();

  const [workbook, setWorkbook] = useState<WorkbookResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academyApi
      .getWorkbook(courseId)
      .then(setWorkbook)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="page-centered">Loading…</div>;
  }

  if (!workbook) {
    return <div className="page-centered">No workbook available for this course yet.</div>;
  }

  return (
    <main className="workbook-page">
      <button className="workbook-page__back" onClick={() => navigate(-1)}>
        <span className="workbook-page__back-arrow">←</span>
        <span className="workbook-page__back-label">Course workbook</span>
      </button>

      <div className="workbook-page__hero">
        <div className="workbook-page__cover" />
        <div className="workbook-page__hero-text">
          <h1 className="workbook-page__title display">{workbook.title}</h1>
          {workbook.description ? (
            <p className="workbook-page__description">{workbook.description}</p>
          ) : null}
          <div className="workbook-page__tags">
            <span className="workbook-page__tag">PDF</span>
            <span className="workbook-page__tag">Printable</span>
          </div>
        </div>
      </div>

      <div>
        <a
          className="workbook-page__download"
          href={workbook.download_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↓ Download workbook
        </a>
        <p className="workbook-page__caption">
          Yours to keep{workbook.file_size_mb ? ` · ${workbook.file_size_mb.toFixed(1)} MB` : ""}
        </p>
      </div>

      {workbook.sections.length > 0 ? (
        <div className="workbook-page__inside">
          <div className="eyebrow">Inside</div>
          {workbook.sections.map((section, i) => (
            <div key={`${section.title}-${i}`} className="workbook-page__section-row">
              <span className="workbook-page__section-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="workbook-page__section-title">{section.title}</span>
              {section.pages ? (
                <span className="workbook-page__section-pages">{section.pages}</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
