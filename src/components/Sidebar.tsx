import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, ShieldCheck, UserCheck, BookOpen, 
  FileText, History, BarChart3, Users, Calendar, 
  Database, LogOut, CheckCircle2, 
  AlertCircle, RefreshCw, Building2,
  ChevronRight, Layers, Award, LayoutDashboard,
  CheckSquare, HelpCircle, User, Settings,
  PanelLeftClose, PanelLeft, ExternalLink, KeyRound
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const { 
    currentUser, 
    currentRole, 
    logout, 
    users,
    currentView, 
    setCurrentView,
    semesters,
    courses,
    selectedCourseId
  } = useApp();

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];
  const teacherCourses = courses.filter(c => c.teacherId === currentUser?.id || currentUser?.role === 'admin');
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Nav Item helper
  const renderNavItem = (
    viewName: string,
    label: string,
    icon: React.ReactNode,
    badge?: string | number,
    badgeColor?: string,
    isActiveCheck?: (view: string) => boolean
  ) => {
    const active = isActiveCheck ? isActiveCheck(currentView) : currentView === viewName;

    // Theme color accent based on role
    const activeClass = 
      currentRole === 'admin'
        ? 'bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500 font-semibold shadow-sm shadow-emerald-950/20'
        : currentRole === 'teacher'
        ? 'bg-amber-500/15 text-amber-300 border-l-4 border-amber-500 font-semibold shadow-sm shadow-amber-950/20'
        : 'bg-blue-500/15 text-blue-300 border-l-4 border-blue-500 font-semibold shadow-sm shadow-blue-950/20';

    const hoverClass = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border-l-4 border-transparent';

    return (
      <button
        id={`sidebar-nav-${viewName}`}
        onClick={() => handleNavClick(viewName)}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 group ${
          active ? activeClass : hoverClass
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <div className={`flex items-center space-x-3 truncate ${isCollapsed ? 'space-x-0' : ''}`}>
          <span className={`shrink-0 transition-transform duration-150 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
          </span>
          {!isCollapsed && (
            <span className="truncate text-left">{label}</span>
          )}
        </div>

        {!isCollapsed && badge !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${badgeColor || 'bg-slate-800 text-slate-400'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 border-r border-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 1. Header: Brand Logo & Title */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur">
          <div 
            className="flex items-center space-x-3 cursor-pointer overflow-hidden"
            onClick={() => {
              if (currentRole === 'student') handleNavClick('courses');
              else if (currentRole === 'teacher') handleNavClick('teacher-courses');
              else if (currentRole === 'admin') handleNavClick('admin-dashboard');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white tracking-tight truncate">
                    ระบบภาคสมทบ
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] px-1.5 py-0.2 rounded font-medium">
                    E-Exam
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  ปวช. / ปวส. ภาคเรียน {activeSemester?.name || '1/2567'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. User Profile Summary Box */}
        {currentUser && !isCollapsed && (
          <div className="p-3 mx-3 my-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] mt-0.5 flex items-center space-x-1">
                  {currentUser.role === 'admin' && (
                    <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3" />
                      <span>ผู้ดูแลระบบ</span>
                    </span>
                  )}
                  {currentUser.role === 'teacher' && (
                    <span className="inline-flex items-center space-x-1 text-amber-400 font-medium bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/40">
                      <UserCheck className="w-3 h-3" />
                      <span className="truncate max-w-[110px]">ครู: {currentUser.department}</span>
                    </span>
                  )}
                  {currentUser.role === 'student' && (
                    <span className="inline-flex items-center space-x-1 text-blue-400 font-medium bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-800/40">
                      <GraduationCap className="w-3 h-3" />
                      <span className="truncate max-w-[110px]">{currentUser.level} {currentUser.department}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Navigation Sections (จัดเป็นสัดส่วน) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* ============================================================ */}
          {/* ADMIN MENU SECTIONS */}
          {/* ============================================================ */}
          {currentRole === 'admin' && (
            <>
              {/* Section 1: ภาพรวมและโครงสร้างสถาบัน */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <LayoutDashboard className="w-3 h-3 text-emerald-500" />
                    <span>ภาพรวม &amp; โครงสร้างสถาบัน</span>
                  </div>
                )}
                
                {renderNavItem(
                  'admin-dashboard',
                  'แผงควบคุมหลัก',
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                )}

                {renderNavItem(
                  'admin-departments',
                  'จัดการสาขาวิชา',
                  <Building2 className="w-4 h-4 text-indigo-400" />,
                  undefined
                )}

                {renderNavItem(
                  'admin-semesters',
                  'จัดการภาคเรียน',
                  <Calendar className="w-4 h-4 text-cyan-400" />,
                  activeSemester?.name || '1/2567',
                  'bg-cyan-950 text-cyan-400 border border-cyan-800/50'
                )}
              </div>

              {/* Section 2: การจัดการเรียนการสอนและบุคลากร */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>หลักสูตร &amp; ข้อมูลผู้ใช้งาน</span>
                  </div>
                )}

                {renderNavItem(
                  'admin-courses',
                  'จัดการรายวิชาและหลักสูตร',
                  <BookOpen className="w-4 h-4 text-blue-400" />,
                  courses.length,
                  'bg-slate-800 text-slate-300'
                )}

                {renderNavItem(
                  'admin-users',
                  'จัดการผู้ใช้งาน (Excel)',
                  <Users className="w-4 h-4 text-purple-400" />,
                  users.length,
                  'bg-purple-950 text-purple-300 border border-purple-800/40'
                )}
              </div>

              {/* Section 3: รายงานสรุปผลและการเชื่อมต่อระบบ */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3 h-3 text-amber-500" />
                    <span>รายงาน &amp; ระบบฐานข้อมูล</span>
                  </div>
                )}

                {renderNavItem(
                  'admin-reports',
                  'รายงานผลการสอบและสถิติ',
                  <FileText className="w-4 h-4 text-amber-400" />
                )}

                {renderNavItem(
                  'admin-sheets',
                  'ฐานข้อมูล Google Apps Script',
                  <Database className="w-4 h-4 text-emerald-400" />,
                  '100% ฟรี',
                  'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                )}
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* TEACHER MENU SECTIONS */}
          {/* ============================================================ */}
          {currentRole === 'teacher' && (
            <>
              {/* Section 1: จัดการการสอนและบทเรียน */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-3 h-3 text-amber-500" />
                    <span>การสอน &amp; บทเรียน e-Learning</span>
                  </div>
                )}

                {renderNavItem(
                  'teacher-courses',
                  'รายวิชาที่สอน',
                  <BookOpen className="w-4 h-4 text-amber-400" />,
                  teacherCourses.length,
                  'bg-amber-950 text-amber-300 border border-amber-800/40',
                  (v) => v === 'teacher-courses'
                )}

                {renderNavItem(
                  'teacher-lessons',
                  'จัดการบทเรียนและสื่อ',
                  <Layers className="w-4 h-4 text-orange-400" />,
                  selectedCourse ? selectedCourse.code : undefined,
                  'bg-orange-950 text-orange-300 border border-orange-800/40',
                  (v) => v === 'teacher-lessons'
                )}

                {renderNavItem(
                  'teacher-questions',
                  'คลังข้อสอบ 40 ข้อ (Excel)',
                  <HelpCircle className="w-4 h-4 text-yellow-400" />,
                  'Excel',
                  'bg-emerald-950 text-emerald-400 border border-emerald-800/40',
                  (v) => v === 'teacher-questions'
                )}
              </div>

              {/* Section 2: ประเมินผลคะแนนนักเรียน */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BarChart3 className="w-3 h-3 text-emerald-500" />
                    <span>ประเมินผลคะแนนนักเรียน</span>
                  </div>
                )}

                {renderNavItem(
                  'teacher-scores',
                  'คะแนนผลการสอบนักศึกษา',
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* STUDENT MENU SECTIONS */}
          {/* ============================================================ */}
          {currentRole === 'student' && (
            <>
              {/* Section 1: การเรียนของฉัน */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>การเรียนรู้ของฉัน</span>
                  </div>
                )}

                {renderNavItem(
                  'courses',
                  'รายวิชาที่ลงทะเบียน',
                  <BookOpen className="w-4 h-4 text-blue-400" />,
                  undefined,
                  undefined,
                  (v) => v === 'courses' || v === 'lesson-view'
                )}
              </div>

              {/* Section 2: การสอบและผลการเรียน */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Award className="w-3 h-3 text-indigo-500" />
                    <span>การทดสอบ &amp; ผลการเรียน</span>
                  </div>
                )}

                {renderNavItem(
                  'exam-history',
                  'ประวัติและผลการสอบ',
                  <History className="w-4 h-4 text-indigo-400" />,
                  undefined,
                  undefined,
                  (v) => v === 'exam-history' || v === 'my-history'
                )}
              </div>
            </>
          )}

        </div>

        {/* 4. Bottom Footer: Google Apps Script DB Link & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur shrink-0 space-y-2">
          
          {/* Google Sheets Link Badge */}
          {currentRole === 'admin' && (
            !isCollapsed ? (
              <div 
                onClick={() => handleNavClick('admin-sheets')}
                className="p-2.5 rounded-xl border border-emerald-600/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Database className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate text-[11px] font-semibold">
                    ฐานข้อมูล Google Apps Script
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">100% ฟรี</span>
              </div>
            ) : (
              <div className="flex justify-center py-1 cursor-pointer" onClick={() => handleNavClick('admin-sheets')}>
                <Database 
                  className="w-4 h-4 text-emerald-400" 
                  title="ฐานข้อมูล Google Apps Script"
                />
              </div>
            )
          )}

          {/* Logout Button */}
          {currentUser && (
            <button
              id="sidebar-btn-logout"
              onClick={logout}
              title={isCollapsed ? 'ออกจากระบบ' : undefined}
              className={`w-full flex items-center text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 rounded-xl py-2.5 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : 'px-3 space-x-2'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="font-semibold">ออกจากระบบ (Sign Out)</span>}
            </button>
          )}

        </div>
      </aside>
    </>
  );
};
