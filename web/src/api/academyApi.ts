import { getAuthToken } from "../auth/session";
import type {
  CheckoutResponse,
  CourseDetail,
  CourseSummary,
  LessonCompleteResponse,
  LessonDetail,
  MyCourseSummary,
  ProgressResponse,
  WorkbookResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function academyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/academy${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Academy API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export const academyApi = {
  listCourses: () => academyFetch<CourseSummary[]>("/courses"),

  getCourseDetail: (slug: string) => academyFetch<CourseDetail>(`/courses/${slug}`),

  myCourses: () => academyFetch<MyCourseSummary[]>("/my-courses"),

  getProgress: (courseId: string) =>
    academyFetch<ProgressResponse>(`/courses/${courseId}/progress`),

  getLesson: (lessonId: string) => academyFetch<LessonDetail>(`/lessons/${lessonId}`),

  completeLesson: (lessonId: string) =>
    academyFetch<LessonCompleteResponse>(`/lessons/${lessonId}/complete`, { method: "POST" }),

  getWorkbook: (courseId: string) =>
    academyFetch<WorkbookResponse>(`/courses/${courseId}/workbook`),

  checkout: (courseId: string) =>
    academyFetch<CheckoutResponse>("/checkout", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
};
