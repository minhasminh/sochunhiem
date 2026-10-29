import React, { useState } from 'react';
import {
  Printer,
  BookOpen,
  Eye,
  Download,
  Users,
  Clock,
  Calendar,
  Smile,
  ShieldAlert,
  TrendingUp,
  Compass,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  FileText,
  Bookmark,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  School,
  Edit3,
  X,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAllDataToSingleWorkbook } from '../../utils/excelExport';
import { PrintPreviewModal } from './PrintPreviewModal';

interface HomeroomBookPrintViewProps {
  onOpenPreview?: (contentId: string, title: string) => void;
}

export const HomeroomBookPrintView: React.FC<HomeroomBookPrintViewProps> = ({
  onOpenPreview,
}) => {
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const {
    classes,
    currentClass,
    selectClass,
    classBookApprovals,
    toggleApproveClassBook,
    currentSchoolYear,
    school,
    currentClassStudents,
    classOfficers,
    parentRepresentatives,
    seats,
    classroomConfig,
    yearlyPlan,
    monthlyPlans,
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
    studentSemesterComments,
    currentUser,
  } = useApp();

  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);
  const filteredClasses =
    gradeFilter === 'all'
      ? activeYearClasses
      : activeYearClasses.filter((c) => c.grade === gradeFilter);

  const currentClassIndex = activeYearClasses.findIndex((c) => c.id === currentClass?.id);
  const prevClass = currentClassIndex > 0 ? activeYearClasses[currentClassIndex - 1] : null;
  const nextClass =
    currentClassIndex >= 0 && currentClassIndex < activeYearClasses.length - 1
      ? activeYearClasses[currentClassIndex + 1]
      : null;

  const currentClassApproval = classBookApprovals?.find((a) => a.classId === currentClass?.id);
  const isBghOrAdmin = currentUser?.role === 'BGH' || currentUser?.role === 'ADMIN';

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

  const openApprovalModal = () => {
    setApprovalComment(
      currentClassApproval?.reviewComment ||
        `Sổ chủ nhiệm lớp ${currentClass?.className} ghi chép đầy đủ 8 phần theo đúng quy định của Bộ GD&ĐT. Kế hoạch công tác bám sát thực tế, nề nếp lớp ổn định. Duyệt lưu chiểu.`
    );
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (currentClass) {
      toggleApproveClassBook(currentClass.id, approvalComment);
    }
    setApprovalModalOpen(false);
  };

  const subjects = [
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

  return (
    <div className="space-y-6">
      {/* =========================================================================
          BGH CLASS SELECTOR & SUPERVISION BAR (SCREEN ONLY)
          Allows Principal & BGH to switch between ANY class in the school with 1 click
          ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-amber-600/20 border border-amber-400/40 print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-amber-50 text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                  {isBghOrAdmin ? '👑 BẢNG ĐIỀU KHIỂN HIỆU TRƯỞNG' : 'CHỌN LỚP XEM SỔ CHỦ NHIỆM'}
                </span>
                <span className="text-amber-100 text-xs font-bold">
                  Niên khóa {currentSchoolYear.name} ({activeYearClasses.length} lớp học)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {isBghOrAdmin
                  ? 'Giám sát & Ký duyệt Sổ Chủ Nhiệm các lớp trong trường'
                  : `Đang xem Sổ Chủ Nhiệm: Lớp ${currentClass?.className}`}
              </h2>
            </div>
          </div>

          {/* Quick Class Prev/Next Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => prevClass && selectClass(prevClass.id)}
              disabled={!prevClass}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                prevClass
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer active:scale-95'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              title={prevClass ? `Chuyển về lớp ${prevClass.className}` : 'Đã ở lớp đầu tiên'}
            >
              <ChevronLeft className="w-4 h-4" /> Lớp trước {prevClass && `(${prevClass.className})`}
            </button>
            <button
              onClick={() => nextClass && selectClass(nextClass.id)}
              disabled={!nextClass}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                nextClass
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer active:scale-95'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              title={nextClass ? `Chuyển sang lớp ${nextClass.className}` : 'Đã ở lớp cuối cùng'}
            >
              Lớp sau {nextClass && `(${nextClass.className})`} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold custom-scrollbar">
          <span className="text-amber-100 text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc khối:
          </span>
          {[
            { id: 'all', label: `Tất cả (${activeYearClasses.length} lớp)` },
            ...(['1', '2', '3', '4', '5', '6', '7', '8', '9']
              .filter((gr) => activeYearClasses.some((c) => c.grade === gr))
              .map((gr) => ({
                id: gr,
                label: `Khối ${gr} (${activeYearClasses.filter((c) => c.grade === gr).length})`,
              }))),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGradeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                gradeFilter === tab.id
                  ? 'bg-white text-amber-900 shadow-md font-black'
                  : 'bg-white/15 hover:bg-white/25 text-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visual Class Selector Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          {filteredClasses.map((cls) => {
            const isSelected = currentClass?.id === cls.id;
            const approval = classBookApprovals?.find((a) => a.classId === cls.id);
            const isApproved = approval?.isApproved;

            return (
              <button
                key={cls.id}
                onClick={() => selectClass(cls.id)}
                className={`p-2.5 rounded-2xl text-left transition-all relative flex flex-col justify-between cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xl border-white scale-102 ring-3 ring-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isSelected ? 'text-amber-950' : 'text-white'
                      }`}
                    >
                      Lớp {cls.className}
                    </span>
                    {isApproved ? (
                      <span
                        className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
                        title="Hiệu trưởng đã phê duyệt"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full bg-amber-300/80 shrink-0"
                        title="Chờ phê duyệt"
                      />
                    )}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? 'text-slate-600 font-semibold' : 'text-amber-100'
                    }`}
                  >
                    GV: {cls.homeroomTeacherName?.split(' ').pop() || 'GVCN'}
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-current/15 flex items-center justify-between text-[9px] font-mono">
                  <span>{cls.studentCount} HS</span>
                  {isSelected && (
                    <span className="font-bold text-amber-800 uppercase tracking-tighter text-[8px]">
                      ● Đang mở
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Class Action & Approval Bar */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-white/15">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-amber-200 text-xs">Đang kiểm tra:</span>
            <span className="font-black text-white text-sm bg-white/20 px-2.5 py-0.5 rounded-lg">
              Lớp {currentClass?.className}
            </span>
            <span className="text-amber-100">
              GVCN: <strong>{currentClass?.homeroomTeacherName || 'Chưa phân công'}</strong>
            </span>
            <span className="text-amber-100">
              • Sĩ số: <strong>{currentClassStudents.length} học sinh</strong>
            </span>
            {currentClassApproval?.isApproved ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-emerald-950 font-black text-[10px] flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-900" /> ĐÃ KÝ DUYỆT ({currentClassApproval.approvedDate})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> CHỜ HIỆU TRƯỞNG KÝ DUYỆT
              </span>
            )}
          </div>

          {/* Action buttons for Principal */}
          {isBghOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={openApprovalModal}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  currentClassApproval?.isApproved
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950'
                    : 'bg-white hover:bg-amber-50 text-amber-950 active:scale-95'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                {currentClassApproval?.isApproved ? 'Xem / Sửa ý kiến duyệt' : 'Ký duyệt Sổ lớp này'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Banner & Control Bar (Screen Only) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/30">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  IN SỔ CHỦ NHIỆM LIÊN TỤC • LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  Năm học {currentSchoolYear.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Chuẩn Sổ Chủ Nhiệm THCS
                </span>
                {currentClassApproval?.isApproved && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                    ✓ Hiệu trưởng đã duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Toàn bộ 8 phần liên tục theo đúng logic Sổ chủ nhiệm mẫu của Bộ GD&ĐT: Từ trang bìa, tổ chức lớp, trích ngang, điểm danh, học tập, rèn luyện đến tổng kết và phê duyệt
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (onOpenPreview) {
                onOpenPreview(
                  'homeroom-book',
                  `Sổ chủ nhiệm lớp ${currentClass?.className} - Năm học ${currentSchoolYear.name}`
                );
              } else {
                setInternalPreviewOpen(true);
              }
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Xem trước trang in (Preview)
          </button>

          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Xuất File Excel Đầy Đủ
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> In Sổ / Xuất PDF (A4)
          </button>
        </div>
      </div>

      {/* Navigation Quick Jump Bar (Screen Only) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <span className="text-slate-400 text-[11px] px-2 shrink-0">Chuyển nhanh đến:</span>
        {[
          { id: 'all', label: 'Toàn bộ Sổ (Liên tục)' },
          { id: 'cover', label: 'Trang Bìa' },
          { id: 'part1', label: 'Phần I: Kế hoạch & Tổ chức' },
          { id: 'part2', label: 'Phần II: Sơ yếu lý lịch' },
          { id: 'part3', label: 'Phần III: Chuyên cần' },
          { id: 'part4', label: 'Phần IV: Kết quả học tập' },
          { id: 'part5', label: 'Phần V: Rèn luyện & Vi phạm' },
          { id: 'part6', label: 'Phần VI: Phong trào & Thi đua' },
          { id: 'part7', label: 'Phần VII: Sơ kết & Tổng kết' },
          { id: 'part8', label: 'Phần VIII: Nhận xét từng HS' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setActiveSectionFilter(sec.id);
              if (sec.id !== 'all') {
                const el = document.getElementById(`homeroom-section-${sec.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeSectionFilter === sec.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          CONTINUOUS HOMEROOM BOOK PRINT CONTAINER (PAGE BY PAGE A4 FORMAT)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md space-y-12 print:p-0 print:border-none print:shadow-none print:space-y-0 text-xs text-slate-800 leading-relaxed font-sans">

        {/* ---------------- TRANG BÌA SỔ CHỦ NHIỆM ---------------- */}
        <section
          id="homeroom-section-cover"
          className="min-h-[920px] flex flex-col justify-between p-8 sm:p-14 border-4 border-double border-slate-900 text-center rounded-2xl print:min-h-screen print:border-4 print:border-double print:border-slate-900 print:rounded-none break-after-page"
        >
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
              {school.districtAuthority}
            </div>
            <div className="text-sm font-black uppercase tracking-wider text-slate-900">
              {school.name}
            </div>
          </div>

          <div className="my-16 space-y-6">
            <div className="inline-block p-4 border-2 border-slate-900 rounded-3xl">
              <BookOpen className="w-16 h-16 mx-auto text-indigo-950" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight leading-tight">
              SỔ CHỦ NHIỆM
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              (DÀNH CHO GIÁO VIÊN CHỦ NHIỆM LỚP THCS)
            </p>

            <div className="pt-8 space-y-3 max-w-sm mx-auto text-left text-sm font-bold bg-slate-50 p-6 rounded-2xl border border-slate-300">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">LỚP:</span>
                <span className="text-indigo-950 font-black text-base">{currentClass?.className}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">NĂM HỌC:</span>
                <span className="text-slate-900 font-black">{currentSchoolYear.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">PHÒNG HỌC:</span>
                <span className="text-slate-900">{currentClass?.roomNumber || 'P.204'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">CA HỌC:</span>
                <span className="text-slate-900">{currentClass?.studyShift || 'Buổi sáng'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-600">GIÁO VIÊN CHỦ NHIỆM:</span>
                <span className="text-indigo-900 font-black">
                  {currentClass?.homeroomTeacherName || currentUser?.name || 'Cô Lê Thị Kim Ánh'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            NĂM HỌC {currentSchoolYear.code}
          </div>
        </section>

        {/* ---------------- PHẦN I: KẾ HOẠCH & TỔ CHỨC LỚP HỌC ---------------- */}
        <section
          id="homeroom-section-part1"
          className="pt-10 print:pt-4 break-before-page space-y-6"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN I: KẾ HOẠCH & TỔ CHỨC LỚP HỌC
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Sổ Chủ Nhiệm Lớp {currentClass?.className}
            </span>
          </div>

          {/* 1.1 Đặc điểm tình hình */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase text-indigo-950">
              1. ĐẶC ĐIỂM TÌNH HÌNH LỚP HỌC
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-emerald-800 text-[11px] block uppercase font-bold">Thuận lợi:</strong>
                <p className="text-slate-700 text-[11px]">
                  {currentClass?.advantages || 'Học sinh ngoan ngoãn, đa số phụ huynh quan tâm chăm lo cho con em. Ban Giám hiệu nhà trường và giáo viên bộ môn luôn sát sao hỗ trợ kịp thời.'}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-amber-800 text-[11px] block uppercase font-bold">Khó khăn:</strong>
                <p className="text-slate-700 text-[11px]">
                  {currentClass?.difficulties || 'Một số ít học sinh còn rụt rè, tiếp thu kiến thức còn chậm ở các môn khoa học tự nhiên. Một vài phụ huynh đi làm ăn xa nên việc phối hợp quản lý buổi tối còn hạn chế.'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-indigo-900 text-[11px] block uppercase font-bold">Mục tiêu phấn đấu của lớp:</strong>
              <p className="text-slate-700 text-[11px] mt-0.5">
                {currentClass?.goals || '100% học sinh lên lớp thẳng; 100% rèn luyện mức Tốt và Khá; Chi đội đạt danh hiệu Vững mạnh xuất sắc; Tham gia đầy đủ các phong trào thi đua của trường.'}
              </p>
            </div>
          </div>

          {/* 1.2 Ban cán sự lớp & Ban đại diện CMHS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-indigo-950">
                2. BAN CÁN SỰ LỚP (CÁN BỘ LỚP)
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 uppercase text-[10px]">
                    <th className="p-2 border border-slate-300 w-28">Chức vụ</th>
                    <th className="p-2 border border-slate-300">Họ và tên học sinh</th>
                    <th className="p-2 border border-slate-300 text-center w-14">Tổ</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const classOffs = classOfficers.filter((off) => off.classId === currentClass?.id);
                    const officersToDisplay =
                      classOffs.length > 0
                        ? classOffs
                        : [
                            { id: 'off-1', role: 'Lớp trưởng', studentId: currentClassStudents[0]?.id },
                            { id: 'off-2', role: 'Lớp phó học tập', studentId: currentClassStudents[1]?.id },
                            { id: 'off-3', role: 'Lớp phó lao động', studentId: currentClassStudents[2]?.id },
                            { id: 'off-4', role: 'Tổ trưởng Tổ 1', studentId: currentClassStudents[3]?.id },
                            { id: 'off-5', role: 'Tổ trưởng Tổ 2', studentId: currentClassStudents[4]?.id },
                            { id: 'off-6', role: 'Tổ trưởng Tổ 3', studentId: currentClassStudents[5]?.id },
                            { id: 'off-7', role: 'Tổ trưởng Tổ 4', studentId: currentClassStudents[6]?.id },
                          ];
                    return officersToDisplay.map((off) => {
                      const st = currentClassStudents.find((s) => s.id === off.studentId);
                      return (
                        <tr key={off.id}>
                          <td className="p-2 border border-slate-300 font-semibold">{off.role}</td>
                          <td className="p-2 border border-slate-300 font-bold text-slate-900">{st?.fullName || 'Học sinh'}</td>
                          <td className="p-2 border border-slate-300 text-center">Tổ {st?.groupNumber || 1}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-indigo-950">
                3. BAN ĐẠI DIỆN CHA MẸ HỌC SINH
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 uppercase text-[10px]">
                    <th className="p-2 border border-slate-300 w-28">Nhiệm vụ</th>
                    <th className="p-2 border border-slate-300">Họ và tên phụ huynh</th>
                    <th className="p-2 border border-slate-300 w-24">Số điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const classReps = parentRepresentatives.filter((rep) => rep.classId === currentClass?.id);
                    const repsToDisplay =
                      classReps.length > 0
                        ? classReps
                        : [
                            {
                              id: 'rep-1',
                              role: 'Trưởng ban' as const,
                              parentName: currentClassStudents[0]?.fatherName || 'Phan Văn Hải',
                              phone: currentClassStudents[0]?.fatherPhone || '0972.635.159',
                            },
                            {
                              id: 'rep-2',
                              role: 'Phó ban' as const,
                              parentName: currentClassStudents[1]?.fatherName || 'Trần Văn Bình',
                              phone: currentClassStudents[1]?.fatherPhone || '0935.591.019',
                            },
                            {
                              id: 'rep-3',
                              role: 'Thành viên' as const,
                              parentName: currentClassStudents[2]?.fatherName || 'Lê Văn Nam',
                              phone: currentClassStudents[2]?.fatherPhone || '0905.112.233',
                            },
                          ];
                    return repsToDisplay.map((rep) => (
                      <tr key={rep.id}>
                        <td className="p-2 border border-slate-300 font-semibold">{rep.role}</td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">{rep.parentName}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[10px]">{rep.phone}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.3 Kế hoạch trọng tâm tháng */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase text-indigo-950">
              4. KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM CÁC THÁNG TRỌNG TÂM
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {(() => {
                const classPlans = monthlyPlans.filter((p) => p.classId === currentClass?.id);
                const plansToDisplay = classPlans.length > 0 ? classPlans : monthlyPlans;
                return plansToDisplay.slice(0, 6).map((plan) => (
                  <div key={plan.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-indigo-950">Tháng {plan.month}/{plan.year}: {plan.theme}</div>
                    <div className="text-slate-600 text-[10px] line-clamp-2 mt-0.5">
                      Trọng tâm: {plan.goal || plan.content || 'Triển khai nề nếp, học tập định kỳ'}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>

        {/* ---------------- PHẦN II: SƠ YẾU LÝ LỊCH TRÍCH NGANG HỌC SINH ---------------- */}
        <section
          id="homeroom-section-part2"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN II: SƠ YẾU LÝ LỊCH TRÍCH NGANG HỌC SINH (SĨ SỐ: {currentClassStudents.length})
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                  <th className="p-1.5 border border-slate-300 text-center w-8">STT</th>
                  <th className="p-1.5 border border-slate-300 w-16">Mã HS</th>
                  <th className="p-1.5 border border-slate-300 min-w-[130px]">Họ và tên</th>
                  <th className="p-1.5 border border-slate-300 text-center w-20">Ngày sinh</th>
                  <th className="p-1.5 border border-slate-300 text-center w-12">Phái</th>
                  <th className="p-1.5 border border-slate-300 text-center w-10">Tổ</th>
                  <th className="p-1.5 border border-slate-300 min-w-[140px]">Họ tên Bố/Mẹ</th>
                  <th className="p-1.5 border border-slate-300 w-24">SĐT Phụ huynh</th>
                  <th className="p-1.5 border border-slate-300 min-w-[120px]">Chính sách / Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {currentClassStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-1.5 border border-slate-300 text-center text-slate-500">{st.stt}</td>
                    <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{st.studentCode}</td>
                    <td className="p-1.5 border border-slate-300 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{st.birthDate}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{st.gender}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{st.groupNumber}</td>
                    <td className="p-1.5 border border-slate-300 text-slate-700">{st.fatherName || st.motherName || '-'}</td>
                    <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{st.fatherPhone || st.motherPhone || '-'}</td>
                    <td className="p-1.5 border border-slate-300 text-slate-600">{st.policyPriority || st.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- PHẦN III: THEO DÕI CHUYÊN CẦN & ĐIỂM DANH ---------------- */}
        <section
          id="homeroom-section-part3"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN III: BẢNG TỔNG HỢP THEO DÕI CHUYÊN CẦN & ĐIỂM DANH
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                  <th className="p-1.5 border border-slate-300 text-center w-8">STT</th>
                  <th className="p-1.5 border border-slate-300 w-16">Mã HS</th>
                  <th className="p-1.5 border border-slate-300">Họ và tên</th>
                  <th className="p-1.5 border border-slate-300 text-center w-10">Tổ</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Có mặt</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Nghỉ phép</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Không phép</th>
                  <th className="p-1.5 border border-slate-300 text-center w-14">Đi muộn</th>
                  <th className="p-1.5 border border-slate-300 text-center w-20">Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody>
                {currentClassStudents.map((st) => {
                  const recs = attendanceRecords.filter((r) => r.studentId === st.id);
                  const present = recs.filter((r) => r.status === 'Có mặt').length;
                  const excused = recs.filter((r) => r.status === 'Nghỉ có phép').length;
                  const unexcused = recs.filter((r) => r.status === 'Nghỉ không phép').length;
                  const late = recs.filter((r) => r.status === 'Đi muộn').length;
                  const total = recs.length || 1;
                  const rate = Math.round(((total - (excused + unexcused)) / total) * 100);

                  return (
                    <tr key={st.id}>
                      <td className="p-1.5 border border-slate-300 text-center text-slate-500">{st.stt}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{st.studentCode}</td>
                      <td className="p-1.5 border border-slate-300 font-bold text-slate-900">{st.fullName}</td>
                      <td className="p-1.5 border border-slate-300 text-center">{st.groupNumber}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-800">{present}</td>
                      <td className="p-1.5 border border-slate-300 text-center text-blue-700">{excused}</td>
                      <td className="p-1.5 border border-slate-300 text-center text-rose-700">{unexcused}</td>
                      <td className="p-1.5 border border-slate-300 text-center text-amber-700">{late}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold text-emerald-800">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- PHẦN IV: BẢNG TỔNG HỢP KẾT QUẢ HỌC TẬP (TT22) ---------------- */}
        <section
          id="homeroom-section-part4"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN IV: BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ CÁC MÔN HỌC (TT 22/2021/TT-BGDĐT)
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-[9px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                  <th className="p-1 border border-slate-300 text-center w-6">STT</th>
                  <th className="p-1 border border-slate-300 min-w-[100px]">Họ và tên</th>
                  <th className="p-1 border border-slate-300 text-center">Toán</th>
                  <th className="p-1 border border-slate-300 text-center">Văn</th>
                  <th className="p-1 border border-slate-300 text-center">Anh</th>
                  <th className="p-1 border border-slate-300 text-center">KHTN</th>
                  <th className="p-1 border border-slate-300 text-center">Sử Địa</th>
                  <th className="p-1 border border-slate-300 text-center">GDCD</th>
                  <th className="p-1 border border-slate-300 text-center">Tin</th>
                  <th className="p-1 border border-slate-300 text-center">CN</th>
                  <th className="p-1 border border-slate-300 text-center">Thể chất</th>
                  <th className="p-1 border border-slate-300 text-center">Nghệ thuật</th>
                  <th className="p-1 border border-slate-300 text-center">ĐTB</th>
                  <th className="p-1 border border-slate-300 text-center w-14">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {currentClassStudents.map((st) => {
                  const studentScores = academicScores.filter((s) => s.studentId === st.id);
                  const getSub = (name: string) => {
                    const sc = studentScores.find((s) => s.subjectName === name);
                    if (!sc) return '-';
                    return sc.score !== null ? sc.score.toFixed(1) : sc.evaluationGrade || 'Đạt';
                  };

                  const numScores = studentScores
                    .map((s) => s.score)
                    .filter((sc): sc is number => sc !== null && sc !== undefined);
                  const avg =
                    numScores.length > 0
                      ? (numScores.reduce((a, b) => a + b, 0) / numScores.length).toFixed(1)
                      : '-';
                  const grade =
                    avg !== '-'
                      ? parseFloat(avg) >= 8.0
                        ? 'Tốt'
                        : parseFloat(avg) >= 6.5
                        ? 'Khá'
                        : 'Đạt'
                      : 'Đạt';

                  return (
                    <tr key={st.id}>
                      <td className="p-1 border border-slate-300 text-center text-slate-500">{st.stt}</td>
                      <td className="p-1 border border-slate-300 font-bold text-slate-900">{st.fullName}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Toán')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Ngữ văn')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Tiếng Anh')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Khoa học tự nhiên')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Lịch sử và Địa lí')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Giáo dục công dân')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Tin học')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Công nghệ')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Giáo dục thể chất')}</td>
                      <td className="p-1 border border-slate-300 text-center">{getSub('Nghệ thuật (Âm nhạc, Mĩ thuật)')}</td>
                      <td className="p-1 border border-slate-300 text-center font-bold text-indigo-900">{avg}</td>
                      <td className="p-1 border border-slate-300 text-center font-bold text-slate-800">{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- PHẦN V: RÈN LUYỆN, VI PHẠM & TIẾN BỘ ---------------- */}
        <section
          id="homeroom-section-part5"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN V: THEO DÕI RÈN LUYỆN, VI PHẠM NỀ NẾP & GHI NHẬN TIẾN BỘ
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vi phạm */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-indigo-950">
                1. SỔ THEO DÕI VI PHẠM NỀ NẾP & BIỆN PHÁP GIÁO DỤC
              </h3>
              {violationRecords.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-center text-[11px]">
                  ✓ Toàn bộ học sinh trong lớp chấp hành nghiêm chỉnh nội quy nhà trường.
                </div>
              ) : (
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                      <th className="p-1.5 border border-slate-300 w-16">Ngày</th>
                      <th className="p-1.5 border border-slate-300">Học sinh</th>
                      <th className="p-1.5 border border-slate-300">Nội dung sự việc</th>
                      <th className="p-1.5 border border-slate-300">Biện pháp giáo dục</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violationRecords.map((v) => {
                      const st = currentClassStudents.find((s) => s.id === v.studentId);
                      return (
                        <tr key={v.id}>
                          <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{v.date}</td>
                          <td className="p-1.5 border border-slate-300 font-bold">{st?.fullName || 'Học sinh'}</td>
                          <td className="p-1.5 border border-slate-300">{v.title}</td>
                          <td className="p-1.5 border border-slate-300 text-slate-600">{v.educationalMeasures}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Tiến bộ */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-indigo-950">
                2. NHẬT KÝ THEO DÕI SỰ TIẾN BỘ CỦA HỌC SINH
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                    <th className="p-1.5 border border-slate-300 w-16">Thời điểm</th>
                    <th className="p-1.5 border border-slate-300">Học sinh</th>
                    <th className="p-1.5 border border-slate-300">Mức độ tiến bộ</th>
                    <th className="p-1.5 border border-slate-300">Kết quả chuyển biến</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgressEntries.map((p) => {
                    const st = currentClassStudents.find((s) => s.id === p.studentId);
                    return (
                      <tr key={p.id}>
                        <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{p.timestamp}</td>
                        <td className="p-1.5 border border-slate-300 font-bold">{st?.fullName || 'Học sinh'}</td>
                        <td className="p-1.5 border border-slate-300 font-semibold text-emerald-800">{p.progressLevel}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-600">{p.result}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- PHẦN VI: HOẠT ĐỘNG, THI ĐUA & KHEN THƯỞNG ---------------- */}
        <section
          id="homeroom-section-part6"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN VI: HOẠT ĐỘNG TRẢI NGHIỆM, THI ĐUA 4 TỔ & SỔ KHEN THƯỞNG
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="space-y-4">
            {/* Hoạt động */}
            <div>
              <h3 className="font-bold text-xs uppercase text-indigo-950 mb-1.5">
                1. SỔ THEO DÕI CÁC HOẠT ĐỘNG TẬP THỂ & PHONG TRÀO
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                    <th className="p-1.5 border border-slate-300 w-16">Ngày</th>
                    <th className="p-1.5 border border-slate-300">Tên hoạt động</th>
                    <th className="p-1.5 border border-slate-300">Địa điểm</th>
                    <th className="p-1.5 border border-slate-300 text-center w-16">Số HS tham gia</th>
                    <th className="p-1.5 border border-slate-300">Kết quả đạt được</th>
                  </tr>
                </thead>
                <tbody>
                  {classActivities.map((act) => (
                    <tr key={act.id}>
                      <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{act.date}</td>
                      <td className="p-1.5 border border-slate-300 font-bold">{act.name}</td>
                      <td className="p-1.5 border border-slate-300">{act.location}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold">{act.participantStudentIds.length} HS</td>
                      <td className="p-1.5 border border-slate-300 text-emerald-800">{act.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Thi đua & Khen thưởng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-xs uppercase text-indigo-950 mb-1.5">
                  2. KẾT QUẢ THI ĐUA 4 TỔ TỰ QUẢN (6 TIÊU CHÍ)
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                      <th className="p-1.5 border border-slate-300">Tổ</th>
                      <th className="p-1.5 border border-slate-300">Xếp hạng</th>
                      <th className="p-1.5 border border-slate-300">Nhận xét của GVCN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((gNum) => (
                      <tr key={gNum}>
                        <td className="p-1.5 border border-slate-300 font-bold">Tổ {gNum}</td>
                        <td className="p-1.5 border border-slate-300 font-semibold text-amber-900">
                          {gNum === 1 ? 'Hạng Nhất' : gNum === 2 ? 'Hạng Nhì' : gNum === 3 ? 'Hạng Ba' : 'Hạng Tư'}
                        </td>
                        <td className="p-1.5 border border-slate-300 text-slate-600">
                          {gNum === 1 ? 'Nề nếp học tập và kỷ luật tốt nhất' : 'Hoàn thành các tiêu chí thi đua'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-indigo-950 mb-1.5">
                  3. SỔ KHEN THƯỞNG HỌC SINH
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                      <th className="p-1.5 border border-slate-300 w-16">Ngày</th>
                      <th className="p-1.5 border border-slate-300">Học sinh</th>
                      <th className="p-1.5 border border-slate-300">Danh hiệu</th>
                      <th className="p-1.5 border border-slate-300 text-center w-16">Cấp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardRecords.map((aw) => {
                      const st = currentClassStudents.find((s) => s.id === aw.studentId);
                      return (
                        <tr key={aw.id}>
                          <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{aw.date}</td>
                          <td className="p-1.5 border border-slate-300 font-bold">{st?.fullName || 'Học sinh'}</td>
                          <td className="p-1.5 border border-slate-300 text-amber-900 font-semibold">{aw.achievement}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-bold text-indigo-900">{aw.level}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- PHẦN VII: BÁO CÁO TỔNG KẾT NĂM HỌC (7 MỤC) ---------------- */}
        <section
          id="homeroom-section-part7"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN VII: BÁO CÁO TỔNG KẾT NĂM HỌC (7 NỘI DUNG CHUẨN)
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-[11px] leading-relaxed">
            <div>
              <strong className="text-slate-900 block font-bold">1. Nhận xét chung tình hình lớp:</strong>
              <p className="text-slate-700 italic">{yearEndSummaryReport.generalComment}</p>
            </div>
            <div>
              <strong className="text-emerald-900 block font-bold">2. Ưu điểm nổi bật:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.strengths}</p>
            </div>
            <div>
              <strong className="text-amber-900 block font-bold">3. Hạn chế, tồn tại:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.limitations}</p>
            </div>
            <div>
              <strong className="text-blue-900 block font-bold">4. Kết quả giáo dục:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.overallResults}</p>
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">5. Biện pháp quản lý & giáo dục đã triển khai:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.measures}</p>
            </div>
            <div>
              <strong className="text-purple-900 block font-bold">6. Kiến nghị với Nhà trường & Hội CMHS:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.recommendations}</p>
            </div>
            <div>
              <strong className="text-indigo-900 block font-bold">7. Phương hướng nhiệm vụ năm học tiếp theo:</strong>
              <p className="text-slate-700">{yearEndSummaryReport.futureDirections}</p>
            </div>
          </div>
        </section>

        {/* ---------------- PHẦN VIII: BẢNG TỔNG HỢP NHẬN XÉT HỌC SINH ---------------- */}
        <section
          id="homeroom-section-part8"
          className="pt-10 print:pt-4 break-before-page space-y-4"
        >
          <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              PHẦN VIII: BẢNG TỔNG HỢP NHẬN XÉT TỪNG HỌC SINH CỦA GVCN
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">
              Lớp {currentClass?.className}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 uppercase">
                  <th className="p-1.5 border border-slate-300 text-center w-8">STT</th>
                  <th className="p-1.5 border border-slate-300 w-16">Mã HS</th>
                  <th className="p-1.5 border border-slate-300 w-36">Họ và tên</th>
                  <th className="p-1.5 border border-slate-300">Lời nhận xét đánh giá chính thức của GVCN</th>
                </tr>
              </thead>
              <tbody>
                {currentClassStudents.map((st) => {
                  const comm = studentSemesterComments.find(
                    (c) => c.studentId === st.id && (c.period === 'Cả năm' || c.period === 'HKII' || c.period === 'HKI')
                  );
                  return (
                    <tr key={st.id}>
                      <td className="p-1.5 border border-slate-300 text-center text-slate-500">{st.stt}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{st.studentCode}</td>
                      <td className="p-1.5 border border-slate-300 font-bold text-slate-900">{st.fullName}</td>
                      <td className="p-1.5 border border-slate-300 text-slate-700 italic">
                        {comm?.teacherComment
                          ? `"${comm.teacherComment}"`
                          : `Em ${st.fullName} chấp hành tốt nội quy nhà trường, chăm ngoan, có ý thức học tập và rèn luyện tốt.`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phê duyệt chính thức của Ban Giám Hiệu ở trang cuối sổ */}
          <div className="pt-10 border-t-2 border-slate-900 grid grid-cols-2 text-center text-xs">
            <div className="space-y-4 flex flex-col items-center">
              <div>
                <div className="font-bold text-slate-900 uppercase tracking-wide">
                  BAN GIÁM HIỆU PHÊ DUYỆT SỔ
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  (Ký duyệt điện tử và đóng dấu số hóa)
                </div>
              </div>

              {currentClassApproval?.isApproved ? (
                <div className="p-3 bg-red-50/90 border-2 border-dashed border-red-600 rounded-2xl max-w-[280px] text-red-900 space-y-1 shadow-xs">
                  <div className="text-[9px] font-black uppercase text-red-700 tracking-wider">
                    ★ {school.name.toUpperCase()} ★
                  </div>
                  <div className="text-xs font-black uppercase text-red-800 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-700" />
                    ĐÃ PHÊ DUYỆT SỔ CHỦ NHIỆM
                  </div>
                  <div className="text-[10px] font-bold text-red-900 font-mono">
                    Ngày ký duyệt: {currentClassApproval.approvedDate}
                  </div>
                  <div className="text-[9px] text-red-700 italic border-t border-red-200 pt-1 mt-1 text-left line-clamp-3">
                    "{currentClassApproval.reviewComment}"
                  </div>
                  <div className="text-[10px] font-black text-red-950 uppercase pt-1">
                    {currentClassApproval.approvedBy}
                  </div>
                </div>
              ) : (
                <div className="h-24 flex flex-col items-center justify-center text-slate-400 italic text-[11px] border border-dashed border-slate-200 rounded-xl px-4">
                  <span>(Chờ Hiệu trưởng kiểm tra & ký duyệt)</span>
                  {isBghOrAdmin && (
                    <button
                      onClick={openApprovalModal}
                      className="mt-1 text-amber-700 hover:text-amber-800 font-bold text-[10px] underline cursor-pointer print:hidden"
                    >
                      Bấm vào đây để ký duyệt
                    </button>
                  )}
                </div>
              )}

              <div className="font-bold text-slate-900 uppercase">
                {currentClassApproval?.approvedBy || school.principalName || 'Phan Đức Quý'}
              </div>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <div>
                <div className="font-bold text-slate-900 uppercase tracking-wide">
                  GIÁO VIÊN CHỦ NHIỆM LỚP {currentClass?.className}
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  (Ký và ghi rõ họ tên)
                </div>
              </div>

              <div className="h-24 flex items-center justify-center">
                <span className="font-serif italic text-indigo-900 text-xl font-bold tracking-wider">
                  {currentClass?.homeroomTeacherName?.split(' ').pop() || 'GVCN'}
                </span>
              </div>

              <div className="font-bold text-slate-900 uppercase">
                {currentClass?.homeroomTeacherName || currentUser?.name || 'Cô Lê Thị Kim Ánh'}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Principal Approval Modal (Screen Only) */}
      {approvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Phê duyệt Sổ Chủ Nhiệm Lớp {currentClass?.className}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quyền hạn: Thầy Hiệu trưởng {currentUser?.name || 'Phan Đức Quý'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lớp kiểm tra:</span>
                  <span className="font-bold text-slate-900 text-sm">Lớp {currentClass?.className}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Giáo viên chủ nhiệm:</span>
                  <span className="font-bold text-slate-900">{currentClass?.homeroomTeacherName || 'GVCN'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sĩ số lớp:</span>
                  <span className="font-bold text-slate-900">{currentClassStudents.length} học sinh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái hiện tại:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    currentClassApproval?.isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentClassApproval?.isApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Ý kiến chỉ đạo & Nhận xét của Hiệu trưởng:
                </label>
                <textarea
                  rows={4}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Nhập ý kiến đánh giá về sổ chủ nhiệm, công tác duy trì sĩ số, nề nếp..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {currentClassApproval?.isApproved ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentClass) {
                      toggleApproveClassBook(currentClass.id, '');
                    }
                    setApprovalModalOpen(false);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Hủy phê duyệt
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {currentClassApproval?.isApproved ? 'Cập nhật ý kiến duyệt' : 'Xác nhận ký duyệt sổ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Print Preview Modal */}
      <PrintPreviewModal
        isOpen={internalPreviewOpen}
        onClose={() => setInternalPreviewOpen(false)}
        documentTitle={`Sổ chủ nhiệm lớp ${currentClass?.className} - Năm học ${currentSchoolYear.name}`}
      >
        <HomeroomBookPrintView />
      </PrintPreviewModal>
    </div>
  );
};

