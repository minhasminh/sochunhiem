import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Database,
  FileCheck,
  FileText,
  GraduationCap,
  LayoutGrid,
  RotateCcw,
  School,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Clock,
  BookCheck,
  Smile,
  Compass,
  Trophy,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GvcnDashboardView: React.FC = () => {
  const {
    school,
    currentSchoolYear,
    currentClass,
    currentUser,
    setActiveMenu,
    deleteDemoData,
    restoreDemoData,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    classActivities,
    awardRecords,
    talentProfiles,
    groupCompetitionRecords,
    setSelectedStudent,
  } = useApp();

  // Metrics dynamically calculated from the single source of truth: currentClassStudents
  const totalStudents = currentClassStudents.length;
  const femaleCount = currentClassStudents.filter((s) => s.gender === 'Nữ').length;
  const maleCount = currentClassStudents.filter((s) => s.gender === 'Nam').length;
  const needSupportCount = currentClassStudents.filter((s) => s.needsSupport).length;
  const progressCount = currentClassStudents.filter((s) => s.hasProgress).length;
  const achievementCount = currentClassStudents.filter(
    (s) => s.hasSpecialTalent || (s.achievements && s.achievements.trim().length > 0)
  ).length;

  // Complete profile calculation
  const completeProfileCount = currentClassStudents.filter(
    (s) => s.fullName && s.studentCode && s.birthDate && s.gender
  ).length;
  const profileCompletionRate =
    totalStudents > 0 ? Math.round((completeProfileCount / totalStudents) * 100) : 0;

  // ================= 1. LIÊN KẾT ĐIỂM DANH → DASHBOARD =================
  const classAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter((r) => r.classId === (currentClass?.id || 'class-7-1'));
  }, [attendanceRecords, currentClass]);

  const totalRecordedSessions = useMemo(() => {
    const set = new Set(classAttendanceRecords.map((r) => `${r.date}_${r.session}_${r.period || 'Cả buổi'}`));
    return Math.max(set.size, 1);
  }, [classAttendanceRecords]);

  const excusedAbsences = useMemo(
    () => classAttendanceRecords.filter((r) => r.status === 'Nghỉ có phép').length,
    [classAttendanceRecords]
  );
  const unexcusedAbsences = useMemo(
    () => classAttendanceRecords.filter((r) => r.status === 'Nghỉ không phép').length,
    [classAttendanceRecords]
  );
  const lateCount = useMemo(
    () => classAttendanceRecords.filter((r) => r.status === 'Đi muộn').length,
    [classAttendanceRecords]
  );
  const totalClassAbsences = excusedAbsences + unexcusedAbsences;

  const totalPossibleAttendances = totalStudents * totalRecordedSessions;
  const classAttendanceRate = useMemo(() => {
    if (totalPossibleAttendances === 0) return 100;
    return Math.max(0, Math.round(((totalPossibleAttendances - totalClassAbsences) / totalPossibleAttendances) * 100));
  }, [totalPossibleAttendances, totalClassAbsences]);

  // Frequent absence students
  const studentAbsenceMap = useMemo(() => {
    const map: Record<string, { excused: number; unexcused: number; late: number; name: string; student: any }> = {};
    currentClassStudents.forEach((st) => {
      map[st.id] = { excused: 0, unexcused: 0, late: 0, name: st.fullName, student: st };
    });
    classAttendanceRecords.forEach((r) => {
      if (map[r.studentId]) {
        if (r.status === 'Nghỉ có phép') map[r.studentId].excused++;
        if (r.status === 'Nghỉ không phép') map[r.studentId].unexcused++;
        if (r.status === 'Đi muộn') map[r.studentId].late++;
      }
    });
    return map;
  }, [currentClassStudents, classAttendanceRecords]);

  // ================= 2. LIÊN KẾT HỌC TẬP → DASHBOARD =================
  const classScores = useMemo(() => {
    return academicScores.filter((s) => s.classId === (currentClass?.id || 'class-7-1'));
  }, [academicScores, currentClass]);

  const classTrackings = useMemo(() => {
    return subjectTrackings.filter((t) => t.classId === (currentClass?.id || 'class-7-1'));
  }, [subjectTrackings, currentClass]);

  const academicNeedSupportCount = useMemo(
    () => classTrackings.filter((t) => t.trackingStatus === 'cần hỗ trợ').length,
    [classTrackings]
  );
  const academicStandoutCount = useMemo(
    () => classTrackings.filter((t) => t.trackingStatus === 'nổi bật').length,
    [classTrackings]
  );
  const academicProgressCount = useMemo(
    () => classTrackings.filter((t) => t.trackingStatus === 'có tiến bộ').length,
    [classTrackings]
  );

  // Cảnh báo học tập & chuyên cần kết hợp
  const dashboardAlerts = useMemo(() => {
    const alerts: {
      id: string;
      studentName: string;
      student: any;
      type: string;
      message: string;
      severity: 'danger' | 'warning' | 'info';
    }[] = [];

    // 1. Cảnh báo nghỉ không phép
    Object.entries(studentAbsenceMap).forEach(([stId, data]) => {
      if (data.unexcused > 0) {
        alerts.push({
          id: `att-unexcused-${stId}`,
          studentName: data.name,
          student: data.student,
          type: 'nghỉ không phép',
          message: `Nghỉ ${data.unexcused} buổi không phép. Cần khẩn trương liên hệ phụ huynh.`,
          severity: 'danger',
        });
      } else if (data.excused + data.unexcused >= 2) {
        alerts.push({
          id: `att-frequent-${stId}`,
          studentName: data.name,
          student: data.student,
          type: 'nghỉ nhiều',
          message: `Tổng số buổi nghỉ: ${data.excused + data.unexcused} buổi (${data.excused} có phép). Cần theo dõi sĩ số.`,
          severity: 'warning',
        });
      }
    });

    // 2. Cảnh báo học tập cần hỗ trợ
    classTrackings.forEach((tr) => {
      if (tr.trackingStatus === 'cần hỗ trợ') {
        const st = currentClassStudents.find((s) => s.id === tr.studentId);
        if (st && !alerts.some((a) => a.student?.id === st.id && a.type === 'cần theo dõi')) {
          alerts.push({
            id: `acad-support-${st.id}-${tr.subjectName}`,
            studentName: st.fullName,
            student: st,
            type: 'cần theo dõi',
            message: `Môn ${tr.subjectName}: GVCN đánh dấu cần hỗ trợ (${tr.notes || 'Cần phụ đạo kiến thức nền tảng'}).`,
            severity: 'warning',
          });
        }
      }
    });

    // 3. Thiếu dữ liệu điểm nếu chưa có điểm nào
    if (classScores.length === 0) {
      alerts.push({
        id: 'missing-data-scores',
        studentName: 'Toàn lớp',
        student: null,
        type: 'thiếu dữ liệu',
        message: 'Lớp chưa nhập kết quả khảo sát đầu năm hoặc giữa kỳ cho các môn học.',
        severity: 'info',
      });
    }

    return alerts;
  }, [studentAbsenceMap, classTrackings, currentClassStudents, classScores]);

  return (
    <div className="space-y-6">
      {/* Demo Data Notice Banner with Delete / Restore Demo */}
      {currentClass?.isDemo && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-extrabold uppercase text-[10px] tracking-wider">
              DỮ LIỆU DEMO
            </span>
            <span>
              Hệ thống đang chạy với dữ liệu mẫu chuẩn từ <strong>SO CHU NHIEM Mau TK.doc</strong> (Trường TH&THCS Nguyễn Đình Anh - Lớp 7/1).
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={deleteDemoData}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Gỡ nhãn hoặc xóa dữ liệu demo"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Xóa dữ liệu Demo
            </button>
            <button
              onClick={restoreDemoData}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Khôi phục lại dữ liệu mẫu gốc"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục Demo
            </button>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md font-semibold text-sky-100">
              {school.name}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {currentSchoolYear.name} ({currentSchoolYear.status === 'active' ? 'Đang sử dụng' : 'Đã khóa'})
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 font-semibold">
              Lớp {currentClass?.className || '7/1'} (Khối {currentClass?.grade || '7'})
            </span>
          </div>

          <div className="pt-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                SỔ CHỦ NHIỆM LỚP {currentClass?.className || '7/1'}
              </h2>
              <div className="text-xs sm:text-sm text-sky-100 mt-1 flex items-center gap-2 flex-wrap">
                <span>Giáo viên chủ nhiệm: <strong>{currentClass?.homeroomTeacherName || 'Lê Đức Minh'}</strong></span>
                <span>•</span>
                <span>Phòng học: {currentClass?.roomNumber || 'P.204'}</span>
                <span>•</span>
                <span>Ca học: {currentClass?.studyShift || 'Buổi sáng'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveMenu('attendance')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookCheck className="w-4 h-4" /> Điểm danh ({classAttendanceRate}%)
              </button>
              <button
                onClick={() => setActiveMenu('competition')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> Thi đua 4 tổ
              </button>
              <button
                onClick={() => setActiveMenu('print-book')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" /> In Sổ Chủ Nhiệm
              </button>
              <button
                onClick={() => setActiveMenu('students')}
                className="px-4 py-2 bg-white text-sky-900 font-bold rounded-2xl text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Users className="w-4 h-4 text-sky-700" /> {totalStudents} học sinh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The Primary Statistic Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            Các chỉ số theo dõi cốt lõi (Đồng bộ thời gian thực từ Điểm danh & Học tập)
          </h3>
          <span className="text-xs text-slate-500">
            Năm học {currentSchoolYear.code} • Lớp {currentClass?.className} ({totalStudents} học sinh)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {/* Card 1: Tổng số học sinh */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="text-slate-500 text-xs font-medium">Tổng số học sinh</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Duy trì 100% sĩ số
            </div>
          </div>

          {/* Card 2: Chuyên cần */}
          <div
            onClick={() => setActiveMenu('attendance')}
            className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <span>Chuyên cần lớp</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{classAttendanceRate}%</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Vắng: {totalClassAbsences} ({excusedAbsences} phép, {unexcusedAbsences} k.phép)
            </div>
          </div>

          {/* Card 3: Học sinh Nam */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="text-slate-500 text-xs font-medium">Học sinh Nam</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{maleCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tỷ lệ: {totalStudents > 0 ? ((maleCount / totalStudents) * 100).toFixed(1) : 0}%
            </div>
          </div>

          {/* Card 4: Học sinh Nữ */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="text-slate-500 text-xs font-medium">Học sinh Nữ</div>
            <div className="text-2xl font-black text-pink-600 mt-1">{femaleCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tỷ lệ: {totalStudents > 0 ? ((femaleCount / totalStudents) * 100).toFixed(1) : 0}%
            </div>
          </div>

          {/* Card 5: Học sinh cần hỗ trợ */}
          <div
            onClick={() => setActiveMenu('academic')}
            className="bg-white p-4.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>HS cần hỗ trợ</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {Math.max(needSupportCount, academicNeedSupportCount)}
            </div>
            <div className="text-[11px] text-rose-500 mt-1">
              {academicNeedSupportCount > 0 ? `${academicNeedSupportCount} lượt bộ môn` : 'Học yếu Toán / KHTN'}
            </div>
          </div>

          {/* Card 6: Học sinh có tiến bộ */}
          <div
            onClick={() => setActiveMenu('academic')}
            className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <span>HS có tiến bộ</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {Math.max(progressCount, academicProgressCount)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              {academicProgressCount > 0 ? `${academicProgressCount} lượt bộ môn` : 'Ghi nhận tiến bộ'}
            </div>
          </div>

          {/* Card 7: Học sinh có thành tích / nổi bật */}
          <div className="bg-white p-4.5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs hover:shadow-md transition-all">
            <div className="text-purple-800 text-xs font-semibold">HS nổi bật / Năng khiếu</div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {Math.max(achievementCount, academicStandoutCount)}
            </div>
            <div className="text-[11px] text-purple-600 mt-1">
              {academicStandoutCount > 0 ? `${academicStandoutCount} môn nổi bật` : 'Năng khiếu & khen thưởng'}
            </div>
          </div>

          {/* Card 8: Số lượt đi muộn */}
          <div className="bg-white p-4.5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs hover:shadow-md transition-all">
            <div className="text-purple-800 text-xs font-semibold">Lượt đi học muộn</div>
            <div className="text-2xl font-black text-purple-700 mt-1">{lateCount}</div>
            <div className="text-[11px] text-purple-600 mt-1">Giờ truy bài buổi sáng</div>
          </div>

          {/* Card 9: Tình trạng hoàn thiện hồ sơ */}
          <div className="bg-white p-4.5 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-xs hover:shadow-md transition-all">
            <div className="text-sky-900 text-xs font-semibold">Tình trạng hồ sơ</div>
            <div className="text-2xl font-black text-sky-700 mt-1">{profileCompletionRate}%</div>
            <div className="text-[11px] text-sky-600 font-medium mt-1 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> {completeProfileCount}/{totalStudents} hồ sơ chuẩn
            </div>
          </div>

          {/* Card 10: Báo cáo & Đánh giá */}
          <div
            onClick={() => setActiveMenu('reports')}
            className="bg-white p-4.5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-indigo-900 text-xs font-semibold flex items-center justify-between">
              <span>Báo cáo tổng hợp</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-1">A4</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Xem & In sổ báo cáo
            </div>
          </div>
        </div>
      </div>

      {/* CẢNH BÁO DỰA TRÊN DỮ LIỆU THỜI GIAN THỰC */}
      {dashboardAlerts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Cảnh Báo Chuyên Cần & Học Tập ({dashboardAlerts.length} thông báo)
            </h3>
            <span className="text-xs text-slate-500">Tự động phát hiện từ dữ liệu lớp</span>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-950 font-black text-xs block">
                "Đây là cảnh báo dựa trên dữ liệu, không phải kết luận."
              </strong>
              <p className="text-[11px] text-amber-800">
                Hệ thống nhận diện dựa trên số buổi nghỉ, trường hợp nghỉ không phép hoặc học sinh cần hỗ trợ kiến thức để hỗ trợ giáo viên chủ nhiệm xử lý kịp thời.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {dashboardAlerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  alt.severity === 'danger'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : alt.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-sky-50/70 border-sky-200 text-sky-900'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{alt.studentName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        alt.severity === 'danger'
                          ? 'bg-rose-600 text-white'
                          : alt.severity === 'warning'
                          ? 'bg-amber-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}
                    >
                      {alt.type}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{alt.message}</p>
                </div>

                {alt.student && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(alt.student)}
                    className="shrink-0 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold border border-slate-200 shadow-xs transition-colors text-[11px] cursor-pointer"
                  >
                    Xem HS
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Profile Overview and Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Characteristics Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              Đặc điểm tình hình lớp {currentClass?.className}
            </h4>
            <button
              onClick={() => setActiveMenu('class-info')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Xem chi tiết hồ sơ lớp <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-800">Đặc điểm lớp:</div>
            <p className="text-slate-600 leading-relaxed">
              {currentClass?.characteristics || 'Chưa cập nhật đặc điểm lớp.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="font-bold text-emerald-900">Thuận lợi:</div>
              <p className="text-slate-600 mt-1 line-clamp-2">
                {currentClass?.advantages || 'Chưa cập nhật thuận lợi.'}
              </p>
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
              <div className="font-bold text-rose-900">Khó khăn:</div>
              <p className="text-slate-600 mt-1 line-clamp-2">
                {currentClass?.difficulties || 'Chưa cập nhật khó khăn.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            Tác vụ trung tâm các Giai đoạn
          </h4>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => setActiveMenu('attendance')}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                    Điểm danh & Chuyên cần
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sĩ số ngày, buổi, tiết & chuyên cần {classAttendanceRate}%
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveMenu('academic')}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-sky-800">
                    Quản lý & Theo dõi học tập
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Nhập điểm, nhận xét & theo dõi 12 môn THCS
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveMenu('competition')}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-amber-800">
                    Thi đua 4 tổ tự quản
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Theo dõi tuần, tháng, học kỳ, cả năm theo 6 tiêu chí
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveMenu('seating-chart')}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-amber-800">
                    Sơ đồ chỗ ngồi & Cán bộ lớp
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Xếp bàn ghế 4 tổ, cán bộ & Ban ĐD CMHS
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveMenu('plans')}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-purple-800">
                    Kế hoạch chủ nhiệm
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kế hoạch năm, tháng & lịch công việc
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
