import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  CalendarRange,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduleWorkItem, PlanTaskStatus } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface ScheduleViewProps {
  onOpenPrint?: () => void;
}

type ViewMode = 'list' | 'month' | 'week';

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenPrint }) => {
  const {
    scheduleWorkItems,
    addScheduleWorkItem,
    updateScheduleWorkItem,
    deleteScheduleWorkItem,
    currentClass,
    currentSchoolYear,
    currentUser,
    canEditCurrentClass,
  } = useApp();

  const isAuthorized = canEditCurrentClass;

  // View mode: 'list' | 'month' | 'week'
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [deleteCandidate, setDeleteCandidate] = useState<ScheduleWorkItem | null>(null);

  // Month navigation for calendar view
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleWorkItem | null>(null);
  const [formData, setFormData] = useState<Omit<ScheduleWorkItem, 'id' | 'createdAt'>>({
    classId: currentClass?.id || 'class-7-1',
    schoolYearId: currentSchoolYear.id,
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    title: '',
    weekNumber: 5,
    targetAudience: 'Toàn thể học sinh lớp 7/1',
    assignee: 'GVCN Lê Đức Minh',
    status: 'Chưa thực hiện',
    priority: 'Trung bình',
    notes: '',
  });

  // Calculate statistics
  const totalItems = scheduleWorkItems.length;
  const completedItems = scheduleWorkItems.filter((i) => i.status === 'Đã hoàn thành').length;
  const inProgressItems = scheduleWorkItems.filter((i) => i.status === 'Đang thực hiện').length;
  const pendingItems = scheduleWorkItems.filter((i) => i.status === 'Chưa thực hiện').length;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Open Modals
  const openAdd = () => {
    setEditingItem(null);
    setFormData({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      date: '2026-10-15',
      time: '07:30',
      title: '',
      weekNumber: 6,
      targetAudience: 'Toàn thể học sinh lớp 7/1',
      assignee: 'GVCN Lê Đức Minh',
      status: 'Chưa thực hiện',
      priority: 'Trung bình',
      notes: '',
    });
    setShowModal(true);
  };

  const openEdit = (item: ScheduleWorkItem) => {
    setEditingItem(item);
    setFormData({
      classId: item.classId,
      schoolYearId: item.schoolYearId,
      date: item.date,
      time: item.time || '07:30',
      title: item.title,
      weekNumber: item.weekNumber,
      targetAudience: item.targetAudience,
      assignee: item.assignee,
      status: item.status,
      priority: item.priority || 'Trung bình',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      updateScheduleWorkItem(editingItem.id, formData);
    } else {
      addScheduleWorkItem(formData);
    }
    setShowModal(false);
  };

  // Cycle Status
  const handleCycleStatus = (item: ScheduleWorkItem) => {
    if (!isAuthorized) return;
    const nextStatus: Record<PlanTaskStatus, PlanTaskStatus> = {
      'Chưa thực hiện': 'Đang thực hiện',
      'Đang thực hiện': 'Đã hoàn thành',
      'Đã hoàn thành': 'Chưa thực hiện',
    };
    updateScheduleWorkItem(item.id, { status: nextStatus[item.status] });
  };

  // Filter items
  const filteredItems = scheduleWorkItems
    .filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (selectedWeek !== 'all' && i.weekNumber !== selectedWeek) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = i.title.toLowerCase().includes(q);
        const matchTarget = i.targetAudience.toLowerCase().includes(q);
        const matchAssignee = i.assignee.toLowerCase().includes(q);
        const matchDate = i.date.includes(q);
        if (!matchTitle && !matchTarget && !matchAssignee && !matchDate) return false;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Weeks range 1..35
  const weekNumbers = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  LỊCH CÔNG VIỆC CHỦ NHIỆM & HOẠT ĐỘNG LỚP
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {totalItems} công việc
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lịch tuần, lịch tháng, theo dõi tiến độ thực hiện các công việc trong năm học
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher: Danh sách / Lịch tháng / Lịch tuần */}
          <div className="p-1 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'month'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Lịch tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Lịch tuần
            </button>
          </div>

          {isAuthorized && (
            <button
              onClick={openAdd}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm công việc
            </button>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In lịch công việc
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Tiến độ hoàn thành:</span>
            <span className="text-sm font-black text-sky-700">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1">
            <span>{completedItems} việc đã xong</span>
            <span>{totalItems} tổng cộng</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đã hoàn thành
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedItems}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Công việc đúng hạn</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đang thực hiện
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{inProgressItems}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đang triển khai tuần này</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Chưa thực hiện
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">{pendingItems}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kế hoạch các tuần tới</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nội dung, người phụ trách..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Lọc trạng thái:</span>
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
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}

          <span className="text-slate-400 font-semibold whitespace-nowrap ml-2">Tuần:</span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option value="all">Tất cả tuần</option>
            {weekNumbers.slice(0, 20).map((w) => (
              <option key={w} value={w}>
                Tuần {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. VIEW MODE: DANH SÁCH (LIST VIEW) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-28">Ngày & Giờ</th>
                  <th className="py-3 px-4 min-w-[240px]">Nội dung công việc</th>
                  <th className="py-3 px-4 min-w-[80px] text-center">Tuần</th>
                  <th className="py-3 px-4 min-w-[180px]">Đối tượng tham gia</th>
                  <th className="py-3 px-4 min-w-[150px]">Người phụ trách</th>
                  <th className="py-3 px-4 min-w-[130px] text-center">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[140px]">Ghi chú</th>
                  <th className="py-3 px-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy công việc nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{item.date}</div>
                        {item.time && (
                          <div className="text-[10px] text-slate-400">{item.time}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs leading-snug">
                          {item.title}
                        </div>
                        {item.priority === 'Cao' && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-rose-100 text-rose-800">
                            Ưu tiên cao
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          Tuần {item.weekNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed text-[11px]">
                        {item.targetAudience}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-900 text-[11px]">
                        {item.assignee}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleCycleStatus(item)}
                          disabled={!isAuthorized}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 mx-auto ${
                            item.status === 'Đã hoàn thành'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'Đang thực hiện'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                          title={isAuthorized ? 'Bấm để đổi trạng thái' : undefined}
                        >
                          {item.status === 'Đã hoàn thành' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : item.status === 'Đang thực hiện' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                          )}
                          <span>{item.status}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 italic text-[11px]">
                        {item.notes || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isAuthorized && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                              title="Sửa công việc"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa công việc"
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
      )}

      {/* 2. VIEW MODE: LỊCH THÁNG (MONTH CALENDAR) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">
              THÁNG {month + 1} NĂM {year}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7 Days Grid Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase">
            <div className="text-rose-600">Chủ Nhật</div>
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div className="text-sky-600">Thứ Bảy</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayItems = scheduleWorkItems.filter((it) => it.date === dateStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  className="min-h-[90px] p-2 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold text-xs text-slate-700">{dayNum}</div>
                  <div className="space-y-1 my-auto">
                    {dayItems.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => openEdit(it)}
                        className={`p-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-colors ${
                          it.status === 'Đã hoàn thành'
                            ? 'bg-emerald-100 text-emerald-800'
                            : it.status === 'Đang thực hiện'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                        title={it.title}
                      >
                        {it.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIEW MODE: LỊCH TUẦN (WEEK SCHEDULE VIEW) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">
              LỊCH HOẠT ĐỘNG THEO CÁC TUẦN HỌC (TUẦN 1 ĐẾN TUẦN 35)
            </h3>
            <span className="text-xs text-slate-500">Bấm vào công việc để xem chi tiết & cập nhật</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekNumbers.slice(0, 18).map((w) => {
              const weekItems = scheduleWorkItems.filter((it) => it.weekNumber === w);

              return (
                <div
                  key={`week-card-${w}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    weekItems.length > 0 ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-extrabold text-xs text-slate-900">Tuần học thứ {w}</span>
                    <span className="text-[10px] font-bold text-sky-700 px-2 py-0.5 rounded-full bg-white border border-sky-100">
                      {weekItems.length} công việc
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    {weekItems.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Chưa có lịch tuần này.</p>
                    ) : (
                      weekItems.map((it) => (
                        <div
                          key={it.id}
                          onClick={() => openEdit(it)}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-sky-400 cursor-pointer text-xs space-y-1"
                        >
                          <div className="font-bold text-slate-900 leading-snug">{it.title}</div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{it.date}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-sm font-bold ${
                                it.status === 'Đã hoàn thành'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : it.status === 'Đang thực hiện'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {it.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA CÔNG VIỆC */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-200" />
                <h3 className="font-bold text-base">
                  {editingItem ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung công việc: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Kiểm tra nề nếp truy bài 15 phút đầu giờ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày thực hiện:</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ (nếu có):</label>
                  <input
                    type="time"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuộc tuần học thứ:</label>
                  <select
                    value={formData.weekNumber}
                    onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {weekNumbers.map((w) => (
                      <option key={w} value={w}>
                        Tuần {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Độ ưu tiên:</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Cao">Cao</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thấp">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đối tượng tham gia:</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="VD: Toàn lớp, Ban cán sự..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách:</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="VD: GVCN, Lớp trưởng..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Chưa thực hiện">Chưa thực hiện</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú:</label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Thêm công việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (deleteCandidate) {
            deleteScheduleWorkItem(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        title="Xác nhận xóa công việc"
        message={`Bạn có chắc chắn muốn xóa công việc "${deleteCandidate?.title}" (ngày ${deleteCandidate?.date}) khỏi lịch công việc?`}
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
      />
    </div>
  );
};
