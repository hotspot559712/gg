export type UserRole = 'admin' | 'teacher' | 'student';

export type EducationLevel = 'ปวช.1' | 'ปวช.2' | 'ปวช.3' | 'ปวส.1' | 'ปวส.2' | 'ทุกระดับ';

export type Department = string;

export interface DepartmentItem {
  id: string;
  name: string; // e.g. "คอมพิวเตอร์ธุรกิจ"
  code?: string; // e.g. "BC" or "30204"
  description?: string;
  color?: string; // e.g. "#3b82f6"
  active: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  department: Department | 'ส่วนกลาง';
  level: EducationLevel;
  studentCode?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Semester {
  id: string;
  name: string; // e.g. "1/2567"
  academicYear: string; // e.g. "2567"
  term: string; // e.g. "1"
  isOpen: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Course {
  id: string;
  code: string; // e.g. "30204-2001"
  title: string; // e.g. "การพัฒนาโปรแกรมบนเว็บ"
  description: string;
  department: Department;
  level: EducationLevel;
  semesterId: string;
  teacherId: string;
  teacherName: string;
  credit: number;
  coverImage?: string;
  active: boolean;
  passingScore?: number; // default 20 out of 40
  totalQuestionsTarget?: number; // default 40
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description?: string;
  content: string;
  pdfUrl?: string; // Google Drive link or direct PDF URL
  driveFileId?: string;
  attachments?: {
    id: string;
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'link' | 'video';
  }[];
  createdAt: string;
}

export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  courseId: string;
  questionNumber: number; // 1 to 40
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: ChoiceKey; // Only stored on server/teacher side, never sent to student during test
  explanation?: string;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  department: Department;
  level: EducationLevel;
  attemptNumber: number;
  score: number; // e.g. 28
  totalQuestions: number; // 40
  passingScore: number; // 20
  passed: boolean;
  answers: Record<number, ChoiceKey>; // questionNumber -> chosen answer
  startedAt: string;
  submittedAt: string;
}

export interface StudentExamProgress {
  studentId: string;
  studentName: string;
  studentCode: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  department: Department;
  level: EducationLevel;
  answeredCount: number;
  totalQuestions: number;
  answers: Record<number, ChoiceKey>;
  flagged: Record<number, boolean>;
  currentIndex?: number;
  startedAt?: string;
  lastSavedAt: string;
  isOnline?: boolean;
}

export interface GoogleSheetConfig {
  webAppUrl: string;
  sheetId?: string;
  autoSync: boolean;
  enabled?: boolean;
  lastSyncTime?: string;
  lastSynced?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  errorMessage?: string;
}

export interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalExamsTaken: number;
  totalPassedExams: number;
  overallPassRate: number;
}
