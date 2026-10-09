import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, BookOpen, FileText, ExternalLink, 
  Download, CheckCircle, Sparkles, ChevronRight, 
  ChevronLeft, AlertCircle, Share2, Eye
} from 'lucide-react';
import { formatGoogleDrivePreviewUrl } from '../../services/googleSheets';

export const LessonViewer: React.FC = () => {
  const { 
    courses, 
    lessons, 
    selectedCourseId, 
    selectedLessonId, 
    setSelectedLessonId, 
    setCurrentView 
  } = useApp();

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const courseLessons = lessons
    .filter(l => l.courseId === currentCourse?.id)
    .sort((a, b) => a.order - b.order);

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (selectedLessonId && courseLessons.some(l => l.id === selectedLessonId)) {
      return selectedLessonId;
    }
    return courseLessons.length > 0 ? courseLessons[0].id : '';
  });

  const activeLesson = courseLessons.find(l => l.id === activeLessonId) || courseLessons[0];
  const activeIndex = courseLessons.findIndex(l => l.id === activeLessonId);

  const previewUrl = activeLesson?.pdfUrl 
    ? formatGoogleDrivePreviewUrl(activeLesson.pdfUrl)
    : '';

  const handleNextLesson = () => {
    if (activeIndex < courseLessons.length - 1) {
      setActiveLessonId(courseLessons[activeIndex + 1].id);
    }
  };

  const handlePrevLesson = () => {
    if (activeIndex > 0) {
      setActiveLessonId(courseLessons[activeIndex - 1].id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-to-courses"
            onClick={() => setCurrentView('courses')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="กลับหน้ารายวิชา"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {currentCourse?.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentCourse?.department} ({currentCourse?.level})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {currentCourse?.title}
            </h1>
          </div>
        </div>

        {/* Quick jump to exam */}
        <button
          id="btn-jump-to-exam"
          onClick={() => setCurrentView('exam-room')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>เข้าสู่ห้องสอบออนไลน์ (40 ข้อ)</span>
        </button>
      </div>

      {/* Main Study Workspace: Sidebar + PDF & Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Lesson Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>สารบัญบทเรียน ({courseLessons.length} บท)</span>
              </h2>
              <span className="text-xs text-slate-500">
                {activeLesson ? `บทที่ ${activeLesson.order}` : ''}
              </span>
            </div>

            <div className="space-y-2">
              {courseLessons.map((lesson, idx) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    id={`lesson-item-${lesson.id}`}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs font-medium transition-all flex items-start space-x-3 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {lesson.order || idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 leading-relaxed">
                        {lesson.title}
                      </p>
                      {lesson.pdfUrl && (
                        <div className={`flex items-center space-x-1 text-[11px] mt-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                          <FileText className="w-3 h-3" />
                          <span>มีเอกสาร PDF</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teacher Contact Info Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 text-xs space-y-2">
            <p className="font-semibold text-slate-800">ข้อมูลผู้สอนประจำวิชา</p>
            <p className="text-slate-600">อาจารย์: <span className="font-medium text-slate-900">{currentCourse?.teacherName}</span></p>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              มีข้อสงสัยหรือติดปัญหาในเนื้อหาบทเรียน สามารถปรึกษาครูผู้สอนประจำวิชาได้ในคาบเรียนภาคสมทบ
            </p>
          </div>
        </div>

        {/* Right Active Lesson View: PDF Viewer + Notes */}
        <div className="lg:col-span-8 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Lesson Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    บทเรียนที่ {activeLesson.order}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    {activeLesson.title}
                  </h2>
                  {activeLesson.description && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {activeLesson.description}
                    </p>
                  )}
                </div>

                {/* Open in Google Drive / New tab button */}
                {activeLesson.pdfUrl && (
                  <a
                    href={activeLesson.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                    <span>เปิดเอกสาร Google Drive</span>
                  </a>
                )}
              </div>

              {/* Embedded Google Drive PDF Viewer Container */}
              {activeLesson.pdfUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>เอกสารประกอบการเรียนรู้ (PDF จาก Google Drive)</span>
                    </span>
                    <a
                      href={activeLesson.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>ดาวน์โหลดหรือเปิดหน้าต่างใหม่</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* PDF Viewer Frame */}
                  <div className="w-full h-[520px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner relative">
                    <iframe
                      src={previewUrl}
                      title={`PDF - ${activeLesson.title}`}
                      className="w-full h-full border-0"
                      allow="autoplay"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>วิชานี้ยังไม่ได้แนบไฟล์เอกสาร PDF จาก Google Drive</span>
                </div>
              )}

              {/* Lesson Text Content / Structured Notes */}
              {activeLesson.content && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>สรุปสาระสำคัญประจำบทเรียน</span>
                  </h3>
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {activeLesson.content}
                  </div>
                </div>
              )}

              {/* Attachments list if any */}
              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-800 text-xs">ไฟล์แนบและเอกสารเสริม:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLesson.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors"
                      >
                        <Download className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate font-medium">{att.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Next/Prev Pagination & Exam Call to action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrevLesson}
                    disabled={activeIndex === 0}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>บทก่อนหน้า</span>
                  </button>
                  <button
                    onClick={handleNextLesson}
                    disabled={activeIndex === courseLessons.length - 1}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>บทถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setCurrentView('exam-room')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>พร้อมแล้ว! เข้าทำข้อสอบ (40 ข้อ)</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>ยังไม่มีบทเรียนในรายวิชานี้</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
