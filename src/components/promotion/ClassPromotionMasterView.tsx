import React, { useState } from 'react';
import {
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  ShieldAlert,
  FileCheck,
  UserCheck,
  Sparkles,
  School,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassPromotionConfig, PromotionStudentOption } from '../../types';

export const ClassPromotionMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    schoolYears,
    currentClassStudents,
    promoteClassToNewYear,
    isCurrentSchoolYearLocked,
  } = useApp();

  // Target Year and Class
  const [targetYearCode, setTargetYearCode] = useState('2027-2028');
  const [targetClassName, setTargetClassName] = useState('8/1');
  const [targetGrade, setTargetGrade] = useState('8');
  const [targetRoomNumber, setTargetRoomNumber] = useState('Phòng 304 (Dãy B)');
  const [studyShift, setStudyShift] = useState<'Buổi sáng' | 'Buổi chiều' | 'Cả ngày'>('Buổi sáng');

  // Retention Options
  const [keepProfiles, setKeepProfiles] = useState(true);
  const [keepParents, setKeepParents] = useState(true);
  const [keepTalents, setKeepTalents] = useState(true);
  const [keepProgressNotes, setKeepProgressNotes] = useState(false);

  // Student Selection List
  const [studentSelections, setStudentSelections] = useState<PromotionStudentOption[]>(() =>
    currentClassStudents.map((s) => ({
      studentId: s.id,
      studentName: s.fullName,
      gender: s.gender,
      isPromoted: true,
      notes: '',
    }))
  );

  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const promotedCount = studentSelections.filter((s) => s.isPromoted).length;

  const toggleAllStudents = (val: boolean) => {
    setStudentSelections((prev) => prev.map((s) => ({ ...s, isPromoted: val })));
  };

  const toggleStudent = (id: string) => {
    setStudentSelections((prev) =>
      prev.map((s) => (s.studentId === id ? { ...s, isPromoted: !s.isPromoted } : s))
    );
  };

  const handlePromote = () => {
    if (promotedCount === 0) {
      setResultMsg({ type: 'error', text: 'Vui lòng chọn ít nhất 1 học sinh được lên lớp.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const config: ClassPromotionConfig = {
        sourceSchoolYearId: currentSchoolYear.id,
        sourceClassId: currentClass?.id || '',
        targetSchoolYearId: `sy-${targetYearCode}`,
        targetClassName,
        targetGrade,
        targetRoomNumber,
        studyShift,
        keepProfiles,
        keepParents,
        keepTalents,
        keepProgressNotes,
        students: studentSelections,
      };

      const res = promoteClassToNewYear(config);
      if (res.success) {
        setResultMsg({ type: 'success', text: res.message });
      } else {
        setResultMsg({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setResultMsg({ type: 'error', text: 'Lỗi: ' + e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
            <School className="w-3.5 h-3.5" />
            Giai đoạn 10 • Mục 8
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Chuyển Lớp / Lên Lớp Sang Năm Học Mới
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chuyển giao dữ liệu chọn lọc, không sao chép mù toàn bộ. Giáo viên chọn học sinh lên lớp và hồ sơ cần giữ lại.
          </p>
        </div>

        <button
          onClick={handlePromote}
          disabled={isSubmitting || promotedCount === 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          {isSubmitting ? 'Đang chuyển...' : `Xác nhận chuyển ${promotedCount} học sinh`}
        </button>
      </div>

      {resultMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            resultMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {resultMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{resultMsg.text}</span>
        </div>
      )}

      {/* Grid: Source vs Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Class */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Lớp học hiện tại (Nguồn)
          </div>
          <div className="text-base font-black text-slate-900">
            Lớp {currentClass?.className} • Khối {currentClass?.grade}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>Niên khóa: <span className="font-semibold text-slate-800">{currentSchoolYear.name}</span></div>
            <div>Sĩ số hiện tại: <span className="font-semibold text-slate-800">{currentClassStudents.length} học sinh</span></div>
            <div>GVCN: <span className="font-semibold text-slate-800">{currentClass?.homeroomTeacherName}</span></div>
          </div>
        </div>

        {/* Target Class Setup */}
        <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-200/80 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
            <School className="w-4 h-4 text-sky-600" />
            Thiết lập năm học & Lớp mới (Đích)
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm học đích:</label>
              <input
                type="text"
                value={targetYearCode}
                onChange={(e) => setTargetYearCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên lớp mới:</label>
              <input
                type="text"
                value={targetClassName}
                onChange={(e) => setTargetClassName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Khối lớp mới:</label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phòng học:</label>
              <input
                type="text"
                value={targetRoomNumber}
                onChange={(e) => setTargetRoomNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Options: Which profiles to keep */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-sky-600" />
          Tùy chọn bảo lưu hồ sơ khi sang năm học mới:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={keepProfiles}
              onChange={(e) => setKeepProfiles(e.target.checked)}
              className="rounded-sm text-sky-600"
            />
            <span className="font-semibold text-slate-700">Lý lịch cá nhân</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={keepParents}
              onChange={(e) => setKeepParents(e.target.checked)}
              className="rounded-sm text-sky-600"
            />
            <span className="font-semibold text-slate-700">Thông tin phụ huynh</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={keepTalents}
              onChange={(e) => setKeepTalents(e.target.checked)}
              className="rounded-sm text-sky-600"
            />
            <span className="font-semibold text-slate-700">Hồ sơ năng khiếu</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={keepProgressNotes}
              onChange={(e) => setKeepProgressNotes(e.target.checked)}
              className="rounded-sm text-sky-600"
            />
            <span className="font-semibold text-slate-700">Nhật ký theo dõi cũ</span>
          </label>
        </div>
      </div>

      {/* Student Checklist Selection Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Danh sách học sinh được xét lên lớp ({promotedCount}/{studentSelections.length} em):
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAllStudents(true)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
            >
              Chọn tất cả
            </button>
            <button
              onClick={() => toggleAllStudents(false)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-2xl custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
              <tr>
                <th className="p-2.5 w-12 text-center">Lên lớp</th>
                <th className="p-2.5 w-12 text-center">STT</th>
                <th className="p-2.5">Họ và tên học sinh</th>
                <th className="p-2.5 w-20">Giới tính</th>
                <th className="p-2.5">Ghi chú (chuyển trường, lưu ban nếu có)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentSelections.map((st, idx) => (
                <tr
                  key={st.studentId}
                  className={`hover:bg-slate-50 transition-colors ${
                    st.isPromoted ? '' : 'bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <td className="p-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={st.isPromoted}
                      onChange={() => toggleStudent(st.studentId)}
                      className="rounded-sm text-emerald-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{st.studentName}</td>
                  <td className="p-2.5">{st.gender}</td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      placeholder="Ghi chú chuyển tiếp..."
                      value={st.notes || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentSelections((prev) =>
                          prev.map((item) =>
                            item.studentId === st.studentId ? { ...item, notes: val } : item
                          )
                        );
                      }}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-hidden py-0.5 text-xs text-slate-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
