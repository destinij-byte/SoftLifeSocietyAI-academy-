import { Route, Routes } from "react-router-dom";

import { CertificatePage } from "./pages/CertificatePage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { HomePage } from "./pages/HomePage";
import { LessonPlayerPage } from "./pages/LessonPlayerPage";
import { WorkbookPage } from "./pages/WorkbookPage";

/**
 * Mount this at whatever base path the main SLS website reserves for
 * Academy (e.g. `/academy/*`) — see README.md for integration notes.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPlayerPage />} />
      <Route path="/courses/:courseId/workbook" element={<WorkbookPage />} />
      <Route path="/courses/:courseId/certificate" element={<CertificatePage />} />
    </Routes>
  );
}
