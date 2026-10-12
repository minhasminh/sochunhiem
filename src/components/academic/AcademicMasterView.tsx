import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Save,
  Printer,
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  Edit,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  EvaluationGrade,
  EvaluationTerm,
  SubjectScore,
  SubjectTrackingStatus,
  Student,
} from '../../types';

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

const TERM_LIST: EvaluationTerm[] = [
  'Đầu năm',
  'Giữa HKI',
  'Cuối HKI',
  'Giữa HKII',
  'Cuối HKII',
  'Cả năm',
];

export const AcademicMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    academicScores,
    saveSubjectScore,
    saveBatchSubjectScores,
    updateSubjectScore,
    deleteSubjectScore,
    subjectTrackings,
    updateSubjectTracking,
    currentUser,
    setSelectedStudent,
    setActiveMenu,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Sub-tabs: 'scores' | 'tracking' | 'alerts' | 'summary'
  const [activeTab, setActiveTab] = useState<'scores' | 'tracking' | 'alerts' | 'summary'>('scores');

  // Controls for Scores view
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán');
  const [selectedTerm, setSelectedTerm] = useState<EvaluationTerm>('Đầu năm');
  const [searchStudent, setSearchStudent] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');

  // Draft table for the currently selected Subject & Term
  // studentId -> { score: string, evaluationGrade: EvaluationGrade | '', comment: string, notes: string }
  const existingScoresForSubjectAndTerm = useMemo(() => {
    return academicScores.filter(
      (s) =>
        s.classId === (currentClass?.id || 'class-7-1') &&
        s.subjectName === selectedSubject &&
        s.term === selectedTerm
    );
  }, [academicScores, currentClass, selectedSubject, selectedTerm]);

  const [scoreDrafts, setScoreDrafts] = useState<
    Record<
      string,
      {
        scoreStr: string;
        evaluationGrade: EvaluationGrade | '';
        comment: string;
        notes: string;
      }
    >
  >(() => {
    const map: Record<string, any> = {};
    currentClassStudents.forEach((st) => {
      const found = existingScoresForSubjectAndTerm.find((s) => s.studentId === st.id);
      map[st.id] = {
        scoreStr: found && found.score !== null && found.score !== undefined ? String(found.score) : '',
        evaluationGrade: found?.evaluationGrade || '',
        comment: found?.comment || '',
        notes: found?.notes || '',
      };
    });
    return map;
  });

  // Re-sync draft when subject, term, or existingScores change
  React.useEffect(() => {
    const map: Record<string, any> = {};
    currentClassStudents.forEach((st) => {
      const found = existingScoresForSubjectAndTerm.find((s) => s.studentId === st.id);
      map[st.id] = {
        scoreStr: found && found.score !== null && found.score !== undefined ? String(found.score) : '',
        evaluationGrade: found?.evaluationGrade || '',
        comment: found?.comment || '',
        notes: found?.notes || '',
      };
    });
    setScoreDrafts(map);
  }, [existingScoresForSubjectAndTerm, currentClassStudents, selectedSubject, selectedTerm]);

  const [saveToast, setSaveToast] = useState(false);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = parseFloat(val);
    let autoGrade: EvaluationGrade | '' = '';
    if (!isNaN(num)) {
      if (num >= 8.0) autoGrade = 'Tốt';
      else if (num >= 6.5) autoGrade = 'Khá';
      else if (num >= 5.0) autoGrade = 'Đạt';
      else autoGrade = 'Chưa đạt';
    }

    setScoreDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { comment: '', notes: '' }),
        scoreStr: val,
        evaluationGrade: autoGrade || prev[studentId]?.evaluationGrade || '',
      },
    }));
  };

  const handleGradeChange = (studentId: string, grade: EvaluationGrade | '') => {
    setScoreDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { scoreStr: '', comment: '', notes: '' }),
        evaluationGrade: grade,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setScoreDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { scoreStr: '', evaluationGrade: '', notes: '' }),
        comment,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setScoreDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { scoreStr: '', evaluationGrade: '', comment: '' }),
        notes,
      },
    }));
  };

  // Save all entered scores
  const handleSaveAllScores = () => {
    const itemsToSave: Omit<SubjectScore, 'id' | 'updatedAt'>[] = [];
    currentClassStudents.forEach((st) => {
      const draft = scoreDrafts[st.id];
      if (!draft) return;
      const scoreNum = draft.scoreStr.trim() !== '' ? parseFloat(draft.scoreStr) : null;
      // Only save if either score, grade, or comment is provided
      if (scoreNum !== null || draft.evaluationGrade || draft.comment.trim() || draft.notes.trim()) {
        itemsToSave.push({
          classId: currentClass?.id || 'class-7-1',
          schoolYearId: currentSchoolYear.id,
          studentId: st.id,
          subjectName: selectedSubject,
          term: selectedTerm,
          score: isNaN(scoreNum as any) ? null : scoreNum,
          evaluationGrade: draft.evaluationGrade ? draft.evaluationGrade : undefined,
          comment: draft.comment.trim() || undefined,
          result: draft.evaluationGrade || (scoreNum !== null ? (scoreNum >= 5 ? 'Đạt' : 'Chưa đạt') : undefined),
          notes: draft.notes.trim() || undefined,
        });
      }
    });

    itemsToSave.forEach((item) => saveSubjectScore(item));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Filter students
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

  // Calculate statistics for the current selected Subject & Term
  const statsForCurrentSubject = useMemo(() => {
    const entered = existingScoresForSubjectAndTerm.filter(
      (s) => s.score !== null || s.evaluationGrade
    );
    const totalCount = entered.length;
    const goodCount = entered.filter((s) => s.evaluationGrade === 'Tốt' || (s.score && s.score >= 8)).length;
    const fairCount = entered.filter(
      (s) => s.evaluationGrade === 'Khá' || (s.score && s.score >= 6.5 && s.score < 8)
    ).length;
    const passCount = entered.filter(
      (s) => s.evaluationGrade === 'Đạt' || (s.score && s.score >= 5 && s.score < 6.5)
    ).length;
    const failCount = entered.filter(
      (s) => s.evaluationGrade === 'Chưa đạt' || (s.score !== null && s.score < 5)
    ).length;

    const scoresOnly = entered.map((s) => s.score).filter((sc): sc is number => sc !== null && sc !== undefined);
    const avgScore =
      scoresOnly.length > 0
        ? (scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length).toFixed(1)
        : 'Chưa có';

    return {
      totalCount,
      goodCount,
      fairCount,
      passCount,
      failCount,
      avgScore,
    };
  }, [existingScoresForSubjectAndTerm]);

  // ================= SUBJECT TRACKING BY GVCN (Mục 4) =================
  const classTrackings = useMemo(() => {
    return subjectTrackings.filter((t) => t.classId === (currentClass?.id || 'class-7-1'));
  }, [subjectTrackings, currentClass]);

  const [trackingSubjectFilter, setTrackingSubjectFilter] = useState<string>('Toán');

  const handleSetTracking = (
    studentId: string,
    subjectName: string,
    status: SubjectTrackingStatus,
    notes?: string
  ) => {
    updateSubjectTracking(studentId, subjectName, status, notes);
  };

  // ================= SMART ALERTS (Mục 5) =================
  const academicAlerts = useMemo(() => {
    const alerts: {
      studentId: string;
      studentName: string;
      subject: string;
      type: 'kết quả giảm' | 'cần theo dõi' | 'thiếu dữ liệu';
      message: string;
      severity: 'danger' | 'warning' | 'info';
    }[] = [];

    // 1. Cần theo dõi: Điểm dưới 5 hoặc đánh giá Chưa đạt hoặc GVCN đánh dấu cần hỗ trợ
    classTrackings.forEach((tr) => {
      if (tr.trackingStatus === 'cần hỗ trợ') {
        const st = currentClassStudents.find((s) => s.id === tr.studentId);
        if (st) {
          alerts.push({
            studentId: st.id,
            studentName: st.fullName,
            subject: tr.subjectName,
            type: 'cần theo dõi',
            message: `Môn ${tr.subjectName}: Học sinh thuộc diện cần hỗ trợ (${tr.notes || 'Cần phụ đạo kiến thức nền tảng'}).`,
            severity: 'warning',
          });
        }
      }
    });

    // 2. Điểm khảo sát Chưa đạt
    academicScores.forEach((sc) => {
      if (sc.score !== null && sc.score < 5.0) {
        const st = currentClassStudents.find((s) => s.id === sc.studentId);
        if (st && !alerts.some((a) => a.studentId === st.id && a.subject === sc.subjectName)) {
          alerts.push({
            studentId: st.id,
            studentName: st.fullName,
            subject: sc.subjectName,
            type: 'cần theo dõi',
            message: `Môn ${sc.subjectName} (${sc.term}): Điểm kiểm tra ${sc.score} (Chưa đạt). Cần xây dựng kế hoạch bồi dưỡng.`,
            severity: 'danger',
          });
        }
      }
    });

    // 3. Kết quả giảm: Phát hiện điểm kiểm tra bị sụt giảm giữa các đợt đánh giá
    const studentSubjectMap: Record<string, Record<string, { term: EvaluationTerm; score: number }[]>> = {};
    academicScores.forEach((sc) => {
      if (sc.score !== null && sc.classId === (currentClass?.id || 'class-7-1')) {
        if (!studentSubjectMap[sc.studentId]) studentSubjectMap[sc.studentId] = {};
        if (!studentSubjectMap[sc.studentId][sc.subjectName]) studentSubjectMap[sc.studentId][sc.subjectName] = [];
        studentSubjectMap[sc.studentId][sc.subjectName].push({ term: sc.term, score: sc.score });
      }
    });

    Object.entries(studentSubjectMap).forEach(([stId, subjects]) => {
      const st = currentClassStudents.find((s) => s.id === stId);
      if (!st) return;
      Object.entries(subjects).forEach(([subjName, scoreEntries]) => {
        if (scoreEntries.length >= 2) {
          const first = scoreEntries[0];
          const last = scoreEntries[scoreEntries.length - 1];
          if (first.score - last.score >= 1.5) {
            alerts.push({
              studentId: st.id,
              studentName: st.fullName,
              subject: subjName,
              type: 'kết quả giảm',
              message: `Môn ${subjName}: Điểm đợt ${last.term} (${last.score}) bị sụt giảm so với ${first.term} (${first.score}). Cần trao đổi với GV bộ môn.`,
              severity: 'warning',
            });
          }
        }
      });
    });

    // 4. Thiếu dữ liệu: Các học sinh chưa có bất kỳ điểm số nào
    const studentsWithNoScore = currentClassStudents.filter(
      (st) => !academicScores.some((sc) => sc.studentId === st.id)
    );
    if (studentsWithNoScore.length > 0) {
      alerts.push({
        studentId: studentsWithNoScore[0].id,
        studentName: `${studentsWithNoScore.length} học sinh`,
        subject: 'Toàn bộ môn',
        type: 'thiếu dữ liệu',
        message: `Chưa nhập kết quả khảo sát đầu năm hoặc giữa kỳ cho ${studentsWithNoScore.length} học sinh.`,
        severity: 'info',
      });
    }

    return alerts;
  }, [classTrackings, academicScores, currentClassStudents]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  QUẢN LÝ & THEO DÕI HỌC TẬP LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Năm học {currentSchoolYear.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {SUBJECT_LIST.length} môn học THCS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quản lý kết quả học tập theo môn, kỳ, nhận xét giáo viên và trạng thái theo dõi của GVCN
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="In bảng kết quả học tập khổ A4"
          >
            <Printer className="w-4 h-4" />
            In bảng học tập
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'scores'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Kết Quả Theo Môn Học</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'tracking'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Theo Dõi Môn Học (GVCN)</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'alerts'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Cảnh Báo Học Tập</span>
            {academicAlerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                {academicAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'summary'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. Báo Cáo Tổng Hợp</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: KẾT QUẢ THEO MÔN HỌC ================= */}
      {activeTab === 'scores' && (
        <div className="space-y-6">
          {/* Controls: Chọn Môn, Chọn Thời gian / Kỳ */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Chọn Môn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn môn học:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                >
                  {SUBJECT_LIST.map((sb) => (
                    <option key={sb} value={sb}>
                      {sb}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn Kỳ / Thời gian */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đợt đánh giá / Thời gian:
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value as EvaluationTerm)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                >
                  {TERM_LIST.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary of current subject stats */}
              <div className="flex items-center justify-between p-3 bg-sky-50 rounded-2xl border border-sky-100">
                <div>
                  <div className="font-bold text-sky-950 text-xs">
                    Điểm TB: <span className="font-black text-sky-700">{statsForCurrentSubject.avgScore}</span>
                  </div>
                  <div className="text-[11px] text-sky-700 mt-0.5">
                    Đã nhập: {statsForCurrentSubject.totalCount}/{currentClassStudents.length} học sinh
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600 font-semibold">
                  <div>Tốt: {statsForCurrentSubject.goodCount} • Khá: {statsForCurrentSubject.fairCount}</div>
                  <div>Đạt: {statsForCurrentSubject.passCount} • Chưa đạt: {statsForCurrentSubject.failCount}</div>
                </div>
              </div>
            </div>

            {/* Strict Notice banner: "Không tự tạo điểm" */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Nguyên tắc dữ liệu:</strong> Không tự tạo điểm. Những học sinh chưa có điểm hoặc đánh giá sẽ hiển thị <strong>"Chưa có dữ liệu"</strong>. Giáo viên nhập trực tiếp vào bảng bên dưới và bấm "Lưu bảng điểm".
                </span>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên, mã học sinh..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs w-52"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 pl-1.5">Tổ:</span>
                  {(['all', 1, 2, 3, 4] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilterGroup(g)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        filterGroup === g ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {g === 'all' ? 'Tất cả' : `Tổ ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {isAuthorized && (
                <div className="flex items-center gap-2">
                  {saveToast && (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveAllScores}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Lưu bảng điểm môn {selectedSubject}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scores Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Bảng Điểm & Nhận Xét Môn {selectedSubject} ({selectedTerm}) - Lớp {currentClass?.className}
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  Nhập điểm số (0-10) hoặc mức đánh giá theo Thông tư 22/2021/TT-BGDĐT
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
                    <th className="py-3 px-3 text-center w-28">Điểm số (0-10)</th>
                    <th className="py-3 px-3 text-center w-32">Mức đánh giá</th>
                    <th className="py-3 px-3 min-w-[220px]">Nhận xét của giáo viên</th>
                    <th className="py-3 px-3 text-center w-24">Kết quả</th>
                    <th className="py-3 px-3 min-w-[180px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((st, idx) => {
                    const draft = scoreDrafts[st.id] || {
                      scoreStr: '',
                      evaluationGrade: '',
                      comment: '',
                      notes: '',
                    };

                    const hasData = draft.scoreStr !== '' || draft.evaluationGrade !== '';

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
                            className="text-left hover:text-sky-700 hover:underline"
                            title="Xem hồ sơ học sinh"
                          >
                            {st.fullName}
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          Tổ {st.groupNumber}
                        </td>

                        {/* Điểm số */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="-"
                            value={draft.scoreStr}
                            onChange={(e) => handleScoreChange(st.id, e.target.value)}
                            className="w-16 p-1.5 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Đánh giá TT 22 */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={draft.evaluationGrade}
                            onChange={(e) => handleGradeChange(st.id, e.target.value as any)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                          >
                            <option value="">(Chọn)</option>
                            <option value="Tốt">Tốt</option>
                            <option value="Khá">Khá</option>
                            <option value="Đạt">Đạt</option>
                            <option value="Chưa đạt">Chưa đạt</option>
                          </select>
                        </td>

                        {/* Nhận xét */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Nhận xét sự tiến bộ, ưu/khuyết điểm..."
                            value={draft.comment}
                            onChange={(e) => handleCommentChange(st.id, e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Kết quả */}
                        <td className="py-2.5 px-3 text-center">
                          {hasData ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                draft.evaluationGrade === 'Tốt'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : draft.evaluationGrade === 'Khá'
                                  ? 'bg-sky-100 text-sky-800'
                                  : draft.evaluationGrade === 'Đạt'
                                  ? 'bg-amber-100 text-amber-800'
                                  : draft.evaluationGrade === 'Chưa đạt'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {draft.evaluationGrade || 'Đã nhập'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa có dữ liệu</span>
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Ghi chú thêm..."
                            value={draft.notes}
                            onChange={(e) => handleNotesChange(st.id, e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
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
                  Dữ liệu được lưu trữ an toàn trong sổ điểm điện tử của lớp.
                </span>
                <button
                  type="button"
                  onClick={handleSaveAllScores}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu bảng điểm môn {selectedSubject}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: THEO DÕI MÔN HỌC (GVCN) ================= */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* NOTICE BANNER: Bắt buộc theo Mục 4 */}
          <div className="bg-sky-50 border border-sky-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-sky-900 shadow-xs">
            <UserCheck className="w-6 h-6 text-sky-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-sky-950 font-black text-sm block">
                "Đây là trạng thái theo dõi của GVCN, không tự chuyển thành kết luận chính thức."
              </strong>
              <p>
                Giáo viên chủ nhiệm đánh dấu tình hình học tập từng môn của học sinh (nổi bật, ổn định, cần hỗ trợ, có tiến bộ) để tiện việc phối hợp giáo viên bộ môn và gia đình, không thay thế bảng điểm hay học bạ chính thức.
              </p>
            </div>
          </div>

          {/* Subject Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Chọn môn học cần theo dõi:</span>
              <select
                value={trackingSubjectFilter}
                onChange={(e) => setTrackingSubjectFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
              >
                {SUBJECT_LIST.map((sb) => (
                  <option key={sb} value={sb}>
                    {sb}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">Nổi bật</span>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg">Ổn định</span>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg">Cần hỗ trợ</span>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg">Có tiến bộ</span>
            </div>
          </div>

          {/* Tracking Cards / Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Theo Dõi Học Sinh Môn: {trackingSubjectFilter} (Lớp {currentClass?.className})
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Đánh dấu trạng thái học sinh: nổi bật, ổn định, cần hỗ trợ, có tiến bộ
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
                    <th className="py-3 px-3 min-w-[360px]">Đánh dấu theo dõi của GVCN</th>
                    <th className="py-3 px-3 min-w-[260px]">Ghi chú sư phạm của GVCN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassStudents.map((st, idx) => {
                    const currentTracking = classTrackings.find(
                      (t) => t.studentId === st.id && t.subjectName === trackingSubjectFilter
                    );
                    const status = currentTracking?.trackingStatus || 'ổn định';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
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
                            className="hover:text-sky-700 hover:underline"
                          >
                            {st.fullName}
                          </button>
                        </td>

                        {/* Interactive Buttons for 4 statuses */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleSetTracking(st.id, trackingSubjectFilter, 'nổi bật', currentTracking?.notes)
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                status === 'nổi bật'
                                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              ⭐ Nổi bật
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSetTracking(st.id, trackingSubjectFilter, 'ổn định', currentTracking?.notes)
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                status === 'ổn định'
                                  ? 'bg-sky-600 text-white font-black shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                              }`}
                            >
                              ✓ Ổn định
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSetTracking(st.id, trackingSubjectFilter, 'cần hỗ trợ', currentTracking?.notes)
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                status === 'cần hỗ trợ'
                                  ? 'bg-rose-600 text-white font-black shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              ⚠ Cần hỗ trợ
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSetTracking(st.id, trackingSubjectFilter, 'có tiến bộ', currentTracking?.notes)
                              }
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                status === 'có tiến bộ'
                                  ? 'bg-purple-600 text-white font-black shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              📈 Có tiến bộ
                            </button>
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="Ghi chú biện pháp (đôi bạn cùng tiến, phụ đạo...)"
                            value={currentTracking?.notes || ''}
                            onChange={(e) =>
                              handleSetTracking(st.id, trackingSubjectFilter, status, e.target.value)
                            }
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CẢNH BÁO HỌC TẬP ================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* MANDATORY WARNING BANNER: Bắt buộc theo Mục 5 */}
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-amber-950 font-black text-sm block">
                "Đây là cảnh báo dựa trên dữ liệu, không phải kết luận."
              </strong>
              <p>
                Hệ thống tự động phát hiện học sinh có kết quả giảm, học sinh cần theo dõi hoặc thiếu dữ liệu điểm số nhằm giúp giáo viên chủ nhiệm có biện pháp bồi dưỡng sớm, không phải đánh giá hay kết luận học lực chính thức.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Danh Sách Cảnh Báo Học Tập Lớp {currentClass?.className} ({academicAlerts.length} cảnh báo)
            </h3>

            {academicAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Không có cảnh báo học tập nào. Các em duy trì chất lượng học tập tốt!
              </div>
            ) : (
              <div className="space-y-3">
                {academicAlerts.map((alt, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      alt.severity === 'danger'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : alt.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-sky-50/80 border-sky-200 text-sky-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {alt.studentName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            alt.severity === 'danger'
                              ? 'bg-rose-600 text-white'
                              : alt.severity === 'warning'
                              ? 'bg-amber-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          Cảnh báo: {alt.type}
                        </span>
                        <span className="font-semibold text-slate-600">({alt.subject})</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{alt.message}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = currentClassStudents.find((s) => s.id === alt.studentId);
                          if (target) setSelectedStudent(target);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold border border-slate-200 shadow-xs transition-colors"
                      >
                        Xem hồ sơ HS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: BÁO CÁO TỔNG HỢP HỌC TẬP (Mục 6: Học sinh → học tập → báo cáo) ================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-600" />
                  Tổng Hợp Chất Lượng Học Tập Lớp {currentClass?.className}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đánh giá tổng quan theo các môn học THCS và liên kết trực tiếp tới Sổ báo cáo A4
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMenu('reports')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Mở Toàn Bộ Sổ Báo Cáo A4
                </button>
              </div>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                <div className="text-sky-800 font-semibold">Tổng môn học THCS</div>
                <div className="text-2xl font-black text-sky-900 mt-1">{SUBJECT_LIST.length}</div>
                <div className="text-[11px] text-sky-700 mt-0.5">môn theo CT GDPT 2018</div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-emerald-800 font-semibold">Lượt HS nổi bật</div>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  {classTrackings.filter((t) => t.trackingStatus === 'nổi bật').length}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">được GVCN ghi nhận</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="text-purple-800 font-semibold">Lượt HS có tiến bộ</div>
                <div className="text-2xl font-black text-purple-900 mt-1">
                  {classTrackings.filter((t) => t.trackingStatus === 'có tiến bộ').length}
                </div>
                <div className="text-[11px] text-purple-700 mt-0.5">tiến bộ học tập</div>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <div className="text-rose-800 font-semibold">Lượt HS cần hỗ trợ</div>
                <div className="text-2xl font-black text-rose-900 mt-1">
                  {classTrackings.filter((t) => t.trackingStatus === 'cần hỗ trợ').length}
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">cần phụ đạo nền tảng</div>
              </div>
            </div>

            {/* Subject breakdown list */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
                Tình hình ghi nhận điểm số và theo dõi các môn học:
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {SUBJECT_LIST.map((subj) => {
                  const scores = academicScores.filter(
                    (s) => s.classId === (currentClass?.id || 'class-7-1') && s.subjectName === subj
                  );
                  const trackings = classTrackings.filter((t) => t.subjectName === subj);
                  const needSupport = trackings.filter((t) => t.trackingStatus === 'cần hỗ trợ').length;
                  const standout = trackings.filter((t) => t.trackingStatus === 'nổi bật').length;
                  const progress = trackings.filter((t) => t.trackingStatus === 'có tiến bộ').length;

                  return (
                    <div
                      key={subj}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 min-w-[140px]">{subj}</span>
                        <span className="text-[11px] text-slate-500">
                          {scores.length > 0 ? `${scores.length} đầu điểm đã nhập` : 'Chưa nhập điểm'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {standout > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ⭐ {standout} nổi bật
                          </span>
                        )}
                        {progress > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                            📈 {progress} tiến bộ
                          </span>
                        )}
                        {needSupport > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                            ⚠ {needSupport} cần hỗ trợ
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubject(subj);
                            setActiveTab('scores');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          Nhập điểm →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
