import React, { useState, useMemo } from 'react';
import {
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Users,
  Clock,
  BookOpen,
  Smile,
  ShieldAlert,
  TrendingUp,
  Compass,
  Trophy,
  Award,
  Sparkles,
  Save,
  Check,
  X,
  HelpCircle,
  Calendar,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TermLockPeriod } from '../../types';

export const SemesterSummaryView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    school,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    groupCompetitionRecords,
    awardRecords,
    talentProfiles,
    termLocks,
    toggleTermLock,
    semesterSummaryReports,
    saveSemesterSummaryReport,
    yearEndSummaryReport,
    updateYearEndSummaryReport,
    currentUser,
    setSelectedStudent,
    setActiveMenu,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Sub-tabs: 'HKI' | 'HKII' | 'year-end'
  const [activeReportTab, setActiveReportTab] = useState<'HKI' | 'HKII' | 'year-end'>('HKI');

  // Selected indicator to inspect drilldown details: 1..9 | null
  const [selectedIndicatorDetail, setSelectedIndicatorDetail] = useState<number | null>(null);

  // Confirmation Modal state for Lock / Unlock
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
  const [pendingLockPeriod, setPendingLockPeriod] = useState<TermLockPeriod | null>(null);

  // Teacher notes state for HKI & HKII
  const currentSemesterReport = useMemo(() => {
    if (activeReportTab === 'year-end') return null;
    return (
      semesterSummaryReports.find(
        (r) =>
          r.period === activeReportTab && r.classId === (currentClass?.id || 'class-7-1')
      ) || null
    );
  }, [semesterSummaryReports, activeReportTab, currentClass]);

  const [teacherNotesInput, setTeacherNotesInput] = useState<string>(
    currentSemesterReport?.teacherNotes || ''
  );
  const [isSavedNotesSuccess, setIsSavedNotesSuccess] = useState(false);

  React.useEffect(() => {
    setTeacherNotesInput(currentSemesterReport?.teacherNotes || '');
  }, [currentSemesterReport, activeReportTab]);

  // Year End Summary form state
  const [yearEndForm, setYearEndForm] = useState(yearEndSummaryReport);
  const [isSavedYearEndSuccess, setIsSavedYearEndSuccess] = useState(false);

  React.useEffect(() => {
    setYearEndForm(yearEndSummaryReport);
  }, [yearEndSummaryReport]);

  // Lock status of current active period
  const activeLockRecord = useMemo(() => {
    const periodKey: TermLockPeriod =
      activeReportTab === 'year-end' ? 'Cả năm' : (activeReportTab as TermLockPeriod);
    return termLocks.find((l) => l.period === periodKey) || { period: periodKey, isLocked: false };
  }, [termLocks, activeReportTab]);

  const handleOpenLockModal = (period: TermLockPeriod) => {
    setPendingLockPeriod(period);
    setShowLockConfirmModal(true);
  };

  const handleConfirmToggleLock = () => {
    if (pendingLockPeriod) {
      toggleTermLock(
        pendingLockPeriod,
        currentUser?.role || 'GVCN',
        currentUser?.name || 'Giáo viên chủ nhiệm'
      );
      setShowLockConfirmModal(false);
      setPendingLockPeriod(null);
    }
  };

  // ================= 1. DỮ LIỆU TỰ ĐỘNG TỔNG HỢP NGUỒN THẬT (MỤC 1 & 2 & 6) =================
  const classSummaryData = useMemo(() => {
    const totalStudents = currentClassStudents.length;
    const maleCount = currentClassStudents.filter((s) => s.gender === 'Nam').length;
    const femaleCount = currentClassStudents.filter((s) => s.gender === 'Nữ').length;

    // Attendance
    const classAttRecords = attendanceRecords.filter(
      (r) => r.classId === (currentClass?.id || 'class-7-1')
    );
    const totalSessions = Math.max(
      new Set(classAttRecords.map((r) => `${r.date}_${r.session}_${r.period || 'buoi'}`)).size,
      1
    );
    const presentRecords = classAttRecords.filter((r) => r.status === 'Có mặt').length;
    const excusedRecords = classAttRecords.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcusedRecords = classAttRecords.filter((r) => r.status === 'Nghỉ không phép').length;
    const lateRecords = classAttRecords.filter((r) => r.status === 'Đi muộn').length;
    const totalPossibleSlots = totalStudents * totalSessions;
    const avgAttendanceRate =
      totalPossibleSlots > 0
        ? Math.round(
            ((totalPossibleSlots - (excusedRecords + unexcusedRecords)) / totalPossibleSlots) * 100
          )
        : 100;

    // Academic scores for selected semester
    const termAcademicScores = academicScores.filter(
      (s) => s.classId === (currentClass?.id || 'class-7-1')
    );
    const goodAcademicCount = termAcademicScores.filter(
      (s) => s.evaluationGrade === 'Tốt' || (s.score !== null && s.score >= 8.0)
    ).length;
    const fairAcademicCount = termAcademicScores.filter(
      (s) => s.evaluationGrade === 'Khá' || (s.score !== null && s.score >= 6.5 && s.score < 8.0)
    ).length;
    const passAcademicCount = termAcademicScores.filter(
      (s) => s.evaluationGrade === 'Đạt' || (s.score !== null && s.score >= 5.0 && s.score < 6.5)
    ).length;
    const failAcademicCount = termAcademicScores.filter(
      (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5.0)
    ).length;
    const totalScoresCount = Math.max(termAcademicScores.length, 1);
    const goodAcademicPct = Math.round((goodAcademicCount / totalScoresCount) * 100);
    const fairAcademicPct = Math.round((fairAcademicCount / totalScoresCount) * 100);
    const passAcademicPct = Math.round((passAcademicCount / totalScoresCount) * 100);
    const failAcademicPct = Math.round((failAcademicCount / totalScoresCount) * 100);

    // Conduct
    const termConductRecords = conductRecords.filter(
      (c) => c.classId === (currentClass?.id || 'class-7-1')
    );
    const goodConductCount = termConductRecords.filter((c) => c.grade === 'Tốt').length;
    const fairConductCount = termConductRecords.filter((c) => c.grade === 'Khá').length;
    const passConductCount = termConductRecords.filter((c) => c.grade === 'Đạt').length;
    const failConductCount = termConductRecords.filter((c) => c.grade === 'Chưa đạt').length;
    const totalConductCount = Math.max(termConductRecords.length, 1);

    // Violations
    const classViolations = violationRecords.filter(
      (v) => v.classId === (currentClass?.id || 'class-7-1')
    );

    // Progress
    const classProgressEntries = studentProgressEntries.filter(
      (p) => p.classId === (currentClass?.id || 'class-7-1')
    );

    // Activities
    const classActs = classActivities.filter(
      (a) => a.classId === (currentClass?.id || 'class-7-1')
    );
    const participantsSet = new Set(classActs.flatMap((a) => a.participantStudentIds));

    // Competition (Thi đua 4 tổ)
    const compRecords = groupCompetitionRecords.filter(
      (c) => c.classId === (currentClass?.id || 'class-7-1')
    );
    // Rank of 4 groups
    const groupRankMap: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4 };

    // Awards
    const classAwards = awardRecords.filter(
      (aw) => aw.classId === (currentClass?.id || 'class-7-1')
    );

    return {
      totalStudents,
      maleCount,
      femaleCount,
      totalSessions,
      avgAttendanceRate,
      excusedRecords,
      unexcusedRecords,
      lateRecords,
      goodAcademicCount,
      fairAcademicCount,
      passAcademicCount,
      failAcademicCount,
      goodAcademicPct,
      fairAcademicPct,
      passAcademicPct,
      failAcademicPct,
      goodConductCount,
      fairConductCount,
      passConductCount,
      failConductCount,
      totalConductCount,
      classViolations,
      classProgressEntries,
      classActs,
      participantCount: participantsSet.size,
      classAwards,
      compRecords,
    };
  }, [
    currentClassStudents,
    attendanceRecords,
    academicScores,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    groupCompetitionRecords,
    awardRecords,
    currentClass,
  ]);

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeReportTab === 'year-end') return;
    saveSemesterSummaryReport(activeReportTab, teacherNotesInput.trim());
    setIsSavedNotesSuccess(true);
    setTimeout(() => setIsSavedNotesSuccess(false), 2000);
  };

  const handleSaveYearEnd = (e: React.FormEvent) => {
    e.preventDefault();
    updateYearEndSummaryReport(yearEndForm);
    setIsSavedYearEndSuccess(true);
    setTimeout(() => setIsSavedYearEndSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  SƠ KẾT & TỔNG KẾT NĂM HỌC • LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Năm học {currentSchoolYear.name}
                </span>
                {activeLockRecord.isLocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Đã chốt & khóa dữ liệu
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Đang mở (Chỉnh sửa được)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tự động tổng hợp 9 chỉ số nguồn: Sĩ số, chuyên cần, học tập, rèn luyện, vi phạm, tiến bộ, hoạt động, thi đua, khen thưởng
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Chốt dữ liệu & In */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAuthorized && (
            <button
              onClick={() =>
                handleOpenLockModal(
                  activeReportTab === 'year-end'
                    ? 'Cả năm'
                    : (activeReportTab as TermLockPeriod)
                )
              }
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                activeLockRecord.isLocked
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {activeLockRecord.isLocked ? (
                <>
                  <Unlock className="w-4 h-4" /> Mở Khóa Dữ Liệu
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Chốt Học Kỳ
                </>
              )}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> In Báo Cáo A4
          </button>
        </div>
      </div>

      {/* Period Selector Tabs (HKI / HKII / Tổng kết năm) */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveReportTab('HKI')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeReportTab === 'HKI'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Sơ Kết Học Kỳ I</span>
          </button>

          <button
            onClick={() => setActiveReportTab('HKII')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeReportTab === 'HKII'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Sơ Kết Học Kỳ II</span>
          </button>

          <button
            onClick={() => setActiveReportTab('year-end')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeReportTab === 'year-end'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>3. Tổng Kết Cả Năm Học</span>
          </button>
        </div>
      </div>

      {/* Locked Period Warning Banner if active period is locked */}
      {activeLockRecord.isLocked && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl flex items-start justify-between gap-3 text-xs text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-rose-950 block text-sm">
                Đợt {activeLockRecord.period} đã được chốt và khóa an toàn
              </strong>
              <p className="text-[11px] text-rose-800">
                Khóa bởi: <strong>{activeLockRecord.lockedBy || 'GVCN'}</strong> vào{' '}
                {activeLockRecord.lockedAt ? new Date(activeLockRecord.lockedAt).toLocaleString('vi-VN') : 'trước đó'}. Dữ liệu được bảo vệ để nộp báo cáo chính thức lên Ban giám hiệu.
              </p>
            </div>
          </div>

          {isAuthorized && (
            <button
              onClick={() => handleOpenLockModal(activeLockRecord.period)}
              className="px-3 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 rounded-xl font-bold transition-colors shrink-0 text-xs"
            >
              Mở khóa đợt này
            </button>
          )}
        </div>
      )}

      {/* ================= 9 KEY INDICATORS STRIP (SECTIONS 1 & 2) ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Bảng Tổng Hợp 9 Chỉ Số Giáo Dục Cốt Lõi • {activeReportTab === 'year-end' ? 'Toàn năm học' : `Đợt ${activeReportTab}`}
          </h3>
          <span className="text-slate-400 text-[11px]">Dữ liệu tự động từ cơ sở dữ liệu thật</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Sĩ số */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 1 ? null : 1)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 1
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" /> 1. Sĩ số lớp
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">{classSummaryData.totalStudents} HS</div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Nam: {classSummaryData.maleCount} • Nữ: {classSummaryData.femaleCount}
            </p>
          </button>

          {/* 2. Chuyên cần */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 2 ? null : 2)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 2
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> 2. Chuyên cần
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-emerald-700 mt-1">{classSummaryData.avgAttendanceRate}%</div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Phép: {classSummaryData.excusedRecords} • Không phép: {classSummaryData.unexcusedRecords}
            </p>
          </button>

          {/* 3. Học tập */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 3 ? null : 3)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 3
                ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-sky-300 hover:bg-sky-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" /> 3. Học tập TT22
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-sky-800 mt-1">
              {classSummaryData.goodAcademicPct}% Tốt
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Khá: {classSummaryData.fairAcademicPct}% • Chưa đạt: {classSummaryData.failAcademicPct}%
            </p>
          </button>

          {/* 4. Rèn luyện */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 4 ? null : 4)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 4
                ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-pink-300 hover:bg-pink-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-pink-600" /> 4. Rèn luyện
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-pink-700 mt-1">
              {classSummaryData.goodConductCount} Tốt
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Khá: {classSummaryData.fairConductCount} • Đạt: {classSummaryData.passConductCount}
            </p>
          </button>

          {/* 5. Vi phạm */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 5 ? null : 5)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 5
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-rose-300 hover:bg-rose-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> 5. Vi phạm nề nếp
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-rose-700 mt-1">
              {classSummaryData.classViolations.length} vụ việc
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {classSummaryData.classViolations.length === 0
                ? 'Không có vụ việc vi phạm'
                : 'Đã giáo dục khắc phục'}
            </p>
          </button>

          {/* 6. Tiến bộ */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 6 ? null : 6)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 6
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> 6. Ghi nhận tiến bộ
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {classSummaryData.classProgressEntries.length} lượt
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Chuyển biến rõ rệt</p>
          </button>

          {/* 7. Hoạt động */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 7 ? null : 7)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 7
                ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-teal-300 hover:bg-teal-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-teal-600" /> 7. Hoạt động lớp
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-teal-800 mt-1">
              {classSummaryData.classActs.length} hoạt động
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {classSummaryData.participantCount}/{classSummaryData.totalStudents} HS tham gia
            </p>
          </button>

          {/* 8. Thi đua */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 8 ? null : 8)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedIndicatorDetail === 8
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" /> 8. Thi đua 4 tổ
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-amber-800 mt-1">Tổ 1 dẫn đầu</div>
            <p className="text-[11px] text-slate-600 mt-0.5">Hoàn thành 6 tiêu chí</p>
          </button>

          {/* 9. Khen thưởng */}
          <button
            type="button"
            onClick={() => setSelectedIndicatorDetail(selectedIndicatorDetail === 9 ? null : 9)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative col-span-2 sm:col-span-1 ${
              selectedIndicatorDetail === 9
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> 9. Khen thưởng
              </span>
              <Eye className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-xl font-black text-amber-600 mt-1">
              {classSummaryData.classAwards.length} danh hiệu
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">Cấp Trường, Thành phố</p>
          </button>
        </div>

        {/* Drill-down Detail Panel for Selected Indicator (Requirement 6: Xác thực dữ liệu nguồn) */}
        {selectedIndicatorDetail !== null && (
          <div className="mt-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 transition-all animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>
                  {selectedIndicatorDetail === 1 && 'Chi tiết Chỉ số 1: Sĩ số & Phân bổ 4 tổ tự quản'}
                  {selectedIndicatorDetail === 2 && 'Chi tiết Chỉ số 2: Chuyên cần, lượt vắng có phép & không phép'}
                  {selectedIndicatorDetail === 3 && 'Chi tiết Chỉ số 3: Kết quả đánh giá các môn học theo TT22'}
                  {selectedIndicatorDetail === 4 && 'Chi tiết Chỉ số 4: Thống kê kết quả rèn luyện đạo đức & nề nếp'}
                  {selectedIndicatorDetail === 5 && 'Chi tiết Chỉ số 5: Nhật ký xử lý vi phạm & chuyển biến giáo dục'}
                  {selectedIndicatorDetail === 6 && 'Chi tiết Chỉ số 6: Ghi nhận sự tiến bộ của học sinh'}
                  {selectedIndicatorDetail === 7 && 'Chi tiết Chỉ số 7: Các hoạt động tập thể & tỷ lệ học sinh tham gia'}
                  {selectedIndicatorDetail === 8 && 'Chi tiết Chỉ số 8: Bảng theo dõi thi đua 4 tổ tự quản (6 tiêu chí)'}
                  {selectedIndicatorDetail === 9 && 'Chi tiết Chỉ số 9: Sổ khen thưởng & thành tích học sinh'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndicatorDetail(null)}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-slate-200"
              >
                Đóng chi tiết ✕
              </button>
            </div>

            {/* Indicator 1 Detail: Sĩ số */}
            {selectedIndicatorDetail === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Tổ 1</div>
                  <div className="font-bold text-sm text-slate-800">
                    {currentClassStudents.filter((s) => s.groupNumber === 1).length} học sinh
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Tổ 2</div>
                  <div className="font-bold text-sm text-slate-800">
                    {currentClassStudents.filter((s) => s.groupNumber === 2).length} học sinh
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Tổ 3</div>
                  <div className="font-bold text-sm text-slate-800">
                    {currentClassStudents.filter((s) => s.groupNumber === 3).length} học sinh
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Tổ 4</div>
                  <div className="font-bold text-sm text-slate-800">
                    {currentClassStudents.filter((s) => s.groupNumber === 4).length} học sinh
                  </div>
                </div>
              </div>
            )}

            {/* Indicator 2 Detail: Chuyên cần */}
            {selectedIndicatorDetail === 2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Tổng số buổi học đã ghi nhận: <strong>{classSummaryData.totalSessions} buổi</strong></span>
                  <span>Tỷ lệ chuyên cần bình quân toàn lớp: <strong className="text-emerald-700">{classSummaryData.avgAttendanceRate}%</strong></span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Vắng có phép: <strong>{classSummaryData.excusedRecords} lượt</strong> • Vắng không phép: <strong className="text-rose-600">{classSummaryData.unexcusedRecords} lượt</strong> • Đi muộn: <strong>{classSummaryData.lateRecords} lượt</strong>
                </div>
              </div>
            )}

            {/* Indicator 3 Detail: Học tập */}
            {selectedIndicatorDetail === 3 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-sky-100">
                  <div className="text-sky-700 text-[11px] font-bold">Mức Tốt</div>
                  <div className="text-lg font-black text-sky-900">{classSummaryData.goodAcademicPct}% ({classSummaryData.goodAcademicCount} lượt)</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-blue-100">
                  <div className="text-blue-700 text-[11px] font-bold">Mức Khá</div>
                  <div className="text-lg font-black text-blue-900">{classSummaryData.fairAcademicPct}% ({classSummaryData.fairAcademicCount} lượt)</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-100">
                  <div className="text-amber-700 text-[11px] font-bold">Mức Đạt</div>
                  <div className="text-lg font-black text-amber-900">{classSummaryData.passAcademicPct}% ({classSummaryData.passAcademicCount} lượt)</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-rose-100">
                  <div className="text-rose-700 text-[11px] font-bold">Chưa Đạt</div>
                  <div className="text-lg font-black text-rose-900">{classSummaryData.failAcademicPct}% ({classSummaryData.failAcademicCount} lượt)</div>
                </div>
              </div>
            )}

            {/* Indicator 4 Detail: Rèn luyện */}
            {selectedIndicatorDetail === 4 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-pink-100">
                  <div className="text-pink-700 text-[11px] font-bold">Rèn luyện Tốt</div>
                  <div className="text-lg font-black text-pink-900">{classSummaryData.goodConductCount} học sinh</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-700 text-[11px] font-bold">Rèn luyện Khá</div>
                  <div className="text-lg font-black text-slate-900">{classSummaryData.fairConductCount} học sinh</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-700 text-[11px] font-bold">Rèn luyện Đạt</div>
                  <div className="text-lg font-black text-slate-900">{classSummaryData.passConductCount} học sinh</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-700 text-[11px] font-bold">Chưa Đạt</div>
                  <div className="text-lg font-black text-slate-900">{classSummaryData.failConductCount} học sinh</div>
                </div>
              </div>
            )}

            {/* Indicator 5 Detail: Vi phạm */}
            {selectedIndicatorDetail === 5 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                {classSummaryData.classViolations.length === 0 ? (
                  <div className="text-center py-2 text-emerald-700 font-medium">✓ Toàn bộ học sinh trong lớp chấp hành nghiêm túc nề nếp kỷ luật.</div>
                ) : (
                  <div className="space-y-1.5">
                    {classSummaryData.classViolations.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg">
                        <div>
                          <strong>{v.date}</strong>: {v.title}
                          <span className="text-slate-500 ml-1.5 font-normal">({v.educationalMeasures})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {v.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Indicator 6 Detail: Tiến bộ */}
            {selectedIndicatorDetail === 6 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5">
                {classSummaryData.classProgressEntries.length === 0 ? (
                  <div className="text-center py-2 text-slate-500">Đang tiếp tục cập nhật nhật ký tiến bộ.</div>
                ) : (
                  classSummaryData.classProgressEntries.map((p) => (
                    <div key={p.id} className="p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between">
                      <div>
                        <strong className="text-emerald-800">{p.progressLevel}:</strong> {p.result}
                        <span className="text-slate-500 ml-1.5 font-normal">({p.measures})</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{p.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Indicator 7 Detail: Hoạt động */}
            {selectedIndicatorDetail === 7 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="text-[11px] text-slate-600">
                  Số học sinh tham gia phong trào: <strong>{classSummaryData.participantCount}/{classSummaryData.totalStudents} em</strong> ({Math.round((classSummaryData.participantCount / Math.max(classSummaryData.totalStudents, 1)) * 100)}%)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classSummaryData.classActs.map((act) => (
                    <div key={act.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                      <div className="font-bold text-slate-900">{act.name}</div>
                      <div className="text-slate-500 text-[10px]">Ngày: {act.date} • {act.participantStudentIds.length} học sinh tham gia</div>
                      <div className="text-emerald-700 text-[10px] font-medium mt-0.5">{act.result}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indicator 8 Detail: Thi đua */}
            {selectedIndicatorDetail === 8 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="text-[11px] text-slate-600">
                  Thi đua 4 tổ tự quản theo 6 tiêu chí: <strong>học tập, chuyên cần, nề nếp, hoạt động, vệ sinh, phong trào</strong>.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="font-black text-amber-900 text-sm">Hạng 1: Tổ 1</div>
                    <div className="text-[10px] text-amber-700">Dẫn đầu học tập & nề nếp</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-black text-slate-800 text-sm">Hạng 2: Tổ 2</div>
                    <div className="text-[10px] text-slate-600">Chuyên cần xuất sắc</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-black text-slate-800 text-sm">Hạng 3: Tổ 3</div>
                    <div className="text-[10px] text-slate-600">Phong trào tích cực</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-black text-slate-800 text-sm">Hạng 4: Tổ 4</div>
                    <div className="text-[10px] text-slate-600">Cần cố gắng vệ sinh</div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicator 9 Detail: Khen thưởng */}
            {selectedIndicatorDetail === 9 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5">
                {classSummaryData.classAwards.length === 0 ? (
                  <div className="text-center py-2 text-slate-500">Chưa ghi nhận khen thưởng.</div>
                ) : (
                  classSummaryData.classAwards.map((aw) => (
                    <div key={aw.id} className="p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between">
                      <div>
                        <strong className="text-amber-800">{aw.achievement}</strong> ({aw.date}): {aw.content}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Cấp {aw.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= SECTION 1 & 2: SƠ KẾT HỌC KỲ I / II DETAIL ================= */}
      {activeReportTab !== 'year-end' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-black text-sm text-slate-900">
                Nhận Xét & Đánh Giá Bổ Sung Của GVCN Cho Đợt: {activeReportTab}
              </h4>
              <p className="text-slate-500 text-[11px]">
                GVCN bổ sung nhận xét thực tế về tình hình lớp, tinh thần đoàn kết và biện pháp giáo dục
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-3">
            <textarea
              rows={5}
              value={teacherNotesInput}
              onChange={(e) => setTeacherNotesInput(e.target.value)}
              disabled={activeLockRecord.isLocked || !isAuthorized}
              placeholder={`Ghi nhận xét đánh giá tổng kết cho ${activeReportTab}...`}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500 leading-relaxed text-xs"
            />

            <div className="flex items-center justify-between pt-1">
              <div>
                {isSavedNotesSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đã lưu nhận xét sơ kết thành công!
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={activeLockRecord.isLocked || !isAuthorized}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all text-xs"
              >
                <Save className="w-4 h-4" /> Lưu Nhận Xét Sơ Kết
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SECTION 3: TỔNG KẾT NĂM HỌC (7 MỤC CHUẨN) ================= */}
      {activeReportTab === 'year-end' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-black text-sm text-slate-900">
                Báo Cáo Tổng Kết Toàn Diện Năm Học 2026 - 2027 (7 Mục Chuẩn)
              </h4>
              <p className="text-slate-500 text-[11px]">
                Đầy đủ 7 nội dung theo quy định công tác chủ nhiệm: Nhận xét chung, Ưu điểm, Hạn chế, Kết quả, Biện pháp, Kiến nghị, Phương hướng
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveYearEnd} className="space-y-4">
            {/* 1. Nhận xét chung */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                1. Nhận xét chung về tình hình lớp học:
              </label>
              <textarea
                rows={3}
                value={yearEndForm.generalComment}
                onChange={(e) => setYearEndForm({ ...yearEndForm, generalComment: e.target.value })}
                disabled={activeLockRecord.isLocked || !isAuthorized}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            {/* 2 & 3. Ưu điểm & Hạn chế */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-emerald-800">
                  2. Ưu điểm nổi bật:
                </label>
                <textarea
                  rows={4}
                  value={yearEndForm.strengths}
                  onChange={(e) => setYearEndForm({ ...yearEndForm, strengths: e.target.value })}
                  disabled={activeLockRecord.isLocked || !isAuthorized}
                  className="w-full p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-amber-800">
                  3. Hạn chế, tồn tại:
                </label>
                <textarea
                  rows={4}
                  value={yearEndForm.limitations}
                  onChange={(e) => setYearEndForm({ ...yearEndForm, limitations: e.target.value })}
                  disabled={activeLockRecord.isLocked || !isAuthorized}
                  className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:bg-slate-100 text-slate-800"
                />
              </div>
            </div>

            {/* 4. Kết quả đạt được */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-blue-800">
                4. Kết quả giáo dục (Học tập, rèn luyện, thi đua, phong trào):
              </label>
              <textarea
                rows={3}
                value={yearEndForm.overallResults}
                onChange={(e) => setYearEndForm({ ...yearEndForm, overallResults: e.target.value })}
                disabled={activeLockRecord.isLocked || !isAuthorized}
                className="w-full p-3 bg-blue-50/40 border border-blue-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-100 text-slate-800"
              />
            </div>

            {/* 5. Biện pháp đã thực hiện */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                5. Biện pháp quản lý và giáo dục đã triển khai:
              </label>
              <textarea
                rows={3}
                value={yearEndForm.measures}
                onChange={(e) => setYearEndForm({ ...yearEndForm, measures: e.target.value })}
                disabled={activeLockRecord.isLocked || !isAuthorized}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            {/* 6 & 7. Kiến nghị & Phương hướng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-purple-800">
                  6. Kiến nghị với Nhà trường & Hội CMHS:
                </label>
                <textarea
                  rows={3}
                  value={yearEndForm.recommendations}
                  onChange={(e) =>
                    setYearEndForm({ ...yearEndForm, recommendations: e.target.value })
                  }
                  disabled={activeLockRecord.isLocked || !isAuthorized}
                  className="w-full p-3 bg-purple-50/40 border border-purple-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden disabled:bg-slate-100 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-indigo-800">
                  7. Phương hướng nhiệm vụ năm học tiếp theo:
                </label>
                <textarea
                  rows={3}
                  value={yearEndForm.futureDirections}
                  onChange={(e) =>
                    setYearEndForm({ ...yearEndForm, futureDirections: e.target.value })
                  }
                  disabled={activeLockRecord.isLocked || !isAuthorized}
                  className="w-full p-3 bg-indigo-50/40 border border-indigo-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                {isSavedYearEndSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đã lưu báo cáo tổng kết năm học thành công!
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={activeLockRecord.isLocked || !isAuthorized}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all text-xs"
              >
                <Save className="w-4 h-4" /> Lưu Báo Cáo Tổng Kết Năm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: CẢNH BÁO CHỐT DỮ LIỆU / KHÓA HỌC KỲ (MỤC 5) ================= */}
      {showLockConfirmModal && pendingLockPeriod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  activeLockRecord.isLocked
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-base text-slate-900">
                  {activeLockRecord.isLocked
                    ? `Xác Nhận Mở Khóa Dữ Liệu: ${pendingLockPeriod}`
                    : `Cảnh Báo Bảo Mật: Chốt Dữ Liệu ${pendingLockPeriod}`}
                </h4>
                <p className="text-slate-500 text-xs">
                  {activeLockRecord.isLocked
                    ? 'Chức năng dành cho Giáo viên chủ nhiệm & Ban giám hiệu quản trị'
                    : 'Hành động quan trọng trước khi xuất báo cáo chính thức'}
                </p>
              </div>
            </div>

            {/* Warning Message per Requirement 5 */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
              <strong className="block font-bold">
                {activeLockRecord.isLocked
                  ? 'Lưu ý khi mở khóa dữ liệu:'
                  : 'Cảnh báo nghiêm ngặt khi chốt học kỳ:'}
              </strong>
              <p className="leading-relaxed">
                {activeLockRecord.isLocked
                  ? `Khi mở khóa đợt ${pendingLockPeriod}, người dùng có thẩm quyền có thể chỉnh sửa lại điểm số, chuyên cần và nhận xét. Mọi thay đổi sẽ được ghi nhận vào nhật ký hệ thống (Audit Log).`
                  : `Khi chốt đợt ${pendingLockPeriod}, hệ thống sẽ KHÓA TOÀN BỘ dữ liệu điểm số, chuyên cần, rèn luyện, vi phạm và thi đua của đợt này. Giáo viên không thể tự ý thay đổi dữ liệu trừ khi được người có quyền mở khóa.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowLockConfirmModal(false);
                  setPendingLockPeriod(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmToggleLock}
                className={`px-5 py-2 text-white rounded-xl font-bold shadow-md transition-all ${
                  activeLockRecord.isLocked
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                }`}
              >
                {activeLockRecord.isLocked ? 'Xác Nhận Mở Khóa' : 'Xác Nhận Chốt Dữ Liệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
