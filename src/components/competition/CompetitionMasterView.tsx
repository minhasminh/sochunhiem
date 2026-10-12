import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  Settings,
  Plus,
  Save,
  CheckCircle2,
  Trophy,
  Filter,
  Printer,
  ChevronRight,
  Sparkles,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Activity,
  Sparkle,
  Layers,
  BarChart3,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CompetitionPeriodType,
  CompetitionCriterion,
  CompetitionCriteriaConfig,
  GroupCompetitionRecord,
} from '../../types';

const CRITERIA_DEFINITIONS: {
  key: CompetitionCriterion;
  label: string;
  icon: any;
  color: string;
  defaultDesc: string;
}[] = [
  {
    key: 'học tập',
    label: 'Học tập',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    defaultDesc: 'Chuẩn bị bài đầy đủ, nhiều hoa điểm tốt, không nợ bài tập.',
  },
  {
    key: 'chuyên cần',
    label: 'Chuyên cần',
    icon: UserCheck,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    defaultDesc: 'Không nghỉ học không phép, không đi muộn giờ truy bài 15 phút.',
  },
  {
    key: 'nề nếp',
    label: 'Nề nếp',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    defaultDesc: 'Đồng phục, khăn quàng đỏ, giữ trật tự và kỷ luật lớp học.',
  },
  {
    key: 'hoạt động',
    label: 'Hoạt động',
    icon: Activity,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    defaultDesc: 'Tham gia phong trào chi đội, thể dục thể thao, văn nghệ tập thể.',
  },
  {
    key: 'vệ sinh',
    label: 'Vệ sinh',
    icon: Sparkle,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    defaultDesc: 'Trực nhật lớp sạch sẽ, giữ gìn bàn ghế và bồn hoa măng non.',
  },
  {
    key: 'phong trào',
    label: 'Phong trào',
    icon: Sparkles,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    defaultDesc: 'Tương thân tương ái, đôi bạn cùng tiến, tích cực xây dựng bài.',
  },
];

export const CompetitionMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    competitionClassConfig,
    updateCompetitionClassConfig,
    groupCompetitionRecords,
    saveGroupCompetitionRecord,
    deleteGroupCompetitionRecord,
    currentUser,
    setActiveMenu,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // 1. Period selection: 'tuần' | 'tháng' | 'học kỳ' | 'cả năm'
  const [periodType, setPeriodType] = useState<CompetitionPeriodType>('tuần');

  // Sub period options
  const weekOptions = useMemo(() => Array.from({ length: 35 }, (_, i) => `Tuần ${i + 1}`), []);
  const monthOptions = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];
  const semesterOptions = ['Học kỳ I', 'Học kỳ II'];
  const yearOptions = ['Cả năm'];

  const [selectedWeek, setSelectedWeek] = useState('Tuần 3');
  const [selectedMonth, setSelectedMonth] = useState('Tháng 9');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ I');

  const currentPeriodName = useMemo(() => {
    switch (periodType) {
      case 'tuần':
        return selectedWeek;
      case 'tháng':
        return selectedMonth;
      case 'học kỳ':
        return selectedSemester;
      case 'cả năm':
        return 'Cả năm';
    }
  }, [periodType, selectedWeek, selectedMonth, selectedSemester]);

  // 2. Settings Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempScoringEnabled, setTempScoringEnabled] = useState(
    competitionClassConfig.isScoringEnabled
  );
  const [tempCriteriaConfigs, setTempCriteriaConfigs] = useState<CompetitionCriteriaConfig[]>(
    competitionClassConfig.criteriaConfigs
  );

  const handleOpenConfig = () => {
    setTempScoringEnabled(competitionClassConfig.isScoringEnabled);
    setTempCriteriaConfigs([...competitionClassConfig.criteriaConfigs]);
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    updateCompetitionClassConfig({
      isScoringEnabled: tempScoringEnabled,
      criteriaConfigs: tempCriteriaConfigs,
    });
    setShowConfigModal(false);
  };

  // 3. Edit Record Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<number>(1);
  const [formScores, setFormScores] = useState<Partial<Record<CompetitionCriterion, number>>>({});
  const [formEvaluations, setFormEvaluations] = useState<Partial<Record<CompetitionCriterion, string>>>({});
  const [formRank, setFormRank] = useState<number>(1);
  const [formComment, setFormComment] = useState<string>('');

  // Find existing records for current period
  const currentPeriodRecords = useMemo(() => {
    return [1, 2, 3, 4].map((gNum) => {
      const rec = groupCompetitionRecords.find(
        (r) =>
          r.classId === (currentClass?.id || 'class-7-1') &&
          r.periodType === periodType &&
          r.periodName === currentPeriodName &&
          r.groupNumber === gNum
      );
      return {
        groupNumber: gNum,
        record: rec,
      };
    });
  }, [groupCompetitionRecords, currentClass, periodType, currentPeriodName]);

  const handleOpenEditRecord = (groupNum: number) => {
    const item = currentPeriodRecords.find((p) => p.groupNumber === groupNum)?.record;
    setEditingGroup(groupNum);
    if (item) {
      setFormScores(item.scores || {});
      setFormEvaluations(item.evaluations || {});
      setFormRank(item.rank || groupNum);
      setFormComment(item.comment || '');
    } else {
      setFormScores({});
      setFormEvaluations({});
      setFormRank(groupNum);
      setFormComment('');
    }
    setShowRecordModal(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate total score if scoring is enabled
    let totalScore: number | undefined = undefined;
    if (competitionClassConfig.isScoringEnabled) {
      totalScore = Object.values(formScores).reduce((acc: number, val) => acc + (val || 0), 0);
    }

    saveGroupCompetitionRecord({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      periodType,
      periodName: currentPeriodName,
      groupNumber: editingGroup,
      scores: competitionClassConfig.isScoringEnabled ? formScores : undefined,
      evaluations: formEvaluations,
      totalScore,
      rank: formRank,
      comment: formComment.trim() || `Tổ ${editingGroup} hoàn thành nhiệm vụ đợt ${currentPeriodName}.`,
    });

    setShowRecordModal(false);
  };

  // Group members helper
  const getGroupStudents = (gNum: number) => {
    return currentClassStudents.filter((s) => s.groupNumber === gNum);
  };

  // Ranking calculation
  const rankedGroups = useMemo(() => {
    const list = [...currentPeriodRecords];
    if (competitionClassConfig.isScoringEnabled) {
      return list.sort((a, b) => (b.record?.totalScore || 0) - (a.record?.totalScore || 0));
    }
    return list.sort((a, b) => (a.record?.rank || 99) - (b.record?.rank || 99));
  }, [currentPeriodRecords, competitionClassConfig.isScoringEnabled]);

  // Overall Statistics across all periods
  const competitionStats = useMemo(() => {
    const totalWeekRecords = groupCompetitionRecords.filter((r) => r.periodType === 'tuần').length;
    const totalMonthRecords = groupCompetitionRecords.filter((r) => r.periodType === 'tháng').length;

    // Count top 1 finishes for each group
    const top1Counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    groupCompetitionRecords.forEach((r) => {
      if (r.rank === 1) {
        top1Counts[r.groupNumber] = (top1Counts[r.groupNumber] || 0) + 1;
      }
    });

    return {
      totalWeekRecords,
      totalMonthRecords,
      top1Counts,
    };
  }, [groupCompetitionRecords]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  THEO DÕI THI ĐUA 4 TỔ TỰ QUẢN – LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Năm học {currentSchoolYear.name}
                </span>
                {competitionClassConfig.isScoringEnabled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Chế độ tính điểm số
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Chế độ nhận xét định tính (Mặc định)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi thi đua tuần, tháng, học kỳ, cả năm theo 6 tiêu chí; không mặc định áp dụng điểm số nếu GVCN chưa cấu hình
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAuthorized && (
            <button
              onClick={handleOpenConfig}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-slate-600" /> Cấu Hình Tiêu Chí
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> In Bảng Thi Đua
          </button>
        </div>
      </div>

      {/* Period Selection Tabs (Requirement 3: tuần, tháng, học kỳ, cả năm) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setPeriodType('tuần')}
              className={`py-2 px-3.5 rounded-xl transition-all ${
                periodType === 'tuần'
                  ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1. Thi Đua Tuần
            </button>
            <button
              onClick={() => setPeriodType('tháng')}
              className={`py-2 px-3.5 rounded-xl transition-all ${
                periodType === 'tháng'
                  ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2. Thi Đua Tháng
            </button>
            <button
              onClick={() => setPeriodType('học kỳ')}
              className={`py-2 px-3.5 rounded-xl transition-all ${
                periodType === 'học kỳ'
                  ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              3. Thi Đua Học Kỳ
            </button>
            <button
              onClick={() => setPeriodType('cả năm')}
              className={`py-2 px-3.5 rounded-xl transition-all ${
                periodType === 'cả năm'
                  ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              4. Tổng Kết Cả Năm
            </button>
          </div>

          {/* Sub Period Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Đợt thi đua:</span>
            {periodType === 'tuần' && (
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                {weekOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            )}

            {periodType === 'tháng' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {periodType === 'học kỳ' && (
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                {semesterOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {periodType === 'cả năm' && (
              <span className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-800">
                Toàn năm học 2026 - 2027
              </span>
            )}
          </div>
        </div>

        {/* Notice on scoring mode per Section 3 requirement */}
        {!competitionClassConfig.isScoringEnabled && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
            <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Quy định hệ thống (Mục 3):</strong> Không mặc định áp dụng điểm số nếu GVCN chưa cấu hình. Hệ thống đang hoạt động ở <strong>chế độ nhận xét định tính và xếp hạng</strong>. GVCN có thể bấm nút "Cấu hình tiêu chí" phía trên để bật chế độ chấm điểm số thang điểm 100 nếu cần.
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: 4 Groups in current period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((gNum) => {
          const recItem = currentPeriodRecords.find((p) => p.groupNumber === gNum)?.record;
          const members = getGroupStudents(gNum);

          return (
            <div
              key={gNum}
              className={`bg-white rounded-3xl p-6 border shadow-xs transition-all space-y-4 text-xs flex flex-col justify-between ${
                recItem?.rank === 1
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                        gNum === 1
                          ? 'bg-blue-100 text-blue-800'
                          : gNum === 2
                          ? 'bg-emerald-100 text-emerald-800'
                          : gNum === 3
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      TỔ {gNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">Tổ Tự Quản {gNum}</h3>
                        {recItem?.rank && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              recItem.rank === 1
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : recItem.rank === 2
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            Hạng {recItem.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {members.length} học sinh • Đợt: <strong>{currentPeriodName}</strong>
                      </p>
                    </div>
                  </div>

                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditRecord(gNum)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition-colors flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> {recItem ? 'Sửa Đánh Giá' : 'Ghi Nhận'}
                    </button>
                  )}
                </div>

                {/* Total Score display if enabled */}
                {competitionClassConfig.isScoringEnabled && (
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between text-blue-900">
                    <span className="font-bold">Tổng điểm thi đua đợt này:</span>
                    <span className="text-lg font-black font-mono">
                      {recItem?.totalScore !== undefined ? `${recItem.totalScore} điểm` : 'Chưa nhập điểm'}
                    </span>
                  </div>
                )}

                {/* 6 Criteria breakdown */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Đánh giá theo 6 tiêu chí thi đua:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CRITERIA_DEFINITIONS.map((crit) => {
                      const cfg = competitionClassConfig.criteriaConfigs.find(
                        (c) => c.criterion === crit.key
                      );
                      if (cfg && !cfg.enabled) return null;

                      const evalText = recItem?.evaluations?.[crit.key];
                      const scoreVal = recItem?.scores?.[crit.key];

                      return (
                        <div
                          key={crit.key}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${crit.color.split(' ')[0]}`} />
                              {crit.label}
                            </span>
                            {competitionClassConfig.isScoringEnabled && (
                              <span className="font-mono font-bold text-blue-700 text-[11px]">
                                {scoreVal !== undefined ? `${scoreVal}đ` : '-'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {evalText || 'Chưa có ghi nhận'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Teacher Comment */}
                {recItem?.comment && (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-amber-900 space-y-0.5">
                    <strong className="block text-[11px] font-bold">Nhận xét GVCN:</strong>
                    <p className="text-slate-700 italic">{recItem.comment}</p>
                  </div>
                )}
              </div>

              {/* Footer member avatars / list */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Tổ trưởng: <strong>{members[0]?.fullName || 'Chưa chỉ định'}</strong>
                </span>
                <span>
                  {recItem ? `Cập nhật: ${new Date(recItem.updatedAt).toLocaleDateString('vi-VN')}` : 'Chưa ghi nhận'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Ranking Table for current period */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Bảng Tổng Hợp Xếp Hạng Thi Đua ({currentPeriodName})
          </h4>
          <span className="text-slate-500 font-medium text-xs">
            {competitionClassConfig.isScoringEnabled ? 'Xếp theo tổng điểm' : 'Xếp theo đánh giá GVCN'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 w-16 text-center">Xếp Hạng</th>
                <th className="py-2.5 px-4 w-32">Đơn vị</th>
                <th className="py-2.5 px-3 text-center w-24">Số HS</th>
                {competitionClassConfig.isScoringEnabled && (
                  <th className="py-2.5 px-3 text-center w-28">Tổng điểm</th>
                )}
                <th className="py-2.5 px-4 min-w-[240px]">Nhận xét đánh giá chung của GVCN</th>
                <th className="py-2.5 px-3 text-center w-28">Danh hiệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedGroups.map((item, idx) => {
                const rec = item.record;
                const members = getGroupStudents(item.groupNumber);
                const rankNum = rec?.rank || idx + 1;

                return (
                  <tr key={item.groupNumber} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                          rankNum === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : rankNum === 2
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rankNum}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      Tổ Tự Quản {item.groupNumber}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {members.length} học sinh
                    </td>
                    {competitionClassConfig.isScoringEnabled && (
                      <td className="py-3 px-3 text-center font-mono font-black text-blue-700 bg-blue-50/30">
                        {rec?.totalScore !== undefined ? `${rec.totalScore}đ` : '-'}
                      </td>
                    )}
                    <td className="py-3 px-4 text-slate-700">
                      {rec?.comment || 'Chưa ghi nhận đánh giá cho đợt này.'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rankNum === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : rankNum === 2
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rankNum === 1 ? 'Xuất sắc' : rankNum === 2 ? 'Tiên tiến' : 'Hoàn thành'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: CẤU HÌNH TIÊU CHÍ (MỤC 3) ================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-black text-sm text-slate-900">Cấu Hình Tiêu Chí Thi Đua</h4>
                <p className="text-[11px] text-slate-500">
                  Thiết lập 6 tiêu chí & quyết định áp dụng điểm số hay nhận xét định tính
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Toggle Scoring Switch */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Bật chế độ tính điểm số cho thi đua:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mặc định tắt (chỉ đánh giá định tính & xếp loại trừ phi GVCN chủ động bật)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={tempScoringEnabled}
                  onChange={(e) => setTempScoringEnabled(e.target.checked)}
                  className="w-5 h-5 rounded-md text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            {/* 6 Criteria configs */}
            <div className="space-y-3">
              <span className="font-bold text-slate-700 block">
                Cấu hình 6 tiêu chí theo dõi:
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {CRITERIA_DEFINITIONS.map((crit) => {
                  const cfg = tempCriteriaConfigs.find((c) => c.criterion === crit.key);
                  const isEnabled = cfg ? cfg.enabled : true;
                  const maxScore = cfg?.maxScore || 20;

                  return (
                    <div
                      key={crit.key}
                      className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setTempCriteriaConfigs((prev) =>
                                prev.map((c) =>
                                  c.criterion === crit.key ? { ...c, enabled: checked } : c
                                )
                              );
                            }}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>{crit.label}</span>
                        </label>

                        {tempScoringEnabled && isEnabled && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">Điểm tối đa:</span>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={maxScore}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 20;
                                setTempCriteriaConfigs((prev) =>
                                  prev.map((c) =>
                                    c.criterion === crit.key ? { ...c, maxScore: val } : c
                                  )
                                );
                              }}
                              className="w-14 p-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-center"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 pl-6">{crit.defaultDesc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/30"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: GHI NHẬN ĐÁNH GIÁ THI ĐUA TỔ ================= */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  Ghi Nhận Thi Đua: Tổ {editingGroup} – {currentPeriodName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Nhập đánh giá chi tiết theo từng tiêu chí thi đua đã chọn
                </p>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xếp hạng tổ (1..4):</label>
                  <select
                    value={formRank}
                    onChange={(e) => setFormRank(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value={1}>Hạng 1 (Nhất)</option>
                    <option value={2}>Hạng 2 (Nhì)</option>
                    <option value={3}>Hạng 3 (Ba)</option>
                    <option value={4}>Hạng 4 (Tư)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đợt thi đua:</label>
                  <input
                    type="text"
                    disabled
                    value={`${periodType.toUpperCase()}: ${currentPeriodName}`}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-600"
                  />
                </div>
              </div>

              {/* 6 Criteria inputs */}
              <div className="space-y-3">
                <span className="font-bold text-slate-700 block">
                  Đánh giá chi tiết 6 tiêu chí:
                </span>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {CRITERIA_DEFINITIONS.map((crit) => {
                    const cfg = competitionClassConfig.criteriaConfigs.find(
                      (c) => c.criterion === crit.key
                    );
                    if (cfg && !cfg.enabled) return null;

                    return (
                      <div
                        key={crit.key}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${crit.color.split(' ')[0]}`} />
                            {crit.label}
                          </label>

                          {competitionClassConfig.isScoringEnabled && (
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">Điểm:</span>
                              <input
                                type="number"
                                min={0}
                                max={cfg?.maxScore || 100}
                                value={formScores[crit.key] ?? ''}
                                onChange={(e) =>
                                  setFormScores({
                                    ...formScores,
                                    [crit.key]: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="0"
                                className="w-16 p-1 bg-white border border-slate-300 rounded font-mono font-bold text-center"
                              />
                            </div>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder={`Nhận xét về ${crit.label.toLowerCase()} của Tổ ${editingGroup}...`}
                          value={formEvaluations[crit.key] || ''}
                          onChange={(e) =>
                            setFormEvaluations({
                              ...formEvaluations,
                              [crit.key]: e.target.value,
                            })
                          }
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General comment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhận xét chung của GVCN:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi nhận nỗ lực, ưu điểm và nhắc nhở tổ..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/30"
                >
                  Lưu Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
