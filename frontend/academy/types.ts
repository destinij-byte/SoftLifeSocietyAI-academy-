export type CourseTier = "single" | "bundle" | "full_access";

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  tier: CourseTier;
  thumbnail_url: string;
}

export interface LessonPublic {
  id: string;
  order: number;
  title: string;
  duration_seconds: number;
}

export interface ModulePublic {
  id: string;
  order: number;
  title: string;
  lessons: LessonPublic[];
  workbook_page_range: string | null;
}

export interface CourseDetail extends CourseSummary {
  modules: ModulePublic[];
  recommended_next_course_id: string | null;
}

export interface Resource {
  label: string;
  url: string;
}

export interface LessonDetail {
  id: string;
  module_id: string;
  order: number;
  title: string;
  video_url: string;
  duration_seconds: number;
  transcript: string | null;
  resources: Resource[];
}

export interface MyCourseSummary extends CourseSummary {
  enrollment_id: string;
  percent_complete: number;
  current_lesson_id: string | null;
}

export interface ProgressResponse {
  course_id: string;
  lessons_completed: string[];
  percent_complete: number;
  current_lesson_id: string | null;
  completed_at: string | null;
}

export interface LessonCompleteResponse {
  percent_complete: number;
  next_lesson_id: string | null;
  course_completed: boolean;
  recommended_next_course_id: string | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface WorkbookSection {
  title: string;
  pages: string | null;
}

export interface WorkbookResponse {
  download_url: string;
  expires_at: string;
  title: string;
  description: string;
  page_count: number | null;
  file_size_mb: number | null;
  sections: WorkbookSection[];
}
