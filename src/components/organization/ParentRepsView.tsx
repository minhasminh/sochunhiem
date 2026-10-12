import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  User,
  Users,
  Search,
  Printer,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ParentRepresentative, Student } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface ParentRepsViewProps {
  onOpenPrint?: () => void;
}

export const ParentRepsView: React.FC<ParentRepsViewProps> = ({ onOpenPrint }) => {
  const {
    parentRepresentatives,
    addParentRepresentative,
    updateParentRepresentative,
    deleteParentRepresentative,
    currentClassStudents,
    currentClass,
    currentSchoolYear,
    currentUser,
    setSelectedStudent,
    canEditCurrentClass,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRep, setEditingRep] = useState<ParentRepresentative | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ParentRepresentative | null>(null);

  const [formData, setFormData] = useState<Omit<ParentRepresentative, 'id'>>({
    classId: currentClass?.id || 'class-7-1',
    schoolYearId: currentSchoolYear.id,
    parentName: '',
    phone: '',
    studentId: currentClassStudents[0]?.id || '',
    role: 'Trưởng ban',
    responsibilities: '',
    notes: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthorized = canEditCurrentClass;

  // Map student ID to student
  const studentMap = new Map<string, Student>();
  currentClassStudents.forEach((s) => studentMap.set(s.id, s));

  const openAddModal = () => {
    setEditingRep(null);
    setFormData({
      classId: currentClass?.id || 'class-7-1',
      schoolYearId: currentSchoolYear.id,
      parentName: '',
      phone: '',
      studentId: currentClassStudents[0]?.id || '',
      role: 'Trưởng ban',
      responsibilities: 'Chủ trì các hoạt động của Ban ĐD CMHS lớp, làm đầu mối liên lạc với GVCN.',
      notes: '',
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const openEditModal = (rep: ParentRepresentative) => {
    setEditingRep(rep);
    setFormData({
      classId: rep.classId,
      schoolYearId: rep.schoolYearId,
      parentName: rep.parentName,
      phone: rep.phone,
      studentId: rep.studentId,
      role: rep.role,
      responsibilities: rep.responsibilities,
      notes: rep.notes || '',
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên phụ huynh!');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại phụ huynh!');
      return;
    }
    if (!formData.studentId) {
      setErrorMessage('Vui lòng chọn học sinh là con của phụ huynh!');
      return;
    }

    if (editingRep) {
      updateParentRepresentative(editingRep.id, formData);
    } else {
      const res = addParentRepresentative(formData);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi thêm Ban đại diện CMHS');
        return;
      }
    }

    setShowModal(false);
  };

  const filteredReps = parentRepresentatives.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const st = studentMap.get(r.studentId);
      const matchName = r.parentName.toLowerCase().includes(q);
      const matchPhone = r.phone.includes(q);
      const matchRole = r.role.toLowerCase().includes(q);
      const matchChild = st ? st.fullName.toLowerCase().includes(q) : false;
      if (!matchName && !matchPhone && !matchRole && !matchChild) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  BAN ĐẠI DIỆN CHA MẸ HỌC SINH (CMHS)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Lớp {currentClass?.className} • {currentSchoolYear.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {parentRepresentatives.length} thành viên
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cầu nối phối hợp chặt chẽ giữa Gia đình - Nhà trường - Xã hội trong công tác giáo dục học sinh
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
              Thêm thành viên CMHS
            </button>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In danh sách Ban ĐD
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên phụ huynh, SĐT, học sinh..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
          />
        </div>
        <div className="text-slate-400 text-[11px] hidden sm:block">
          * Thông tin học sinh liên kết tự động cập nhật khi hồ sơ học sinh thay đổi
        </div>
      </div>

      {/* Grid of Representative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReps.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            <HeartHandshake className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            Chưa có thành viên Ban đại diện cha mẹ học sinh nào được ghi nhận.
          </div>
        ) : (
          filteredReps.map((rep) => {
            const student = studentMap.get(rep.studentId);
            const isLeader = rep.role === 'Trưởng ban';
            const isDeputy = rep.role === 'Phó ban';

            return (
              <div
                key={rep.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all relative flex flex-col justify-between ${
                  isLeader
                    ? 'border-rose-300 bg-gradient-to-b from-rose-50/30 to-white'
                    : isDeputy
                    ? 'border-indigo-300 bg-gradient-to-b from-indigo-50/30 to-white'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner uppercase ${
                          isLeader
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isDeputy
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {rep.parentName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {rep.parentName}
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mt-0.5 ${
                            isLeader
                              ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                              : isDeputy
                              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {rep.role}
                        </span>
                      </div>
                    </div>

                    {isAuthorized && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(rep)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(rep)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại:
                      </span>
                      <a
                        href={`tel:${rep.phone}`}
                        className="font-bold text-sky-700 font-mono hover:underline"
                      >
                        {rep.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Phụ huynh em:
                      </span>
                      {student ? (
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="font-bold text-slate-800 hover:text-sky-700 hover:underline"
                        >
                          {student.fullName} (Tổ {student.groupNumber})
                        </button>
                      ) : (
                        <span className="text-rose-500 italic">Chưa liên kết</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-700">Nhiệm vụ phân công:</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {rep.responsibilities || 'Chưa phân công cụ thể'}
                      </p>
                    </div>

                    {rep.notes && (
                      <div className="text-[10px] text-slate-400 italic">
                        Ghi chú: {rep.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL THÊM / SỬA THÀNH VIÊN BAN ĐẠI DIỆN CMHS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-rose-700 via-rose-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <HeartHandshake className="w-5 h-5 text-rose-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingRep ? 'Chỉnh Sửa Thành Viên Ban ĐD' : 'Thêm Thành Viên Ban ĐD CMHS'}
                  </h3>
                  <p className="text-xs text-rose-200">Ghi nhận thông tin phụ huynh và phân công nhiệm vụ</p>
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

              {/* Tên & Chức vụ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và Tên Phụ Huynh: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="VD: Ông Võ Quốc Dũng"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức Vụ trong Ban:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
                  >
                    <option value="Trưởng ban">Trưởng ban đại diện</option>
                    <option value="Phó ban">Phó ban đại diện</option>
                    <option value="Thành viên">Thành viên (Ủy viên)</option>
                  </select>
                </div>
              </div>

              {/* SĐT & Học sinh (con) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Điện Thoại: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0917651741"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phụ Huynh Của Học Sinh: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {currentClassStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        STT {st.stt} - {st.fullName} (Mã: {st.studentCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nhiệm vụ phân công */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhiệm Vụ Được Phân Công:</label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="VD: Phụ trách chung hoạt động của Ban ĐD CMHS lớp, làm đầu mối liên lạc với GVCN..."
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
                  placeholder="Ghi chú thêm..."
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editingRep ? 'Lưu thay đổi' : 'Thêm thành viên'}
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
            deleteParentRepresentative(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        title="Xác nhận xóa thành viên Ban ĐD CMHS"
        message={`Bạn có chắc chắn muốn xóa phụ huynh "${deleteCandidate?.parentName}" (${deleteCandidate?.role}) khỏi Ban đại diện Cha mẹ học sinh lớp ${currentClass?.className || '7/1'}?`}
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
      />
    </div>
  );
};
