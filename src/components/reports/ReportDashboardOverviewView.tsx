import React, { useMemo } from 'react';
import {
  Users,
  Clock,
  BookOpen,
  Smile,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Compass,
  Trophy,
  Award,
  FileText,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportMasterTab } from './HomeroomReportsMasterView';
import { exportAllDataToSingleWorkbook } from '../../utils/excelExport';

interface ReportDashboardOverviewViewProps {
  onNavigateTab: (tab: ReportMasterTab) => void;
  onOpenPreview?: (contentId: string, title: string) => void;
}

export const ReportDashboardOverviewView: React.FC<ReportDashboardOverviewViewProps> = ({
  onNavigateTab,
  onOpenPreview,
}) => {
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
    currentUser,
  } = useApp();

  // 11 Indicators aggregated purely from source data
  const indicators = useMemo(() => {
    const classId = currentClass?.id || 'class-7-1';
    const students = currentClassStudents;
    const totalStudents = students.length;

    // 1 & 2. Sĩ số & Cơ cấu nam/nữ
    const maleCount = students.filter((s) => s.gender === 'Nam').length;
    const femaleCount = students.filter((s) => s.gender === 'Nữ').length;
    const malePct = totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0;
    const femalePct = totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 0;
    const policyCount = students.filter(
      (s) => s.isPoorHousehold || (s.policyPriority && s.policyPriority !== 'Không')
    ).length;
    const ethnicCount = students.filter((s) => s.ethnicity && s.ethnicity !== 'Kinh').length;

    // 3. Chuyên cần
    const classAtt = attendanceRecords.filter((r) => r.classId === classId);
    const totalAttSlots = classAtt.length;
    const presentCount = classAtt.filter((r) => r.status === 'Có mặt').length;
    const excusedCount = classAtt.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcusedCount = classAtt.filter((r) => r.status === 'Nghỉ không phép').length;
    const lateCount = classAtt.filter((r) => r.status === 'Đi muộn').length;
    const attRate =
      totalAttSlots > 0
        ? Math.round(((totalAttSlots - (excusedCount + unexcusedCount)) / totalAttSlots) * 100)
        : 98;

    // 4. Học tập (TT22)
    const classScores = academicScores.filter((s) => s.classId === classId);
    const goodScores = classScores.filter(
      (s) => s.evaluationGrade === 'Tốt' || (s.score !== null && s.score >= 8.0)
    ).length;
    const fairScores = classScores.filter(
      (s) => s.evaluationGrade === 'Khá' || (s.score !== null && s.score >= 6.5 && s.score < 8.0)
    ).length;
    const passScores = classScores.filter(
      (s) => s.evaluationGrade === 'Đạt' || (s.score !== null && s.score >= 5.0 && s.score < 6.5)
    ).length;
    const failScores = classScores.filter(
      (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5.0)
    ).length;
    const totalScoresCount = Math.max(classScores.length, 1);
    const goodScorePct = Math.round((goodScores / totalScoresCount) * 100);
    const fairScorePct = Math.round((fairScores / totalScoresCount) * 100);
    const passScorePct = Math.round((passScores / totalScoresCount) * 100);
    const failScorePct = Math.round((failScores / totalScoresCount) * 100);

    // 5. Rèn luyện
    const classConduct = conductRecords.filter((c) => c.classId === classId);
    const goodConduct = classConduct.filter((c) => c.grade === 'Tốt').length;
    const fairConduct = classConduct.filter((c) => c.grade === 'Khá').length;
    const passConduct = classConduct.filter((c) => c.grade === 'Đạt').length;
    const failConduct = classConduct.filter((c) => c.grade === 'Chưa đạt').length;
    const totalConductCount = Math.max(classConduct.length, 1);
    const goodConductPct = Math.round((goodConduct / totalConductCount) * 100);
    const fairConductPct = Math.round((fairConduct / totalConductCount) * 100);

    // 6. Vi phạm
    const classViolations = violationRecords.filter((v) => v.classId === classId);
    const minorViol = classViolations.filter((v) => v.severity === 'Nhắc nhở').length;
    const mediumViol = classViolations.filter(
      (v) => v.severity === 'Khiển trách' || v.severity === 'Cần phối hợp phụ huynh'
    ).length;
    const severeViol = classViolations.filter((v) => v.severity === 'Cảnh cáo trước lớp').length;
    const resolvedViol = classViolations.filter(
      (v) => v.resultAfterEducation && v.resultAfterEducation.toLowerCase().includes('tiến bộ')
    ).length;

    // 7. Tiến bộ
    const classProgress = studentProgressEntries.filter((p) => p.classId === classId);
    const distinctProgressStudents = new Set(classProgress.map((p) => p.studentId)).size;

    // 8. Năng khiếu
    const classTalents = talentProfiles.filter((t) => t.classId === classId);
    const sportTalents = classTalents.filter((t) => t.field === 'Thể dục thể thao').length;
    const artTalents = classTalents.filter(
      (t) => t.field === 'Âm nhạc' || t.field === 'Nghệ thuật & Mĩ thuật'
    ).length;
    const leadershipTalents = classTalents.filter(
      (t) => t.field === 'Kỹ năng Đội - Hoạt náo' || t.field === 'Toán học' || t.field === 'Tin học'
    ).length;

    // 9. Hoạt động
    const classActs = classActivities.filter((a) => a.classId === classId);
    const distinctParticipants = new Set(classActs.flatMap((a) => a.participantStudentIds)).size;
    const actParticipationRate =
      totalStudents > 0 ? Math.round((distinctParticipants / totalStudents) * 100) : 0;

    // 10. Thi đua 4 tổ
    const classComps = groupCompetitionRecords.filter((c) => c.classId === classId);
    const groupScores: { [group: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };
    classComps.forEach((c) => {
      groupScores[c.groupNumber] = (groupScores[c.groupNumber] || 0) + (c.totalScore || 0);
    });
    const rankedGroups = [1, 2, 3, 4]
      .map((g) => ({ groupNumber: g, score: groupScores[g] }))
      .sort((a, b) => b.score - a.score);

    // 11. Khen thưởng
    const classAwards = awardRecords.filter((aw) => aw.classId === classId);
    const schoolLevelAwards = classAwards.filter((aw) => aw.level === 'Trường').length;
    const districtAwards = classAwards.filter((aw) => aw.level === 'Cụm / Huyện / TP').length;
    const cityAwards = classAwards.filter(
      (aw) => aw.level === 'Tỉnh' || aw.level === 'Quốc gia'
    ).length;

    return {
      totalStudents,
      maleCount,
      femaleCount,
      malePct,
      femalePct,
      policyCount,
      ethnicCount,
      totalAttSlots,
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      attRate,
      goodScores,
      fairScores,
      passScores,
      failScores,
      goodScorePct,
      fairScorePct,
      passScorePct,
      failScorePct,
      goodConduct,
      fairConduct,
      passConduct,
      failConduct,
      goodConductPct,
      fairConductPct,
      classViolationsCount: classViolations.length,
      minorViol,
      mediumViol,
      severeViol,
      resolvedViol,
      progressCount: classProgress.length,
      distinctProgressStudents,
      talentsCount: classTalents.length,
      sportTalents,
      artTalents,
      leadershipTalents,
      actsCount: classActs.length,
      distinctParticipants,
      actParticipationRate,
      rankedGroups,
      awardsCount: classAwards.length,
      schoolLevelAwards,
      districtAwards,
      cityAwards,
    };
  }, [
    currentClass,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    groupCompetitionRecords,
    awardRecords,
    talentProfiles,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportAllDataToSingleWorkbook(
      currentClassStudents,
      attendanceRecords,
      academicScores,
      subjectTrackings,
      conductRecords,
      violationRecords,
      classActivities,
      groupCompetitionRecords,
      awardRecords,
      currentClass,
      currentSchoolYear,
      school
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Header & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                GIAI ĐOẠN 9 • TRANG BÁO CÁO TỔNG QUAN
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                11 Chỉ số cốt lõi Sổ Chủ Nhiệm
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Báo Cáo Toàn Diện • Lớp {currentClass?.className}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tổng hợp dữ liệu nguồn chính thức phục vụ quản trị lớp học, in sổ chủ nhiệm mẫu Bộ GD&ĐT, xuất file Excel và trình Ban Giám Hiệu.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenPreview && (
              <button
                onClick={() =>
                  onOpenPreview(
                    'class-summary',
                    `Xem trước báo cáo tổng hợp lớp ${currentClass?.className}`
                  )
                }
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs border border-white/10"
              >
                <Eye className="w-4 h-4" /> Xem trước (Preview)
              </button>
            )}

            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
            >
              <Download className="w-4 h-4" /> Xuất File Excel
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/30"
            >
              <Printer className="w-4 h-4" /> In Báo Cáo / Xuất PDF
            </button>
          </div>
        </div>

        {/* Quick Jump Buttons to other Phase 9 modules */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('class-report')}
            className="p-2.5 bg-white/5 hover:bg-white/15 rounded-xl text-left transition-colors flex items-center justify-between border border-white/5 group"
          >
            <span className="font-bold text-slate-200">1. Báo Cáo Lớp Tổng Hợp</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigateTab('student-report')}
            className="p-2.5 bg-white/5 hover:bg-white/15 rounded-xl text-left transition-colors flex items-center justify-between border border-white/5 group"
          >
            <span className="font-bold text-slate-200">2. Báo Cáo Từng Học Sinh</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigateTab('print-book')}
            className="p-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-xl text-left transition-colors flex items-center justify-between border border-indigo-400/20 group"
          >
            <span className="font-black text-amber-300">3. In Sổ Chủ Nhiệm (Liên tục)</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigateTab('export-data')}
            className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl text-left transition-colors flex items-center justify-between border border-emerald-400/20 group"
          >
            <span className="font-black text-emerald-300">4. Xuất Excel 8 Bảng Chuẩn</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          11 CORE INDICATORS GRID (DASHBOARD BÁO CÁO - GIAI ĐOẠN 9)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CHỈ SỐ 1 & 2: SĨ SỐ VÀ CƠ CẤU NAM / NỮ */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">1 & 2. Sĩ Số & Cơ Cấu Giới Tính</h4>
                <span className="text-[11px] text-slate-500">Phân bố học sinh toàn diện</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-black text-xs rounded-xl">
              {indicators.totalStudents} HS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
              <span className="text-[11px] text-sky-800 font-bold block">Nam</span>
              <div className="text-xl font-black text-sky-950 mt-0.5">
                {indicators.maleCount} <span className="text-xs font-bold text-sky-700">({indicators.malePct}%)</span>
              </div>
            </div>
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100">
              <span className="text-[11px] text-pink-800 font-bold block">Nữ</span>
              <div className="text-xl font-black text-pink-950 mt-0.5">
                {indicators.femaleCount} <span className="text-xs font-bold text-pink-700">({indicators.femalePct}%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex justify-between">
              <span>Diện chính sách / ưu tiên:</span>
              <strong className="text-slate-900">{indicators.policyCount} em</strong>
            </div>
            <div className="flex justify-between">
              <span>Dân tộc thiểu số:</span>
              <strong className="text-slate-900">{indicators.ethnicCount} em</strong>
            </div>
            <div className="flex justify-between">
              <span>Phòng học & Ca học:</span>
              <strong className="text-slate-900">{currentClass?.roomNumber || 'P.204'} • {currentClass?.studyShift || 'Sáng'}</strong>
            </div>
          </div>
        </div>

        {/* CHỈ SỐ 3: CHUYÊN CẦN */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">3. Chuyên Cần & Điểm Danh</h4>
                <span className="text-[11px] text-slate-500">Tỷ lệ đi học và vắng phép</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-xs rounded-xl">
              {indicators.attRate}% đi học
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600">Mức độ chuyên cần trung bình:</span>
              <span className="text-emerald-700 font-black">{indicators.attRate}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(indicators.attRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Vắng phép</span>
              <strong className="text-amber-700 font-black">{indicators.excusedCount}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Không phép</span>
              <strong className="text-rose-700 font-black">{indicators.unexcusedCount}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Đi muộn</span>
              <strong className="text-blue-700 font-black">{indicators.lateCount}</strong>
            </div>
          </div>
        </div>

        {/* CHỈ SỐ 4: HỌC TẬP (THEO TT22) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">4. Kết Quả Học Tập (TT22)</h4>
                <span className="text-[11px] text-slate-500">Đánh giá 12 môn chính khóa</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-xl">
              {indicators.goodScorePct}% Tốt
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold block">Tốt</span>
              <strong className="text-sm font-black text-emerald-950">{indicators.goodScores}</strong>
              <div className="text-[9px] text-emerald-700 font-bold">{indicators.goodScorePct}%</div>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-[10px] text-blue-800 font-bold block">Khá</span>
              <strong className="text-sm font-black text-blue-950">{indicators.fairScores}</strong>
              <div className="text-[9px] text-blue-700 font-bold">{indicators.fairScorePct}%</div>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-[10px] text-amber-800 font-bold block">Đạt</span>
              <strong className="text-sm font-black text-amber-950">{indicators.passScores}</strong>
              <div className="text-[9px] text-amber-700 font-bold">{indicators.passScorePct}%</div>
            </div>
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="text-[10px] text-rose-800 font-bold block">Chưa đạt</span>
              <strong className="text-sm font-black text-rose-950">{indicators.failScores}</strong>
              <div className="text-[9px] text-rose-700 font-bold">{indicators.failScorePct}%</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Tỷ lệ đạt chuẩn trở lên (Tốt + Khá + Đạt):</span>
            <strong className="text-emerald-700 font-bold">
              {100 - indicators.failScorePct}%
            </strong>
          </div>
        </div>

        {/* CHỈ SỐ 5: RÈN LUYỆN */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">5. Rèn Luyện & Đạo Đức</h4>
                <span className="text-[11px] text-slate-500">Đánh giá hạnh kiểm từng tháng/kỳ</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-black text-xs rounded-xl">
              {indicators.goodConductPct}% Tốt
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold block">Tốt</span>
              <strong className="text-sm font-black text-emerald-950">{indicators.goodConduct}</strong>
            </div>
            <div className="p-2 bg-sky-50 border border-sky-100 rounded-xl">
              <span className="text-[10px] text-sky-800 font-bold block">Khá</span>
              <strong className="text-sm font-black text-sky-950">{indicators.fairConduct}</strong>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-[10px] text-amber-800 font-bold block">Đạt</span>
              <strong className="text-sm font-black text-amber-950">{indicators.passConduct}</strong>
            </div>
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="text-[10px] text-rose-800 font-bold block">Chưa đạt</span>
              <strong className="text-sm font-black text-rose-950">{indicators.failConduct}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Tỷ lệ xếp loại Tốt & Khá:</span>
            <strong className="text-emerald-700 font-bold">
              {indicators.goodConductPct + indicators.fairConductPct}%
            </strong>
          </div>
        </div>

        {/* CHỈ SỐ 6: VI PHẠM NỀ NẾP */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">6. Nhật Ký Vi Phạm Kỷ Luật</h4>
                <span className="text-[11px] text-slate-500">Giáo dục và khắc phục sai phạm</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-black text-xs rounded-xl">
              {indicators.classViolationsCount} vụ việc
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Mức Nhẹ</span>
              <strong className="text-sm font-black text-slate-900">{indicators.minorViol}</strong>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-800 font-bold block">Trung bình</span>
              <strong className="text-sm font-black text-amber-950">{indicators.mediumViol}</strong>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-800 font-bold block">Nghiêm trọng</span>
              <strong className="text-sm font-black text-rose-950">{indicators.severeViol}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Đã chuyển biến tích cực sau giáo dục:</span>
            <strong className="text-emerald-700 font-bold">
              {indicators.resolvedViol}/{indicators.classViolationsCount} vụ
            </strong>
          </div>
        </div>

        {/* CHỈ SỐ 7: TIẾN BỘ */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-100 text-teal-700 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">7. Ghi Nhận Tiến Bộ</h4>
                <span className="text-[11px] text-slate-500">Sự thay đổi tích cực của học sinh</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-black text-xs rounded-xl">
              {indicators.distinctProgressStudents} học sinh
            </span>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs space-y-1">
            <div className="flex justify-between font-bold text-teal-950">
              <span>Tổng số lượt ghi nhận tiến bộ:</span>
              <span>{indicators.progressCount} lần</span>
            </div>
            <p className="text-[11px] text-teal-800 mt-1">
              Các em có chuyển biến rõ rệt về tinh thần tự giác, ý thức làm bài tập về nhà và tích cực phát biểu xây dựng bài.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('student-report')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
          >
            Xem danh sách học sinh tiến bộ <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CHỈ SỐ 8: NĂNG KHIẾU */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">8. Hồ Sơ Năng Khiếu</h4>
                <span className="text-[11px] text-slate-500">Phát hiện và bồi dưỡng tài năng</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-black text-xs rounded-xl">
              {indicators.talentsCount} hồ sơ
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Thể thao</span>
              <strong className="text-sm font-black text-purple-900">{indicators.sportTalents}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Văn nghệ</span>
              <strong className="text-sm font-black text-purple-900">{indicators.artTalents}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Cán bộ / MC</span>
              <strong className="text-sm font-black text-purple-900">{indicators.leadershipTalents}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Nòng cốt tham gia các giải Thể thao học đường, Văn nghệ 20/11 và Nghi thức Đội.
          </div>
        </div>

        {/* CHỈ SỐ 9: HOẠT ĐỘNG TẬP THỂ */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-2xl">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">9. Hoạt Động Phong Trào</h4>
                <span className="text-[11px] text-slate-500">Sự kiện tập thể và trải nghiệm</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-800 font-black text-xs rounded-xl">
              {indicators.actsCount} sự kiện
            </span>
          </div>

          <div className="p-3 bg-cyan-50/50 rounded-2xl border border-cyan-100 text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-cyan-950">
              <span>Tỷ lệ tham gia tập thể:</span>
              <span className="text-cyan-700 font-black">{indicators.actParticipationRate}% ({indicators.distinctParticipants}/{indicators.totalStudents} HS)</span>
            </div>
            <div className="h-2 bg-cyan-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full"
                style={{ width: `${indicators.actParticipationRate}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            100% học sinh tham gia phong trào kế hoạch nhỏ, hội diễn văn nghệ và ngày hội STEM.
          </div>
        </div>

        {/* CHỈ SỐ 10: THI ĐUA 4 TỔ */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">10. Bảng Thi Đua 4 Tổ Tự Quản</h4>
                <span className="text-[11px] text-slate-500">Xếp hạng và điểm tích lũy</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-black text-xs rounded-xl">
              Tổ {indicators.rankedGroups[0]?.groupNumber || 1} Dẫn đầu
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            {indicators.rankedGroups.map((g, idx) => (
              <div
                key={g.groupNumber}
                className={`p-2 rounded-xl border ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-black shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-500">Tổ {g.groupNumber}</div>
                <div className="text-sm font-black mt-0.5">{g.score} đ</div>
                <div className="text-[9px] font-bold text-slate-400">Hạng {idx + 1}</div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Điểm thi đua được chấm hàng tuần dựa trên nền nếp, truy bài, vệ sinh và hoa điểm tốt.
          </div>
        </div>

        {/* CHỈ SỐ 11: KHEN THƯỞNG */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-yellow-100 text-yellow-700 rounded-2xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">11. Khen Thưởng & Thành Tích</h4>
                <span className="text-[11px] text-slate-500">Vinh danh cá nhân và tập thể</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-800 font-black text-xs rounded-xl">
              {indicators.awardsCount} giải thưởng
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Cấp Trường</span>
              <strong className="text-sm font-black text-yellow-950">{indicators.schoolLevelAwards}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Quận/Huyện</span>
              <strong className="text-sm font-black text-yellow-950">{indicators.districtAwards}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Tỉnh/TP</span>
              <strong className="text-sm font-black text-yellow-950">{indicators.cityAwards}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Bao gồm danh hiệu Học sinh Xuất sắc, Học sinh Giỏi, giải Học sinh giỏi và Thể dục thể thao.
          </div>
        </div>

      </div>

      {/* Action Footer Callout */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-black text-base text-slate-900 tracking-tight">
            Sẵn sàng lập hồ sơ và in sổ chủ nhiệm năm học {currentSchoolYear.name}?
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Mọi dữ liệu trên đều được trích xuất tự động và đồng bộ trực tiếp từ các module quản lý.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('print-book')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Mở Module IN SỔ CHỦ NHIỆM
          </button>
          <button
            onClick={() => onNavigateTab('export-data')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Xuất Toàn Bộ Excel
          </button>
        </div>
      </div>
    </div>
  );
};
