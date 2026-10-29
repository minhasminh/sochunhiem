import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Shield,
  UserCheck,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  School,
  Lock,
  Mail,
  User as UserIcon,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  TeacherProfile,
  UserRole,
  User,
  DutyRole,
  AccountStatus,
  DEPARTMENT_OPTIONS,
  SUBJECT_OPTIONS,
  DUTY_ROLE_OPTIONS,
} from '../../types';

interface IssueTeacherAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTeacher?: TeacherProfile | null;
  existingUser?: User | null;
  onSuccess?: (msg: string) => void;
}

export const IssueTeacherAccountModal: React.FC<IssueTeacherAccountModalProps> = ({
  isOpen,
  onClose,
  targetTeacher,
  existingUser,
  onSuccess,
}) => {
  const {
    teachers,
    classes,
    currentSchoolYear,
    users,
    addUserAccount,
    updateUserAccount,
  } = useApp();

  const isEditMode = !!existingUser;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    targetTeacher?.id || existingUser?.teacherId || ''
  );
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [department, setDepartment] = useState<string>('Tổ khoa học tự nhiên');
  const [subject, setSubject] = useState<string>('Toán');
  const [dutyRole, setDutyRole] = useState<DutyRole>('Giáo viên bộ môn');
  const [homeroomClassId, setHomeroomClassId] = useState<string>('');
  const [status, setStatus] = useState<AccountStatus>('active');
  const [password, setPassword] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Gv@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  // Populate data when opening modal
  useEffect(() => {
    if (!isOpen) return;

    if (existingUser) {
      const linkedTeacher = teachers.find((t) => t.id === existingUser.teacherId);
      setSelectedTeacherId(existingUser.teacherId || '');
      setFullName(existingUser.name || linkedTeacher?.fullName || '');
      setEmail(existingUser.email || '');
      setUsername(existingUser.username || existingUser.email || '');
      setDepartment(
        existingUser.department ||
        linkedTeacher?.department ||
        'Tổ khoa học tự nhiên'
      );
      setSubject(
        existingUser.subject ||
        linkedTeacher?.mainSubject ||
        'Toán'
      );
      setDutyRole(
        (existingUser.dutyRole as DutyRole) ||
        (existingUser.role === 'ADMIN'
          ? 'Quản trị viên'
          : existingUser.role === 'BGH'
          ? 'Phó Hiệu trưởng'
          : existingUser.role === 'GVCN'
          ? 'Giáo viên chủ nhiệm'
          : 'Giáo viên bộ môn')
      );
      setHomeroomClassId(existingUser.homeroomClassId || linkedTeacher?.homeroomClassId || '');
      setStatus((existingUser.status as AccountStatus) || 'active');
      setPassword(existingUser.plainPassword || existingUser.passwordHash || '123');
      setPhone(existingUser.phone || linkedTeacher?.phone || '');
      setErrorMsg(null);
      return;
    }

    const t = targetTeacher || teachers.find((item) => item.id === selectedTeacherId) || teachers[0];
    if (t) {
      setSelectedTeacherId(t.id);
      setFullName(t.fullName);
      const initialEmail = t.email || `${t.teacherCode.toLowerCase()}@nguyendinhanh.edu.vn`;
      setEmail(initialEmail);
      setUsername(initialEmail);
      setDepartment(t.department || 'Tổ khoa học tự nhiên');
      setSubject(t.mainSubject || 'Toán');
      setDutyRole(
        t.duty?.includes('Quản trị')
          ? 'Quản trị viên'
          : t.duty?.includes('Hiệu trưởng')
          ? 'Hiệu trưởng'
          : t.duty?.includes('Phó Hiệu trưởng')
          ? 'Phó Hiệu trưởng'
          : t.isHomeroom
          ? 'Giáo viên chủ nhiệm'
          : 'Giáo viên bộ môn'
      );
      setHomeroomClassId(t.homeroomClassId || '');
      setStatus('active');
      setPassword('123');
      setPhone(t.phone || '');
      setErrorMsg(null);
    }
  }, [isOpen, existingUser, targetTeacher]);

  const mapDutyRoleToSystemRole = (duty: DutyRole): UserRole => {
    if (duty === 'Quản trị viên') return 'ADMIN';
    if (duty === 'Hiệu trưởng' || duty === 'Phó Hiệu trưởng') return 'BGH';
    if (duty === 'Giáo viên chủ nhiệm') return 'GVCN';
    if (duty === 'Nhân viên') return 'GIÁO VIÊN';
    return 'GIÁO VIÊN';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setErrorMsg('Vui lòng nhập họ và tên!');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email đăng nhập!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Địa chỉ email không đúng định dạng (Ví dụ: tengv@domain.com)!');
      return;
    }

    const cleanPass = password.trim();
    if (!cleanPass) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản!');
      return;
    }

    const systemRole = mapDutyRoleToSystemRole(dutyRole);
    const cleanUsername = cleanEmail; // Email dùng làm tên đăng nhập

    if (isEditMode && existingUser) {
      const res = updateUserAccount(existingUser.id, {
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        newPassword: cleanPass,
        role: systemRole,
        dutyRole: dutyRole,
        department: department,
        subject: subject,
        homeroomClassId: dutyRole === 'Giáo viên chủ nhiệm' ? homeroomClassId : undefined,
        status: status,
        phone: phone.trim(),
        title: dutyRole,
      });

      if (res.success) {
        onSuccess?.(`Cập nhật thông tin và phân quyền tài khoản '${cleanName}' thành công!`);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = addUserAccount({
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        password: cleanPass,
        role: systemRole,
        title: dutyRole,
        phone: phone.trim(),
        teacherId: selectedTeacherId || undefined,
        homeroomClassId: dutyRole === 'Giáo viên chủ nhiệm' ? homeroomClassId : undefined,
      });

      if (res.success) {
        // Also update the created user with department, subject, dutyRole
        if (res.user) {
          updateUserAccount(res.user.id, {
            department,
            subject,
            dutyRole,
            status,
          });
        }
        onSuccess?.(`Cấp tài khoản mới cho '${cleanName}' (${cleanEmail}) thành công!`);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  if (!isOpen) return null;

  const activeClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEditMode ? 'Chỉnh Sửa Thông Tin & Phân Quyền Tài Khoản' : 'Cấp Mới Quyền Đăng Nhập Tài Khoản'}
              </h3>
              <p className="text-xs text-sky-100">Cấu trúc chuẩn hóa: Họ tên, Email, Tổ, Bộ môn, Vai trò & Trạng thái</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">{errorMsg}</div>
            </div>
          )}

          {/* Row 1: Họ và tên & Email (dùng làm tên đăng nhập) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Sung"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email (Dùng làm tên đăng nhập) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().trim();
                    setEmail(val);
                    setUsername(val);
                  }}
                  placeholder="nvsung_loi2.thqdien@hue.edu.vn"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Tổ chuyên môn/bộ phận & Bộ môn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tổ chuyên môn / bộ phận <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                {DEPARTMENT_OPTIONS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Bộ môn giảng dạy <span className="text-rose-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Vai trò & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Vai trò (Role) <span className="text-rose-500">*</span>
              </label>
              <select
                value={dutyRole}
                onChange={(e) => setDutyRole(e.target.value as DutyRole)}
                className="w-full px-3 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
              >
                {DUTY_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Trạng thái tài khoản <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="active">🟢 Đang hoạt động (Hoạt động)</option>
                <option value="pending">🟡 Chưa kích hoạt</option>
                <option value="locked">🔴 Bị khóa</option>
              </select>
            </div>
          </div>

          {/* Lớp chủ nhiệm nếu là GVCN */}
          {dutyRole === 'Giáo viên chủ nhiệm' && (
            <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2 animate-fade-in">
              <label className="block font-bold text-sky-950 mb-1">
                Lớp chủ nhiệm phân công:
              </label>
              <select
                value={homeroomClassId}
                onChange={(e) => setHomeroomClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl font-bold text-sky-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Chọn lớp chủ nhiệm --</option>
                {activeClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.className} (Khối {c.grade})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-sky-700">
                Tài khoản GVCN sẽ có toàn quyền lập kế hoạch, điểm danh và quản lý học sinh cho lớp này.
              </p>
            </div>
          )}

          {/* Row 4: Mật khẩu & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mật khẩu đăng nhập <span className="text-rose-500">*</span></span>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-sky-600 hover:text-sky-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Ngẫu nhiên
                </button>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mặc định: 123"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0905.123.456"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Lưu thay đổi & Phân quyền' : 'Xác nhận cấp tài khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
