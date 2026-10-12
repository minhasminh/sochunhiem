import React from 'react';
import { Shield, Eye, Settings, UserCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RoleBanner: React.FC = () => {
  const { currentUser, currentClass, isCurrentSchoolYearLocked, setActiveMenu } = useApp();

  if (!currentUser) return null;

  if (currentUser.role === 'ADMIN') {
    return (
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-300" />
            ADMIN QUẢN TRỊ
          </span>
          <span className="text-purple-100">
            Đang đăng nhập quyền <strong>Quản trị viên hệ thống</strong>: Toàn quyền cấu hình niên khóa, quản lý danh mục lớp, sao lưu CSDL và phân quyền giáo viên.
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveMenu('settings')}
            className="px-2.5 py-1 rounded-lg bg-purple-700/60 hover:bg-purple-600 text-purple-100 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3" /> Cài đặt & Phân quyền
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'BGH') {
    return (
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white px-4 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3 text-amber-300" />
            BAN GIÁM HIỆU
          </span>
          <span className="text-amber-100">
            Chế độ <strong>Giám sát & Ký duyệt (Chỉ xem)</strong>: Xem dữ liệu toàn trường, đối soát báo cáo, chốt khóa sổ học kỳ. Dữ liệu lớp học được bảo vệ chống sửa đổi trực tiếp.
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveMenu('reports')}
            className="px-2.5 py-1 rounded-lg bg-amber-700/60 hover:bg-amber-600 text-amber-100 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            Duyệt sổ & Báo cáo
          </button>
        </div>
      </div>
    );
  }

  const isMyClass = currentClass && currentClass.homeroomTeacherId === currentUser.id;

  return (
    <div className={`px-4 py-1.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${
      isMyClass
        ? 'bg-sky-50 text-sky-950 border-sky-200'
        : 'bg-slate-100 text-slate-800 border-slate-200'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
          isMyClass
            ? 'bg-sky-600 text-white'
            : 'bg-slate-300 text-slate-700'
        }`}>
          <UserCheck className="w-3 h-3" />
          GVCN: {currentUser.name}
        </span>
        <span>
          {isMyClass ? (
            <>
              Bạn đang chủ nhiệm lớp <strong>{currentClass?.className}</strong>. Có toàn quyền quản lý hồ sơ, điểm danh, nề nếp và nhận xét học sinh.
            </>
          ) : (
            <>
              Lớp <strong>{currentClass?.className}</strong> thuộc phân công của GVCN <strong>{currentClass?.homeroomTeacherName}</strong>. Bạn đang ở chế độ <strong>Chỉ xem</strong>.
            </>
          )}
        </span>
      </div>
      {isCurrentSchoolYearLocked && (
        <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px] self-start sm:self-auto">
          <AlertTriangle className="w-3 h-3" /> Năm học đã khóa dữ liệu
        </span>
      )}
    </div>
  );
};
