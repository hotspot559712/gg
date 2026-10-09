import React, { useState } from 'react';
import { 
  Database, Copy, Check, ExternalLink, Sparkles, 
  Code, FileSpreadsheet, Layers, ShieldCheck, 
  HelpCircle, BookOpen, Terminal, CheckCircle2,
  RefreshCw, AlertCircle, Link, Cloud, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, INDEX_HTML_TEMPLATE } from '../../services/googleSheets';

export const GoogleSheetsSettings: React.FC = () => {
  const { 
    googleSheetConfig, 
    updateGoogleSheetConfig, 
    testConnection, 
    syncToGoogleSheets, 
    isSyncing 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [inputUrl, setInputUrl] = useState(googleSheetConfig.webAppUrl || '');

  const handleCopyGs = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(INDEX_HTML_TEMPLATE);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleSaveUrl = () => {
    updateGoogleSheetConfig({
      webAppUrl: inputUrl.trim(),
      status: inputUrl.trim() ? 'disconnected' : 'disconnected'
    });
    setTestResult({ message: 'บันทึก URL เว็บแอปเรียบร้อยแล้ว กด "ทดสอบการเชื่อมต่อ" เพื่อตรวจสอบ' });
  };

  const handleTestConnect = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: 'กรุณากรอก URL Web App ก่อนทดสอบ' });
      return;
    }
    updateGoogleSheetConfig({ webAppUrl: inputUrl.trim() });
    const res = await testConnection();
    setTestResult(res);
  };

  const handleSyncAll = async () => {
    const success = await syncToGoogleSheets();
    setTestResult({
      success,
      message: success ? 'ซิงค์ข้อมูลทั้งหมดไปยัง Google Sheets สำเร็จสมบูรณ์' : 'การซิงค์ข้อมูลล้มเหลว กรุณาตรวจสอบสิทธิ์ของ Web App'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
              Apps Script + Google Sheets
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            โครงสร้างและโค้ดระบบ Google Apps Script (100% ฟรี)
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            รันระบบการเรียนการสอน, Auto-save ความคืบหน้าการสอบ และประเมินผลออนไลน์ผ่าน Google Sheets และ Google Apps Script โดยตรง ไม่มีค่าใช้จ่ายรายเดือน
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
          >
            <span>สร้าง Google Sheet ใหม่</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Web App Connection & Live Auto-Save Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ตั้งค่าการเชื่อมต่อ Google Apps Script Web App
              </h2>
              <p className="text-xs text-slate-500">
                URL สำหรับส่งผลสอบและ Auto-save คำตอบของนักศึกษาแบบ Real-time
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              googleSheetConfig.status === 'connected'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : googleSheetConfig.webAppUrl
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                googleSheetConfig.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <span>
                {googleSheetConfig.status === 'connected'
                  ? 'เชื่อมต่อแล้ว (Connected)'
                  : googleSheetConfig.webAppUrl
                  ? 'รอการทดสอบ (Ready)'
                  : 'ยังไม่ได้เชื่อมต่อ (Local Mode)'}
              </span>
            </span>
          </div>
        </div>

        {/* Input Web App URL */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Google Apps Script Web App URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleSaveUrl}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all"
            >
              บันทึก URL
            </button>
            <button
              onClick={handleTestConnect}
              disabled={isSyncing}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>ทดสอบเชื่อมต่อ</span>
            </button>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing || !inputUrl.trim()}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Cloud className="w-4 h-4" />
              <span>ซิงค์ข้อมูลทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {testResult && (
          <div className={`p-4 rounded-2xl text-xs flex items-start space-x-3 ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.message}</p>
              {googleSheetConfig.lastSyncTime && (
                <p className="text-[11px] text-slate-500 mt-1">
                  เวลาที่ซิงค์สำเร็จล่าสุด: {googleSheetConfig.lastSyncTime}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4-Step Setup Guide Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>ขั้นตอนการนำโค้ดไปติดตั้งใช้งาน (Google Sheets + Apps Script)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-sm">สร้าง Google Sheet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เปิดตารางเปล่าที่ <span className="font-mono text-blue-600">sheets.new</span> ตั้งชื่อตามรายวิชาหรือระบบ E-learning ของวิทยาลัย
              </p>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold">ขั้นตอนเริ่มต้น →</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-2xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">เปิด Apps Script</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คลิกเมนูด้านบน <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong> เพื่อเปิดหน้าเขียนสคริปต์
              </p>
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold">สร้างไฟล์สคริปต์ →</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-sm">วางโค้ด Code.gs &amp; index</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คัดลอกโค้ด <code className="bg-slate-100 px-1 py-0.5 rounded">Code.gs</code> และสร้างไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded">index.html</code> วางลงในโปรเจกต์
              </p>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold">คัดลอกไฟล์จากด้านล่าง →</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Deploy Web App</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                กดปุ่ม <strong>Deploy &gt; New deployment &gt; Web app</strong> เลือก Who has access: <strong>Anyone</strong> เพื่อเริ่มใช้งานทันที
              </p>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">พร้อมให้บริการนักศึกษา ✅</div>
          </div>
        </div>
      </div>

      {/* Sheets Structure Schema Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>โครงสร้างตารางชีตที่จะถูกสร้างอัตโนมัติ (เมื่อรัน setupSheets)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>1. แผ่นงาน Users (ผู้ใช้งาน)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              เก็บรายชื่อนักเรียน (ปวช./ปวส.), ครูผู้สอน, ผู้ดูแลระบบ, รหัสผ่าน และสาขาวิชา
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>2. แผ่นงาน Courses &amp; Lessons</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              เก็บข้อมูลรายวิชา, คำอธิบายหลักสูตร, เนื้อหาบทเรียน และลิงก์เอกสาร Google Drive PDF
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>3. แผ่นงาน Questions (คลัง 40 ข้อ)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              เก็บข้อสอบ 40 ข้อต่อวิชา, ตัวเลือก ก ข ค ง, เฉลยที่ถูกต้อง และคำอธิบายเฉลย
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>4. แผ่นงาน ExamResults (ผลการสอบ)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              บันทึกคะแนนสอบนักศึกษาแบบ Realtime, สถานะผ่าน/ไม่ผ่าน (เกณฑ์ 20/40) และเวลาส่งข้อสอบ
            </p>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5. แผ่นงาน ExamProgress (Auto-Save ระหว่างสอบ)</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              บันทึกความคืบหน้านักศึกษาเป็นระยะแบบ Realtime ป้องกันข้อมูลสูญหายเมื่อเน็ตหลุดหรือเครื่องดับ
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>6. แผ่นงาน Semesters (ภาคเรียน)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              กำหนดภาคการศึกษาที่เปิดสอน เช่น 1/2567, 2/2567 และสถานะการเปิดรับประเมิน
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>7. ปลอดภัยด้วย Google Auth</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              จัดการสิทธิ์ข้อมูลบน Google Drive ป้องกันข้อมูลสูญหายและสำรองข้อมูลอัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Script Source Code Box with Tab Switcher & 1-Click Copy */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        
        {/* Tab Headers */}
        <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('codegs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'codegs'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>ไฟล์ Code.gs (สคริปต์เซิร์ฟเวอร์ &amp; ฐานข้อมูล)</span>
            </button>

            <button
              onClick={() => setActiveTab('indexhtml')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'indexhtml'
                  ? 'bg-blue-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>ไฟล์ index.html (หน้าเว็บระบบ E-learning)</span>
            </button>
          </div>

          <div>
            {activeTab === 'codegs' ? (
              <button
                onClick={handleCopyGs}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                {copiedGs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedGs ? 'คัดลอก Code.gs แล้ว!' : 'คัดลอกโค้ด Code.gs'}</span>
              </button>
            ) : (
              <button
                onClick={handleCopyHtml}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                {copiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtml ? 'คัดลอก index.html แล้ว!' : 'คัดลอกโค้ด index.html'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content Container */}
        <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
          <pre>{activeTab === 'codegs' ? GOOGLE_APPS_SCRIPT_TEMPLATE : INDEX_HTML_TEMPLATE}</pre>
        </div>
      </div>

    </div>
  );
};
