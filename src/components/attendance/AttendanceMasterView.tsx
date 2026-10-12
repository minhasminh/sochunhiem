import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Filter,
  Save,
  Printer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceSession, AttendanceStatus, Student } from '../../types';

export const AttendanceMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    attendanceRecords,
    saveBatchAttendance,
    markAllPresent,
    currentUser,
    setSelectedStudent,
    setActiveMenu,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Sub-tabs: 'daily' (Điểm danh hàng ngày) | 'stats' (Thống kê chuyên cần) | 'alerts' (Cảnh báo chuyên cần)
  const [activeTab, setActiveTab] = useState<'daily' | 'stats' | 'alerts'>('daily');

  // Controls for Daily Attendance
  const todayStr = '2026-10-06'; // Oct 6, 2026 (matching demo academic date)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('Sáng');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Cả buổi');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');

  // Local draft state for the selected date & session
  // Maps studentId -> { status: AttendanceStatus, notes: string }
  const existingRecordsForSession = useMemo(() => {
    return attendanceRecords.filter(
      (r) =>
        r.date === selectedDate &&
        r.session === selectedSession &&
        (r.period || 'Cả buổi') === (selectedPeriod || 'Cả buổi') &&
        r.classId === (currentClass?.id || 'class-7-1')
    );
  }, [attendanceRecords, selectedDate, selectedSession, selectedPeriod, currentClass]);

  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    currentClassStudents.forEach((st) => {
      const found = existingRecordsForSession.find((r) => r.studentId === st.id);
      initial[st.id] = {
        status: found ? found.status : 'Có mặt',
        notes: found?.notes || '',
      };
    });
    return initial;
  });

  // Re-sync draft when date or session or existing records change
  React.useEffect(() => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    currentClassStudents.forEach((st) => {
      const found = existingRecordsForSession.find((r) => r.studentId === st.id);
      updated[st.id] = {
        status: found ? found.status : 'Có mặt',
        notes: found?.notes || '',
      };
    });
    setAttendanceDraft(updated);
  }, [existingRecordsForSession, currentClassStudents]);

  const [saveToast, setSaveToast] = useState(false);

  // Status cycling or setting
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
  };

  const setStudentNotes = (studentId: string, notes: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Có mặt' }),
        notes,
      },
    }));
  };

  // Quick Action 1: "Tất cả có mặt"
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    currentClassStudents.forEach((st) => {
      updated[st.id] = {
        status: 'Có mặt',
        notes: '',
      };
    });
    setAttendanceDraft(updated);
  };

  // Save current sheet
  const handleSaveAttendance = () => {
    const records = currentClassStudents.map((st) => ({
      studentId: st.id,
      status: attendanceDraft[st.id]?.status || 'Có mặt',
      notes: attendanceDraft[st.id]?.notes || '',
    }));
    saveBatchAttendance(selectedDate, selectedSession, selectedPeriod, records);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Filter students for display
  const displayedStudents = currentClassStudents.filter((st) => {
    if (filterGroup !== 'all' && st.groupNumber !== filterGroup) return false;
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase().trim();
      return (
        st.fullName.toLowerCase().includes(q) ||
        st.studentCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate stats for current draft sheet
  const draftPresent = Object.values(attendanceDraft).filter((v) => v.status === 'Có mặt').length;
  const draftExcused = Object.values(attendanceDraft).filter((v) => v.status === 'Nghỉ có phép').length;
  const draftUnexcused = Object.values(attendanceDraft).filter((v) => v.status === 'Nghỉ không phép').length;
  const draftLate = Object.values(attendanceDraft).filter((v) => v.status === 'Đi muộn').length;
  const draftEarly = Object.values(attendanceDraft).filter((v) => v.status === 'Về sớm').length;

  // ================= AGGREGATED STATISTICS (Toàn bộ các buổi đã ghi nhận) =================
  const classRecords = useMemo(() => {
    return attendanceRecords.filter((r) => r.classId === (currentClass?.id || 'class-7-1'));
  }, [attendanceRecords, currentClass]);

  // Unique session keys: "YYYY-MM-DD_Session_Period"
  const totalRecordedSessions = useMemo(() => {
    const set = new Set(classRecords.map((r) => `${r.date}_${r.session}_${r.period || 'Cả buổi'}`));
    return Math.max(set.size, 1);
  }, [classRecords]);

  const studentStats = useMemo(() => {
    return currentClassStudents.map((st) => {
      const stRecords = classRecords.filter((r) => r.studentId === st.id);
      const presentCount = stRecords.filter((r) => r.status === 'Có mặt').length;
      const excusedCount = stRecords.filter((r) => r.status === 'Nghỉ có phép').length;
      const unexcusedCount = stRecords.filter((r) => r.status === 'Nghỉ không phép').length;
      const lateCount = stRecords.filter((r) => r.status === 'Đi muộn').length;
      const earlyCount = stRecords.filter((r) => r.status === 'Về sớm').length;
      const totalAbsences = excusedCount + unexcusedCount;
      const sessionCount = stRecords.length || totalRecordedSessions;
      const attendanceRate =
        sessionCount > 0 ? Math.round(((sessionCount - totalAbsences) / sessionCount) * 100) : 100;

      return {
        student: st,
        presentCount,
        excusedCount,
        unexcusedCount,
        lateCount,
        earlyCount,
        totalAbsences,
        attendanceRate,
      };
    });
  }, [currentClassStudents, classRecords, totalRecordedSessions]);

  // Class overview statistics
  const totalClassAbsences = useMemo(
    () => studentStats.reduce((sum, s) => sum + s.totalAbsences, 0),
    [studentStats]
  );
  const totalClassUnexcused = useMemo(
    () => studentStats.reduce((sum, s) => sum + s.unexcusedCount, 0),
    [studentStats]
  );
  const totalClassLate = useMemo(
    () => studentStats.reduce((sum, s) => sum + s.lateCount, 0),
    [studentStats]
  );

  const averageClassRate = useMemo(() => {
    if (studentStats.length === 0) return 100;
    const sumRates = studentStats.reduce((acc, curr) => acc + curr.attendanceRate, 0);
    return Math.round(sumRates / studentStats.length);
  }, [studentStats]);

  // Frequent absence students (>= 2 absences or any unexcused absence)
  const frequentAbsenceStudents = useMemo(() => {
    return studentStats.filter((s) => s.totalAbsences >= 2 || s.unexcusedCount > 0);
  }, [studentStats]);

  // Attendance Warnings / Alerts per Section 5
  const attendanceAlerts = useMemo(() => {
    const list: {
      studentId: string;
      studentName: string;
      type: string;
      message: string;
      severity: 'danger' | 'warning' | 'info';
    }[] = [];

    studentStats.forEach((s) => {
      if (s.unexcusedCount > 0) {
        list.push({
          studentId: s.student.id,
          studentName: s.student.fullName,
          type: 'nghỉ không phép',
          message: `Đã có ${s.unexcusedCount} buổi nghỉ không phép. Cần phối hợp với phụ huynh tìm hiểu nguyên nhân.`,
          severity: 'danger',
        });
      }
      if (s.totalAbsences >= 2) {
        list.push({
          studentId: s.student.id,
          studentName: s.student.fullName,
          type: 'nghỉ nhiều',
          message: `Tổng số buổi nghỉ là ${s.totalAbsences} buổi (${s.excusedCount} có phép, ${s.unexcusedCount} không phép). Tỷ lệ chuyên cần hiện tại: ${s.attendanceRate}%.`,
          severity: 'warning',
        });
      }
      if (s.lateCount >= 1) {
        list.push({
          studentId: s.student.id,
          studentName: s.student.fullName,
          type: 'đi muộn',
          message: `Ghi nhận ${s.lateCount} lần đi học muộn giờ truy bài. Nhắc nhở nghiêm túc giờ giấc.`,
          severity: 'info',
        });
      }
    });

    return list;
  }, [studentStats]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Hub */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  THEO DÕI ĐIỂM DANH & CHUYÊN CẦN LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {currentClassStudents.length} học sinh
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Chuyên cần: {averageClassRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Điểm danh hàng ngày, theo dõi học sinh nghỉ có phép, không phép, đi muộn, về sớm
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveMenu('reports')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Xem báo cáo chuyên cần toàn lớp"
          >
            <FileText className="w-4 h-4" />
            Xem Báo Cáo
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="In sổ theo dõi điểm danh khổ A4"
          >
            <Printer className="w-4 h-4" />
            In sổ điểm danh
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('daily')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Điểm Danh Hàng Ngày</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>2. Thống Kê Chuyên Cần</span>
            {totalClassAbsences > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                {totalClassAbsences}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Cảnh Báo Chuyên Cần</span>
            {attendanceAlerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                {attendanceAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ĐIỂM DANH HÀNG NGÀY ================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Controls: Date, Session, Period & Quick Mark All Present */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* 1. Chọn ngày */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn ngày điểm danh:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] shrink-0"
                    title="Trở về hôm nay"
                  >
                    Hôm nay
                  </button>
                </div>
              </div>

              {/* 2. Chọn buổi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Buổi học:</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value as AttendanceSession)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                >
                  <option value="Sáng">Buổi Sáng</option>
                  <option value="Chiều">Buổi Chiều</option>
                  <option value="Cả ngày">Cả Ngày</option>
                </select>
              </div>

              {/* 3. Chọn tiết nếu cần */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiết học:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                >
                  <option value="Cả buổi">Cả buổi học</option>
                  <option value="Tiết 1">Tiết 1 (Truy bài / Tiết đầu)</option>
                  <option value="Tiết 2">Tiết 2</option>
                  <option value="Tiết 3">Tiết 3</option>
                  <option value="Tiết 4">Tiết 4</option>
                  <option value="Tiết 5">Tiết 5 (Tiết cuối)</option>
                </select>
              </div>

              {/* 4. Quick Button "TẤT CẢ CÓ MẶT" (Bắt buộc theo Mục 1) */}
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="w-full p-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  title="Điểm danh nhanh: Đánh dấu tất cả học sinh đều Có mặt"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  "Tất cả có mặt"
                </button>
              </div>
            </div>

            {/* Sub-bar: Search, Filter & Summary counters */}
            <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên, mã học sinh..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs w-52"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 pl-1.5">Tổ:</span>
                  {(['all', 1, 2, 3, 4] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilterGroup(g)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        filterGroup === g ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {g === 'all' ? 'Tất cả' : `Tổ ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Counters Pill */}
              <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Có mặt: {draftPresent}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Nghỉ phép: {draftExcused}
                </span>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Không phép: {draftUnexcused}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> Đi muộn: {draftLate}
                </span>
                {draftEarly > 0 && (
                  <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl flex items-center gap-1">
                    Về sớm: {draftEarly}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Danh Sách Điểm Danh: Ngày {selectedDate} ({selectedSession} • {selectedPeriod})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bấm nút trạng thái để điều chỉnh cho từng học sinh, ghi chú lý do nếu có
                </p>
              </div>

              {isAuthorized && (
                <div className="flex items-center gap-2">
                  {saveToast && (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Lưu điểm danh
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3 w-24">Mã HS</th>
                    <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                    <th className="py-3 px-2 text-center w-16">Tổ</th>
                    <th className="py-3 px-3 min-w-[360px]">Trạng thái điểm danh (Chọn nhanh)</th>
                    <th className="py-3 px-3 min-w-[200px]">Ghi chú (Lý do / Giờ đến)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((st, idx) => {
                    const currentDraft = attendanceDraft[st.id] || {
                      status: 'Có mặt',
                      notes: '',
                    };
                    const status = currentDraft.status;

                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          status === 'Nghỉ không phép'
                            ? 'bg-rose-50/40'
                            : status === 'Nghỉ có phép'
                            ? 'bg-amber-50/40'
                            : status === 'Đi muộn'
                            ? 'bg-purple-50/40'
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {st.stt || idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {st.studentCode}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(st)}
                            className="text-left hover:text-sky-700 hover:underline"
                            title="Xem hồ sơ học sinh"
                          >
                            {st.fullName}
                          </button>
                          {st.needsSupport && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-sm text-[9px] bg-rose-100 text-rose-800 font-bold">
                              Hỗ trợ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-600">
                          Tổ {st.groupNumber}
                        </td>

                        {/* Interactive Status Buttons (Có mặt, Nghỉ có phép, Nghỉ không phép, Đi muộn, Về sớm) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setStudentStatus(st.id, 'Có mặt')}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                status === 'Có mặt'
                                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                            </button>

                            <button
                              type="button"
                              onClick={() => setStudentStatus(st.id, 'Nghỉ có phép')}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                status === 'Nghỉ có phép'
                                  ? 'bg-amber-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" /> Có phép
                            </button>

                            <button
                              type="button"
                              onClick={() => setStudentStatus(st.id, 'Nghỉ không phép')}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                status === 'Nghỉ không phép'
                                  ? 'bg-rose-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Không phép
                            </button>

                            <button
                              type="button"
                              onClick={() => setStudentStatus(st.id, 'Đi muộn')}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                status === 'Đi muộn'
                                  ? 'bg-purple-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" /> Đi muộn
                            </button>

                            <button
                              type="button"
                              onClick={() => setStudentStatus(st.id, 'Về sớm')}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                status === 'Về sớm'
                                  ? 'bg-sky-600 text-white shadow-xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                              }`}
                            >
                              <LogOut className="w-3.5 h-3.5" /> Về sớm
                            </button>
                          </div>
                        </td>

                        {/* Notes input */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Ghi chú lý do..."
                            value={currentDraft.notes}
                            onChange={(e) => setStudentNotes(st.id, e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            {isAuthorized && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Đã kiểm tra {displayedStudents.length} học sinh. Bấm "Lưu điểm danh" để cập nhật dữ liệu vào sổ.
                </span>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu điểm danh ngày {selectedDate}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: THỐNG KÊ CHUYÊN CẦN ================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Cards (Theo lớp per Mục 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tỷ Lệ Chuyên Cần Toàn Lớp
              </div>
              <div className="text-2xl font-black text-emerald-600">{averageClassRate}%</div>
              <div className="text-xs text-slate-500">
                Đạt chỉ tiêu kế hoạch năm học ({currentSchoolYear.code})
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tổng Lượt Nghỉ Học
              </div>
              <div className="text-2xl font-black text-amber-600">{totalClassAbsences} lượt</div>
              <div className="text-xs text-slate-500">
                Gồm có phép và không phép
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Nghỉ Không Phép
              </div>
              <div className="text-2xl font-black text-rose-600">{totalClassUnexcused} lượt</div>
              <div className="text-xs text-rose-700 font-medium">
                Cần chấn chỉnh ngay nề nếp
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tổng Lượt Đi Muộn
              </div>
              <div className="text-2xl font-black text-purple-600">{totalClassLate} lượt</div>
              <div className="text-xs text-slate-500">
                Được cán sự sao đỏ ghi nhận
              </div>
            </div>
          </div>

          {/* Danh sách học sinh nghỉ nhiều (Theo lớp per Mục 2) */}
          {frequentAbsenceStudents.length > 0 && (
            <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-amber-900">
                  Học Sinh Cần Lưu Ý Nghỉ Nhiều Hoặc Có Nghỉ Không Phép ({frequentAbsenceStudents.length} học sinh)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {frequentAbsenceStudents.map((item) => (
                  <div
                    key={item.student.id}
                    className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.student.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        Mã: {item.student.studentCode} • Tổ {item.student.groupNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-800">
                        {item.totalAbsences} buổi nghỉ ({item.excusedCount} có phép, {item.unexcusedCount} không phép)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Chuyên cần: {item.attendanceRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Statistics Table (Theo học sinh per Mục 2) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Bảng Thống Kê Chuyên Cần Chi Tiết Từng Học Sinh (Lớp {currentClass?.className})
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Thống kê số ngày có mặt, nghỉ có phép, nghỉ không phép, đi muộn, về sớm
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3 w-24">Mã HS</th>
                    <th className="py-3 px-4 min-w-[170px]">Họ và tên</th>
                    <th className="py-3 px-2 text-center w-16">Tổ</th>
                    <th className="py-3 px-3 text-center w-24 bg-emerald-50/50">Có mặt</th>
                    <th className="py-3 px-3 text-center w-28 bg-amber-50/50">Nghỉ có phép</th>
                    <th className="py-3 px-3 text-center w-28 bg-rose-50/50">Nghỉ k.phép</th>
                    <th className="py-3 px-3 text-center w-24 bg-purple-50/50">Đi muộn</th>
                    <th className="py-3 px-3 text-center w-24">Về sớm</th>
                    <th className="py-3 px-3 text-center w-28">Tỷ lệ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentStats.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        {item.student.stt || idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {item.student.studentCode}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(item.student)}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {item.student.fullName}
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">
                        Tổ {item.student.groupNumber}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {item.presentCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30">
                        {item.excusedCount > 0 ? item.excusedCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/30">
                        {item.unexcusedCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {item.unexcusedCount}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-purple-700 bg-purple-50/30">
                        {item.lateCount > 0 ? item.lateCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {item.earlyCount > 0 ? item.earlyCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            item.attendanceRate >= 98
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.attendanceRate >= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CẢNH BÁO CHUYÊN CẦN ================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* MANDATORY WARNING BANNER: Bắt buộc theo Mục 5 */}
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-amber-950 font-black text-sm block">
                "Đây là cảnh báo dựa trên dữ liệu, không phải kết luận."
              </strong>
              <p>
                Hệ thống tự động phát hiện các dấu hiệu học sinh nghỉ nhiều, nghỉ không phép, đi muộn hoặc thiếu dữ liệu điểm danh nhằm hỗ trợ GVCN nắm bắt tình hình sớm và có biện pháp giáo dục, trao đổi kịp thời với phụ huynh.
              </p>
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Danh Sách Cảnh Báo Chuyên Cần Lớp {currentClass?.className} ({attendanceAlerts.length} cảnh báo)
            </h3>

            {attendanceAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Không có cảnh báo chuyên cần nào. Lớp học duy trì nề nếp rất tốt!
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceAlerts.map((alt, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      alt.severity === 'danger'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : alt.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-purple-50/80 border-purple-200 text-purple-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {alt.studentName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            alt.severity === 'danger'
                              ? 'bg-rose-600 text-white'
                              : alt.severity === 'warning'
                              ? 'bg-amber-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          Cảnh báo {alt.type}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{alt.message}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = currentClassStudents.find((s) => s.id === alt.studentId);
                          if (target) setSelectedStudent(target);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold border border-slate-200 shadow-xs transition-colors"
                      >
                        Mở hồ sơ HS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
