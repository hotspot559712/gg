import * as XLSX from 'xlsx';
import { User, Course, ExamAttempt, Department, EducationLevel } from '../types';

export interface CourseGradeItem {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credit: number;
  totalQuestions: number;
  score: number | null; // null if not taken
  maxScore: number;
  percentage: number | null;
  grade: string; // '4.0', '3.5', '3.0', '2.5', '2.0', '1.5', '1.0', '0.0', '-'
  gradePoint: number | null;
  passed: boolean | null; // true, false, null (not taken)
  statusText: 'ผ่านเกณฑ์' | 'ไม่ผ่านเกณฑ์' | 'ยังไม่เข้าสอบ';
  attemptCount: number;
  submittedAt?: string;
  bestAttempt?: ExamAttempt;
}

export interface Student5CourseReport {
  student: User;
  department: Department;
  level: EducationLevel;
  academicYear: string;
  semesterName: string;
  courses: CourseGradeItem[];
  totalCredits: number;
  totalScoreEarned: number;
  totalMaxScore: number;
  overallPercentage: number;
  gpa: number | null;
  passedCoursesCount: number;
  totalCoursesCount: number;
  isAllPassed: boolean;
  overallStatus: 'ผ่านครบทุกวิชา (สำเร็จการประเมิน)' | 'อยู่ระหว่างดำเนินการประเมินผล' | 'ยังไม่เริ่มการประเมิน';
  evaluationDate: string;
}

/**
 * Calculate Grade from Percentage score (0 - 100)
 */
export const calculateGradeFromPercent = (percent: number): { grade: string; gradePoint: number } => {
  if (percent >= 80) return { grade: '4.0', gradePoint: 4.0 };
  if (percent >= 75) return { grade: '3.5', gradePoint: 3.5 };
  if (percent >= 70) return { grade: '3.0', gradePoint: 3.0 };
  if (percent >= 65) return { grade: '2.5', gradePoint: 2.5 };
  if (percent >= 60) return { grade: '2.0', gradePoint: 2.0 };
  if (percent >= 55) return { grade: '1.5', gradePoint: 1.5 };
  if (percent >= 50) return { grade: '1.0', gradePoint: 1.0 };
  return { grade: '0.0', gradePoint: 0.0 };
};

/**
 * Get standard 5 courses for a given department & level
 */
export const getDepartment5Courses = (
  allCourses: Course[],
  department: Department,
  level?: EducationLevel
): Course[] => {
  // 1. First find active courses matching both department and level
  let deptCourses = allCourses.filter(c => c.active && c.department === department);
  if (level && level !== 'ทุกระดับ') {
    const levelMatch = deptCourses.filter(c => c.level === level);
    if (levelMatch.length >= 5) {
      return levelMatch.slice(0, 5);
    }
  }

  // 2. If less than 5, include all department courses
  if (deptCourses.length >= 5) {
    return deptCourses.slice(0, 5);
  }

  // 3. Fallback: pad with general courses to guarantee exactly 5 courses
  const generalCourses = allCourses.filter(c => c.active && !deptCourses.some(dc => dc.id === c.id));
  const combined = [...deptCourses, ...generalCourses];
  return combined.slice(0, 5);
};

/**
 * Generate 5-Course Report for a specific student
 */
export const generateStudent5CourseReport = (
  student: User,
  allCourses: Course[],
  allAttempts: ExamAttempt[],
  academicYear = '2567',
  semesterName = '1/2567'
): Student5CourseReport => {
  const studentDept = student.department || 'คอมพิวเตอร์ธุรกิจ';
  const studentLevel = student.level || 'ปวส.1';

  // Get 5 curriculum courses
  const targetCourses = getDepartment5Courses(allCourses, studentDept, studentLevel);

  // Student attempts
  const studentAttempts = allAttempts.filter(
    a => a.studentId === student.id || a.studentCode === student.studentCode
  );

  let totalCredits = 0;
  let totalScoreEarned = 0;
  let totalMaxScore = 0;
  let weightedGradePoints = 0;
  let gradedCredits = 0;
  let passedCoursesCount = 0;

  const courseGradeItems: CourseGradeItem[] = targetCourses.map(course => {
    const credit = course.credit || 3;
    totalCredits += credit;

    // Find best attempt for this course
    const courseAttempts = studentAttempts.filter(
      a => a.courseId === course.id || a.courseCode === course.code
    );

    if (courseAttempts.length === 0) {
      totalMaxScore += course.totalQuestionsTarget || 40;
      return {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        credit,
        totalQuestions: course.totalQuestionsTarget || 40,
        score: null,
        maxScore: course.totalQuestionsTarget || 40,
        percentage: null,
        grade: '-',
        gradePoint: null,
        passed: null,
        statusText: 'ยังไม่เข้าสอบ',
        attemptCount: 0,
      };
    }

    // Sort by highest score
    const sorted = [...courseAttempts].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const maxQ = best.totalQuestions || course.totalQuestionsTarget || 40;
    const score = best.score;
    const percent = Math.round((score / maxQ) * 100);
    const { grade, gradePoint } = calculateGradeFromPercent(percent);
    const passed = score >= (course.passingScore || 20);

    totalScoreEarned += score;
    totalMaxScore += maxQ;
    weightedGradePoints += gradePoint * credit;
    gradedCredits += credit;
    if (passed) passedCoursesCount++;

    return {
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      credit,
      totalQuestions: maxQ,
      score,
      maxScore: maxQ,
      percentage: percent,
      grade,
      gradePoint,
      passed,
      statusText: passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
      attemptCount: courseAttempts.length,
      submittedAt: best.submittedAt,
      bestAttempt: best
    };
  });

  const overallPercentage = totalMaxScore > 0 ? Math.round((totalScoreEarned / totalMaxScore) * 100) : 0;
  const gpa = gradedCredits > 0 ? Number((weightedGradePoints / gradedCredits).toFixed(2)) : null;
  const isAllPassed = passedCoursesCount === courseGradeItems.length && courseGradeItems.length > 0;

  let overallStatus: Student5CourseReport['overallStatus'] = 'ยังไม่เริ่มการประเมิน';
  if (gradedCredits > 0) {
    overallStatus = isAllPassed 
      ? 'ผ่านครบทุกวิชา (สำเร็จการประเมิน)' 
      : 'อยู่ระหว่างดำเนินการประเมินผล';
  }

  const todayThai = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    student,
    department: studentDept,
    level: studentLevel,
    academicYear,
    semesterName,
    courses: courseGradeItems,
    totalCredits,
    totalScoreEarned,
    totalMaxScore,
    overallPercentage,
    gpa,
    passedCoursesCount,
    totalCoursesCount: courseGradeItems.length,
    isAllPassed,
    overallStatus,
    evaluationDate: todayThai
  };
};

/**
 * Export Individual 5-Course Report to Excel (.xlsx)
 */
export const exportIndividual5CourseToExcel = (report: Student5CourseReport) => {
  const wb = XLSX.utils.book_new();

  // Create Title and Info Rows
  const rows: any[] = [
    ['ใบรายงานผลการสอบและประเมินผลการเรียนออนไลน์ ภาคสมทบ (แบบ 5 รายวิชา)'],
    [`วิทยาลัยอาชีวศึกษา • ภาคเรียนที่ ${report.semesterName} ปีการศึกษา ${report.academicYear}`],
    [''],
    ['ข้อมูลนักศึกษา', ''],
    ['รหัสนักศึกษา:', report.student.studentCode || '-'],
    ['ชื่อ-นามสกุล:', report.student.name],
    ['สาขาวิชา:', report.department],
    ['ระดับชั้น:', report.level],
    ['วันที่ออกเอกสาร:', report.evaluationDate],
    [''],
    ['ลำดับ', 'รหัสวิชา', 'ชื่อรายวิชา', 'หน่วยกิต', 'คะแนนเต็ม', 'คะแนนที่ได้', 'ร้อยละ (%)', 'ระดับผลการเรียน (เกรด)', 'ผลการประเมิน', 'จำนวนรอบที่สอบ', 'วันที่บันทึกผล']
  ];

  // Add 5 Course rows
  report.courses.forEach((c, idx) => {
    rows.push([
      idx + 1,
      c.courseCode,
      c.courseTitle,
      c.credit,
      c.maxScore,
      c.score !== null ? c.score : 'ยังไม่สอบ',
      c.percentage !== null ? `${c.percentage}%` : '-',
      c.grade,
      c.statusText,
      c.attemptCount > 0 ? `${c.attemptCount} รอบ` : '-',
      c.submittedAt || '-'
    ]);
  });

  // Summary rows
  rows.push(['']);
  rows.push(['สรุปผลการประเมินรวม 5 รายวิชา', '']);
  rows.push(['รวมหน่วยกิต:', report.totalCredits]);
  rows.push(['คะแนนรวมที่ได้:', `${report.totalScoreEarned} / ${report.totalMaxScore}`]);
  rows.push(['ร้อยละเฉลี่ยสะสม:', `${report.overallPercentage}%`]);
  rows.push(['เกรดเฉลี่ย (GPA):', report.gpa !== null ? report.gpa.toFixed(2) : '-']);
  rows.push(['จำนวนวิชาที่ผ่าน:', `${report.passedCoursesCount} จาก ${report.totalCoursesCount} วิชา`]);
  rows.push(['ผลการประเมินภาพรวม:', report.overallStatus]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },
    { wch: 16 },
    { wch: 40 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน 5 วิชา รายบุคคล');
  const filename = `รายงานผลการสอบ5วิชา_${report.student.studentCode || 'นักศึกษา'}_${report.student.name.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Export Batch Department 5-Course Report to Excel (.xlsx)
 */
export const exportDepartment5CourseBatchToExcel = (
  students: User[],
  allCourses: Course[],
  allAttempts: ExamAttempt[],
  department: Department,
  level: string,
  academicYear = '2567',
  semesterName = '1/2567'
) => {
  const wb = XLSX.utils.book_new();

  // Target courses for header
  const targetCourses = getDepartment5Courses(
    allCourses, 
    department, 
    level !== 'all' ? (level as EducationLevel) : undefined
  );

  const headerRow1 = [
    'ลำดับ',
    'รหัสนักศึกษา',
    'ชื่อ-นามสกุล',
    'ระดับชั้น',
    'สาขาวิชา',
    ...targetCourses.flatMap((c, i) => [
      `วิชาที่ ${i + 1}: ${c.code} (${c.title}) [คะแนน/40]`,
      `วิชาที่ ${i + 1}: เกรด`,
      `วิชาที่ ${i + 1}: สถานะ`
    ]),
    'คะแนนรวม (200)',
    'ร้อยละเฉลี่ย (%)',
    'เกรดเฉลี่ย (GPA)',
    'วิชาที่ผ่าน (จาก 5)',
    'ผลการประเมินภาพรวม'
  ];

  const dataRows = students.map((student, idx) => {
    const report = generateStudent5CourseReport(
      student,
      allCourses,
      allAttempts,
      academicYear,
      semesterName
    );

    const courseCols = report.courses.flatMap(c => [
      c.score !== null ? c.score : '-',
      c.grade,
      c.statusText
    ]);

    return [
      idx + 1,
      student.studentCode || '-',
      student.name,
      student.level || '-',
      student.department || department,
      ...courseCols,
      report.totalScoreEarned,
      `${report.overallPercentage}%`,
      report.gpa !== null ? report.gpa.toFixed(2) : '-',
      `${report.passedCoursesCount}/5`,
      report.overallStatus
    ];
  });

  const wsData = [
    [`รายงานสรุปผลการสอบ 5 รายวิชา สาขาวิชา${department} ${level !== 'all' ? `ระดับ ${level}` : ''}`],
    [`ภาคเรียนที่ ${semesterName} ปีการศึกษา ${academicYear} • ข้อมูล ณ วันที่ ${new Date().toLocaleDateString('th-TH')}`],
    [''],
    headerRow1,
    ...dataRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, `สาขา${department.slice(0, 15)}`);
  
  const filename = `รายงานผลการสอบ5วิชา_สาขา${department}_${level !== 'all' ? level : 'ทุกระดับ'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};
