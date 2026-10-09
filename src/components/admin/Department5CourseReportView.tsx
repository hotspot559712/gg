import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Course, Department, EducationLevel } from '../../types';
import { EDUCATION_LEVELS } from '../../data/initialData';
import { 
  getDepartment5Courses, 
  generateStudent5CourseReport, 
  exportDepartment5CourseBatchToExcel,
  exportIndividual5CourseToExcel,
  Student5CourseReport
} from '../../utils/gradeUtils';
import { Individual5CourseReportModal } from './Individual5CourseReportModal';
import { 
  FileSpreadsheet, Download, Printer, Search, 
  Filter, CheckCircle2, AlertCircle, Clock, 
  UserCheck, Award, Eye, GraduationCap, ChevronRight
} from 'lucide-react';

export const Department5CourseReportView: React.FC = () => {
  const { 
    users, 
    courses, 
    examAttempts, 
    departmentsList, 
    semesters 
  } = useApp();

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];
  const semesterName = activeSemester?.name || '1/2567';
  const academicYear = activeSemester?.academicYear || '2567';

  const [selectedDept, setSelectedDept] = useState<Department>(
    (departmentsList[0] as Department) || 'คอมพิวเตอร์ธุรกิจ'
  );
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected student for Individual Report Modal
  const [modalStudent, setModalStudent] = useState<User | null>(null);

  // Get 5 official courses for this department
  const dept5Courses = getDepartment5Courses(
    courses,
    selectedDept,
    selectedLevel !== 'all' ? (selectedLevel as EducationLevel) : undefined
  );

  // Get students in this department
  const allStudentsInDept = users.filter(u => {
    if (u.role !== 'student') return false;
    const matchDept = u.department === selectedDept;
    const matchLevel = selectedLevel === 'all' || u.level === selectedLevel;
    return matchDept && matchLevel;
  });

  // Filter with search term
  const filteredStudents = allStudentsInDept.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchName = s.name.toLowerCase().includes(term);
    const matchCode = (s.studentCode || '').toLowerCase().includes(term);
    const matchUser = s.username.toLowerCase().includes(term);
    return matchName || matchCode || matchUser;
  });

  // Compute reports for all students
  const studentReports: Student5CourseReport[] = filteredStudents.map(student =>
    generateStudent5CourseReport(
      student,
      courses,
      examAttempts,
      academicYear,
      semesterName
    )
  );

  // Summary KPIs for this department
  const totalStudentsCount = filteredStudents.length;
  const passedAllCount = studentReports.filter(r => r.isAllPassed).length;
  const passedAnyCount = studentReports.filter(r => r.passedCoursesCount > 0).length;
  const avgOverallScore = totalStudentsCount > 0
    ? (studentReports.reduce((acc, r) => acc + r.totalScoreEarned, 0) / totalStudentsCount).toFixed(1)
    : '0';
  const validGpas = studentReports.filter(r => r.gpa !== null).map(r => r.gpa as number);
  const avgGpa = validGpas.length > 0
    ? (validGpas.reduce((acc, g) => acc + g, 0) / validGpas.length).toFixed(2)
    : '0.00';

  // Navigation inside Modal
  const currentModalIndex = modalStudent 
    ? filteredStudents.findIndex(s => s.id === modalStudent.id) 
    : -1;
  const hasPrev = currentModalIndex > 0;
  const hasNext = currentModalIndex >= 0 && currentModalIndex < filteredStudents.length - 1;

  const handleNextStudent = () => {
    if (hasNext) {
      setModalStudent(filteredStudents[currentModalIndex + 1]);
    }
  };

  const handlePrevStudent = () => {
    if (hasPrev) {
      setModalStudent(filteredStudents[currentModalIndex - 1]);
    }
  };

  const handleBatchExportExcel = () => {
    exportDepartment5CourseBatchToExcel(
      filteredStudents,
      courses,
      examAttempts,
      selectedDept,
      selectedLevel,
      academicYear,
      semesterName
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Department Switcher Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ระบบออกรายงานผลการสอบ 5 รายวิชา ประจำสาขาวิชา
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ออกรายงานผลการสอบรายบุคคลและแบบรวมทั้งสาขา ครบ 5 รายวิชาตามโครงสร้างหลักสูตร ภาคสมทบ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBatchExportExcel}
              disabled={filteredStudents.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกสรุป 5 วิชาทั้งสาขา (Excel)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Department Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">เลือกสาขาวิชา:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as Department)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>สาขา{dept}</option>
              ))}
            </select>
          </div>

          {/* Level Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">เลือกระดับชั้น:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">ทุกระดับชั้น (ปวช. / ปวส.)</option>
              {EDUCATION_LEVELS.filter(l => l !== 'ทุกระดับ').map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Search Student Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">ค้นหานักศึกษา:</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ชื่อ, รหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. KPIs Overview for Selected Department */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">นักศึกษาในสาขา</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalStudentsCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">ผ่านครบ 5 วิชา (สำเร็จ)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {passedAllCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">คะแนนเฉลี่ยรวม 5 วิชา</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {avgOverallScore} <span className="text-xs font-normal text-slate-400">/ 200</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">เกรดเฉลี่ยรวม (GPA)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{avgGpa}</div>
        </div>
      </div>

      {/* 3. 5-Course Curriculum Structure Info Banner */}
      <div className="bg-emerald-950/5 border border-emerald-600/20 rounded-3xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs sm:text-sm">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>โครงสร้าง 5 รายวิชาหลัก ประจำสาขาวิชา{selectedDept} (ภาคเรียนที่ {semesterName})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {dept5Courses.map((c, i) => (
            <div 
              key={c.id || i}
              className="p-3 rounded-2xl bg-white border border-emerald-200/60 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-700 font-mono">วิชาที่ {i + 1}</span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">{c.credit} นก.</span>
              </div>
              <div className="font-mono text-slate-600 text-[11px] font-semibold">{c.code}</div>
              <div className="font-bold text-slate-800 line-clamp-2 text-xs leading-tight" title={c.title}>
                {c.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Student 5-Course Grade Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>ตารางประเมินผลคะแนน 5 วิชา รายบุคคล (นักศึกษา {filteredStudents.length} คน)</span>
          </h3>
          <span className="text-xs text-slate-500">คลิกที่ "ออกรายงาน" เพื่อดูหรือพิมพ์ใบรายงานรายบุคคล</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[180px]">นักศึกษา</th>
                <th className="py-3 px-3 text-center">ระดับชั้น</th>
                {dept5Courses.map((c, i) => (
                  <th key={c.id || i} className="py-3 px-3 text-center min-w-[90px]" title={`${c.code} ${c.title}`}>
                    <div className="text-[11px] font-mono text-emerald-700">วิชา {i + 1}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[80px] mx-auto">{c.code}</div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center font-bold">รวม (200)</th>
                <th className="py-3 px-3 text-center font-bold">GPA</th>
                <th className="py-3 px-3 text-center font-bold">สถานะ 5 วิชา</th>
                <th className="py-3 px-4 text-center min-w-[130px]">เอกสารทางการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6 + dept5Courses.length} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลนักศึกษาในสาขาวิชาหรือระดับชั้นที่เลือก
                  </td>
                </tr>
              ) : (
                studentReports.map((report, idx) => (
                  <tr key={report.student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{report.student.name}</div>
                      <div className="text-xs text-blue-600 font-mono">รหัส: {report.student.studentCode || '-'}</div>
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {report.level}
                      </span>
                    </td>

                    {/* 5 Course Score Cells */}
                    {report.courses.map((course, cIdx) => (
                      <td key={cIdx} className="py-3.5 px-2 text-center border-l border-slate-100">
                        {course.score !== null ? (
                          <div>
                            <div className={`font-bold text-xs ${course.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {course.score} <span className="text-[10px] font-normal text-slate-400">/ 40</span>
                            </div>
                            <div className="text-[10px] font-bold text-blue-600">
                              เกรด {course.grade}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">ยังไม่สอบ</span>
                        )}
                      </td>
                    ))}

                    {/* Total Score */}
                    <td className="py-3.5 px-3 text-center font-black text-slate-900 border-l border-slate-100">
                      {report.totalScoreEarned}
                      <div className="text-[10px] text-slate-400 font-normal">({report.overallPercentage}%)</div>
                    </td>

                    {/* GPA */}
                    <td className="py-3.5 px-3 text-center font-black text-blue-700 border-l border-slate-100 text-sm">
                      {report.gpa !== null ? report.gpa.toFixed(2) : '-'}
                    </td>

                    {/* 5-Course Pass Status Badge */}
                    <td className="py-3.5 px-3 text-center border-l border-slate-100">
                      {report.isAllPassed ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ผ่านครบ 5/5</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>ผ่าน {report.passedCoursesCount}/5</span>
                        </span>
                      )}
                    </td>

                    {/* Action: Open Individual Report Modal */}
                    <td className="py-3.5 px-4 text-center border-l border-slate-100">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setModalStudent(report.student)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center space-x-1"
                          title="เปิดใบรายงานผลการสอบรายบุคคล 5 วิชา"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ออกรายงาน</span>
                        </button>
                        <button
                          onClick={() => exportIndividual5CourseToExcel(report)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="ดาวน์โหลด Excel เฉพาะคนนี้"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Individual Report Modal */}
      <Individual5CourseReportModal
        isOpen={modalStudent !== null}
        onClose={() => setModalStudent(null)}
        student={modalStudent}
        allCourses={courses}
        allAttempts={examAttempts}
        semesterName={semesterName}
        academicYear={academicYear}
        onNextStudent={handleNextStudent}
        onPrevStudent={handlePrevStudent}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />

    </div>
  );
};
