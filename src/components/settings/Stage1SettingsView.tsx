import React, { useState } from 'react';
import {
  Settings,
  Shield,
  User,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Database,
  Lock,
  LogOut,
  Sliders,
  Download,
  Upload,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Check,
  FileCheck,
  Layers,
  Sparkles,
  Users,
  Mail,
  KeyRound,
  ExternalLink,
  Copy,
  Edit,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, User as UserType } from '../../types';
import { ClassPromotionMasterView } from '../promotion/ClassPromotionMasterView';
import { DataIntegrityCheckerView } from '../integrity/DataIntegrityCheckerView';
import { ConfirmModal } from '../common/ConfirmModal';
import { TeacherAccountManagementTab } from '../teachers/TeacherAccountManagementTab';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

type SettingsTab = 'account-roles' | 'backup-restore' | 'audit-logs' | 'class-promotion' | 'data-integrity';

export const Stage1SettingsView: React.FC = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const {
    currentUser,
    logout,
    auditLogs,
    settings,
    updateSettings,
    deleteDemoData,
    restoreDemoData,
    classes,
    schoolYears,
    school,
    users,
    teachers,
    autoGenerateAccountsForAllTeachers,
    updateUserLoginEmail,
    setActiveMenu,
    switchUserRole,
    backups,
    createBackup,
    restoreBackup,
    exportFullJson,
  } = useApp();

  const isGvcn = currentUser?.role === 'GVCN' || currentUser?.role === 'GIÁO VIÊN' || currentUser?.role === 'GVBM';
  const isBgh = currentUser?.role === 'BGH';
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<SettingsTab>('account-roles');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showClearDemoConfirm, setShowClearDemoConfirm] = useState(false);
  const [showRestoreDemoConfirm, setShowRestoreDemoConfirm] = useState(false);

  // Email Edit State for Admin
  const [editingEmailUser, setEditingEmailUser] = useState<UserType | null>(null);
  const [newEmailValue, setNewEmailValue] = useState<string>('');
  const [syncUsernameOption, setSyncUsernameOption] = useState<boolean>(true);
  const [emailEditError, setEmailEditError] = useState<string | null>(null);

  const handleOpenEditEmail = (u: UserType) => {
    setEditingEmailUser(u);
    setNewEmailValue(u.email);
    setSyncUsernameOption(true);
    setEmailEditError(null);
  };

  const handleSaveEditedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmailUser) return;
    setEmailEditError(null);
    const res = updateUserLoginEmail(editingEmailUser.id, newEmailValue, syncUsernameOption);
    if (res.success) {
      showMsg(res.message);
      setEditingEmailUser(null);
    } else {
      setEmailEditError(res.message);
    }
  };

  // Audit Logs Filter
  const [logFilterModule, setLogFilterModule] = useState<string>('ALL');
  const [logFilterUser, setLogFilterUser] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleClearDemo = () => {
    deleteDemoData();
    setShowClearDemoConfirm(false);
    showMsg('Đã hoàn tất chuyển đổi toàn bộ dữ liệu Demo thành dữ liệu chính thức.');
  };

  const handleRestoreDemo = () => {
    restoreDemoData();
    setShowRestoreDemoConfirm(false);
    showMsg('Đã khôi phục lại dữ liệu mẫu Demo gốc của Trường TH&THCS Nguyễn Đình Anh.');
  };

  const handleCreateBackup = () => {
    createBackup('Bản sao lưu thủ công từ giao diện Quản trị Cài đặt.');
    showMsg('Đã tạo và tải xuống bản sao lưu dữ liệu JSON thành công!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        const res = restoreBackup(payload);
        if (res.success) {
          showMsg(res.message);
        } else {
          showMsg(res.message, 'error');
        }
      } catch (err: any) {
        showMsg('Tệp tải lên không phải là JSON hợp lệ: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchModule = logFilterModule === 'ALL' || (log.module || 'Hệ thống') === logFilterModule;
    const matchUser = logFilterUser === 'ALL' || log.userName === logFilterUser;
    const matchSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(logSearch.toLowerCase()));
    return matchModule && matchUser && matchSearch;
  });

  const uniqueModules = Array.from(new Set(auditLogs.map((l) => l.module || 'Hệ thống')));
  const uniqueUsers = Array.from(new Set(auditLogs.map((l) => l.userName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            CÀI ĐẶT HỆ THỐNG – BẢO MẬT & SAO LƯU (GIAI ĐOẠN 10)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị phân quyền (RBAC), sao lưu - khôi phục, chuyển lớp năm học mới và nhật ký kiểm toán.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
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

      {/* Navigation Sub-tabs tailored to role */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold custom-scrollbar">
        <button
          onClick={() => setActiveTab('account-roles')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'account-roles'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          {isAdmin ? '1. Tài khoản & Phân quyền (RBAC)' : isBgh ? '1. Thông tin BGH' : '1. Tài khoản cá nhân & Lớp'}
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('backup-restore')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'backup-restore'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            2. Sao lưu & Khôi phục ({backups.length})
          </button>
        )}

        {(isAdmin || isBgh) && (
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'audit-logs'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            {isAdmin ? `3. Nhật ký kiểm toán (${auditLogs.length})` : `2. Nhật ký kiểm toán (${auditLogs.length})`}
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('class-promotion')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'class-promotion'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            4. Chuyển lớp năm học mới
          </button>
        )}

        {(isAdmin || isBgh) && (
          <button
            onClick={() => setActiveTab('data-integrity')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'data-integrity'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            {isAdmin ? '5. Kiểm tra toàn vẹn CSDL' : '3. Kiểm tra toàn vẹn CSDL'}
          </button>
        )}
      </div>

      {/* Tab 1: Account & Roles */}
      {activeTab === 'account-roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Account Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-sky-600" />
                Tài khoản đang đăng nhập
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center text-xl font-black shadow-md">
                  {currentUser?.name.charAt(0)}
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      Vai trò: {currentUser?.role}
                    </span>
                    <span className="text-[11px] text-slate-400">{currentUser?.title}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Mã người dùng:</span>
                  <span className="font-mono text-slate-800">{currentUser?.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Đơn vị công tác:</span>
                  <span className="font-semibold text-slate-800">{school.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Quyền hạn hệ thống:</span>
                  <span className="text-emerald-700 font-semibold">
                    {currentUser?.role === 'ADMIN'
                      ? 'Toàn quyền quản trị hệ thống, phân quyền và cấu hình'
                      : currentUser?.role === 'BGH'
                      ? 'Xem toàn trường, kiểm tra & ký duyệt sổ (Read-only sổ điểm danh)'
                      : currentUser?.role === 'GVCN'
                      ? 'Chỉ được xem/sửa lớp được phân quyền chủ nhiệm'
                      : 'Giáo viên bộ môn, xem và nhập điểm môn học'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Bảo mật tài khoản:</span>
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                    <span>Đổi mật khẩu tài khoản</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Role Switcher for Testing (CHỈ HIỂN THỊ VỚI QUẢN TRỊ VIÊN) */}
            {isAdmin && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Kiểm thử phân quyền vai trò (Role Switcher)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nhấn vào vai trò bên dưới để kiểm thử ngay lập tức các chính sách bảo vệ dữ liệu và giới hạn quyền truy cập:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {(['ADMIN', 'BGH', 'GVCN', 'GIÁO VIÊN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchUserRole(role);
                        showMsg(`Đã chuyển sang vai trò ${role} thành công!`);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        currentUser?.role === role
                          ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span>{role}</span>
                        {currentUser?.role === role && <Check className="w-4 h-4 text-sky-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-normal">
                        {role === 'ADMIN'
                          ? 'Quản trị viên'
                          : role === 'BGH'
                          ? 'Ban Giám Hiệu'
                          : role === 'GVCN'
                          ? 'Giáo viên chủ nhiệm 7/1'
                          : 'Giáo viên bộ môn'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quản lý Cấu trúc Tài khoản theo tiêu chuẩn người dùng (CHỈ HIỂN THỊ VỚI ADMIN) */}
          {isAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4.5 h-4.5 text-indigo-600" />
                    Quản lý Tài khoản Cán bộ - Giáo viên
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cấu trúc quản lý chuẩn: Họ và tên, Email đăng nhập, Tổ chuyên môn, Bộ môn, Vai trò, Trạng thái tài khoản và 5 công cụ thao tác nhanh.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const res = autoGenerateAccountsForAllTeachers();
                      showMsg(res.message);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Tự động kiểm tra và cấp quyền đăng nhập bằng email cho toàn bộ giáo viên"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Đồng bộ cấp quyền Email
                  </button>
                </div>
              </div>

              <TeacherAccountManagementTab />
            </div>
          )}

          {/* Database Management for ADMIN ONLY */}
          {isAdmin ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Database className="w-4 h-4 text-sky-600" />
                Cơ sở dữ liệu Vận hành chính thức (Dành riêng cho ADMIN)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Bảng `schools`:</div>
                  <div className="font-bold text-slate-800 mt-0.5">1 trường học</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Bảng `school_years`:</div>
                  <div className="font-bold text-slate-800 mt-0.5">{schoolYears.length} niên khóa</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Bảng `classes`:</div>
                  <div className="font-bold text-slate-800 mt-0.5">{classes.length} lớp học</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Bảng `audit_logs`:</div>
                  <div className="font-bold text-slate-800 mt-0.5">{auditLogs.length} sự kiện</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500">
                  Trạng thái: <span className="font-bold text-emerald-600">Production Ready (Vận hành chính thức)</span>
                </div>
                <button
                  onClick={() => setShowRestoreDemoConfirm(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Đặt lại cơ sở dữ liệu về trạng thái xuất xưởng sạch"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" /> Đặt lại CSDL chuẩn (Clean Seed)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield className="w-4 h-4 text-emerald-600" />
                Thông tin phân quyền & Phạm vi tác vụ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBgh ? (
                  <>
                    Tài khoản <strong>Ban Giám Hiệu</strong> được phân quyền giám sát toàn bộ các lớp trong trường, kiểm tra báo cáo chuyên cần, duyệt sổ điểm danh, hạnh kiểm và kết quả học tập định kỳ. Thao tác sao lưu CSDL cấp hệ thống và xóa dữ liệu do Quản trị viên (ADMIN) đảm trách.
                  </>
                ) : (
                  <>
                    Tài khoản <strong>Giáo viên chủ nhiệm</strong> có toàn quyền lập kế hoạch, điểm danh hàng ngày, quản lý hồ sơ học sinh, sơ đồ lớp và đánh giá rèn luyện cho lớp được nhà trường phân công. Các tác vụ quản trị CSDL cấp trường được phân định cho Quản trị viên (ADMIN).
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Backup & Restore (Requirement 4) */}
      {activeTab === 'backup-restore' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-600" />
                  Sao lưu dữ liệu & Khôi phục hệ thống (Backup & Restore)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tạo bản sao lưu đầy đủ có ghi nhận ngày giờ, xuất toàn bộ dữ liệu JSON và khôi phục khi cần thiết.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCreateBackup}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Sao lưu dữ liệu ngay
                </button>

                <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Khôi phục dữ liệu
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={exportFullJson}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Xuất toàn bộ dữ liệu
                </button>
              </div>
            </div>

            {/* Backups History Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lịch sử các bản sao lưu đã tạo ({backups.length}):
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Tên tệp sao lưu</th>
                      <th className="p-3">Ngày giờ sao lưu</th>
                      <th className="p-3">Người thực hiện</th>
                      <th className="p-3 text-right">Dung lượng</th>
                      <th className="p-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {backups.map((bak) => (
                      <tr key={bak.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-sky-800">{bak.fileName}</td>
                        <td className="p-3 font-semibold text-slate-700">{bak.createdAt}</td>
                        <td className="p-3 text-slate-600">{bak.createdBy}</td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {(bak.fileSizeBytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="p-3 text-slate-500">{bak.note || 'Sao lưu hệ thống'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs (Requirement 5) */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Nhật ký kiểm toán hệ thống (`audit_logs`)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận đầy đủ: Người dùng • Thời gian • Hành động • Module • Đối tượng • Kết quả.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {filteredLogs.length}/{auditLogs.length} bản ghi
            </span>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Lọc theo Module:</label>
              <select
                value={logFilterModule}
                onChange={(e) => setLogFilterModule(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="ALL">Tất cả các module</option>
                {uniqueModules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Lọc theo Người dùng:</label>
              <select
                value={logFilterUser}
                onChange={(e) => setLogFilterUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="ALL">Tất cả người dùng</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Tìm kiếm nội dung:</label>
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Tìm hành động, đối tượng..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded-2xl custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">Thời gian</th>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">Người dùng</th>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">Module</th>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">Hành động</th>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">Đối tượng</th>
                  <th className="p-2.5 border-r border-slate-200 whitespace-nowrap text-center">Kết quả</th>
                  <th className="p-2.5">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500 border-r border-slate-200 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {log.userName}
                      <span className="ml-1 text-[10px] text-slate-400 font-normal">({log.userRole})</span>
                    </td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {log.module || 'Hệ thống'}
                    </td>
                    <td className="p-2.5 font-semibold text-sky-800 border-r border-slate-200 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="p-2.5 font-mono text-slate-500 border-r border-slate-200 whitespace-nowrap">
                      {log.target || 'N/A'}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          (log.result || 'SUCCESS') === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (log.result || 'SUCCESS') === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.result || 'SUCCESS'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Class Promotion (Requirement 8) */}
      {activeTab === 'class-promotion' && <ClassPromotionMasterView />}

      {/* Tab 5: Data Integrity (Requirement 10) */}
      {activeTab === 'data-integrity' && <DataIntegrityCheckerView />}

      {/* Modal Confirm Clear Demo */}
      <ConfirmModal
        isOpen={showClearDemoConfirm}
        onClose={() => setShowClearDemoConfirm(false)}
        onConfirm={handleClearDemo}
        title="Xác nhận xóa / chuyển đổi dữ liệu Demo"
        message="Hệ thống sẽ gỡ bỏ nhãn 'Dữ liệu Demo' và chuyển toàn bộ hồ sơ hiện tại thành dữ liệu chính thức của nhà trường. Dữ liệu thật đã nhập sẽ được bảo toàn nguyên vẹn 100%."
        confirmLabel="Chuyển sang dữ liệu chính thức"
        confirmVariant="primary"
      />

      {/* Modal Confirm Reset Clean Production */}
      <ConfirmModal
        isOpen={showRestoreDemoConfirm}
        onClose={() => setShowRestoreDemoConfirm(false)}
        onConfirm={handleRestoreDemo}
        title="Xác nhận đặt lại CSDL chuẩn (Clean Seed)"
        message="Hệ thống sẽ đặt lại CSDL về trạng thái chuẩn ban đầu của Trường TH&THCS Nguyễn Đình Anh (8 lớp học, 12 giáo viên, 5 tổ chuyên môn, 0 học sinh). Bạn có thể khôi phục lại dữ liệu bất cứ lúc nào từ tệp sao lưu JSON đã tải."
        confirmLabel="Đặt lại CSDL chuẩn"
        confirmVariant="warning"
      />

      {/* Modal Sửa Email Đăng nhập (Dành cho Quản trị viên) */}
      {editingEmailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Chỉnh sửa Email Đăng nhập</h3>
                  <p className="text-[11px] text-sky-100">Cập nhật quyền truy cập cho cán bộ - giáo viên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmailUser(null)}
                className="p-1 rounded-xl hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedEmail} className="p-5 space-y-4 text-xs">
              {emailEditError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{emailEditError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-slate-500 text-[11px]">Tài khoản cán bộ:</div>
                <div className="font-bold text-slate-900 text-sm">{editingEmailUser.name}</div>
                <div className="text-slate-500 text-[11px]">
                  {editingEmailUser.title} • Vai trò: <span className="font-bold text-sky-700">{editingEmailUser.role}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Địa chỉ Email đăng nhập mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newEmailValue}
                    onChange={(e) => setNewEmailValue(e.target.value)}
                    placeholder="VD: leducminh.gv@gmail.com..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Email hiện tại: <span className="font-mono text-slate-600 font-semibold">{editingEmailUser.email}</span>
                </p>
              </div>

              <label className="flex items-start gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncUsernameOption}
                  onChange={(e) => setSyncUsernameOption(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500"
                />
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-sky-950">Đồng bộ Tên đăng nhập & Hồ sơ nhân sự:</span>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    Tự động cập nhật tên đăng nhập hệ thống và hồ sơ giáo viên sang email mới này.
                  </p>
                </div>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmailUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Lưu Email đăng nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu cá nhân */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
