import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Trophy, CheckCircle2, AlertCircle, 
  Download, Search, Filter, BarChart2, PieChart, 
  Layers, Users, ArrowUpRight, FileSpreadsheet, LayoutDashboard
} from 'lucide-react';
import { EDUCATION_LEVELS } from '../../data/initialData';
import { Department5CourseReportView } from './Department5CourseReportView';

export const AdminReports: React.FC = () => {
  const { examAttempts, courses, users, departmentsList } = useApp();

  const [activeTab, setActiveTab] = useState<'5-course-report' | 'overview'>('5-course-report');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAttempts = examAttempts.filter(att => {
    if (deptFilter !== 'all' && att.department !== deptFilter) return false;
    if (levelFilter !== 'all' && att.level !== levelFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = att.studentName.toLowerCase().includes(term);
      const matchCode = att.studentCode.toLowerCase().includes(term);
      const matchCourse = att.courseTitle.toLowerCase().includes(term) || att.courseCode.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchCourse) return false;
    }
    return true;
  });

  const totalAttempts = filteredAttempts.length;
  const passedAttempts = filteredAttempts.filter(a => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore = totalAttempts > 0 
    ? (filteredAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts).toFixed(1) 
    : '0';

  // Breakdown by Department
  const deptBreakdown = departmentsList.map(dept => {
    const attempts = examAttempts.filter(a => a.department === dept);
    const passed = attempts.filter(a => a.passed).length;
    const rate = attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0;
    return { dept, total: attempts.length, passed, rate };
  });

  // Breakdown by Education Level
  const levelBreakdown = EDUCATION_LEVELS.map(lvl => {
    const attempts = examAttempts.filter(a => a.level === lvl);
    const passed = attempts.filter(a => a.passed).length;
    const rate = attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0;
    return { lvl, total: attempts.length, passed, rate };
  });

  const handleExportCSV = () => {
    const headers = [
      'ลำดับ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'สาขาวิชา', 
      'ระดับชั้น', 'รหัสวิชา', 'ชื่อวิชา', 'รอบที่', 
      'คะแนน (เต็ม 40)', 'สถานะประเมิน', 'วันเวลาที่ส่ง'
    ];

    const rows = filteredAttempts.map((att, idx) => [
      idx + 1,
      `"${att.studentCode}"`,
      `"${att.studentName}"`,
      `"${att.department}"`,
      `"${att.level}"`,
      `"${att.courseCode}"`,
      `"${att.courseTitle}"`,
      att.attemptNumber,
      att.score,
      att.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
      `"${att.submittedAt}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานสรุปผลการสอบทั้งสถาบัน_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              รายงานผลการสอบและการประเมินผลการเรียน
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ออกรายงานผลการสอบ 5 รายวิชารายบุคคลประจำสาขาวิชา และสถิติภาพรวมระดับสถาบัน
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto border border-slate-300/60">
          <button
            onClick={() => setActiveTab('5-course-report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === '5-course-report'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>รายงาน 5 วิชา (รายบุคคล/สาขา)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>สถิติภาพรวมสถาบัน</span>
          </button>
        </div>
      </div>

      {/* Mode 1: 5-Course Individual Report by Department */}
      {activeTab === '5-course-report' && (
        <Department5CourseReportView />
      )}

      {/* Mode 2: Institution Overview Statistics & CSV Log */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="flex justify-end">
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกรายงานรวมทุกรอบสอบ (CSV)</span>
            </button>
          </div>

          {/* KPI Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-xs text-slate-400 font-medium">รอบการสอบทั้งหมด</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalAttempts} <span className="text-xs font-normal text-slate-400">รอบ</span></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-xs text-slate-400 font-medium">สอบผ่านเกณฑ์ (≥20 ข้อ)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{passedAttempts} <span className="text-xs font-normal text-slate-400">รอบ</span></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-xs text-slate-400 font-medium">อัตราการสอบผ่านเฉลี่ย</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{passRate}%</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-xs text-slate-400 font-medium">คะแนนเฉลี่ยทั้งระบบ</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{avgScore} <span className="text-xs font-normal text-slate-400">/ 40</span></div>
            </div>
          </div>

          {/* Breakdown Section: By Department & By Level */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dept Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>สถิติการสอบแยกตามสาขาวิชา</span>
              </h3>

              <div className="space-y-3">
                {deptBreakdown.map(item => (
                  <div key={item.dept} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>สาขา{item.dept}</span>
                      <span>{item.passed}/{item.total} ครั้ง ({item.rate}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>สถิติการสอบแยกตามระดับชั้น (ปวช. / ปวส.)</span>
              </h3>

              <div className="space-y-3">
                {levelBreakdown.map(item => (
                  <div key={item.lvl} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>ระดับชั้น {item.lvl}</span>
                      <span>{item.passed}/{item.total} ครั้ง ({item.rate}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Attempts Full Table with Filters */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัสนักศึกษา, วิชา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">ทุกสาขาวิชา</option>
                  {departmentsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">ทุกระดับชั้น</option>
                  {EDUCATION_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">นักศึกษา</th>
                      <th className="py-3.5 px-4">สาขา/ระดับชั้น</th>
                      <th className="py-3.5 px-4 sm:px-6">รายวิชา</th>
                      <th className="py-3.5 px-4 text-center">รอบที่</th>
                      <th className="py-3.5 px-4 text-center">คะแนน</th>
                      <th className="py-3.5 px-4 text-center">สถานะ</th>
                      <th className="py-3.5 px-4 sm:px-6">วันและเวลาที่ส่ง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900">{attempt.studentName}</div>
                          <div className="text-xs text-blue-600 font-mono">รหัส: {attempt.studentCode}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">{attempt.department}</div>
                          <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {attempt.level}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-semibold text-slate-900">{attempt.courseCode}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{attempt.courseTitle}</div>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">
                          #{attempt.attemptNumber}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-base font-black ${attempt.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {attempt.score}
                          </span>
                          <span className="text-xs text-slate-400">/{attempt.totalQuestions}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {attempt.passed ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ผ่าน</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <AlertCircle className="w-3 h-3" />
                              <span>ไม่ผ่าน</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-xs text-slate-500 whitespace-nowrap">
                          {attempt.submittedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

