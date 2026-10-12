import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Printer,
  Target,
  Users,
  Award,
  Filter,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YearlyPlanTask, PlanTaskStatus } from '../../types';
import { AIPlanAssistModal } from './AIPlanAssistModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface YearlyPlanViewProps {
  onOpenPrint?: () => void;
}

export const YearlyPlanView: React.FC<YearlyPlanViewProps> = ({ onOpenPrint }) => {
  const {
    yearlyPlan,
    updateYearlyPlan,
    addYearlyPlanTask,
    updateYearlyPlanTask,
    deleteYearlyPlanTask,
    currentClass,
    currentSchoolYear,
    currentUser,
    canEditCurrentClass,
  } = useApp();

  const isAuthorized = canEditCurrentClass;

  // Task filter & search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<YearlyPlanTask | null>(null);

  // Edit general goals state
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [generalGoalDraft, setGeneralGoalDraft] = useState(yearlyPlan.generalGoal);
  const [targetsDraft, setTargetsDraft] = useState({ ...yearlyPlan.targetsSummary });

  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<YearlyPlanTask | null>(null);
  const [taskForm, setTaskForm] = useState<Omit<YearlyPlanTask, 'id'>>({
    category: 'dao-duc',
    title: '',
    target: '',
    measures: '',
    timeframe: 'Cả năm học',
    assignee: 'GVCN, Ban cán sự lớp',
    status: 'Chưa thực hiện',
    result: '',
    notes: '',
  });

  // AI Modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiModalType, setAiModalType] = useState<'yearly-task' | 'goal-analysis'>('yearly-task');

  // Completion calculation
  const totalTasks = yearlyPlan.tasks.length;
  const completedTasks = yearlyPlan.tasks.filter((t) => t.status === 'Đã hoàn thành').length;
  const inProgressTasks = yearlyPlan.tasks.filter((t) => t.status === 'Đang thực hiện').length;
  const pendingTasks = yearlyPlan.tasks.filter((t) => t.status === 'Chưa thực hiện').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Save General Goals
  const handleSaveGoals = () => {
    updateYearlyPlan({
      generalGoal: generalGoalDraft,
      targetsSummary: targetsDraft,
    });
    setIsEditingGoals(false);
  };

  // Open Task Modals
  const openAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      category: 'hoc-tap',
      title: '',
      target: '',
      measures: '',
      timeframe: 'Cả năm học',
      assignee: 'GVCN, Ban cán sự lớp',
      status: 'Chưa thực hiện',
      result: '',
      notes: '',
    });
    setShowTaskModal(true);
  };

  const openEditTask = (task: YearlyPlanTask) => {
    setEditingTask(task);
    setTaskForm({
      category: task.category,
      title: task.title,
      target: task.target,
      measures: task.measures,
      timeframe: task.timeframe,
      assignee: task.assignee,
      status: task.status,
      result: task.result || '',
      notes: task.notes || '',
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTask) {
      updateYearlyPlanTask(editingTask.id, taskForm);
    } else {
      addYearlyPlanTask(taskForm);
    }
    setShowTaskModal(false);
  };

  // Quick cycle status
  const handleCycleStatus = (task: YearlyPlanTask) => {
    if (!isAuthorized) return;
    const nextStatus: Record<PlanTaskStatus, PlanTaskStatus> = {
      'Chưa thực hiện': 'Đang thực hiện',
      'Đang thực hiện': 'Đã hoàn thành',
      'Đã hoàn thành': 'Chưa thực hiện',
    };
    updateYearlyPlanTask(task.id, { status: nextStatus[task.status] });
  };

  // Filter tasks
  const filteredTasks = yearlyPlan.tasks.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTarget = t.target.toLowerCase().includes(q);
      const matchMeasures = t.measures.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      if (!matchTitle && !matchTarget && !matchMeasures && !matchAssignee) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM NĂM HỌC {currentSchoolYear.code}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Lớp {currentClass?.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                GVCN: {currentClass?.homeroomTeacherName} • Căn cứ theo kế hoạch năm học của nhà trường và đặc thù lớp học
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAuthorized && (
            <>
              <button
                onClick={() => {
                  setAiModalType('yearly-task');
                  setShowAIModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all flex items-center gap-2"
                title="Sử dụng AI gợi ý nhiệm vụ sư phạm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                AI Gợi ý nhiệm vụ & biện pháp
              </button>

              <button
                onClick={openAddTask}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Thêm nhiệm vụ
              </button>
            </>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In kế hoạch năm
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tiến độ hoàn thành */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Tiến độ thực hiện kế hoạch:</span>
            <span className="text-sm font-black text-indigo-700">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1">
            <span>{completedTasks}/{totalTasks} nhiệm vụ hoàn thành</span>
            <span>{inProgressTasks} đang làm</span>
          </div>
        </div>

        {/* Card 2: Chỉ tiêu Rèn luyện */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Chỉ tiêu Rèn Luyện (Hạnh kiểm)
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {yearlyPlan.targetsSummary.conductGoodRate}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Phấn đấu không có học sinh chưa đạt
          </div>
        </div>

        {/* Card 3: Chỉ tiêu Học tập */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Chỉ tiêu Học Tập (Học lực)
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {yearlyPlan.targetsSummary.academicGoodRate}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-0.5">
            Duy trì phong trào tự học và phụ đạo
          </div>
        </div>

        {/* Card 4: Danh hiệu Chi đội */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Danh hiệu Thi đua Phấn đấu
          </div>
          <div className="text-sm font-black text-purple-900 mt-1">
            {yearlyPlan.targetsSummary.pioneerTitle}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Chuyên cần: {yearlyPlan.targetsSummary.attendanceRate}
          </div>
        </div>
      </div>

      {/* General Goals Card (Có thể sửa) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              I. MỤC TIÊU PHẤN ĐẤU CẢ NĂM HỌC
            </h3>
          </div>

          {isAuthorized && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAiModalType('goal-analysis');
                  setShowAIModal(true);
                }}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-colors flex items-center gap-1.5"
                title="Sử dụng AI phân tích lớp và gợi ý mục tiêu, chỉ tiêu năm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Phân tích mục tiêu
              </button>

              <button
                onClick={() => {
                  if (isEditingGoals) {
                    handleSaveGoals();
                  } else {
                    setGeneralGoalDraft(yearlyPlan.generalGoal);
                    setTargetsDraft({ ...yearlyPlan.targetsSummary });
                    setIsEditingGoals(true);
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isEditingGoals ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-600" /> Lưu mục tiêu
                  </>
                ) : (
                  <>
                    <Edit className="w-3.5 h-3.5" /> Sửa mục tiêu
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isEditingGoals ? (
          <div className="space-y-3 text-xs pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mục tiêu chung:</label>
              <textarea
                rows={3}
                value={generalGoalDraft}
                onChange={(e) => setGeneralGoalDraft(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu rèn luyện:</label>
                <input
                  type="text"
                  value={targetsDraft.conductGoodRate}
                  onChange={(e) => setTargetsDraft({ ...targetsDraft, conductGoodRate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu học tập:</label>
                <input
                  type="text"
                  value={targetsDraft.academicGoodRate}
                  onChange={(e) => setTargetsDraft({ ...targetsDraft, academicGoodRate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Danh hiệu chi đội:</label>
                <input
                  type="text"
                  value={targetsDraft.pioneerTitle}
                  onChange={(e) => setTargetsDraft({ ...targetsDraft, pioneerTitle: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tỷ lệ chuyên cần:</label>
                <input
                  type="text"
                  value={targetsDraft.attendanceRate}
                  onChange={(e) => setTargetsDraft({ ...targetsDraft, attendanceRate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {yearlyPlan.generalGoal}
          </p>
        )}
      </div>

      {/* II. DANH SÁCH NHIỆM VỤ, CHỈ TIÊU & BIỆN PHÁP NĂM */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            II. CÁC NHIỆM VỤ TRỌNG TÂM, CHỈ TIÊU VÀ BIỆN PHÁP THỰC HIỆN ({yearlyPlan.tasks.length} nhiệm vụ)
          </h3>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhiệm vụ, chỉ tiêu..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-slate-400 font-semibold whitespace-nowrap">Lọc mảng:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'dao-duc', label: 'Đạo đức' },
              { id: 'hoc-tap', label: 'Học tập' },
              { id: 'lao-dong', label: 'Lao động' },
              { id: 'phong-trao', label: 'Phong trào' },
              { id: 'phu-huynh', label: 'Phụ huynh' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors text-[11px] ${
                  categoryFilter === cat.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <span className="text-slate-400 font-semibold whitespace-nowrap ml-2">Trạng thái:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'Đang thực hiện', label: 'Đang làm' },
              { id: 'Đã hoàn thành', label: 'Đã xong' },
              { id: 'Chưa thực hiện', label: 'Chưa làm' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors text-[11px] ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards / Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[220px]">Nhiệm vụ & Mảng công tác</th>
                  <th className="py-3 px-4 min-w-[180px]">Chỉ tiêu phấn đấu</th>
                  <th className="py-3 px-4 min-w-[240px]">Biện pháp thực hiện</th>
                  <th className="py-3 px-4 min-w-[130px]">Thời gian & Phụ trách</th>
                  <th className="py-3 px-4 min-w-[130px] text-center">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[160px]">Kết quả đạt được</th>
                  <th className="py-3 px-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, idx) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs leading-snug">
                          {task.title}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {task.category === 'dao-duc'
                            ? 'Giáo dục đạo đức'
                            : task.category === 'hoc-tap'
                            ? 'Chất lượng học tập'
                            : task.category === 'lao-dong'
                            ? 'Lao động, vệ sinh'
                            : task.category === 'phong-trao'
                            ? 'Phong trào Đội'
                            : task.category === 'phu-huynh'
                            ? 'Phối hợp phụ huynh'
                            : 'Mảng khác'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed text-[11px]">
                        {task.target}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed text-[11px]">
                        {task.measures}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="font-bold text-slate-800">{task.timeframe}</div>
                        <div className="text-slate-500 mt-0.5">{task.assignee}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleCycleStatus(task)}
                          disabled={!isAuthorized}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 mx-auto ${
                            task.status === 'Đã hoàn thành'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : task.status === 'Đang thực hiện'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                          title={isAuthorized ? 'Bấm để chuyển trạng thái' : undefined}
                        >
                          {task.status === 'Đã hoàn thành' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : task.status === 'Đang thực hiện' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                          )}
                          <span>{task.status}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-600 italic">
                        {task.result || 'Đang theo dõi...'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isAuthorized && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditTask(task)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                              title="Sửa nhiệm vụ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa nhiệm vụ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA NHIỆM VỤ NĂM */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-5 h-5 text-sky-200" />
                <h3 className="font-bold text-base">
                  {editingTask ? 'Chỉnh Sửa Nhiệm Vụ Kế Hoạch Năm' : 'Thêm Nhiệm Vụ Kế Hoạch Năm Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mảng công tác:</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="dao-duc">Giáo dục đạo đức, nề nếp</option>
                  <option value="hoc-tap">Chất lượng học tập & tự học</option>
                  <option value="lao-dong">Lao động, vệ sinh & tài sản</option>
                  <option value="phong-trao">Hoạt động Đội & phong trào</option>
                  <option value="phu-huynh">Phối hợp phụ huynh học sinh</option>
                  <option value="khac">Mảng công tác khác</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên nhiệm vụ: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="VD: Nâng cao chất lượng học tập và phụ đạo học sinh yếu..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu phấn đấu:</label>
                <input
                  type="text"
                  value={taskForm.target}
                  onChange={(e) => setTaskForm({ ...taskForm, target: e.target.value })}
                  placeholder="VD: Học lực Tốt đạt ≥ 25%, không có học sinh chưa đạt..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp thực hiện:</label>
                <textarea
                  rows={3}
                  value={taskForm.measures}
                  onChange={(e) => setTaskForm({ ...taskForm, measures: e.target.value })}
                  placeholder="Mô tả cụ thể các biện pháp sư phạm và phối hợp..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian thực hiện:</label>
                  <input
                    type="text"
                    value={taskForm.timeframe}
                    onChange={(e) => setTaskForm({ ...taskForm, timeframe: e.target.value })}
                    placeholder="VD: Cả năm học, HKI..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách:</label>
                  <input
                    type="text"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    placeholder="VD: GVCN, Ban cán sự..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái:</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value="Chưa thực hiện">Chưa thực hiện</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kết quả đánh giá:</label>
                  <input
                    type="text"
                    value={taskForm.result || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, result: e.target.value })}
                    placeholder="Ghi nhận kết quả đạt được..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editingTask ? 'Lưu thay đổi' : 'Thêm nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SUGGESTION MODAL */}
      <AIPlanAssistModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        type={aiModalType}
        onApplyYearlyTask={(task) => {
          addYearlyPlanTask(task);
        }}
        onApplyGoalAnalysis={(generalGoal, targets) => {
          updateYearlyPlan({
            generalGoal,
            targetsSummary: targets,
          });
          setGeneralGoalDraft(generalGoal);
          setTargetsDraft(targets);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (deleteCandidate) {
            deleteYearlyPlanTask(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        title="Xác nhận xóa nhiệm vụ kế hoạch năm"
        message={`Bạn có chắc chắn muốn xóa nhiệm vụ "${deleteCandidate?.title}" khỏi kế hoạch năm học?`}
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
      />
    </div>
  );
};
