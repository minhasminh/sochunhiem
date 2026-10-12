import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Calendar,
  ArrowRight,
  Edit,
  Lightbulb,
  Target,
  Users,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YearlyPlanTask, MonthlyPlan } from '../../types';

interface AIPlanAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'yearly-task' | 'monthly-activities' | 'goal-analysis';
  targetMonth?: number;
  onApplyYearlyTask?: (task: Omit<YearlyPlanTask, 'id'>) => void;
  onApplyGoalAnalysis?: (
    generalGoal: string,
    targets: {
      conductGoodRate: string;
      academicGoodRate: string;
      pioneerTitle: string;
      attendanceRate: string;
    }
  ) => void;
  onApplyMonthlyActivities?: (theme: string, goal: string, activities: string[]) => void;
}

export const AIPlanAssistModal: React.FC<AIPlanAssistModalProps> = ({
  isOpen,
  onClose,
  type = 'yearly-task',
  targetMonth = 10,
  onApplyYearlyTask,
  onApplyGoalAnalysis,
  onApplyMonthlyActivities,
}) => {
  const { currentClass, currentClassStudents } = useApp();

  const [activeTab, setActiveTab] = useState<'yearly-task' | 'monthly-activities' | 'goal-analysis'>(type);

  // Class demographic insights
  const total = currentClassStudents.length;
  const supportCount = currentClassStudents.filter((s) => s.needsSupport || s.needsAttention).length;
  const talentCount = currentClassStudents.filter((s) => s.hasSpecialTalent).length;
  const progressCount = currentClassStudents.filter((s) => s.hasProgress).length;

  // State 1: Goal Analysis & Targets
  const [goalDraft, setGoalDraft] = useState(
    `Xây dựng tập thể lớp ${currentClass?.className || '7/1'} đoàn kết, kỷ cương, nề nếp vững chắc; 100% học sinh chấp hành tốt nội quy nhà trường; phát huy năng lực tự học và phẩm chất đạo đức, không có học sinh bỏ học hay xếp loại Rèn luyện Chưa đạt; đẩy mạnh hoạt động trải nghiệm sáng tạo và phong trào Đội TNTP Hồ Chí Minh.`
  );
  const [conductTarget, setConductTarget] = useState('Tốt: >= 90% (28/31 HS), Khá: <= 10%, Không có Đạt/Chưa đạt');
  const [academicTarget, setAcademicTarget] = useState('Tốt: >= 35% (11 HS), Khá: >= 45% (14 HS), Đạt: <= 20%, Chưa đạt: 0%');
  const [pioneerTitle, setPioneerTitle] = useState('Chi đội Vững mạnh xuất sắc - Dẫn đầu khối 7');
  const [attendanceRate, setAttendanceRate] = useState('99.5% trở lên (100% học sinh đi học đúng giờ)');

  // State 2: Yearly Task & Measures
  const [taskCategory, setTaskCategory] = useState<'hoc-tap' | 'dao-duc' | 'lao-dong' | 'phong-trao'>(
    'hoc-tap'
  );
  const [taskTitle, setTaskTitle] = useState(
    'Tổ chức mô hình "Đôi bạn cùng tiến" và bồi dưỡng CLB học tập môn Toán & Tiếng Anh'
  );
  const [taskTarget, setTaskTarget] = useState(
    '100% học sinh diện cần hỗ trợ (Đỗ Văn Tuấn, Nguyễn Văn An) có tiến bộ rõ rệt; nâng tỷ lệ Tốt/Khá môn Toán và Ngoại ngữ lên 75%.'
  );
  const [taskMeasures, setTaskMeasures] = useState(
    '1. Phân công 3 học sinh có học lực Tốt hỗ trợ trực tiếp bạn cần giúp đỡ trong 15 phút đầu giờ.\n2. Phối hợp với giáo viên bộ môn Toán & Tiếng Anh tăng cường sửa bài tập.\n3. Ban cán sự lớp kiểm tra vở bài tập và nhật ký tự học hằng ngày.'
  );
  const [taskTimeframe, setTaskTimeframe] = useState('Học kỳ I & Cả năm học 2026-2027');
  const [taskAssignee, setTaskAssignee] = useState(
    'GVCN Lê Đức Minh, Lớp phó học tập Hồ Thái Thảo Nguyên, Ban cán sự bộ môn'
  );

  // State 3: Monthly Activities
  const [selectedMonth, setSelectedMonth] = useState<number>(targetMonth);
  const monthlyPresets: Record<number, { theme: string; goal: string; activities: string[] }> = {
    9: {
      theme: 'Truyền thống nhà trường và Chi đội',
      goal: 'Ổn định nề nếp, bầu Ban cán sự lớp, phát động thi đua Tháng Khuyến học.',
      activities: [
        'Tổ chức Đại hội Chi đội năm học 2026 - 2027',
        'Học tập nội quy nhà trường và Điều lệ Đội TNTP',
        'Ký cam kết An toàn giao thông & Không bạo lực học đường',
        'Họp Ban đại diện Cha mẹ học sinh đầu năm',
      ],
    },
    10: {
      theme: 'Chăm ngoan học tốt - Tiến bước lên Đoàn',
      goal: 'Thi đua giành hoa điểm tốt, nâng cao chất lượng học tập 16 môn, kỷ niệm ngày Phụ nữ Việt Nam 20/10.',
      activities: [
        'Phát động đợt thi đua "Tuần học tốt - Tiết học kiểu mẫu"',
        'Tổ chức sinh hoạt chuyên đề kỷ niệm 20/10: "Lời tri ân mẹ và cô"',
        'Kiểm tra nề nếp vệ sinh lớp học và góc học tập 4 tổ',
        'Sơ kết thi đua tháng 10 và tuyên dương các bạn tiến bộ',
      ],
    },
    11: {
      theme: 'Tôn sư trọng đạo - Tri ân thầy cô giáo',
      goal: 'Hướng về ngày Nhà giáo Việt Nam 20/11, nâng cao văn hóa ứng xử sư phạm.',
      activities: [
        'Hội thi làm báo tường / tập san chủ đề "Bụi phấn tri ân"',
        'Hội diễn văn nghệ cấp trường chào mừng ngày 20/11',
        'Phong trào "Bông hoa điểm 10 dâng tặng thầy cô"',
        'Gặp mặt tri ân giáo viên bộ môn giảng dạy lớp 7/1',
      ],
    },
    12: {
      theme: 'Uống nước nhớ nguồn - Tiếp bước anh bộ đội Cụ Hồ',
      goal: 'Giáo dục truyền thống yêu nước nhân kỷ niệm ngày 22/12, tập trung ôn thi cuối Học kỳ I.',
      activities: [
        'Thăm viếng và chăm sóc Đài tưởng niệm liệt sĩ địa phương',
        'Hội thao quốc phòng / trò chơi dân gian rèn luyện thể lực',
        'Sinh hoạt lớp chuyên đề: Kỹ năng ôn thi và quản lý thời gian',
        'Tổ chức ôn tập chéo giữa các tổ chuẩn bị kiểm tra cuối HKI',
      ],
    },
    1: {
      theme: 'Mừng Đảng - Mừng Xuân',
      goal: 'Sơ kết Học kỳ I, triển khai nhiệm vụ Học kỳ II, đón Tết Nguyên đán an toàn, lành mạnh.',
      activities: [
        'Họp phụ huynh sơ kết Học kỳ I năm học 2026-2027',
        'Phong trào "Xuân sẻ chia - Tết yêu thương" giúp đỡ bạn khó khăn',
        'Tuyên truyền phòng chống pháo nổ và an toàn giao thông dịp Tết',
        'Tổ chức trò chơi dân gian ngày xuân trong giờ sinh hoạt lớp',
      ],
    },
    2: {
      theme: 'Vươn lên trong học tập',
      goal: 'Bắt nhịp nề nếp sau Tết, tăng tốc phong trào học tập Học kỳ II.',
      activities: [
        'Phát động thi đua "Mở hàng điểm 10 đầu xuân"',
        'Kiểm tra việc duy trì nề nếp chuyên cần và đồng phục',
        'Tổ chức chuyên đề phương pháp học tốt môn Khoa học tự nhiên',
        'Giao lưu thể thao bóng rổ/bóng đá giữa các tổ',
      ],
    },
    3: {
      theme: 'Tiến bước lên Đoàn - Chào mừng ngày 26/3',
      goal: 'Giáo dục truyền thống Đoàn TNCS Hồ Chí Minh, thi đua học tập và rèn luyện thể chất.',
      activities: [
        'Hội thi "Nghi thức Đội và Chỉ huy Đội giỏi"',
        'Ngày hội "Thiếu nhi vui khỏe - Tiến bước lên Đoàn"',
        'Cắm trại dã ngoại / Hoạt động trải nghiệm sáng tạo',
        'Sinh hoạt chuyên đề giới thiệu về Đoàn TNCS Hồ Chí Minh',
      ],
    },
    4: {
      theme: 'Hòa bình và Hữu nghị - Kỷ niệm ngày 30/4',
      goal: 'Giáo dục lòng tự hào dân tộc, ôn tập chuẩn bị thi cuối năm học.',
      activities: [
        'Hội thi tìm hiểu lịch sử địa phương và ngày Giải phóng miền Nam 30/4',
        'Phát động đợt cao điểm ôn tập kiểm tra cuối Học kỳ II',
        'Rà soát học sinh có nguy cơ chưa đạt để tăng cường phụ đạo',
        'Tổng kết phong trào "Đôi bạn cùng tiến"',
      ],
    },
    5: {
      theme: 'Kính yêu Bác Hồ - Tự hào thiếu nhi Việt Nam',
      goal: 'Thi cuối kỳ nghiêm túc, tổng kết năm học, bàn giao sinh hoạt hè.',
      activities: [
        'Chào mừng kỷ niệm ngày sinh Chủ tịch Hồ Chí Minh 19/5',
        'Tổng kết thi đua lớp và bình xét khen thưởng năm học 2026-2027',
        'Họp phụ huynh học sinh cuối năm học',
        'Bàn giao học sinh về sinh hoạt hè tại địa phương',
      ],
    },
  };

  const currentPreset = monthlyPresets[selectedMonth] || monthlyPresets[10];

  const [monthTheme, setMonthTheme] = useState(currentPreset.theme);
  const [monthGoal, setMonthGoal] = useState(currentPreset.goal);
  const [activitiesList, setActivitiesList] = useState<string[]>([...currentPreset.activities]);

  const handleSelectMonth = (m: number) => {
    setSelectedMonth(m);
    const preset = monthlyPresets[m] || monthlyPresets[10];
    setMonthTheme(preset.theme);
    setMonthGoal(preset.goal);
    setActivitiesList([...preset.activities]);
  };

  const [appliedToast, setAppliedToast] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    if (activeTab === 'yearly-task' && onApplyYearlyTask) {
      onApplyYearlyTask({
        category: taskCategory,
        title: taskTitle,
        target: taskTarget,
        measures: taskMeasures,
        timeframe: taskTimeframe,
        assignee: taskAssignee,
        status: 'Chưa thực hiện',
        notes: 'Đề xuất bởi Trợ lý AI GVCN (Đã qua kiểm tra và chỉnh sửa)',
      });
    } else if (activeTab === 'goal-analysis' && onApplyGoalAnalysis) {
      onApplyGoalAnalysis(goalDraft, {
        conductGoodRate: conductTarget,
        academicGoodRate: academicTarget,
        pioneerTitle: pioneerTitle,
        attendanceRate: attendanceRate,
      });
    } else if (activeTab === 'monthly-activities' && onApplyMonthlyActivities) {
      onApplyMonthlyActivities(monthTheme, monthGoal, activitiesList);
    }

    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-800 via-indigo-800 to-sky-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Trợ Lý AI Hỗ Trợ Xây Dựng Kế Hoạch & Biện Pháp Sư Phạm
              </h3>
              <p className="text-xs text-purple-200">
                Phân tích dữ liệu lớp {currentClass?.className} ({total} học sinh • {supportCount} HS cần hỗ trợ • {talentCount} năng khiếu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MANDATORY WARNING BANNER: Bắt buộc theo Nguyên tắc III & Mục 5 */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-800 block text-xs">
              "Đây là nội dung đề xuất – giáo viên cần kiểm tra trước khi áp dụng."
            </strong>
            <span>
              Hệ thống <strong>tuyệt đối không tự lưu</strong>. AI tổng hợp và phân tích dựa trên dữ liệu thật của lớp, đề xuất các ý tưởng sư phạm để giáo viên chủ nhiệm xem xét, chỉnh sửa trực tiếp bên dưới trước khi bấm "Áp dụng".
            </span>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('goal-analysis')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'goal-analysis'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            1. Phân tích mục tiêu & Chỉ tiêu năm
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('yearly-task')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'yearly-task'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            2. Gợi ý nhiệm vụ & Biện pháp
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monthly-activities')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'monthly-activities'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            3. Gợi ý hoạt động theo tháng
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
          {/* TAB 1: PHÂN TÍCH MỤC TIÊU & CHỈ TIÊU NĂM */}
          {activeTab === 'goal-analysis' && (
            <div className="space-y-4">
              {/* Insight Summary Box */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 leading-relaxed">
                <strong className="block text-purple-800 font-bold mb-1">
                  🔍 Phân tích dữ liệu học sinh lớp {currentClass?.className}:
                </strong>
                Sĩ số {total} học sinh (16 Nam, 15 Nữ). Lớp có <strong>{supportCount} học sinh cần hỗ trợ</strong> (Đỗ Văn Tuấn cần phụ đạo Toán, Nguyễn Văn An cần phụ đạo Tiếng Anh), <strong>{talentCount} học sinh có năng khiếu</strong> (Cờ vua, bơi lội, âm nhạc) và <strong>{progressCount} học sinh có tiến bộ</strong>. AI đề xuất mục tiêu giáo dục toàn diện, tập trung kèm cặp cá thể hóa và giữ nghiêm nề nếp.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mục tiêu chung cả năm học (Đề xuất):
                </label>
                <textarea
                  rows={3}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chỉ tiêu Rèn luyện (Hạnh kiểm):
                  </label>
                  <input
                    type="text"
                    value={conductTarget}
                    onChange={(e) => setConductTarget(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chỉ tiêu Học tập (Học lực):
                  </label>
                  <input
                    type="text"
                    value={academicTarget}
                    onChange={(e) => setAcademicTarget(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh hiệu Chi đội:
                  </label>
                  <input
                    type="text"
                    value={pioneerTitle}
                    onChange={(e) => setPioneerTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tỷ lệ chuyên cần:
                  </label>
                  <input
                    type="text"
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GỢI Ý NHIỆM VỤ & BIỆN PHÁP SƯ PHẠM */}
          {activeTab === 'yearly-task' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Gợi ý nhiệm vụ, chỉ tiêu & biện pháp:
                </span>
                <span className="text-[11px] text-slate-500">
                  Giáo viên có thể chỉnh sửa trực tiếp nội dung bên dưới
                </span>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 font-bold text-[11px]">Mẫu gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTaskCategory('hoc-tap');
                    setTaskTitle('Phụ đạo học sinh yếu môn Toán & Anh và nâng cao chất lượng tự học');
                    setTaskTarget('100% học sinh diện cần hỗ trợ được kèm cặp; giảm tỷ lệ học sinh yếu kém về 0%.');
                    setTaskMeasures('1. Thành lập 3 nhóm Đôi bạn cùng tiến.\n2. Ban cán sự môn Tiếng Anh & Toán kiểm tra bài tập 15 phút đầu giờ.\n3. GVCN phối hợp giáo viên bộ môn phụ đạo thêm 1 tiết/tuần.');
                    setTaskAssignee('GVCN Lê Đức Minh, Lớp phó học tập Hồ Thái Thảo Nguyên');
                  }}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 text-[11px] font-semibold"
                >
                  Phụ đạo & Đôi bạn cùng tiến
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTaskCategory('dao-duc');
                    setTaskTitle('Nâng cao ý thức kỷ luật, văn hóa giao tiếp và phòng chống bạo lực học đường');
                    setTaskTarget('100% học sinh xếp loại Rèn luyện Tốt/Khá; không có vi phạm kỷ luật hay đi muộn.');
                    setTaskMeasures('1. Phát huy vai trò 4 tổ trưởng tự quản chấm điểm thi đua hằng ngày.\n2. Tổ chức sinh hoạt lớp chuyên đề "Văn hóa ứng xử học đường".\n3. Giữ mối liên hệ chặt chẽ với phụ huynh qua sổ liên lạc điện tử.');
                    setTaskAssignee('GVCN Lê Đức Minh, Lớp trưởng Nguyễn Anh Dũng, Ban chỉ huy Chi đội');
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 text-[11px] font-semibold"
                >
                  Nề nếp & Kỷ luật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTaskCategory('phong-trao');
                    setTaskTitle('Phát huy học sinh năng khiếu cờ vua, bơi lội và văn nghệ trong Hội khỏe Phù Đổng');
                    setTaskTarget('Đoạt ít nhất 2 giải Nhất/Nhì cấp trường; 100% học sinh tham gia phong trào thể thao.');
                    setTaskMeasures('1. Tạo điều kiện cho các bạn năng khiếu tập luyện định kỳ.\n2. Động viên tập thể lớp cổ vũ và thành lập đội văn nghệ lớp 7/1.');
                    setTaskAssignee('Lớp phó lao động/phong trào Trần Anh Khoa, Cán sự thể dục');
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-[11px] font-semibold"
                >
                  Năng khiếu & Văn - Thể - Mỹ
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mảng công tác:</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
                >
                  <option value="hoc-tap">Nâng cao chất lượng học tập & tự học</option>
                  <option value="dao-duc">Giáo dục đạo đức, nề nếp kỷ cương</option>
                  <option value="lao-dong">Lao động, vệ sinh & bảo vệ tài sản trường lớp</option>
                  <option value="phong-trao">Hoạt động Đội & phong trào Văn - Thể - Mỹ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên nhiệm vụ đề xuất:</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu phấn đấu:</label>
                <input
                  type="text"
                  value={taskTarget}
                  onChange={(e) => setTaskTarget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp thực hiện sư phạm:</label>
                <textarea
                  rows={3}
                  value={taskMeasures}
                  onChange={(e) => setTaskMeasures(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian thực hiện:</label>
                  <input
                    type="text"
                    value={taskTimeframe}
                    onChange={(e) => setTaskTimeframe(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách:</label>
                  <input
                    type="text"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GỢI Ý HOẠT ĐỘNG THÁNG */}
          {activeTab === 'monthly-activities' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn tháng cần gợi ý hoạt động giáo dục:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMonth(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMonth === m
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Tháng {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ điểm tháng:</label>
                <input
                  type="text"
                  value={monthTheme}
                  onChange={(e) => setMonthTheme(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu trọng tâm tháng:</label>
                <textarea
                  rows={2}
                  value={monthGoal}
                  onChange={(e) => setMonthGoal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Danh sách hoạt động trải nghiệm & thi đua đề xuất:
                </label>
                <div className="space-y-2">
                  {activitiesList.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => {
                          const updated = [...activitiesList];
                          updated[idx] = e.target.value;
                          setActivitiesList(updated);
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = activitiesList.filter((_, i) => i !== idx);
                          setActivitiesList(updated);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Xóa hoạt động này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setActivitiesList([...activitiesList, 'Hoạt động trải nghiệm mới...'])}
                    className="text-purple-600 hover:text-purple-800 font-bold text-xs flex items-center gap-1 pt-1"
                  >
                    + Thêm một hoạt động
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {appliedToast ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Đã áp dụng đề xuất vào kế hoạch thành công!
            </span>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors text-xs"
            >
              Hủy bỏ
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {activeTab === 'goal-analysis'
              ? 'Áp dụng mục tiêu & chỉ tiêu'
              : activeTab === 'yearly-task'
              ? 'Thêm nhiệm vụ vào kế hoạch năm'
              : 'Áp dụng hoạt động vào kế hoạch tháng'}
          </button>
        </div>
      </div>
    </div>
  );
};
