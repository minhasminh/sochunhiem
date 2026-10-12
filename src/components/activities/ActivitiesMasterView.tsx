import React, { useState, useMemo } from 'react';
import {
  Compass,
  Award,
  Sparkles,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
  Tag,
  Check,
  X,
  MapPin,
  UserCheck,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AwardLevel,
  AwardRecord,
  ClassActivity,
  Student,
  TalentField,
  TalentProfile,
} from '../../types';
import { CompetitionMasterView } from '../competition/CompetitionMasterView';

const TALENT_FIELDS: { id: TalentField; label: string; color: string }[] = [
  { id: 'Toán học', label: 'Toán học', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'Tin học', label: 'Tin học', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'Khoa học tự nhiên', label: 'Khoa học tự nhiên', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Ngữ văn - Ngoại ngữ', label: 'Ngữ văn - Ngoại ngữ', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'Nghệ thuật & Mĩ thuật', label: 'Nghệ thuật & Mĩ thuật', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'Âm nhạc', label: 'Âm nhạc', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'Thể dục thể thao', label: 'Thể dục thể thao', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Kỹ năng Đội - Hoạt náo', label: 'Kỹ năng Đội - Hoạt náo', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

const AWARD_LEVELS: AwardLevel[] = ['Lớp', 'Trường', 'Cụm / Huyện / TP', 'Tỉnh', 'Quốc gia'];

export const ActivitiesMasterView: React.FC = () => {
  const {
    currentClass,
    currentSchoolYear,
    currentClassStudents,
    classActivities,
    addClassActivity,
    updateClassActivity,
    deleteClassActivity,
    toggleActivityParticipant,
    setActivityParticipants,
    awardRecords,
    addAwardRecord,
    updateAwardRecord,
    deleteAwardRecord,
    talentProfiles,
    addTalentProfile,
    updateTalentProfile,
    deleteTalentProfile,
    currentUser,
    setSelectedStudent,
    setActiveMenu,
  } = useApp();

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Sub-tabs: 'activities' | 'competition' | 'awards' | 'talents' | 'summary'
  const [activeTab, setActiveTab] = useState<'activities' | 'competition' | 'awards' | 'talents' | 'summary'>('activities');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAwardLevel, setFilterAwardLevel] = useState<AwardLevel | 'all'>('all');
  const [filterTalentField, setFilterTalentField] = useState<TalentField | 'all'>('all');

  // ================= 1. ACTIVITY MODALS & STATE =================
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState<{
    name: string;
    date: string;
    content: string;
    objective: string;
    location: string;
    personInCharge: string;
    result: string;
    documents: string;
    participantStudentIds: string[];
    notes: string;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    objective: '',
    location: 'Trường THCS',
    personInCharge: currentUser?.name || 'GVCN',
    result: '',
    documents: '',
    participantStudentIds: currentClassStudents.map((s) => s.id),
    notes: '',
  });

  // Participant Management Modal
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [managingActivity, setManagingActivity] = useState<ClassActivity | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const [tempParticipantIds, setTempParticipantIds] = useState<string[]>([]);

  const handleOpenAddActivity = () => {
    setEditingActivityId(null);
    setActivityForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      objective: '',
      location: 'Trường THCS',
      personInCharge: currentUser?.name || 'GVCN',
      result: '',
      documents: '',
      participantStudentIds: currentClassStudents.map((s) => s.id), // default select all
      notes: '',
    });
    setShowActivityModal(true);
  };

  const handleOpenEditActivity = (act: ClassActivity) => {
    setEditingActivityId(act.id);
    setActivityForm({
      name: act.name,
      date: act.date,
      content: act.content,
      objective: act.objective,
      location: act.location,
      personInCharge: act.personInCharge,
      result: act.result,
      documents: act.documents ? act.documents.join('\n') : '',
      participantStudentIds: act.participantStudentIds,
      notes: act.notes || '',
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.name.trim()) return;

    const docs = activityForm.documents
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (editingActivityId) {
      updateClassActivity(editingActivityId, {
        name: activityForm.name.trim(),
        date: activityForm.date,
        content: activityForm.content.trim(),
        objective: activityForm.objective.trim(),
        location: activityForm.location.trim(),
        personInCharge: activityForm.personInCharge.trim(),
        result: activityForm.result.trim(),
        documents: docs,
        participantStudentIds: activityForm.participantStudentIds,
        notes: activityForm.notes.trim() || undefined,
      });
    } else {
      addClassActivity({
        classId: currentClass?.id || 'class-7-1',
        schoolYearId: currentSchoolYear.id,
        name: activityForm.name.trim(),
        date: activityForm.date,
        content: activityForm.content.trim(),
        objective: activityForm.objective.trim(),
        location: activityForm.location.trim(),
        personInCharge: activityForm.personInCharge.trim(),
        result: activityForm.result.trim(),
        documents: docs,
        participantStudentIds: activityForm.participantStudentIds,
        notes: activityForm.notes.trim() || undefined,
      });
    }
    setShowActivityModal(false);
  };

  const handleOpenParticipantsModal = (act: ClassActivity) => {
    setManagingActivity(act);
    setTempParticipantIds([...act.participantStudentIds]);
    setParticipantSearch('');
    setShowParticipantsModal(true);
  };

  const handleSaveParticipants = () => {
    if (managingActivity) {
      setActivityParticipants(managingActivity.id, tempParticipantIds);
      setShowParticipantsModal(false);
    }
  };

  // ================= 2. AWARD MODALS & STATE =================
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [awardForm, setAwardForm] = useState<{
    studentId: string;
    achievement: string;
    date: string;
    level: AwardLevel;
    content: string;
    evidence: string;
    notes: string;
  }>({
    studentId: currentClassStudents[0]?.id || '',
    achievement: '',
    date: new Date().toISOString().split('T')[0],
    level: 'Trường',
    content: '',
    evidence: '',
    notes: '',
  });

  const handleOpenAddAward = () => {
    setEditingAwardId(null);
    setAwardForm({
      studentId: currentClassStudents[0]?.id || '',
      achievement: '',
      date: new Date().toISOString().split('T')[0],
      level: 'Trường',
      content: '',
      evidence: '',
      notes: '',
    });
    setShowAwardModal(true);
  };

  const handleOpenEditAward = (aw: AwardRecord) => {
    setEditingAwardId(aw.id);
    setAwardForm({
      studentId: aw.studentId,
      achievement: aw.achievement,
      date: aw.date,
      level: aw.level,
      content: aw.content,
      evidence: aw.evidence || '',
      notes: aw.notes || '',
    });
    setShowAwardModal(true);
  };

  const handleSaveAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardForm.achievement.trim() || !awardForm.studentId) return;

    if (editingAwardId) {
      updateAwardRecord(editingAwardId, {
        studentId: awardForm.studentId,
        achievement: awardForm.achievement.trim(),
        date: awardForm.date,
        level: awardForm.level,
        content: awardForm.content.trim(),
        evidence: awardForm.evidence.trim() || undefined,
        notes: awardForm.notes.trim() || undefined,
      });
    } else {
      addAwardRecord({
        classId: currentClass?.id || 'class-7-1',
        schoolYearId: currentSchoolYear.id,
        studentId: awardForm.studentId,
        achievement: awardForm.achievement.trim(),
        date: awardForm.date,
        level: awardForm.level,
        content: awardForm.content.trim(),
        evidence: awardForm.evidence.trim() || undefined,
        notes: awardForm.notes.trim() || undefined,
      });
    }
    setShowAwardModal(false);
  };

  // ================= 3. TALENT MODALS & STATE =================
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [editingTalentId, setEditingTalentId] = useState<string | null>(null);
  const [talentForm, setTalentForm] = useState<{
    studentId: string;
    field: TalentField;
    talentDescription: string;
    achievements: string;
    competitions: string;
    results: string;
    trainingPlan: string;
  }>({
    studentId: currentClassStudents[0]?.id || '',
    field: 'Tin học',
    talentDescription: '',
    achievements: '',
    competitions: '',
    results: '',
    trainingPlan: '',
  });

  const handleOpenAddTalent = () => {
    setEditingTalentId(null);
    setTalentForm({
      studentId: currentClassStudents[0]?.id || '',
      field: 'Tin học',
      talentDescription: '',
      achievements: '',
      competitions: '',
      results: '',
      trainingPlan: '',
    });
    setShowTalentModal(true);
  };

  const handleOpenEditTalent = (tp: TalentProfile) => {
    setEditingTalentId(tp.id);
    setTalentForm({
      studentId: tp.studentId,
      field: tp.field as TalentField,
      talentDescription: tp.talentDescription,
      achievements: tp.achievements,
      competitions: tp.competitions,
      results: tp.results,
      trainingPlan: tp.trainingPlan,
    });
    setShowTalentModal(true);
  };

  const handleSaveTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentForm.studentId || !talentForm.talentDescription.trim()) return;

    if (editingTalentId) {
      updateTalentProfile(editingTalentId, {
        studentId: talentForm.studentId,
        field: talentForm.field,
        talentDescription: talentForm.talentDescription.trim(),
        achievements: talentForm.achievements.trim(),
        competitions: talentForm.competitions.trim(),
        results: talentForm.results.trim(),
        trainingPlan: talentForm.trainingPlan.trim(),
      });
    } else {
      addTalentProfile({
        classId: currentClass?.id || 'class-7-1',
        schoolYearId: currentSchoolYear.id,
        studentId: talentForm.studentId,
        field: talentForm.field,
        talentDescription: talentForm.talentDescription.trim(),
        achievements: talentForm.achievements.trim(),
        competitions: talentForm.competitions.trim(),
        results: talentForm.results.trim(),
        trainingPlan: talentForm.trainingPlan.trim(),
      });
    }
    setShowTalentModal(false);
  };

  // ================= Filtered lists =================
  const filteredActivities = useMemo(() => {
    return classActivities.filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        a.name.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.personInCharge.toLowerCase().includes(q)
      );
    });
  }, [classActivities, searchQuery]);

  const filteredAwards = useMemo(() => {
    return awardRecords.filter((aw) => {
      if (filterAwardLevel !== 'all' && aw.level !== filterAwardLevel) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const st = currentClassStudents.find((s) => s.id === aw.studentId);
      return (
        aw.achievement.toLowerCase().includes(q) ||
        aw.content.toLowerCase().includes(q) ||
        (st && st.fullName.toLowerCase().includes(q))
      );
    });
  }, [awardRecords, filterAwardLevel, searchQuery, currentClassStudents]);

  const filteredTalents = useMemo(() => {
    return talentProfiles.filter((tp) => {
      if (filterTalentField !== 'all' && tp.field !== filterTalentField) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const st = currentClassStudents.find((s) => s.id === tp.studentId);
      return (
        tp.talentDescription.toLowerCase().includes(q) ||
        tp.field.toLowerCase().includes(q) ||
        (st && st.fullName.toLowerCase().includes(q))
      );
    });
  }, [talentProfiles, filterTalentField, searchQuery, currentClassStudents]);

  // Overall Statistics for Section 6
  const activityStats = useMemo(() => {
    const totalActivities = classActivities.length;
    const allParticipantsCount = new Set(
      classActivities.flatMap((a) => a.participantStudentIds)
    ).size;
    const totalAwards = awardRecords.length;
    const totalTalents = talentProfiles.length;
    const participationRate =
      currentClassStudents.length > 0
        ? Math.round((allParticipantsCount / currentClassStudents.length) * 100)
        : 0;

    return {
      totalActivities,
      allParticipantsCount,
      totalAwards,
      totalTalents,
      participationRate,
    };
  }, [classActivities, awardRecords, talentProfiles, currentClassStudents]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  QUẢN LÝ HOẠT ĐỘNG – KHEN THƯỞNG – NĂNG KHIẾU LỚP {currentClass?.className}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {activityStats.totalActivities} hoạt động
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {activityStats.totalAwards} khen thưởng
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {activityStats.totalTalents} học sinh năng khiếu
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi hoạt động tập thể, danh sách học sinh tham gia, hồ sơ khen thưởng và kế hoạch bồi dưỡng năng khiếu
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'activities' && isAuthorized && (
            <button
              onClick={handleOpenAddActivity}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Thêm Hoạt Động
            </button>
          )}

          {activeTab === 'awards' && isAuthorized && (
            <button
              onClick={handleOpenAddAward}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Ghi Nhận Khen Thưởng
            </button>
          )}

          {activeTab === 'talents' && isAuthorized && (
            <button
              onClick={handleOpenAddTalent}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Thêm Hồ Sơ Năng Khiếu
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> In Sổ Hoạt Động
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'activities'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Hoạt Động Tập Thể</span>
            <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">
              {classActivities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('competition')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'competition'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>2. Thi Đua 4 Tổ</span>
          </button>

          <button
            onClick={() => setActiveTab('awards')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'awards'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Khen Thưởng & Thành Tích</span>
            {awardRecords.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                {awardRecords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('talents')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'talents'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Học Sinh Năng Khiếu</span>
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
              {talentProfiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'summary'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>5. Báo Cáo Thống Kê Tổng Hợp</span>
          </button>
        </div>
      </div>

      {/* ================= TAB: THI ĐUA 4 TỔ (MỤC 3) ================= */}
      {activeTab === 'competition' && <CompetitionMasterView />}

      {/* ================= TAB 1: HOẠT ĐỘNG TẬP THỂ ================= */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4 text-xs print:hidden">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên hoạt động, địa điểm, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div className="text-slate-500 text-xs">
              Hiển thị <strong>{filteredActivities.length}</strong> hoạt động
            </div>
          </div>

          {/* Activity Cards List */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs italic">
              Chưa có hoạt động nào được ghi nhận. Bấm "Thêm Hoạt Động" để tạo mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredActivities.map((act) => {
                const participantCount = act.participantStudentIds.length;
                const totalStudents = currentClassStudents.length;
                const rate = totalStudents > 0 ? Math.round((participantCount / totalStudents) * 100) : 0;

                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            Ngày: {act.date}
                          </span>
                          <h3 className="font-black text-sm text-slate-900 leading-snug">
                            {act.name}
                          </h3>
                        </div>
                        {isAuthorized && (
                          <div className="flex items-center gap-1 print:hidden">
                            <button
                              type="button"
                              onClick={() => handleOpenEditActivity(act)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100"
                              title="Chỉnh sửa hoạt động"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteClassActivity(act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Xóa hoạt động"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-slate-600">
                        <div>
                          <strong className="text-slate-800">Mục tiêu:</strong> {act.objective}
                        </div>
                        <div>
                          <strong className="text-slate-800">Nội dung:</strong> {act.content}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {act.location}
                          </span>
                          <span>•</span>
                          <span>Phụ trách: <strong>{act.personInCharge}</strong></span>
                        </div>
                      </div>

                      {/* Result Box */}
                      {act.result && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-emerald-900 space-y-0.5">
                          <strong className="block text-[11px]">Kết quả đạt được:</strong>
                          <p className="text-slate-700">{act.result}</p>
                        </div>
                      )}

                      {/* Documents / Images preview if available */}
                      {act.documents && act.documents.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700">Tài liệu / Minh chứng:</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {act.documents.map((doc, dIdx) => (
                              <a
                                key={dIdx}
                                href={doc}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-medium flex items-center gap-1 transition-colors"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Minh chứng {dIdx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Participant summary & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-slate-800">
                          {participantCount}/{totalStudents} học sinh tham gia ({rate}%)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenParticipantsModal(act)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Danh sách ({participantCount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: KHEN THƯỞNG & THÀNH TÍCH ================= */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          {/* Controls & Filter */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs print:hidden">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh, thành tích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Cấp khen thưởng:</span>
                <select
                  value={filterAwardLevel}
                  onChange={(e) => setFilterAwardLevel(e.target.value as any)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="all">Tất cả các cấp</option>
                  {AWARD_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Cấp {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-slate-500">
              Tổng số khen thưởng: <strong>{filteredAwards.length}</strong>
            </div>
          </div>

          {/* Awards Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 w-28">Mã HS</th>
                    <th className="py-3 px-4 min-w-[160px]">Học sinh khen thưởng</th>
                    <th className="py-3 px-2 text-center w-14">Tổ</th>
                    <th className="py-3 px-3 min-w-[180px]">Thành tích đạt được</th>
                    <th className="py-3 px-3 text-center w-28">Cấp khen thưởng</th>
                    <th className="py-3 px-3 w-24 text-center">Ngày ghi nhận</th>
                    <th className="py-3 px-3 min-w-[200px]">Nội dung & Minh chứng</th>
                    {isAuthorized && <th className="py-3 px-3 text-center w-20">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAwards.map((aw, idx) => {
                    const st = currentClassStudents.find((s) => s.id === aw.studentId);
                    return (
                      <tr key={aw.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {st?.studentCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => st && setSelectedStudent(st)}
                            className="hover:text-amber-700 hover:underline text-left"
                          >
                            {st?.fullName}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-600">
                          Tổ {st?.groupNumber}
                        </td>
                        <td className="py-3 px-3 font-black text-amber-900">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{aw.achievement}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              aw.level === 'Quốc gia'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : aw.level === 'Tỉnh'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : aw.level === 'Cụm / Huyện / TP'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : aw.level === 'Trường'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            Cấp {aw.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {aw.date}
                        </td>
                        <td className="py-3 px-3 space-y-1 text-slate-700">
                          <div>{aw.content}</div>
                          {aw.evidence && (
                            <div className="text-[11px] text-amber-800 font-medium">
                              Minh chứng: {aw.evidence}
                            </div>
                          )}
                        </td>
                        {isAuthorized && (
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAward(aw)}
                                className="p-1 text-slate-400 hover:text-amber-600 rounded"
                                title="Sửa"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAwardRecord(aw.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HỌC SINH NĂNG KHIẾU ================= */}
      {activeTab === 'talents' && (
        <div className="space-y-6">
          {/* Controls & Filter */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs print:hidden">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh, năng khiếu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Lĩnh vực:</span>
                <select
                  value={filterTalentField}
                  onChange={(e) => setFilterTalentField(e.target.value as any)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="all">Tất cả lĩnh vực</option>
                  {TALENT_FIELDS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-slate-500">
              Tổng số học sinh năng khiếu: <strong>{filteredTalents.length}</strong>
            </div>
          </div>

          {/* Talents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTalents.map((tp) => {
              const st = currentClassStudents.find((s) => s.id === tp.studentId);
              const fieldObj = TALENT_FIELDS.find((f) => f.id === tp.field);

              return (
                <div
                  key={tp.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            fieldObj?.color || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {tp.field}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <h4 className="font-black text-base text-slate-900">
                            {st?.fullName}
                          </h4>
                          <span className="text-slate-400 text-xs">({st?.studentCode} • Tổ {st?.groupNumber})</span>
                        </div>
                      </div>

                      {isAuthorized && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTalent(tp)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTalentProfile(tp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-purple-950 space-y-1">
                      <strong className="block text-[11px] font-bold">Biểu hiện năng khiếu:</strong>
                      <p className="text-slate-700 leading-relaxed">{tp.talentDescription}</p>
                    </div>

                    <div className="space-y-2 text-slate-700">
                      <div>
                        <strong className="text-slate-900">Thành tích đã có:</strong> {tp.achievements || 'Đang bồi dưỡng'}
                      </div>
                      <div>
                        <strong className="text-slate-900">Cuộc thi tham gia:</strong> {tp.competitions || 'Theo kế hoạch năm học'}
                      </div>
                      <div>
                        <strong className="text-slate-900">Kết quả:</strong> {tp.results || 'Đang theo dõi'}
                      </div>
                    </div>

                    {tp.trainingPlan && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 space-y-1">
                        <strong className="text-teal-900 block text-[11px] font-bold">
                          Kế hoạch bồi dưỡng của GVCN & Nhà trường:
                        </strong>
                        <p className="text-slate-600 leading-relaxed">{tp.trainingPlan}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => st && setSelectedStudent(st)}
                      className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                    >
                      Xem hồ sơ học sinh <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Cập nhật: {new Date(tp.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: BÁO CÁO THỐNG KÊ TỔNG HỢP (MỤC 6) ================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Tổng số hoạt động</span>
              <div className="text-2xl font-black text-teal-700">{activityStats.totalActivities}</div>
              <p className="text-[11px] text-slate-600">Đã tổ chức trong năm học</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Học sinh tham gia</span>
              <div className="text-2xl font-black text-blue-700">
                {activityStats.allParticipantsCount}/{currentClassStudents.length}
              </div>
              <p className="text-[11px] text-blue-600 font-bold">Tỷ lệ đạt {activityStats.participationRate}%</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Khen thưởng các cấp</span>
              <div className="text-2xl font-black text-amber-600">{activityStats.totalAwards}</div>
              <p className="text-[11px] text-slate-600">Giải thưởng & bằng khen</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Học sinh năng khiếu</span>
              <div className="text-2xl font-black text-purple-700">{activityStats.totalTalents}</div>
              <p className="text-[11px] text-slate-600">8 lĩnh vực bồi dưỡng</p>
            </div>
          </div>

          {/* Activity Breakdown Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                Thống Kê Chi Tiết Tỷ Lệ Học Sinh Tham Gia Từng Hoạt Động
              </h4>
              <button
                type="button"
                onClick={() => setActiveMenu('reports')}
                className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
              >
                Mở phân hệ Báo Cáo A4 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3 w-28">Ngày</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Tên hoạt động</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Địa điểm</th>
                    <th className="py-2.5 px-3 text-center w-28">Số HS tham gia</th>
                    <th className="py-2.5 px-3 text-center w-28">Tỷ lệ lớp</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classActivities.map((act, aIdx) => {
                    const pCount = act.participantStudentIds.length;
                    const total = currentClassStudents.length;
                    const pRate = total > 0 ? Math.round((pCount / total) * 100) : 0;

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{aIdx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{act.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{act.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{act.location}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-teal-700 bg-teal-50/30">
                          {pCount} / {total}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                            {pRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{act.result || 'Đã hoàn thành'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA HOẠT ĐỘNG ================= */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-black text-sm text-slate-900">
                {editingActivityId ? 'Chỉnh Sửa Hoạt Động Lớp' : 'Thêm Hoạt Động Phong Trào Mới'}
              </h4>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên hoạt động:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chiến dịch Chủ nhật xanh, Hội thi 20/11..."
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày diễn ra:</label>
                  <input
                    type="date"
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa điểm:</label>
                  <input
                    type="text"
                    placeholder="Sân trường, P.204..."
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách:</label>
                  <input
                    type="text"
                    value={activityForm.personInCharge}
                    onChange={(e) => setActivityForm({ ...activityForm, personInCharge: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu giáo dục:</label>
                <input
                  type="text"
                  placeholder="Giáo dục ý thức, nâng cao kỹ năng..."
                  value={activityForm.objective}
                  onChange={(e) => setActivityForm({ ...activityForm, objective: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung hoạt động:</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt diễn biến, công việc cụ thể..."
                  value={activityForm.content}
                  onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kết quả đạt được:</label>
                <input
                  type="text"
                  placeholder="Đạt giải, hoàn thành tốt, tuyên dương..."
                  value={activityForm.result}
                  onChange={(e) => setActivityForm({ ...activityForm, result: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Link ảnh / tài liệu minh chứng (mỗi link 1 dòng):
                </label>
                <textarea
                  rows={2}
                  placeholder="https://..."
                  value={activityForm.documents}
                  onChange={(e) => setActivityForm({ ...activityForm, documents: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/30"
                >
                  {editingActivityId ? 'Lưu Thay Đổi' : 'Tạo Hoạt Động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUẢN LÝ DANH SÁCH THAM GIA (MỤC 2) ================= */}
      {showParticipantsModal && managingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  Danh Sách Học Sinh Tham Gia Hoạt Động
                </h4>
                <p className="text-xs text-teal-800 font-bold mt-0.5">
                  {managingActivity.name} ({tempParticipantIds.length}/{currentClassStudents.length} học sinh)
                </p>
              </div>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Search (Requirement 2: chọn tất cả, bỏ chọn, tìm học sinh) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên, mã số, tổ..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempParticipantIds(currentClassStudents.map((s) => s.id))}
                  className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-xl font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setTempParticipantIds([])}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Bỏ chọn
                </button>
              </div>
            </div>

            {/* Student Checkbox Grid */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
              {currentClassStudents
                .filter((st) => {
                  if (!participantSearch.trim()) return true;
                  const q = participantSearch.toLowerCase().trim();
                  return (
                    st.fullName.toLowerCase().includes(q) ||
                    st.studentCode.toLowerCase().includes(q) ||
                    `tổ ${st.groupNumber}`.includes(q)
                  );
                })
                .map((st) => {
                  const isChecked = tempParticipantIds.includes(st.id);
                  return (
                    <label
                      key={st.id}
                      className="p-2.5 flex items-center justify-between hover:bg-white rounded-xl cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setTempParticipantIds(tempParticipantIds.filter((id) => id !== st.id));
                            } else {
                              setTempParticipantIds([...tempParticipantIds, st.id]);
                            }
                          }}
                          className="w-4 h-4 rounded-md text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800">{st.stt}. {st.fullName}</span>
                          <span className="text-slate-400 text-[11px] ml-2 font-mono">({st.studentCode})</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">Tổ {st.groupNumber}</span>
                    </label>
                  );
                })}
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                Đã chọn: <strong className="text-teal-700">{tempParticipantIds.length}</strong> học sinh
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowParticipantsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveParticipants}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/30"
                >
                  Lưu Danh Sách Tham Gia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA KHEN THƯỞNG ================= */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-black text-sm text-slate-900">
                {editingAwardId ? 'Chỉnh Sửa Khen Thưởng' : 'Ghi Nhận Khen Thưởng Học Sinh'}
              </h4>
              <button
                onClick={() => setShowAwardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAward} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                <select
                  value={awardForm.studentId}
                  onChange={(e) => setAwardForm({ ...awardForm, studentId: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Thành tích khen thưởng:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giải Nhất Hội thi KHTN, Cháu ngoan Bác Hồ..."
                  value={awardForm.achievement}
                  onChange={(e) => setAwardForm({ ...awardForm, achievement: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-amber-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp khen thưởng:</label>
                  <select
                    value={awardForm.level}
                    onChange={(e) => setAwardForm({ ...awardForm, level: e.target.value as AwardLevel })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {AWARD_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Cấp {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày khen thưởng:</label>
                  <input
                    type="date"
                    value={awardForm.date}
                    onChange={(e) => setAwardForm({ ...awardForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung quyết định / khen thưởng:</label>
                <textarea
                  rows={2}
                  placeholder="Quyết định khen thưởng số..., lý do tuyên dương..."
                  value={awardForm.content}
                  onChange={(e) => setAwardForm({ ...awardForm, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minh chứng (Số quyết định, ảnh bằng khen):</label>
                <input
                  type="text"
                  placeholder="Giấy khen số 48/QĐ-HĐĐ, Giấy chứng nhận..."
                  value={awardForm.evidence}
                  onChange={(e) => setAwardForm({ ...awardForm, evidence: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm:</label>
                <input
                  type="text"
                  placeholder="Ghi chú theo dõi..."
                  value={awardForm.notes}
                  onChange={(e) => setAwardForm({ ...awardForm, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/30"
                >
                  {editingAwardId ? 'Cập Nhật' : 'Lưu Khen Thưởng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA HỌC SINH NĂNG KHIẾU ================= */}
      {showTalentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-black text-sm text-slate-900">
                {editingTalentId ? 'Chỉnh Sửa Hồ Sơ Năng Khiếu' : 'Thêm Hồ Sơ Học Sinh Năng Khiếu'}
              </h4>
              <button
                onClick={() => setShowTalentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTalent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                <select
                  value={talentForm.studentId}
                  onChange={(e) => setTalentForm({ ...talentForm, studentId: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Lĩnh vực năng khiếu:</label>
                <select
                  value={talentForm.field}
                  onChange={(e) => setTalentForm({ ...talentForm, field: e.target.value as TalentField })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-purple-900"
                >
                  {TALENT_FIELDS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biểu hiện năng khiếu cụ thể:</label>
                <textarea
                  rows={2}
                  placeholder="Khả năng hội họa, giải thuật nhanh, thể lực tốt..."
                  value={talentForm.talentDescription}
                  onChange={(e) => setTalentForm({ ...talentForm, talentDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thành tích đã đạt được:</label>
                <input
                  type="text"
                  placeholder="Giải thưởng, huy chương, điểm số nổi bật..."
                  value={talentForm.achievements}
                  onChange={(e) => setTalentForm({ ...talentForm, achievements: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuộc thi tham gia:</label>
                  <input
                    type="text"
                    placeholder="Hội thi cấp trường, TP..."
                    value={talentForm.competitions}
                    onChange={(e) => setTalentForm({ ...talentForm, competitions: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kết quả đạt được:</label>
                  <input
                    type="text"
                    placeholder="Đang theo dõi, top 3..."
                    value={talentForm.results}
                    onChange={(e) => setTalentForm({ ...talentForm, results: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kế hoạch bồi dưỡng của GVCN & Nhà trường:
                </label>
                <textarea
                  rows={2}
                  placeholder="Phân công giáo viên bộ môn phụ đạo, tham gia CLB..."
                  value={talentForm.trainingPlan}
                  onChange={(e) => setTalentForm({ ...talentForm, trainingPlan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-teal-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTalentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/30"
                >
                  {editingTalentId ? 'Cập Nhật' : 'Lưu Hồ Sơ Năng Khiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
