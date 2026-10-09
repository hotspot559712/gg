import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Download, Upload, CheckCircle2, 
  AlertCircle, HelpCircle, X, ArrowRight, 
  Trash2, RefreshCw, Layers, Check, AlertTriangle, BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course, Question, ChoiceKey } from '../../types';
import { 
  parseQuestionExcelFile, 
  ParsedQuestionRow, 
  downloadQuestionExcelTemplate, 
  exportQuestionsToExcel, 
  exportQuestionsToCSV,
  choiceKeyToThai
} from '../../utils/excelUtils';

interface QuestionExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  currentQuestions: Question[];
  onImportSuccess: (importedQuestions: Question[]) => void;
}

export const QuestionExcelModal: React.FC<QuestionExcelModalProps> = ({
  isOpen,
  onClose,
  course,
  currentQuestions,
  onImportSuccess
}) => {
  const { saveQuestionBank } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Import State
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'invalid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    const validExts = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExts.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('รองรับเฉพาะไฟล์ .xlsx, .xls หรือ .csv เท่านั้น');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const result = await parseQuestionExcelFile(selectedFile);
      setParsedRows(result.rows);
      setValidCount(result.validCount);
      setInvalidCount(result.invalidCount);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
      setParsedRows([]);
      setValidCount(0);
      setInvalidCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setValidCount(0);
    setInvalidCount(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setError('ไม่มีข้อมูลข้อสอบที่ถูกต้องให้ดำเนินการนำเข้า');
      return;
    }

    let finalQuestions: Question[] = [];

    if (importMode === 'replace') {
      finalQuestions = validRows.map((r, index) => ({
        id: `q-${course.id}-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        courseId: course.id,
        questionNumber: index + 1,
        questionText: r.questionText,
        optionA: r.optionA,
        optionB: r.optionB,
        optionC: r.optionC,
        optionD: r.optionD,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation || undefined
      }));
    } else {
      // Append mode
      const startNum = currentQuestions.length;
      const newItems: Question[] = validRows.map((r, index) => ({
        id: `q-${course.id}-${startNum + index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        courseId: course.id,
        questionNumber: startNum + index + 1,
        questionText: r.questionText,
        optionA: r.optionA,
        optionB: r.optionB,
        optionC: r.optionC,
        optionD: r.optionD,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation || undefined
      }));
      finalQuestions = [...currentQuestions, ...newItems];
    }

    saveQuestionBank(course.id, finalQuestions);
    onImportSuccess(finalQuestions);
    onClose();
  };

  const filteredRows = parsedRows.filter(row => {
    if (filterView === 'valid' && !row.isValid) return false;
    if (filterView === 'invalid' && row.isValid) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        row.questionText.toLowerCase().includes(term) ||
        row.questionNumber.toString() === term ||
        row.optionA.toLowerCase().includes(term) ||
        row.optionB.toLowerCase().includes(term) ||
        row.optionC.toLowerCase().includes(term) ||
        row.optionD.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-4">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {course.code}
                </span>
                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {course.title}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                นำเข้าและจัดการข้อสอบผ่าน Excel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 shrink-0">
          <button
            id="tab-btn-import-questions"
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>นำเข้าข้อสอบ (Import Excel)</span>
          </button>
          <button
            id="tab-btn-export-questions"
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อสอบ (Export Excel / CSV)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'import' ? (
            <div className="space-y-6">
              
              {/* Template Download Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      ดาวน์โหลดแบบฟอร์มตัวอย่างนำเข้าข้อสอบ (.xlsx)
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      มีคอลัมน์มาตรฐาน: <strong>ข้อที่, โจทย์คำถาม, ตัวเลือก ก, ข, ค, ง, เฉลย (ก/ข/ค/ง หรือ A/B/C/D), คำอธิบายเฉลย</strong>
                    </p>
                  </div>
                </div>

                <button
                  id="btn-download-question-template"
                  onClick={() => downloadQuestionExcelTemplate(course.title)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Template</span>
                </button>
              </div>

              {/* Upload Zone (if no file loaded yet) */}
              {!file && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel มาวางที่นี่
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    รองรับไฟล์นามสกุล <strong>.xlsx, .xls, .csv</strong> (สามารถอัปโหลดได้สูงสุด 40 ข้อขึ้นไป)
                  </p>

                  <div className="inline-flex items-center space-x-2 text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ระบบรองรับการระบุเฉลยทั้ง ก, ข, ค, ง และ A, B, C, D</span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                  <p className="text-xs font-semibold text-slate-600">กำลังอ่านและตรวจสอบไฟล์ข้อสอบ...</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">เกิดข้อผิดพลาด: </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Preview Parsed Data */}
              {file && !loading && parsedRows.length > 0 && (
                <div className="space-y-4">
                  
                  {/* File Info & Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">{file.name}</div>
                        <div className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-emerald-700">{validCount}</span>
                        <span className="text-slate-500">พร้อมนำเข้า</span>
                      </div>

                      {invalidCount > 0 && (
                        <div className="flex items-center space-x-1.5 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span className="font-bold text-red-700">{invalidCount}</span>
                          <span className="text-red-600">ข้อผิดพลาด</span>
                        </div>
                      )}

                      <button
                        onClick={handleReset}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg text-xs"
                        title="เปลี่ยนไฟล์ใหม่"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mode & Filters Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    
                    {/* Import Mode Radio */}
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-bold text-slate-700">รูปแบบการบันทึก:</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-800 font-medium">
                          แทนที่ข้อสอบเดิมทั้งหมด ({currentQuestions.length} ข้อเดิมจะถูกเขียนทับ)
                        </span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-800 font-medium">
                          เพิ่มต่อท้ายข้อสอบเดิม
                        </span>
                      </label>
                    </div>

                    {/* Filter View */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={filterView}
                        onChange={(e) => setFilterView(e.target.value as any)}
                        className="text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
                      >
                        <option value="all">แสดงทั้งหมด ({parsedRows.length})</option>
                        <option value="valid">เฉพาะข้อที่สมบูรณ์ ({validCount})</option>
                        {invalidCount > 0 && (
                          <option value="invalid">เฉพาะข้อที่ผิดพลาด ({invalidCount})</option>
                        )}
                      </select>

                      <input
                        type="text"
                        placeholder="ค้นหาข้อความ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 w-36 sm:w-44"
                      />
                    </div>
                  </div>

                  {/* Preview Cards List */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100 bg-white">
                    {filteredRows.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        ไม่พบรายการตามเงื่อนไขการค้นหา
                      </div>
                    ) : (
                      filteredRows.map((row, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 transition-colors ${
                            !row.isValid ? 'bg-red-50/40' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-start space-x-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {row.questionNumber}
                              </span>
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                  {row.questionText || <span className="text-red-500 italic">[ไม่มีโจทย์คำถาม]</span>}
                                </h5>
                              </div>
                            </div>

                            {/* Status & Answer Badge */}
                            <div className="flex items-center space-x-1.5 shrink-0">
                              {row.isValid ? (
                                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>เฉลย: ตัวเลือก {choiceKeyToThai(row.correctAnswer)} ({row.correctAnswer})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>ข้อมูลไม่สมบูรณ์</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs mt-2 pl-8">
                            {[
                              { key: 'A' as ChoiceKey, thai: 'ก', text: row.optionA },
                              { key: 'B' as ChoiceKey, thai: 'ข', text: row.optionB },
                              { key: 'C' as ChoiceKey, thai: 'ค', text: row.optionC },
                              { key: 'D' as ChoiceKey, thai: 'ง', text: row.optionD },
                            ].map(opt => {
                              const isAnswer = row.correctAnswer === opt.key && row.isValid;
                              return (
                                <div
                                  key={opt.key}
                                  className={`p-1.5 px-2.5 rounded-lg text-[11px] flex items-center space-x-1.5 ${
                                    isAnswer
                                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border border-slate-100'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                    isAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {opt.thai}
                                  </span>
                                  <span className="truncate flex-1">
                                    {opt.text || <span className="text-red-400 italic">(ว่าง)</span>}
                                  </span>
                                  {isAnswer && (
                                    <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded font-bold">
                                      เฉลย
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Errors row if any */}
                          {row.errors.length > 0 && (
                            <div className="mt-2 pl-8">
                              <div className="text-[11px] text-red-600 bg-red-100/70 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{row.errors.join(' • ')}</span>
                              </div>
                            </div>
                          )}

                          {row.explanation && (
                            <div className="mt-1.5 pl-8 text-[10px] text-slate-500">
                              💡 คำอธิบาย: {row.explanation}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* Export Tab */
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    ข้อมูลข้อสอบปัจจุบันในรายวิชานี้
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    วิชา {course.code} - {course.title} ({course.department})
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    currentQuestions.length >= 40 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentQuestions.length} / 40 ข้อ
                  </span>
                </div>
              </div>

              {currentQuestions.length === 0 ? (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center text-amber-800 text-xs">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="font-bold">ยังไม่มีข้อสอบในรายวิชานี้</p>
                  <p className="text-amber-700 mt-1">
                    สามารถดาวน์โหลดแบบฟอร์มเปล่าเพื่อนำไปกรอกข้อสอบแล้วนำเข้าในแท็บ "นำเข้าข้อสอบ" ได้ทันที
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Excel (.xlsx) Download Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          ส่งออกเป็นไฟล์ Excel (.xlsx)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          เหมาะสำหรับเปิดและแก้ไขด้วย Microsoft Excel, Google Sheets มีหัวตารางและเฉลยครบถ้วน
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-export-questions-xlsx"
                      onClick={() => exportQuestionsToExcel(currentQuestions, course.title, course.code)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดไฟล์ .XLSX ({currentQuestions.length} ข้อ)</span>
                    </button>
                  </div>

                  {/* CSV UTF-8 Download Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          ส่งออกเป็นไฟล์ CSV (.csv)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          รูปแบบมาตรฐาน UTF-8 พร้อม BOM รองรับภาษาไทยสมบูรณ์แบบสำหรับนำไปประมวลผลต่อ
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-export-questions-csv"
                      onClick={() => exportQuestionsToCSV(currentQuestions, course.title, course.code)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดไฟล์ .CSV ({currentQuestions.length} ข้อ)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/70 rounded-b-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors order-2 sm:order-1"
          >
            ปิดหน้าต่าง
          </button>

          {activeTab === 'import' && file && validCount > 0 && (
            <button
              id="btn-submit-import-questions"
              type="button"
              onClick={handleConfirmImport}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              <Check className="w-4 h-4" />
              <span>
                ยืนยันนำเข้าข้อสอบ {validCount} ข้อ
                {importMode === 'replace' ? ' (แทนที่เดิม)' : ' (ต่อท้าย)'}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
