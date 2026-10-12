import React, { useMemo, useState } from 'react';
import {
  FileText,
  Printer,
  Eye,
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
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAllDataToSingleWorkbook } from '../../utils/excelExport';
import { PrintPreviewModal } from '../print/PrintPreviewModal';

interface ClassSummaryReportViewProps {
  onOpenPreview?: (contentId: string, title: string) => void;
}

export const ClassSummaryReportView: React.FC<ClassSummaryReportViewProps> = ({
  onOpenPreview,
}) => {
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
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
    yearEndSummaryReport,
    currentUser,
  } = useApp();

  // Summary indicators computed from actual source data
  const summary = useMemo(() => {
    const totalStudents = currentClassStudents.length;
    const maleCount = currentClassStudents.filter((s) => s.gender === 'Nam').length;
    const femaleCount = currentClassStudents.filter((s) => s.gender === 'Nữ').length;
    const policyCount = currentClassStudents.filter(
      (s) => s.policyPriority && s.policyPriority !== 'Không'
    ).length;

    // Attendance
    const classAtt = attendanceRecords.filter((r) => r.classId === (currentClass?.id || 'class-7-1'));
    const totalSessions = Math.max(
      new Set(classAtt.map((r) => `${r.date}_${r.session}_${r.period || 'buoi'}`)).size,
      1
    );
    const presentRecords = classAtt.filter((r) => r.status === 'Có mặt').length;
    const excusedRecords = classAtt.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcusedRecords = classAtt.filter((r) => r.status === 'Nghỉ không phép').length;
    const lateRecords = classAtt.filter((r) => r.status === 'Đi muộn').length;
    const totalSlots = totalStudents * totalSessions;
    const avgAttendanceRate =
      totalSlots > 0
        ? Math.round(((totalSlots - (excusedRecords + unexcusedRecords)) / totalSlots) * 100)
        : 100;

    // Academic
    const classScores = academicScores.filter((s) => s.classId === (currentClass?.id || 'class-7-1'));
    const goodAcademicCount = classScores.filter(
      (s) => s.evaluationGrade === 'Tốt' || (s.score !== null && s.score >= 8.0)
    ).length;
    const fairAcademicCount = classScores.filter(
      (s) => s.evaluationGrade === 'Khá' || (s.score !== null && s.score >= 6.5 && s.score < 8.0)
    ).length;
    const passAcademicCount = classScores.filter(
      (s) => s.evaluationGrade === 'Đạt' || (s.score !== null && s.score >= 5.0 && s.score < 6.5)
    ).length;
    const failAcademicCount = classScores.filter(
      (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5.0)
    ).length;
    const totalEvaluated = Math.max(classScores.length, 1);

    // Conduct
    const classConduct = conductRecords.filter((c) => c.classId === (currentClass?.id || 'class-7-1'));
    const goodConductCount = classConduct.filter((c) => c.grade === 'Tốt').length;
    const fairConductCount = classConduct.filter((c) => c.grade === 'Khá').length;
    const passConductCount = classConduct.filter((c) => c.grade === 'Đạt').length;
    const failConductCount = classConduct.filter((c) => c.grade === 'Chưa đạt').length;

    // Violations & Progress
    const classViolations = violationRecords.filter((v) => v.classId === (currentClass?.id || 'class-7-1'));
    const classProgress = studentProgressEntries.filter((p) => p.classId === (currentClass?.id || 'class-7-1'));

    // Activities
    const classActs = classActivities.filter((a) => a.classId === (currentClass?.id || 'class-7-1'));
    const participantsSet = new Set(classActs.flatMap((a) => a.participantStudentIds));

    // Competition
    const classComps = groupCompetitionRecords.filter((c) => c.classId === (currentClass?.id || 'class-7-1'));

    // Awards
    const classAwards = awardRecords.filter((aw) => aw.classId === (currentClass?.id || 'class-7-1'));

    return {
      totalStudents,
      maleCount,
      femaleCount,
      policyCount,
      totalSessions,
      avgAttendanceRate,
      excusedRecords,
      unexcusedRecords,
      lateRecords,
      goodAcademicCount,
      fairAcademicCount,
      passAcademicCount,
      failAcademicCount,
      goodAcademicPct: Math.round((goodAcademicCount / totalEvaluated) * 100),
      fairAcademicPct: Math.round((fairAcademicCount / totalEvaluated) * 100),
      passAcademicPct: Math.round((passAcademicCount / totalEvaluated) * 100),
      failAcademicPct: Math.round((failAcademicCount / totalEvaluated) * 100),
      goodConductCount,
      fairConductCount,
      passConductCount,
      failConductCount,
      classViolations,
      classProgress,
      classActs,
      participantCount: participantsSet.size,
      classComps,
      classAwards,
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportFullExcel = () => {
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
      {/* Top Banner and Actions (Screen only) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            BÁO CÁO TỔNG HỢP TOÀN DIỆN LỚP {currentClass?.className}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu nguồn chính thức phục vụ nộp báo cáo Ban Giám Hiệu và Hội nghị Phụ huynh
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (onOpenPreview) {
                onOpenPreview(
                  'class-summary',
                  `Báo cáo tổng hợp lớp ${currentClass?.className}`
                );
              } else {
                setInternalPreviewOpen(true);
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4" /> Xem trước (Preview)
          </button>

          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" /> Xuất Excel Toàn Bộ Lớp
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-4 h-4" /> In Báo Cáo A4 / Xuất PDF
          </button>
        </div>
      </div>

      {/* Printable Class Report */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-600">
            <div>{school.districtAuthority}</div>
            <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          </div>
          <div className="flex items-center justify-between text-xs font-black uppercase text-slate-900">
            <div>{school.name}</div>
            <div>Độc lập - Tự do - Hạnh phúc</div>
          </div>
          <div className="pt-3">
            <h2 className="text-base sm:text-xl font-black uppercase text-slate-900 tracking-tight">
              BÁO CÁO TỔNG HỢP CÔNG TÁC CHỦ NHIỆM LỚP {currentClass?.className}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Năm học: <strong>{currentSchoolYear.name}</strong> • Phòng học: <strong>{currentClass?.roomNumber}</strong> • GVCN: <strong>{currentClass?.homeroomTeacherName}</strong>
            </p>
          </div>
        </div>

        {/* 1. Sĩ số & Cơ cấu */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" /> 1. SĨ SỐ VÀ CƠ CẤU HỌC SINH
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Tổng sĩ số</span>
              <strong className="text-lg font-black text-slate-900">{summary.totalStudents} học sinh</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Học sinh Nam</span>
              <strong className="text-lg font-black text-blue-700">{summary.maleCount} ({Math.round((summary.maleCount / summary.totalStudents) * 100)}%)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Học sinh Nữ</span>
              <strong className="text-lg font-black text-pink-700">{summary.femaleCount} ({Math.round((summary.femaleCount / summary.totalStudents) * 100)}%)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Diện chính sách / Hỗ trợ</span>
              <strong className="text-lg font-black text-amber-700">{summary.policyCount} học sinh</strong>
            </div>
          </div>
        </div>

        {/* 2. Chuyên cần */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" /> 2. TÌNH HÌNH CHUYÊN CẦN & NỀ NẾP
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 text-[10px] uppercase font-bold block">Tỷ lệ chuyên cần bình quân</span>
              <strong className="text-xl font-black text-emerald-700">{summary.avgAttendanceRate}%</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Tổng lượt nghỉ có phép</span>
              <strong className="text-lg font-black text-slate-800">{summary.excusedRecords} lượt</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Tổng lượt nghỉ không phép</span>
              <strong className="text-lg font-black text-rose-700">{summary.unexcusedRecords} lượt</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Lượt đi muộn</span>
              <strong className="text-lg font-black text-amber-700">{summary.lateRecords} lượt</strong>
            </div>
          </div>
        </div>

        {/* 3. Kết quả học tập */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" /> 3. KẾT QUẢ ĐÁNH GIÁ HỌC TẬP (THÔNG TƯ 22)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <span className="text-sky-800 text-[10px] uppercase font-bold block">Mức Tốt</span>
              <strong className="text-lg font-black text-sky-900">{summary.goodAcademicPct}% ({summary.goodAcademicCount} lượt)</strong>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-800 text-[10px] uppercase font-bold block">Mức Khá</span>
              <strong className="text-lg font-black text-blue-900">{summary.fairAcademicPct}% ({summary.fairAcademicCount} lượt)</strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-amber-800 text-[10px] uppercase font-bold block">Mức Đạt</span>
              <strong className="text-lg font-black text-amber-900">{summary.passAcademicPct}% ({summary.passAcademicCount} lượt)</strong>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-800 text-[10px] uppercase font-bold block">Chưa Đạt</span>
              <strong className="text-lg font-black text-rose-900">{summary.failAcademicPct}% ({summary.failAcademicCount} lượt)</strong>
            </div>
          </div>
        </div>

        {/* 4. Rèn luyện & Kỷ luật */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-pink-600" /> 4. KẾT QUẢ RÈN LUYỆN & PHÁT HIỆN SỰ TIẾN BỘ
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Xếp loại rèn luyện</span>
              <p className="mt-1 font-medium">
                Tốt: <strong>{summary.goodConductCount} HS</strong> • Khá: <strong>{summary.fairConductCount} HS</strong> • Đạt: <strong>{summary.passConductCount} HS</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Vi phạm nề nếp</span>
              <p className="mt-1 font-medium">
                Tổng số: <strong>{summary.classViolations.length} vụ việc</strong> (Đã thực hiện biện pháp giáo dục tích cực)
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Ghi nhận tiến bộ</span>
              <p className="mt-1 font-medium">
                <strong>{summary.classProgress.length} lượt học sinh</strong> có chuyển biến tích cực rõ nét
              </p>
            </div>
          </div>
        </div>

        {/* 5. Hoạt động, Thi đua & Khen thưởng */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600" /> 5. HOẠT ĐỘNG PHONG TRÀO, THI ĐUA & KHEN THƯỞNG
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Hoạt động tập thể</span>
              <p className="mt-1 font-medium">
                Đã tổ chức: <strong>{summary.classActs.length} hoạt động</strong> • Tỷ lệ tham gia: <strong>{Math.round((summary.participantCount / summary.totalStudents) * 100)}%</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Thi đua 4 tổ tự quản</span>
              <p className="mt-1 font-medium">
                Theo dõi 6 tiêu chí: Tổ 1 dẫn đầu, 100% các tổ hoàn thành chỉ tiêu thi đua
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Khen thưởng & Danh hiệu</span>
              <p className="mt-1 font-medium">
                <strong>{summary.classAwards.length} danh hiệu</strong> được công nhận cấp Trường, Thành phố
              </p>
            </div>
          </div>
        </div>

        {/* 6. Đánh giá của GVCN */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="font-bold text-slate-900 block">6. ĐÁNH GIÁ CHUNG CỦA GIÁO VIÊN CHỦ NHIỆM:</span>
          <p className="text-slate-700 leading-relaxed italic">
            "{yearEndSummaryReport.generalComment || `Lớp ${currentClass?.className} trong năm học ${currentSchoolYear.name} duy trì nề nếp tốt, tập thể đoàn kết, học sinh có tinh thần tự giác trong học tập và tích cực tham gia các phong trào thi đua của nhà trường. Đa số học sinh đạt kết quả rèn luyện và học tập từ mức Khá, Tốt trở lên.`}"
          </p>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
          <div className="space-y-16">
            <div>
              <div className="font-bold text-slate-900 uppercase">BAN GIÁM HIỆU PHÊ DUYỆT</div>
              <div className="text-[11px] text-slate-500 italic">(Ký và đóng dấu)</div>
            </div>
            <div className="font-bold text-slate-900">{school.principalName || 'Thầy Hiệu Trưởng'}</div>
          </div>

          <div className="space-y-16">
            <div>
              <div className="font-bold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
            </div>
            <div className="font-bold text-slate-900">
              {currentClass?.homeroomTeacherName || currentUser?.name || 'Cô Lê Thị Kim Ánh'}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Print Preview Modal */}
      <PrintPreviewModal
        isOpen={internalPreviewOpen}
        onClose={() => setInternalPreviewOpen(false)}
        documentTitle={`Báo cáo tổng hợp lớp ${currentClass?.className}`}
      >
        <ClassSummaryReportView />
      </PrintPreviewModal>
    </div>
  );
};
