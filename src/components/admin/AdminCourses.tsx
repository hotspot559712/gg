import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, Plus, Search, Filter, Edit3, 
  Trash2, FileText, Sparkles, CheckCircle2, 
  UserCheck, ExternalLink, Building2
} from 'lucide-react';
import { Course, Department, EducationLevel } from '../../types';
import { EDUCATION_LEVELS } from '../../data/initialData';

export const AdminCourses: React.FC = () => {
  const { 
    courses, 
    lessons, 
    questions, 
    users, 
    departmentsList,
    semesters,
    addCourse, 
    updateCourse, 
    deleteCourse,
    setSelectedCourseId, 
    setCurrentView 
  } = useApp();

  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const teacherList = users.filter(u => u.role === 'teacher' || u.role === 'admin');
  const activeSemester = semesters.find(s => s.isOpen) || semesters[0];

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    department: (departmentsList[0] || 'คอมพิวเตอร์ธุรกิจ') as Department,
    level: 'ปวส.1' as EducationLevel,
    semesterId: activeSemester?.id || 'sem-2567-1',
    teacherId: teacherList[0]?.id || 'usr-t1',
    credit: 3,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    passingScore: 20,
    totalQuestionsTarget: 40,
    active: true
  });

  const filteredCourses = courses.filter(c => {
    if (deptFilter !== 'all' && c.department !== deptFilter) return false;
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchCode = c.code.toLowerCase().includes(term);
      const matchTeacher = c.teacherName.toLowerCase().includes(term);
      if (!matchTitle && !matchCode && !matchTeacher) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCourseId(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      department: 'คอมพิวเตอร์ธุรกิจ',
      level: 'ปวส.1',
      semesterId: activeSemester?.id || 'sem-2567-1',
      teacherId: teacherList[0]?.id || 'usr-t1',
      credit: 3,
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
      passingScore: 20,
      totalQuestionsTarget: 40,
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description,
      department: course.department,
      level: course.level,
      semesterId: course.semesterId,
      teacherId: course.teacherId,
      credit: course.credit,
      coverImage: course.coverImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
      passingScore: course.passingScore || 20,
      totalQuestionsTarget: course.totalQuestionsTarget || 40,
      active: course.active
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    const teacher = users.find(u => u.id === formData.teacherId);
    const teacherName = teacher ? teacher.name : 'อาจารย์ประจำวิชา';

    if (editingCourseId) {
      updateCourse(editingCourseId, {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        department: formData.department,
        level: formData.level,
        semesterId: formData.semesterId,
        teacherId: formData.teacherId,
        teacherName,
        credit: Number(formData.credit),
        coverImage: formData.coverImage,
        passingScore: Number(formData.passingScore),
        totalQuestionsTarget: Number(formData.totalQuestionsTarget),
        active: formData.active
      });
    } else {
      addCourse({
        code: formData.code,
        title: formData.title,
        description: formData.description,
        department: formData.department,
        level: formData.level,
        semesterId: formData.semesterId,
        teacherId: formData.teacherId,
        teacherName,
        credit: Number(formData.credit),
        coverImage: formData.coverImage,
        passingScore: Number(formData.passingScore),
        totalQuestionsTarget: Number(formData.totalQuestionsTarget),
        active: formData.active
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`ยืนยันการลบรายวิชา "${title}" พร้อมบทเรียนและข้อสอบทั้งหมดหรือไม่?`)) {
      deleteCourse(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการหลักสูตรและรายวิชาทั้งหมด (Course Catalog)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดรายวิชา, สาขาวิชา, ระดับชั้น ปวช./ปวส., ครูผู้สอน และเกณฑ์การประเมิน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('admin-departments')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs sm:text-sm font-bold border border-indigo-200 transition-all flex items-center justify-center space-x-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>จัดการสาขาวิชา</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายวิชาใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารหัสวิชา, ชื่อวิชา, หรือชื่อผู้สอน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">ทุกสาขาวิชา</option>
            {departmentsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">ทุกระดับชั้น</option>
            {EDUCATION_LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">รหัสและชื่อวิชา</th>
                <th className="py-3.5 px-4">สาขาวิชา</th>
                <th className="py-3.5 px-4 text-center">ระดับชั้น</th>
                <th className="py-3.5 px-4">ครูผู้สอน</th>
                <th className="py-3.5 px-4 text-center">บทเรียน</th>
                <th className="py-3.5 px-4 text-center">คลังข้อสอบ</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredCourses.map((course) => {
                const cLessons = lessons.filter(l => l.courseId === course.id);
                const cQuestions = questions.filter(q => q.courseId === course.id);
                return (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{course.code}</div>
                      <div className="text-xs text-slate-600 font-medium">{course.title}</div>
                      <div className="text-[11px] text-slate-400">{course.credit} หน่วยกิต • เกณฑ์ผ่าน ≥{course.passingScore || 20} ข้อ</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {course.department}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {course.level}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{course.teacherName}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold">
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {cLessons.length} บท
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${cQuestions.length >= 40 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                        {cQuestions.length}/40 ข้อ
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCurrentView('teacher-lessons');
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs transition-colors"
                          title="จัดการบทเรียน"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCurrentView('teacher-questions');
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs transition-colors"
                          title="จัดการคลังข้อสอบ 40 ข้อ"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                          title="แก้ไขรายวิชา"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                          title="ลบรายวิชา"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 my-8 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>{editingCourseId ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">รหัสวิชา *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 30204-2001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500 font-bold"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อวิชา *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การพัฒนาโปรแกรมบนเว็บและสื่อผสม"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">สาขาวิชา</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ระดับชั้น</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
                  >
                    {EDUCATION_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ครูผู้สอนประจำวิชา</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
                >
                  {teacherList.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เป้าหมายจำนวนข้อสอบ</label>
                  <input
                    type="number"
                    value={formData.totalQuestionsTarget}
                    onChange={(e) => setFormData({ ...formData, totalQuestionsTarget: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เกณฑ์คะแนนผ่าน (ข้อ)</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">คำอธิบายรายวิชา</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20"
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
