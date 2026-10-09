import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Trophy, CheckCircle2, AlertCircle, 
  Download, Search, Filter, BookOpen, Users, FileSpreadsheet, Eye
} from 'lucide-react';
import { User } from '../../types';
import { Individual5CourseReportModal } from '../admin/Individual5CourseReportModal';

export const TeacherScores: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    users,
    examAttempts, 
    semesters,
    selectedCourseId, 
    setSelectedCourseId 
  } = useApp();

  const [courseFilter, setCourseFilter] = useState<string>(selectedCourseId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalStudent, setModalStudent] = useState<User | null>(null);

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];
  const semesterName = activeSemester?.name || '1/2567';
  const academicYear = activeSemester?.academicYear || '2567';

  if (!currentUser) return null;

  // Filter attempts relevant to teacher
  const relevantAttempts = examAttempts.filter(attempt => {
    // Course match
    if (courseFilter !== 'all' && attempt.courseId !== courseFilter) return false;
    
    // Status match
    if (statusFilter === 'pass' && !attempt.passed) return false;
    if (statusFilter === 'fail' && attempt.passed) return false;

    // Search match
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = attempt.studentName.toLowerCase().includes(term);
      const matchCode = attempt.studentCode.toLowerCase().includes(term);
      const matchCourse = attempt.courseTitle.toLowerCase().includes(term) || attempt.courseCode.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchCourse) return false;
    }

    return true;
  });

  const handleOpenStudentReport = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    if (student) {
      setModalStudent(student);
    }
  };

  const totalAttemptsCount = relevantAttempts.length;
  const passedCount = relevantAttempts.filter(a => a.passed).length;
  const passRate = totalAttemptsCount > 0 ? Math.round((passedCount / totalAttemptsCount) * 100) : 0;
  const avgScore = totalAttemptsCount > 0 
    ? (relevantAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttemptsCount).toFixed(1)
    : '0';

  const handleExportCSV = () => {
    const headers = [
      'ลำดับ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'สาขาวิชา', 
      'ระดับชั้น', 'รหัสวิชา', 'ชื่อวิชา', 'รอบที่สอบ', 
      'คะแนน (เต็ม 40)', 'สถานะการประเมิน', 'วันเวลาที่ส่ง'
    ];

    const rows = relevantAttempts.map((att, idx) => [
      idx + 1,
      `"${att.studentCode}"`,
      `"${att.studentName}"`,
      `"${att.department}"`,
      `"${att.level}"`,
      `"${att.courseCode}"`,
      `"${att.courseTitle}"`,
      att.attemptNumber,
      att.score,
      att.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
      `"${att.submittedAt}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานคะแนนนักเรียน_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              ผลคะแนนและการประเมินของนักเรียน
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รายงานผลการทำข้อสอบ 40 ข้อของนักเรียนภาคสมทบทุกรอบ พร้อมการจัดเก็บลง Google Sheets
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกไฟล์ Excel / CSV</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">จำนวนรอบการสอบทั้งหมด</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalAttemptsCount} <span className="text-xs font-normal text-slate-500">ครั้ง</span></div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">จำนวนรอบที่สอบผ่าน (≥20)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{passedCount} <span className="text-xs font-normal text-slate-500">ครั้ง</span></div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">ร้อยละการสอบผ่าน</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{passRate}%</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">คะแนนเฉลี่ย</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{avgScore} <span className="text-xs font-normal text-slate-500">/ 40</span></div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, รหัสนักศึกษา, วิชา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทุกรายวิชา</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} {c.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทุกสถานะผลการสอบ</option>
            <option value="pass">เฉพาะที่ผ่านเกณฑ์ (≥20)</option>
            <option value="fail">เฉพาะที่ไม่ผ่านเกณฑ์</option>
          </select>
        </div>
      </div>

      {/* Scores Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {relevantAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">ไม่พบรายการคะแนนตามเงื่อนไข</h3>
            <p className="text-xs text-slate-400 mt-1">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">นักศึกษา</th>
                  <th className="py-3.5 px-4 sm:px-6">รายวิชา</th>
                  <th className="py-3.5 px-4 text-center">ระดับชั้น</th>
                  <th className="py-3.5 px-4 text-center">รอบที่</th>
                  <th className="py-3.5 px-4 text-center">คะแนน</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 sm:px-6">วันและเวลาที่ส่ง</th>
                  <th className="py-3.5 px-4 text-center">รายงาน 5 วิชา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {relevantAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{attempt.studentName}</div>
                      <div className="text-xs text-slate-400">รหัส: {attempt.studentCode} • {attempt.department}</div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-800">{attempt.courseCode}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{attempt.courseTitle}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                        {attempt.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold">
                      #{attempt.attemptNumber}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-base font-black ${attempt.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {attempt.score}
                      </span>
                      <span className="text-xs text-slate-400">/{attempt.totalQuestions}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {attempt.passed ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ผ่าน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>ไม่ผ่าน</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-500 whitespace-nowrap">
                      {attempt.submittedAt}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleOpenStudentReport(attempt.studentId)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        title="ดูและพิมพ์ใบรายงานผลการสอบ 5 วิชาของนักเรียนคนนี้"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>ใบรายงาน 5 วิชา</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual 5-Course Report Card Modal */}
      <Individual5CourseReportModal
        isOpen={modalStudent !== null}
        onClose={() => setModalStudent(null)}
        student={modalStudent}
        allCourses={courses}
        allAttempts={examAttempts}
        semesterName={semesterName}
        academicYear={academicYear}
      />

    </div>
  );
};
