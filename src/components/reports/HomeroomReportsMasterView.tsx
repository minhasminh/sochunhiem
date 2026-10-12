import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  Calendar,
  Award,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  Smile,
  HeartHandshake,
  Trophy,
  FileSpreadsheet,
  Download,
  Eye,
  Compass,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, EvaluationTerm, ConductTerm } from '../../types';
import { ReportDashboardOverviewView } from './ReportDashboardOverviewView';
import { SemesterSummaryView } from './SemesterSummaryView';
import { StudentCommentsView } from './StudentCommentsView';
import { SingleStudentReportView } from './SingleStudentReportView';
import { ClassSummaryReportView } from './ClassSummaryReportView';
import { DataExportMasterView } from './DataExportMasterView';
import { HomeroomBookPrintView } from '../print/HomeroomBookPrintView';
import { PrintPreviewModal } from '../print/PrintPreviewModal';

const SUBJECT_LIST = [
  'Toán',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Giáo dục công dân',
  'Tin học',
  'Công nghệ',
  'Giáo dục thể chất',
  'Nghệ thuật (Âm nhạc, Mĩ thuật)',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Nội dung giáo dục địa phương',
];

export type ReportMasterTab =
  | 'dashboard-overview'
  | 'student-report'
  | 'class-report'
  | 'print-book'
  | 'export-data'
  | 'academic-class'
  | 'academic-student'
  | 'attendance'
  | 'conduct-summary'
  | 'semester-summary'
  | 'student-comments';

interface HomeroomReportsMasterViewProps {
  initialTab?: ReportMasterTab;
}

export const HomeroomReportsMasterView: React.FC<HomeroomReportsMasterViewProps> = ({
  initialTab,
}) => {
  const {
    currentClass,
    currentSchoolYear,
    school,
    currentClassStudents,
    academicScores,
    subjectTrackings,
    attendanceRecords,
    conductRecords,
    violationRecords,
    studentSupportTags,
    studentProgressEntries,
    classActivities,
    groupCompetitionRecords,
    awardRecords,
    talentProfiles,
    currentUser,
    setSelectedStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ReportMasterTab>(
    initialTab || 'dashboard-overview'
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContentId, setPreviewContentId] = useState<string>('homeroom-book');
  const [previewTitle, setPreviewTitle] = useState<string>('Xem trước Sổ Chủ Nhiệm');

  const handleOpenPreview = (contentId: string, title: string) => {
    setPreviewContentId(contentId);
    setPreviewTitle(title);
    setPreviewModalOpen(true);
  };

  // Filters
  const [selectedTerm, setSelectedTerm] = useState<EvaluationTerm>('Đầu năm');
  const [selectedConductTerm, setSelectedConductTerm] = useState<ConductTerm>('Tháng 9');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentClassStudents[0]?.id || ''
  );

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // ================= 1. BÁO CÁO HỌC TẬP TOÀN LỚP =================
  const classScoresForTerm = useMemo(() => {
    return academicScores.filter(
      (s) => s.classId === (currentClass?.id || 'class-7-1') && s.term === selectedTerm
    );
  }, [academicScores, currentClass, selectedTerm]);

  const subjectSummaryList = useMemo(() => {
    return SUBJECT_LIST.map((subjectName) => {
      const scores = classScoresForTerm.filter((s) => s.subjectName === subjectName);
      const evaluatedCount = scores.filter((s) => s.score !== null || s.evaluationGrade).length;
      const goodCount = scores.filter(
        (s) => s.evaluationGrade === 'Tốt' || (s.score !== null && s.score >= 8.0)
      ).length;
      const fairCount = scores.filter(
        (s) => s.evaluationGrade === 'Khá' || (s.score !== null && s.score >= 6.5 && s.score < 8.0)
      ).length;
      const passCount = scores.filter(
        (s) => s.evaluationGrade === 'Đạt' || (s.score !== null && s.score >= 5.0 && s.score < 6.5)
      ).length;
      const failCount = scores.filter(
        (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5.0)
      ).length;

      const numericScores = scores
        .map((s) => s.score)
        .filter((sc): sc is number => sc !== null && sc !== undefined);
      const avgScore =
        numericScores.length > 0
          ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
          : null;

      // Tracking of this subject by GVCN
      const trackings = subjectTrackings.filter(
        (t) => t.classId === (currentClass?.id || 'class-7-1') && t.subjectName === subjectName
      );
      const standoutCount = trackings.filter((t) => t.trackingStatus === 'nổi bật').length;
      const needSupportCount = trackings.filter((t) => t.trackingStatus === 'cần hỗ trợ').length;
      const progressCount = trackings.filter((t) => t.trackingStatus === 'có tiến bộ').length;

      return {
        subjectName,
        evaluatedCount,
        goodCount,
        fairCount,
        passCount,
        failCount,
        avgScore,
        standoutCount,
        needSupportCount,
        progressCount,
      };
    });
  }, [classScoresForTerm, subjectTrackings, currentClass]);

  // ================= 2. BÁO CÁO HỌC TẬP THEO TỪNG HỌC SINH =================
  const activeStudent = useMemo(() => {
    return currentClassStudents.find((s) => s.id === selectedStudentId) || currentClassStudents[0];
  }, [currentClassStudents, selectedStudentId]);

  const activeStudentScores = useMemo(() => {
    if (!activeStudent) return [];
    return academicScores.filter((s) => s.studentId === activeStudent.id);
  }, [academicScores, activeStudent]);

  const activeStudentTrackings = useMemo(() => {
    if (!activeStudent) return [];
    return subjectTrackings.filter((t) => t.studentId === activeStudent.id);
  }, [subjectTrackings, activeStudent]);

  // Attendance for active student
  const activeStudentAttendance = useMemo(() => {
    if (!activeStudent) return { present: 0, excused: 0, unexcused: 0, late: 0, early: 0, rate: 100 };
    const recs = attendanceRecords.filter((r) => r.studentId === activeStudent.id);
    const present = recs.filter((r) => r.status === 'Có mặt').length;
    const excused = recs.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcused = recs.filter((r) => r.status === 'Nghỉ không phép').length;
    const late = recs.filter((r) => r.status === 'Đi muộn').length;
    const early = recs.filter((r) => r.status === 'Về sớm').length;
    const total = recs.length;
    const rate = total > 0 ? Math.round(((total - (excused + unexcused)) / total) * 100) : 100;
    return { present, excused, unexcused, late, early, rate };
  }, [attendanceRecords, activeStudent]);

  // ================= 3. BÁO CÁO ĐIỂM DANH & CHUYÊN CẦN TOÀN LỚP =================
  const classAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter((r) => r.classId === (currentClass?.id || 'class-7-1'));
  }, [attendanceRecords, currentClass]);

  const totalRecordedSessions = useMemo(() => {
    const set = new Set(classAttendanceRecords.map((r) => `${r.date}_${r.session}_${r.period || 'Cả buổi'}`));
    return Math.max(set.size, 1);
  }, [classAttendanceRecords]);

  const studentAttendanceStats = useMemo(() => {
    return currentClassStudents.map((st) => {
      const recs = classAttendanceRecords.filter((r) => r.studentId === st.id);
      const present = recs.filter((r) => r.status === 'Có mặt').length;
      const excused = recs.filter((r) => r.status === 'Nghỉ có phép').length;
      const unexcused = recs.filter((r) => r.status === 'Nghỉ không phép').length;
      const late = recs.filter((r) => r.status === 'Đi muộn').length;
      const early = recs.filter((r) => r.status === 'Về sớm').length;
      const totalAbsences = excused + unexcused;
      const sessionCount = recs.length || totalRecordedSessions;
      const rate = sessionCount > 0 ? Math.round(((sessionCount - totalAbsences) / sessionCount) * 100) : 100;
      return {
        student: st,
        present,
        excused,
        unexcused,
        late,
        early,
        totalAbsences,
        rate,
      };
    });
  }, [currentClassStudents, classAttendanceRecords, totalRecordedSessions]);

  const classTotalAbsences = useMemo(
    () => studentAttendanceStats.reduce((sum, s) => sum + s.totalAbsences, 0),
    [studentAttendanceStats]
  );
  const classTotalUnexcused = useMemo(
    () => studentAttendanceStats.reduce((sum, s) => sum + s.unexcused, 0),
    [studentAttendanceStats]
  );
  const classAvgAttendanceRate = useMemo(() => {
    if (studentAttendanceStats.length === 0) return 100;
    return Math.round(
      studentAttendanceStats.reduce((acc, curr) => acc + curr.rate, 0) / studentAttendanceStats.length
    );
  }, [studentAttendanceStats]);

  const studentsWithFrequentAbsence = useMemo(() => {
    return studentAttendanceStats.filter((s) => s.totalAbsences >= 2 || s.unexcused > 0);
  }, [studentAttendanceStats]);

  // Filtered students list for search
  const displayedStudents = useMemo(() => {
    return currentClassStudents.filter((st) => {
      if (filterGroup !== 'all' && st.groupNumber !== filterGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.studentCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentClassStudents, filterGroup, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-xs font-semibold uppercase">{school.name}</div>
        <div className="text-sm font-black uppercase mt-1">
          BÁO CÁO TỔNG HỢP THEO DÕI HỌC TẬP VÀ ĐIỂM DANH
        </div>
        <div className="text-xs text-slate-600 mt-1">
          Lớp: {currentClass?.className} • Năm học: {currentSchoolYear.name} • GVCN: {currentClass?.homeroomTeacherName}
        </div>
      </div>

      {/* Top Banner (Screen Only) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  BÁO CÁO TỔNG HỢP HỌC TẬP & ĐIỂM DANH LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {currentClassStudents.length} học sinh
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Chuyên cần: {classAvgAttendanceRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Liên kết đồng bộ: Học sinh → Học tập → Điểm danh → Báo cáo tổng hợp sổ chủ nhiệm
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            In Báo Cáo Chuẩn A4
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Screen Only) */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard-overview')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'dashboard-overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard Báo Cáo (GĐ9)</span>
          </button>

          <button
            onClick={() => setActiveTab('class-report')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'class-report'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Báo Cáo Lớp (GĐ9)</span>
          </button>

          <button
            onClick={() => setActiveTab('student-report')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'student-report'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Báo Cáo Học Sinh (GĐ9)</span>
          </button>

          <button
            onClick={() => setActiveTab('print-book')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'print-book'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>4. IN SỔ CHỦ NHIỆM (GĐ9)</span>
          </button>

          <button
            onClick={() => setActiveTab('export-data')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'export-data'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>5. Xuất Excel (GĐ9)</span>
          </button>

          <button
            onClick={() => setActiveTab('semester-summary')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'semester-summary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>6. Sơ Kết & Tổng Kết (GĐ8)</span>
          </button>

          <button
            onClick={() => setActiveTab('student-comments')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'student-comments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>7. Nhận Xét HS & AI (GĐ8)</span>
          </button>

          <button
            onClick={() => setActiveTab('academic-class')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'academic-class'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>8. Học Tập Toàn Lớp</span>
          </button>

          <button
            onClick={() => setActiveTab('academic-student')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'academic-student'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>9. Phiếu Điểm Từng HS</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>10. Chuyên Cần</span>
            {classTotalAbsences > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-[10px]">
                {classTotalAbsences}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('conduct-summary')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'conduct-summary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>11. Rèn Luyện</span>
            {violationRecords.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-700 text-white flex items-center justify-center text-[10px]">
                {violationRecords.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: BÁO CÁO HỌC TẬP TOÀN LỚP ================= */}
      {activeTab === 'academic-class' && (
        <div className="space-y-6">
          {/* Controls: Chọn Đợt Đánh Giá */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs print:hidden">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Đợt đánh giá / Học kỳ:</span>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as EvaluationTerm)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Đầu năm">Khảo sát Đầu năm</option>
                <option value="Giữa HKI">Giữa Học kỳ I</option>
                <option value="Cuối HKI">Cuối Học kỳ I</option>
                <option value="Giữa HKII">Giữa Học kỳ II</option>
                <option value="Cuối HKII">Cuối Học kỳ II</option>
                <option value="Cả năm">Tổng kết Cả năm</option>
              </select>
            </div>

            <div className="text-slate-500 text-xs">
              Tổng số học sinh lớp: <strong>{currentClassStudents.length}</strong> • Sĩ số đánh giá:{' '}
              <strong>{classScoresForTerm.length > 0 ? 'Đã có dữ liệu' : 'Chưa nhập điểm'}</strong>
            </div>
          </div>

          {/* Table: Tổng Hợp Các Môn Học */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Bảng Tổng Hợp Kết Quả Học Tập Theo Môn • Đợt: {selectedTerm}
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Thống kê kết quả đánh giá theo Thông tư 22/2021/TT-BGDĐT và theo dõi của GVCN
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-4 min-w-[160px]">Môn học</th>
                    <th className="py-3 px-3 text-center w-24">Đã đánh giá</th>
                    <th className="py-3 px-3 text-center w-20 text-emerald-700">Tốt</th>
                    <th className="py-3 px-3 text-center w-20 text-sky-700">Khá</th>
                    <th className="py-3 px-3 text-center w-20 text-amber-700">Đạt</th>
                    <th className="py-3 px-3 text-center w-20 text-rose-700">Chưa đạt</th>
                    <th className="py-3 px-3 text-center w-24">Điểm TB</th>
                    <th className="py-3 px-3 min-w-[200px]">Theo dõi GVCN (Nổi bật / Cần hỗ trợ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectSummaryList.map((item, idx) => (
                    <tr key={item.subjectName} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.subjectName}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-semibold text-slate-700">
                          {item.evaluatedCount}/{currentClassStudents.length}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {item.goodCount > 0 ? item.goodCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-sky-700 bg-sky-50/30">
                        {item.fairCount > 0 ? item.fairCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30">
                        {item.passCount > 0 ? item.passCount : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/30">
                        {item.failCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {item.failCount}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.avgScore !== null ? item.avgScore : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          {item.standoutCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              ⭐ {item.standoutCount} nổi bật
                            </span>
                          )}
                          {item.needSupportCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                              ⚠ {item.needSupportCount} cần hỗ trợ
                            </span>
                          )}
                          {item.progressCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                              📈 {item.progressCount} tiến bộ
                            </span>
                          )}
                          {item.standoutCount === 0 && item.needSupportCount === 0 && item.progressCount === 0 && (
                            <span className="text-slate-400 italic">Duy trì ổn định</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PHIẾU BÁO CÁO TỪNG HỌC SINH ================= */}
      {activeTab === 'academic-student' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên hoặc mã HS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Lọc theo tổ:</span>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="all">Tất cả các tổ</option>
                  <option value={1}>Tổ 1</option>
                  <option value={2}>Tổ 2</option>
                  <option value={3}>Tổ 3</option>
                  <option value={4}>Tổ 4</option>
                </select>
              </div>
            </div>

            {/* Quick Student Selector Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {displayedStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    st.id === activeStudent?.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {st.stt}. {st.fullName}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Report Card */}
          {activeStudent && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Student Header */}
              <div className="p-5 bg-gradient-to-r from-sky-800 to-indigo-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black uppercase">
                    {activeStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black tracking-tight">{activeStudent.fullName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                        Mã HS: {activeStudent.studentCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                        Tổ {activeStudent.groupNumber}
                      </span>
                    </div>
                    <div className="text-xs text-sky-100 mt-1 flex items-center gap-2 flex-wrap">
                      <span>STT: {activeStudent.stt}</span>
                      <span>•</span>
                      <span>Sinh ngày: {activeStudent.birthDate}</span>
                      <span>•</span>
                      <span>Giới tính: {activeStudent.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => setSelectedStudent(activeStudent)}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition-colors"
                  >
                    Xem hồ sơ chi tiết
                  </button>
                </div>
              </div>

              {/* Attendance Summary Strip for Student */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <div className="text-slate-500 font-medium text-[11px]">Có mặt</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">{activeStudentAttendance.present}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">buổi</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <div className="text-slate-500 font-medium text-[11px]">Nghỉ có phép</div>
                  <div className="text-xl font-black text-amber-700 mt-1">{activeStudentAttendance.excused}</div>
                  <div className="text-[10px] text-amber-600 mt-0.5">buổi</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <div className="text-slate-500 font-medium text-[11px]">Nghỉ không phép</div>
                  <div className="text-xl font-black text-rose-700 mt-1">{activeStudentAttendance.unexcused}</div>
                  <div className="text-[10px] text-rose-600 mt-0.5">buổi</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                  <div className="text-slate-500 font-medium text-[11px]">Đi muộn</div>
                  <div className="text-xl font-black text-purple-700 mt-1">{activeStudentAttendance.late}</div>
                  <div className="text-[10px] text-purple-600 mt-0.5">lần</div>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center col-span-2 sm:col-span-1">
                  <div className="text-slate-500 font-medium text-[11px]">Chuyên cần</div>
                  <div className="text-xl font-black text-sky-700 mt-1">{activeStudentAttendance.rate}%</div>
                  <div className="text-[10px] text-sky-600 mt-0.5">tỷ lệ</div>
                </div>
              </div>

              {/* Academic Scores Table for this student */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>Kết Quả Học Tập Tất Cả Các Môn:</span>
                  <span className="text-[11px] text-slate-500">
                    {activeStudentScores.length} đầu điểm đã ghi nhận
                  </span>
                </div>

                {activeStudentScores.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    Chưa có kết quả điểm số cho học sinh này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Môn học</th>
                          <th className="py-2.5 px-3">Kỳ / Thời gian</th>
                          <th className="py-2.5 px-3 text-center">Điểm số</th>
                          <th className="py-2.5 px-3 text-center">Đánh giá TT22</th>
                          <th className="py-2.5 px-3">Nhận xét của giáo viên</th>
                          <th className="py-2.5 px-3">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeStudentScores.map((sc) => (
                          <tr key={sc.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sc.subjectName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{sc.term}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                              {sc.score !== null && sc.score !== undefined ? sc.score : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {sc.evaluationGrade ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    sc.evaluationGrade === 'Tốt'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : sc.evaluationGrade === 'Khá'
                                      ? 'bg-sky-100 text-sky-800'
                                      : sc.evaluationGrade === 'Đạt'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {sc.evaluationGrade}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 italic">
                              {sc.comment || 'Chưa ghi nhận xét'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {sc.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Subject Tracking by Homeroom Teacher for Student */}
              {activeStudentTrackings.length > 0 && (
                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-2 text-xs">
                  <div className="font-bold text-sky-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-700" />
                    Đánh dấu theo dõi môn học của Giáo viên chủ nhiệm:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {activeStudentTrackings.map((tr) => (
                      <div
                        key={tr.id}
                        className="p-3 bg-white rounded-xl border border-sky-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{tr.subjectName}</div>
                          {tr.notes && <div className="text-[11px] text-slate-500 mt-0.5">{tr.notes}</div>}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tr.trackingStatus === 'nổi bật'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tr.trackingStatus === 'ổn định'
                              ? 'bg-sky-100 text-sky-800'
                              : tr.trackingStatus === 'cần hỗ trợ'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tr.trackingStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: BÁO CÁO CHUYÊN CẦN & ĐIỂM DANH ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* NOTICE BANNER: Bắt buộc theo Mục 5 */}
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-amber-950 font-black text-sm block">
                "Đây là cảnh báo dựa trên dữ liệu, không phải kết luận."
              </strong>
              <p>
                Dữ liệu chuyên cần được tổng hợp tự động từ các buổi điểm danh nhằm phục vụ công tác nắm bắt sĩ số, phối hợp với phụ huynh và xây dựng kế hoạch giáo dục của giáo viên chủ nhiệm.
              </p>
            </div>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-500 font-semibold">Tỷ lệ chuyên cần chung</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{classAvgAttendanceRate}%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{totalRecordedSessions} buổi đã ghi nhận</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-500 font-semibold">Tổng lượt nghỉ</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{classTotalAbsences}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">lượt vắng toàn lớp</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-500 font-semibold">Nghỉ không phép</div>
              <div className="text-2xl font-black text-rose-600 mt-1">{classTotalUnexcused}</div>
              <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Cần nhắc nhở</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-500 font-semibold">HS nghỉ nhiều (≥ 2 buổi)</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{studentsWithFrequentAbsence.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">học sinh cần theo dõi</div>
            </div>
          </div>

          {/* Full Class Attendance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Sổ Theo Dõi Chuyên Cần Lớp {currentClass?.className} ({currentClassStudents.length} học sinh)
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Tổng hợp số ngày có mặt, nghỉ có phép, nghỉ không phép, đi muộn của từng học sinh
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
                    <th className="py-3 px-3 text-center w-24 text-emerald-700">Có mặt</th>
                    <th className="py-3 px-3 text-center w-24 text-amber-700">Có phép</th>
                    <th className="py-3 px-3 text-center w-24 text-rose-700">Không phép</th>
                    <th className="py-3 px-3 text-center w-20 text-purple-700">Đi muộn</th>
                    <th className="py-3 px-3 text-center w-20">Về sớm</th>
                    <th className="py-3 px-3 text-center w-24">Chuyên cần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendanceStats.map((item, idx) => (
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
                          onClick={() => {
                            setSelectedStudentId(item.student.id);
                            setActiveTab('academic-student');
                          }}
                          className="hover:text-indigo-700 hover:underline"
                        >
                          {item.student.fullName}
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">
                        Tổ {item.student.groupNumber}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {item.present}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30">
                        {item.excused > 0 ? item.excused : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/30">
                        {item.unexcused > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {item.unexcused}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-purple-700 bg-purple-50/30">
                        {item.late > 0 ? item.late : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {item.early > 0 ? item.early : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            item.rate >= 98
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.rate >= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.rate}%
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
      {/* ================= TAB 4: BÁO CÁO RÈN LUYỆN & KỶ LUẬT (Giai đoạn 6) ================= */}
      {activeTab === 'conduct-summary' && (
        <div className="space-y-6">
          {/* Controls: Chọn Đợt Đánh Giá Rèn Luyện */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs print:hidden">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Đợt đánh giá rèn luyện:</span>
              <select
                value={selectedConductTerm}
                onChange={(e) => setSelectedConductTerm(e.target.value as ConductTerm)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {[
                  'Tháng 9',
                  'Tháng 10',
                  'Tháng 11',
                  'Tháng 12',
                  'Tháng 1',
                  'Tháng 2',
                  'Tháng 3',
                  'Tháng 4',
                  'Tháng 5',
                  'HKI',
                  'HKII',
                  'Cả năm',
                ].map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> In Báo Cáo Rèn Luyện
              </button>
            </div>
          </div>

          {/* Paper A4 Report View */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header Hành chính */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 text-xs">
              <div className="text-center font-serif space-y-0.5">
                <div className="uppercase font-bold text-slate-700 tracking-wider">
                  {school.districtAuthority}
                </div>
                <div className="uppercase font-black text-slate-900 text-sm">
                  {school.name}
                </div>
                <div className="text-[11px] text-slate-500 italic">Địa chỉ: {school.address}</div>
              </div>

              <div className="text-center font-serif space-y-0.5">
                <div className="uppercase font-bold text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="font-bold text-slate-800 text-[11px]">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Huế, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1 py-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                BÁO CÁO TỔNG HỢP RÈN LUYỆN & NỀ NẾP HỌC SINH
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Đợt đánh giá: <strong>{selectedConductTerm}</strong> • Lớp:{' '}
                <strong>{currentClass?.className}</strong> • Năm học:{' '}
                <strong>{currentSchoolYear.code}</strong>
              </p>
            </div>

            {/* Thống kê tỷ lệ rèn luyện */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(() => {
                const termRecords = conductRecords.filter(
                  (r) =>
                    r.classId === (currentClass?.id || 'class-7-1') &&
                    r.term === selectedConductTerm
                );
                const good = termRecords.filter((r) => r.grade === 'Tốt').length;
                const fair = termRecords.filter((r) => r.grade === 'Khá').length;
                const pass = termRecords.filter((r) => r.grade === 'Đạt').length;
                const fail = termRecords.filter((r) => r.grade === 'Chưa đạt').length;
                const total = currentClassStudents.length;

                return (
                  <>
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase">
                        Rèn luyện Tốt
                      </div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">{good} HS</div>
                      <div className="text-[10px] text-emerald-600">
                        {total > 0 ? Math.round((good / total) * 100) : 0}% sĩ số
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                      <div className="text-[11px] font-bold text-blue-800 uppercase">
                        Rèn luyện Khá
                      </div>
                      <div className="text-2xl font-black text-blue-700 mt-1">{fair} HS</div>
                      <div className="text-[10px] text-blue-600">
                        {total > 0 ? Math.round((fair / total) * 100) : 0}% sĩ số
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                      <div className="text-[11px] font-bold text-amber-800 uppercase">
                        Rèn luyện Đạt
                      </div>
                      <div className="text-2xl font-black text-amber-700 mt-1">{pass} HS</div>
                      <div className="text-[10px] text-amber-600">
                        {total > 0 ? Math.round((pass / total) * 100) : 0}% sĩ số
                      </div>
                    </div>

                    <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                      <div className="text-[11px] font-bold text-rose-800 uppercase">
                        Cần Rèn Luyện Thêm
                      </div>
                      <div className="text-2xl font-black text-rose-700 mt-1">{fail} HS</div>
                      <div className="text-[10px] text-rose-600">
                        {total > 0 ? Math.round((fail / total) * 100) : 0}% sĩ số
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Bảng chi tiết rèn luyện */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-600" />
                1. Bảng Đánh Giá Kết Quả Rèn Luyện & Biểu Hiện Học Sinh
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-2 text-center w-10">STT</th>
                      <th className="py-2.5 px-3 w-24">Mã HS</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Họ và tên</th>
                      <th className="py-2.5 px-2 text-center w-12">Tổ</th>
                      <th className="py-2.5 px-3 text-center w-24">Xếp loại</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Biểu hiện tích cực</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Cần cải thiện</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Nhận xét của GVCN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentClassStudents.map((st, idx) => {
                      const rec = conductRecords.find(
                        (r) =>
                          r.studentId === st.id &&
                          r.term === selectedConductTerm &&
                          r.classId === (currentClass?.id || 'class-7-1')
                      );
                      const grade = rec?.grade || 'Tốt';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center text-slate-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">
                            {st.studentCode}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {st.fullName}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600">
                            Tổ {st.groupNumber}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                grade === 'Tốt'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : grade === 'Khá'
                                  ? 'bg-blue-100 text-blue-800'
                                  : grade === 'Đạt'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {rec?.positiveManifestations || 'Chấp hành nề nếp chung'}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {rec?.areasForImprovement || 'Duy trì phong độ'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 italic">
                            {rec?.teacherComment || 'Ý thức kỷ luật tốt'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bảng tổng hợp vi phạm nề nếp */}
            <div className="space-y-3 pt-3">
              <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                2. Tổng Hợp Ghi Nhận Vi Phạm & Kết Quả Giáo Dục Uốn Nắn ({violationRecords.length} vụ việc)
              </h4>

              {violationRecords.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-2xl text-center text-emerald-800 text-xs font-semibold">
                  ✓ Toàn bộ học sinh trong lớp chấp hành nghiêm chỉnh nội quy, không có vi phạm nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3 w-24">Ngày</th>
                        <th className="py-2 px-3 min-w-[150px]">Học sinh</th>
                        <th className="py-2 px-3 min-w-[200px]">Nội dung sự việc</th>
                        <th className="py-2 px-2 text-center w-24">Mức độ</th>
                        <th className="py-2 px-3 min-w-[180px]">Biện pháp giáo dục</th>
                        <th className="py-2 px-3 min-w-[180px]">Kết quả chuyển biến</th>
                        <th className="py-2 px-3 w-28">Người ghi nhận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {violationRecords.map((v) => {
                        const st = currentClassStudents.find((s) => s.id === v.studentId);
                        return (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-700">{v.date}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {st?.fullName} ({st?.studentCode})
                            </td>
                            <td className="py-2 px-3 text-slate-800">{v.title}</td>
                            <td className="py-2 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                {v.severity}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-700">{v.educationalMeasures}</td>
                            <td className="py-2 px-3 text-emerald-800 font-medium">
                              {v.resultAfterEducation}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{v.recordedBy}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Chữ ký Hành chính */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
              <div className="space-y-16">
                <div>
                  <div className="font-bold text-slate-900 uppercase">BAN GIÁM HIỆU DUYỆT</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-slate-900">
                  {school.principalName || 'Thầy Hiệu Trưởng'}
                </div>
              </div>

              <div className="space-y-16">
                <div>
                  <div className="font-bold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-slate-900">
                  {currentUser?.name || 'Cô Lê Thị Kim Ánh'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= GIAI ĐOẠN 9: CÁC VIEW BÁO CÁO, IN SỔ, XUẤT DỮ LIỆU ================= */}
      {activeTab === 'dashboard-overview' && (
        <ReportDashboardOverviewView
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenPreview={handleOpenPreview}
        />
      )}

      {activeTab === 'class-report' && (
        <ClassSummaryReportView onOpenPreview={handleOpenPreview} />
      )}

      {activeTab === 'student-report' && (
        <SingleStudentReportView onOpenPreview={handleOpenPreview} />
      )}

      {activeTab === 'print-book' && (
        <HomeroomBookPrintView onOpenPreview={handleOpenPreview} />
      )}

      {activeTab === 'export-data' && (
        <DataExportMasterView onOpenPreview={handleOpenPreview} />
      )}

      {/* ================= GIAI ĐOẠN 8: SƠ KẾT & TỔNG KẾT NĂM HỌC ================= */}
      {activeTab === 'semester-summary' && <SemesterSummaryView />}

      {/* ================= GIAI ĐOẠN 8: VIẾT NHẬN XÉT HỌC SINH & TRỢ LÝ AI ================= */}
      {activeTab === 'student-comments' && <StudentCommentsView />}

      {/* ================= MODAL XEM TRƯỚC KHI IN (PREVIEW A4 / XUẤT PDF) ================= */}
      <PrintPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        documentTitle={previewTitle}
      >
        {previewContentId === 'homeroom-book' && <HomeroomBookPrintView />}
        {previewContentId === 'class-summary' && <ClassSummaryReportView />}
        {previewContentId === 'single-student' && <SingleStudentReportView />}
        {previewContentId === 'export-data' && <DataExportMasterView />}
      </PrintPreviewModal>
    </div>
  );
};
