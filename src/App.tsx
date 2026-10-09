/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginPage } from './components/auth/LoginPage';
import { StudentCourseList } from './components/student/StudentCourseList';
import { LessonViewer } from './components/student/LessonViewer';
import { ExamRoom } from './components/student/ExamRoom';
import { ExamHistory } from './components/student/ExamHistory';
import { TeacherCourses } from './components/teacher/TeacherCourses';
import { TeacherLessonManager } from './components/teacher/TeacherLessonManager';
import { TeacherQuestionBank } from './components/teacher/TeacherQuestionBank';
import { TeacherScores } from './components/teacher/TeacherScores';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminSemesters } from './components/admin/AdminSemesters';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminCourses } from './components/admin/AdminCourses';
import { AdminReports } from './components/admin/AdminReports';
import { GoogleSheetsSettings } from './components/admin/GoogleSheetsSettings';
import { Database, GraduationCap } from 'lucide-react';

const MainViews: React.FC = () => {
  const { currentView, currentUser } = useApp();

  // If not logged in and not on login view, or explicitly on login view
  if (!currentUser || currentView === 'login') {
    return <LoginPage />;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      {currentView === 'courses' && <StudentCourseList />}
      {currentView === 'lesson-view' && <LessonViewer />}
      {currentView === 'exam-room' && <ExamRoom />}
      {(currentView === 'my-history' || currentView === 'exam-history') && <ExamHistory />}
      {currentView === 'teacher-courses' && <TeacherCourses />}
      {currentView === 'teacher-lessons' && <TeacherLessonManager />}
      {currentView === 'teacher-questions' && <TeacherQuestionBank />}
      {currentView === 'teacher-scores' && <TeacherScores />}
      {currentView === 'admin-dashboard' && <AdminDashboard />}
      {currentView === 'admin-users' && <AdminUsers />}
      {currentView === 'admin-departments' && <AdminDepartments />}
      {currentView === 'admin-semesters' && <AdminSemesters />}
      {currentView === 'admin-courses' && <AdminCourses />}
      {currentView === 'admin-reports' && <AdminReports />}
      {currentView === 'admin-sheets' && <GoogleSheetsSettings />}
    </main>
  );
};

const LayoutFooter: React.FC = () => {
  const { googleSheetConfig, semesters, setCurrentView, currentUser } = useApp();
  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur text-slate-500 py-6 px-4 sm:px-6 lg:px-8 text-xs shrink-0 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800">
              ระบบการเรียนการสอนภาคสมทบ E-learning &amp; Online Exam
            </div>
            <div className="text-[11px] text-slate-500">
              วิทยาลัยอาชีวศึกษา • ระดับ ปวช. และ ปวส. • ภาคเรียนที่ {activeSemester?.name || '1/2567'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700">
            <Database className={`w-3.5 h-3.5 ${googleSheetConfig.status === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>
              {googleSheetConfig.status === 'connected' ? 'Google Sheets (Apps Script)' : 'Local Storage Mode'}
            </span>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin-sheets')}
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
            >
              ตั้งค่าชีต
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

const AppShell: React.FC = () => {
  const { currentUser, currentView } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If not logged in, render simple full-screen LoginPage
  if (!currentUser || currentView === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 selection:bg-blue-500 selection:text-white font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Right Column */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic View Content */}
        <MainViews />

        {/* App Footer */}
        <LayoutFooter />
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
