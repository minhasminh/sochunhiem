import React, { useState, useMemo } from 'react';
import {
  Smile,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Save,
  Printer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Edit,
  Trash2,
  UserCheck,
  HeartHandshake,
  MessageSquare,
  Award,
  ChevronRight,
  Check,
  X,
  FileText,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ConductGrade,
  ConductRecord,
  ConductTerm,
  ProgressLevel,
  Student,
  StudentProgressEntry,
  StudentSupportTag,
  SupportCategory,
  ViolationRecord,
  ViolationSeverity,
  WeeklyConductLog,
} from '../../types';

const CONDUCT_TERMS: ConductTerm[] = [
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
];

const SUPPORT_CATEGORIES: { id: SupportCategory; label: string; color: string; desc: string }[] = [
  { id: 'học tập', label: 'Học tập', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Tiếp thu chậm, hổng kiến thức căn bản' },
  { id: 'chuyên cần', label: 'Chuyên cần', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Hay đi muộn, nghỉ học, vắng tiết' },
  { id: 'rèn luyện', label: 'Rèn luyện', color: 'bg-rose-100 text-rose-800 border-rose-200', desc: 'Hiếu động, nói chuyện riêng, vi phạm nề nếp' },
  { id: 'kỹ năng', label: 'Kỹ năng', color: 'bg-purple-100 text-purple-800 border-purple-200', desc: 'Rụt rè, giao tiếp kém, chưa hòa đồng' },
  { id: 'hoàn cảnh', label: 'Hoàn cảnh', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Hộ nghèo, mồ côi, hoàn cảnh gia đình éo le' },
  { id: 'cần phối hợp gia đình', label: 'Phối hợp gia đình', color: 'bg-orange-100 text-orange-800 border-orange-200', desc: 'Phụ huynh ít liên lạc, cần giám sát tự học tại nhà' },
];

export const ConductMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    conductRecords,
    saveConductRecord,
    violationRecords,
    addViolationRecord,
    updateViolationRecord,
    deleteViolationRecord,
    weeklyConductLogs,
    addWeeklyConductLog,
    deleteWeeklyConductLog,
    studentProgressEntries,
    addStudentProgressEntry,
    deleteStudentProgressEntry,
    studentSupportTags,
    addStudentSupportTag,
    removeStudentSupportTag,
    toggleSupportTagResolved,
    currentUser,
    setSelectedStudent,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Sub-tabs: 'conduct' | 'violations' | 'weekly' | 'progress' | 'support' | 'ai-assist'
  const [activeTab, setActiveTab] = useState<
    'conduct' | 'violations' | 'weekly' | 'progress' | 'support' | 'ai-assist'
  >('conduct');

  // Filters
  const [selectedTerm, setSelectedTerm] = useState<ConductTerm>('Tháng 9');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');

  // ================= 1. TAB RÈN LUYỆN (Draft Table State) =================
  const existingRecordsForTerm = useMemo(() => {
    return conductRecords.filter(
      (r) => r.classId === (currentClass?.id || 'class-7-1') && r.term === selectedTerm
    );
  }, [conductRecords, currentClass, selectedTerm]);

  const [conductDrafts, setConductDrafts] = useState<
    Record<
      string,
      {
        grade: ConductGrade;
        teacherComment: string;
        positiveManifestations: string;
        areasForImprovement: string;
      }
    >
  >(() => {
    const map: Record<string, any> = {};
    currentClassStudents.forEach((st) => {
      const found = existingRecordsForTerm.find((r) => r.studentId === st.id);
      map[st.id] = {
        grade: found?.grade || 'Tốt',
        teacherComment: found?.teacherComment || '',
        positiveManifestations: found?.positiveManifestations || '',
        areasForImprovement: found?.areasForImprovement || '',
      };
    });
    return map;
  });

  // Re-sync draft when term or students change
  React.useEffect(() => {
    const map: Record<string, any> = {};
    currentClassStudents.forEach((st) => {
      const found = existingRecordsForTerm.find((r) => r.studentId === st.id);
      map[st.id] = {
        grade: found?.grade || 'Tốt',
        teacherComment: found?.teacherComment || '',
        positiveManifestations: found?.positiveManifestations || '',
        areasForImprovement: found?.areasForImprovement || '',
      };
    });
    setConductDrafts(map);
  }, [existingRecordsForTerm, currentClassStudents, selectedTerm]);

  const [saveToast, setSaveToast] = useState(false);

  const handleDraftChange = (studentId: string, field: string, val: any) => {
    setConductDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          grade: 'Tốt',
          teacherComment: '',
          positiveManifestations: '',
          areasForImprovement: '',
        }),
        [field]: val,
      },
    }));
  };

  const handleSaveAllConduct = () => {
    currentClassStudents.forEach((st) => {
      const draft = conductDrafts[st.id];
      if (draft) {
        saveConductRecord({
          classId: currentClass?.id || 'class-7-1',
          schoolYearId: currentSchoolYear.id,
          studentId: st.id,
          term: selectedTerm,
          grade: draft.grade,
          teacherComment: draft.teacherComment.trim(),
          positiveManifestations: draft.positiveManifestations.trim(),
          areasForImprovement: draft.areasForImprovement.trim(),
        });
      }
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Conduct Stats for selected term
  const conductStats = useMemo(() => {
    const grades = currentClassStudents.map((st) => conductDrafts[st.id]?.grade || 'Tốt');
    const total = grades.length;
    const good = grades.filter((g) => g === 'Tốt').length;
    const fair = grades.filter((g) => g === 'Khá').length;
    const pass = grades.filter((g) => g === 'Đạt').length;
    const fail = grades.filter((g) => g === 'Chưa đạt').length;
    return {
      good,
      fair,
      pass,
      fail,
      goodRate: total > 0 ? Math.round((good / total) * 100) : 0,
      fairRate: total > 0 ? Math.round((fair / total) * 100) : 0,
    };
  }, [currentClassStudents, conductDrafts]);

  // ================= 2. TAB VI PHẠM STATE & MODAL =================
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [violationForm, setViolationForm] = useState<{
    studentId: string;
    date: string;
    title: string;
    severity: ViolationSeverity;
    location: string;
    recordedBy: string;
    educationalMeasures: string;
    resultAfterEducation: string;
    notes: string;
  }>({
    studentId: currentClassStudents[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    severity: 'Nhắc nhở',
    location: 'Phòng học P.204',
    recordedBy: 'GVCN',
    educationalMeasures: '',
    resultAfterEducation: '',
    notes: '',
  });

  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!violationForm.title.trim() || !violationForm.studentId) return;
    addViolationRecord({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      studentId: violationForm.studentId,
      date: violationForm.date,
      title: violationForm.title.trim(),
      severity: violationForm.severity,
      location: violationForm.location.trim() || 'Phòng học',
      recordedBy: violationForm.recordedBy.trim() || 'GVCN',
      educationalMeasures: violationForm.educationalMeasures.trim() || 'Nhắc nhở và theo dõi',
      resultAfterEducation: violationForm.resultAfterEducation.trim() || 'Đang theo dõi chuyển biến',
      notes: violationForm.notes.trim() || undefined,
    });
    setShowAddViolationModal(false);
    setViolationForm({
      studentId: currentClassStudents[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      title: '',
      severity: 'Nhắc nhở',
      location: 'Phòng học P.204',
      recordedBy: 'GVCN',
      educationalMeasures: '',
      resultAfterEducation: '',
      notes: '',
    });
  };

  // ================= 3. TAB THEO DÕI THEO TUẦN =================
  const [showAddWeekLogModal, setShowAddWeekLogModal] = useState(false);
  const [weekLogForm, setWeekLogForm] = useState<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    issueDescription: string;
    relatedStudentIds: string[];
    measures: string;
    result: string;
  }>({
    weekNumber: 6,
    startDate: '2026-10-06',
    endDate: '2026-10-11',
    issueDescription: '',
    relatedStudentIds: [],
    measures: '',
    result: '',
  });

  const handleCreateWeekLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekLogForm.issueDescription.trim()) return;
    addWeeklyConductLog({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      weekNumber: weekLogForm.weekNumber,
      startDate: weekLogForm.startDate,
      endDate: weekLogForm.endDate,
      issueDescription: weekLogForm.issueDescription.trim(),
      relatedStudentIds: weekLogForm.relatedStudentIds,
      measures: weekLogForm.measures.trim(),
      result: weekLogForm.result.trim(),
    });
    setShowAddWeekLogModal(false);
    setWeekLogForm({
      weekNumber: weekLogForm.weekNumber + 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      issueDescription: '',
      relatedStudentIds: [],
      measures: '',
      result: '',
    });
  };

  // ================= 4. TAB THEO DÕI TIẾN BỘ (TIMELINE) =================
  const [selectedProgressStudentId, setSelectedProgressStudentId] = useState<string>('all');
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [progressForm, setProgressForm] = useState<{
    studentId: string;
    timestamp: string;
    issue: string;
    measures: string;
    result: string;
    progressLevel: ProgressLevel;
    teacherComment: string;
  }>({
    studentId: currentClassStudents[0]?.id || '',
    timestamp: new Date().toISOString().split('T')[0],
    issue: '',
    measures: '',
    result: '',
    progressLevel: 'Có chuyển biến',
    teacherComment: '',
  });

  const handleCreateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressForm.studentId || !progressForm.issue.trim()) return;
    addStudentProgressEntry({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      studentId: progressForm.studentId,
      timestamp: progressForm.timestamp,
      issue: progressForm.issue.trim(),
      measures: progressForm.measures.trim(),
      result: progressForm.result.trim(),
      progressLevel: progressForm.progressLevel,
      teacherComment: progressForm.teacherComment.trim(),
    });
    setShowAddProgressModal(false);
    setProgressForm({
      studentId: currentClassStudents[0]?.id || '',
      timestamp: new Date().toISOString().split('T')[0],
      issue: '',
      measures: '',
      result: '',
      progressLevel: 'Có chuyển biến',
      teacherComment: '',
    });
  };

  const filteredProgressTimeline = useMemo(() => {
    let list = [...studentProgressEntries];
    if (selectedProgressStudentId !== 'all') {
      list = list.filter((e) => e.studentId === selectedProgressStudentId);
    }
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [studentProgressEntries, selectedProgressStudentId]);

  // ================= 5. TAB HỌC SINH CẦN HỖ TRỢ =================
  const [showAddSupportModal, setShowAddSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState<{
    studentId: string;
    category: SupportCategory;
    description: string;
  }>({
    studentId: currentClassStudents[0]?.id || '',
    category: 'học tập',
    description: '',
  });

  const handleCreateSupportTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.studentId || !supportForm.description.trim()) return;
    addStudentSupportTag({
      classId: currentClass?.id || 'class-7-1',
      studentId: supportForm.studentId,
      category: supportForm.category,
      description: supportForm.description.trim(),
      isResolved: false,
    });
    setShowAddSupportModal(false);
    setSupportForm({
      studentId: currentClassStudents[0]?.id || '',
      category: 'học tập',
      description: '',
    });
  };

  // ================= 6. TAB AI HỖ TRỢ SƯ PHẠM =================
  const [selectedAIStudentId, setSelectedAIStudentId] = useState<string>(
    currentClassStudents[0]?.id || ''
  );
  const targetAIStudent = useMemo(() => {
    return currentClassStudents.find((s) => s.id === selectedAIStudentId) || currentClassStudents[0];
  }, [currentClassStudents, selectedAIStudentId]);

  const targetStudentViolations = useMemo(() => {
    return violationRecords.filter((v) => v.studentId === targetAIStudent?.id);
  }, [violationRecords, targetAIStudent]);

  const targetStudentProgressList = useMemo(() => {
    return studentProgressEntries.filter((p) => p.studentId === targetAIStudent?.id);
  }, [studentProgressEntries, targetAIStudent]);

  const targetStudentSupportList = useMemo(() => {
    return studentSupportTags.filter((t) => t.studentId === targetAIStudent?.id);
  }, [studentSupportTags, targetAIStudent]);

  const [copiedParentMsg, setCopiedParentMsg] = useState(false);

  const parentMessageText = useMemo(() => {
    if (!targetAIStudent) return '';
    const hasProgress = targetStudentProgressList.length > 0;
    const hasViolations = targetStudentViolations.length > 0;
    const supportChuyenCan = targetStudentSupportList.some((t) => t.category === 'chuyên cần');
    const supportHocTap = targetStudentSupportList.some((t) => t.category === 'học tập');
    const supportHoanCanh = targetStudentSupportList.some((t) => t.category === 'hoàn cảnh');

    if (hasProgress) {
      return `Kính gửi phụ huynh em ${targetAIStudent.fullName}, thầy/cô chủ nhiệm xin gửi lời biểu dương em vì thời gian qua đã có bước chuyển biến rất tích cực trong học tập và nề nếp lớp ${currentClass?.className}. Thầy cô và tập thể lớp ghi nhận tinh thần nỗ lực của em. Kính mong gia đình tiếp tục khích lệ để em phát huy hơn nữa. Trân trọng!`;
    }
    if (supportChuyenCan || hasViolations) {
      return `Kính gửi phụ huynh em ${targetAIStudent.fullName}, thầy/cô chủ nhiệm xin chia sẻ về tình hình rèn luyện của em. Em rất ngoan và lễ phép, tuy nhiên đôi lúc còn đi học sát giờ hoặc chưa chuẩn bị chu đáo sách vở/đồng phục. Rất mong gia đình cùng nhắc nhở em chuẩn bị từ tối hôm trước để em đến lớp đúng giờ và tự tin hơn. Thầy cô luôn đồng hành giúp đỡ em. Trân trọng!`;
    }
    if (supportHocTap) {
      return `Kính gửi phụ huynh em ${targetAIStudent.fullName}, thầy/cô chủ nhiệm xin thông tin về việc học của em. Em có ý thức tốt nhưng một số môn tiếp thu còn chậm. Thầy cô đã phân công bạn cán sự học tập hỗ trợ 15 phút đầu giờ, và rất mong gia đình tạo điều kiện nhắc nhở em dành thêm 30-45 phút tự ôn bài tại nhà mỗi tối. Trân trọng cảm ơn gia đình!`;
    }
    if (supportHoanCanh) {
      return `Kính gửi phụ huynh em ${targetAIStudent.fullName}, thầy/cô chủ nhiệm xin gửi lời thăm hỏi ân cần tới gia đình. Nhà trường và ban đại diện CMHS luôn quan tâm, sẵn sàng đồng hành hỗ trợ điều kiện thuận lợi nhất để em yên tâm học tập. Em ở lớp rất ngoan và hòa đồng. Chúc gia đình nhiều sức khỏe!`;
    }
    return `Kính gửi phụ huynh em ${targetAIStudent.fullName}, thầy/cô chủ nhiệm xin thông tin tình hình rèn luyện của em. Em luôn chấp hành tốt nội quy trường lớp, có ý thức kỷ luật tốt và đoàn kết với bạn bè. Kính mong gia đình tiếp tục phối hợp cùng nhà trường để em ngày càng tiến bộ toàn diện. Trân trọng cảm ơn!`;
  }, [targetAIStudent, targetStudentProgressList, targetStudentViolations, targetStudentSupportList, currentClass]);

  const handleCopyMessage = () => {
    if (navigator.clipboard && parentMessageText) {
      navigator.clipboard.writeText(parentMessageText);
      setCopiedParentMsg(true);
      setTimeout(() => setCopiedParentMsg(false), 2000);
    }
  };

  // Filtered students for display
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100">
              <Smile className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  THEO DÕI RÈN LUYỆN & NỀ NẾP HỌC SINH LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200">
                  {currentClassStudents.length} học sinh
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Rèn luyện Tốt: {conductStats.goodRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi kết quả rèn luyện, nhật ký tuần, ghi nhận vi phạm văn minh, dòng thời gian tiến bộ và hỗ trợ học sinh
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="In sổ theo dõi rèn luyện khổ A4"
          >
            <Printer className="w-4 h-4" />
            In Sổ Rèn Luyện
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('conduct')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'conduct'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>1. Kết Quả Rèn Luyện</span>
          </button>

          <button
            onClick={() => setActiveTab('violations')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'violations'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>2. Vi Phạm Nề Nếp</span>
            {violationRecords.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-700 text-white flex items-center justify-center text-[10px]">
                {violationRecords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'weekly'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Theo Dõi Theo Tuần</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'progress'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Timeline Tiến Bộ</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'support'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>5. Học Sinh Cần Hỗ Trợ</span>
            {studentSupportTags.filter((t) => !t.isResolved).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                {studentSupportTags.filter((t) => !t.isResolved).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai-assist')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'ai-assist'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>6. Trợ Lý AI Sư Phạm</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: KẾT QUẢ RÈN LUYỆN ================= */}
      {activeTab === 'conduct' && (
        <div className="space-y-6">
          {/* Controls: Chọn đợt đánh giá */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs print:hidden">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-700">Đợt đánh giá rèn luyện:</span>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as ConductTerm)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              >
                {CONDUCT_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Stats pill */}
              <div className="flex items-center gap-1.5 font-bold ml-2">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
                  Tốt: {conductStats.good} ({conductStats.goodRate}%)
                </span>
                <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg">
                  Khá: {conductStats.fair} ({conductStats.fairRate}%)
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg">
                  Đạt: {conductStats.pass}
                </span>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg">
                  Chưa đạt: {conductStats.fail}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs w-48"
              />
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="all">Tất cả tổ</option>
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>
          </div>

          {/* Conduct Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-pink-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Bảng Đánh Giá Rèn Luyện Lớp {currentClass?.className} • Đợt: {selectedTerm}
                </h3>
                <p className="text-xs text-pink-200 mt-0.5">
                  Đánh giá kết quả, nhận xét, biểu hiện tích cực và nội dung cần cải thiện theo Thông tư 22
                </p>
              </div>

              {saveToast && (
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-xl text-xs font-bold animate-pulse">
                  ✓ Đã lưu thành công!
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3 w-24">Mã HS</th>
                    <th className="py-3 px-4 min-w-[170px]">Họ và tên</th>
                    <th className="py-3 px-2 text-center w-16">Tổ</th>
                    <th className="py-3 px-3 text-center w-28">Kết quả</th>
                    <th className="py-3 px-3 min-w-[220px]">Nhận xét chung của GVCN</th>
                    <th className="py-3 px-3 min-w-[200px] text-emerald-800">Biểu hiện tích cực</th>
                    <th className="py-3 px-3 min-w-[200px] text-amber-800">Cần cải thiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((st, idx) => {
                    const draft = conductDrafts[st.id] || {
                      grade: 'Tốt',
                      teacherComment: '',
                      positiveManifestations: '',
                      areasForImprovement: '',
                    };

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
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
                            className="text-left hover:text-pink-700 hover:underline"
                            title="Xem hồ sơ học sinh"
                          >
                            {st.fullName}
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          Tổ {st.groupNumber}
                        </td>

                        {/* Mức xếp loại rèn luyện */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={draft.grade}
                            onChange={(e) => handleDraftChange(st.id, 'grade', e.target.value)}
                            className={`p-1.5 rounded-lg text-xs font-bold border focus:ring-2 focus:ring-pink-500 focus:outline-hidden ${
                              draft.grade === 'Tốt'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : draft.grade === 'Khá'
                                ? 'bg-sky-50 text-sky-800 border-sky-300'
                                : draft.grade === 'Đạt'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="Tốt">Tốt</option>
                            <option value="Khá">Khá</option>
                            <option value="Đạt">Đạt</option>
                            <option value="Chưa đạt">Chưa đạt</option>
                          </select>
                        </td>

                        {/* Nhận xét chung */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Nhận xét rèn luyện..."
                            value={draft.teacherComment}
                            onChange={(e) => handleDraftChange(st.id, 'teacherComment', e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Biểu hiện tích cực */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Chăm ngoan, giúp đỡ bạn..."
                            value={draft.positiveManifestations}
                            onChange={(e) =>
                              handleDraftChange(st.id, 'positiveManifestations', e.target.value)
                            }
                            className="w-full p-1.5 bg-emerald-50/30 border border-emerald-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Nội dung cần cải thiện */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Cần tập trung hơn, tự giác..."
                            value={draft.areasForImprovement}
                            onChange={(e) =>
                              handleDraftChange(st.id, 'areasForImprovement', e.target.value)
                            }
                            className="w-full p-1.5 bg-amber-50/30 border border-amber-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                  Dữ liệu được lưu trữ trực tiếp vào sổ chủ nhiệm điện tử của lớp.
                </span>
                <button
                  type="button"
                  onClick={handleSaveAllConduct}
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu Kết Quả Rèn Luyện {selectedTerm}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: MODULE VI PHẠM ================= */}
      {activeTab === 'violations' && (
        <div className="space-y-6">
          {/* NOTICE BANNER: Bắt buộc theo Mục 2 */}
          <div className="bg-sky-50 border border-sky-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-sky-900 shadow-xs">
            <HeartHandshake className="w-6 h-6 text-sky-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-sky-950 font-black text-sm block">
                Nguyên tắc sư phạm: "Không dùng ngôn ngữ xúc phạm học sinh."
              </strong>
              <p>
                Mọi nội dung ghi nhận vi phạm nề nếp cần thể hiện khách quan, tôn trọng danh dự học sinh, tập trung vào hành vi cụ thể và đề xuất biện pháp giáo dục tích cực, giúp học sinh nhận thức và sửa đổi khuyết điểm.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Danh Sách Ghi Nhận Vi Phạm Lớp {currentClass?.className} ({violationRecords.length} vụ việc)
              </h3>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Theo dõi mức độ, địa điểm, biện pháp giáo dục và kết quả chuyển biến của học sinh
              </p>
            </div>

            {isAuthorized && (
              <button
                onClick={() => setShowAddViolationModal(true)}
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Ghi Nhận Vi Phạm Mới
              </button>
            )}
          </div>

          {/* Violations Cards List */}
          {violationRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              Lớp duy trì nề nếp kỷ luật rất tốt, chưa có ghi nhận vi phạm nào.
            </div>
          ) : (
            <div className="space-y-3">
              {violationRecords.map((item) => {
                const st = currentClassStudents.find((s) => s.id === item.studentId);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs hover:border-pink-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {st?.fullName || 'Học sinh'}
                        </span>
                        <span className="text-slate-500 text-[11px]">({st?.studentCode} • Tổ {st?.groupNumber})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.severity === 'Nhắc nhở'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : item.severity === 'Khiển trách'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : item.severity === 'Cần phối hợp phụ huynh'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          Mức độ: {item.severity}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">Ngày: {item.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span>Địa điểm: <strong>{item.location}</strong></span>
                        <span>•</span>
                        <span>Người ghi: <strong>{item.recordedBy}</strong></span>
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => deleteViolationRecord(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors ml-2"
                            title="Xóa bản ghi vi phạm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-800">
                        Nội dung vi phạm: <span className="font-normal text-slate-700">{item.title}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                          <span className="font-bold text-blue-900 text-[11px] block">
                            Biện pháp giáo dục:
                          </span>
                          <p className="text-slate-700">{item.educationalMeasures}</p>
                        </div>

                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                          <span className="font-bold text-emerald-900 text-[11px] block">
                            Kết quả sau giáo dục:
                          </span>
                          <p className="text-slate-700">{item.resultAfterEducation}</p>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-1">
                          Ghi chú thêm: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal thêm vi phạm */}
          {showAddViolationModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-pink-600" />
                    Ghi Nhận Vi Phạm Nề Nếp Mới
                  </h4>
                  <button
                    onClick={() => setShowAddViolationModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateViolation} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                    <select
                      value={violationForm.studentId}
                      onChange={(e) => setViolationForm({ ...violationForm, studentId: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      required
                    >
                      {currentClassStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.stt}. {st.fullName} ({st.studentCode} - Tổ {st.groupNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày vi phạm:</label>
                      <input
                        type="date"
                        value={violationForm.date}
                        onChange={(e) => setViolationForm({ ...violationForm, date: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mức độ:</label>
                      <select
                        value={violationForm.severity}
                        onChange={(e) =>
                          setViolationForm({
                            ...violationForm,
                            severity: e.target.value as ViolationSeverity,
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                      >
                        <option value="Nhắc nhở">Nhắc nhở</option>
                        <option value="Khiển trách">Khiển trách</option>
                        <option value="Cần phối hợp phụ huynh">Cần phối hợp phụ huynh</option>
                        <option value="Cảnh cáo trước lớp">Cảnh cáo trước lớp</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nội dung vi phạm (Ngôn ngữ sư phạm tôn trọng học sinh):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả cụ thể hành vi vi phạm (ví dụ: Quên khăn quàng đỏ, nói chuyện riêng trong giờ học...)"
                      value={violationForm.title}
                      onChange={(e) => setViolationForm({ ...violationForm, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Địa điểm:</label>
                      <input
                        type="text"
                        placeholder="Phòng học, sân trường..."
                        value={violationForm.location}
                        onChange={(e) => setViolationForm({ ...violationForm, location: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Người ghi nhận:</label>
                      <input
                        type="text"
                        placeholder="GVCN, Đội Cờ đỏ..."
                        value={violationForm.recordedBy}
                        onChange={(e) => setViolationForm({ ...violationForm, recordedBy: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Biện pháp giáo dục:</label>
                    <input
                      type="text"
                      placeholder="Nhắc nhở riêng, phân công đôi bạn cùng tiến..."
                      value={violationForm.educationalMeasures}
                      onChange={(e) =>
                        setViolationForm({ ...violationForm, educationalMeasures: e.target.value })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kết quả sau giáo dục:</label>
                    <input
                      type="text"
                      placeholder="Học sinh nhận lỗi, chuyển biến tích cực..."
                      value={violationForm.resultAfterEducation}
                      onChange={(e) =>
                        setViolationForm({ ...violationForm, resultAfterEducation: e.target.value })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm:</label>
                    <input
                      type="text"
                      placeholder="Thông tin phụ huynh, bối cảnh..."
                      value={violationForm.notes}
                      onChange={(e) => setViolationForm({ ...violationForm, notes: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddViolationModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30"
                    >
                      Lưu Ghi Nhận
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: THEO DÕI THEO TUẦN ================= */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Nhật Ký Theo Dõi Theo Tuần Của GVCN ({weeklyConductLogs.length} tuần đã ghi)
              </h3>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Ghi nhận vấn đề phát sinh trong tuần, học sinh liên quan, biện pháp sư phạm và kết quả
              </p>
            </div>

            {isAuthorized && (
              <button
                onClick={() => setShowAddWeekLogModal(true)}
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Ghi Nhật Ký Tuần Mới
              </button>
            )}
          </div>

          <div className="space-y-4">
            {weeklyConductLogs.map((log) => {
              const relatedStudents = currentClassStudents.filter((s) =>
                log.relatedStudentIds.includes(s.id)
              );

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 bg-pink-600 text-white rounded-xl font-black text-xs">
                        Tuần {log.weekNumber}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Từ ngày {log.startDate} đến {log.endDate}
                      </span>
                    </div>

                    {isAuthorized && (
                      <button
                        type="button"
                        onClick={() => deleteWeeklyConductLog(log.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title="Xóa nhật ký tuần"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <strong className="text-slate-800">Vấn đề nề nếp / học tập trong tuần:</strong>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{log.issueDescription}</p>
                    </div>

                    {relatedStudents.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-500">Học sinh liên quan:</span>
                        {relatedStudents.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSelectedStudent(st)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold hover:bg-pink-50 hover:text-pink-700 transition-colors"
                          >
                            {st.fullName}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-800 text-[11px] block">Biện pháp xử lý:</strong>
                        <p className="text-slate-600 mt-0.5">{log.measures}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-900 text-[11px] block">Kết quả đạt được:</strong>
                        <p className="text-slate-700 mt-0.5">{log.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal ghi nhật ký tuần */}
          {showAddWeekLogModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="font-black text-sm text-slate-900">Ghi Nhật Ký Tuần Của GVCN</h4>
                  <button
                    onClick={() => setShowAddWeekLogModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWeekLog} className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tuần thứ:</label>
                      <input
                        type="number"
                        min="1"
                        max="35"
                        value={weekLogForm.weekNumber}
                        onChange={(e) =>
                          setWeekLogForm({ ...weekLogForm, weekNumber: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Từ ngày:</label>
                      <input
                        type="date"
                        value={weekLogForm.startDate}
                        onChange={(e) => setWeekLogForm({ ...weekLogForm, startDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                      <input
                        type="date"
                        value={weekLogForm.endDate}
                        onChange={(e) => setWeekLogForm({ ...weekLogForm, endDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vấn đề trong tuần:</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả diễn biến nề nếp, học tập, các vụ việc phát sinh..."
                      value={weekLogForm.issueDescription}
                      onChange={(e) =>
                        setWeekLogForm({ ...weekLogForm, issueDescription: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Học sinh liên quan (chọn các em):
                    </label>
                    <div className="max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-1.5 custom-scrollbar">
                      {currentClassStudents.map((st) => {
                        const isSelected = weekLogForm.relatedStudentIds.includes(st.id);
                        return (
                          <label
                            key={st.id}
                            className={`flex items-center gap-2 p-1 rounded-lg text-[11px] cursor-pointer ${
                              isSelected ? 'bg-pink-100 text-pink-900 font-bold' : 'hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWeekLogForm({
                                    ...weekLogForm,
                                    relatedStudentIds: [...weekLogForm.relatedStudentIds, st.id],
                                  });
                                } else {
                                  setWeekLogForm({
                                    ...weekLogForm,
                                    relatedStudentIds: weekLogForm.relatedStudentIds.filter(
                                      (id) => id !== st.id
                                    ),
                                  });
                                }
                              }}
                              className="rounded text-pink-600 focus:ring-pink-500"
                            />
                            <span>{st.fullName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Biện pháp xử lý của GVCN:</label>
                    <textarea
                      rows={2}
                      placeholder="Gặp gỡ, phân công hỗ trợ, liên hệ gia đình..."
                      value={weekLogForm.measures}
                      onChange={(e) => setWeekLogForm({ ...weekLogForm, measures: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kết quả đạt được:</label>
                    <input
                      type="text"
                      placeholder="Lớp chuyển biến tích cực, học sinh nhận thức..."
                      value={weekLogForm.result}
                      onChange={(e) => setWeekLogForm({ ...weekLogForm, result: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddWeekLogModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30"
                    >
                      Lưu Nhật Ký Tuần
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: THEO DÕI TIẾN BỘ (TIMELINE) ================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Lọc theo học sinh:</span>
              <select
                value={selectedProgressStudentId}
                onChange={(e) => setSelectedProgressStudentId(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
              >
                <option value="all">Toàn bộ học sinh trong lớp</option>
                {currentClassStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.stt}. {st.fullName} ({st.studentCode})
                  </option>
                ))}
              </select>
            </div>

            {isAuthorized && (
              <button
                onClick={() => setShowAddProgressModal(true)}
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Thêm Bước Tiến Bộ Mới
              </button>
            )}
          </div>

          {/* Timeline View */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Dòng Thời Gian Ghi Nhận Sự Tiến Bộ Học Sinh (Timeline)
            </h3>

            {filteredProgressTimeline.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                Chưa có dữ liệu tiến bộ cho bộ lọc này.
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-300 space-y-8">
                {filteredProgressTimeline.map((item) => {
                  const st = currentClassStudents.find((s) => s.id === item.studentId);

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-md flex items-center justify-center text-white" />

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {st?.fullName}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              ({st?.studentCode} • Tổ {st?.groupNumber})
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.progressLevel === 'Tiến bộ rõ rệt'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.progressLevel === 'Có chuyển biến'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                  : item.progressLevel === 'Duy trì tốt'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {item.progressLevel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {item.timestamp}
                            </span>
                            {isAuthorized && (
                              <button
                                type="button"
                                onClick={() => deleteStudentProgressEntry(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Xóa bước tiến bộ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                            <span className="font-bold text-slate-800 text-[11px]">Vấn đề trước đó:</span>
                            <p className="text-slate-600">{item.issue}</p>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                            <span className="font-bold text-slate-800 text-[11px]">Biện pháp hỗ trợ:</span>
                            <p className="text-slate-600">{item.measures}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1 text-xs">
                          <strong className="text-emerald-950 font-bold text-[11px]">
                            Kết quả chuyển biến:
                          </strong>
                          <p className="text-emerald-900 leading-relaxed">{item.result}</p>
                        </div>

                        {item.teacherComment && (
                          <div className="text-[11px] text-slate-600 italic">
                            Nhận xét của GVCN: "{item.teacherComment}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal thêm bước tiến bộ */}
          {showAddProgressModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="font-black text-sm text-slate-900">Ghi Nhận Bước Tiến Bộ Mới</h4>
                  <button
                    onClick={() => setShowAddProgressModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProgress} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                    <select
                      value={progressForm.studentId}
                      onChange={(e) => setProgressForm({ ...progressForm, studentId: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      required
                    >
                      {currentClassStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.stt}. {st.fullName} ({st.studentCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Thời điểm:</label>
                      <input
                        type="date"
                        value={progressForm.timestamp}
                        onChange={(e) => setProgressForm({ ...progressForm, timestamp: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mức độ tiến bộ:</label>
                      <select
                        value={progressForm.progressLevel}
                        onChange={(e) =>
                          setProgressForm({
                            ...progressForm,
                            progressLevel: e.target.value as ProgressLevel,
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                      >
                        <option value="Khởi đầu">Khởi đầu</option>
                        <option value="Có chuyển biến">Có chuyển biến</option>
                        <option value="Tiến bộ rõ rệt">Tiến bộ rõ rệt</option>
                        <option value="Duy trì tốt">Duy trì tốt</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vấn đề trước đó:</label>
                    <input
                      type="text"
                      placeholder="Còn rụt rè, chưa tập trung, điểm kiểm tra yếu..."
                      value={progressForm.issue}
                      onChange={(e) => setProgressForm({ ...progressForm, issue: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Biện pháp đã áp dụng:</label>
                    <input
                      type="text"
                      placeholder="Phân công bạn kèm cặp, động viên, biểu dương..."
                      value={progressForm.measures}
                      onChange={(e) => setProgressForm({ ...progressForm, measures: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kết quả thực tế:</label>
                    <textarea
                      rows={2}
                      placeholder="Đã mạnh dạn phát biểu, điểm số cải thiện, tự giác học tập..."
                      value={progressForm.result}
                      onChange={(e) => setProgressForm({ ...progressForm, result: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nhận xét sư phạm của GVCN:</label>
                    <input
                      type="text"
                      placeholder="Lời khen, động viên em tiếp tục phấn đấu..."
                      value={progressForm.teacherComment}
                      onChange={(e) =>
                        setProgressForm({ ...progressForm, teacherComment: e.target.value })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProgressModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30"
                    >
                      Lưu Bước Tiến Bộ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: HỌC SINH CẦN HỖ TRỢ ================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* NOTICE BANNER: Bắt buộc theo Mục 5 */}
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-amber-950 font-black text-sm block">
                Nguyên tắc: "Không được AI tự suy đoán nguyên nhân."
              </strong>
              <p>
                Mọi diện theo dõi và nguyên nhân cần hỗ trợ (học tập, chuyên cần, rèn luyện, kỹ năng, hoàn cảnh, cần phối hợp gia đình) đều do Giáo viên chủ nhiệm trực tiếp khảo sát, trao đổi thực tế và đánh giá; hệ thống không tự động gán nhãn hay suy đoán nguyên nhân khi chưa có xác nhận từ giáo viên.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Danh Sách Đánh Dấu Học Sinh Cần Hỗ Trợ ({studentSupportTags.length} lượt đánh dấu)
              </h3>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Theo dõi 6 diện hỗ trợ cụ thể nhằm xây dựng kế hoạch giúp đỡ kịp thời
              </p>
            </div>

            {isAuthorized && (
              <button
                onClick={() => setShowAddSupportModal(true)}
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Đánh Dấu Cần Hỗ Trợ Mới
              </button>
            )}
          </div>

          {/* Categories Filter Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {SUPPORT_CATEGORIES.map((cat) => {
              const count = studentSupportTags.filter((t) => t.category === cat.id).length;
              return (
                <div key={cat.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="font-bold text-slate-800">{cat.label}</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{count}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Support Tags Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 w-24">Mã HS</th>
                    <th className="py-3 px-4 min-w-[170px]">Họ và tên</th>
                    <th className="py-3 px-2 text-center w-16">Tổ</th>
                    <th className="py-3 px-3 w-40">Diện cần hỗ trợ</th>
                    <th className="py-3 px-3 min-w-[260px]">Nội dung cụ thể (GVCN ghi nhận)</th>
                    <th className="py-3 px-3 text-center w-32">Trạng thái</th>
                    <th className="py-3 px-3 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSupportTags.map((tag) => {
                    const st = currentClassStudents.find((s) => s.id === tag.studentId);
                    const catObj = SUPPORT_CATEGORIES.find((c) => c.id === tag.category);

                    return (
                      <tr key={tag.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {st?.studentCode}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => st && setSelectedStudent(st)}
                            className="hover:text-pink-700 hover:underline"
                          >
                            {st?.fullName}
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          Tổ {st?.groupNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                              catObj?.color || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tag.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 leading-relaxed">
                          {tag.description}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSupportTagResolved(tag.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                              tag.isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {tag.isResolved ? '✓ Đã khắc phục' : 'Đang hỗ trợ'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={() => removeStudentSupportTag(tag.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Xóa diện hỗ trợ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal thêm diện hỗ trợ */}
          {showAddSupportModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="font-black text-sm text-slate-900">Đánh Dấu Diện Cần Hỗ Trợ</h4>
                  <button
                    onClick={() => setShowAddSupportModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSupportTag} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                    <select
                      value={supportForm.studentId}
                      onChange={(e) => setSupportForm({ ...supportForm, studentId: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      required
                    >
                      {currentClassStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.stt}. {st.fullName} ({st.studentCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diện cần hỗ trợ:</label>
                    <select
                      value={supportForm.category}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          category: e.target.value as SupportCategory,
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      {SUPPORT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label} ({cat.desc})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nội dung cụ thể (Do GVCN trực tiếp ghi nhận):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ghi nhận rõ ràng biểu hiện, khó khăn thực tế và kế hoạch kèm cặp..."
                      value={supportForm.description}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, description: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddSupportModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/30"
                    >
                      Lưu Đánh Dấu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: TRỢ LÝ AI SƯ PHẠM ================= */}
      {activeTab === 'ai-assist' && (
        <div className="space-y-6">
          {/* MANDATORY DISCLAIMER PER SECTION 6 */}
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-amber-950 font-black text-sm block">
                "Đây là gợi ý phương pháp sư phạm, không phải chẩn đoán tâm lý hay y khoa."
              </strong>
              <p>
                Trợ lý AI tổng hợp diễn biến nề nếp, phát hiện xu hướng rèn luyện, gợi ý các biện pháp giáo dục tích cực và cách thức trao đổi phù hợp với phụ huynh. AI tuyệt đối không đưa ra các chẩn đoán về tâm thần học hay y khoa. Mọi nhận định đều cần sự kiểm chứng sư phạm từ GVCN.
              </p>
            </div>
          </div>

          {/* Student Selector Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Chọn học sinh cần AI phân tích & gợi ý:</span>
              <select
                value={selectedAIStudentId}
                onChange={(e) => setSelectedAIStudentId(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {currentClassStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.stt}. {st.fullName} ({st.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-slate-500 text-xs">
              Đang phân tích dữ liệu thực tế của: <strong>{targetAIStudent?.fullName}</strong>
            </div>
          </div>

          {/* AI Analysis Cards */}
          {targetAIStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Tổng hợp diễn biến & Xu hướng */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    1. Tổng Hợp Diễn Biến & Phát Hiện Xu Hướng
                  </h4>
                </div>

                <div className="space-y-3 leading-relaxed">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">Dữ liệu hồ sơ & nề nếp hiện có:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li>Số lượt vi phạm nề nếp: <strong>{targetStudentViolations.length} lượt</strong>.</li>
                      <li>Số bước tiến bộ đã ghi nhận: <strong>{targetStudentProgressList.length} bước</strong>.</li>
                      <li>Số diện cần hỗ trợ: <strong>{targetStudentSupportList.length} diện</strong>.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-900">Xu hướng rèn luyện phát hiện được:</span>
                    <p className="text-slate-700">
                      {targetStudentProgressList.length > 0
                        ? `Học sinh có chuyển biến rõ rệt sau khi được giao việc và bố trí đôi bạn cùng tiến. Em rất nhạy cảm với sự khích lệ và biểu dương trước tập thể.`
                        : `Học sinh duy trì nề nếp ổn định, tuy nhiên còn khép kín trong các giờ sinh hoạt tập thể.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Gợi ý cách hỗ trợ sư phạm */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    2. Gợi Ý Phương Pháp Hỗ Trợ Sư Phạm
                  </h4>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                    <strong className="text-emerald-900 font-bold block">
                      Biện pháp tâm lý - giáo dục tích cực:
                    </strong>
                    <p className="text-slate-700 leading-relaxed">
                      Áp dụng kỷ luật tích cực, tuyệt đối không phê bình gay gắt trước lớp. Khi em có biểu hiện cố gắng (dù nhỏ), GVCN nên khen ngợi kịp thời vào giờ sinh hoạt 15 phút.
                    </p>
                  </div>

                  <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                    <strong className="text-sky-900 font-bold block">
                      Tạo môi trường nhóm tự quản:
                    </strong>
                    <p className="text-slate-700 leading-relaxed">
                      Phân công em tham gia các hoạt động ngoại khóa nhóm nhỏ (trực nhật, chăm sóc bồn hoa chi đội) cùng bạn có tính cách hoạt bát để tăng cường giao tiếp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Gợi ý cách trao đổi với phụ huynh */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-sm text-slate-900">
                      3. Gợi Ý Kịch Bản Trao Đổi Tích Cực Với Phụ Huynh
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Sao chép kịch bản tin nhắn"
                  >
                    {copiedParentMsg ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Đã sao chép!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép tin nhắn
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                  <div className="font-bold text-purple-900">Nội dung tin nhắn / cuộc gọi gợi ý cho phụ huynh:</div>
                  <p className="text-slate-800 leading-relaxed italic bg-white p-3.5 rounded-xl border border-purple-200 whitespace-pre-line shadow-xs">
                    "{parentMessageText}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    (GVCN có thể sao chép trực tiếp để nhắn Zalo / SMS hoặc điều chỉnh linh hoạt theo ngữ cảnh thực tế trước khi gửi phụ huynh).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
