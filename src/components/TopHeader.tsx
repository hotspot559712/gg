import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, Bell, Database, ChevronDown, 
  LogOut, ShieldCheck, UserCheck, 
  GraduationCap, BookOpen, Layers, FileSpreadsheet,
  Building2, Calendar, FileText, BarChart3, HelpCircle, KeyRound,
  CheckCircle2
} from 'lucide-react';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  isCollapsed: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ 
  onOpenMobileSidebar,
  isCollapsed 
}) => {
  const { 
    currentUser, 
    currentRole, 
    currentView, 
    setCurrentView,
    semesters, 
    logout
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  // Get readable Thai title and icon for current view
  const getViewTitleInfo = () => {
    switch (currentView) {
      // Admin
      case 'admin-dashboard':
        return { title: 'แผงควบคุมภาพรวมระบบ', category: 'ผู้ดูแลระบบ', icon: <BarChart3 className="w-5 h-5 text-emerald-600" /> };
      case 'admin-departments':
        return { title: 'จัดการสาขาวิชา', category: 'โครงสร้างสถาบัน', icon: <Building2 className="w-5 h-5 text-indigo-600" /> };
      case 'admin-semesters':
        return { title: 'จัดการภาคเรียนการศึกษา', category: 'โครงสร้างสถาบัน', icon: <Calendar className="w-5 h-5 text-cyan-600" /> };
      case 'admin-courses':
        return { title: 'จัดการรายวิชาและหลักสูตร', category: 'หลักสูตรและการสอน', icon: <BookOpen className="w-5 h-5 text-blue-600" /> };
      case 'admin-users':
        return { title: 'จัดการผู้ใช้งาน (นักศึกษา / ครู)', category: 'ข้อมูลบุคลากร', icon: <FileSpreadsheet className="w-5 h-5 text-purple-600" /> };
      case 'admin-reports':
        return { title: 'รายงานผลการสอบและสถิติ', category: 'ประเมินผล', icon: <FileText className="w-5 h-5 text-amber-600" /> };
      case 'admin-sheets':
        return { title: 'ตั้งค่าฐานข้อมูล Google Sheets API', category: 'ระบบฐานข้อมูล', icon: <Database className="w-5 h-5 text-emerald-600" /> };
      
      // Teacher
      case 'teacher-courses':
        return { title: 'รายวิชาที่สอน & จัดการหลักสูตร', category: 'ครูผู้สอน', icon: <BookOpen className="w-5 h-5 text-amber-600" /> };
      case 'teacher-lessons':
        return { title: 'จัดการบทเรียนและสื่อ e-Learning', category: 'ครูผู้สอน', icon: <Layers className="w-5 h-5 text-orange-600" /> };
      case 'teacher-questions':
        return { title: 'คลังข้อสอบ 40 ข้อ & นำเข้า Excel', category: 'ครูผู้สอน', icon: <HelpCircle className="w-5 h-5 text-yellow-600" /> };
      case 'teacher-scores':
        return { title: 'ผลคะแนนสอบนักศึกษา', category: 'ประเมินผล', icon: <BarChart3 className="w-5 h-5 text-emerald-600" /> };
      
      // Student
      case 'courses':
        return { title: 'รายวิชาที่ลงทะเบียน', category: 'นักศึกษา', icon: <BookOpen className="w-5 h-5 text-blue-600" /> };
      case 'lesson-view':
        return { title: 'ห้องเรียนออนไลน์ (e-Learning)', category: 'นักศึกษา', icon: <Layers className="w-5 h-5 text-blue-600" /> };
      case 'exam-room':
        return { title: 'ห้องสอบออนไลน์ 40 ข้อ', category: 'นักศึกษา', icon: <HelpCircle className="w-5 h-5 text-rose-600" /> };
      case 'exam-history':
      case 'my-history':
        return { title: 'ประวัติและผลการสอบ', category: 'นักศึกษา', icon: <BarChart3 className="w-5 h-5 text-indigo-600" /> };
      
      default:
        return { title: 'ระบบการเรียนการสอนภาคสมทบ', category: 'E-learning', icon: <GraduationCap className="w-5 h-5 text-blue-600" /> };
    }
  };

  const viewInfo = getViewTitleInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Drawer Button & Page Title Breadcrumb */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Hamburger Button (Mobile & Tablet) */}
            <button
              id="btn-open-sidebar-mobile"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="เปิดเมนูด้านซ้าย"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* View Breadcrumbs */}
            <div className="flex items-center space-x-2.5">
              <div className="hidden sm:flex p-2 rounded-xl bg-slate-100/80 border border-slate-200/60">
                {viewInfo.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {viewInfo.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                    ภาคเรียน {activeSemester?.name || '1/2567'}
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-md">
                  {viewInfo.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Actions, Database Sync Status & Profile Menu */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            
            {/* Google Sheets DB Link Pill */}
            {currentRole === 'admin' && (
              <button
                onClick={() => setCurrentView('admin-sheets')}
                title="ฐานข้อมูล Google Apps Script"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Apps Script DB</span>
              </button>
            )}

            {/* User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  id="topheader-user-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2.5 p-1 sm:p-1.5 sm:pl-3 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 transition-colors"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : currentUser.role === 'teacher' ? `ครู (${currentUser.department})` : `${currentUser.level} ${currentUser.department}`}
                    </div>
                  </div>

                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-white"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">บัญชีที่ใช้งานอยู่</p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentUser.studentCode ? `รหัสนักศึกษา: ${currentUser.studentCode}` : `ชื่อผู้ใช้: @${currentUser.username}`}
                      </p>
                      <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                        {currentUser.role === 'teacher' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                        {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-blue-600" />}
                        <span>
                          {currentUser.role === 'admin' ? 'ผู้ดูแลระบบสูงสุด (Admin)' : currentUser.role === 'teacher' ? `ครูผู้สอน • ${currentUser.department}` : `${currentUser.level} • ${currentUser.department}`}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>เข้าสู่ระบบด้วยรหัสผ่านความปลอดภัย</span>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2 font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ (Sign Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
