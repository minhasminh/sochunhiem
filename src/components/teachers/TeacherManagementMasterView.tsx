import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Phone,
  Mail,
  School,
  GraduationCap,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
  X,
  Save,
  Check,
  AlertTriangle,
  LayoutGrid,
  List,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  TeacherProfile,
  EmploymentStatus,
  AcademicDegree,
} from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { TeacherExcelImportModal } from './TeacherExcelImportModal';

const DEPARTMENT_LIST = [
  'Toán - Tin',
  'Ngữ văn - KHXH',
  'KHTN - Công nghệ',
  'Ngoại ngữ - Nghệ thuật',
  'Ban Giám Hiệu',
];

const DEGREE_LIST: AcademicDegree[] = [
  'Thạc sĩ',
  'Cử nhân ĐH Sư phạm',
  'Cử nhân Đại học',
  'Cao đẳng Sư phạm',
  'Tiến sĩ',
];

const STATUS_LIST: EmploymentStatus[] = [
  'Biên chế chính thức',
  'Hợp đồng',
  'Thỉnh giảng',
  'Tập sự',
];

export const TeacherManagementMasterView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachers,
    departments,
    classes,
    school,
    currentSchoolYear,
    currentUser,
    setActiveMenu,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => {
      if (d.name) set.add(d.name);
    });
    teachers.forEach((t) => {
      if (t.department && t.department !== 'Chưa phân tổ') set.add(t.department);
    });
    if (set.size === 0) {
      DEPARTMENT_LIST.forEach((d) => set.add(d));
    }
    return Array.from(set);
  }, [departments, teachers]);

  // State: filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [homeroomFilter, setHomeroomFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // State: modal & detail
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<TeacherProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TeacherProfile | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TeacherProfile>>({
    teacherCode: '',
    fullName: '',
    gender: 'Nam',
    birthDate: '',
    email: '',
    phone: '',
    idCardNumber: '',
    department: 'Toán - Tin',
    mainSubject: 'Toán',
    secondarySubject: '',
    degree: 'Cử nhân ĐH Sư phạm',
    employmentStatus: 'Biên chế chính thức',
    joinDate: '01/09/2020',
    isHomeroom: false,
    homeroomClassId: '',
    homeroomClassName: '',
    assignedClasses: [],
    duty: 'Giáo viên bộ môn',
    notes: '',
  });

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mainSubject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = departmentFilter === 'ALL' || t.department === departmentFilter;

      const matchHomeroom =
        homeroomFilter === 'ALL' ||
        (homeroomFilter === 'YES' && t.isHomeroom) ||
        (homeroomFilter === 'NO' && !t.isHomeroom);

      const matchStatus = statusFilter === 'ALL' || t.employmentStatus === statusFilter;

      return matchSearch && matchDept && matchHomeroom && matchStatus;
    });
  }, [teachers, searchTerm, departmentFilter, homeroomFilter, statusFilter]);

  // Statistics
  const totalTeachers = teachers.length;
  const homeroomCount = teachers.filter((t) => t.isHomeroom).length;
  const officialCount = teachers.filter((t) => t.employmentStatus === 'Biên chế chính thức').length;
  const masterDegreeCount = teachers.filter((t) => t.degree === 'Thạc sĩ' || t.degree === 'Tiến sĩ').length;

  const handleOpenAddModal = () => {
    const nextCode = `GV-${String(teachers.length + 1).padStart(3, '0')}`;
    setFormData({
      teacherCode: nextCode,
      fullName: '',
      gender: 'Nam',
      birthDate: '01/01/1990',
      email: '',
      phone: '',
      idCardNumber: '',
      department: 'Toán - Tin',
      mainSubject: 'Toán',
      secondarySubject: '',
      degree: 'Cử nhân ĐH Sư phạm',
      employmentStatus: 'Biên chế chính thức',
      joinDate: '01/09/2020',
      isHomeroom: false,
      homeroomClassId: '',
      homeroomClassName: '',
      assignedClasses: [],
      duty: 'Giáo viên bộ môn',
      notes: '',
    });
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: TeacherProfile) => {
    setEditingTeacher(t);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fullName.trim()) {
      showMsg('Vui lòng nhập họ và tên giáo viên!', 'error');
      return;
    }

    if (editingTeacher) {
      const res = updateTeacher(editingTeacher.id, formData);
      if (res.success) {
        showMsg('Cập nhật hồ sơ giáo viên thành công!');
        setIsModalOpen(false);
      } else {
        showMsg(res.message || 'Có lỗi xảy ra!', 'error');
      }
    } else {
      const res = addTeacher(formData as any);
      if (res.success) {
        showMsg('Thêm mới giáo viên thành công!');
        setIsModalOpen(false);
      } else {
        showMsg(res.message || 'Có lỗi xảy ra!', 'error');
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const res = deleteTeacher(deleteCandidate.id);
    if (res.success) {
      showMsg(`Đã xóa hồ sơ giáo viên ${deleteCandidate.fullName} thành công!`);
    } else {
      showMsg(res.message || 'Không thể xóa giáo viên!', 'error');
    }
    setDeleteCandidate(null);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã giáo viên',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'Email',
      'Số điện thoại',
      'Số CCCD/CMND',
      'Tổ chuyên môn',
      'Môn giảng dạy chính',
      'Môn phụ',
      'Trình độ chuyên môn',
      'Hình thức biên chế',
      'Ngày vào trường',
      'Chủ nhiệm lớp',
      'Chức vụ',
      'Ghi chú',
    ];

    const rows = filteredTeachers.map((t, idx) => [
      idx + 1,
      t.teacherCode,
      t.fullName,
      t.gender,
      t.birthDate,
      t.email,
      t.phone,
      t.idCardNumber || '',
      t.department,
      t.mainSubject,
      t.secondarySubject || '',
      t.degree,
      t.employmentStatus,
      t.joinDate,
      t.isHomeroom ? t.homeroomClassName || 'Có' : '',
      t.duty || '',
      t.notes || '',
    ]);

    const aoa = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 24 },
      { wch: 10 },
      { wch: 14 },
      { wch: 26 },
      { wch: 15 },
      { wch: 16 },
      { wch: 22 },
      { wch: 20 },
      { wch: 15 },
      { wch: 22 },
      { wch: 20 },
      { wch: 15 },
      { wch: 14 },
      { wch: 22 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_GV');
    XLSX.writeFile(
      wb,
      `Danh_Sach_Giao_Vien_${school.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showMsg('Đã xuất danh sách giáo viên ra file Excel (.xlsx) thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <Users className="w-5 h-5 text-purple-600" />
              HỒ SƠ GIÁO VIÊN TOÀN TRƯỜNG
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {totalTeachers} cán bộ, giáo viên
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              {school.name}
            </span>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                🛡️ QUẢN TRỊ: Toàn quyền
              </span>
            ) : currentUser?.role === 'BGH' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                👔 BGH: Tra cứu (Chỉ xem)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-100 text-sky-900 border border-sky-200">
                📋 Danh bạ (Chỉ xem)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị thông tin nhân sự, trình độ đào tạo, phân công chuyên môn và giáo viên chủ nhiệm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Thêm giáo viên mới
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Nhập danh sách giáo viên từ file Excel (.xlsx, .xls, .csv)"
              >
                <Upload className="w-4 h-4 text-indigo-600" /> Nhập từ Excel
              </button>
            </>
          )}

          <button
            onClick={() => setActiveMenu('departments')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Quản lý Tổ chuyên môn toàn trường"
          >
            <Layers className="w-4 h-4 text-indigo-600" /> Quản lý Tổ CM
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Xuất file Excel (.xlsx) danh sách giáo viên"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Tổng giáo viên</div>
            <div className="text-xl font-black text-slate-900">{totalTeachers} người</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Biên chế: {officialCount}</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">GV Chủ nhiệm</div>
            <div className="text-xl font-black text-sky-900">{homeroomCount} lớp</div>
            <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Đã phân công 100%</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Sau Đại học</div>
            <div className="text-xl font-black text-indigo-900">{masterDegreeCount} ThS/TS</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Trình độ cao</div>
          </div>
        </div>

        <div
          onClick={() => setActiveMenu('departments')}
          className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-emerald-300 transition-all cursor-pointer group"
          title="Nhấn để mở Quản lý Tổ chuyên môn"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 font-bold uppercase text-[10px]">Tổ chuyên môn</div>
            <div className="text-xl font-black text-emerald-900">{departments.length} tổ</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 group-hover:underline">Quản lý tổ CM →</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã GV, môn, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">-- Tất cả tổ chuyên môn --</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  Tổ: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Homeroom Filter */}
          <div>
            <select
              value={homeroomFilter}
              onChange={(e) => setHomeroomFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">-- Tất cả nhiệm vụ --</option>
              <option value="YES">Đang làm GVCN</option>
              <option value="NO">Chỉ dạy bộ môn</option>
            </select>
          </div>

          {/* Employment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">-- Tất cả loại biên chế --</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Đang hiển thị <strong>{filteredTeachers.length}</strong> / {totalTeachers} giáo viên
          </span>
          {(searchTerm || departmentFilter !== 'ALL' || homeroomFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('ALL');
                setHomeroomFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-purple-600 font-bold hover:underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Teacher Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Mã GV</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Tổ chuyên môn</th>
                  <th className="py-3 px-4">Môn chính</th>
                  <th className="py-3 px-4">Chủ nhiệm</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Trình độ</th>
                  <th className="py-3 px-4">Biên chế</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">
                      {t.teacherCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                          {t.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{t.fullName}</div>
                          <div className="text-[11px] text-slate-400">{t.duty || 'Giáo viên'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.department}</td>
                    <td className="py-3 px-4 font-bold text-purple-900">{t.mainSubject}</td>
                    <td className="py-3 px-4">
                      {t.isHomeroom ? (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] border border-sky-200">
                          Lớp {t.homeroomClassName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{t.phone}</td>
                    <td className="py-3 px-4 text-slate-700">{t.degree}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          t.employmentStatus === 'Biên chế chính thức'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTeacherForDetail(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Chỉnh sửa hồ sơ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(t)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa hồ sơ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Không tìm thấy giáo viên nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base uppercase shadow-md shrink-0">
                    {t.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{t.fullName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{t.teacherCode}</span>
                      <span>•</span>
                      <span>{t.duty || 'Giáo viên'}</span>
                    </div>
                  </div>
                </div>

                {t.isHomeroom && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-black text-[10px] border border-sky-200 shrink-0">
                    Lớp {t.homeroomClassName}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Tổ bộ môn:</span>
                  <span className="font-semibold text-slate-800">{t.department}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Môn giảng dạy:</span>
                  <span className="font-bold text-purple-900">{t.mainSubject}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Trình độ:</span>
                  <span className="font-medium text-slate-800">{t.degree}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-mono font-medium text-slate-700">{t.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    t.employmentStatus === 'Biên chế chính thức'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {t.employmentStatus}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedTeacherForDetail(t)}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Chi tiết
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: View Teacher Detail */}
      {selectedTeacherForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Hồ sơ chi tiết cán bộ, giáo viên
              </h3>
              <button
                onClick={() => setSelectedTeacherForDetail(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                {selectedTeacherForDetail.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-base font-black text-slate-900">
                  {selectedTeacherForDetail.fullName}
                </div>
                <div className="text-xs text-purple-900 font-bold mt-0.5">
                  {selectedTeacherForDetail.duty || 'Giáo viên'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span className="font-mono bg-white px-2 py-0.2 rounded-md border border-slate-200">
                    {selectedTeacherForDetail.teacherCode}
                  </span>
                  <span>{selectedTeacherForDetail.gender}</span>
                  <span>•</span>
                  <span>Ngày sinh: {selectedTeacherForDetail.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Tổ chuyên môn</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedTeacherForDetail.department}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Môn giảng dạy chính</div>
                  <div className="font-bold text-purple-900 mt-0.5">{selectedTeacherForDetail.mainSubject}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Trình độ học vấn</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedTeacherForDetail.degree}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Hình thức tuyển dụng</div>
                  <div className="font-semibold text-emerald-800 mt-0.5">{selectedTeacherForDetail.employmentStatus}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Thông tin liên hệ</div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-mono font-medium">{selectedTeacherForDetail.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>{selectedTeacherForDetail.email}</span>
                </div>
              </div>

              {selectedTeacherForDetail.isHomeroom && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                  <span className="font-bold text-sky-950">Phân công chủ nhiệm:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-xs">
                    Lớp {selectedTeacherForDetail.homeroomClassName}
                  </span>
                </div>
              )}

              {selectedTeacherForDetail.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                  <span className="font-bold text-slate-700">Ghi chú & Đánh giá: </span>
                  {selectedTeacherForDetail.notes}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTeacherForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                {editingTeacher ? 'Chỉnh sửa hồ sơ giáo viên' : 'Thêm mới cán bộ, giáo viên'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã giáo viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.teacherCode}
                    onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên giáo viên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày sinh (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    placeholder="15/04/1988"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số CCCD / Định danh</label>
                  <input
                    type="text"
                    placeholder="0460..."
                    value={formData.idCardNumber}
                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    placeholder="0905.xxx.xxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    placeholder="gv@nguyendinhanh.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tổ chuyên môn</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn giảng dạy chính *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Toán, Ngữ văn..."
                    value={formData.mainSubject}
                    onChange={(e) => setFormData({ ...formData, mainSubject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trình độ chuyên môn</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {DEGREE_LIST.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức biên chế</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chức vụ / Nhiệm vụ</label>
                  <input
                    type="text"
                    placeholder="Tổ trưởng, GVCN, Giáo viên..."
                    value={formData.duty}
                    onChange={(e) => setFormData({ ...formData, duty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày vào trường</label>
                  <input
                    type="text"
                    placeholder="01/09/2020"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Homeroom Assignment */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHomeroomCheck"
                    checked={formData.isHomeroom}
                    onChange={(e) => setFormData({ ...formData, isHomeroom: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isHomeroomCheck" className="font-bold text-slate-800 cursor-pointer">
                    Phân công đảm nhiệm Giáo viên chủ nhiệm (GVCN)
                  </label>
                </div>

                {formData.isHomeroom && (
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-700 mb-1">Chọn lớp chủ nhiệm:</label>
                    <select
                      value={formData.homeroomClassId || ''}
                      onChange={(e) => {
                        const targetCls = classes.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          homeroomClassId: e.target.value,
                          homeroomClassName: targetCls ? targetCls.className : '',
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    >
                      <option value="">-- Chọn lớp chủ nhiệm --</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          Lớp {cls.className} (Khối {cls.grade}) - Hiện tại: {cls.homeroomTeacherName || 'Chưa gán'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú & Quá trình công tác</label>
                <textarea
                  rows={2}
                  placeholder="Thành tích khen thưởng, phụ trách chuyên môn, ghi chú khác..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {editingTeacher ? 'Lưu thay đổi' : 'Thêm giáo viên'}
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
        title="Xác nhận xóa hồ sơ giáo viên"
        message={`Bạn có chắc chắn muốn xóa giáo viên "${deleteCandidate?.fullName}" (${deleteCandidate?.teacherCode}) khỏi hệ thống? Thao tác này sẽ được ghi vào nhật ký kiểm toán.`}
        confirmLabel="Xóa giáo viên"
        confirmVariant="danger"
      />

      {/* Teacher Excel Import Modal */}
      <TeacherExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedList) => {
          const res = importTeachers(importedList);
          if (res.added > 0) {
            showMsg(`Đã nhập thành công ${res.added} giáo viên từ Excel vào hệ thống!`);
          }
          return res;
        }}
        existingTeachers={teachers}
        departments={departments}
      />
    </div>
  );
};
