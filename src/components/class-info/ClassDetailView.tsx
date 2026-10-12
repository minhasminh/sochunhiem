import React, { useState } from 'react';
import {
  School,
  Save,
  RotateCcw,
  Edit,
  GraduationCap,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassEntity, SubjectTeacher } from '../../types';

export const ClassDetailView: React.FC = () => {
  const {
    school,
    currentSchoolYear,
    currentClass,
    updateClass,
    subjectTeachers,
    updateSubjectTeacher,
    addSubjectTeacher,
    deleteSubjectTeacher,
    currentUser,
    currentClassStudents,
  } = useApp();

  // Mode for Class Info: View or Edit
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classForm, setClassForm] = useState<Partial<ClassEntity>>({
    characteristics: currentClass?.characteristics || '',
    advantages: currentClass?.advantages || '',
    difficulties: currentClass?.difficulties || '',
    goals: currentClass?.goals || '',
    notes: currentClass?.notes || '',
    roomNumber: currentClass?.roomNumber || '',
    studyShift: currentClass?.studyShift || 'Buổi sáng',
  });

  const [classSaveSuccess, setClassSaveSuccess] = useState(false);

  // Subject Teacher Edit State
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState<Partial<SubjectTeacher>>({});
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Handle Save Class Info
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;

    updateClass(currentClass.id, {
      ...classForm,
      studentCount: currentClassStudents.length, // Tự động đồng bộ sĩ số
    });

    setIsEditingClass(false);
    setClassSaveSuccess(true);
    setTimeout(() => setClassSaveSuccess(false), 2500);
  };

  const handleCancelClassEdit = () => {
    if (currentClass) {
      setClassForm({
        characteristics: currentClass.characteristics || '',
        advantages: currentClass.advantages || '',
        difficulties: currentClass.difficulties || '',
        goals: currentClass.goals || '',
        notes: currentClass.notes || '',
        roomNumber: currentClass.roomNumber || '',
        studyShift: currentClass.studyShift || 'Buổi sáng',
      });
    }
    setIsEditingClass(false);
  };

  // Handle Subject Teacher Save
  const handleSaveTeacherEdit = (id: string) => {
    updateSubjectTeacher(id, teacherForm);
    setEditingTeacherId(null);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTeacherName.trim()) return;

    addSubjectTeacher({
      classId: currentClass?.id || 'class-7-1',
      subjectName: newSubject.trim(),
      teacherName: newTeacherName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      notes: newNotes.trim(),
    });

    setNewSubject('');
    setNewTeacherName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    setShowAddTeacherModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-sky-600" />
            HỒ SƠ THÔNG TIN LỚP & GIÁO VIÊN BỘ MÔN (GIAI ĐOẠN 2)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ lớp {currentClass?.className} ({currentSchoolYear.name}) và phân công giáo viên giảng dạy
          </p>
        </div>

        {classSaveSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Đã lưu hồ sơ thông tin lớp thành công!
          </div>
        )}
      </div>

      {/* 1. THÔNG TIN LỚP */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <School className="w-4 h-4 text-sky-600" />
              1. Thông tin lý lịch & Đặc điểm tình hình lớp
            </h3>
            <p className="text-[11px] text-slate-500">
              Đặc điểm lớp, thuận lợi, khó khăn và mục tiêu giáo dục theo Sổ chủ nhiệm mẫu
            </p>
          </div>

          {isAuthorized && !isEditingClass && (
            <button
              onClick={() => {
                setClassForm({
                  characteristics: currentClass?.characteristics || '',
                  advantages: currentClass?.advantages || '',
                  difficulties: currentClass?.difficulties || '',
                  goals: currentClass?.goals || '',
                  notes: currentClass?.notes || '',
                  roomNumber: currentClass?.roomNumber || '',
                  studyShift: currentClass?.studyShift || 'Buổi sáng',
                });
                setIsEditingClass(true);
              }}
              className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ lớp
            </button>
          )}
        </div>

        {/* Readonly Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Tên trường</div>
            <div className="font-bold text-slate-900 mt-1 truncate">{school.name}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Năm học</div>
            <div className="font-bold text-slate-900 mt-1">{currentSchoolYear.name}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Khối & Lớp</div>
            <div className="font-black text-sky-800 mt-1">Khối {currentClass?.grade} — {currentClass?.className}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">GVCN</div>
            <div className="font-bold text-slate-900 mt-1">{currentClass?.homeroomTeacherName}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Sĩ số thực tế</div>
            <div className="font-black text-emerald-700 mt-1">{currentClassStudents.length} học sinh</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Phòng học & Ca</div>
            <div className="font-bold text-slate-900 mt-1">{currentClass?.roomNumber} ({currentClass?.studyShift})</div>
          </div>
        </div>

        {/* Form Body (View or Edit) */}
        {isEditingClass ? (
          <form onSubmit={handleSaveClass} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đặc điểm tình hình lớp
                </label>
                <textarea
                  rows={3}
                  value={classForm.characteristics || ''}
                  onChange={(e) => setClassForm({ ...classForm, characteristics: e.target.value })}
                  placeholder="Nhập đặc điểm sĩ số, dân tộc, hoàn cảnh gia đình..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mục tiêu phấn đấu của lớp
                </label>
                <textarea
                  rows={3}
                  value={classForm.goals || ''}
                  onChange={(e) => setClassForm({ ...classForm, goals: e.target.value })}
                  placeholder="Chỉ tiêu chuyên cần, danh hiệu chi đội, tỷ lệ lên lớp..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-emerald-800">
                  Thuận lợi
                </label>
                <textarea
                  rows={3}
                  value={classForm.advantages || ''}
                  onChange={(e) => setClassForm({ ...classForm, advantages: e.target.value })}
                  placeholder="Sự quan tâm của BGH, ban cán sự, tinh thần đoàn kết..."
                  className="w-full p-2.5 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-emerald-50/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-rose-800">
                  Khó khăn
                </label>
                <textarea
                  rows={3}
                  value={classForm.difficulties || ''}
                  onChange={(e) => setClassForm({ ...classForm, difficulties: e.target.value })}
                  placeholder="Gia đình khó khăn, học sinh tiếp thu chậm..."
                  className="w-full p-2.5 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi chú của GVCN</label>
              <textarea
                rows={2}
                value={classForm.notes || ''}
                onChange={(e) => setClassForm({ ...classForm, notes: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelClassEdit}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu thông tin lớp
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="font-bold text-slate-800">Đặc điểm tình hình lớp:</div>
              <p className="text-slate-600 leading-relaxed">
                {currentClass?.characteristics || 'Chưa có dữ liệu.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                <div className="font-bold text-emerald-900">Thuận lợi:</div>
                <p className="text-slate-600 leading-relaxed">
                  {currentClass?.advantages || 'Chưa có dữ liệu.'}
                </p>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                <div className="font-bold text-rose-900">Khó khăn:</div>
                <p className="text-slate-600 leading-relaxed">
                  {currentClass?.difficulties || 'Chưa có dữ liệu.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
              <div className="font-bold text-sky-900">Mục tiêu phấn đấu của lớp:</div>
              <p className="text-slate-600 leading-relaxed">
                {currentClass?.goals || 'Chưa có dữ liệu.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. GIÁO VIÊN BỘ MÔN */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              2. Danh sách Giáo viên bộ môn giảng dạy lớp {currentClass?.className}
            </h3>
            <p className="text-[11px] text-slate-500">
              Gán giáo viên vào từng môn học (Toán, Ngữ văn, KHTN, Tiếng Anh, Tin học...)
            </p>
          </div>

          {isAuthorized && (
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Gán thêm môn / GV
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3 text-center border-r border-slate-200 w-12">STT</th>
                <th className="p-3 border-r border-slate-200 font-bold min-w-[140px]">Môn học</th>
                <th className="p-3 border-r border-slate-200 font-bold min-w-[180px]">Họ và tên giáo viên</th>
                <th className="p-3 border-r border-slate-200 min-w-[130px]">Số điện thoại</th>
                <th className="p-3 border-r border-slate-200 min-w-[170px]">Email liên hệ</th>
                <th className="p-3 border-r border-slate-200 min-w-[160px]">Ghi chú</th>
                {isAuthorized && <th className="p-3 text-center w-24">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjectTeachers.map((st, idx) => {
                const isEditing = editingTeacherId === st.id;
                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-slate-400 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="p-3 font-extrabold text-sky-900 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherForm.subjectName || ''}
                          onChange={(e) => setTeacherForm({ ...teacherForm, subjectName: e.target.value })}
                          className="w-full p-1 border border-sky-400 rounded-md text-xs font-bold"
                        />
                      ) : (
                        st.subjectName
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-800 border-r border-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherForm.teacherName || ''}
                          onChange={(e) => setTeacherForm({ ...teacherForm, teacherName: e.target.value })}
                          className="w-full p-1 border border-sky-400 rounded-md text-xs"
                        />
                      ) : (
                        st.teacherName
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherForm.phone || ''}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                          className="w-full p-1 border border-sky-400 rounded-md text-xs font-mono"
                        />
                      ) : (
                        st.phone || 'Chưa có SĐT'
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">
                      {isEditing ? (
                        <input
                          type="email"
                          value={teacherForm.email || ''}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          className="w-full p-1 border border-sky-400 rounded-md text-xs"
                        />
                      ) : (
                        st.email || 'Chưa có email'
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherForm.notes || ''}
                          onChange={(e) => setTeacherForm({ ...teacherForm, notes: e.target.value })}
                          className="w-full p-1 border border-sky-400 rounded-md text-xs"
                        />
                      ) : (
                        st.notes || '—'
                      )}
                    </td>
                    {isAuthorized && (
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveTeacherEdit(st.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                              title="Lưu"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTeacherId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTeacherId(st.id);
                                setTeacherForm(st);
                              }}
                              className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-md"
                              title="Sửa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn gỡ môn ${st.subjectName}?`)) {
                                  deleteSubjectTeacher(st.id);
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-600" /> Gán giáo viên bộ môn
              </h3>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Môn học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tin học, Ngoại ngữ 2..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên giáo viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0905.xxx.xxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="gv@edu.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú giáo viên..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20"
                >
                  Gán môn học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
