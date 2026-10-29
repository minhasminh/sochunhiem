import React, { useState } from 'react';
import {
  Shield,
  School,
  Database,
  Calendar,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Download,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Plus,
  Sliders,
  Settings,
  Lock,
  Unlock,
  GraduationCap,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const {
    school,
    schoolYears,
    currentSchoolYear,
    selectSchoolYear,
    toggleLockSchoolYear,
    classes,
    currentClass,
    selectClass,
    students,
    teachers,
    departments,
    users,
    currentUser,
    setActiveMenu,
    auditLogs,
    backups,
    createBackup,
    deleteDemoData,
    restoreDemoData,
    runDataIntegrityCheck,
    switchUserRole,
  } = useApp();

  const [backupNote, setBackupNote] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleQuickBackup = () => {
    try {
      createBackup(backupNote || 'Sao lưu nhanh từ Dashboard Quản trị viên');
      setBackupNote('');
      showMsg('Đã tạo bản sao lưu dữ liệu JSON và tải về máy thành công!');
    } catch (err: any) {
      showMsg('Không thể tạo bản sao lưu: ' + err.message, 'error');
    }
  };

  const activeClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);
  const totalStudentsInCurrentYear = students.filter((s) => s.schoolYearId === currentSchoolYear.id).length;
  const demoClassesCount = classes.filter((c) => c.isDemo).length;

  return (
    <div className="space-y-6">
      {/* Admin Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Shield className="w-3.5 h-3.5 text-purple-300" /> BẢNG ĐIỀU HÀNH QUẢN TRỊ VIÊN HỆ THỐNG
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md font-semibold text-purple-100">
              {school.name}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {currentSchoolYear.name} ({currentSchoolYear.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản trị Hạ tầng & Dữ liệu Trường học
          </h1>
          <p className="text-purple-200/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Xin chào <strong>{currentUser?.name}</strong>. Bạn đang đăng nhập với quyền <strong>ADMIN (Toàn quyền)</strong>. Tại đây bạn quản lý niên khóa, tạo lập danh mục lớp, phân công GVCN, sao lưu an toàn CSDL và kiểm soát nhật ký hệ thống.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveMenu('teachers')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" /> Hồ sơ GV toàn trường
            </button>
            <button
              onClick={() => setActiveMenu('teachers')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/30 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" /> Cấp tài khoản & MK ({users.length}/{teachers.length})
            </button>
            <button
              onClick={() => setActiveMenu('departments')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Layers className="w-4 h-4" /> Quản lý Tổ chuyên môn
            </button>
            <button
              onClick={() => setActiveMenu('class-info')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <School className="w-4 h-4" /> Quản lý Niên khóa & Lớp học
            </button>
            <button
              onClick={() => setActiveMenu('settings')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Settings className="w-4 h-4" /> Cài đặt & Sao lưu CSDL
            </button>
            <button
              onClick={() => setActiveMenu('system-testing')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" /> Kiểm tra toàn vẹn CSDL
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => setActiveMenu('teachers')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Giáo viên trường</div>
            <div className="text-xl font-black text-slate-900">{teachers.length} CB/GV</div>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">Hồ sơ GV →</div>
          </div>
        </div>

        <div
          onClick={() => setActiveMenu('departments')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Tổ chuyên môn</div>
            <div className="text-xl font-black text-slate-900">{departments.length} tổ</div>
            <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Quản lý tổ CM →</div>
          </div>
        </div>

        <div
          onClick={() => setActiveMenu('class-info')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Lớp ({currentSchoolYear.code})</div>
            <div className="text-xl font-black text-slate-900">{activeClasses.length} lớp</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Danh mục lớp học</div>
          </div>
        </div>

        <div
          onClick={() => setActiveMenu('students')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Học sinh trường</div>
            <div className="text-xl font-black text-slate-900">{totalStudentsInCurrentYear} HS</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Đã đồng bộ hồ sơ</div>
          </div>
        </div>

        <div
          onClick={() => setActiveMenu('settings')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Bản sao lưu CSDL</div>
            <div className="text-xl font-black text-slate-900">{backups.length} bản</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Sẵn sàng khôi phục</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Nhật ký hệ thống</div>
            <div className="text-xl font-black text-slate-900">{auditLogs.length} logs</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kiểm toán bảo mật</div>
          </div>
        </div>
      </div>

      {/* Main Administrative Control Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: School Classes Master Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-purple-600" />
                Danh mục Lớp học & Giáo viên chủ nhiệm
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các lớp thuộc niên khóa {currentSchoolYear.name}
              </p>
            </div>
            <button
              onClick={() => setActiveMenu('class-info')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm / Sửa lớp
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-xl">Lớp</th>
                  <th className="py-2.5 px-3">Khối</th>
                  <th className="py-2.5 px-3">GVCN được phân công</th>
                  <th className="py-2.5 px-3">Sĩ số</th>
                  <th className="py-2.5 px-3">Phòng học</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeClasses.map((cls) => {
                  const isCurrent = currentClass?.id === cls.id;
                  const clsStudents = students.filter((s) => s.classId === cls.id);

                  return (
                    <tr
                      key={cls.id}
                      className={`hover:bg-purple-50/40 transition-colors ${
                        isCurrent ? 'bg-purple-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-black text-purple-900 text-sm">{cls.className}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">Khối {cls.grade}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {cls.homeroomTeacherName || 'Chưa gán GV'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {clsStudents.length} HS
                      </td>
                      <td className="py-3 px-3 text-slate-600">{cls.roomNumber || 'P.N/A'}</td>
                      <td className="py-3 px-3">
                        {cls.isDemo ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Dữ liệu Demo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Chính thức
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            selectClass(cls.id);
                            setActiveMenu('class-info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Quản lý
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Demo Data Actions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Database className="w-4 h-4 text-purple-600" />
              <span>
                Trạng thái Dữ liệu mẫu (Demo): Có <strong>{demoClassesCount}</strong> lớp đang gắn nhãn Demo.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={deleteDemoData}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Gỡ nhãn Demo
              </button>
              <button
                onClick={restoreDemoData}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục Demo gốc
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Admin Tools & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Academic Department Overview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Cơ cấu Tổ chuyên môn ({departments.length})
              </h2>
              <button
                onClick={() => setActiveMenu('departments')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Quản lý →
              </button>
            </div>

            <div className="space-y-2.5">
              {departments.map((dept) => {
                const memberCount = teachers.filter((t) => t.department === dept.name).length;
                return (
                  <div
                    key={dept.id}
                    onClick={() => setActiveMenu('departments')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-2xl border border-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          {dept.code}
                        </span>
                        {dept.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tổ trưởng: <strong className="text-slate-700">{dept.leaderTeacherName || 'Chưa gán'}</strong>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs shrink-0">
                      {memberCount} GV
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveMenu('departments')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" /> Chi tiết & Phân công tổ chuyên môn →
            </button>
          </div>

          {/* Teacher Account Provisioning Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Cấp tài khoản & Mật khẩu GV
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                ADMIN
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Khởi tạo tài khoản đăng nhập với tên tài khoản mặc định là địa chỉ email cá nhân, cấp mật khẩu ban đầu, phân quyền GVCN/GVBM và in phiếu bàn giao.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đã cấp tài khoản</div>
                <div className="text-lg font-black text-purple-900">{users.length} tài khoản</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Chưa cấp</div>
                <div className="text-lg font-black text-amber-900">
                  {Math.max(0, teachers.length - users.filter((u) => u.teacherId).length)} GV
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveMenu('teachers')}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" /> Quản lý cấp tài khoản giáo viên →
            </button>
          </div>

          {/* Quick Backup Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-indigo-600" />
              Sao lưu CSDL tức thì
            </h2>
            <p className="text-xs text-slate-500">
              Tạo bản sao lưu toàn bộ cơ sở dữ liệu bao gồm học sinh, điểm danh, kết quả học tập và cấu hình.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Ghi chú bản sao lưu (tùy chọn)..."
                value={backupNote}
                onChange={(e) => setBackupNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
              <button
                onClick={handleQuickBackup}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Xuất & Tải Backup JSON
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Đã có {backups.length} bản sao lưu</span>
              <button
                onClick={() => setActiveMenu('settings')}
                className="text-purple-600 font-bold hover:underline cursor-pointer"
              >
                Quản lý sao lưu →
              </button>
            </div>
          </div>

          {/* School Year Status & Lock Controller */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-sky-600" />
              Niên khóa hiện hành
            </h2>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{currentSchoolYear.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    currentSchoolYear.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentSchoolYear.status === 'active' ? 'Đang mở' : 'Đã khóa'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Thời gian: {currentSchoolYear.startDate} đến {currentSchoolYear.endDate}
              </p>

              <button
                onClick={() => toggleLockSchoolYear(currentSchoolYear.id)}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentSchoolYear.status === 'active'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentSchoolYear.status === 'active' ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-700" /> Khóa dữ liệu niên khóa
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> Mở khóa niên khóa
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Role Switching for Testing RBAC */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-purple-600" />
              Thử nghiệm phân quyền (RBAC)
            </h2>
            <p className="text-xs text-slate-500">
              Chuyển nhanh giữa các vai trò để kiểm thử phân tách giao diện và chức năng:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(['ADMIN', 'BGH', 'GVCN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchUserRole(r)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    currentUser?.role === r
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Nhật ký kiểm toán hoạt động gần đây (Audit Trail)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi lại tất cả thao tác quan trọng: sao lưu, mở/khóa dữ liệu, chỉnh sửa danh mục
            </p>
          </div>
          <button
            onClick={() => setActiveMenu('settings')}
            className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
          >
            Xem toàn bộ nhật ký →
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {auditLogs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    {log.userRole}
                  </span>
                  <span className="text-slate-400 text-[10px]">({log.userName})</span>
                </div>
                <div className="text-slate-600 text-[11px]">{log.details}</div>
              </div>
              <div className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('vi-VN')} {new Date(log.timestamp).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
