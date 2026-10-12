import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Users,
  School,
  GraduationCap,
  Calendar,
  BookOpen,
  Sparkles,
  X,
  Save,
  Check,
  LayoutGrid,
  List,
  Phone,
  Mail,
  ArrowRight,
  UserCheck,
  MapPin,
  Clock,
  Target,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { AcademicDepartment, TeacherProfile } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

const COMMON_SUBJECTS = [
  'Toán',
  'Tin học',
  'Ngữ văn',
  'Lịch sử và Địa lí',
  'Giáo dục công dân',
  'Khoa học tự nhiên',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Công nghệ',
  'Tiếng Anh',
  'Âm nhạc',
  'Mĩ thuật',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm',
];

export const DepartmentManagementMasterView: React.FC = () => {
  const {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    teachers,
    updateTeacher,
    school,
    currentUser,
    setActiveMenu,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AcademicDepartment | null>(null);
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<AcademicDepartment | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AcademicDepartment | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AcademicDepartment>>({
    code: '',
    name: '',
    description: '',
    leaderTeacherId: '',
    leaderTeacherName: '',
    deputyTeacherId: '',
    deputyTeacherName: '',
    subjects: ['Toán', 'Tin học'],
    meetingSchedule: 'Chiều thứ Năm (tuần 2 & 4 hàng tháng)',
    room: 'Phòng 201 - Nhà Hiệu bộ',
    goals: '',
  });

  // State for member assignment inside detail drawer
  const [assigningTeacherId, setAssigningTeacherId] = useState<string>('');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.leaderTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.deputyTeacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.subjects.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSubject =
        subjectFilter === 'ALL' || d.subjects.includes(subjectFilter);

      return matchSearch && matchSubject;
    });
  }, [departments, searchTerm, subjectFilter]);

  // Statistics
  const totalDepartments = departments.length;
  const totalTeachersInDepts = teachers.length;
  const allAssignedSubjects = useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => d.subjects.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [departments]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextCode = `TCM-0${departments.length + 1}`;
    setFormData({
      code: nextCode,
      name: '',
      description: '',
      leaderTeacherId: teachers[0]?.id || '',
      leaderTeacherName: teachers[0]?.fullName || '',
      deputyTeacherId: '',
      deputyTeacherName: '',
      subjects: ['Toán', 'Tin học'],
      meetingSchedule: 'Chiều thứ Năm (tuần 2 & 4 hàng tháng)',
      room: 'Phòng sinh hoạt chuyên môn',
      goals: '',
    });
    setEditingDepartment(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (d: AcademicDepartment) => {
    setEditingDepartment(d);
    setFormData({ ...d });
    setIsFormModalOpen(true);
  };

  // Submit Add/Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      showMsg('Vui lòng nhập tên tổ chuyên môn!', 'error');
      return;
    }

    // Resolve leader name from teachers if ID was chosen
    const leaderTeacher = teachers.find((t) => t.id === formData.leaderTeacherId);
    const leaderName = leaderTeacher ? leaderTeacher.fullName : (formData.leaderTeacherName || 'Chưa gán');

    const deputyTeacher = teachers.find((t) => t.id === formData.deputyTeacherId);
    const deputyName = deputyTeacher ? deputyTeacher.fullName : (formData.deputyTeacherName || '');

    const payload = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code?.trim() || `TCM-${Date.now().toString().slice(-4)}`,
      leaderTeacherName: leaderName,
      deputyTeacherName: deputyName,
      subjects: formData.subjects || [],
    };

    if (editingDepartment) {
      const res = updateDepartment(editingDepartment.id, payload);
      if (res.success) {
        showMsg('Cập nhật tổ chuyên môn thành công!');
        setIsFormModalOpen(false);
      } else {
        showMsg(res.message, 'error');
      }
    } else {
      const res = addDepartment(payload as any);
      if (res.success) {
        showMsg('Thêm mới tổ chuyên môn thành công!');
        setIsFormModalOpen(false);
      } else {
        showMsg(res.message, 'error');
      }
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const res = deleteDepartment(deleteCandidate.id);
    if (res.success) {
      showMsg(res.message);
    } else {
      showMsg(res.message, 'error');
    }
    setDeleteCandidate(null);
  };

  // Toggle subject selection in form
  const handleToggleSubject = (sub: string) => {
    const current = formData.subjects || [];
    if (current.includes(sub)) {
      setFormData({ ...formData, subjects: current.filter((s) => s !== sub) });
    } else {
      setFormData({ ...formData, subjects: [...current, sub] });
    }
  };

  // Assign a teacher to this department
  const handleAssignTeacherToDept = (deptName: string) => {
    if (!assigningTeacherId) return;
    const target = teachers.find((t) => t.id === assigningTeacherId);
    if (!target) return;

    updateTeacher(assigningTeacherId, { department: deptName });
    showMsg(`Đã phân bổ giáo viên ${target.fullName} vào ${deptName}!`);
    setAssigningTeacherId('');
  };

  // Remove teacher from this department (set to Chưa gán)
  const handleRemoveTeacherFromDept = (t: TeacherProfile) => {
    updateTeacher(t.id, { department: 'Chưa phân tổ' });
    showMsg(`Đã chuyển giáo viên ${t.fullName} sang trạng thái Chưa phân tổ.`);
  };

  // Export departments to Excel (.xlsx)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã tổ',
      'Tên tổ chuyên môn',
      'Tổ trưởng',
      'Tổ phó',
      'Số giáo viên',
      'Môn học phụ trách',
      'Lịch sinh hoạt',
      'Phòng sinh hoạt',
      'Mục tiêu năm học',
      'Mô tả nhiệm vụ',
    ];

    const rows = filteredDepartments.map((d, idx) => {
      const memberCount = teachers.filter((t) => t.department === d.name).length;
      return [
        idx + 1,
        d.code,
        d.name,
        d.leaderTeacherName,
        d.deputyTeacherName || '—',
        memberCount,
        d.subjects.join(', '),
        d.meetingSchedule || '—',
        d.room || '—',
        d.goals || '—',
        d.description || '—',
      ];
    });

    const aoa = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 32 },
      { wch: 30 },
      { wch: 24 },
      { wch: 35 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'To_Chuyen_Mon');
    XLSX.writeFile(
      wb,
      `Danh_Sach_To_Chuyen_Mon_${school.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showMsg('Đã xuất danh sách tổ chuyên môn ra file Excel (.xlsx) thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <Layers className="w-5 h-5 text-indigo-600" />
              QUẢN LÝ TỔ CHUYÊN MÔN
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {totalDepartments} tổ chuyên môn
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {school.name}
            </span>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                🛡️ QUẢN TRỊ: Toàn quyền
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                👔 BGH: Giám sát (Chỉ xem)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xây dựng cơ cấu tổ chuyên môn, bổ nhiệm tổ trưởng - tổ phó, phân bổ giáo viên và theo dõi kế hoạch sinh hoạt chuyên môn theo Chương trình GDPT 2018
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm tổ chuyên môn
            </button>
          )}

          <button
            onClick={() => setActiveMenu('teachers')}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Đến danh mục hồ sơ giáo viên"
          >
            <Users className="w-4 h-4 text-purple-600" /> Danh mục giáo viên →
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Xuất file Excel danh sách tổ chuyên môn"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Tổ chuyên môn</div>
            <div className="text-xl font-black text-slate-900">{totalDepartments} tổ</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Hoạt động nề nếp</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Giáo viên trực thuộc</div>
            <div className="text-xl font-black text-purple-900">{totalTeachersInDepts} cán bộ, GV</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Đã phân bổ 100%</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Môn học trực thuộc</div>
            <div className="text-xl font-black text-sky-900">{allAssignedSubjects.length} môn học</div>
            <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Bao phủ toàn cấp THCS</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Tổ trưởng - Tổ phó</div>
            <div className="text-xl font-black text-emerald-900">
              {departments.filter((d) => d.leaderTeacherName).length}/{departments.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Đã bổ nhiệm đầy đủ</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên tổ, mã tổ, tổ trưởng, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">-- Tất cả môn học --</option>
              {allAssignedSubjects.map((s) => (
                <option key={s} value={s}>
                  Môn: {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-slate-500 font-medium">
            Hiển thị <strong>{filteredDepartments.length}</strong> / {departments.length} tổ
          </div>
        </div>
      </div>

      {/* Main Content: Cards View or Table View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const memberTeachers = teachers.filter((t) => t.department === dept.name);
            const homeroomMembers = memberTeachers.filter((t) => t.isHomeroom).length;
            const mastersCount = memberTeachers.filter((t) => t.degree === 'Thạc sĩ' || t.degree === 'Tiến sĩ').length;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md uppercase">
                        {dept.code}
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-1">
                        {dept.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
                        {memberTeachers.length} GV
                      </span>
                    </div>
                  </div>

                  {dept.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>
                  )}

                  {/* Leader and Deputy info */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Tổ trưởng:
                      </span>
                      <span className="font-bold text-slate-900">
                        {dept.leaderTeacherName || 'Chưa phân công'}
                      </span>
                    </div>

                    {dept.deputyTeacherName && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Tổ phó:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {dept.deputyTeacherName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subjects badges */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      Môn học trực thuộc ({dept.subjects.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dept.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meeting and Room */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    {dept.meetingSchedule && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{dept.meetingSchedule}</span>
                      </div>
                    )}
                    {dept.room && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{dept.room}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary pills */}
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold">
                      {homeroomMembers} GVCN
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                      {mastersCount} Thạc sĩ
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDeptForDetail(dept)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Chi tiết & Thành viên
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(dept)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa tổ chuyên môn"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tổ chuyên môn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã tổ</th>
                  <th className="py-3 px-4">Tổ chuyên môn</th>
                  <th className="py-3 px-4">Tổ trưởng</th>
                  <th className="py-3 px-4">Tổ phó</th>
                  <th className="py-3 px-4">Số GV</th>
                  <th className="py-3 px-4">Môn học trực thuộc</th>
                  <th className="py-3 px-4">Lịch sinh hoạt</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => {
                  const memberCount = teachers.filter((t) => t.department === dept.name).length;
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {dept.code}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">
                        {dept.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {dept.leaderTeacherName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {dept.deputyTeacherName || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {memberCount} GV
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {dept.subjects.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                          {dept.subjects.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{dept.subjects.length - 3} môn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {dept.meetingSchedule || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDeptForDetail(dept)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(dept)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteCandidate(dept)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Xóa tổ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer / Modal: View Department Detail & Member Management */}
      {selectedDeptForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 my-auto">
            {/* Modal header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {selectedDeptForDetail.code}
                    </span>
                    <h2 className="text-lg font-black text-slate-900">
                      {selectedDeptForDetail.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hồ sơ chi tiết và danh sách giáo viên thành viên trực thuộc tổ chuyên môn
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department key info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 uppercase text-[11px] text-indigo-800">
                  Ban lãnh đạo tổ:
                </div>
                <div>
                  <span className="text-slate-500">Tổ trưởng:</span>{' '}
                  <strong className="text-slate-900">{selectedDeptForDetail.leaderTeacherName}</strong>
                </div>
                {selectedDeptForDetail.deputyTeacherName && (
                  <div>
                    <span className="text-slate-500">Tổ phó:</span>{' '}
                    <strong className="text-slate-900">{selectedDeptForDetail.deputyTeacherName}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Phòng sinh hoạt:</span>{' '}
                  <span className="font-medium">{selectedDeptForDetail.room || 'Phòng hội đồng'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Lịch họp định kỳ:</span>{' '}
                  <span className="font-medium">{selectedDeptForDetail.meetingSchedule || 'Theo kế hoạch'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 uppercase text-[11px] text-indigo-800">
                  Môn học & Mục tiêu trọng tâm:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedDeptForDetail.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
                {selectedDeptForDetail.goals && (
                  <p className="text-[11px] text-slate-600 leading-relaxed italic pt-1">
                    "{selectedDeptForDetail.goals}"
                  </p>
                )}
              </div>
            </div>

            {/* Member Teachers List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Danh sách giáo viên thành viên (
                  {teachers.filter((t) => t.department === selectedDeptForDetail.name).length} người):
                </h3>

                {isAdmin && (
                  <div className="flex items-center gap-2 text-xs">
                    <select
                      value={assigningTeacherId}
                      onChange={(e) => setAssigningTeacherId(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">-- Chọn GV để thêm vào tổ --</option>
                      {teachers
                        .filter((t) => t.department !== selectedDeptForDetail.name)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.department}) - {t.mainSubject}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleAssignTeacherToDept(selectedDeptForDetail.name)}
                      disabled={!assigningTeacherId}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Thêm vào tổ
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Mã GV</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Môn chính</th>
                      <th className="py-2.5 px-3">Trình độ</th>
                      <th className="py-2.5 px-3">Chủ nhiệm</th>
                      <th className="py-2.5 px-3">Chức vụ</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Chuyển tổ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers
                      .filter((t) => t.department === selectedDeptForDetail.name)
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {t.teacherCode}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {t.fullName}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-purple-900">
                            {t.mainSubject}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{t.degree}</td>
                          <td className="py-2.5 px-3">
                            {t.isHomeroom ? (
                              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                                Lớp {t.homeroomClassName}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{t.duty || 'Giáo viên'}</td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveTeacherFromDept(t)}
                                className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Rút khỏi tổ chuyên môn này"
                              >
                                Rút khỏi tổ
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Department */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in duration-150 my-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {editingDepartment ? 'Chỉnh sửa Tổ chuyên môn' : 'Thêm mới Tổ chuyên môn'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã tổ chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TCM-TT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên tổ chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tổ Toán - Tin học"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tổ trưởng chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.leaderTeacherId}
                    onChange={(e) => {
                      const t = teachers.find((tc) => tc.id === e.target.value);
                      setFormData({
                        ...formData,
                        leaderTeacherId: e.target.value,
                        leaderTeacherName: t ? t.fullName : '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Chọn giáo viên làm Tổ trưởng --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.teacherCode}) - Môn: {t.mainSubject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tổ phó chuyên môn (nếu có)
                  </label>
                  <select
                    value={formData.deputyTeacherId}
                    onChange={(e) => {
                      const t = teachers.find((tc) => tc.id === e.target.value);
                      setFormData({
                        ...formData,
                        deputyTeacherId: e.target.value,
                        deputyTeacherName: t ? t.fullName : '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Chưa gán tổ phó --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.teacherCode}) - Môn: {t.mainSubject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lịch họp định kỳ</label>
                  <input
                    type="text"
                    placeholder="VD: Chiều thứ Năm (tuần 2 & 4 hàng tháng)"
                    value={formData.meetingSchedule}
                    onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng sinh hoạt tổ</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng 201 - Nhà Hiệu bộ"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Subject Selection Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Các môn học trực thuộc tổ chuyên môn ({formData.subjects?.length || 0} môn được chọn)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto custom-scrollbar">
                  {COMMON_SUBJECTS.map((sub) => {
                    const isChecked = formData.subjects?.includes(sub);
                    return (
                      <label
                        key={sub}
                        className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-100 text-indigo-900 font-bold' : 'hover:bg-slate-200/60 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(sub)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu năm học của tổ</label>
                <input
                  type="text"
                  placeholder="VD: 100% GV ứng dụng CNTT; thi đua dạy giỏi; bồi dưỡng học sinh giỏi..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả & Nhiệm vụ chuyên môn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chức năng, nhiệm vụ của tổ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {editingDepartment ? 'Lưu thay đổi' : 'Tạo tổ chuyên môn'}
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
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tổ chuyên môn"
        message={`Bạn có chắc chắn muốn xóa "${deleteCandidate?.name}" (${deleteCandidate?.code}) khỏi hệ thống?`}
        confirmLabel="Xóa tổ chuyên môn"
        confirmVariant="danger"
      />
    </div>
  );
};
