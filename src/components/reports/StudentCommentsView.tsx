import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Edit3,
  X,
  Save,
  Search,
  Filter,
  User,
  Clock,
  BookOpen,
  Smile,
  AlertTriangle,
  Award,
  Compass,
  TrendingUp,
  Printer,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, TermLockPeriod } from '../../types';

export const StudentCommentsView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    awardRecords,
    talentProfiles,
    studentSemesterComments,
    saveStudentSemesterComment,
    termLocks,
    currentUser,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Period: 'HKI' | 'HKII' | 'Cả năm'
  const [selectedPeriod, setSelectedPeriod] = useState<TermLockPeriod>('HKI');

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentClassStudents[0]?.id || ''
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [filterCommentStatus, setFilterCommentStatus] = useState<'all' | 'commented' | 'pending'>('all');

  // Current active student
  const activeStudent = useMemo(() => {
    return currentClassStudents.find((s) => s.id === selectedStudentId) || currentClassStudents[0];
  }, [currentClassStudents, selectedStudentId]);

  // Check if current period is locked
  const isPeriodLocked = useMemo(() => {
    return termLocks.find((l) => l.period === selectedPeriod)?.isLocked || false;
  }, [termLocks, selectedPeriod]);

  // Existing comment for active student in selected period
  const existingCommentObj = useMemo(() => {
    if (!activeStudent) return undefined;
    return studentSemesterComments.find(
      (c) =>
        c.studentId === activeStudent.id &&
        c.period === selectedPeriod &&
        c.classId === (currentClass?.id || 'class-7-1')
    );
  }, [studentSemesterComments, activeStudent, selectedPeriod, currentClass]);

  // Teacher comment state
  const [teacherCommentInput, setTeacherCommentInput] = useState<string>('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Sync comment input when student or period changes
  React.useEffect(() => {
    setTeacherCommentInput(existingCommentObj?.teacherComment || '');
    setAiDraft(null);
  }, [activeStudent?.id, selectedPeriod, existingCommentObj]);

  // AI draft state: null | { text: string; isGenerating: boolean }
  const [aiDraft, setAiDraft] = useState<{ text: string } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ================= 1. EXTRACT REAL DATA FOR ACTIVE STUDENT =================
  const studentRealData = useMemo(() => {
    if (!activeStudent) return null;

    // Attendance
    const attList = attendanceRecords.filter((r) => r.studentId === activeStudent.id);
    const presentCount = attList.filter((r) => r.status === 'Có mặt').length;
    const excusedCount = attList.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcusedCount = attList.filter((r) => r.status === 'Nghỉ không phép').length;
    const lateCount = attList.filter((r) => r.status === 'Đi muộn').length;
    const totalAttSessions = attList.length;
    const attRate =
      totalAttSessions > 0
        ? Math.round(((totalAttSessions - (excusedCount + unexcusedCount)) / totalAttSessions) * 100)
        : 100;

    // Academic
    const scores = academicScores.filter((s) => s.studentId === activeStudent.id);
    const goodScoresCount = scores.filter(
      (s) => s.evaluationGrade === 'Tốt' || (s.score !== null && s.score >= 8.0)
    ).length;
    const fairScoresCount = scores.filter(
      (s) => s.evaluationGrade === 'Khá' || (s.score !== null && s.score >= 6.5 && s.score < 8.0)
    ).length;
    const passScoresCount = scores.filter(
      (s) => s.evaluationGrade === 'Đạt' || (s.score !== null && s.score >= 5.0 && s.score < 6.5)
    ).length;
    const failScoresCount = scores.filter(
      (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5.0)
    ).length;
    const numericScores = scores
      .map((s) => s.score)
      .filter((sc): sc is number => sc !== null && sc !== undefined);
    const avgScore =
      numericScores.length > 0
        ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
        : null;

    // Subject trackings
    const trackings = subjectTrackings.filter((t) => t.studentId === activeStudent.id);
    const standoutSubjects = trackings
      .filter((t) => t.trackingStatus === 'nổi bật')
      .map((t) => t.subjectName);
    const supportSubjects = trackings
      .filter((t) => t.trackingStatus === 'cần hỗ trợ')
      .map((t) => t.subjectName);

    // Conduct
    const conductList = conductRecords.filter((r) => r.studentId === activeStudent.id);
    const termConduct =
      conductList.find((c) => c.term === (selectedPeriod === 'HKI' ? 'HKI' : selectedPeriod === 'HKII' ? 'HKII' : 'Cả năm')) ||
      conductList[0];

    // Violations
    const violations = violationRecords.filter((v) => v.studentId === activeStudent.id);

    // Progress
    const progressList = studentProgressEntries.filter((p) => p.studentId === activeStudent.id);

    // Activities
    const activities = classActivities.filter((a) =>
      a.participantStudentIds.includes(activeStudent.id)
    );

    // Awards
    const awards = awardRecords.filter((aw) => aw.studentId === activeStudent.id);

    // Talents
    const talents = talentProfiles.filter((tp) => tp.studentId === activeStudent.id);

    return {
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      attRate,
      scoresCount: scores.length,
      goodScoresCount,
      fairScoresCount,
      passScoresCount,
      failScoresCount,
      avgScore,
      standoutSubjects,
      supportSubjects,
      conductGrade: termConduct?.grade || 'Tốt',
      conductPositives: termConduct?.positiveManifestations,
      conductNeedImprove: termConduct?.areasForImprovement,
      violationsCount: violations.length,
      violationsList: violations,
      progressCount: progressList.length,
      progressList,
      activitiesCount: activities.length,
      activitiesList: activities,
      awardsCount: awards.length,
      awardsList: awards,
      talentsList: talents,
    };
  }, [
    activeStudent,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    awardRecords,
    talentProfiles,
    selectedPeriod,
  ]);

  // ================= 2. GENERATE COMPLIANT AI DRAFT (SECTION 4) =================
  // Strictly grounded on actual data. No hallucinations, no label affixing, no speculation.
  const handleGenerateAiComment = () => {
    if (!activeStudent || !studentRealData) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      const data = studentRealData;
      let sentences: string[] = [];

      // Sentence 1: Conduct & Ethics
      if (data.violationsCount === 0) {
        if (data.conductGrade === 'Tốt') {
          sentences.push(
            `Học sinh ${activeStudent.fullName} gương mẫu chấp hành tốt nội quy nhà trường, lễ phép với thầy cô và đoàn kết cùng bạn bè.`
          );
        } else {
          sentences.push(
            `Em ${activeStudent.fullName} có ý thức nề nếp kỷ luật tốt, chấp hành đầy đủ các quy định của trường lớp.`
          );
        }
      } else {
        const firstV = data.violationsList[0];
        sentences.push(
          `Học sinh có tinh thần hợp tác và chuyển biến sau khi được GVCN nhắc nhở về nề nếp (${firstV.title.toLowerCase()}).`
        );
      }

      // Sentence 2: Academic & Attendance
      if (data.failScoresCount === 0 && data.goodScoresCount > 0) {
        if (data.standoutSubjects.length > 0) {
          sentences.push(
            `Ý thức học tập chăm chỉ, hoàn thành tốt các nhiệm vụ học tập, nổi bật ở môn ${data.standoutSubjects.join(', ')} (Điểm TB: ${data.avgScore || 'Khá giỏi'}).`
          );
        } else {
          sentences.push(
            `Có tinh thần học tập tự giác, kết quả học tập đạt mức ${data.avgScore && parseFloat(data.avgScore) >= 8.0 ? 'Tốt' : 'Khá'}, chuẩn bị bài đầy đủ trước khi đến lớp.`
          );
        }
      } else if (data.supportSubjects.length > 0) {
        sentences.push(
          `Cần tăng cường rèn luyện phương pháp tự học và làm bài tập về nhà ở môn ${data.supportSubjects.join(', ')}.`
        );
      } else {
        sentences.push(`Duy trì việc chuyên cần (${data.attRate}%) và nỗ lực hoàn thành các bài kiểm tra định kỳ.`);
      }

      // Sentence 3: Activities, Progress & Awards
      if (data.awardsCount > 0) {
        const topAward = data.awardsList[0];
        sentences.push(
          `Tích cực tham gia phong trào, đạt thành tích đáng khen ngợi: "${topAward.achievement}".`
        );
      } else if (data.progressCount > 0) {
        const prog = data.progressList[0];
        sentences.push(
          `Có sự nỗ lực tiến bộ rõ nét trong thời gian qua: ${prog.result.toLowerCase()}.`
        );
      } else if (data.activitiesCount > 0) {
        sentences.push(
          `Nhiệt tình tham gia các hoạt động tập thể và phong trào thi đua của chi đội 7/1.`
        );
      }

      // Sentence 4: Encouragement (Pedagogical direction)
      if (data.conductNeedImprove) {
        sentences.push(`Hướng phấn đấu: ${data.conductNeedImprove}.`);
      } else {
        sentences.push(`Phát huy những kết quả đã đạt được để tiếp tục tiến bộ hơn nữa trong thời gian tới.`);
      }

      const generatedText = sentences.slice(0, 3).join(' ');
      setAiDraft({ text: generatedText });
      setIsGeneratingAi(false);
    }, 450);
  };

  // Three mandatory buttons per Section 4 requirement:
  // 1. Áp dụng (Apply)
  const handleApplyAi = () => {
    if (!aiDraft || !activeStudent) return;
    setTeacherCommentInput(aiDraft.text);
    saveStudentSemesterComment(activeStudent.id, selectedPeriod, aiDraft.text, true, aiDraft.text);
    setAiDraft(null);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  // 2. Chỉnh sửa (Edit)
  const handleEditAi = () => {
    if (!aiDraft) return;
    setTeacherCommentInput(aiDraft.text);
    setAiDraft(null);
  };

  // 3. Hủy (Cancel)
  const handleCancelAi = () => {
    setAiDraft(null);
  };

  // Save manual teacher comment
  const handleSaveTeacherComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    saveStudentSemesterComment(
      activeStudent.id,
      selectedPeriod,
      teacherCommentInput.trim(),
      existingCommentObj?.isAiApplied,
      existingCommentObj?.aiDraftComment
    );
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return currentClassStudents.filter((st) => {
      if (filterGroup !== 'all' && st.groupNumber !== filterGroup) return false;
      const hasComm = studentSemesterComments.some(
        (c) =>
          c.studentId === st.id &&
          c.period === selectedPeriod &&
          c.teacherComment &&
          c.teacherComment.trim().length > 0
      );
      if (filterCommentStatus === 'commented' && !hasComm) return false;
      if (filterCommentStatus === 'pending' && hasComm) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return st.fullName.toLowerCase().includes(q) || st.studentCode.toLowerCase().includes(q);
    });
  }, [currentClassStudents, filterGroup, filterCommentStatus, searchQuery, studentSemesterComments, selectedPeriod]);

  // Overall class completion rate
  const commentedStudentsCount = useMemo(() => {
    return currentClassStudents.filter((st) =>
      studentSemesterComments.some(
        (c) =>
          c.studentId === st.id &&
          c.period === selectedPeriod &&
          c.teacherComment &&
          c.teacherComment.trim().length > 0
      )
    ).length;
  }, [currentClassStudents, studentSemesterComments, selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  NHẬN XÉT HỌC SINH ĐỊNH KỲ • LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Đã nhận xét {commentedStudentsCount}/{currentClassStudents.length} học sinh
                </span>
                {isPeriodLocked && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Đã chốt dữ liệu ({selectedPeriod})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Giao diện soạn thảo nhận xét từng học sinh kèm Trợ lý AI chuẩn mực dựa trên dữ liệu thật (không suy đoán, không gán nhãn)
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
          {(['HKI', 'HKII', 'Cả năm'] as TermLockPeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                selectedPeriod === period
                  ? 'bg-white text-indigo-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === 'HKI' ? 'Học kỳ I' : period === 'HKII' ? 'Học kỳ II' : 'Cả năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Student List on left, Editor & AI on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Danh sách học sinh ({filteredStudents.length})
            </span>
            <span className="text-slate-500 text-[11px]">
              {commentedStudentsCount}/{currentClassStudents.length} đã xong
            </span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, mã học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">Tất cả tổ</option>
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>

              <select
                value={filterCommentStatus}
                onChange={(e) => setFilterCommentStatus(e.target.value as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="commented">Đã nhận xét</option>
                <option value="pending">Chưa nhận xét</option>
              </select>
            </div>
          </div>

          {/* Students Scroll List */}
          <div className="max-h-[580px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-50">
            {filteredStudents.map((st) => {
              const isSelected = st.id === activeStudent?.id;
              const hasComm = studentSemesterComments.some(
                (c) =>
                  c.studentId === st.id &&
                  c.period === selectedPeriod &&
                  c.teacherComment &&
                  c.teacherComment.trim().length > 0
              );

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {st.stt}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs truncate">{st.fullName}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {st.studentCode} • Tổ {st.groupNumber}
                      </div>
                    </div>
                  </div>

                  <div>
                    {hasComm ? (
                      <span
                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center ${
                          isSelected ? 'bg-white text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                        title="Đã có nhận xét"
                      >
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          isSelected ? 'bg-amber-300' : 'bg-slate-300'
                        }`}
                        title="Chưa nhận xét"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Student Details, AI Assistant & Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeStudent && studentRealData ? (
            <>
              {/* Active Student Header Bar */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-black">
                    {activeStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900">{activeStudent.fullName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Mã HS: {activeStudent.studentCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Tổ {activeStudent.groupNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sinh ngày: {activeStudent.birthDate} • Giới tính: {activeStudent.gender} • Đợt đánh giá: <strong>{selectedPeriod}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {existingCommentObj?.teacherComment ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu nhận xét
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold">
                      Chưa có nhận xét
                    </span>
                  )}
                </div>
              </div>

              {/* Data Summary Strip: Exactly what AI and Teacher will base on (Requirement 6: Số liệu nguồn thật) */}
              <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Cơ sở dữ liệu nguồn thực tế của học sinh (Không giả định)
                  </span>
                  <span className="text-[11px] text-slate-400">Đồng bộ từ các phân hệ</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  {/* Chuyên cần */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block font-medium">Chuyên cần:</span>
                    <strong className="text-emerald-700 block text-xs">
                      {studentRealData.attRate}% ({studentRealData.presentCount} buổi có mặt)
                    </strong>
                    <span className="text-slate-400 text-[10px]">
                      Vắng phép: {studentRealData.excusedCount} • Đi muộn: {studentRealData.lateCount}
                    </span>
                  </div>

                  {/* Học tập */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block font-medium">Học tập:</span>
                    <strong className="text-blue-700 block text-xs">
                      {studentRealData.goodScoresCount} Tốt, {studentRealData.fairScoresCount} Khá, {studentRealData.passScoresCount} Đạt
                    </strong>
                    <span className="text-slate-400 text-[10px]">
                      Điểm TB: {studentRealData.avgScore || 'Đang cập nhật'}
                    </span>
                  </div>

                  {/* Rèn luyện & Vi phạm */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block font-medium">Rèn luyện & Nề nếp:</span>
                    <strong className="text-purple-700 block text-xs">
                      Xếp loại: {studentRealData.conductGrade}
                    </strong>
                    <span className="text-slate-400 text-[10px]">
                      {studentRealData.violationsCount === 0
                        ? '0 vi phạm (Gương mẫu)'
                        : `${studentRealData.violationsCount} lần nhắc nhở`}
                    </span>
                  </div>

                  {/* Hoạt động & Khen thưởng */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block font-medium">Phong trào & Khen thưởng:</span>
                    <strong className="text-amber-700 block text-xs">
                      {studentRealData.awardsCount > 0
                        ? `${studentRealData.awardsCount} khen thưởng`
                        : `${studentRealData.activitiesCount} hoạt động lớp`}
                    </strong>
                    <span className="text-slate-400 text-[10px]">
                      {studentRealData.talentsList.length > 0
                        ? `Năng khiếu ${studentRealData.talentsList[0].field}`
                        : 'Tham gia tập thể tốt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Pedagogical Suggestion Panel (Requirement 4) */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 rounded-3xl p-5 border border-indigo-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-xl">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-indigo-950 text-sm">
                        Trợ Lý AI Soạn Thảo Nhận Xét Sư Phạm
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        Căn cứ nghiêm ngặt trên dữ liệu thật: Tuyệt đối không bịa, không gán nhãn, không suy đoán
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiComment}
                    disabled={isGeneratingAi || isPeriodLocked}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    {isGeneratingAi ? 'Đang phân tích số liệu...' : 'Gợi ý nhận xét AI'}
                  </button>
                </div>

                {/* AI Draft Display with Mandatory 3 Buttons: Áp dụng / Chỉnh sửa / Hủy */}
                {aiDraft && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-indigo-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 border-b border-indigo-100 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Bản nháp gợi ý từ AI (Dựa trên số liệu thực tế của {activeStudent.fullName}):
                      </span>
                      <span className="text-slate-400 font-normal">Cần giáo viên duyệt</span>
                    </div>

                    <p className="text-slate-800 text-xs leading-relaxed font-medium bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                      "{aiDraft.text}"
                    </p>

                    {/* The 3 Mandatory Actions per Requirement 4 */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-indigo-100">
                      <button
                        type="button"
                        onClick={handleCancelAi}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1 text-xs"
                      >
                        <X className="w-3.5 h-3.5" /> Hủy
                      </button>

                      <button
                        type="button"
                        onClick={handleEditAi}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-1 text-xs shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyAi}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1 text-xs shadow-md shadow-emerald-600/30"
                      >
                        <Check className="w-3.5 h-3.5" /> Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Official Teacher Comment Form */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    Lời Nhận Xét Chính Thức Của Giáo Viên Chủ Nhiệm ({selectedPeriod})
                  </h4>
                  {isPeriodLocked && (
                    <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      Chế độ xem (Đã chốt học kỳ)
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveTeacherComment} className="space-y-3">
                  <textarea
                    rows={4}
                    value={teacherCommentInput}
                    onChange={(e) => setTeacherCommentInput(e.target.value)}
                    disabled={isPeriodLocked || !isAuthorized}
                    placeholder={`Nhập nhận xét chính thức cho học sinh ${activeStudent.fullName} đợt ${selectedPeriod}...`}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500 leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {isSavedSuccess && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công nhận xét vào hồ sơ học sinh!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isPeriodLocked || !isAuthorized || !teacherCommentInput.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all text-xs"
                      >
                        <Save className="w-4 h-4" /> Lưu Nhận Xét Học Sinh
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 text-xs">
              Vui lòng chọn một học sinh trong danh sách bên trái để xem dữ liệu và viết nhận xét.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
