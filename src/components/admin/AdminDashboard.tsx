import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, BookOpen, Calendar, FileText, 
  Database, Trophy, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Sparkles, Activity, Building2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    stats, 
    departments,
    semesters, 
    courses, 
    users, 
    examAttempts, 
    googleSheetConfig, 
    setCurrentView 
  } = useApp();

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Welcome & System Status Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-emerald-950">
              🛡️ ผู้ดูแลระบบสูงสุด (Super Admin)
            </span>
            <span className="text-xs text-emerald-300">
              ภาคเรียนเปิด: {activeSemester?.name || '1/2567'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            แผงควบคุมระบบการเรียนการสอนภาคสมทบ E-learning
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            จัดการผู้ใช้, เปิด/ปิดภาคเรียน, กำหนดสาขาวิชา, ระดับชั้น ปวช./ปวส., รายวิชา และรายงานสรุปผลการสอบ พร้อมฐานข้อมูล Google Sheets
          </p>
        </div>

        {/* Google Sheet Hub Button */}
        <button
          id="btn-admin-goto-sheets"
          onClick={() => setCurrentView('admin-sheets')}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>จัดการฐานข้อมูล Google Sheets</span>
        </button>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => setCurrentView('admin-users')}
          className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">นักเรียนในระบบ</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {stats.totalStudents} <span className="text-xs font-normal text-slate-400">คน</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">ปวช. และ ปวส. ทุกสาขา →</p>
        </div>

        <div 
          onClick={() => setCurrentView('admin-users')}
          className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">ครูผู้สอน</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {stats.totalTeachers} <span className="text-xs font-normal text-slate-400">ท่าน</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">ประจำแต่ละสาขาวิชา →</p>
        </div>

        <div 
          onClick={() => setCurrentView('admin-courses')}
          className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">รายวิชาทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {stats.totalCourses} <span className="text-xs font-normal text-slate-400">วิชา</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">พร้อมคลังข้อสอบ 40 ข้อ →</p>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">ร้อยละการสอบผ่าน</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {stats.overallPassRate}%
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">จาก {stats.totalExamsTaken} รอบการสอบ →</p>
        </div>
      </div>

      {/* Quick Navigation Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>เมนูการบริหารจัดการระบบหลัก</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Module 1: Users */}
          <div 
            onClick={() => setCurrentView('admin-users')}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                จัดการผู้ใช้งานและสิทธิ์
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เพิ่ม/แก้ไข/ลบ ข้อมูลนักเรียน (ปวช./ปวส.), ครูผู้สอน, และผู้ดูแลระบบ นำเข้า Excel
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>เข้าจัดการผู้ใช้งาน</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Module 2: Departments */}
          <div 
            onClick={() => setCurrentView('admin-departments')}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                จัดการสาขาวิชา ({departments.length} สาขา)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เพิ่ม/แก้ไข/ลบ สาขาวิชา กำหนดรหัสย่อ สีประจำสาขา และอัปเดตข้อมูลอัตโนมัติ
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>เข้าจัดการสาขาวิชา</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Module 3: Semesters */}
          <div 
            onClick={() => setCurrentView('admin-semesters')}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                จัดการภาคเรียน (เปิด/ปิด)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                สลับสถานะเปิด-ปิดภาคเรียน เช่น 1/2567 เพื่อควบคุมช่วงเวลาเข้าเรียนและทำข้อสอบ
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>เข้าจัดการภาคเรียน</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Module 4: Reports */}
          <div 
            onClick={() => setCurrentView('admin-reports')}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                รายงานสรุปและสถิติ
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ดูสรุปคะแนนสอบรายสาขาวิชา, อัตราการสอบผ่าน และส่งออกไฟล์รายงาน Excel/CSV
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>ดูรายงานสรุปผล</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
