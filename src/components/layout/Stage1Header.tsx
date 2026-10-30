import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  School,
  Shield,
  User,
  Users,
  Eye,
  UserCheck,
  Sparkles,
  ClipboardList,
  Layers,
  KeyRound,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const Stage1Header: React.FC = () => {
  const {
    currentUser,
    logout,
    school,
    schoolYears,
    currentSchoolYear,
    selectSchoolYear,
    classes,
    currentClass,
    selectClass,
    sidebarOpen,
    setSidebarOpen,
    setActiveMenu,
    isCurrentSchoolYearLocked,
    canEditCurrentClass,
    syncStatus,
    lastSyncedTime,
    forceSyncWithServer,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await forceSyncWithServer();
    setTimeout(() => setIsManualSyncing(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden lg:hidden"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase truncate">
                  SỔ CHỦ NHIỆM ĐIỆN TỬ
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Vận hành chính thức
                </span>
                {/* Cloud & Multi-Device Sync Indicator */}
                <button
                  type="button"
                  onClick={handleManualSync}
                  title={`Đồng bộ đa thiết bị (Lần cuối: ${lastSyncedTime}). Bấm để đồng bộ ngay.`}
                  className={`hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                    syncStatus === 'syncing' || isManualSyncing
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : syncStatus === 'offline'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                  }`}
                >
                  {syncStatus === 'syncing' || isManualSyncing ? (
                    <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  ) : (
                    <Cloud className="w-3 h-3 text-sky-600" />
                  )}
                  <span>
                    {syncStatus === 'syncing' || isManualSyncing
                      ? 'Đang đồng bộ...'
                      : syncStatus === 'offline'
                      ? 'Ngoại tuyến'
                      : 'Đồng bộ Đám mây'}
                  </span>
                </button>
                {isCurrentSchoolYearLocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    🔒 NĂM HỌC ĐÃ KHÓA
                  </span>
                )}
                {!canEditCurrentClass && currentUser?.role === 'GVCN' && (
                  <span className="hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    👁️ LỚP CHỈ XEM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                {school.name} • {school.districtAuthority}
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Selectors & Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* School Year Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currentSchoolYear.id}
              onChange={(e) => selectSchoolYear(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {schoolYears.map((yr) => (
                <option key={yr.id} value={yr.id}>
                  {yr.name} ({yr.status === 'active' ? 'Đang dùng' : 'Đã khóa'})
                </option>
              ))}
            </select>
          </div>

          {/* Class Selector */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
              currentUser?.role === 'BGH'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${currentUser?.role === 'BGH' ? 'text-amber-700' : 'text-slate-500'}`} />
            {currentUser?.role === 'BGH' && (
              <span className="font-bold text-[10px] text-amber-800 uppercase tracking-tight hidden lg:inline">
                Sổ lớp:
              </span>
            )}
            <select
              value={currentClass?.id || ''}
              onChange={(e) => selectClass(e.target.value)}
              className="bg-transparent font-bold focus:outline-hidden cursor-pointer max-w-[200px] truncate"
            >
              <optgroup label="Cấp Tiểu học (Khối 1 - 5)">
                {activeYearClasses
                  .filter((cls) => ['1', '2', '3', '4', '5'].includes(cls.grade))
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Lớp {cls.className} {cls.homeroomTeacherName ? `(${cls.homeroomTeacherName})` : ''}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Cấp Trung học cơ sở (Khối 6 - 9)">
                {activeYearClasses
                  .filter((cls) => ['6', '7', '8', '9'].includes(cls.grade))
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Lớp {cls.className} {cls.homeroomTeacherName ? `(${cls.homeroomTeacherName})` : ''}
                    </option>
                  ))}
              </optgroup>
            </select>
            {currentUser?.role === 'GVCN' && currentClass && currentClass.homeroomTeacherId === currentUser.id && (
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px]">
                Lớp bạn CN
              </span>
            )}
            {currentUser?.role === 'BGH' && (
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold text-[10px]">
                Hiệu trưởng ({activeYearClasses.length} lớp)
              </span>
            )}
            {currentUser?.role === 'ADMIN' && (
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px]">
                Quản trị
              </span>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                currentUser?.role === 'ADMIN'
                  ? 'border-purple-300 bg-purple-50 hover:bg-purple-100'
                  : currentUser?.role === 'BGH'
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-purple-700'
                    : currentUser?.role === 'BGH'
                    ? 'bg-amber-600'
                    : 'bg-sky-700'
                }`}
              >
                {currentUser?.name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div
                  className={`text-[10px] font-bold ${
                    currentUser?.role === 'ADMIN'
                      ? 'text-purple-700'
                      : currentUser?.role === 'BGH'
                      ? 'text-amber-700'
                      : 'text-sky-700'
                  }`}
                >
                  {currentUser?.role === 'ADMIN'
                    ? '🛡️ ADMIN'
                    : currentUser?.role === 'BGH'
                    ? '👁️ BGH (Duyệt)'
                    : '📋 GVCN'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 text-xs space-y-1.5 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{currentUser?.email}</div>
                  <div className="text-slate-600 font-semibold text-[10px] mt-0.5">
                    {currentUser?.title}
                  </div>
                </div>

                {currentUser?.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveMenu('teachers');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Hồ sơ Giáo viên toàn trường</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('departments');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Quản lý Tổ chuyên môn</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('class-info');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <School className="w-4 h-4 text-purple-600" />
                      <span>Quản lý Niên khóa & Lớp</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Cài đặt & Sao lưu CSDL</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('system-testing');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <ClipboardList className="w-4 h-4 text-purple-600" />
                      <span>Kiểm tra toàn vẹn CSDL</span>
                    </button>
                  </>
                )}

                {currentUser?.role === 'BGH' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveMenu('teachers');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Hồ sơ GV toàn trường</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('departments');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Tổ chuyên môn toàn trường</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('reports');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>Duyệt sổ & Báo cáo các lớp</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('class-info');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <School className="w-4 h-4 text-amber-600" />
                      <span>Danh mục Lớp & Phân công</span>
                    </button>
                  </>
                )}

                {(currentUser?.role === 'GVCN' || currentUser?.role === 'GIÁO VIÊN' || currentUser?.role === 'GVBM') && (
                  <>
                    <button
                      onClick={() => {
                        setActiveMenu('class-info');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <School className="w-4 h-4 text-sky-600" />
                      <span>Thông tin lớp & GVBM</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('students');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-sky-600" />
                      <span>Hồ sơ học sinh lớp</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setActiveMenu('user-guide');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Hướng dẫn sử dụng</span>
                </button>

                <div className="pt-1 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sky-700 hover:bg-sky-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-sky-600" />
                    <span>Đổi mật khẩu tài khoản</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Đổi mật khẩu cá nhân cho Giáo viên / BGH / Admin */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};
