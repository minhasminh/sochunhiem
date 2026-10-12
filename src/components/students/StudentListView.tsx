import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StudentFormModal } from './StudentFormModal';
import { StudentProfileView } from './StudentProfileView';
import { ExcelImportModal } from './ExcelImportModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const StudentListView: React.FC = () => {
  const {
    currentClassStudents,
    currentClass,
    currentSchoolYear,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleLockStudent,
    importStudents,
    selectedStudent,
    setSelectedStudent,
    currentUser,
    canEditCurrentClass,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [specialFilter, setSpecialFilter] = useState<'all' | 'support' | 'progress' | 'talent' | 'poor'>('all');
  const [sortBy, setSortBy] = useState<'stt' | 'name' | 'code' | 'birthDate'>('stt');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);

  const isAuthorized = canEditCurrentClass;

  // Filter students
  const filteredStudents = currentClassStudents
    .filter((s) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchCode = s.studentCode.includes(q);
        const matchPhone = (s.phone || '').includes(q);
        const matchResidence = (s.residence || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchPhone && !matchResidence) return false;
      }

      // Gender
      if (genderFilter !== 'all' && s.gender !== genderFilter) return false;

      // Group
      if (groupFilter !== 'all' && s.groupNumber !== groupFilter) return false;

      // Status (Active / Locked)
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      // Special Filter
      if (specialFilter === 'support' && !s.needsSupport) return false;
      if (specialFilter === 'progress' && !s.hasProgress) return false;
      if (specialFilter === 'talent' && !s.hasSpecialTalent) return false;
      if (specialFilter === 'poor' && !s.isPoorHousehold) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const aLastName = a.fullName.split(' ').slice(-1)[0] || '';
        const bLastName = b.fullName.split(' ').slice(-1)[0] || '';
        return aLastName.localeCompare(bLastName, 'vi');
      }
      if (sortBy === 'code') return a.studentCode.localeCompare(b.studentCode);
      if (sortBy === 'birthDate') return a.birthDate.localeCompare(b.birthDate);
      return a.stt - b.stt;
    });

  // Export to Excel (CSV UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'Dân tộc',
      'Tổ',
      'Địa chỉ thường trú',
      'Nơi ở hiện nay',
      'Điện thoại HS',
      'Họ tên Cha',
      'Điện thoại Cha',
      'Họ tên Mẹ',
      'Điện thoại Mẹ',
      'Năng lực nổi bật',
      'Môn yêu thích',
      'Môn cần hỗ trợ',
      'Năng khiếu',
      'Trạng thái hồ sơ',
      'Hộ nghèo',
      'Cần hỗ trợ',
      'Có tiến bộ',
    ];

    const rows = filteredStudents.map((s) => [
      s.stt,
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      `"${s.gender}"`,
      `"${s.birthDate}"`,
      `"${s.ethnicity}"`,
      `"Tổ ${s.groupNumber}"`,
      `"${s.address || ''}"`,
      `"${s.residence || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.fatherPhone || ''}"`,
      `"${s.motherName || ''}"`,
      `"${s.motherPhone || ''}"`,
      `"${s.outstandingAbility || ''}"`,
      `"${s.favoriteSubject || ''}"`,
      `"${s.supportNeededSubject || ''}"`,
      `"${s.talents || ''}"`,
      s.status === 'locked' ? 'Đã khóa' : 'Đang học',
      s.isPoorHousehold ? 'Hộ nghèo' : '',
      s.needsSupport ? 'Cần hỗ trợ' : '',
      s.hasProgress ? 'Có tiến bộ' : '',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_sach_hoc_sinh_Lop_${currentClass?.className || '7-1'}_${currentSchoolYear.code}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveStudent = (data: Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>) => {
    if (editingStudent) {
      return updateStudent(editingStudent.id, data);
    } else {
      return addStudent(data);
    }
  };

  const handleDeleteConfirmed = () => {
    if (deleteCandidate) {
      deleteStudent(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <Users className="w-5 h-5 text-sky-600" />
              DANH SÁCH HỌC SINH LỚP {currentClass?.className}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              {currentClassStudents.length} học sinh
            </span>
            {currentUser?.role === 'BGH' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                👔 BGH Chỉ xem
              </span>
            )}
            {currentUser?.role === 'ADMIN' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                🛡️ Quản trị CSDL
              </span>
            )}
            {!isAuthorized && currentUser?.role === 'GVCN' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                👁️ GVCN khác (Chỉ xem)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Module dữ liệu trung tâm (Single Source of Truth) • Niên khóa {currentSchoolYear.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized && (
            <>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setShowFormModal(true);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm học sinh
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-4 h-4 text-slate-600" /> Nhập từ Excel
              </button>
            </>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Xuất file Excel (.CSV UTF-8 BOM) đầy đủ cột"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã HS, SĐT, nơi ở..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam ({currentClassStudents.filter((s) => s.gender === 'Nam').length})</option>
              <option value="Nữ">Nữ ({currentClassStudents.filter((s) => s.gender === 'Nữ').length})</option>
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả Tổ (1-4)</option>
              <option value={1}>Tổ 1</option>
              <option value={2}>Tổ 2</option>
              <option value={3}>Tổ 3</option>
              <option value={4}>Tổ 4</option>
            </select>
          </div>

          {/* Special Categories Filter */}
          <div>
            <select
              value={specialFilter}
              onChange={(e) => setSpecialFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả phân loại</option>
              <option value="support">Cần hỗ trợ</option>
              <option value="progress">Có tiến bộ</option>
              <option value="talent">Năng khiếu</option>
              <option value="poor">Hộ nghèo</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="locked">Đã khóa hồ sơ</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Line: Counter & Sort */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị <strong>{filteredStudents.length}</strong> / {currentClassStudents.length} học sinh
            </span>
            {(searchTerm || genderFilter !== 'all' || groupFilter !== 'all' || statusFilter !== 'all' || specialFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setGenderFilter('all');
                  setGroupFilter('all');
                  setStatusFilter('all');
                  setSpecialFilter('all');
                }}
                className="text-sky-600 hover:underline font-semibold"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-hidden"
            >
              <option value="stt">STT danh sách</option>
              <option value="name">Họ và tên (A-Z)</option>
              <option value="code">Mã học sinh</option>
              <option value="birthDate">Ngày sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Students Table (STT, Mã HS, Họ tên, Giới tính, Ngày sinh, Tổ, Trạng thái, Thao tác) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3 text-center border-r border-slate-200 w-12">STT</th>
                <th className="p-3 border-r border-slate-200 font-mono whitespace-nowrap min-w-[110px]">Mã HS</th>
                <th className="p-3 border-r border-slate-200 font-bold min-w-[180px]">Họ và tên</th>
                <th className="p-3 border-r border-slate-200 text-center w-20">Giới tính</th>
                <th className="p-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[100px]">Ngày sinh</th>
                <th className="p-3 border-r border-slate-200 text-center w-16">Tổ</th>
                <th className="p-3 border-r border-slate-200 min-w-[130px]">Phân loại</th>
                <th className="p-3 border-r border-slate-200 text-center min-w-[120px]">Trạng thái</th>
                <th className="p-3 text-center min-w-[140px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm/lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isLocked = s.status === 'locked';
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-sky-50/50 transition-colors ${
                        isLocked ? 'bg-slate-50/60 opacity-80' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200">
                        {s.stt}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800 border-r border-slate-200">
                        {s.studentCode}
                      </td>
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="hover:text-sky-700 hover:underline text-left flex items-center gap-1.5"
                        >
                          <span>{s.fullName}</span>
                          {s.hasSpecialTalent && (
                            <span title={`Năng khiếu: ${s.talents}`} className="text-amber-500">
                              ★
                            </span>
                          )}
                        </button>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {s.residence || s.address}
                        </div>
                      </td>
                      <td className="p-3 text-center border-r border-slate-200">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-sm font-bold text-[10px] ${
                            s.gender === 'Nữ'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {s.birthDate}
                      </td>
                      <td className="p-3 text-center font-bold text-sky-800 border-r border-slate-200">
                        Tổ {s.groupNumber}
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        <div className="flex flex-wrap gap-1">
                          {s.isPoorHousehold && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Hộ nghèo
                            </span>
                          )}
                          {s.needsSupport && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Cần hỗ trợ
                            </span>
                          )}
                          {s.hasProgress && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Tiến bộ
                            </span>
                          )}
                          {!s.isPoorHousehold && !s.needsSupport && !s.hasProgress && (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center border-r border-slate-200">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isLocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                          {isLocked ? 'Đã khóa' : 'Đang học'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAuthorized && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingStudent(s);
                                  setShowFormModal(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Sửa học sinh"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleLockStudent(s.id)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title={isLocked ? 'Mở khóa hồ sơ' : 'Khóa hồ sơ'}
                              >
                                {isLocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setDeleteCandidate(s)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        currentClassId={currentClass?.id}
        currentSchoolYearId={currentSchoolYear.id}
      />

      {/* Student Detailed Profile Modal */}
      <StudentProfileView
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onEdit={(st) => {
          setSelectedStudent(null);
          setEditingStudent(st);
          setShowFormModal(true);
        }}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importStudents}
        existingCodes={currentClassStudents.map((s) => s.studentCode)}
        currentClassId={currentClass?.id || 'class-7-1'}
        currentSchoolYearId={currentSchoolYear.id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirmed}
        title="Xác nhận xóa học sinh"
        message={`Bạn có chắc chắn muốn xóa học sinh "${deleteCandidate?.fullName}" (Mã: ${deleteCandidate?.studentCode}) khỏi lớp? Số thứ tự của các học sinh còn lại sẽ tự động được đánh số lại liên tục.`}
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
      />
    </div>
  );
};
