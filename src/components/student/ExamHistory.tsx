import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, Trophy, CheckCircle2, AlertCircle, 
  RotateCcw, BookOpen, Search, ArrowRight, Filter,
  FileSpreadsheet, Printer
} from 'lucide-react';
import { Individual5CourseReportModal } from '../admin/Individual5CourseReportModal';

export const ExamHistory: React.FC = () => {
  const { 
    currentUser, 
    examAttempts, 
    courses, 
    semesters,
    setSelectedCourseId, 
    setCurrentView 
  } = useApp();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [show5CourseModal, setShow5CourseModal] = useState<boolean>(false);

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];
  const semesterName = activeSemester?.name || '1/2567';
  const academicYear = activeSemester?.academicYear || '2567';

  if (!currentUser) return null;

  const myAttempts = examAttempts.filter(e => e.studentId === currentUser.id);

  const filteredAttempts = myAttempts.filter(att => {
    const matchesCourse = selectedCourseFilter === 'all' || att.courseId === selectedCourseFilter;
    const matchesSearch = 
      att.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const totalPassed = myAttempts.filter(a => a.passed).length;
  const bestScore = myAttempts.reduce((max, curr) => curr.score > max ? curr.score : max, 0);

  const handleRetakeCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('exam-room');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              ประวัติการทำแบบทดสอบของฉัน
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกผลการสอบทุกรอบตามนโยบายส่งเสริมการเรียนรู้ตลอดชีวิต (สอบได้ไม่จำกัดรอบ เกณฑ์ผ่าน ≥20 ข้อ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View My 5-Course Grade Report Card */}
          <button
            onClick={() => setShow5CourseModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ใบรายงานผลการสอบ 5 วิชาของฉัน</span>
          </button>

          <button
            onClick={() => setCurrentView('courses')}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>กลับไปยังรายวิชา</span>
          </button>
        </div>
      </div>


      {/* Summary Score Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">จำนวนครั้งที่สอบทั้งหมด</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {myAttempts.length} <span className="text-xs font-normal text-slate-500">รอบ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">รอบที่สอบผ่านเกณฑ์ (≥20)</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {totalPassed} <span className="text-xs font-normal text-slate-500">รอบ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">คะแนนสูงสุดที่เคยทำได้</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {bestScore} <span className="text-xs font-normal text-slate-500">/ 40 คะแนน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อวิชา หรือรหัสวิชา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">ทุกรายวิชา</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">ยังไม่มีประวัติการสอบ</h3>
            <p className="text-xs text-slate-400 mt-1">
              เข้าสู่รายวิชาเพื่อเริ่มทำแบบทดสอบ 40 ข้อได้ทันที
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">รอบที่</th>
                  <th className="py-3.5 px-4 sm:px-6">รายวิชา</th>
                  <th className="py-3.5 px-4 text-center">คะแนนที่ได้</th>
                  <th className="py-3.5 px-4 text-center">ร้อยละ</th>
                  <th className="py-3.5 px-4 text-center">สถานะการประเมิน</th>
                  <th className="py-3.5 px-4 sm:px-6">วันและเวลาที่ส่ง</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredAttempts.map((attempt) => {
                  const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          #{attempt.attemptNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">{attempt.courseCode}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{attempt.courseTitle}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-base font-black ${attempt.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {attempt.score}
                        </span>
                        <span className="text-xs text-slate-400">/{attempt.totalQuestions}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">
                        {percent}%
                      </td>
                      <td className="py-4 px-4 text-center">
                        {attempt.passed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ผ่านเกณฑ์</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>ไม่ผ่านเกณฑ์</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-500 whitespace-nowrap">
                        {attempt.submittedAt}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleRetakeCourse(attempt.courseId)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>สอบใหม่</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual 5-Course Report Card Modal */}
      <Individual5CourseReportModal
        isOpen={show5CourseModal}
        onClose={() => setShow5CourseModal(false)}
        student={currentUser}
        allCourses={courses}
        allAttempts={examAttempts}
        semesterName={semesterName}
        academicYear={academicYear}
      />

    </div>
  );
};

