import React, { useRef } from 'react';
import { User, Course, ExamAttempt } from '../../types';
import { 
  generateStudent5CourseReport, 
  exportIndividual5CourseToExcel,
  Student5CourseReport
} from '../../utils/gradeUtils';
import { 
  Printer, Download, X, ChevronLeft, ChevronRight, 
  Award, CheckCircle2, AlertCircle, Clock, 
  GraduationCap, Building2, Calendar, FileText
} from 'lucide-react';

interface Individual5CourseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  allCourses: Course[];
  allAttempts: ExamAttempt[];
  semesterName?: string;
  academicYear?: string;
  onNextStudent?: () => void;
  onPrevStudent?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const Individual5CourseReportModal: React.FC<Individual5CourseReportModalProps> = ({
  isOpen,
  onClose,
  student,
  allCourses,
  allAttempts,
  semesterName = '1/2567',
  academicYear = '2567',
  onNextStudent,
  onPrevStudent,
  hasNext = false,
  hasPrev = false
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const report: Student5CourseReport = generateStudent5CourseReport(
    student,
    allCourses,
    allAttempts,
    academicYear,
    semesterName
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportIndividual5CourseToExcel(report);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Modal Controls Header (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                ใบรายงานผลการสอบรายบุคคล 5 รายวิชา
              </h2>
              <p className="text-xs text-slate-400">
                สาขาวิชา{report.department} • ระดับชั้น {report.level}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Prev / Next Student Controls */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 mr-2">
                <button
                  disabled={!hasPrev}
                  onClick={onPrevStudent}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 rounded-lg transition-colors"
                  title="นักศึกษาก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] px-2 text-slate-400 font-mono">สลับคน</span>
                <button
                  disabled={!hasNext}
                  onClick={onNextStudent}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 rounded-lg transition-colors"
                  title="นักศึกษาถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">พิมพ์เอกสาร</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก Excel</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          
          {/* Printable A4 Paper Container */}
          <div 
            ref={printRef}
            className="printable-report bg-white mx-auto p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:rounded-none max-w-3xl space-y-6 text-slate-800 font-sans"
            style={{ minHeight: '842px' }}
          >
            {/* 1. Official Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
              <div className="flex items-center justify-center space-x-2 text-slate-900 mb-1">
                <GraduationCap className="w-8 h-8 text-blue-700" />
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  วิทยาลัยอาชีวศึกษา • สถาบันการอาชีวศึกษา
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                ใบรายงานผลการสอบและประเมินผลการเรียนออนไลน์ ภาคสมทบ (แบบ 5 รายวิชา)
              </h1>
              <p className="text-xs text-slate-600">
                ภาคเรียนที่ {report.semesterName} ปีการศึกษา {report.academicYear} • สาขาวิชา{report.department}
              </p>
            </div>

            {/* 2. Student Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">รหัสนักศึกษา:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm sm:text-base text-blue-700">
                    {report.student.studentCode || '-'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">ชื่อ-นามสกุล:</span>
                  <span className="font-bold text-slate-900">{report.student.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">สาขาวิชา:</span>
                  <span className="font-bold text-slate-800">{report.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">ระดับชั้น:</span>
                  <span className="font-bold text-slate-800">{report.level} (ภาคสมทบ)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">วันที่ออกเอกสาร:</span>
                  <span className="text-slate-700">{report.evaluationDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0">สถานะผลการเรียน:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                    report.isAllPassed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : report.passedCoursesCount > 0 
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {report.overallStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. 5-Course Grade Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between">
                <span>ตารางผลคะแนนและการประเมินรายวิชา (จำนวน 5 วิชาหลัก)</span>
                <span className="text-[11px] font-normal text-slate-500">เกณฑ์ผ่านข้อสอบ ≥ 50% (20 ข้อขึ้นไป)</span>
              </h3>

              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10 border-r border-slate-300">ลำดับ</th>
                      <th className="py-2.5 px-3 w-28 border-r border-slate-300">รหัสวิชา</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">ชื่อรายวิชา</th>
                      <th className="py-2.5 px-2 text-center w-14 border-r border-slate-300">หน่วยกิต</th>
                      <th className="py-2.5 px-2 text-center w-16 border-r border-slate-300">คะแนน (40)</th>
                      <th className="py-2.5 px-2 text-center w-14 border-r border-slate-300">ร้อยละ</th>
                      <th className="py-2.5 px-2 text-center w-14 border-r border-slate-300">เกรด</th>
                      <th className="py-2.5 px-3 text-center w-24 border-r border-slate-300">ผลการประเมิน</th>
                      <th className="py-2.5 px-2 text-center w-14">รอบสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {report.courses.map((course, idx) => (
                      <tr key={course.courseId || idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700 border-r border-slate-200">
                          {course.courseCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200">
                          <div className="font-semibold">{course.courseTitle}</div>
                          {course.submittedAt && (
                            <div className="text-[10px] text-slate-400">ส่งผลเมื่อ: {course.submittedAt}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-600 border-r border-slate-200">
                          {course.credit}
                        </td>
                        <td className="py-2.5 px-2 text-center font-black border-r border-slate-200">
                          {course.score !== null ? (
                            <span className={course.passed ? 'text-emerald-600' : 'text-amber-600'}>
                              {course.score}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200">
                          {course.percentage !== null ? `${course.percentage}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-black text-blue-700 border-r border-slate-200">
                          {course.grade}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          {course.statusText === 'ผ่านเกณฑ์' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ผ่าน</span>
                            </span>
                          )}
                          {course.statusText === 'ไม่ผ่านเกณฑ์' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertCircle className="w-3 h-3" />
                              <span>ไม่ผ่าน</span>
                            </span>
                          )}
                          {course.statusText === 'ยังไม่เข้าสอบ' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>ยังไม่สอบ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600 text-[11px]">
                          {course.attemptCount > 0 ? `#${course.attemptCount}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Summary Footer */}
                  <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-right border-r border-slate-300">
                        รวมสรุป 5 รายวิชา:
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-300 text-slate-800">
                        {report.totalCredits} นก.
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-300 text-slate-900">
                        {report.totalScoreEarned} / {report.totalMaxScore}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-300 text-slate-900">
                        {report.overallPercentage}%
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-300 text-blue-700 text-sm">
                        {report.gpa !== null ? report.gpa.toFixed(2) : '-'}
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-center text-slate-700 text-[11px]">
                        สอบผ่าน {report.passedCoursesCount} / {report.totalCoursesCount} วิชา
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 4. Semester Evaluation Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 font-medium">คะแนนรวม 5 วิชา</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {report.totalScoreEarned} <span className="text-xs font-normal text-slate-400">/ 200 คะแนน</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 font-medium">เกรดเฉลี่ยสะสม (GPA ภาคเรียน)</div>
                <div className="text-lg font-black text-blue-700 mt-0.5">
                  {report.gpa !== null ? report.gpa.toFixed(2) : '0.00'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 font-medium">ผลการตัดสินประจำภาคเรียน</div>
                <div className={`text-sm font-bold mt-1 ${
                  report.isAllPassed ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {report.isAllPassed ? '✅ สำเร็จการประเมิน 5 วิชา' : `⏳ สอบผ่าน ${report.passedCoursesCount}/5 วิชา`}
                </div>
              </div>
            </div>

            {/* 5. Official Signatures (3 Signature Columns) */}
            <div className="pt-6 border-t border-slate-300">
              <div className="grid grid-cols-3 gap-4 text-center text-[11px] text-slate-700">
                
                {/* 1. Advisor Signature */}
                <div className="space-y-12">
                  <div>ลงชื่อ..........................................................</div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">(........................................................)</div>
                    <div className="text-slate-500">ครูที่ปรึกษา / ครูผู้สอน</div>
                    <div className="text-[10px] text-slate-400">วันที่ ..... / ..... / .........</div>
                  </div>
                </div>

                {/* 2. Department Head Signature */}
                <div className="space-y-12">
                  <div>ลงชื่อ..........................................................</div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">(........................................................)</div>
                    <div className="text-slate-500">หัวหน้าแผนกวิชา{report.department}</div>
                    <div className="text-[10px] text-slate-400">วันที่ ..... / ..... / .........</div>
                  </div>
                </div>

                {/* 3. Registrar / Academic Director Signature */}
                <div className="space-y-12">
                  <div>ลงชื่อ..........................................................</div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">(........................................................)</div>
                    <div className="text-slate-500">นายทะเบียน / ฝ่ายวิชาการ</div>
                    <div className="text-[10px] text-slate-400">วันที่ ..... / ..... / .........</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Small note at bottom */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              * เอกสารนี้สร้างขึ้นโดยระบบ E-learning และทดสอบออนไลน์ ภาคสมทบ สำหรับใช้เป็นหลักฐานแสดงผลการประเมินผลการเรียน
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
