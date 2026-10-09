import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, ShieldCheck, UserCheck, 
  Lock, User as UserIcon, ArrowRight, 
  BookOpen, CheckCircle2, AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(username.trim(), password.trim());
    if (!success) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/5">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        
        {/* Left: Branding & Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 text-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                ระบบการเรียนการสอนภาคสมทบ
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
                E-Learning &amp; Online Examination System
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                ระบบจัดการเรียนรู้และห้องสอบออนไลน์ 40 ข้อ (ปวช./ปวส.) พร้อมฐานข้อมูล Google Sheets 100% ฟรี
              </p>
            </div>
          </div>

          {/* Features Highlights */}
          <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3 บทบาท: Admin, ครูผู้สอน, นักเรียน</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ระบบห้องสอบ 40 ข้อ ไม่จำกัดรอบ</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>บทเรียน PDF เชื่อมต่อ Google Drive</span>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              เข้าสู่ระบบ (Sign In)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              กรุณากรอกชื่อผู้ใช้ (Username / รหัสนักศึกษา) และรหัสผ่านเพื่อเข้าสู่ระบบ
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                ชื่อผู้ใช้ (Username) / รหัสนักศึกษา
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="เช่น admin, teacher1 หรือ รหัสนักศึกษา"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-[11px] text-slate-400">
            ติดต่อผู้ดูแลระบบหากลืมรหัสผ่านหรือต้องการเพิ่มบัญชีผู้ใช้งาน
          </div>
        </div>

      </div>
    </div>
  );
};
