import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  UserPlus,
  Shield,
  Search,
  Filter,
  Download,
  Lock,
  Unlock,
  Check,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronDown,
  X,
  School,
  BookOpen,
  Mail,
  Copy,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  User,
  TeacherProfile,
  UserRole,
  DutyRole,
  AccountStatus,
  DEPARTMENT_OPTIONS,
  SUBJECT_OPTIONS,
  DUTY_ROLE_OPTIONS,
} from '../../types';
import { IssueTeacherAccountModal } from './IssueTeacherAccountModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { AccountDetailsModal } from './AccountDetailsModal';
import { UserExcelImportModal } from './UserExcelImportModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeacherAccountManagementTab: React.FC = () => {
  const {
    teachers,
    users,
    classes,
    school,
    toggleLockUserAccount,
    deleteUserAccount,
    updateUserAccount,
    batchResetTeacherPasswords,
    currentUser,
  } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isBatchPassModalOpen, setIsBatchPassModalOpen] = useState(false);
  const [batchNewPass, setBatchNewPass] = useState('Giaovien@2026');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedTeacherForIssue, setSelectedTeacherForIssue] = useState<TeacherProfile | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<TeacherProfile | null>(null);

  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [userForResetPass, setUserForResetPass] = useState<User | null>(null);

  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Helper: Avatar color based on name
  const getAvatarStyle = (name: string, index: number) => {
    const colors = [
      { bg: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-600' },
      { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600' },
      { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-600' },
      { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
      { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-600' },
      { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' },
    ];
    return colors[index % colors.length];
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.substring(0, 2) || 'TK').toUpperCase();
  };

  // Combined accounts list
  interface MergedRow {
    user: User;
    teacher?: TeacherProfile;
    department: string;
    subject: string;
    dutyRole: DutyRole;
    status: AccountStatus;
  }

  const rows: MergedRow[] = useMemo(() => {
    return users.map((u) => {
      const t = teachers.find(
        (teacher) =>
          teacher.id === u.teacherId ||
          (teacher.email && u.email && teacher.email.toLowerCase() === u.email.toLowerCase())
      );

      const department =
        u.department ||
        t?.department ||
        (u.role === 'BGH' ? 'Ban giám hiệu' : 'Tổ khoa học tự nhiên');

      const subject =
        u.subject ||
        t?.mainSubject ||
        (u.role === 'BGH' ? '—' : 'Toán');

      const dutyRole: DutyRole =
        (u.dutyRole as DutyRole) ||
        (u.role === 'ADMIN'
          ? 'Hiệu trưởng'
          : u.role === 'BGH'
          ? 'Phó Hiệu trưởng'
          : u.role === 'GVCN'
          ? 'Giáo viên chủ nhiệm'
          : 'Giáo viên bộ môn');

      const status: AccountStatus = (u.status as AccountStatus) || 'active';

      return {
        user: u,
        teacher: t,
        department,
        subject,
        dutyRole,
        status,
      };
    });
  }, [users, teachers]);

  // Statistics
  const totalAccounts = rows.length;
  const activeCount = rows.filter((r) => r.status === 'active').length;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;
  const lockedCount = rows.filter((r) => r.status === 'locked').length;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const { user: u, department, subject, dutyRole, status } = row;

      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        department.toLowerCase().includes(search) ||
        subject.toLowerCase().includes(search) ||
        dutyRole.toLowerCase().includes(search);

      const matchDept = departmentFilter === 'ALL' || department === departmentFilter;
      const matchSubj = subjectFilter === 'ALL' || subject === subjectFilter;
      const matchRole = roleFilter === 'ALL' || dutyRole === roleFilter;
      const matchStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchSearch && matchDept && matchSubj && matchRole && matchStatus;
    });
  }, [rows, searchTerm, departmentFilter, subjectFilter, roleFilter, statusFilter]);

  // Quick Inline Role Change
  const handleQuickChangeRole = (userId: string, newRole: DutyRole) => {
    let systemRole: UserRole = 'GIÁO VIÊN';
    if (newRole === 'Quản trị viên') systemRole = 'ADMIN';
    else if (newRole === 'Hiệu trưởng' || newRole === 'Phó Hiệu trưởng') systemRole = 'BGH';
    else if (newRole === 'Giáo viên chủ nhiệm') systemRole = 'GVCN';

    const res = updateUserAccount(userId, {
      dutyRole: newRole,
      role: systemRole,
      title: newRole,
    });
    if (res.success) {
      showMsg(`Đã đổi vai trò thành "${newRole}"!`);
    } else {
      showMsg(res.message, 'error');
    }
  };

  // Quick Inline Status Change
  const handleQuickChangeStatus = (userId: string, newStatus: AccountStatus) => {
    const res = updateUserAccount(userId, {
      status: newStatus,
    });
    if (res.success) {
      showMsg(`Đã cập nhật trạng thái tài khoản!`);
    } else {
      showMsg(res.message, 'error');
    }
  };

  const handleOpenDetail = (u: User, t?: TeacherProfile) => {
    setSelectedUserForDetail(u);
    setSelectedTeacherForDetail(t || null);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditUserModal = (u: User) => {
    setSelectedUserForEdit(u);
    setSelectedTeacherForIssue(teachers.find((t) => t.id === u.teacherId) || null);
    setIsIssueModalOpen(true);
  };

  const handleOpenResetPass = (u: User) => {
    setUserForResetPass(u);
    setIsResetPassModalOpen(true);
  };

  const handleToggleLock = (u: User) => {
    const res = toggleLockUserAccount(u.id);
    if (res.success) {
      showMsg(res.message);
    } else {
      showMsg(res.message, 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const res = deleteUserAccount(deleteCandidate.id);
    if (res.success) {
      showMsg(`Đã xóa vĩnh viễn tài khoản của ${deleteCandidate.name}!`);
    } else {
      showMsg(res.message, 'error');
    }
    setDeleteCandidate(null);
  };

  // Export Accounts to Excel
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'Email (Tên đăng nhập)',
      'Tổ chuyên môn / bộ phận',
      'Bộ môn',
      'Vai trò (Role)',
      'Trạng thái tài khoản',
      'Mật khẩu khởi tạo',
      'Lớp chủ nhiệm',
      'Số điện thoại',
      'Ngày tạo tài khoản',
    ];

    const dataRows = filteredRows.map((r, idx) => {
      const { user: u, department, subject, dutyRole, status } = r;
      const homeroomName = u.homeroomClassId
        ? classes.find((c) => c.id === u.homeroomClassId)?.className
        : '—';

      return [
        idx + 1,
        u.name,
        u.email,
        department,
        subject,
        dutyRole,
        status === 'active' ? 'Đang hoạt động' : status === 'pending' ? 'Chưa kích hoạt' : 'Bị khóa',
        u.plainPassword || u.passwordHash || '123',
        homeroomName ? `Lớp ${homeroomName}` : '—',
        u.phone || '',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '',
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 30 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 15 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Quan_Ly_Tai_Khoan');
    XLSX.writeFile(
      wb,
      `Danh_Sach_Tai_Khoan_${school.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showMsg('Đã xuất danh sách tài khoản ra file Excel (.xlsx) thành công!');
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Không có quyền truy cập</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Chức năng Quản lý tài khoản & Phân quyền chỉ dành riêng cho Quản trị viên hệ thống (ADMIN). Ban Giám Hiệu và Giáo viên không có quyền thao tác mục này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs ${
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

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Tổng tài khoản</div>
            <div className="text-lg font-black text-slate-900">{totalAccounts} tài khoản</div>
            <div className="text-[10px] text-slate-500">Toàn trường</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Đang hoạt động</div>
            <div className="text-lg font-black text-emerald-900">{activeCount} tài khoản</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Cho phép đăng nhập</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Chưa kích hoạt</div>
            <div className="text-lg font-black text-amber-900">{pendingCount} tài khoản</div>
            <div className="text-[10px] text-amber-600 font-semibold">Chờ đăng nhập đầu</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Bị khóa</div>
            <div className="text-lg font-black text-rose-900">{lockedCount} tài khoản</div>
            <div className="text-[10px] text-rose-600 font-semibold">Tạm ngưng truy cập</div>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm họ tên, email đăng nhập, bộ môn..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden transition-all text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsExcelImportModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" /> Nhập từ Excel
            </button>
            <button
              type="button"
              onClick={() => setIsBatchPassModalOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Cập nhật lại mật khẩu đồng loạt cho toàn bộ giáo viên trong trường"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Đổi MK toàn bộ GV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" /> Xuất Excel
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedUserForEdit(null);
                setSelectedTeacherForIssue(null);
                setIsIssueModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Cấp tài khoản mới
            </button>
          </div>
        </div>

        {/* Filter Dropdowns matching requested structure */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Tổ chuyên môn / bộ phận:
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">Tất cả tổ chuyên môn ({rows.length})</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Bộ môn:
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">Tất cả bộ môn</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Vai trò (Role):
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">Tất cả vai trò</option>
              {DUTY_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Trạng thái:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động ({activeCount})</option>
              <option value="pending">🟡 Chưa kích hoạt ({pendingCount})</option>
              <option value="locked">🔴 Bị khóa ({lockedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Matching Screenshot Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 min-w-[240px]">HỌ TÊN & EMAIL</th>
                <th className="py-3.5 px-4 min-w-[160px]">TỔ CHUYÊN MÔN</th>
                <th className="py-3.5 px-4 min-w-[120px]">BỘ MÔN</th>
                <th className="py-3.5 px-4 min-w-[160px]">VAI TRÒ (ROLE)</th>
                <th className="py-3.5 px-4 min-w-[130px]">TRẠNG THÁI</th>
                <th className="py-3.5 px-4 min-w-[160px] text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Không tìm thấy tài khoản phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  const { user: u, teacher: t, department, subject, dutyRole, status } = r;
                  const avatarStyle = getAvatarStyle(u.name, idx);
                  const initials = getInitials(u.name);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Column 1: HỌ TÊN & EMAIL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Circular Avatar with Initial and Indicator Dot */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-9 h-9 rounded-full ${avatarStyle.bg} border flex items-center justify-center font-bold text-xs select-none shadow-2xs`}
                            >
                              {initials}
                            </div>
                            <span
                              className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                                status === 'locked'
                                  ? 'bg-rose-500'
                                  : status === 'pending'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {u.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: TỔ CHUYÊN MÔN */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 text-xs">
                          {department}
                        </span>
                      </td>

                      {/* Column 3: BỘ MÔN */}
                      <td className="py-3.5 px-4">
                        <span className={`text-xs ${subject === '—' ? 'text-slate-400 font-semibold' : 'text-slate-800 font-medium'}`}>
                          {subject}
                        </span>
                      </td>

                      {/* Column 4: VAI TRÒ (ROLE) - Pill dropdown like screenshot */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={dutyRole}
                            onChange={(e) => handleQuickChangeRole(u.id, e.target.value as DutyRole)}
                            className={`appearance-none pl-3.5 pr-7 py-1.5 border rounded-full font-bold text-xs cursor-pointer focus:outline-hidden focus:ring-2 transition-all shadow-2xs ${
                              dutyRole === 'Quản trị viên'
                                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 focus:ring-purple-400'
                                : dutyRole === 'Hiệu trưởng' || dutyRole === 'Phó Hiệu trưởng'
                                ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 focus:ring-amber-400'
                                : dutyRole === 'Giáo viên chủ nhiệm'
                                ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 focus:ring-sky-400'
                                : 'bg-indigo-50/90 hover:bg-indigo-100/90 border-indigo-200/90 text-indigo-700 focus:ring-indigo-400'
                            }`}
                            title="Nhấp để thay đổi vai trò trực tiếp"
                          >
                            {DUTY_ROLE_OPTIONS.map((roleOpt) => (
                              <option key={roleOpt} value={roleOpt}>
                                {roleOpt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Column 5: TRẠNG THÁI - Pill badge like screenshot */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={status}
                            onChange={(e) => handleQuickChangeStatus(u.id, e.target.value as AccountStatus)}
                            className={`appearance-none pl-3 pr-6 py-1 rounded-full text-xs font-semibold cursor-pointer border focus:outline-hidden transition-all shadow-2xs ${
                              status === 'locked'
                                ? 'border-rose-300 bg-rose-50 text-rose-700'
                                : status === 'pending'
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            }`}
                            title="Nhấp để thay đổi trạng thái"
                          >
                            <option value="active">▪ Đang hoạt động</option>
                            <option value="pending">▪ Chưa kích hoạt</option>
                            <option value="locked">🔒 Bị khóa</option>
                          </select>
                          <ChevronDown
                            className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                              status === 'locked'
                                ? 'text-rose-600'
                                : status === 'pending'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Column 6: THAO TÁC - 5 Action Icons Matching Screenshot */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(u, t)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết tài khoản"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Cập nhật lại mật khẩu đăng nhập */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPass(u)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Cập nhật lại mật khẩu đăng nhập"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* 3. Chỉnh sửa thông tin/Phân quyền */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditUserModal(u)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin / Phân quyền"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* 4. Khóa tài khoản */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              status === 'locked'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-rose-500 hover:bg-rose-50'
                            }`}
                            title={status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {status === 'locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          {/* 5. Xóa vĩnh viễn tài khoản */}
                          {u.id !== currentUser?.id ? (
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(u)}
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="p-1.5 text-slate-200 cursor-not-allowed" title="Tài khoản hiện tại không thể xóa">
                              <Trash2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Xem chi tiết */}
      <AccountDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUserForDetail}
        teacher={selectedTeacherForDetail}
        classes={classes}
        onOpenResetPass={(u) => handleOpenResetPass(u)}
        onOpenEdit={(u) => handleOpenEditUserModal(u)}
        onToggleLock={(u) => handleToggleLock(u)}
      />

      {/* Modal 2: Cập nhật lại mật khẩu */}
      <ResetPasswordModal
        isOpen={isResetPassModalOpen}
        onClose={() => setIsResetPassModalOpen(false)}
        user={userForResetPass}
        onSuccess={(msg) => showMsg(msg)}
      />

      {/* Modal 3: Chỉnh sửa thông tin / Phân quyền */}
      <IssueTeacherAccountModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        existingUser={selectedUserForEdit}
        targetTeacher={selectedTeacherForIssue}
        onSuccess={(msg) => showMsg(msg)}
      />

      {/* Modal 4: Thêm mới tài khoản bằng file Excel */}
      <UserExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={(msg) => showMsg(msg)}
      />

      {/* Modal 5: Xác nhận xóa vĩnh viễn tài khoản */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa vĩnh viễn tài khoản"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản '${deleteCandidate?.name}' (${deleteCandidate?.email}) khỏi hệ thống? Thao tác này sẽ hủy bỏ mọi quyền đăng nhập của người dùng.`}
        confirmLabel="Xóa vĩnh viễn tài khoản"
        confirmVariant="danger"
      />

      {/* Modal 6: Đổi mật khẩu hàng loạt cho toàn bộ giáo viên */}
      {isBatchPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Đổi Mật Khẩu Hàng Loạt</h3>
                  <p className="text-[11px] text-amber-100">Áp dụng cho toàn bộ giáo viên và Ban Giám Hiệu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchPassModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Lưu ý quan trọng:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Thao tác này sẽ thiết lập mật khẩu mới đồng loạt cho <strong>toàn bộ giáo viên</strong> (GVCN, GVBM và BGH). Tài khoản Quản trị (Admin) sẽ được giữ nguyên không bị thay đổi.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mật khẩu mới áp dụng chung <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={batchNewPass}
                    onChange={(e) => setBatchNewPass(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mật khẩu khuyến nghị chuẩn giáo dục: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Giaovien@2026</code>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBatchPassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = batchResetTeacherPasswords(batchNewPass);
                    setIsBatchPassModalOpen(false);
                    showMsg(res.message);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Xác nhận đổi mật khẩu toàn bộ GV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
