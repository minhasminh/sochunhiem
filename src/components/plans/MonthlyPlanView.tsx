import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Copy,
  Printer,
  Sparkles,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ListTodo,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonthlyPlan, PlanTaskStatus } from '../../types';
import { AIPlanAssistModal } from './AIPlanAssistModal';

interface MonthlyPlanViewProps {
  onOpenPrint?: (monthId?: string) => void;
}

export const MonthlyPlanView: React.FC<MonthlyPlanViewProps> = ({ onOpenPrint }) => {
  const {
    monthlyPlans,
    addMonthlyPlan,
    updateMonthlyPlan,
    copyMonthlyPlan,
    currentClass,
    currentSchoolYear,
    currentUser,
    canEditCurrentClass,
  } = useApp();

  const isAuthorized = canEditCurrentClass;

  // Selected Month State
  const [selectedMonthId, setSelectedMonthId] = useState<string>(
    monthlyPlans[1]?.id || monthlyPlans[0]?.id || ''
  );

  // Edit Monthly Plan Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MonthlyPlan | null>(null);
  const [formPlan, setFormPlan] = useState<Partial<MonthlyPlan>>({});

  // Copy Month Modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetMonth, setCopyTargetMonth] = useState<number>(11);
  const [copyTargetYear, setCopyTargetYear] = useState<number>(2026);

  // Create Month Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<Omit<MonthlyPlan, 'id' | 'updatedAt'>>({
    classId: currentClass?.id || 'class-7-1',
    schoolYearId: currentSchoolYear.id,
    month: 11,
    year: 2026,
    theme: '',
    goal: '',
    content: '',
    measures: '',
    tasksText: '',
    activities: ['Phát động đợt thi đua mới', 'Sinh hoạt lớp theo chủ điểm'],
    status: 'Chưa thực hiện',
    result: '',
    comments: '',
  });
  const [newActivityInput, setNewActivityInput] = useState('');

  // AI Modal
  const [showAIModal, setShowAIModal] = useState(false);

  const activePlan = monthlyPlans.find((m) => m.id === selectedMonthId) || monthlyPlans[0];

  // Open Create Modal
  const openCreate = () => {
    setCreateForm({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      month: 11,
      year: 2026,
      theme: '',
      goal: '',
      content: '',
      measures: '',
      tasksText: '',
      activities: ['Phát động đợt thi đua', 'Sinh hoạt chi đội theo chủ điểm'],
      status: 'Chưa thực hiện',
      result: '',
      comments: '',
    });
    setNewActivityInput('');
    setShowCreateModal(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.theme.trim()) return;
    addMonthlyPlan(createForm);
    setShowCreateModal(false);
  };

  // Open Edit
  const openEdit = (plan: MonthlyPlan) => {
    setEditingPlan(plan);
    setFormPlan({ ...plan });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updateMonthlyPlan(editingPlan.id, formPlan);
    setShowEditModal(false);
  };

  // Open Copy
  const handleExecuteCopy = () => {
    if (!activePlan) return;
    copyMonthlyPlan(activePlan.id, copyTargetMonth, copyTargetYear);
    setShowCopyModal(false);
  };

  // Cycle Status
  const handleCycleStatus = (plan: MonthlyPlan) => {
    if (!isAuthorized) return;
    const nextStatus: Record<PlanTaskStatus, PlanTaskStatus> = {
      'Chưa thực hiện': 'Đang thực hiện',
      'Đang thực hiện': 'Đã hoàn thành',
      'Đã hoàn thành': 'Chưa thực hiện',
    };
    updateMonthlyPlan(plan.id, { status: nextStatus[plan.status] });
  };

  // AI Suggestions application
  const handleApplyAISuggestions = (theme: string, goal: string, activities: string[]) => {
    if (!activePlan) return;
    updateMonthlyPlan(activePlan.id, {
      theme,
      goal,
      activities,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  KẾ HOẠCH HOẠT ĐỘNG GIÁO DỤC THEO THÁNG
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {monthlyPlans.length} tháng học
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kế hoạch chủ nhiệm từng tháng theo các chủ điểm năm học THCS (Tháng 9 đến Tháng 5)
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAuthorized && (
            <>
              <button
                onClick={openCreate}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                title="Tạo kế hoạch cho một tháng mới"
              >
                <Plus className="w-4 h-4" />
                Tạo kế hoạch tháng
              </button>

              <button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all flex items-center gap-2"
                title="Sử dụng AI gợi ý hoạt động chủ điểm tháng"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                AI Gợi ý hoạt động tháng
              </button>

              <button
                onClick={() => setShowCopyModal(true)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Sao chép kế hoạch tháng này sang tháng khác"
              >
                <Copy className="w-4 h-4" />
                Sao chép
              </button>

              {activePlan && (
                <button
                  onClick={() => openEdit(activePlan)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  Sửa kế hoạch tháng
                </button>
              )}
            </>
          )}

          {onOpenPrint && (
            <button
              onClick={() => onOpenPrint(activePlan?.id)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In kế hoạch tháng
            </button>
          )}
        </div>
      </div>

      {/* Month Tabs Bar (9 months: Tháng 9 to Tháng 5) */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {monthlyPlans.map((plan) => {
            const isSelected = activePlan?.id === plan.id;
            const isDone = plan.status === 'Đã hoàn thành';
            const isDoing = plan.status === 'Đang thực hiện';

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedMonthId(plan.id)}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-700/30 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>
                  Tháng {plan.month}/{plan.year}
                </span>

                <span
                  className={`w-2 h-2 rounded-full ${
                    isDone
                      ? 'bg-emerald-400'
                      : isDoing
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Monthly Plan Details View */}
      {activePlan && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Month Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-900 text-white p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-200">
                KẾ HOẠCH GIÁO DỤC THÁNG {activePlan.month} NĂM {activePlan.year}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                CHỦ ĐIỂM: "{activePlan.theme.toUpperCase()}"
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCycleStatus(activePlan)}
                disabled={!isAuthorized}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                  activePlan.status === 'Đã hoàn thành'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : activePlan.status === 'Đang thực hiện'
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30 animate-pulse'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                {activePlan.status === 'Đã hoàn thành' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : activePlan.status === 'Đang thực hiện' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-white/70" />
                )}
                <span>Trạng thái: {activePlan.status}</span>
              </button>
            </div>
          </div>

          {/* Grid Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* 1. Mục tiêu */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-indigo-900 uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                1. Mục tiêu giáo dục tháng
              </h4>
              <p className="text-slate-700 leading-relaxed pt-1">
                {activePlan.goal || 'Chưa cập nhật mục tiêu tháng.'}
              </p>
            </div>

            {/* 2. Nội dung trọng tâm */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-indigo-900 uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                2. Nội dung công việc trọng tâm
              </h4>
              <p className="text-slate-700 leading-relaxed pt-1">
                {activePlan.content || 'Chưa cập nhật nội dung trọng tâm.'}
              </p>
            </div>

            {/* 3. Biện pháp thực hiện */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-indigo-900 uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                3. Biện pháp thực hiện sư phạm
              </h4>
              <p className="text-slate-700 leading-relaxed pt-1">
                {activePlan.measures || 'Chưa cập nhật biện pháp thực hiện.'}
              </p>
            </div>

            {/* 4. Nhiệm vụ cụ thể */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-indigo-900 uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                4. Nhiệm vụ cụ thể các tuần
              </h4>
              <div className="text-slate-700 leading-relaxed pt-1 whitespace-pre-line font-medium">
                {activePlan.tasksText || 'Chưa có phân công nhiệm vụ cụ thể.'}
              </div>
            </div>
          </div>

          {/* 5. Hoạt động trọng tâm */}
          <div className="p-5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
            <h4 className="font-extrabold text-purple-900 uppercase text-xs flex items-center gap-1.5 pb-2 border-b border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              5. Các hoạt động trải nghiệm & phong trào thi đua nổi bật trong tháng
            </h4>

            {activePlan.activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có hoạt động nổi bật.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {activePlan.activities.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs flex items-center gap-2.5 text-xs text-slate-800 font-medium"
                  >
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Kết quả đạt được & Nhận xét rút kinh nghiệm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-900 uppercase text-[11px]">
                6. Đánh giá kết quả đạt được
              </div>
              <p className="text-slate-700 leading-relaxed">
                {activePlan.result || 'Đang cập nhật đánh giá kết quả thực hiện...'}
              </p>
            </div>

            <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-200 space-y-2">
              <div className="font-bold text-sky-900 uppercase text-[11px]">
                7. Nhận xét & Rút kinh nghiệm của GVCN
              </div>
              <p className="text-slate-700 leading-relaxed">
                {activePlan.comments || 'Chưa ghi nhận xét rút kinh nghiệm.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA KẾ HOẠCH THÁNG */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-purple-200" />
                <h3 className="font-bold text-base">
                  Chỉnh Sửa Kế Hoạch Tháng {editingPlan.month}/{editingPlan.year}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ điểm tháng:</label>
                <input
                  type="text"
                  required
                  value={formPlan.theme || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, theme: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu tháng:</label>
                <textarea
                  rows={2}
                  value={formPlan.goal || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, goal: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung trọng tâm:</label>
                <textarea
                  rows={2}
                  value={formPlan.content || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp thực hiện:</label>
                <textarea
                  rows={2}
                  value={formPlan.measures || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, measures: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhiệm vụ cụ thể:</label>
                <textarea
                  rows={3}
                  value={formPlan.tasksText || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, tasksText: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái:</label>
                  <select
                    value={formPlan.status}
                    onChange={(e) => setFormPlan({ ...formPlan, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value="Chưa thực hiện">Chưa thực hiện</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kết quả đạt được:</label>
                  <input
                    type="text"
                    value={formPlan.result || ''}
                    onChange={(e) => setFormPlan({ ...formPlan, result: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhận xét, rút kinh nghiệm:</label>
                <input
                  type="text"
                  value={formPlan.comments || ''}
                  onChange={(e) => setFormPlan({ ...formPlan, comments: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TẠO MỚI KẾ HOẠCH THÁNG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-base">Tạo Kế Hoạch Hoạt Động Tháng Mới</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tháng:</label>
                  <select
                    value={createForm.month}
                    onChange={(e) => setCreateForm({ ...createForm, month: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm:</label>
                  <select
                    value={createForm.year}
                    onChange={(e) => setCreateForm({ ...createForm, year: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value={2026}>Năm 2026</option>
                    <option value={2027}>Năm 2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chủ điểm tháng: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tiếp bước lên Đoàn - Tiến bước lên Đoàn"
                  value={createForm.theme}
                  onChange={(e) => setCreateForm({ ...createForm, theme: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu tháng:</label>
                <textarea
                  rows={2}
                  placeholder="Mục tiêu trọng tâm cần đạt được trong tháng..."
                  value={createForm.goal}
                  onChange={(e) => setCreateForm({ ...createForm, goal: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung trọng tâm:</label>
                <textarea
                  rows={2}
                  placeholder="Nội dung giáo dục cụ thể..."
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhiệm vụ cụ thể:</label>
                <textarea
                  rows={2}
                  placeholder="Nhiệm vụ của GVCN, cán bộ lớp, học sinh..."
                  value={createForm.tasksText}
                  onChange={(e) => setCreateForm({ ...createForm, tasksText: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp thực hiện:</label>
                <textarea
                  rows={2}
                  placeholder="Biện pháp triển khai thực hiện..."
                  value={createForm.measures}
                  onChange={(e) => setCreateForm({ ...createForm, measures: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Dynamic Activities */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hoạt động trọng tâm:</label>
                <div className="space-y-1.5 mb-2">
                  {createForm.activities.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-slate-800">{act}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm({
                            ...createForm,
                            activities: createForm.activities.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Thêm hoạt động mới..."
                    value={newActivityInput}
                    onChange={(e) => setNewActivityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newActivityInput.trim()) {
                          setCreateForm({
                            ...createForm,
                            activities: [...createForm.activities, newActivityInput.trim()],
                          });
                          setNewActivityInput('');
                        }
                      }
                    }}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newActivityInput.trim()) {
                        setCreateForm({
                          ...createForm,
                          activities: [...createForm.activities, newActivityInput.trim()],
                        });
                        setNewActivityInput('');
                      }
                    }}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold border border-indigo-200"
                  >
                    + Thêm
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái:</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value="Chưa thực hiện">Chưa thực hiện</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kết quả dự kiến/đạt được:</label>
                  <input
                    type="text"
                    value={createForm.result}
                    onChange={(e) => setCreateForm({ ...createForm, result: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Nhận xét:</label>
                <input
                  type="text"
                  value={createForm.comments}
                  onChange={(e) => setCreateForm({ ...createForm, comments: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Lưu kế hoạch tháng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SAO CHÉP KẾ HOẠCH THÁNG */}
      {showCopyModal && activePlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-sky-200" />
                <h3 className="font-bold text-base">Sao Chép Kế Hoạch Tháng</h3>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Sao chép cấu trúc mục tiêu, biện pháp và hoạt động từ{' '}
                <strong>
                  Tháng {activePlan.month}/{activePlan.year}
                </strong>{' '}
                sang một tháng mới:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tháng đích:</label>
                  <select
                    value={copyTargetMonth}
                    onChange={(e) => setCopyTargetMonth(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm:</label>
                  <select
                    value={copyTargetYear}
                    onChange={(e) => setCopyTargetYear(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value={2026}>Năm 2026</option>
                    <option value={2027}>Năm 2027</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCopy}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20"
                >
                  Xác nhận sao chép
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI ASSIST MODAL */}
      <AIPlanAssistModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        type="monthly-activities"
        targetMonth={activePlan?.month || 10}
        onApplyMonthlyActivities={handleApplyAISuggestions}
      />
    </div>
  );
};
