import React, { useState } from 'react';
import {
  X,
  Printer,
  Shield,
  Check,
  Calendar,
  School,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, TeacherProfile } from '../../types';

interface PrintTeacherCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser?: User | null;
}

export const PrintTeacherCredentialsModal: React.FC<PrintTeacherCredentialsModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
}) => {
  const { users, teachers, classes, school, currentSchoolYear } = useApp();

  const [filterMode, setFilterMode] = useState<'selected' | 'all' | 'gvcn'>('all');

  if (!isOpen) return null;

  // Filter list of users to print
  const usersToPrint = (() => {
    if (selectedUser) return [selectedUser];
    if (filterMode === 'gvcn') return users.filter((u) => u.role === 'GVCN');
    return users.filter((u) => u.role !== 'ADMIN' || users.length <= 1);
  })();

  const handlePrint = () => {
    window.print();
  };

  const getTeacherInfo = (u: User): TeacherProfile | undefined => {
    return teachers.find((t) => t.id === u.teacherId || (u.email && t.email === u.email));
  };

  const getClassName = (u: User): string => {
    if (!u.homeroomClassId) return '';
    const cls = classes.find((c) => c.id === u.homeroomClassId);
    return cls ? cls.className : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">In Phiếu Bàn Giao Tài Khoản & Mật Khẩu</h3>
              <p className="text-xs text-slate-300">
                Xuất phiếu cấp tài khoản bàn giao có chữ ký cho cán bộ, giáo viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedUser && (
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-hidden"
              >
                <option value="all" className="text-slate-900">In toàn bộ giáo viên ({users.length})</option>
                <option value="gvcn" className="text-slate-900">Chỉ in GVCN ({users.filter((u) => u.role === 'GVCN').length})</option>
              </select>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Bấm để In (Print)
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slips Content */}
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50 print:bg-white print:p-0">
          <div className="text-xs text-slate-500 italic print:hidden text-center pb-2 border-b border-slate-200">
            Xem trước bản in phiếu bàn giao. Nhấn nút <strong>"Bấm để In"</strong> ở trên để in hoặc lưu ra file PDF.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:text-black">
            {usersToPrint.map((u, idx) => {
              const teacher = getTeacherInfo(u);
              const className = getClassName(u) || teacher?.homeroomClassName;

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-5 space-y-3.5 shadow-xs relative print:shadow-none print:border-slate-400 print:page-break-inside-avoid"
                >
                  {/* Voucher Header */}
                  <div className="border-b border-slate-200 pb-2.5 flex items-start justify-between text-[11px]">
                    <div>
                      <div className="font-bold uppercase text-slate-800 tracking-tight text-[10px]">
                        {school.districtAuthority}
                      </div>
                      <div className="font-black text-purple-900 uppercase text-xs">
                        {school.name}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <div>Năm học: <strong>{currentSchoolYear.name}</strong></div>
                      <div className="font-mono">Số: {String(idx + 1).padStart(3, '0')}/PGV</div>
                    </div>
                  </div>

                  {/* Voucher Title */}
                  <div className="text-center space-y-0.5">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                      PHIẾU BÀN GIAO TÀI KHOẢN HỆ THỐNG
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Phần mềm Sổ Chủ Nhiệm Điện Tử THCS
                    </p>
                  </div>

                  {/* Teacher & Account Info Table */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Họ và tên giáo viên:</span>
                        <strong className="text-slate-900">{u.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Mã giáo viên:</span>
                        <strong className="text-slate-700 font-mono">
                          {teacher?.teacherCode || 'GV-CNTT'}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Tổ chuyên môn:</span>
                        <span className="text-slate-800 font-medium">
                          {teacher?.department || 'Chung'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Nhiệm vụ / Vai trò:</span>
                        <span className="font-bold text-purple-900">
                          {u.role === 'GVCN'
                            ? `GVCN Lớp ${className || ''}`
                            : u.role === 'BGH'
                            ? 'Ban Giám Hiệu'
                            : u.role === 'ADMIN'
                            ? 'Quản trị viên'
                            : 'Giáo viên bộ môn'}
                        </span>
                      </div>
                    </div>

                    {/* Login Credentials Box */}
                    <div className="bg-white p-2.5 rounded-lg border border-purple-200 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Tên đăng nhập (Email cá nhân):</span>
                        <span className="font-mono font-black text-purple-900 text-sm">
                          {u.username}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Mật khẩu khởi tạo:</span>
                        <span className="font-mono font-black text-emerald-700 text-sm">
                          {u.plainPassword || u.passwordHash || '123'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Instructions */}
                  <div className="text-[10px] text-slate-500 space-y-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <div className="font-bold text-amber-900 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-700" /> Lưu ý bảo mật bắt buộc:
                    </div>
                    <ul className="list-disc pl-3.5 space-y-0.5 text-amber-950">
                      <li>Yêu cầu đổi mật khẩu ngay sau lần đăng nhập đầu tiên vào hệ thống.</li>
                      <li>Tuyệt đối không chia sẻ tài khoản cho học sinh hoặc người ngoài nhà trường.</li>
                    </ul>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-2 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600">
                    <div>
                      <div className="font-bold text-slate-800 uppercase">NGƯỜI BÀN GIAO</div>
                      <div className="text-[9px] text-slate-400 italic">(Admin / Tổ CNTT)</div>
                      <div className="h-10"></div>
                      <div className="font-semibold text-slate-800">Quản trị viên hệ thống</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 uppercase">NGƯỜI NHẬN TÀI KHOẢN</div>
                      <div className="text-[9px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
                      <div className="h-10"></div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {usersToPrint.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Không có tài khoản nào phù hợp với bộ lọc in.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
