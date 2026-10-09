import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, Plus, FileText, CheckCircle2, 
  Users, BarChart3, Edit3, Trash2, Sparkles, 
  Layers, ExternalLink, HelpCircle
} from 'lucide-react';
import { Course, Department, EducationLevel } from '../../types';
import { DEPARTMENTS, EDUCATION_LEVELS } from '../../data/initialData';

export const TeacherCourses: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    lessons, 
    questions, 
    examAttempts, 
    semesters,
    addCourse, 
    updateCourse, 
    deleteCourse,
    setSelectedCourseId, 
    setCurrentView 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    department: (currentUser?.department !== 'ส่วนกลาง' ? currentUser?.department : 'คอมพิวเตอร์ธุรกิจ') as Department,
    level: 'ปวส.1' as EducationLevel,
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    active: true
  });

  if (!currentUser) return null;

  // Teacher sees their assigned courses or their department's courses
  const myCourses = courses.filter(c => 
    c.teacherId === currentUser.id || 
    c.department === currentUser.department ||
    currentUser.role === 'admin'
  );

  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    addCourse({
      code: formData.code,
      title: formData.title,
      description: formData.description,
      department: formData.department,
      level: formData.level,
      semesterId: activeSemester?.id || 'sem-2567-1',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      credit: Number(formData.credit),
      coverImage: formData.coverImage,
      active: true,
      passingScore: 20,
      totalQuestionsTarget: 40
    });

    setShowAddModal(false);
    setFormData({
      code: '',
      title: '',
      description: '',
      department: 'คอมพิวเตอร์ธุรกิจ',
      level: 'ปวส.1',
      credit: 3,
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
      active: true
    });
  };

  const handleOpenLessons = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('teacher-lessons');
  };

  const handleOpenQuestions = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('teacher-questions');
  };

  const handleOpenScores = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('teacher-scores');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-amber-950">
              👨‍🏫 ระบบครูผู้สอน
            </span>
            <span className="text-xs text-amber-300">
              สาขา{currentUser.department}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            การจัดการรายวิชา บทเรียน และคลังข้อสอบ 40 ข้อ
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            ครูผู้สอน: <strong className="text-white">{currentUser.name}</strong> • ภาคเรียนที่ {activeSemester?.name}
          </p>
        </div>

        <button
          id="btn-add-new-course"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายวิชาใหม่</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>รายวิชาที่รับผิดชอบ ({myCourses.length} วิชา)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map(course => {
            const courseLessons = lessons.filter(l => l.courseId === course.id);
            const courseQuestions = questions.filter(q => q.courseId === course.id);
            const courseAttempts = examAttempts.filter(e => e.courseId === course.id);
            const passCount = courseAttempts.filter(e => e.passed).length;
            const passRate = courseAttempts.length > 0 
              ? Math.round((passCount / courseAttempts.length) * 100) 
              : 0;

            const isQuestionsComplete = courseQuestions.length >= 40;

            return (
              <div 
                key={course.id}
                id={`teacher-course-card-${course.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Cover & Badges */}
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={course.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                        {course.code}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-700">
                        {course.level}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span>สาขา{course.department}</span>
                      <span>{course.credit} หน่วยกิต</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">บทเรียน</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{courseLessons.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">คลังข้อสอบ</div>
                        <div className={`font-bold text-sm mt-0.5 ${isQuestionsComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {courseQuestions.length}/40
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">ผู้สอบผ่าน</div>
                        <div className="font-bold text-emerald-600 text-sm mt-0.5">{passRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Action Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-manage-lessons-${course.id}`}
                      onClick={() => handleOpenLessons(course.id)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>จัดการบทเรียน ({courseLessons.length})</span>
                    </button>
                    <button
                      id={`btn-manage-questions-${course.id}`}
                      onClick={() => handleOpenQuestions(course.id)}
                      className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 border border-amber-200/60"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>คลังข้อสอบ 40 ข้อ</span>
                    </button>
                  </div>

                  <button
                    id={`btn-view-scores-${course.id}`}
                    onClick={() => handleOpenScores(course.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ดูคะแนนนักเรียน ({courseAttempts.length} รอบการสอบ)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>เพิ่มรายวิชาใหม่</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">รหัสวิชา *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 30204-2005"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">หน่วยกิต</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credit}
                    onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อวิชา *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การออกแบบและพัฒนาเว็บไซต์ธุรกิจ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">สาขาวิชา</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ระดับชั้น</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {EDUCATION_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">คำอธิบายรายวิชา</label>
                <textarea
                  rows={3}
                  placeholder="คำอธิบายรายวิชา วัตถุประสงค์ และสมรรถนะรายวิชา..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ลิงก์ภาพหน้าปก (URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-500/20"
                >
                  บันทึกรายวิชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
