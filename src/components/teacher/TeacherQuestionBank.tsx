import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, Plus, Sparkles, CheckCircle2, 
  Trash2, Edit3, Save, HelpCircle, FileText, 
  AlertCircle, Download, Upload, Copy, Check, FileSpreadsheet
} from 'lucide-react';
import { Question, ChoiceKey } from '../../types';
import { QuestionExcelModal } from './QuestionExcelModal';

export const TeacherQuestionBank: React.FC = () => {
  const { 
    courses, 
    questions, 
    selectedCourseId, 
    saveQuestionBank, 
    setCurrentView 
  } = useApp();

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const [courseQuestions, setCourseQuestions] = useState<Question[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Editing single question modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    if (currentCourse) {
      const list = questions
        .filter(q => q.courseId === currentCourse.id)
        .sort((a, b) => a.questionNumber - b.questionNumber);
      setCourseQuestions(list);
    }
  }, [currentCourse, questions]);

  if (!currentCourse) return null;

  const totalQuestions = courseQuestions.length;
  const isComplete40 = totalQuestions >= 40;

  const handleSaveQuestionItem = (q: Question) => {
    let updated: Question[];
    if (isAddMode) {
      updated = [...courseQuestions, q].sort((a, b) => a.questionNumber - b.questionNumber);
    } else {
      updated = courseQuestions.map(item => item.id === q.id ? q : item);
    }
    setCourseQuestions(updated);
    saveQuestionBank(currentCourse.id, updated);
    setEditingQuestion(null);
    setIsAddMode(false);
    triggerSavedFeedback();
  };

  const handleDeleteQuestion = (id: string, qNum: number) => {
    if (window.confirm(`ยืนยันการลบคำถามข้อที่ ${qNum} หรือไม่?`)) {
      const updated = courseQuestions
        .filter(q => q.id !== id)
        .map((q, idx) => ({ ...q, questionNumber: idx + 1 })); // renumber
      setCourseQuestions(updated);
      saveQuestionBank(currentCourse.id, updated);
      triggerSavedFeedback();
    }
  };

  const handleAutoFillTo40 = () => {
    if (window.confirm(`ต้องการสร้างข้อสอบจำลองเพิ่มเติมให้ครบ 40 ข้อ สำหรับวิชา ${currentCourse.title} หรือไม่?`)) {
      const currentCount = courseQuestions.length;
      const newItems: Question[] = [...courseQuestions];
      
      for (let i = currentCount + 1; i <= 40; i++) {
        newItems.push({
          id: `q-${currentCourse.code.replace(/[^a-zA-Z0-9]/g, '')}-${i}-${Date.now()}`,
          courseId: currentCourse.id,
          questionNumber: i,
          questionText: `คำถามข้อที่ ${i}: เกี่ยวกับสมรรถนะและการประยุกต์ใช้ในรายวิชา ${currentCourse.title} (หน่วยการเรียนรู้ที่ ${Math.ceil(i / 8)})`,
          optionA: `ตัวเลือก ก: การวิเคราะห์และหลักการทำงานพื้นฐานตามมาตรฐานวิชาชีพข้อที่ ${i}`,
          optionB: `ตัวเลือก ข: ขั้นตอนการปฏิบัติงานและการแก้ปัญหาอย่างเป็นระบบ`,
          optionC: `ตัวเลือก ค: การเลือกใช้เครื่องมือและเทคโนโลยีให้เหมาะสมกับงาน`,
          optionD: `ตัวเลือก ง: การประเมินผลและการบำรุงรักษาอย่างมีประสิทธิภาพ`,
          correctAnswer: (['A', 'B', 'C', 'D'][i % 4]) as ChoiceKey,
          explanation: `แนวคิดสำคัญสำหรับข้อที่ ${i}`
        });
      }

      setCourseQuestions(newItems);
      saveQuestionBank(currentCourse.id, newItems);
      triggerSavedFeedback();
    }
  };

  const triggerSavedFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const filteredQuestions = courseQuestions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.questionNumber.toString() === searchTerm.trim()
  );

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
                เกณฑ์ผ่าน 20 ข้อขึ้นไป (50%)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              คลังข้อสอบ 40 ข้อ: {currentCourse.title}
            </h1>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-excel-question-bank"
            onClick={() => setShowExcelModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>นำเข้า / ส่งออก Excel</span>
          </button>

          {!isComplete40 && (
            <button
              onClick={handleAutoFillTo40}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>เติมให้ครบ 40 ข้ออัตโนมัติ</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAddMode(true);
              setEditingQuestion({
                id: `q-custom-${Date.now()}`,
                courseId: currentCourse.id,
                questionNumber: courseQuestions.length + 1,
                questionText: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                correctAnswer: 'A',
                explanation: ''
              });
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มข้อสอบทีละข้อ</span>
          </button>
        </div>
      </div>

      {/* Progress & Completeness Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 text-sm">ความสมบูรณ์ของคลังข้อสอบ:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
              isComplete40 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {totalQuestions} / 40 ข้อ {isComplete40 ? '(ครบถ้วนตามเกณฑ์)' : '(ยังไม่ครบ 40 ข้อ)'}
            </span>
          </div>
          <span className="text-slate-500">
            ระบบจะนำคลังข้อสอบนี้ไปให้นักเรียนทำในห้องสอบออนไลน์
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete40 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (totalQuestions / 40) * 100)}%` }}
          />
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกคลังข้อสอบลงระบบเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>

      {/* Questions List & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>รายการข้อสอบทั้งหมด ({filteredQuestions.length} ข้อ)</span>
          </h2>

          <input
            type="text"
            placeholder="ค้นหาข้อความคำถาม หรือพิมพ์เลขข้อ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64 shadow-sm"
          />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">ไม่พบข้อสอบ</h3>
            <p className="text-xs text-slate-400 mt-1">กดปุ่ม "เติมให้ครบ 40 ข้ออัตโนมัติ" หรือ "เพิ่มข้อสอบทีละข้อ"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                id={`teacher-q-card-${q.questionNumber}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                {/* Q Title Bar */}
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-start space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {q.questionNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                        {q.questionText}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setIsAddMode(false);
                        setEditingQuestion(q);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                      title="แก้ไขข้อสอบ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id, q.questionNumber)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                      title="ลบข้อสอบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4 Choices Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'A', label: 'ก', text: q.optionA },
                    { key: 'B', label: 'ข', text: q.optionB },
                    { key: 'C', label: 'ค', text: q.optionC },
                    { key: 'D', label: 'ง', text: q.optionD },
                  ].map(opt => {
                    const isCorrect = q.correctAnswer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {opt.label}
                        </span>
                        <span className="flex-1 leading-tight">{opt.text}</span>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                            เฉลย
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    💡 <strong>คำอธิบาย:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 my-8 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span>{isAddMode ? 'เพิ่มคำถามใหม่' : `แก้ไขคำถามข้อที่ ${editingQuestion.questionNumber}`}</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ลำดับข้อที่ *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingQuestion.questionNumber}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionNumber: Number(e.target.value) })}
                  className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">โจทย์คำถาม *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="พิมพ์ข้อความคำถาม..."
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">ตัวเลือกทั้ง 4 (ก, ข, ค, ง) พร้อมเลือกข้อที่ถูกต้อง *</label>
                
                {[
                  { key: 'A' as ChoiceKey, label: 'ตัวเลือก ก', field: 'optionA' as const },
                  { key: 'B' as ChoiceKey, label: 'ตัวเลือก ข', field: 'optionB' as const },
                  { key: 'C' as ChoiceKey, label: 'ตัวเลือก ค', field: 'optionC' as const },
                  { key: 'D' as ChoiceKey, label: 'ตัวเลือก ง', field: 'optionD' as const },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswerGroup"
                      id={`radio-${opt.key}`}
                      checked={editingQuestion.correctAnswer === opt.key}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt.key })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor={`radio-${opt.key}`} className="w-16 font-bold text-slate-700 shrink-0">
                      {opt.label}:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`ข้อความ ${opt.label}`}
                      value={editingQuestion[opt.field]}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, [opt.field]: e.target.value })}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">คำอธิบายประกอบการเรียนรู้ (เสริม)</label>
                <input
                  type="text"
                  placeholder="พิมพ์คำอธิบายประกอบความเข้าใจ..."
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestionItem(editingQuestion)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-500/20"
                >
                  บันทึกข้อสอบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Question Import/Export Modal */}
      {showExcelModal && (
        <QuestionExcelModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          course={currentCourse}
          currentQuestions={courseQuestions}
          onImportSuccess={(updated) => {
            setCourseQuestions(updated);
            triggerSavedFeedback();
          }}
        />
      )}

    </div>
  );
};
