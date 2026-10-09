import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, ShieldCheck, UserCheck, BookOpen, 
  FileText, History, BarChart3, Users, Calendar, 
  Database, LogOut, ChevronDown, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, Building2
} from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC<{ onOpenLogin?: () => void }> = ({ onOpenLogin }) => {
  const { 
    currentUser, 
    currentRole, 
    logout, 
    switchUser, 
    users, 
    currentView, 
    setCurrentView,
    googleSheetConfig,
    testConnection
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleQuickTestConnection = async () => {
    setIsSyncing(true);
    await testConnection();
    setIsSyncing(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
            if (currentRole === 'student') setCurrentView('courses');
            else if (currentRole === 'teacher') setCurrentView('teacher-courses');
            else if (currentRole === 'admin') setCurrentView('admin-dashboard');
          }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  ระบบการเรียนการสอนภาคสมทบ
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  E-learning
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light">
                หลักสูตร ปวช. / ปวส. • ฐานข้อมูล Google Sheets
              </p>
            </div>
          </div>

          {/* Role Navigations */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1">
              {/* Student Nav */}
              {currentRole === 'student' && (
                <>
                  <button
                    id="nav-student-courses"
                    onClick={() => setCurrentView('courses')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      currentView === 'courses' || currentView === 'lesson-view' || currentView === 'exam-room'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>รายวิชาของฉัน</span>
                  </button>
                  <button
                    id="nav-student-history"
                    onClick={() => setCurrentView('exam-history')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      currentView === 'exam-history'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>ประวัติผลการสอบ</span>
                  </button>
                </>
              )}

              {/* Teacher Nav */}
              {currentRole === 'teacher' && (
                <>
                  <button
                    id="nav-teacher-courses"
                    onClick={() => setCurrentView('teacher-courses')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      currentView === 'teacher-courses' || currentView === 'teacher-lessons' || currentView === 'teacher-questions'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>จัดการรายวิชาและบทเรียน</span>
                  </button>
                  <button
                    id="nav-teacher-scores"
                    onClick={() => setCurrentView('teacher-scores')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      currentView === 'teacher-scores'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>ผลคะแนนนักเรียน</span>
                  </button>
                </>
              )}

              {/* Admin Nav */}
              {currentRole === 'admin' && (
                <>
                  <button
                    id="nav-admin-dashboard"
                    onClick={() => setCurrentView('admin-dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-dashboard'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>ภาพรวม</span>
                  </button>
                  <button
                    id="nav-admin-users"
                    onClick={() => setCurrentView('admin-users')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-users'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>ผู้ใช้งาน</span>
                  </button>
                  <button
                    id="nav-admin-departments"
                    onClick={() => setCurrentView('admin-departments')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-departments'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>สาขาวิชา</span>
                  </button>
                  <button
                    id="nav-admin-semesters"
                    onClick={() => setCurrentView('admin-semesters')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-semesters'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>ภาคเรียน</span>
                  </button>
                  <button
                    id="nav-admin-courses"
                    onClick={() => setCurrentView('admin-courses')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-courses'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>หลักสูตร</span>
                  </button>
                  <button
                    id="nav-admin-reports"
                    onClick={() => setCurrentView('admin-reports')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-reports'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>รายงานสรุป</span>
                  </button>
                  <button
                    id="nav-admin-sheets"
                    onClick={() => setCurrentView('admin-sheets')}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-sheets'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Google Sheets</span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Action: Sheet status & User Profile Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Google Sheets Live Status Pill */}
            <div 
              onClick={() => {
                if (currentRole === 'admin') setCurrentView('admin-sheets');
              }}
              title={googleSheetConfig.webAppUrl ? 'คลิกเพื่อตั้งค่า Google Sheets API' : 'ทำงานในโหมด Standalone / คลิกเพื่อเชื่อมต่อ Google Sheets'}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                googleSheetConfig.status === 'connected' 
                  ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
                  : googleSheetConfig.webAppUrl
                  ? 'bg-amber-950/60 border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {googleSheetConfig.status === 'connected' 
                  ? 'Google Sheet: เชื่อมต่อแล้ว' 
                  : googleSheetConfig.webAppUrl 
                  ? 'Google Sheet: รอซิงค์' 
                  : 'Google Sheet: พร้อมเชื่อมต่อ'}
              </span>
              {googleSheetConfig.webAppUrl && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickTestConnection();
                  }}
                  className="ml-1 p-0.5 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
                      {currentUser.role === 'admin' && (
                        <span className="text-emerald-400 font-medium">🛡️ ผู้ดูแลระบบ</span>
                      )}
                      {currentUser.role === 'teacher' && (
                        <span className="text-amber-400 font-medium">👨‍🏫 ครู ({currentUser.department})</span>
                      )}
                      {currentUser.role === 'student' && (
                        <span className="text-blue-400 font-medium">
                          🎓 {currentUser.level} {currentUser.department}
                        </span>
                      )}
                    </div>
                  </div>
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-600"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu & Quick Demo Switcher */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">บัญชีผู้ใช้ปัจจุบัน</p>
                      <p className="text-sm font-semibold text-white truncate mt-0.5">{currentUser.name}</p>
                      <p className="text-xs text-slate-400">
                        {currentUser.studentCode ? `รหัส: ${currentUser.studentCode} • ` : ''}
                        {currentUser.department} ({currentUser.level})
                      </p>
                    </div>

                    {/* Fast Switch Role for Demo Testing */}
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1 font-medium">
                        <span className="flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>สลับบัญชีทดสอบทันที (Demo)</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              currentUser.id === u.id 
                                ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="truncate">
                              {u.role === 'admin' ? '🛡️ ' : u.role === 'teacher' ? '👨‍🏫 ' : '🎓 '}
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'ครู' : u.level}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        id="btn-logout"
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-open-login"
                onClick={onOpenLogin || (() => setCurrentView('login'))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
              >
                เข้าสู่ระบบ
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation Row */}
        {currentUser && (
          <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800 scrollbar-none">
            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => setCurrentView('courses')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'courses' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📚 รายวิชา
                </button>
                <button
                  onClick={() => setCurrentView('exam-history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'exam-history' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📊 ประวัติผลการสอบ
                </button>
              </>
            )}

            {currentRole === 'teacher' && (
              <>
                <button
                  onClick={() => setCurrentView('teacher-courses')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'teacher-courses' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📖 รายวิชาและบทเรียน
                </button>
                <button
                  onClick={() => setCurrentView('teacher-scores')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'teacher-scores' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📊 คะแนนนักเรียน
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-dashboard' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ภาพรวม
                </button>
                <button
                  onClick={() => setCurrentView('admin-users')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-users' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ผู้ใช้
                </button>
                <button
                  onClick={() => setCurrentView('admin-departments')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-departments' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  สาขาวิชา
                </button>
                <button
                  onClick={() => setCurrentView('admin-semesters')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-semesters' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ภาคเรียน
                </button>
                <button
                  onClick={() => setCurrentView('admin-courses')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-courses' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  รายวิชา
                </button>
                <button
                  onClick={() => setCurrentView('admin-reports')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-reports' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  รายงาน
                </button>
                <button
                  onClick={() => setCurrentView('admin-sheets')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    currentView === 'admin-sheets' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ชีต
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
