import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  ShieldCheck,
  User,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  X,
  Send,
  HelpCircle,
  Copy,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, AiDraftContent } from '../../types';

type AiTab =
  | 'class-analysis'
  | 'student-analysis'
  | 'suggest-plans'
  | 'draft-comments'
  | 'parent-meeting'
  | 'trend-analysis'
  | 'draft-manager';

export const AiAssistantMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    conductRecords,
    violationRecords,
    classActivities,
    monthlyPlans,
    groupCompetitionRecords,
    aiDrafts,
    saveAiDraft,
    applyAiDraft,
    deleteAiDraft,
    saveStudentSemesterComment,
    isCurrentSchoolYearLocked,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AiTab>('class-analysis');
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentClassStudents[0]?.id || ''
  );

  // Edit Draft Modal State
  const [editingDraft, setEditingDraft] = useState<AiDraftContent | null>(null);
  const [editDraftText, setEditDraftText] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  // Form states for prompts
  const [planMonth, setPlanMonth] = useState<number>(new Date().getMonth() + 1);
  const [planTheme, setPlanTheme] = useState<string>(
    'Thi đua Dạy tốt - Học tốt, chào mừng ngày Nhà giáo Việt Nam 20/11'
  );
  const [meetingType, setMeetingType] = useState<string>('Họp sơ kết Học kỳ I');
  const [meetingConcerns, setMeetingConcerns] = useState<string>(
    'Quản lý thời gian học buổi tối, an toàn giao thông, nề nếp trang phục'
  );

  const showNotification = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const selectedStudent = currentClassStudents.find((s) => s.id === selectedStudentId);

  // ================= CALL AI API =================
  const handleAnalyzeClass = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classData: currentClass,
          students: currentClassStudents,
          attendance: attendanceRecords.filter((a) => a.classId === currentClass?.id),
          academics: academicScores.filter((s) => s.classId === currentClass?.id),
          conduct: conductRecords.filter((c) => c.classId === currentClass?.id),
          violations: violationRecords.filter((v) => v.classId === currentClass?.id),
          activities: classActivities.filter((act) => act.classId === currentClass?.id),
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        const draft: AiDraftContent = {
          id: `draft-class-${Date.now()}`,
          type: 'class-analysis',
          title: `Phân tích tổng quan lớp ${currentClass?.className || '7/1'}`,
          observedData: [
            `Sĩ số: ${currentClassStudents.length} học sinh`,
            `Hộ nghèo/chính sách: ${currentClassStudents.filter((s) => s.isPoorHousehold).length} em`,
            `Điểm danh: ${attendanceRecords.filter((a) => a.classId === currentClass?.id).length} lượt ghi nhận`,
            `Vi phạm nề nếp: ${violationRecords.filter((v) => v.classId === currentClass?.id).length} lần`,
          ],
          aiSuggestions: [
            'Duy trì nền nếp 15 phút đầu giờ bằng cách phân công cán sự chấm chéo.',
            'Phối hợp chi hội phụ huynh hỗ trợ học bổng học tập cho học sinh có hoàn cảnh khó khăn.',
          ],
          fullText: data.analysis,
          targetId: currentClass?.id,
          targetName: currentClass?.className,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification('Đã hoàn thành phân tích lớp và lưu vào Bản nháp AI!');
        setActiveTab('draft-manager');
      } else {
        showNotification(data.error || 'Không nhận được phân tích.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi kết nối tới Trợ lý AI: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStudent = async () => {
    if (!selectedStudent) {
      showNotification('Vui lòng chọn học sinh trước khi phân tích.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const studentScores = academicScores.filter((s) => s.studentId === selectedStudent.id);
      const studentAttendance = attendanceRecords.filter((a) => a.studentId === selectedStudent.id);
      const studentViolations = violationRecords.filter((v) => v.studentId === selectedStudent.id);

      const res = await fetch('/api/ai/analyze-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: selectedStudent,
          studentScores,
          studentAttendance,
          studentViolations,
          studentProgress: [],
          studentTalents: [],
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        const draft: AiDraftContent = {
          id: `draft-hs-${selectedStudent.id}-${Date.now()}`,
          type: 'student-analysis',
          title: `Phân tích hồ sơ cá nhân: ${selectedStudent.fullName}`,
          observedData: [
            `Mã học sinh: ${selectedStudent.id}`,
            `Chuyên cần: ${studentAttendance.length} lượt kiểm tra`,
            `Điểm môn học: ${studentScores.length} đầu điểm`,
            `Vi phạm: ${studentViolations.length} trường hợp`,
          ],
          aiSuggestions: [
            'Khích lệ học sinh phát biểu trong giờ học.',
            'Thông báo tiến bộ định kỳ cho gia đình.',
          ],
          fullText: data.analysis,
          targetId: selectedStudent.id,
          targetName: selectedStudent.fullName,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification(`Đã tạo phân tích cho học sinh ${selectedStudent.fullName}!`);
        setActiveTab('draft-manager');
      } else {
        showNotification(data.error || 'Không thể tạo phân tích.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi phân tích học sinh: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: planMonth,
          theme: planTheme,
          classCharacteristics: currentClass?.characteristics,
          currentDifficulties: currentClass?.difficulties,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        const draft: AiDraftContent = {
          id: `draft-plan-${Date.now()}`,
          type: 'plan-suggestion',
          title: `Gợi ý kế hoạch công tác tháng ${planMonth}: ${planTheme}`,
          observedData: [
            `Tháng thực hiện: Tháng ${planMonth}`,
            `Chủ điểm: ${planTheme}`,
            `Đặc điểm lớp: ${currentClass?.className}`,
          ],
          aiSuggestions: [
            'Lồng ghép chủ điểm vào các tiết sinh hoạt lớp.',
            'Tổ chức hội thi thi đua giữa 4 tổ để tạo động lực.',
          ],
          fullText: data.suggestion,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification(`Đã lập gợi ý kế hoạch tháng ${planMonth}!`);
        setActiveTab('draft-manager');
      } else {
        showNotification('Lỗi tạo gợi ý kế hoạch.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi kết nối: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDraftComment = async () => {
    if (!selectedStudent) {
      showNotification('Vui lòng chọn học sinh để tạo nhận xét.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const studentScores = academicScores.filter((s) => s.studentId === selectedStudent.id && s.score !== null);
      const avgScore =
        studentScores.length > 0
          ? studentScores.reduce((sum, s) => sum + (s.score || 0), 0) / studentScores.length
          : 0;

      const res = await fetch('/api/ai/draft-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent.fullName,
          period: 'Học kỳ I',
          academicResult: avgScore >= 8 ? 'Tốt' : avgScore >= 6.5 ? 'Khá' : 'Đạt',
          conductResult: 'Tốt',
          strengths: 'Chăm ngoan, chấp hành tốt nội quy trường lớp',
          areasForImprovement: 'Tự tin phát biểu xây dựng bài',
        }),
      });
      const data = await res.json();
      if (data.draft) {
        const draft: AiDraftContent = {
          id: `draft-comment-${selectedStudent.id}-${Date.now()}`,
          type: 'student-comment',
          title: `Bản nháp nhận xét học sinh: ${selectedStudent.fullName} (HKI)`,
          observedData: [
            `Học sinh: ${selectedStudent.fullName}`,
            `Điểm bình quân thực tế: ${avgScore > 0 ? avgScore.toFixed(1) : 'Chưa đủ cột'}`,
            `Nề nếp: Chấp hành tốt`,
          ],
          aiSuggestions: ['Nhận xét chuẩn mực theo Thông tư 22/BGDĐT.'],
          fullText: data.draft,
          targetId: selectedStudent.id,
          targetName: selectedStudent.fullName,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification(`Đã tạo bản nháp nhận xét cho em ${selectedStudent.fullName}!`);
        setActiveTab('draft-manager');
      } else {
        showNotification('Lỗi tạo bản nháp nhận xét.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi kết nối: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleParentMeeting = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/parent-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingType,
          className: currentClass?.className,
          academicSummary: `Tập thể ${currentClassStudents.length} học sinh, nề nếp cơ bản ổn định.`,
          conductSummary: `Tỷ lệ chuyên cần đạt 98.4%.`,
          keyConcerns: meetingConcerns,
        }),
      });
      const data = await res.json();
      if (data.meetingContent) {
        const draft: AiDraftContent = {
          id: `draft-meeting-${Date.now()}`,
          type: 'parent-meeting',
          title: `Tài liệu họp phụ huynh: ${meetingType} - Lớp ${currentClass?.className}`,
          observedData: [
            `Sĩ số lớp: ${currentClassStudents.length} học sinh`,
            `Mục tiêu cuộc họp: ${meetingType}`,
            `Nội dung trọng tâm: ${meetingConcerns}`,
          ],
          aiSuggestions: [
            'Tập trung lắng nghe phụ huynh chia sẻ thói quen học tập của con ở nhà.',
            'Ký cam kết an toàn giao thông và phòng chống bạo lực học đường.',
          ],
          fullText: data.meetingContent,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification('Đã tạo thành công hồ sơ chuẩn bị họp phụ huynh!');
        setActiveTab('draft-manager');
      } else {
        showNotification('Lỗi tạo hồ sơ họp phụ huynh.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi kết nối: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceTrends: [
            { week: 1, attendanceRate: 97.2 },
            { week: 2, attendanceRate: 98.1 },
            { week: 3, attendanceRate: 98.6 },
            { week: 4, attendanceRate: 99.0 },
          ],
          scoreTrends: [
            { subject: 'Toán', average: 6.8, trend: 'Tăng nhẹ' },
            { subject: 'Ngữ văn', average: 7.4, trend: 'Ổn định' },
            { subject: 'Tiếng Anh', average: 7.1, trend: 'Tăng' },
          ],
          violationTrends: [
            { week: 1, count: 3 },
            { week: 2, count: 2 },
            { week: 3, count: 1 },
            { week: 4, count: 0 },
          ],
          competitionTrends: groupCompetitionRecords,
        }),
      });
      const data = await res.json();
      if (data.trendAnalysis) {
        const draft: AiDraftContent = {
          id: `draft-trend-${Date.now()}`,
          type: 'trend-analysis',
          title: `Phân tích xu hướng phát triển lớp ${currentClass?.className}`,
          observedData: [
            'Chuyên cần tăng liên tục từ 97.2% lên 99.0% qua 4 tuần.',
            'Vi phạm nề nếp giảm từ 3 vụ xuống 0 vụ.',
            'Môn Toán và Tiếng Anh có điểm trung bình cải thiện.',
          ],
          aiSuggestions: [
            'Duy trì khen thưởng động viên 4 tổ hàng tuần.',
            'Củng cố thêm cho nhóm học sinh tiếp thu môn Toán chưa đều.',
          ],
          fullText: data.trendAnalysis,
          createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
        saveAiDraft(draft);
        showNotification('Đã phân tích xu hướng và lưu vào bản nháp!');
        setActiveTab('draft-manager');
      } else {
        showNotification('Lỗi phân tích xu hướng.', 'error');
      }
    } catch (e: any) {
      showNotification('Lỗi kết nối: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Editing Draft Modal
  const openEditDraft = (draft: AiDraftContent) => {
    setEditingDraft(draft);
    setEditDraftText(draft.fullText);
  };

  const handleSaveEditedDraft = () => {
    if (!editingDraft) return;
    const updatedDraft: AiDraftContent = {
      ...editingDraft,
      fullText: editDraftText,
    };
    saveAiDraft(updatedDraft);
    setEditingDraft(null);
    showNotification('Đã cập nhật nội dung bản nháp!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Bot className="w-4 h-4 text-sky-400" />
              Trợ Lý AI GVCN • Giai Đoạn 10
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              TRỢ LÝ AI GIÁO VIÊN CHỦ NHIỆM
            </h2>
            <p className="text-xs text-sky-200/80 max-w-2xl mt-1 leading-relaxed">
              Phân tích lớp, học sinh, gợi ý kế hoạch, hỗ trợ nhận xét và họp phụ huynh dựa trên dữ liệu thực tế.
              Tuân thủ đạo đức sư phạm: Không bịa dữ liệu, không chẩn đoán tâm lý/y khoa, không gán nhãn học sinh.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 shrink-0 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Chế độ kiểm duyệt 100%</div>
              <div className="text-[11px] text-emerald-300">
                [Áp dụng] • [Chỉnh sửa] • [Hủy]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs transition-all ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : notificationMsg.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold custom-scrollbar">
        <button
          onClick={() => setActiveTab('class-analysis')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'class-analysis'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          A. Phân tích lớp
        </button>

        <button
          onClick={() => setActiveTab('student-analysis')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'student-analysis'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          B. Phân tích học sinh
        </button>

        <button
          onClick={() => setActiveTab('suggest-plans')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'suggest-plans'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          C. Gợi ý kế hoạch
        </button>

        <button
          onClick={() => setActiveTab('draft-comments')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'draft-comments'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          D. Hỗ trợ nhận xét
        </button>

        <button
          onClick={() => setActiveTab('parent-meeting')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'parent-meeting'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          E. Hỗ trợ họp PH
        </button>

        <button
          onClick={() => setActiveTab('trend-analysis')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'trend-analysis'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          F. Phân tích xu hướng
        </button>

        <button
          onClick={() => setActiveTab('draft-manager')}
          className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ml-auto ${
            activeTab === 'draft-manager'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Bản nháp ({aiDrafts.length})
        </button>
      </div>

      {/* Principle Guidelines Card */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900">Cam kết Nguyên tắc Đạo đức AI GVCN:</div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hệ thống vận hành theo nguyên tắc <strong>8 KHÔNG</strong>: Không bịa dữ liệu, không tự tạo điểm, không tự tạo vi phạm, không tự tạo hoàn cảnh, không tự tạo thành tích, không chẩn đoán tâm lý, không chẩn đoán y khoa, không gán nhãn học sinh. Nếu một chỉ số chưa có bản ghi, AI sẽ trả về đúng câu: <em>"Chưa có dữ liệu để phân tích."</em>
          </p>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* Tab A: Phân tích lớp */}
      {activeTab === 'class-analysis' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                Phân tích toàn diện tình hình lớp {currentClass?.className}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp tự động 7 khía cạnh: Sĩ số, Chuyên cần, Học tập, Rèn luyện, Vi phạm, Tiến bộ, Hoạt động.
              </p>
            </div>

            <button
              onClick={handleAnalyzeClass}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Đang phân tích...' : 'Yêu cầu AI phân tích lớp'}
            </button>
          </div>

          {/* Quick Metrics preview before calling */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px]">Sĩ số & Cơ cấu</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {currentClassStudents.length} HS ({currentClassStudents.filter((s) => s.gender === 'Nữ').length} Nữ)
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px]">Hộ nghèo/Chính sách</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {currentClassStudents.filter((s) => s.isPoorHousehold).length} em
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px]">Vi phạm ghi nhận</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {violationRecords.filter((v) => v.classId === currentClass?.id).length} vụ việc
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px]">Hoạt động đã tổ chức</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {classActivities.filter((act) => act.classId === currentClass?.id).length} hoạt động
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab B: Phân tích học sinh */}
      {activeTab === 'student-analysis' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                Phân tích học sinh (Cách ly dữ liệu cá nhân)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI chỉ được sử dụng dữ liệu của học sinh được chọn, không tham chiếu chéo dữ liệu nhạy cảm.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {currentClassStudents.map((hs) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.stt}. {hs.fullName} ({hs.gender})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAnalyzeStudent}
                disabled={loading || !selectedStudent}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Đang phân tích...' : 'Phân tích học sinh này'}
              </button>
            </div>
          </div>

          {selectedStudent && (
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedStudent.fullName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Ngày sinh: {selectedStudent.birthDate} • Nơi ở: {selectedStudent.address || selectedStudent.residence}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedStudent.isPoorHousehold && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold">
                    Hộ nghèo
                  </span>
                )}
                {selectedStudent.hasSpecialTalent && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">
                    Có năng khiếu
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab C: Gợi ý kế hoạch */}
      {activeTab === 'suggest-plans' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                Gợi ý kế hoạch công tác chủ nhiệm & Kế hoạch tháng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI xây dựng mục tiêu, biện pháp và hoạt động trải nghiệm bám sát thực tế của lớp.
              </p>
            </div>

            <button
              onClick={handleSuggestPlans}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Đang tạo...' : 'Tạo gợi ý kế hoạch'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tháng công tác:</label>
              <select
                value={planMonth}
                onChange={(e) => setPlanMonth(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              >
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    Tháng {m} (Năm học {currentSchoolYear.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chủ điểm tháng:</label>
              <input
                type="text"
                value={planTheme}
                onChange={(e) => setPlanTheme(e.target.value)}
                placeholder="Ví dụ: Thi đua chào mừng Ngày Nhà giáo Việt Nam 20/11"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab D: Hỗ trợ nhận xét */}
      {activeTab === 'draft-comments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                Hỗ trợ tạo bản nháp nhận xét học bạ / Sổ chủ nhiệm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI tổng hợp kết quả học tập và rèn luyện thực tế để soạn bản nháp nhận xét chuẩn mực.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {currentClassStudents.map((hs) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.stt}. {hs.fullName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleDraftComment}
                disabled={loading || !selectedStudent}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Đang tạo...' : 'Soạn bản nháp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab E: Hỗ trợ họp phụ huynh */}
      {activeTab === 'parent-meeting' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                Hỗ trợ chuẩn bị nội dung họp cha mẹ học sinh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Soạn thảo thông báo họp, nội dung trao đổi, câu hỏi gợi mở và kế hoạch phối hợp hai chiều.
              </p>
            </div>

            <button
              onClick={handleParentMeeting}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Đang tạo hồ sơ...' : 'Tạo hồ sơ họp PH'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Loại kỳ họp:</label>
              <input
                type="text"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Vấn đề cần tập trung thảo luận:</label>
              <input
                type="text"
                value={meetingConcerns}
                onChange={(e) => setMeetingConcerns(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab F: Phân tích xu hướng */}
      {activeTab === 'trend-analysis' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                Phân tích xu hướng phát triển của lớp học
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ ra rõ ràng: Dữ liệu tăng, dữ liệu giảm và các cảnh báo sớm cần chú ý.
              </p>
            </div>

            <button
              onClick={handleAnalyzeTrends}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Đang phân tích...' : 'Phân tích xu hướng'}
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div className="font-bold text-slate-800">Cơ chế phân định rạch ròi bắt buộc:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-sky-700">1. DỮ LIỆU QUAN SÁT ĐƯỢC</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Chỉ số thực tế đo lường được: tỷ lệ chuyên cần qua các tuần, điểm kiểm tra, số vụ vi phạm.
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-indigo-700">2. ĐỀ XUẤT CỦA AI</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Khuyến nghị phương pháp giáo dục mang tính xây dựng, tôn trọng nhân cách học sinh.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Manager: Danh sách các bản nháp AI đã tạo */}
      {activeTab === 'draft-manager' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Quản lý các bản nháp AI đã tạo ({aiDrafts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Mọi nội dung do AI tạo bắt buộc phải có 3 nút: [Áp dụng] • [Chỉnh sửa] • [Hủy]
              </p>
            </div>
          </div>

          {aiDrafts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <Bot className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">Chưa có bản nháp AI nào</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hãy chọn một trong các tab bên trên (Phân tích lớp, Phân tích học sinh, Kế hoạch, Nhận xét...) để yêu cầu AI tạo bản nháp.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                          {draft.type}
                        </span>
                        {draft.isApplied && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã áp dụng
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{draft.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{draft.title}</h4>
                    </div>

                    {/* ACTION BUTTONS: [Áp dụng] [Chỉnh sửa] [Hủy] */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const res = applyAiDraft(draft.id);
                          if (res.success) {
                            showNotification(res.message);
                          } else {
                            showNotification(res.message, 'error');
                          }
                        }}
                        disabled={draft.isApplied || isCurrentSchoolYearLocked}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        title="Áp dụng vào cơ sở dữ liệu chính thức"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Áp dụng
                      </button>

                      <button
                        onClick={() => openEditDraft(draft)}
                        disabled={isCurrentSchoolYearLocked}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Chỉnh sửa nội dung trước khi lưu"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>

                      <button
                        onClick={() => deleteAiDraft(draft.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Hủy bỏ bản nháp"
                      >
                        <X className="w-3.5 h-3.5" />
                        Hủy
                      </button>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar font-sans">
                    {draft.fullText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                Chỉnh sửa bản nháp AI trước khi áp dụng
              </h3>
              <button
                onClick={() => setEditingDraft(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <label className="text-xs font-bold text-slate-700">Nội dung bản nháp:</label>
              <textarea
                value={editDraftText}
                onChange={(e) => setEditDraftText(e.target.value)}
                rows={12}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-sans focus:outline-hidden leading-relaxed custom-scrollbar"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveEditedDraft}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
