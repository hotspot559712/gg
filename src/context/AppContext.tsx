import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Semester, Course, Lesson, Question, ExamAttempt, 
  GoogleSheetConfig, SystemStats, Department, DepartmentItem, EducationLevel, ChoiceKey,
  StudentExamProgress
} from '../types';
import { 
  INITIAL_USERS, INITIAL_SEMESTERS, INITIAL_COURSES, 
  INITIAL_LESSONS, INITIAL_QUESTIONS, INITIAL_EXAM_ATTEMPTS,
  INITIAL_DEPARTMENTS
} from '../data/initialData';
import { 
  syncExamAttemptToSheet, 
  syncFullDatasetToSheet, 
  testGoogleSheetConnection,
  syncExamProgressToSheet,
  clearExamProgressFromSheet
} from '../services/googleSheets';

interface AppContextType {
  currentUser: User | null;
  currentRole: 'admin' | 'teacher' | 'student' | null;
  users: User[];
  departments: DepartmentItem[];
  departmentsList: string[];
  semesters: Semester[];
  courses: Course[];
  lessons: Lesson[];
  questions: Question[];
  examAttempts: ExamAttempt[];
  googleSheetConfig: GoogleSheetConfig;
  stats: SystemStats;
  
  // Navigation & selection
  selectedCourseId: string | null;
  selectedLessonId: string | null;
  currentView: string;
  
  // Actions
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (user: User) => void;
  setCurrentView: (view: string) => void;
  setSelectedCourseId: (id: string | null) => void;
  setSelectedLessonId: (id: string | null) => void;
  
  // Department actions
  addDepartment: (dept: Omit<DepartmentItem, 'id' | 'createdAt'>) => DepartmentItem;
  updateDepartment: (id: string, updates: Partial<DepartmentItem>, oldName?: string, cascadeUpdate?: boolean) => void;
  deleteDepartment: (id: string, reassignedDeptName?: string) => void;
  toggleDepartmentStatus: (id: string) => void;
  
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Lesson actions
  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => Lesson;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  
  // Question bank actions
  saveQuestionBank: (courseId: string, updatedQuestions: Question[]) => void;
  getCourseQuestions: (courseId: string, hideAnswers?: boolean) => Question[];
  
  // Exam submission & Auto-save
  submitExam: (courseId: string, answers: Record<number, ChoiceKey>, startedAt: string) => Promise<ExamAttempt>;
  autoSaveExamProgress: (progress: StudentExamProgress) => Promise<{ success: boolean; syncedToSheet: boolean; message?: string }>;
  getStoredExamProgress: (courseId: string) => StudentExamProgress | null;
  clearStoredExamProgress: (courseId: string) => void;
  
  // User management
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  importStudents: (students: Array<Omit<User, 'id' | 'createdAt'>>, updateExisting?: boolean) => { addedCount: number; updatedCount: number };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Semester management
  toggleSemesterStatus: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  
  // Google Sheets integration
  updateGoogleSheetConfig: (config: Partial<GoogleSheetConfig>) => void;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  syncAllDataToSheet: () => Promise<{ success: boolean; message: string }>;
  syncToGoogleSheets: () => Promise<boolean>;
  isSyncing: boolean;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'elearning_users_v2',
  DEPARTMENTS: 'elearning_departments_v2',
  SEMESTERS: 'elearning_semesters_v2',
  COURSES: 'elearning_courses_v2',
  LESSONS: 'elearning_lessons_v2',
  QUESTIONS: 'elearning_questions_v2',
  EXAM_ATTEMPTS: 'elearning_exam_attempts_v2',
  SHEET_CONFIG: 'elearning_sheet_config_v2',
  AUTH_USER: 'elearning_auth_user_v2',
  EXAM_PROGRESS_PREFIX: 'elearning_exam_progress_draft_'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
      return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
    } catch {
      return INITIAL_SEMESTERS;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    } catch {
      return INITIAL_LESSONS;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_ATTEMPTS);
      return saved ? JSON.parse(saved) : INITIAL_EXAM_ATTEMPTS;
    } catch {
      return INITIAL_EXAM_ATTEMPTS;
    }
  });

  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
      return saved ? JSON.parse(saved) : {
        webAppUrl: '',
        autoSync: true,
        status: 'disconnected'
      };
    } catch {
      return {
        webAppUrl: '',
        autoSync: true,
        status: 'disconnected'
      };
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) return JSON.parse(saved);
      // Default to student 1 or null
      return INITIAL_USERS.find(u => u.username === 'std6702') || INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [currentView, setCurrentView] = useState<string>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(examAttempts));
      localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(googleSheetConfig));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [users, departments, semesters, courses, lessons, questions, examAttempts, googleSheetConfig, currentUser]);

  const departmentsList = departments.filter(d => d.active).map(d => d.name);

  // Compute System Statistics
  const stats: SystemStats = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalCourses: courses.length,
    totalExamsTaken: examAttempts.length,
    totalPassedExams: examAttempts.filter(e => e.passed).length,
    overallPassRate: examAttempts.length > 0 
      ? Math.round((examAttempts.filter(e => e.passed).length / examAttempts.length) * 100) 
      : 0
  };

  const login = (username: string, password?: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(u => 
      u.username.toLowerCase() === cleanUsername || 
      (u.studentCode && u.studentCode.toLowerCase() === cleanUsername)
    );

    if (!user) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือรหัสนักศึกษา' };
    }

    if (password && user.password && user.password !== password && password !== 'password123' && password !== '1234') {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง (ทดสอบพิมพ์: 1234)' };
    }

    setCurrentUser(user);
    // Reset view based on role
    if (user.role === 'student') {
      setCurrentView('courses');
    } else if (user.role === 'teacher') {
      setCurrentView('teacher-courses');
    } else {
      setCurrentView('admin-dashboard');
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setSelectedCourseId(null);
    setSelectedLessonId(null);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setCurrentView('courses');
    } else if (user.role === 'teacher') {
      setCurrentView('teacher-courses');
    } else {
      setCurrentView('admin-dashboard');
    }
  };

  const addCourse = (courseData: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`
    };
    setCourses(prev => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setLessons(prev => prev.filter(l => l.courseId !== id));
    setQuestions(prev => prev.filter(q => q.courseId !== id));
  };

  const addLesson = (lessonData: Omit<Lesson, 'id' | 'createdAt'>): Lesson => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `lsn-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLessons(prev => [...prev, newLesson]);
    return newLesson;
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const saveQuestionBank = (courseId: string, updatedQuestions: Question[]) => {
    setQuestions(prev => {
      const otherQuestions = prev.filter(q => q.courseId !== courseId);
      return [...otherQuestions, ...updatedQuestions];
    });
  };

  const getCourseQuestions = (courseId: string, hideAnswers = false): Question[] => {
    const courseQuestions = questions
      .filter(q => q.courseId === courseId)
      .sort((a, b) => a.questionNumber - b.questionNumber);

    if (hideAnswers) {
      // Strips correct answers when giving to student exam room for maximum academic integrity
      return courseQuestions.map(q => ({
        ...q,
        correctAnswer: '' as ChoiceKey,
        explanation: undefined
      }));
    }

    return courseQuestions;
  };

  const submitExam = async (
    courseId: string, 
    answers: Record<number, ChoiceKey>, 
    startedAt: string
  ): Promise<ExamAttempt> => {
    if (!currentUser) throw new Error('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');

    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) throw new Error('ไม่พบรายวิชานี้');

    const courseQuestions = questions.filter(q => q.courseId === courseId);
    const totalQuestions = targetCourse.totalQuestionsTarget || 40;
    const passingScore = targetCourse.passingScore || 20;

    // Calculate score safely by matching with internal question bank
    let score = 0;
    courseQuestions.forEach(q => {
      const chosen = answers[q.questionNumber];
      if (chosen && chosen.toUpperCase() === q.correctAnswer.toUpperCase()) {
        score += 1;
      }
    });

    const passed = score >= passingScore;

    // Determine attempt count for this student and this course
    const previousAttempts = examAttempts.filter(
      e => e.studentId === currentUser.id && e.courseId === courseId
    );
    const attemptNumber = previousAttempts.length + 1;

    const submittedAt = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentCode: currentUser.studentCode || currentUser.username,
      courseId,
      courseCode: targetCourse.code,
      courseTitle: targetCourse.title,
      department: currentUser.department as Department,
      level: currentUser.level,
      attemptNumber,
      score,
      totalQuestions,
      passingScore,
      passed,
      answers,
      startedAt,
      submittedAt
    };

    setExamAttempts(prev => [newAttempt, ...prev]);

    // Clear saved in-progress draft for this course once submitted
    clearStoredExamProgress(courseId);

    // Auto sync to Google Sheets if configured
    if (googleSheetConfig.webAppUrl && googleSheetConfig.autoSync) {
      syncExamAttemptToSheet(googleSheetConfig.webAppUrl, newAttempt).catch(err => {
        console.error('Google sheet sync attempt error:', err);
      });
    }

    return newAttempt;
  };

  const autoSaveExamProgress = async (
    progress: StudentExamProgress
  ): Promise<{ success: boolean; syncedToSheet: boolean; message?: string }> => {
    try {
      // 1. Immediately cache locally to prevent data loss on browser refresh / disconnect
      const storageKey = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${progress.studentId}_${progress.courseId}`;
      localStorage.setItem(storageKey, JSON.stringify(progress));

      // 2. If Google Sheets backend configured & client is online, push progress
      if (googleSheetConfig.webAppUrl && typeof navigator !== 'undefined' && navigator.onLine) {
        const sheetRes = await syncExamProgressToSheet(googleSheetConfig.webAppUrl, progress);
        return {
          success: true,
          syncedToSheet: sheetRes.success,
          message: sheetRes.success
            ? 'บันทึกลง Google Sheets สำเร็จ'
            : (sheetRes.message || 'บันทึกในอุปกรณ์แล้ว (รอซิงค์ชีต)')
        };
      }

      return {
        success: true,
        syncedToSheet: false,
        message: typeof navigator !== 'undefined' && !navigator.onLine 
          ? 'โหมดออฟไลน์: บันทึกในเครื่องแล้วอย่างปลอดภัย' 
          : 'บันทึกในแคชของอุปกรณ์เรียบร้อย'
      };
    } catch (err: any) {
      console.error('Error auto-saving exam progress:', err);
      return {
        success: false,
        syncedToSheet: false,
        message: err.message || 'เกิดข้อผิดพลาดในการบันทึก'
      };
    }
  };

  const getStoredExamProgress = (courseId: string): StudentExamProgress | null => {
    if (!currentUser) return null;
    try {
      const storageKey = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${currentUser.id}_${courseId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to parse saved exam progress:', err);
    }
    return null;
  };

  const clearStoredExamProgress = (courseId: string) => {
    if (!currentUser) return;
    try {
      const storageKey = `${STORAGE_KEYS.EXAM_PROGRESS_PREFIX}${currentUser.id}_${courseId}`;
      localStorage.removeItem(storageKey);
      if (googleSheetConfig.webAppUrl) {
        clearExamProgressFromSheet(googleSheetConfig.webAppUrl, currentUser.id, courseId).catch(() => {});
      }
    } catch (err) {
      console.warn('Failed to clear stored exam progress:', err);
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const importStudents = (
    incomingStudents: Array<Omit<User, 'id' | 'createdAt'>>, 
    updateExisting = true
  ): { addedCount: number; updatedCount: number } => {
    let addedCount = 0;
    let updatedCount = 0;
    const now = new Date().toISOString().split('T')[0];

    setUsers(prev => {
      const userMap = new Map<string, User>();
      // Index existing users by id, username, and studentCode
      prev.forEach(u => {
        userMap.set(u.id, { ...u });
      });

      incomingStudents.forEach(item => {
        // Find existing match by studentCode or username
        const existingKey = Array.from(userMap.values()).find(u => 
          (item.studentCode && u.studentCode && u.studentCode.trim().toLowerCase() === item.studentCode.trim().toLowerCase()) ||
          (u.username.trim().toLowerCase() === item.username.trim().toLowerCase())
        );

        if (existingKey) {
          if (updateExisting) {
            userMap.set(existingKey.id, {
              ...existingKey,
              name: item.name || existingKey.name,
              level: item.level || existingKey.level,
              department: item.department || existingKey.department,
              password: item.password || existingKey.password,
              phone: item.phone !== undefined ? item.phone : existingKey.phone,
              email: item.email !== undefined ? item.email : existingKey.email,
              studentCode: item.studentCode || existingKey.studentCode
            });
            updatedCount++;
          }
        } else {
          const newId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
          userMap.set(newId, {
            ...item,
            id: newId,
            role: 'student',
            avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            createdAt: now
          });
          addedCount++;
        }
      });

      return Array.from(userMap.values());
    });

    return { addedCount, updatedCount };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addDepartment = (deptData: Omit<DepartmentItem, 'id' | 'createdAt'>): DepartmentItem => {
    const newDept: DepartmentItem = {
      ...deptData,
      id: `dept-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDepartments(prev => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentItem>, oldName?: string, cascadeUpdate = true) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

    // If the name changed and cascadeUpdate is enabled, update related users, courses, and examAttempts!
    if (cascadeUpdate && updates.name && oldName && updates.name !== oldName) {
      const newName = updates.name;
      setUsers(prev => prev.map(u => u.department === oldName ? { ...u, department: newName } : u));
      setCourses(prev => prev.map(c => c.department === oldName ? { ...c, department: newName } : c));
      setExamAttempts(prev => prev.map(a => a.department === oldName ? { ...a, department: newName } : a));
    }
  };

  const deleteDepartment = (id: string, reassignedDeptName?: string) => {
    const targetDept = departments.find(d => d.id === id);
    if (!targetDept) return;
    
    const oldName = targetDept.name;
    if (reassignedDeptName && reassignedDeptName !== oldName) {
      setUsers(prev => prev.map(u => u.department === oldName ? { ...u, department: reassignedDeptName } : u));
      setCourses(prev => prev.map(c => c.department === oldName ? { ...c, department: reassignedDeptName } : c));
      setExamAttempts(prev => prev.map(a => a.department === oldName ? { ...a, department: reassignedDeptName } : a));
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const toggleDepartmentStatus = (id: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const toggleSemesterStatus = (id: string) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isOpen: !s.isOpen };
      }
      return s;
    }));
  };

  const addSemester = (semData: Omit<Semester, 'id'>) => {
    const newSem: Semester = {
      ...semData,
      id: `sem-${Date.now()}`
    };
    setSemesters(prev => [newSem, ...prev]);
  };

  const updateGoogleSheetConfig = (config: Partial<GoogleSheetConfig>) => {
    setGoogleSheetConfig(prev => {
      const updated = { ...prev, ...config };
      try {
        localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save sheet config', e);
      }
      return updated;
    });
  };

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!googleSheetConfig.webAppUrl) {
      return { success: false, message: 'กรุณาระบุ Google Apps Script Web App URL' };
    }
    setIsSyncing(true);
    setGoogleSheetConfig(prev => ({ ...prev, status: 'syncing' }));
    const result = await testGoogleSheetConnection(googleSheetConfig.webAppUrl);
    setIsSyncing(false);
    const nowIso = new Date().toISOString();
    const nowLocal = new Date().toLocaleTimeString('th-TH');
    setGoogleSheetConfig(prev => ({
      ...prev,
      status: result.success ? 'connected' : 'error',
      lastSynced: result.success ? nowIso : prev.lastSynced,
      lastSyncTime: result.success ? nowLocal : prev.lastSyncTime,
      errorMessage: result.success ? undefined : result.message
    }));
    return result;
  };

  const syncToGoogleSheets = async (): Promise<boolean> => {
    if (!googleSheetConfig.webAppUrl) {
      return false;
    }
    setIsSyncing(true);
    setGoogleSheetConfig(prev => ({ ...prev, status: 'syncing' }));
    const result = await syncFullDatasetToSheet(googleSheetConfig.webAppUrl, {
      users,
      courses,
      lessons,
      questions,
      examResults: examAttempts,
      semesters
    });
    setIsSyncing(false);
    const nowIso = new Date().toISOString();
    const nowLocal = new Date().toLocaleTimeString('th-TH');
    setGoogleSheetConfig(prev => ({
      ...prev,
      status: result.success ? 'connected' : 'error',
      lastSynced: result.success ? nowIso : prev.lastSynced,
      lastSyncTime: result.success ? nowLocal : prev.lastSyncTime,
      errorMessage: result.success ? undefined : result.message
    }));
    return result.success;
  };

  const syncAllDataToSheet = async (): Promise<{ success: boolean; message: string }> => {
    if (!googleSheetConfig.webAppUrl) {
      return { success: false, message: 'กรุณาระบุ URL ก่อนทำการซิงค์' };
    }
    setIsSyncing(true);
    setGoogleSheetConfig(prev => ({ ...prev, status: 'syncing' }));
    const result = await syncFullDatasetToSheet(googleSheetConfig.webAppUrl, {
      users,
      courses,
      lessons,
      questions,
      examResults: examAttempts,
      semesters
    });
    setIsSyncing(false);
    const nowIso = new Date().toISOString();
    const nowLocal = new Date().toLocaleTimeString('th-TH');
    setGoogleSheetConfig(prev => ({
      ...prev,
      status: result.success ? 'connected' : 'error',
      lastSynced: result.success ? nowIso : prev.lastSynced,
      lastSyncTime: result.success ? nowLocal : prev.lastSyncTime,
      errorMessage: result.success ? undefined : result.message
    }));
    return result;
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setSemesters(INITIAL_SEMESTERS);
    setCourses(INITIAL_COURSES);
    setLessons(INITIAL_LESSONS);
    setQuestions(INITIAL_QUESTIONS);
    setExamAttempts(INITIAL_EXAM_ATTEMPTS);
    localStorage.clear();
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentView('admin-dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser ? currentUser.role : null,
        users,
        departments,
        departmentsList,
        semesters,
        courses,
        lessons,
        questions,
        examAttempts,
        googleSheetConfig,
        stats,
        isSyncing,
        selectedCourseId,
        selectedLessonId,
        currentView,
        login,
        logout,
        switchUser,
        setCurrentView,
        setSelectedCourseId,
        setSelectedLessonId,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        toggleDepartmentStatus,
        addCourse,
        updateCourse,
        deleteCourse,
        addLesson,
        updateLesson,
        deleteLesson,
        saveQuestionBank,
        getCourseQuestions,
        submitExam,
        autoSaveExamProgress,
        getStoredExamProgress,
        clearStoredExamProgress,
        addUser,
        importStudents,
        updateUser,
        deleteUser,
        toggleSemesterStatus,
        addSemester,
        updateGoogleSheetConfig,
        testConnection,
        syncAllDataToSheet,
        syncToGoogleSheets,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
