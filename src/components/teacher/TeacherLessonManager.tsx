import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, Plus, FileText, ExternalLink, 
  Trash2, Edit3, Save, CheckCircle2, Eye, 
  HelpCircle, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import { Lesson } from '../../types';
import { formatGoogleDrivePreviewUrl } from '../../services/googleSheets';

export const TeacherLessonManager: React.FC = () => {
  const { 
    courses, 
    lessons, 
    selectedCourseId, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    setCurrentView 
  } = useApp();

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const courseLessons = lessons
    .filter(l => l.courseId === currentCourse?.id)
    .sort((a, b) => a.order - b.order);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    order: (courseLessons.length + 1),
    title: '',
    description: '',
    content: '',
    pdfUrl: '',
  });

  if (!currentCourse) return null;

  const handleOpenAdd = () => {
    setEditingLessonId(null);
    setFormData({
      order: courseLessons.length + 1,
      title: '',
      description: '',
      content: '',
      pdfUrl: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setFormData({
      order: lesson.order,
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content,
      pdfUrl: lesson.pdfUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingLessonId) {
      updateLesson(editingLessonId, {
        order: Number(formData.order),
        title: formData.title,
        description: formData.description,
        content: formData.content,
        pdfUrl: formData.pdfUrl,
      });
    } else {
      addLesson({
        courseId: currentCourse.id,
        order: Number(formData.order),
        title: formData.title,
        description: formData.description,
        content: formData.content,
        pdfUrl: formData.pdfUrl,
        attachments: [
          {
            id: `att-${Date.now()}`,
            title: `เอกสารประกอบบทเรียน ${formData.title} (PDF)`,
            url: formData.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf'
          }
        ]
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`ยืนยันการลบบทเรียน "${title}" หรือไม่?`)) {
      deleteLesson(id);
    }
  };

  const livePreviewUrl = formData.pdfUrl ? formatGoogleDrivePreviewUrl(formData.pdfUrl) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('teacher-courses')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="กลับหน้ารายวิชา"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {currentCourse.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentCourse.department} ({currentCourse.level})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              จัดการบทเรียนและเอกสาร PDF: {currentCourse.title}
            </h1>
          </div>
        </div>

        <button
          id="btn-add-lesson"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบทเรียนใหม่</span>
        </button>
      </div>

      {/* Google Drive Upload Guide Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">วิธีอัปโหลดเอกสาร PDF ขึ้น Google Drive เพื่อนำมาใส่ในบทเรียน:</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              1. อัปโหลดไฟล์ PDF ขึ้น <strong className="text-slate-800">Google Drive</strong> ของคุณ → 
              2. คลิกขวาที่ไฟล์ เลือก <strong>"แชร์" (Share)</strong> → 
              3. ตั้งค่าการเข้าถึงเป็น <strong>"ทุกคนที่มีลิงก์ (Anyone with the link)"</strong> → 
              4. คัดลอกลิงก์มาวางในช่อง "ลิงก์เอกสาร PDF Google Drive" ได้ทันที!
            </p>
          </div>
        </div>
        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-xl border border-blue-200 text-xs flex items-center space-x-1.5 shadow-sm shrink-0"
        >
          <span>เปิด Google Drive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Lessons List Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>รายการบทเรียนทั้งหมด ({courseLessons.length} บทเรียน)</span>
        </h2>

        {courseLessons.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">ยังไม่มีบทเรียนในรายวิชานี้</h3>
            <p className="text-xs text-slate-400 mt-1">กดปุ่ม "เพิ่มบทเรียนใหม่" ด้านบนเพื่อเริ่มสร้างเนื้อหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courseLessons.map((lesson) => (
              <div
                key={lesson.id}
                id={`teacher-lesson-row-${lesson.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {lesson.order}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {lesson.description || 'ไม่มีคำอธิบายย่อ'}
                    </p>
                    {lesson.pdfUrl && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>เชื่อมต่อ PDF แล้ว</span>
                        </span>
                        <a
                          href={lesson.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center space-x-0.5"
                        >
                          <span>เปิดดูไฟล์</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(lesson)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                    title="แก้ไขบทเรียน"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id, lesson.title)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors flex items-center space-x-1"
                    title="ลบบทเรียน"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>{editingLessonId ? 'แก้ไขบทเรียน' : 'เพิ่มบทเรียนใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">ลำดับบทที่ *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อบทเรียน *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น บทที่ 1: พื้นฐานสถาปัตยกรรมเว็บแอปพลิเคชัน"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">คำอธิบายย่อ</label>
                <input
                  type="text"
                  placeholder="เช่น สรุปเนื้อหาเกี่ยวกับ Client-Server, HTTP, HTML5..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>ลิงก์เอกสาร PDF จาก Google Drive (แชร์เป็น Anyone with the link)</span>
                  <span className="text-[10px] text-blue-600 font-normal">รองรับทุกรูปแบบ URL ของ Drive</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Live PDF Tester Preview inside modal */}
              {formData.pdfUrl && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-medium flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>ตัวอย่างการแสดงผล PDF (Embed Preview):</span>
                    </span>
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      ทดสอบเปิดไฟล์
                    </a>
                  </div>
                  <div className="h-44 w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <iframe
                      src={livePreviewUrl}
                      title="PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">สรุปเนื้อหาบทเรียน (ข้อความ / Markdown)</label>
                <textarea
                  rows={4}
                  placeholder="พิมพ์หัวข้อ สรุปเนื้อหาสำคัญ หรือโน้ตประกอบบทเรียน..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono text-xs"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  บันทึกบทเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
