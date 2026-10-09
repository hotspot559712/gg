import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Bookmark, 
  HelpCircle, ChevronLeft, ChevronRight, Send, 
  RotateCcw, History, Sparkles, Trophy, BookOpen, 
  Info, ShieldAlert, Award, Cloud, RefreshCw, 
  Wifi, WifiOff, Save, Check
} from 'lucide-react';
import { ChoiceKey, ExamAttempt, Question, StudentExamProgress } from '../../types';

export const ExamRoom: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    selectedCourseId, 
    getCourseQuestions, 
    submitExam, 
    autoSaveExamProgress,
    getStoredExamProgress,
    clearStoredExamProgress,
    setCurrentView 
  } = useApp();

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  
  // Strip answer keys for student exam room
  const [courseQuestions, setCourseQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<string>(() => new Date().toISOString());
  
  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamAttempt | null>(null);

  // Auto-Save & Network State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline_cached' | 'error' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [restoredNotice, setRestoredNotice] = useState<{ count: number; savedAt: string } | null>(null);
  const [isManualSaving, setIsManualSaving] = useState<boolean>(false);

  // Mutable refs to prevent stale closures during timers and network events
  const answersRef = useRef(answers);
  const flaggedRef = useRef(flagged);
  const currentIndexRef = useRef(currentIndex);
  const startTimeRef = useRef(startTime);
  const hasRestoredRef = useRef(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    if (currentCourse) {
      const qList = getCourseQuestions(currentCourse.id, true);
      setCourseQuestions(qList);
    }
  }, [currentCourse, getCourseQuestions]);

  const totalTargetQuestions = courseQuestions.length || currentCourse?.totalQuestionsTarget || 40;
  const currentQ = courseQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, totalTargetQuestions - answeredCount);
  const passingThreshold = currentCourse?.passingScore || 20;

  // 1. Initial State Recovery: Check if previous unfinished draft exists
  useEffect(() => {
    if (!currentCourse || !currentUser || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const savedProgress = getStoredExamProgress(currentCourse.id);
    if (savedProgress && savedProgress.answers && Object.keys(savedProgress.answers).length > 0) {
      setAnswers(savedProgress.answers);
      answersRef.current = savedProgress.answers;

      if (savedProgress.flagged) {
        setFlagged(savedProgress.flagged);
        flaggedRef.current = savedProgress.flagged;
      }
      if (typeof savedProgress.currentIndex === 'number' && savedProgress.currentIndex >= 0) {
        setCurrentIndex(savedProgress.currentIndex);
        currentIndexRef.current = savedProgress.currentIndex;
      }
      if (savedProgress.startedAt) {
        setStartTime(savedProgress.startedAt);
        startTimeRef.current = savedProgress.startedAt;
      }

      const formattedSavedAt = savedProgress.lastSavedAt
        ? new Date(savedProgress.lastSavedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'ก่อนหน้านี้';

      setRestoredNotice({
        count: Object.keys(savedProgress.answers).length,
        savedAt: formattedSavedAt
      });

      setSaveStatus('saved');
      setLastSavedTime(formattedSavedAt);
      setSaveMessage(`กู้คืนความคืบหน้าที่บันทึกไว้แล้ว (${formattedSavedAt})`);
    }
  }, [currentCourse, currentUser, getStoredExamProgress]);

  // 2. Core Auto-Save execution callback
  const executeAutoSave = useCallback(async (isManual = false) => {
    if (examResult || !currentCourse || !currentUser) return;
    const currentAnswers = answersRef.current;
    const currentFlagged = flaggedRef.current;
    const curAnsweredCount = Object.keys(currentAnswers).length;

    // Skip periodic save if no answers yet and no manual action
    if (!isManual && curAnsweredCount === 0 && !isDirtyRef.current) {
      return;
    }

    if (isManual) setIsManualSaving(true);
    setSaveStatus('saving');

    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const progressPayload: StudentExamProgress = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentCode: currentUser.studentCode || currentUser.username,
      courseId: currentCourse.id,
      courseCode: currentCourse.code,
      courseTitle: currentCourse.title,
      department: currentUser.department,
      level: currentUser.level,
      answeredCount: curAnsweredCount,
      totalQuestions: totalTargetQuestions,
      answers: currentAnswers,
      flagged: currentFlagged,
      currentIndex: currentIndexRef.current,
      startedAt: startTimeRef.current,
      lastSavedAt: nowIso,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };

    try {
      const res = await autoSaveExamProgress(progressPayload);
      isDirtyRef.current = false;
      setLastSavedTime(nowTimeStr);

      if (res.syncedToSheet) {
        setSaveStatus('saved');
        setSaveMessage(`บันทึกลง Google Sheets และอุปกรณ์สำเร็จ (${nowTimeStr})`);
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSaveStatus('offline_cached');
        setSaveMessage(`โหมดออฟไลน์: บันทึกในเครื่องปลอดภัย (${nowTimeStr})`);
      } else {
        setSaveStatus('saved');
        setSaveMessage(`บันทึกในอุปกรณ์แล้ว (${nowTimeStr})`);
      }
    } catch (err) {
      console.error('Auto save error:', err);
      setSaveStatus('offline_cached');
      setSaveMessage('บันทึกในเครื่องเรียบร้อย (รอต่ออินเทอร์เน็ต)');
    } finally {
      if (isManual) {
        setTimeout(() => setIsManualSaving(false), 500);
      }
    }
  }, [examResult, currentCourse, currentUser, totalTargetQuestions, autoSaveExamProgress]);

  // 3. Network Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Immediately flush and push current progress to Google Sheets when connection resumes
      executeAutoSave(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus('offline_cached');
      setSaveMessage('เครือข่ายขัดข้อง: บันทึกในเครื่องแล้วอย่างปลอดภัย');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [executeAutoSave]);

  // 4. Periodic Auto-Save Timer (runs every 15 seconds)
  useEffect(() => {
    if (examResult) return;

    const intervalId = setInterval(() => {
      if (isDirtyRef.current || Object.keys(answersRef.current).length > 0) {
        executeAutoSave(false);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [examResult, executeAutoSave]);

  // 5. Debounced Auto-Save on Answer / Flag changes
  useEffect(() => {
    if (examResult) return;
    const curAnsweredCount = Object.keys(answers).length;
    if (curAnsweredCount === 0) return;

    isDirtyRef.current = true;
    const timeoutId = setTimeout(() => {
      executeAutoSave(false);
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [answers, flagged, executeAutoSave, examResult]);

  if (!currentCourse || !currentUser) return null;

  const handleSelectAnswer = (choice: ChoiceKey) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.questionNumber]: choice
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged(prev => ({
      ...prev,
      [currentQ.questionNumber]: !prev[currentQ.questionNumber]
    }));
  };

  const handleNext = () => {
    if (currentIndex < courseQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDirectJump = (index: number) => {
    if (index >= 0 && index < courseQuestions.length) {
      setCurrentIndex(index);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const result = await submitExam(currentCourse.id, answers, startTime);
      setExamResult(result);
      setRestoredNotice(null);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeExam = () => {
    clearStoredExamProgress(currentCourse.id);
    setAnswers({});
    setFlagged({});
    setCurrentIndex(0);
    setExamResult(null);
    setRestoredNotice(null);
    setSaveStatus('idle');
    setLastSavedTime('');
    const newStart = new Date().toISOString();
    setStartTime(newStart);
    startTimeRef.current = newStart;
    answersRef.current = {};
    flaggedRef.current = {};
    isDirtyRef.current = false;
  };

  const handleResetDraft = () => {
    if (confirm('คุณต้องการล้างคำตอบที่บันทึกไว้ และเริ่มทำข้อสอบใหม่ตั้งแต่ต้นหรือไม่?')) {
      handleRetakeExam();
    }
  };

  const handleExitClick = () => {
    const curAnswered = Object.keys(answers).length;
    if (curAnswered > 0 && !examResult) {
      // Force auto-save right before confirming exit
      executeAutoSave(true);
      setShowExitConfirmModal(true);
    } else {
      setCurrentView('courses');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* If Exam is Finished & Score is Displayed */}
      {examResult ? (
        <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          {/* Badge Icon */}
          <div className="flex justify-center">
            {examResult.passed ? (
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20">
                <Trophy className="w-12 h-12" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/20">
                <RotateCcw className="w-12 h-12" />
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              ผลการทดสอบออนไลน์ • {currentCourse.code}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {currentCourse.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ผู้เข้าสอบ: {currentUser.name} ({currentUser.studentCode || 'นักศึกษาภาคสมทบ'}) • สอบรอบที่ {examResult.attemptNumber}
            </p>
          </div>

          {/* Score Card Display */}
          <div className={`p-6 rounded-3xl border ${
            examResult.passed 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              คะแนนที่ได้รับ
            </div>
            <div className="text-5xl sm:text-6xl font-black my-2 flex items-baseline justify-center space-x-2">
              <span className={examResult.passed ? 'text-emerald-600' : 'text-amber-600'}>
                {examResult.score}
              </span>
              <span className="text-2xl sm:text-3xl font-medium text-slate-400">
                / {examResult.totalQuestions}
              </span>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm mt-1">
              {examResult.passed ? (
                <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ผ่านเกณฑ์การประเมิน (≥ 20 คะแนน)</span>
                </span>
              ) : (
                <span className="bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>ยังไม่ผ่านเกณฑ์ (ต้องได้ 20 คะแนนขึ้นไป)</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              คิดเป็น <strong>{Math.round((examResult.score / examResult.totalQuestions) * 100)}%</strong> • วันเวลาที่ส่งข้อสอบ: {examResult.submittedAt}
            </p>
          </div>

          {/* Academic Integrity Notice: No Answers Revealed */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start space-x-3 text-left">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">
                ข้อกำหนดของระบบห้องสอบออนไลน์ภาคสมทบ:
              </p>
              <p className="text-slate-600 leading-relaxed">
                ระบบแสดงคะแนนรวมและสถานะผ่าน/ไม่ผ่านทันที <strong className="text-slate-900">แต่จะไม่แสดงเฉลยข้อสอบ</strong> เพื่อรักษามาตรฐานความน่าเชื่อถือของคลังข้อสอบ 40 ข้อ หากต้องการพัฒนาคะแนน ท่านสามารถทบทวนบทเรียนและทำข้อสอบใหม่อีกครั้งได้ไม่จำกัดรอบ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-retake-exam"
              onClick={handleRetakeExam}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ทำข้อสอบใหม่อีกครั้ง (ไม่จำกัดรอบ)</span>
            </button>
            <button
              id="btn-view-history"
              onClick={() => setCurrentView('exam-history')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>ดูประวัติการสอบของฉัน</span>
            </button>
            <button
              id="btn-back-to-course-lessons"
              onClick={() => setCurrentView('lesson-view')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>กลับไปทบทวนบทเรียน</span>
            </button>
          </div>

        </div>
      ) : (
        /* Active Examination Room View */
        <div className="space-y-6">
          
          {/* Top Exam Status Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <button
                id="btn-exit-exam"
                onClick={handleExitClick}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="ออกจากห้องสอบ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {currentCourse.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    แบบทดสอบประเมินผลออนไลน์ ({totalTargetQuestions} ข้อ)
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {currentCourse.title}
                </h1>
              </div>
            </div>

            {/* Exam Rules & Auto-Save Status Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Auto-Save & Network Status Indicator */}
              <div 
                id="auto-save-status-pill"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                  !isOnline || saveStatus === 'offline_cached'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : saveStatus === 'saving'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 animate-pulse'
                    : saveStatus === 'saved'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title={saveMessage || 'ระบบบันทึกความคืบหน้าอัตโนมัติ'}
              >
                {!isOnline || saveStatus === 'offline_cached' ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="hidden sm:inline">โหมดออฟไลน์: บันทึกในเครื่องแล้ว</span>
                    <span className="sm:hidden">ออฟไลน์ (เซฟแล้ว)</span>
                  </>
                ) : saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden sm:inline">บันทึกอัตโนมัติแล้ว {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                    <span className="sm:hidden">บันทึกแล้ว {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>พร้อมบันทึกอัตโนมัติ</span>
                  </>
                )}
              </div>

              {/* Manual Save Now Button */}
              <button
                id="btn-manual-save"
                onClick={() => executeAutoSave(true)}
                disabled={isManualSaving || saveStatus === 'saving'}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-700 text-xs font-semibold transition-all flex items-center space-x-1.5 border border-slate-200"
                title="กดเพื่อบันทึกคำตอบลง Google Sheets และเบราว์เซอร์ทันที"
              >
                {isManualSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="hidden sm:inline">{isManualSaving ? 'กำลังบันทึก...' : 'บันทึกตอนนี้'}</span>
              </button>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>เกณฑ์ผ่าน: {passingThreshold} ข้อขึ้นไป</span>
              </div>
            </div>

          </div>

          {/* Offline Mode Warning Banner */}
          {!isOnline && (
            <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-900 flex items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold">สัญญาณอินเทอร์เน็ตขาดหาย (Offline Mode)</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    ไม่ต้องกังวล! ระบบทำงานในโหมดออฟไลน์ คำตอบทั้งหมดถูกบันทึกลงในเครื่องอย่างปลอดภัย และจะส่งต่อไปยัง Google Sheets ทันทีที่เชื่อมต่ออินเทอร์เน็ตได้
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Restored Progress Notice Banner */}
          {restoredNotice && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 sm:p-4 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-bold">กู้คืนความคืบหน้าการทำข้อสอบอัตโนมัติ</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    ระบบดึงคำตอบเดิมที่ตอบไว้ <strong>{restoredNotice.count}</strong> จาก {totalTargetQuestions} ข้อ (บันทึกล่าสุดเมื่อ {restoredNotice.savedAt}) ป้องกันข้อมูลสูญหายจากเครือข่ายขัดข้อง
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  id="btn-continue-restored"
                  onClick={() => setRestoredNotice(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  ทำข้อสอบต่อ
                </button>
                <button
                  id="btn-reset-restored"
                  onClick={handleResetDraft}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors"
                >
                  เริ่มใหม่ตั้งแต่ต้น
                </button>
              </div>
            </div>
          )}

          {/* Main Layout: Left Question Area + Right 1-40 Navigation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Main Question Card (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {currentQ ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Question Header & Flag toggle */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                        {currentQ.questionNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ข้อที่ {currentQ.questionNumber} จาก {totalTargetQuestions} ข้อ
                      </span>
                    </div>

                    <button
                      id="btn-flag-question"
                      onClick={handleToggleFlag}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                        flagged[currentQ.questionNumber]
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQ.questionNumber] ? 'fill-amber-600 text-amber-600' : ''}`} />
                      <span>{flagged[currentQ.questionNumber] ? 'ปักหมุดทบทวนแล้ว' : 'ปักหมุดไว้ทบทวน'}</span>
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ.questionText}
                  </div>

                  {/* 4 Choices (ก, ข, ค, ง) */}
                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'A' as ChoiceKey, label: 'ก', text: currentQ.optionA },
                      { key: 'B' as ChoiceKey, label: 'ข', text: currentQ.optionB },
                      { key: 'C' as ChoiceKey, label: 'ค', text: currentQ.optionC },
                      { key: 'D' as ChoiceKey, label: 'ง', text: currentQ.optionD },
                    ].map(choice => {
                      const isSelected = answers[currentQ.questionNumber] === choice.key;
                      return (
                        <button
                          key={choice.key}
                          id={`choice-${currentQ.questionNumber}-${choice.key}`}
                          onClick={() => handleSelectAnswer(choice.key)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start space-x-3.5 ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 text-blue-950 font-medium shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 shadow-sm'
                          }`}>
                            {choice.label}
                          </div>
                          <span className="flex-1 pt-0.5 leading-relaxed">
                            {choice.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Prev/Next */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      id="btn-prev-question"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ข้อก่อนหน้า</span>
                    </button>

                    <span className="text-xs text-slate-400 hidden sm:inline">
                      ข้อ {currentIndex + 1} / {totalTargetQuestions}
                    </span>

                    <button
                      id="btn-next-question"
                      onClick={handleNext}
                      disabled={currentIndex === courseQuestions.length - 1}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-1.5"
                    >
                      <span>ข้อถัดไป</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>กำลังโหลดข้อสอบ...</p>
                </div>
              )}
            </div>

            {/* Right Question Navigation Grid (1–40) (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                
                {/* Header & Stats */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>แถบนำทางข้อสอบ (1–40)</span>
                  </h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    ตอบแล้ว {answeredCount}/{totalTargetQuestions}
                  </span>
                </div>

                {/* Color Legend */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <span>ตอบแล้ว ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shrink-0" />
                    <span>ยังไม่ตอบ ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                    <span>ปักหมุดทบทวน</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                    <span>ข้อปัจจุบัน</span>
                  </div>
                </div>

                {/* 1-40 Buttons Matrix Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
                  {courseQuestions.map((q, idx) => {
                    const isAnswered = answers[q.questionNumber] !== undefined;
                    const isCurrent = idx === currentIndex;
                    const isFlagged = flagged[q.questionNumber];

                    let btnClass = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200';
                    if (isAnswered) {
                      btnClass = 'bg-emerald-500 text-white font-bold shadow-sm hover:bg-emerald-600';
                    }
                    if (isFlagged) {
                      btnClass = 'bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-sm';
                    }
                    if (isCurrent) {
                      btnClass += ' ring-2 ring-blue-600 ring-offset-2 scale-105 z-10';
                    }

                    return (
                      <button
                        key={q.id || idx}
                        id={`nav-q-btn-${q.questionNumber}`}
                        onClick={() => handleDirectJump(idx)}
                        className={`h-9 rounded-xl text-xs flex items-center justify-center font-medium transition-all ${btnClass}`}
                        title={`ข้อที่ ${q.questionNumber}`}
                      >
                        {q.questionNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Exam Button */}
                <button
                  id="btn-submit-exam"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งคำตอบเพื่อประเมินผล</span>
                </button>

              </div>

              {/* Tips Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 text-xs text-slate-500 leading-relaxed">
                💡 <strong>คำแนะนำ:</strong> สามารถกดที่ตัวเลข 1–40 เพื่อข้ามไปทำข้อที่ต้องการได้ทันที และเมื่อกดส่งข้อสอบแล้ว จะทราบผลคะแนนและสถานะผ่านทันที
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Submit Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                ยืนยันการส่งข้อสอบ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                รายวิชา {currentCourse.code} {currentCourse.title}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>ข้อสอบทั้งหมด:</span>
                <span className="font-bold">{totalTargetQuestions} ข้อ</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>ตอบแล้ว:</span>
                <span>{answeredCount} ข้อ</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>ยังไม่ได้ตอบ:</span>
                  <span>{unansweredCount} ข้อ</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span>เกณฑ์การสอบผ่าน:</span>
                <span className="font-bold text-blue-600">≥ {passingThreshold} คะแนน</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-[11px] text-amber-600 text-center font-medium">
                ⚠️ ท่านยังมีข้อสอบที่ยังไม่ได้ตอบ {unansweredCount} ข้อ ต้องการส่งคำตอบทันทีหรือไม่?
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="btn-cancel-submit"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                กลับไปทำต่อ
              </button>
              <button
                id="btn-confirm-submit"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{isSubmitting ? 'กำลังประเมินผล...' : 'ยืนยันส่งข้อสอบ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog Modal (Reassuring student that progress is preserved) */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                ออกจากห้องสอบชั่วคราว?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                รายวิชา {currentCourse.code} {currentCourse.title}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>คำตอบทั้งหมดถูกบันทึกอัตโนมัติแล้ว</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                คุณได้ตอบไปแล้ว <strong className="text-slate-900">{answeredCount}</strong> จาก {totalTargetQuestions} ข้อ ระบบได้ซิงค์ข้อมูลกับ Google Sheets และอุปกรณ์เรียบร้อยแล้ว คุณสามารถกลับเข้ามาทำต่อได้ทุกเมื่อโดยข้อมูลไม่สูญหาย
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="btn-stay-in-exam"
                onClick={() => setShowExitConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                ทำข้อสอบต่อ
              </button>
              <button
                id="btn-confirm-exit"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  setCurrentView('courses');
                }}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>ออกจากห้องสอบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
