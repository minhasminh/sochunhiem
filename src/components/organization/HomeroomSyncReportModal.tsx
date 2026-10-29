import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldCheck,
  Users,
  School,
  ArrowRight,
} from 'lucide-react';
import { HomeroomSyncResult } from '../../types';

interface HomeroomSyncReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HomeroomSyncResult | null;
}

export const HomeroomSyncReportModal: React.FC<HomeroomSyncReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen || !report) return null;

  const hasConflicts = report.conflicts.length > 0;
  const hasUnassigned = report.unassignedClasses.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kết Quả Đồng Bộ Phân Công GVCN
              </h3>
              <p className="text-xs text-slate-500">
                Kiểm tra tính nhất quán giữa Lớp học, Hồ sơ GV và Tài khoản phân quyền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 space-y-1">
            <div className="font-bold">Đồng bộ hai chiều dữ liệu thành công!</div>
            <div className="text-emerald-800 leading-relaxed">{report.message}</div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tổng số lớp
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {report.totalClasses}
            </span>
            <span className="text-[10px] text-slate-500">Toàn trường</span>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
              Lớp chuẩn hóa
            </span>
            <span className="text-xl font-black text-sky-900 mt-1 block">
              {report.syncedClassesCount}
            </span>
            <span className="text-[10px] text-sky-600">Đã khớp ID/Tên</span>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
              Hồ sơ GVCN
            </span>
            <span className="text-xl font-black text-purple-900 mt-1 block">
              {report.updatedTeachersCount}
            </span>
            <span className="text-[10px] text-purple-600">Cập nhật chức vụ</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Tài khoản
            </span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              {report.updatedUsersCount}
            </span>
            <span className="text-[10px] text-emerald-600">Gán quyền GVCN</span>
          </div>
        </div>

        {/* Warnings or Unassigned if any */}
        {hasUnassigned && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Lớp học chưa được phân công GVCN ({report.unassignedClasses.length} lớp):
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {report.unassignedClasses.map((cName) => (
                <span
                  key={cName}
                  className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold"
                >
                  Lớp {cName}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasConflicts && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Cảnh báo phân công trùng lặp:
            </div>
            <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
              {report.conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Checkpoints */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="font-bold text-slate-700">Trạng thái xác thực toàn vẹn:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Khóa ngoại `homeroomTeacherId` khớp `teacher.id`</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tên GVCN hiển thị khớp với hồ sơ nhân sự</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Chức vụ `isHomeroom` & `duty` cập nhật tự động</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tài khoản đăng nhập được đồng bộ quyền GVCN</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 text-right">
            Thời điểm thực thi: {report.timestamp}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 cursor-pointer transition-colors"
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};
