import type {
  CheckoutResponse,
  CourseDetail,
  CourseSummary,
  LessonCompleteResponse,
  LessonDetail,
  MyCourseSummary,
  ProgressResponse,
  WorkbookResponse,
} from "./types";

/**
 * Wire these two to the app's real config/auth modules when Academy is
 * merged in — this file has no auth system of its own, it rides on SLS's.
 */
import { API_BASE_URL } from "../config"; // existing app config: base API URL
import { getAuthToken } from "../auth/session"; // existing app auth: current user's bearer token

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
