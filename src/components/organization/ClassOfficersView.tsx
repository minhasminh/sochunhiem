import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Printer,
  Shield,
  BookOpen,
  Calendar,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassOfficer, Student } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClassOfficersViewProps {
  onOpenPrint?: () => void;
}

export const ClassOfficersView: React.FC<ClassOfficersViewProps> = ({ onOpenPrint }) => {
  const {
    classOfficers,
    addClassOfficer,
    updateClassOfficer,
    deleteClassOfficer,
    currentClassStudents,
    currentClass,
    currentSchoolYear,
    school,
    currentUser,
    setSelectedStudent,
    canEditCurrentClass,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<ClassOfficer | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<ClassOfficer | null>(null);
  const [formData, setFormData] = useState<Omit<ClassOfficer, 'id'>>({
    classId: currentClass?.id || 'class-7-1',
    schoolYearId: currentSchoolYear.id,
    studentId: '',
    role: 'Lớp trưởng',
    category: 'ban-can-su',
    duties: '',
    startDate: '05/09/2026',
    notes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthorized = canEditCurrentClass;

  // Map student ID to student
  const studentMap = new Map<string, Student>();
  currentClassStudents.forEach((s) => studentMap.set(s.id, s));

  // Common role suggestions
  const defaultRolesByCategory: Record<string, string[]> = {
    'ban-can-su': [
      'Lớp trưởng',
      'Lớp phó học tập',
      'Lớp phó lao động & phong trào',
      'Lớp phó kỷ luật / nề nếp',
      'Thủ quỹ lớp',
    ],
    'to-truong-to-pho': [
      'Tổ trưởng Tổ 1',
      'Tổ phó Tổ 1',
      'Tổ trưởng Tổ 2',
      'Tổ phó Tổ 2',
      'Tổ trưởng Tổ 3',
      'Tổ phó Tổ 3',
      'Tổ trưởng Tổ 4',
      'Tổ phó Tổ 4',
    ],
    'can-su-bo-mon': [
      'Cán sự môn Toán',
      'Cán sự môn Ngữ văn',
      'Cán sự môn Tiếng Anh',
      'Cán sự môn Khoa học tự nhiên',
      'Cán sự môn Lịch sử & Địa lý',
      'Cán sự môn Tin học',
      'Cán sự môn Giáo dục thể chất',
      'Cán sự môn Nghệ thuật (Âm nhạc - Mỹ thuật)',
    ],
    khac: ['Đội cờ đỏ', 'Phụ trách tủ sách lớp học', 'Phụ trách thể dục đầu giờ'],
  };

  const openAddModal = () => {
    setEditingOfficer(null);
    setFormData({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      studentId: currentClassStudents[0]?.id || '',
      role: 'Lớp trưởng',
      category: 'ban-can-su',
      duties: 'Quản lý chung các hoạt động của lớp.',
      startDate: '05/09/2026',
      notes: '',
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const openEditModal = (officer: ClassOfficer) => {
    setEditingOfficer(officer);
    setFormData({
      classId: officer.classId,
      schoolYearId: officer.schoolYearId,
      studentId: officer.studentId,
      role: officer.role,
      category: officer.category,
      duties: officer.duties,
      startDate: officer.startDate || '05/09/2026',
      notes: officer.notes || '',
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      setErrorMessage('Vui lòng chọn học sinh đảm nhận chức vụ!');
      return;
    }
    if (!formData.role.trim()) {
      setErrorMessage('Vui lòng nhập tên chức vụ!');
      return;
    }

    if (editingOfficer) {
      updateClassOfficer(editingOfficer.id, formData);
    } else {
      const res = addClassOfficer(formData);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi thêm cán bộ lớp');
        return;
      }
    }
    setShowModal(false);
  };

  // Filter officers
  const filteredOfficers = classOfficers.filter((o) => {
    if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const st = studentMap.get(o.studentId);
      const matchRole = o.role.toLowerCase().includes(q);
      const matchName = st ? st.fullName.toLowerCase().includes(q) : false;
      const matchDuties = o.duties.toLowerCase().includes(q);
      if (!matchRole && !matchName && !matchDuties) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  DANH SÁCH BAN CÁN SỰ & CÁN BỘ LỚP {currentClass?.className || '7/1'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {currentSchoolYear.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {classOfficers.length} chức vụ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cán bộ lớp được bầu chọn tại Đại hội Chi đội đầu năm học, liên kết trực tiếp với hồ sơ học sinh
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAuthorized && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm cán bộ lớp
            </button>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In danh sách
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm chức vụ hoặc học sinh..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Lọc nhóm:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'ban-can-su', label: 'Ban cán sự' },
            { id: 'to-truong-to-pho', label: 'Tổ trưởng / Tổ phó' },
            { id: 'can-su-bo-mon', label: 'Cán sự bộ môn' },
            { id: 'khac', label: 'Khác' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[180px]">Chức vụ</th>
                <th className="py-3 px-4 min-w-[200px]">Học sinh đảm nhiệm</th>
                <th className="py-3 px-4 min-w-[100px]">Mã HS</th>
                <th className="py-3 px-4 min-w-[100px]">Tổ</th>
                <th className="py-3 px-4 min-w-[240px]">Nhiệm vụ được giao</th>
                <th className="py-3 px-4 min-w-[120px]">Số điện thoại</th>
                <th className="py-3 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy cán bộ lớp phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer, idx) => {
                  const student = studentMap.get(officer.studentId);

                  return (
                    <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{officer.role}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {officer.category === 'ban-can-su'
                            ? 'Ban cán sự'
                            : officer.category === 'to-truong-to-pho'
                            ? 'Ban chỉ huy tổ'
                            : officer.category === 'can-su-bo-mon'
                            ? 'Cán sự bộ môn'
                            : 'Chức danh khác'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {student ? (
                          <div>
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1 text-left"
                            >
                              <span>{student.fullName}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                                  student.gender === 'Nam'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {student.gender}
                              </span>
                            </button>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Sinh ngày: {student.birthDate}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-500 italic">Học sinh đã bị xóa</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {student?.studentCode || 'Chưa có'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          Tổ {student?.groupNumber || 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed text-[11px]">
                        {officer.duties || 'Chưa có phân công cụ thể'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {student?.phone || 'Chưa có SĐT'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isAuthorized ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(officer)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                              title="Chỉnh sửa phân công"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCandidate(officer)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa chức vụ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA CÁN BỘ LỚP */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingOfficer ? 'Chỉnh Sửa Phân Công Cán Bộ' : 'Thêm Cán Bộ Lớp Mới'}
                  </h3>
                  <p className="text-xs text-sky-200">Liên kết học sinh với chức vụ phụ trách</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* 1. Chọn học sinh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn Học Sinh Đảm Nhận: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
                >
                  <option value="">-- Chọn học sinh từ danh sách lớp --</option>
                  {currentClassStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      STT {st.stt} - {st.fullName} (Mã: {st.studentCode}) - Tổ {st.groupNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Nhóm chức danh & Chức danh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhóm Chức Danh:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as any;
                      const suggestions = defaultRolesByCategory[newCat] || [];
                      setFormData({
                        ...formData,
                        category: newCat,
                        role: suggestions[0] || formData.role,
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="ban-can-su">Ban cán sự lớp</option>
                    <option value="to-truong-to-pho">Tổ trưởng / Tổ phó</option>
                    <option value="can-su-bo-mon">Cán sự bộ môn</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Chức Vụ: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="VD: Lớp trưởng, Tổ trưởng tổ 1..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Gợi ý chức danh nhanh */}
              <div>
                <span className="text-[11px] text-slate-500 mb-1 block">Gợi ý chức danh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(defaultRolesByCategory[formData.category] || []).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        formData.role === r
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Nhiệm vụ được giao */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhiệm Vụ Được Giao:</label>
                <textarea
                  rows={3}
                  value={formData.duties}
                  onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                  placeholder="Mô tả cụ thể nhiệm vụ của chức vụ này trong tuần, tháng..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú:</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú về tính cách, uy tín..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editingOfficer ? 'Lưu thay đổi' : 'Thêm cán bộ'}
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
            deleteClassOfficer(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        title="Xác nhận xóa cán bộ lớp"
        message={`Bạn có chắc chắn muốn xóa phân công chức vụ "${deleteCandidate?.role}" của học sinh "${studentMap.get(deleteCandidate?.studentId || '')?.fullName || 'học sinh'}"?`}
        confirmLabel="Xóa phân công"
        confirmVariant="danger"
      />
    </div>
  );
};
