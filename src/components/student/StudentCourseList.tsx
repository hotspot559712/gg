import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, FileText, CheckCircle, AlertCircle, 
  ArrowRight, UserCheck, Award, Layers, Sparkles, 
  Filter, Search, BookCheck, HelpCircle
} from 'lucide-react';
import { Course } from '../../types';

export const StudentCourseList: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    lessons, 
    questions, 
    examAttempts, 
    semesters,
    setSelectedCourseId, 
    setCurrentView 
  } = useApp();

  const [filterMode, setFilterMode] = useState<'my-major' | 'all'>('my-major');
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  // Filter courses by student's department and level (Strict user requirement)
  const studentDepartment = currentUser.department;
  const studentLevel = currentUser.level;

  const relevantCourses = courses.filter(course => {
    // Search filter
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterMode === 'my-major') {
      // Must match department OR level
      const matchDept = course.department === studentDepartment;
      const matchLvl = course.level === studentLevel || course.level === 'ทุกระดับ';
      return matchDept && matchLvl;
    }
    
    return true;
  });

  // Calculate student overall summary
  const studentAttempts = examAttempts.filter(e => e.studentId === currentUser.id);
  const passedCoursesCount = new Set(
    studentAttempts.filter(e => e.passed).map(e => e.courseId)
  ).size;

  const handleOpenCourseLessons = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('lesson-view');
  };

  const handleStartExam = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('exam-room');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Student Welcome Profile Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  นักศึกษาภาคสมทบ
                </span>
                <span className="bg-slate-800/80 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium">
                  {currentUser.level}
                </span>
                <span className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                  ภาคเรียนที่ {activeSemester?.name || '1/2567'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                สวัสดี, {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>รหัสนักศึกษา: <strong className="text-white">{currentUser.studentCode || 'STD-6701'}</strong></span>
                <span>•</span>
                <span>สาขาวิชา: <strong className="text-blue-300">{currentUser.department}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Academic Progress Stats */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <div className="flex-1 sm:flex-initial bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {passedCoursesCount}
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">สอบผ่านแล้ว</div>
            </div>
            <div className="flex-1 sm:flex-initial bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                {studentAttempts.length}
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">ครั้งที่สอบทั้งหมด</div>
            </div>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Filter and Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>รายวิชาตามหลักสูตร ({relevantCourses.length} รายวิชา)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบคัดกรองอัตโนมัติเฉพาะวิชาในสาขา <span className="font-semibold text-slate-700">{studentDepartment}</span> ระดับชั้น <span className="font-semibold text-slate-700">{studentLevel}</span>
          </p>
        </div>

        {/* Search & Filter toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setFilterMode('my-major')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'my-major' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สาขาของฉัน
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'all' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทุกวิชา
            </button>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      {relevantCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">ไม่พบรายวิชาที่ตรงกับการค้นหา</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "ทุกวิชา" เพื่อดูรายวิชาอื่นในหลักสูตร
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relevantCourses.map(course => {
            const courseLessons = lessons.filter(l => l.courseId === course.id);
            const courseQuestions = questions.filter(q => q.courseId === course.id);
            const userCourseAttempts = examAttempts.filter(
              e => e.studentId === currentUser.id && e.courseId === course.id
            );
            
            // Best score
            const bestAttempt = userCourseAttempts.reduce<typeof userCourseAttempts[0] | null>((best, curr) => {
              if (!best) return curr;
              return curr.score > best.score ? curr : best;
            }, null);

            const hasPassed = userCourseAttempts.some(e => e.passed);

            return (
              <div 
                key={course.id}
                id={`course-card-${course.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:border-blue-300"
              >
                {/* Course Cover Image Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={course.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                      {course.code}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-700">
                      {course.level}
                    </span>
                  </div>

                  {/* Pass Status Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white/90 bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      {course.department}
                    </span>
                    {hasPassed ? (
                      <span className="flex items-center space-x-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>ผ่านเกณฑ์แล้ว</span>
                      </span>
                    ) : userCourseAttempts.length > 0 ? (
                      <span className="flex items-center space-x-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>ยังไม่ผ่าน ({bestAttempt?.score || 0}/40)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] bg-slate-900/70 text-slate-300 px-2 py-0.5 rounded-full">
                        ยังไม่ได้สอบ
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Details Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>ครูผู้สอน: {course.teacherName}</span>
                    </div>
                  </div>

                  {/* Course Status Summary Bar */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="border-r border-slate-200/80 pr-2">
                      <div className="text-slate-400 text-[10px] font-medium">บทเรียนในวิชา</div>
                      <div className="text-slate-800 font-bold text-sm mt-0.5 flex items-center justify-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>{courseLessons.length} บทเรียน</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">คลังข้อสอบ (เกณฑ์ ≥20)</div>
                      <div className="text-slate-800 font-bold text-sm mt-0.5 flex items-center justify-center space-x-1">
                        <BookCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{courseQuestions.length || 40} ข้อ</span>
                      </div>
                    </div>
                  </div>

                  {/* Exam Attempts Summary Note */}
                  {userCourseAttempts.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100/70">
                      <span>คะแนนสูงสุด: <strong className="text-blue-700">{bestAttempt?.score}/40</strong> ({bestAttempt?.passed ? 'ผ่าน' : 'ไม่ผ่าน'})</span>
                      <span className="text-slate-400">สอบแล้ว {userCourseAttempts.length} รอบ</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id={`btn-view-lessons-${course.id}`}
                      onClick={() => handleOpenCourseLessons(course.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      <span>อ่านบทเรียน</span>
                    </button>
                    <button
                      id={`btn-start-exam-${course.id}`}
                      onClick={() => handleStartExam(course.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>ทำข้อสอบ (40 ข้อ)</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
