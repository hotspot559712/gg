import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Upload, Download, FileText, CheckCircle2, 
  AlertTriangle, X, RefreshCw, Filter, Users, ArrowDownToLine, Info, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, EducationLevel, Department } from '../../types';
import { EDUCATION_LEVELS } from '../../data/initialData';
import { 
  exportStudentsToExcel, 
  exportStudentsToCSV, 
  downloadStudentExcelTemplate, 
  parseStudentExcelFile, 
  ParsedStudentRow 
} from '../../utils/excelUtils';

interface StudentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onImportSuccess: (result: { addedCount: number; updatedCount: number }) => void;
}

export const StudentExcelModal: React.FC<StudentExcelModalProps> = ({
  isOpen,
  onClose,
  users,
  onImportSuccess
}) => {
  const { importStudents, departmentsList } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Import state
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<{
    rows: ParsedStudentRow[];
    validCount: number;
    invalidCount: number;
    existingCount: number;
  } | null>(null);
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ added: number; updated: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportDept, setExportDept] = useState<string>('all');
  const [exportLevel, setExportLevel] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  if (!isOpen) return null;

  const students = users.filter(u => u.role === 'student');

  const filteredExportStudents = students.filter(s => {
    if (exportDept !== 'all' && s.department !== exportDept) return false;
    if (exportLevel !== 'all' && s.level !== exportLevel) return false;
    return true;
  });

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setImportResult(null);

    try {
      const result = await parseStudentExcelFile(file, users);
      setParsedData(result);
    } catch (err: any) {
      setParseError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
      setParsedData(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        handleFileChange(file);
      } else {
        setParseError('กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) เท่านั้น');
      }
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.validCount === 0) return;

    const validRows = parsedData.rows.filter(r => r.isValid);
    const toImport = validRows.map(r => ({
      username: r.username,
      password: r.password || '1234',
      name: r.name,
      role: 'student' as const,
      department: r.department,
      level: r.level,
      studentCode: r.studentCode || r.username,
      email: r.email,
      phone: r.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }));

    const stats = importStudents(toImport, updateExisting);

    onImportSuccess({
      addedCount: stats.addedCount,
      updatedCount: stats.updatedCount
    });

    setImportResult({
      added: stats.addedCount,
      updated: stats.updatedCount
    });
  };

  const handleExecuteExport = () => {
    const filename = `รายชื่อนักศึกษา_${exportDept === 'all' ? 'ทุกสาขา' : exportDept}_${exportLevel === 'all' ? 'ทุกระดับ' : exportLevel}`;
    if (exportFormat === 'xlsx') {
      exportStudentsToExcel(filteredExportStudents, `${filename}.xlsx`);
    } else {
      exportStudentsToCSV(filteredExportStudents, `${filename}.csv`);
    }
  };

  const handleResetImport = () => {
    setSelectedFile(null);
    setParsedData(null);
    setParseError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-in zoom-in-95 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                นำเข้าและส่งออกรายชื่อนักเรียน (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-500">
                จัดการข้อมูลนักศึกษาภาคสมทบ ปวช./ปวส. ในรูปแบบไฟล์สเปรดชีต
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl space-x-1.5 font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'import'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>นำเข้ารายชื่อ (Excel Import)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'export'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>ส่งออกรายชื่อ (Excel Export)</span>
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-5">
            {/* Template Download Alert */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">
                    ดาวน์โหลดแบบฟอร์มแม่แบบ (Excel Template)
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    มีหัวตารางภาษาไทยและตัวอย่างข้อมูลนักศึกษาครบถ้วน สามารถกรอกแล้วนำเข้าได้ทันที
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadStudentExcelTemplate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-sm flex items-center space-x-1.5 shrink-0"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด Template (.xlsx)</span>
              </button>
            </div>

            {/* Success message */}
            {importResult && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900">นำเข้าข้อมูลสำเร็จเรียบร้อย!</div>
                    <div className="text-emerald-700 text-[11px]">
                      เพิ่มใหม่ {importResult.added} คน {importResult.updated > 0 && `• อัปเดตข้อมูลเดิม ${importResult.updated} คน`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetImport}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-semibold hover:bg-emerald-100"
                >
                  นำเข้าไฟล์อื่นเพิ่ม
                </button>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            {!parsedData && !importResult && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm sm:text-base">
                    คลิกเพื่อเลือกไฟล์ Excel หรือลากไฟล์มาวางที่นี่
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 max-w-sm">
                    รองรับไฟล์ <span className="font-semibold text-slate-700">.xlsx, .xls, .csv</span> (ระบบจะจับคู่คอลัมน์ชื่อ, รหัสนักศึกษา, สาขาวิชา, ระดับชั้น ให้อัตโนมัติ)
                  </div>
                </label>
              </div>
            )}

            {/* Error Display */}
            {parseError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">เกิดข้อผิดพลาดในการประมวลผลไฟล์</div>
                  <div className="text-[11px] mt-0.5">{parseError}</div>
                </div>
              </div>
            )}

            {/* Parsed Data Preview Table */}
            {parsedData && !importResult && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-xs">{selectedFile?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        ทั้งหมด {parsedData.rows.length} รายการ (ถูกต้อง {parsedData.validCount} รายการ, มีข้อผิดพลาด {parsedData.invalidCount} รายการ)
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetImport}
                    className="text-slate-500 hover:text-red-600 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>เปลี่ยนไฟล์</span>
                  </button>
                </div>

                {/* Settings checkbox */}
                <div className="flex items-center space-x-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="update-existing-checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="update-existing-checkbox" className="font-medium cursor-pointer">
                    อัปเดตข้อมูลนักศึกษาเดิมหากพบรหัสนักศึกษาหรือชื่อผู้ใช้ซ้ำ (พบ {parsedData.existingCount} รายชื่อที่มีอยู่แล้ว)
                  </label>
                </div>

                {/* Table Preview */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 text-center">สถานะ</th>
                        <th className="py-2.5 px-3">รหัสนักศึกษา</th>
                        <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                        <th className="py-2.5 px-3">ชื่อผู้ใช้</th>
                        <th className="py-2.5 px-3">ระดับชั้น</th>
                        <th className="py-2.5 px-3">สาขาวิชา</th>
                        <th className="py-2.5 px-3">เบอร์โทร</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parsedData.rows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? (row.isExisting ? 'bg-amber-50/30' : '') : 'bg-red-50/50'}>
                          <td className="py-2 px-3 text-center">
                            {row.isValid ? (
                              row.isExisting ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  มีอยู่เดิม
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  ใหม่
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800" title={row.errors.join(', ')}>
                                ข้อมูลไม่ครบ
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold">{row.studentCode || '-'}</td>
                          <td className="py-2 px-3 font-medium">{row.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{row.username}</td>
                          <td className="py-2 px-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">{row.level}</span>
                          </td>
                          <td className="py-2 px-3">{row.department}</td>
                          <td className="py-2 px-3 text-slate-500">{row.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import Confirmation Button */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetImport}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={parsedData.validCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>ยืนยันนำเข้าข้อมูล ({parsedData.validCount} รายชื่อ)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-900">
                  ส่งออกรายชื่อนักศึกษา (Export to Excel)
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  ดาวน์โหลดรายชื่อนักศึกษาทั้งหมด พร้อมรหัสนักศึกษา, สาขาวิชา, ระดับชั้น และข้อมูลติดต่อ สามารถนำไปเปิดใช้งานใน Microsoft Excel หรือ Google Sheets ได้ทันที
                </div>
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  เลือกสาขาวิชาที่ต้องการส่งออก
                </label>
                <select
                  value={exportDept}
                  onChange={(e) => setExportDept(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทุกสาขาวิชา (ทั้งหมด {students.length} คน)</option>
                  {departmentsList.map(d => {
                    const count = students.filter(s => s.department === d).length;
                    return (
                      <option key={d} value={d}>
                        {d} ({count} คน)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  เลือกระดับชั้น
                </label>
                <select
                  value={exportLevel}
                  onChange={(e) => setExportLevel(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทุกระดับชั้น</option>
                  {EDUCATION_LEVELS.map(lvl => {
                    const count = students.filter(s => s.level === lvl).length;
                    return (
                      <option key={lvl} value={lvl}>
                        {lvl} ({count} คน)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                รูปแบบไฟล์ (File Format)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    exportFormat === 'xlsx'
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value="xlsx"
                    checked={exportFormat === 'xlsx'}
                    onChange={() => setExportFormat('xlsx')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Microsoft Excel (.xlsx)</div>
                    <div className="text-[11px] text-slate-500">รูปแบบมาตรฐาน เปิดได้ทั้ง Excel และ Numbers</div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900">CSV UTF-8 (.csv)</div>
                    <div className="text-[11px] text-slate-500">รองรับภาษาไทยสำหรับฐานข้อมูลและสเปรดชีต</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Export Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">
                  จำนวนข้อมูลที่จะส่งออก: <span className="text-blue-600 font-extrabold text-sm">{filteredExportStudents.length}</span> รายชื่อ
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  สาขาวิชา: {exportDept === 'all' ? 'ทุกสาขา' : exportDept} • ระดับชั้น: {exportLevel === 'all' ? 'ทุกระดับ' : exportLevel}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={filteredExportStudents.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ ({filteredExportStudents.length} รายชื่อ)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
