import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Plus, Edit3, Trash2, Search, 
  CheckCircle2, AlertTriangle, Users, BookOpen, 
  ShieldCheck, ArrowRight, Sparkles, Filter, X,
  GraduationCap, RefreshCw, Check, Layers, AlertCircle
} from 'lucide-react';
import { DepartmentItem } from '../../types';

const PRESET_COLORS = [
  { label: 'น้ำเงิน (Blue)', value: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  { label: 'เขียวมรกต (Emerald)', value: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  { label: 'ส้มอำพัน (Amber)', value: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { label: 'ชมพู (Pink)', value: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
  { label: 'ม่วง (Purple)', value: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  { label: 'ฟ้าคราม (Cyan)', value: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
  { label: 'แดง (Rose)', value: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  { label: 'เทาเข้ม (Slate)', value: '#64748b', bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50' },
  { label: 'คราม (Indigo)', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' }
];

export const AdminDepartments: React.FC = () => {
  const { 
    departments, 
    users, 
    courses, 
    examAttempts,
    addDepartment, 
    updateDepartment, 
    deleteDepartment, 
    toggleDepartmentStatus,
    setCurrentView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3b82f6',
    active: true,
    cascadeUpdate: true
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete safety modal state
  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null);
  const [reassignDeptName, setReassignDeptName] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '#3b82f6',
      active: true,
      cascadeUpdate: true
    });
    setFormError(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      color: dept.color || '#3b82f6',
      active: dept.active,
      cascadeUpdate: true
    });
    setFormError(null);
    setShowModal(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    if (!cleanName) {
      setFormError('กรุณากรอกชื่อสาขาวิชา');
      return;
    }

    // Check duplicate name
    const isDuplicate = departments.some(
      d => d.name.toLowerCase() === cleanName.toLowerCase() && d.id !== editingDept?.id
    );
    if (isDuplicate) {
      setFormError('มีสาขาวิชานี้อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    if (editingDept) {
      // Update
      const oldName = editingDept.name;
      updateDepartment(
        editingDept.id,
        {
          name: cleanName,
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
          color: formData.color,
          active: formData.active
        },
        oldName,
        formData.cascadeUpdate
      );
      showToast(`บันทึกการแก้ไขสาขาวิชา "${cleanName}" สำเร็จ`);
    } else {
      // Add
      addDepartment({
        name: cleanName,
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        color: formData.color,
        active: formData.active
      });
      showToast(`เพิ่มสาขาวิชา "${cleanName}" สำเร็จ`);
    }

    setShowModal(false);
  };

  // Open delete modal
  const handleOpenDeleteModal = (dept: DepartmentItem) => {
    const studentCount = users.filter(u => u.role === 'student' && u.department === dept.name).length;
    const courseCount = courses.filter(c => c.department === dept.name).length;
    
    setDeleteTarget(dept);
    // Find a fallback department
    const otherDepts = departments.filter(d => d.id !== dept.id && d.active);
    setReassignDeptName(otherDepts[0]?.name || '');
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteDepartment(deleteTarget.id, reassignDeptName);
    showToast(`ลบสาขาวิชา "${deleteTarget.name}" เรียบร้อยแล้ว`);
    setDeleteTarget(null);
  };

  // Calculate statistics for each department
  const getDeptStats = (deptName: string) => {
    const studentCount = users.filter(u => u.role === 'student' && u.department === deptName).length;
    const teacherCount = users.filter(u => (u.role === 'teacher' || u.role === 'admin') && u.department === deptName).length;
    const courseCount = courses.filter(c => c.department === deptName).length;
    const attempts = examAttempts.filter(a => a.department === deptName);
    const passCount = attempts.filter(a => a.passed).length;
    const passRate = attempts.length > 0 ? Math.round((passCount / attempts.length) * 100) : 0;

    return { studentCount, teacherCount, courseCount, totalAttempts: attempts.length, passRate };
  };

  // Filtered list
  const filteredDepartments = departments.filter(d => {
    if (statusFilter === 'active' && !d.active) return false;
    if (statusFilter === 'inactive' && d.active) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = d.name.toLowerCase().includes(term);
      const matchCode = d.code?.toLowerCase().includes(term);
      const matchDesc = d.description?.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const totalActiveDepts = departments.filter(d => d.active).length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalCourses = courses.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-blue-950">
              🏢 โครงสร้างสาขาวิชา (Departments)
            </span>
            <span className="text-xs text-blue-300">
              เปิดสอนทั้งหมด {totalActiveDepts} สาขา
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            จัดการสาขาวิชาและหลักสูตร
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            เพิ่ม แก้ไข และปรับปรุงรายชื่อสาขาวิชาในระบบ พร้อมอัปเดตข้อมูลนักเรียน ครู และรายวิชาที่เกี่ยวข้องโดยอัตโนมัติ
          </p>
        </div>

        <button
          id="btn-add-department"
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสาขาวิชาใหม่</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">สาขาวิชาทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {departments.length} <span className="text-xs font-normal text-slate-400">สาขา</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            เปิดสอน {totalActiveDepts} สาขา • ปิดชั่วคราว {departments.length - totalActiveDepts} สาขา
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">นักเรียนทุกสาขา</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalStudents} <span className="text-xs font-normal text-slate-400">คน</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            สังกัดอยู่ในสาขาวิชาต่างๆ
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">รายวิชาทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalCourses} <span className="text-xs font-normal text-slate-400">วิชา</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            จำแนกตามแต่ละสาขาวิชา
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-department"
            type="text"
            placeholder="ค้นหาชื่อสาขา, รหัสย่อ, หรือคำอธิบาย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">สถานะ:</span>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ทั้งหมด ({departments.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เปิดสอน ({totalActiveDepts})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === 'inactive' ? 'bg-slate-700 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ปิดชั่วคราว ({departments.length - totalActiveDepts})
            </button>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">ไม่พบข้อมูลสาขาวิชา</h3>
            <p className="text-xs text-slate-500">
              {searchTerm ? 'ลองเปลี่ยนคำค้นหา หรือล้างตัวกรอง' : 'ยังไม่มีสาขาวิชาในระบบ กดปุ่ม "เพิ่มสาขาวิชาใหม่" ด้านบน'}
            </p>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const stats = getDeptStats(dept.name);
            const colorPreset = PRESET_COLORS.find(c => c.value === dept.color) || PRESET_COLORS[0];

            return (
              <div 
                key={dept.id}
                className={`bg-white rounded-3xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden group ${
                  dept.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                {/* Card Header with Department Color Stripe */}
                <div>
                  <div className="h-2 w-full" style={{ backgroundColor: dept.color || '#3b82f6' }} />
                  
                  <div className="p-6 space-y-4">
                    {/* Top Row: Code Badge & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="px-2.5 py-1 rounded-xl text-xs font-black tracking-wider text-white shadow-sm"
                          style={{ backgroundColor: dept.color || '#3b82f6' }}
                        >
                          {dept.code || 'DEPT'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          dept.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {dept.active ? 'เปิดสอน' : 'ปิดชั่วคราว'}
                        </span>
                      </div>

                      {/* Quick Active Toggle */}
                      <button
                        onClick={() => toggleDepartmentStatus(dept.id)}
                        title={dept.active ? 'คลิกเพื่อปิดชั่วคราว' : 'คลิกเพื่อเปิดสอน'}
                        className={`text-xs px-2.5 py-1 rounded-xl border transition-colors ${
                          dept.active 
                            ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                            : 'border-slate-300 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dept.active ? 'สลับปิด' : 'สลับเปิด'}
                      </button>
                    </div>

                    {/* Department Name & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dept.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                      </p>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                        <div className="text-xs text-slate-400 font-medium">นักเรียน</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          {stats.studentCount}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                        <div className="text-xs text-slate-400 font-medium">ครูผู้สอน</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          {stats.teacherCount}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                        <div className="text-xs text-slate-400 font-medium">รายวิชา</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          {stats.courseCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`btn-edit-dept-${dept.id}`}
                    onClick={() => handleOpenEditModal(dept)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขสาขาวิชา</span>
                  </button>

                  <button
                    id={`btn-delete-dept-${dept.id}`}
                    onClick={() => handleOpenDeleteModal(dept)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 text-slate-400 shadow-sm transition-all"
                    title="ลบสาขาวิชา"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Add / Edit Department Modal */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingDept ? 'แก้ไขข้อมูลสาขาวิชา' : 'เพิ่มสาขาวิชาใหม่'}
                  </h2>
                  <p className="text-xs text-blue-200">
                    {editingDept ? `รหัสเดิม: ${editingDept.code || '-'} • ${editingDept.name}` : 'กำหนดชื่อ รหัสย่อ และสีประจำสาขาวิชา'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Department Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อสาขาวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-dept-name"
                  type="text"
                  required
                  placeholder="เช่น คอมพิวเตอร์ธุรกิจ, เทคโนโลยีสารสนเทศ, การบัญชี"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Department Code / Acronym */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสย่อ / ตัวย่อสาขา (Acronym)
                  </label>
                  <input
                    id="input-dept-code"
                    type="text"
                    placeholder="เช่น BC, IT, AC, AT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะการเปิดสอน
                  </label>
                  <select
                    id="select-dept-active"
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="true">เปิดสอน (Active)</option>
                    <option value="false">ปิดรับสมัคร/ปิดชั่วคราว (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Color Theme Preset Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สีประจำสาขาวิชา (Theme Color)
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: preset.value })}
                      className={`h-9 rounded-xl flex items-center justify-center transition-all ${preset.bg} ${
                        formData.color === preset.value ? 'ring-4 ring-offset-2 ring-slate-400 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      {formData.color === preset.value && (
                        <Check className="w-4 h-4 text-white font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบาย / รายละเอียดสาขาวิชา
                </label>
                <textarea
                  id="input-dept-desc"
                  rows={3}
                  placeholder="เช่น หลักสูตรการพัฒนาซอฟต์แวร์ ฐานข้อมูล และระบบเครือข่ายธุรกิจ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Cascade update notice for edit mode */}
              {editingDept && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>การอัปเดตข้อมูลอัตโนมัติ (Cascade Update)</span>
                  </div>
                  <label className="flex items-start space-x-2 text-xs text-blue-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cascadeUpdate}
                      onChange={(e) => setFormData({ ...formData, cascadeUpdate: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      หากเปลี่ยนชื่อสาขาวิชา ให้อัปเดตชื่อใหม่ในข้อมูลนักเรียน, ครู, รายวิชา และประวัติผลสอบเดิมที่มีอยู่ทั้งหมดโดยอัตโนมัติ
                    </span>
                  </label>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-submit-dept-modal"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingDept ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มสาขาวิชา'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Delete Safety / Migration Modal */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันการลบสาขาวิชา "{deleteTarget.name}"
              </h3>
              <p className="text-xs text-slate-500">
                การลบสาขาวิชาจะมีผลกระทบต่อข้อมูลนักเรียนและรายวิชาที่ผูกอยู่
              </p>
            </div>

            {/* Check impact */}
            {(() => {
              const impactStats = getDeptStats(deleteTarget.name);
              const hasImpact = impactStats.studentCount > 0 || impactStats.courseCount > 0;
              const otherDepts = departments.filter(d => d.id !== deleteTarget.id);

              return (
                <div className="space-y-3">
                  {hasImpact ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                      <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>พบข้อมูลที่ผูกกับสาขาวิชานี้:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
                        <li>นักเรียน: {impactStats.studentCount} คน</li>
                        <li>ครูผู้สอน: {impactStats.teacherCount} ท่าน</li>
                        <li>รายวิชา: {impactStats.courseCount} วิชา</li>
                      </ul>

                      {otherDepts.length > 0 && (
                        <div className="pt-2 border-t border-amber-200">
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">
                            ย้ายข้อมูลทั้งหมดข้างต้นไปยังสาขาวิชา:
                          </label>
                          <select
                            id="select-reassign-dept"
                            value={reassignDeptName}
                            onChange={(e) => setReassignDeptName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                          >
                            {otherDepts.map(d => (
                              <option key={d.id} value={d.name}>{d.name} ({d.code || 'DEPT'})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      ไม่มีนักเรียนหรือรายวิชาผูกกับสาขานี้ สามารถลบได้ทันที
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setDeleteTarget(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      id="btn-confirm-delete-dept"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all"
                    >
                      ยืนยันการลบ
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
