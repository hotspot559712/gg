import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Plus, CheckCircle2, XCircle, 
  Power, Clock, AlertCircle, Sparkles
} from 'lucide-react';
import { Semester } from '../../types';

export const AdminSemesters: React.FC = () => {
  const { semesters, toggleSemesterStatus, addSemester } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '2/2567',
    academicYear: '2567',
    term: '2',
    isOpen: false,
    startDate: '2024-11-01',
    endDate: '2025-03-31'
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addSemester({
      name: formData.name,
      academicYear: formData.academicYear,
      term: formData.term,
      isOpen: formData.isOpen,
      startDate: formData.startDate,
      endDate: formData.endDate
    });

    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการภาคเรียน (เปิด/ปิด ระบบการเรียนและการสอบ)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดสถานะภาคเรียนเปิดทำการเรียนการสอนเพื่อควบคุมสิทธิ์การเข้าทำข้อสอบและบันทึกคะแนน
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มภาคเรียนใหม่</span>
        </button>
      </div>

      {/* Semesters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.map((sem) => (
          <div
            key={sem.id}
            id={`semester-card-${sem.id}`}
            className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col justify-between space-y-5 transition-all ${
              sem.isOpen 
                ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-emerald-500/5' 
                : 'border-slate-200 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  ปีการศึกษา {sem.academicYear}
                </span>
                {sem.isOpen ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>กำลังเปิดใช้งาน (Active)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ปิดภาคเรียนแล้ว</span>
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                ภาคเรียนที่ {sem.name}
              </h3>
              
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>เริ่ม: {sem.startDate || '-'} ถึง {sem.endDate || '-'}</span>
                </div>
              </div>
            </div>

            {/* Toggle Status Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => toggleSemesterStatus(sem.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  sem.isOpen
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{sem.isOpen ? 'คลิกเพื่อปิดภาคเรียนนี้' : 'คลิกเพื่อเปิดใช้งานภาคเรียนนี้'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Semester Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>เพิ่มภาคเรียนใหม่</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อภาคเรียน (เช่น 2/2567) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 2/2567"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เทอม (1 หรือ 2)</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">วันเริ่มต้น</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">วันสิ้นสุด</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-is-open"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="chk-is-open" className="text-slate-700 font-medium cursor-pointer">
                  เปิดให้ใช้งานภาคเรียนนี้ทันที
                </label>
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-500/20"
                >
                  บันทึกภาคเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
