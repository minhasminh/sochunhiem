import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  KeyRound,
  Shield,
  Briefcase,
  BookOpen,
  Calendar,
  Phone,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit,
  School,
  AlertTriangle,
} from 'lucide-react';
import { User, TeacherProfile, ClassEntity } from '../../types';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  teacher?: TeacherProfile | null;
  classes: ClassEntity[];
  onOpenResetPass?: (u: User) => void;
  onOpenEdit?: (u: User) => void;
  onToggleLock?: (u: User) => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  teacher,
  classes,
  onOpenResetPass,
  onOpenEdit,
  onToggleLock,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const currentPass = user.plainPassword || user.passwordHash || '123';
  const homeroomClass = user.homeroomClassId
    ? classes.find((c) => c.id === user.homeroomClassId)?.className || teacher?.homeroomClassName
    : teacher?.homeroomClassName;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Avatar initials
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const department = user.department || teacher?.department || 'Chưa phân tổ';
  const subject = user.subject || teacher?.mainSubject || '—';
  const dutyRole =
    user.dutyRole ||
    teacher?.duty ||
    user.title ||
    (user.role === 'ADMIN'
      ? 'Quản trị viên'
      : user.role === 'GVCN'
      ? 'Giáo viên chủ nhiệm'
      : user.role === 'BGH'
      ? 'Phó Hiệu trưởng'
      : 'Giáo viên bộ môn');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">{user.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.status === 'locked'
                      ? 'bg-rose-500/30 text-rose-100 border border-rose-300/40'
                      : user.status === 'pending'
                      ? 'bg-amber-500/30 text-amber-100 border border-amber-300/40'
                      : 'bg-emerald-500/30 text-emerald-100 border border-emerald-300/40'
                  }`}
                >
                  {user.status === 'locked' ? 'Bị khóa' : user.status === 'pending' ? 'Chưa kích hoạt' : 'Đang hoạt động'}
                </span>
              </div>
              <p className="text-xs text-sky-100 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" /> Email đăng nhập (Username):
              </span>
              <div className="font-mono font-bold text-slate-900 flex items-center justify-between">
                <span className="truncate">{user.email}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.email, 'email')}
                  className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"
                  title="Sao chép email"
                >
                  {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Mật khẩu đăng nhập:
              </span>
              <div className="font-mono font-bold text-slate-900 flex items-center justify-between">
                <span>{showPassword ? currentPass : '••••••••'}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Ẩn' : 'Hiện'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentPass, 'pass')}
                    className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer"
                    title="Sao chép mật khẩu"
                  >
                    {copied === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-600" /> Tổ chuyên môn / Bộ phận:
              </span>
              <div className="font-bold text-slate-900">{department}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Bộ môn giảng dạy:
              </span>
              <div className="font-bold text-slate-900">{subject}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Vai trò & Chức danh:
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                  {dutyRole}
                </span>
                <span className="text-slate-500 text-[10px]">({user.role})</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-rose-600" /> Lớp chủ nhiệm phân công:
              </span>
              <div className="font-bold text-slate-900">
                {homeroomClass ? (
                  <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    Lớp {homeroomClass}
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">Không phụ trách chủ nhiệm</span>
                )}
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
            <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-slate-200">
              <Shield className="w-3.5 h-3.5 text-indigo-600" /> Phân quyền hệ thống & Lịch sử
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Số điện thoại:</span>{' '}
                <span className="font-medium text-slate-800">{user.phone || teacher?.phone || 'Chưa có'}</span>
              </div>
              <div>
                <span className="text-slate-400">Mã cán bộ GV:</span>{' '}
                <span className="font-mono text-slate-800">{teacher?.teacherCode || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Ngày tạo tài khoản:</span>{' '}
                <span className="text-slate-800">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '01/08/2026'}</span>
              </div>
              <div>
                <span className="text-slate-400">Lần đăng nhập cuối:</span>{' '}
                <span className="text-slate-800">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                </span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Quyền hạn truy cập:</span>{' '}
              {user.role === 'ADMIN'
                ? 'Toàn quyền cấu hình hệ thống, quản trị tài khoản, sao lưu - khôi phục và kiểm toán.'
                : user.role === 'BGH'
                ? 'Xem toàn bộ sổ chủ nhiệm các lớp toàn trường, duyệt sổ định kỳ và ký duyệt báo cáo.'
                : user.role === 'GVCN'
                ? `Toàn quyền quản lý sổ chủ nhiệm, điểm danh, xếp chỗ và đánh giá học sinh lớp ${homeroomClass || ''}.`
                : 'Xem thời khóa biểu, nhập và theo dõi kết quả học tập bộ môn được phân công giảng dạy.'}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenResetPass && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResetPass(user);
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Đổi mật khẩu
              </button>
            )}

            {onOpenEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(user);
                }}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-sky-600" /> Sửa thông tin / Phân quyền
              </button>
            )}

            {onToggleLock && (
              <button
                type="button"
                onClick={() => {
                  onToggleLock(user);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  user.status === 'locked'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                {user.status === 'locked' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Mở khóa tài khoản
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" /> Khóa tài khoản
                  </>
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
