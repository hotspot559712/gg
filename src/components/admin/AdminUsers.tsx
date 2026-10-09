import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Plus, Search, Filter, Edit3, 
  Trash2, ShieldCheck, UserCheck, GraduationCap, 
  CheckCircle2, AlertCircle, FileSpreadsheet, Download, Upload, ArrowDownToLine, Building2
} from 'lucide-react';
import { User, UserRole, Department, EducationLevel } from '../../types';
import { EDUCATION_LEVELS } from '../../data/initialData';
import { StudentExcelModal } from './StudentExcelModal';
import { exportStudentsToExcel } from '../../utils/excelUtils';

export const AdminUsers: React.FC = () => {
  const { users, departmentsList, addUser, importStudents, updateUser, deleteUser, currentUser, setCurrentView } = useApp();

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: 'password123',
    name: '',
    role: 'student' as UserRole,
    department: (departmentsList[0] || 'คอมพิวเตอร์ธุรกิจ') as Department,
    level: 'ปวส.1' as EducationLevel,
    studentCode: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (deptFilter !== 'all' && user.department !== deptFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = user.name.toLowerCase().includes(term);
      const matchUser = user.username.toLowerCase().includes(term);
      const matchCode = (user.studentCode || '').toLowerCase().includes(term);
      if (!matchName && !matchUser && !matchCode) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({
      username: `std${Math.floor(1000 + Math.random() * 9000)}`,
      password: 'password123',
      name: '',
      role: 'student',
      department: 'คอมพิวเตอร์ธุรกิจ',
      level: 'ปวส.1',
      studentCode: `6730${Math.floor(100000 + Math.random() * 900000)}`,
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      password: user.password || 'password123',
      name: user.name,
      role: user.role,
      department: (user.department === 'ส่วนกลาง' ? 'คอมพิวเตอร์ธุรกิจ' : user.department) as Department,
      level: user.level,
      studentCode: user.studentCode || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        username: formData.username,
        name: formData.name,
        role: formData.role,
        department: formData.role === 'admin' ? 'ส่วนกลาง' : formData.department,
        level: formData.role === 'student' ? formData.level : 'ทุกระดับ',
        studentCode: formData.role === 'student' ? formData.studentCode : undefined,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar
      });
    } else {
      addUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        department: formData.role === 'admin' ? 'ส่วนกลาง' : formData.department,
        level: formData.role === 'student' ? formData.level : 'ทุกระดับ',
        studentCode: formData.role === 'student' ? formData.studentCode : undefined,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (currentUser?.id === id) {
      alert('ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้');
      return;
    }
    if (window.confirm(`ยืนยันการลบผู้ใช้ "${name}" ออกจากระบบหรือไม่?`)) {
      deleteUser(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการข้อมูลผู้ใช้งานและสิทธิ์ (3 บทบาท)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ผู้ดูแลระบบ (Admin), ครูผู้สอน (Teacher), และนักศึกษาภาคสมทบ (Student ปวช./ปวส.)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            id="btn-manage-departments-shortcut"
            onClick={() => setCurrentView('admin-departments')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs sm:text-sm font-bold border border-indigo-200 transition-all flex items-center justify-center space-x-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>จัดการสาขาวิชา</span>
          </button>

          <button
            id="btn-excel-management"
            onClick={() => setShowExcelModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>นำเข้า / ส่งออก Excel</span>
          </button>

          <button
            id="btn-add-user"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งาน</span>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ชื่อผู้ใช้, หรือรหัสนักศึกษา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกบทบาท (Role)</option>
            <option value="student">🎓 นักศึกษา (Student)</option>
            <option value="teacher">👨‍🏫 ครูผู้สอน (Teacher)</option>
            <option value="admin">🛡️ ผู้ดูแลระบบ (Admin)</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกสาขาวิชา</option>
            {departmentsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">ผู้ใช้งาน</th>
                <th className="py-3.5 px-4 text-center">บทบาท (Role)</th>
                <th className="py-3.5 px-4 sm:px-6">สาขาวิชา</th>
                <th className="py-3.5 px-4 text-center">ระดับชั้น</th>
                <th className="py-3.5 px-4 sm:px-6">Username / รหัสนักศึกษา</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email || 'ไม่มีอีเมล'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {user.role === 'admin' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </span>
                    )}
                    {user.role === 'teacher' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Teacher</span>
                      </span>
                    )}
                    {user.role === 'student' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Student</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span className="font-semibold text-slate-800">{user.department}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                      {user.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-mono text-xs text-slate-900 font-semibold">{user.username}</div>
                    {user.studentCode && (
                      <div className="text-[11px] text-blue-600">รหัส: {user.studentCode}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 my-8 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{editingUserId ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">บทบาท (Role) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">🎓 นักศึกษา (Student)</option>
                  <option value="teacher">👨‍🏫 ครูผู้สอน (Teacher)</option>
                  <option value="admin">🛡️ ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมเกียรติ มั่นคง"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อผู้ใช้ (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น std6705"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">รหัสผ่าน</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              {formData.role !== 'admin' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">สาขาวิชา</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      {EDUCATION_LEVELS.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.role === 'student' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">รหัสนักศึกษา (Student Code)</label>
                  <input
                    type="text"
                    placeholder="เช่น 6730402010"
                    value={formData.studentCode}
                    onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              )}

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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import / Export Modal */}
      <StudentExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        users={users}
        onImportSuccess={({ addedCount, updatedCount }) => {
          setToastMessage(`นำเข้าข้อมูลนักศึกษาสำเร็จ: เพิ่มใหม่ ${addedCount} รายการ ${updatedCount > 0 ? `• อัปเดต ${updatedCount} รายการ` : ''}`);
          setTimeout(() => setToastMessage(null), 6000);
        }}
      />

    </div>
  );
};
