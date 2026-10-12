import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Users,
  Clock,
  BookOpen,
  Smile,
  ShieldAlert,
  Compass,
  Trophy,
  Award,
  Layers,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportStudentsToExcel,
  exportAttendanceToExcel,
  exportAcademicToExcel,
  exportConductToExcel,
  exportViolationsToExcel,
  exportActivitiesToExcel,
  exportCompetitionToExcel,
  exportAwardsToExcel,
  exportAllDataToSingleWorkbook,
} from '../../utils/excelExport';

interface DataExportMasterViewProps {
  onOpenPreview?: (contentId: string, title: string) => void;
}

export const DataExportMasterView: React.FC<DataExportMasterViewProps> = ({
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
    classActivities,
    groupCompetitionRecords,
    awardRecords,
    currentUser,
  } = useApp();

  const [lastExportedInfo, setLastExportedInfo] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setLastExportedInfo(msg);
    setTimeout(() => setLastExportedInfo(null), 3000);
  };

  const handleExportStudents = () => {
    exportStudentsToExcel(currentClassStudents, currentClass, currentSchoolYear, school);
    notifySuccess(`Đã xuất thành công danh sách ${currentClassStudents.length} học sinh ra Excel!`);
  };

  const handleExportAttendance = () => {
    exportAttendanceToExcel(currentClassStudents, attendanceRecords, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công bảng theo dõi chuyên cần ra Excel!');
  };

  const handleExportAcademic = () => {
    exportAcademicToExcel(currentClassStudents, academicScores, subjectTrackings, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công bảng kết quả học tập 12 môn (TT22) ra Excel!');
  };

  const handleExportConduct = () => {
    exportConductToExcel(currentClassStudents, conductRecords, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công bảng theo dõi rèn luyện ra Excel!');
  };

  const handleExportViolations = () => {
    exportViolationsToExcel(currentClassStudents, violationRecords, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công nhật ký vi phạm nề nếp ra Excel!');
  };

  const handleExportActivities = () => {
    exportActivitiesToExcel(classActivities, currentClassStudents, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công sổ theo dõi hoạt động tập thể ra Excel!');
  };

  const handleExportCompetition = () => {
    exportCompetitionToExcel(groupCompetitionRecords, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công bảng theo dõi thi đua 4 tổ ra Excel!');
  };

  const handleExportAwards = () => {
    exportAwardsToExcel(currentClassStudents, awardRecords, currentClass, currentSchoolYear, school);
    notifySuccess('Đã xuất thành công sổ khen thưởng học sinh ra Excel!');
  };

  const handleExportAll = () => {
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
    notifySuccess(`Đã xuất thành công toàn bộ Sổ Chủ Nhiệm (Multi-Sheet Workbook) ra Excel!`);
  };

  const exportCards = [
    {
      id: 'students',
      title: '1. Danh sách học sinh',
      description: 'Họ tên, mã HS, ngày sinh, tổ, dân tộc, diện chính sách, địa chỉ và SĐT phụ huynh.',
      countText: `${currentClassStudents.length} học sinh`,
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      onExportExcel: handleExportStudents,
      previewId: 'class-summary',
    },
    {
      id: 'attendance',
      title: '2. Điểm danh & Chuyên cần',
      description: 'Thống kê buổi có mặt, vắng có phép, không phép, đi muộn và tỷ lệ chuyên cần %.',
      countText: `${attendanceRecords.filter((r) => r.classId === currentClass?.id).length} bản ghi`,
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      onExportExcel: handleExportAttendance,
      previewId: 'class-summary',
    },
    {
      id: 'academic',
      title: '3. Kết quả học tập (TT22)',
      description: 'Bảng điểm 12 môn THCS, đánh giá Tốt/Khá/Đạt/Chưa đạt và điểm trung bình.',
      countText: `${academicScores.filter((s) => s.classId === currentClass?.id).length} điểm môn`,
      icon: BookOpen,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      buttonColor: 'bg-sky-600 hover:bg-sky-700',
      onExportExcel: handleExportAcademic,
      previewId: 'class-summary',
    },
    {
      id: 'conduct',
      title: '4. Rèn luyện & Đạo đức',
      description: 'Xếp loại rèn luyện định kỳ, biểu hiện tích cực và các điểm cần phát huy.',
      countText: `${conductRecords.filter((c) => c.classId === currentClass?.id).length} xếp loại`,
      icon: Smile,
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      onExportExcel: handleExportConduct,
      previewId: 'class-summary',
    },
    {
      id: 'violations',
      title: '5. Vi phạm nề nếp & Kỷ luật',
      description: 'Sổ ghi nhận vi phạm, mức độ, biện pháp giáo dục và kết quả chuyển biến.',
      countText: `${violationRecords.filter((v) => v.classId === currentClass?.id).length} vụ việc`,
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      buttonColor: 'bg-rose-600 hover:bg-rose-700',
      onExportExcel: handleExportViolations,
      previewId: 'class-summary',
    },
    {
      id: 'activities',
      title: '6. Hoạt động tập thể',
      description: 'Hoạt động trải nghiệm, ngày tổ chức, địa điểm, số HS tham gia và kết quả.',
      countText: `${classActivities.filter((a) => a.classId === currentClass?.id).length} hoạt động`,
      icon: Compass,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      buttonColor: 'bg-teal-600 hover:bg-teal-700',
      onExportExcel: handleExportActivities,
      previewId: 'class-summary',
    },
    {
      id: 'competition',
      title: '7. Thi đua 4 tổ tự quản',
      description: 'Theo dõi 6 tiêu chí thi đua (học tập, chuyên cần, nề nếp, hoạt động, vệ sinh, phong trào).',
      countText: `${groupCompetitionRecords.filter((c) => c.classId === currentClass?.id).length} đợt thi đua`,
      icon: Trophy,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      onExportExcel: handleExportCompetition,
      previewId: 'class-summary',
    },
    {
      id: 'awards',
      title: '8. Sổ khen thưởng học sinh',
      description: 'Thành tích, danh hiệu, ngày khen thưởng, cấp khen thưởng và quyết định.',
      countText: `${awardRecords.filter((aw) => aw.classId === currentClass?.id).length} danh hiệu`,
      icon: Award,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      onExportExcel: handleExportAwards,
      previewId: 'class-summary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  XUẤT DỮ LIỆU EXCEL & PDF • LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Chuẩn Microsoft Excel (.xlsx)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Năm học {currentSchoolYear.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Xuất khẩu đầy đủ 8 lĩnh vực dữ liệu hoặc 1 file Workbook tổng hợp duy nhất • Đảm bảo an toàn phân vùng dữ liệu lớp học
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportAll}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>Xuất Toàn Bộ Sổ (Multi-Sheet Excel)</span>
        </button>
      </div>

      {/* Security Verification Banner (Requirement 8) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-3xl flex items-start gap-3.5 text-xs text-blue-950 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 flex-1">
          <strong className="font-bold text-blue-900 text-sm block">
            Bảo Đảm Dữ Liệu: Kiểm Tra Năm Học & Lớp Trước Khi Xuất
          </strong>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Hệ thống tự động lọc và khóa vùng dữ liệu strictly theo lớp <strong>{currentClass?.className}</strong> (ID: {currentClass?.id}) và năm học <strong>{currentSchoolYear.name}</strong>. Tuyệt đối không xuất nhầm hoặc lẫn lộn dữ liệu của lớp khác trong toàn trường.
          </p>
        </div>
        <span className="px-3 py-1 bg-white text-blue-800 font-bold rounded-xl border border-blue-200 shrink-0 text-[11px]">
          GVCN: {currentClass?.homeroomTeacherName}
        </span>
      </div>

      {/* Success Notification Toast */}
      {lastExportedInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {lastExportedInfo}
        </div>
      )}

      {/* Grid of 8 Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {exportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                    {card.countText}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{card.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={card.onExportExcel}
                  className={`flex-1 py-2 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${card.buttonColor}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>

                {onOpenPreview && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenPreview(card.previewId, `Xem trước ${card.title} - Lớp ${currentClass?.className}`)
                    }
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Xem trước / In PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
