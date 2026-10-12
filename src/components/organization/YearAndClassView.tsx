import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  School,
  Users,
  AlertTriangle,
  RotateCcw,
  Clock,
  Save,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassEntity, SchoolYear, StudyShift } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const YearAndClassView: React.FC = () => {
  const {
    school,
    updateSchool,
    schoolYears,
    currentSchoolYear,
    selectSchoolYear,
    addSchoolYear,
    updateSchoolYear,
    toggleLockSchoolYear,
    deleteSchoolYear,
    classes,
    currentClass,
    selectClass,
    addClass,
    updateClass,
    deleteClass,
    deleteDemoData,
    restoreDemoData,
    currentUser,
  } = useApp();

  // School Year Form State
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<SchoolYear | null>(null);
  const [yearCode, setYearCode] = useState('');
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('05/09/2026');
  const [yearEndDate, setYearEndDate] = useState('31/05/2027');
  const [yearError, setYearError] = useState<string | null>(null);

  // Class Form State
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);
  const [classGrade, setClassGrade] = useState('7');
  const [className, setClassName] = useState('7/1');
  const [classTeacher, setClassTeacher] = useState('Lê Đức Minh');
  const [classRoom, setClassRoom] = useState('Phòng 204');
  const [classShift, setClassShift] = useState<StudyShift>('Buổi sáng');
  const [classStudentCount, setClassStudentCount] = useState(31);
  const [classNotes, setClassNotes] = useState('');
  const [classError, setClassError] = useState<string | null>(null);

  // Deletion Confirmation Modals
  const [deleteYearCandidate, setDeleteYearCandidate] = useState<SchoolYear | null>(null);
  const [deleteClassCandidate, setDeleteClassCandidate] = useState<ClassEntity | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filter classes by active year
  const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

  // Year Handlers
  const handleOpenYearModal = (year?: SchoolYear) => {
    if (year) {
      setEditingYear(year);
      setYearCode(year.code);
      setYearName(year.name);
      setYearStartDate(year.startDate);
      setYearEndDate(year.endDate);
    } else {
      setEditingYear(null);
      setYearCode('');
      setYearName('');
      setYearStartDate('05/09/2027');
      setYearEndDate('31/05/2028');
    }
    setYearError(null);
    setShowYearModal(true);
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    setYearError(null);

    if (!yearCode.trim()) {
      setYearError('Vui lòng nhập mã niên khóa (VD: 2027-2028).');
      return;
    }

    if (editingYear) {
      updateSchoolYear(editingYear.id, {
        code: yearCode.trim(),
        name: yearName.trim() || `Năm học ${yearCode.trim()}`,
        startDate: yearStartDate,
        endDate: yearEndDate,
      });
      setShowYearModal(false);
    } else {
      const res = addSchoolYear({
        code: yearCode.trim(),
        name: yearName.trim() || `Năm học ${yearCode.trim()}`,
        startDate: yearStartDate,
        endDate: yearEndDate,
        status: 'active',
        isCurrent: false,
      });

      if (!res.success) {
        setYearError(res.message || 'Lỗi khi tạo năm học.');
      } else {
        setShowYearModal(false);
      }
    }
  };

  const handleDeleteYear = (year: SchoolYear) => {
    setDeleteErrorMessage(null);
    setDeleteYearCandidate(year);
  };

  const confirmDeleteYear = () => {
    if (!deleteYearCandidate) return;
    const res = deleteSchoolYear(deleteYearCandidate.id);
    if (!res.success) {
      setDeleteErrorMessage(res.message || 'Không thể xóa năm học này.');
    } else {
      setDeleteYearCandidate(null);
    }
  };

  // Class Handlers
  const handleOpenClassModal = (cls?: ClassEntity) => {
    if (cls) {
      setEditingClass(cls);
      setClassGrade(cls.grade);
      setClassName(cls.className);
      setClassTeacher(cls.homeroomTeacherName);
      setClassRoom(cls.roomNumber);
      setClassShift(cls.studyShift);
      setClassStudentCount(cls.studentCount);
      setClassNotes(cls.notes);
    } else {
      setEditingClass(null);
      setClassGrade('7');
      setClassName('7/2');
      setClassTeacher(currentUser?.name || 'Giáo viên');
      setClassRoom('Phòng 205');
      setClassShift('Buổi sáng');
      setClassStudentCount(30);
      setClassNotes('');
    }
    setClassError(null);
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    setClassError(null);

    if (!className.trim()) {
      setClassError('Vui lòng nhập tên lớp học (VD: 7/1).');
      return;
    }

    if (editingClass) {
      updateClass(editingClass.id, {
        grade: classGrade,
        className: className.trim(),
        homeroomTeacherName: classTeacher.trim(),
        roomNumber: classRoom.trim(),
        studyShift: classShift,
        studentCount: classStudentCount,
        notes: classNotes,
      });
      setShowClassModal(false);
    } else {
      const res = addClass({
        schoolId: school.id,
        schoolYearId: currentSchoolYear.id,
        grade: classGrade,
        className: className.trim(),
        homeroomTeacherId: currentUser?.id || 'gvcn-1',
        homeroomTeacherName: classTeacher.trim(),
        roomNumber: classRoom.trim(),
        studyShift: classShift,
        studentCount: classStudentCount,
        notes: classNotes,
        isDemo: false,
      });

      if (!res.success) {
        setClassError(res.message || 'Lỗi khi tạo lớp học.');
      } else {
        setShowClassModal(false);
      }
    }
  };

  const handleDeleteClass = (cls: ClassEntity) => {
    setDeleteClassCandidate(cls);
  };

  const confirmDeleteClass = () => {
    if (!deleteClassCandidate) return;
    deleteClass(deleteClassCandidate.id);
    setDeleteClassCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-sky-600" />
            QUẢN LÝ NĂM HỌC & LỚP HỌC (GIAI ĐOẠN 1)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập niên khóa, khóa năm học cũ, quản lý thông tin lớp chủ nhiệm theo chuẩn trường THCS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenYearModal()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-600" /> Thêm năm học
          </button>
          <button
            onClick={() => handleOpenClassModal()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm lớp học
          </button>
        </div>
      </div>

      {/* Section 1: School Year Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              1. Danh sách Niên khóa / Năm học
            </h3>
            <p className="text-[11px] text-slate-500">
              Chọn năm học làm việc hiện tại, xem lại dữ liệu cũ hoặc khóa niên khóa đã kết thúc
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Năm học đang làm việc: <strong>{currentSchoolYear.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {schoolYears.map((year) => {
            const isSelected = year.id === currentSchoolYear.id;
            const isLocked = year.status === 'locked';

            return (
              <div
                key={year.id}
                className={`p-4.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/40 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{year.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Thời gian: {year.startDate} – {year.endDate}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isLocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {isLocked ? 'Đã khóa' : 'Đang dùng'}
                  </span>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {!isSelected && (
                      <button
                        onClick={() => selectSchoolYear(year.id)}
                        className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-slate-200 text-sky-700 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Chọn làm việc
                      </button>
                    )}
                    <button
                      onClick={() => toggleLockSchoolYear(year.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title={isLocked ? 'Mở khóa năm học' : 'Khóa năm học cũ'}
                    >
                      {isLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenYearModal(year)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sửa năm học"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!isSelected && (
                      <button
                        onClick={() => handleDeleteYear(year)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Xóa năm học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Class Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              2. Danh sách Lớp học trong {currentSchoolYear.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Quản lý các lớp, giáo viên chủ nhiệm, phòng học và thời gian học
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Có <strong>{activeYearClasses.length}</strong> lớp học được thiết lập
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3 text-center border-r border-slate-200 w-12">STT</th>
                <th className="p-3 border-r border-slate-200">Khối</th>
                <th className="p-3 border-r border-slate-200 font-bold min-w-[100px]">Tên lớp</th>
                <th className="p-3 border-r border-slate-200 min-w-[180px]">Giáo viên chủ nhiệm</th>
                <th className="p-3 border-r border-slate-200 text-center">Sĩ số</th>
                <th className="p-3 border-r border-slate-200 min-w-[140px]">Phòng học</th>
                <th className="p-3 border-r border-slate-200">Thời gian học</th>
                <th className="p-3 border-r border-slate-200">Trạng thái Demo</th>
                <th className="p-3 border-r border-slate-200 min-w-[180px]">Ghi chú</th>
                <th className="p-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeYearClasses.map((cls, idx) => {
                const isSelectedClass = currentClass?.id === cls.id;
                return (
                  <tr
                    key={cls.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelectedClass ? 'bg-sky-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="p-3 text-center text-slate-400 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r border-slate-200">Khối {cls.grade}</td>
                    <td className="p-3 font-extrabold text-sky-900 border-r border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>Lớp {cls.className}</span>
                        {isSelectedClass && (
                          <span className="w-2 h-2 rounded-full bg-sky-600" title="Lớp đang chọn" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800 border-r border-slate-200">
                      {cls.homeroomTeacherName}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900 border-r border-slate-200">
                      {cls.studentCount} HS
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">
                      {cls.roomNumber}
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {cls.studyShift}
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      {cls.isDemo ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px] tracking-wide">
                          DỮ LIỆU DEMO
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chính thức</span>
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-500 text-[11px]">
                      {cls.notes}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isSelectedClass && (
                          <button
                            onClick={() => selectClass(cls.id)}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold"
                          >
                            Chọn lớp
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenClassModal(cls)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa lớp"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Xóa lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit School Year */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                {editingYear ? 'Chỉnh sửa năm học' : 'Thêm niên khóa mới'}
              </h3>
              <button
                onClick={() => setShowYearModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {yearError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{yearError}</span>
              </div>
            )}

            <form onSubmit={handleSaveYear} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã niên khóa (Ví dụ: 2027-2028) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2027-2028"
                  value={yearCode}
                  onChange={(e) => setYearCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên hiển thị (Ví dụ: Năm học 2027 - 2028)
                </label>
                <input
                  type="text"
                  placeholder="Năm học 2027 - 2028"
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="text"
                    placeholder="05/09/2027"
                    value={yearStartDate}
                    onChange={(e) => setYearStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="text"
                    placeholder="31/05/2028"
                    value={yearEndDate}
                    onChange={(e) => setYearEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20"
                >
                  Lưu năm học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-sky-600" />
                {editingClass ? 'Chỉnh sửa thông tin lớp' : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {classError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{classError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp *</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="6">Khối 6</option>
                    <option value="7">Khối 7</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên lớp (VD: 7/1) *</label>
                  <input
                    type="text"
                    required
                    placeholder="7/1"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giáo viên chủ nhiệm *</label>
                <input
                  type="text"
                  required
                  placeholder="Lê Đức Minh"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phòng học</label>
                  <input
                    type="text"
                    placeholder="P.204"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ca học</label>
                  <select
                    value={classShift}
                    onChange={(e) => setClassShift(e.target.value as StudyShift)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Buổi sáng">Buổi sáng</option>
                    <option value="Buổi chiều">Buổi chiều</option>
                    <option value="Cả ngày">Cả ngày</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sĩ số</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={classStudentCount}
                    onChange={(e) => setClassStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về lớp học..."
                  value={classNotes}
                  onChange={(e) => setClassNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20"
                >
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion of School Year */}
      <ConfirmModal
        isOpen={!!deleteYearCandidate}
        onClose={() => {
          setDeleteYearCandidate(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={confirmDeleteYear}
        title="Xác nhận xóa năm học"
        message={
          deleteErrorMessage ||
          `Bạn có chắc chắn muốn xóa niên khóa "${deleteYearCandidate?.name}"? Lưu ý: Nếu năm học đang có lớp, hệ thống sẽ ngăn chặn việc xóa để đảm bảo toàn vẹn dữ liệu.`
        }
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
      />

      {/* Confirm Deletion of Class */}
      <ConfirmModal
        isOpen={!!deleteClassCandidate}
        onClose={() => setDeleteClassCandidate(null)}
        onConfirm={confirmDeleteClass}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp học "${deleteClassCandidate?.className}" (Khối ${deleteClassCandidate?.grade})? Tất cả danh sách học sinh và phân bổ chỗ ngồi liên quan trong lớp này sẽ bị xóa khỏi hệ thống.`}
        confirmLabel="Xóa lớp học"
        confirmVariant="danger"
      />
    </div>
  );
};
