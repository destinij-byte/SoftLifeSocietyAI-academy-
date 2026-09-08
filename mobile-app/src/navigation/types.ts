export type LearnerStackParamList = {
  Home: undefined;
  Course: undefined;
  Player: undefined;
  Workbook: undefined;
  Certificate: undefined;
};

export type AdminStackParamList = {
  CoursesList: undefined;
  CourseEditor: { courseId: string };
  ModuleEditor: { courseId: string; moduleId: string };
  LessonEditor: { courseId: string; moduleId: string; lessonId: string };
};

export type RootStackParamList = {
  LearnerFlow: undefined;
  AdminFlow: undefined;
};
