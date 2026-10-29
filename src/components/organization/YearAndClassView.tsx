import React, { useState, useMemo } from 'react';
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
  RefreshCw,
  Sparkles,
  Download,
  Upload,
  UserCheck,
  Search,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassEntity, SchoolYear, StudyShift, HomeroomSyncResult } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { exportHomeroomAssignmentsToExcel } from '../../utils/excelExport';
import { HomeroomSyncReportModal } from './HomeroomSyncReportModal';
import { HomeroomAssignmentImportModal } from './HomeroomAssignmentImportModal';

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
    teachers,
    assignHomeroomTeacher,
    syncHomeroomAssignments,
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'classes' | 'homeroom_assignment'>('classes');

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
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
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
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Homeroom Assignment & Sync States
  const [showSyncReportModal, setShowSyncReportModal] = useState<boolean>(false);
  const [syncReport, setSyncReport] = useState<HomeroomSyncResult | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [assignmentSearch, setAssignmentSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter classes by active year and grade
  const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

  // Filter for classes tab
  const displayedClasses = activeYearClasses
    .filter((c) => {
      if (gradeFilter === 'all') return true;
      if (gradeFilter === 'primary') return ['1', '2', '3', '4', '5'].includes(c.grade);
      if (gradeFilter === 'secondary') return ['6', '7', '8', '9'].includes(c.grade);
      if (gradeFilter === 'unassigned') return !c.homeroomTeacherName || !c.homeroomTeacherName.trim();
      return c.grade === gradeFilter;
    })
    .sort((a, b) => {
      const ga = parseInt(a.grade) || 0;
      const gb = parseInt(b.grade) || 0;
      if (ga !== gb) return ga - gb;
      return a.className.localeCompare(b.className, 'vi', { numeric: true });
    });

  // Filter for Homeroom Assignment Matrix
  const filteredAssignmentClasses = activeYearClasses
    .filter((c) => {
      if (gradeFilter === 'primary' && !['1', '2', '3', '4', '5'].includes(c.grade)) return false;
      if (gradeFilter === 'secondary' && !['6', '7', '8', '9'].includes(c.grade)) return false;
      if (gradeFilter === 'unassigned' && Boolean(c.homeroomTeacherName && c.homeroomTeacherName.trim())) return false;
      if (!['all', 'primary', 'secondary', 'unassigned'].includes(gradeFilter) && c.grade !== gradeFilter) return false;

      if (assignmentSearch.trim()) {
        const q = assignmentSearch.toLowerCase().trim();
        const matchClass = c.className.toLowerCase().includes(q);
        const matchTeacher = (c.homeroomTeacherName || '').toLowerCase().includes(q);
        const matchRoom = (c.roomNumber || '').toLowerCase().includes(q);
        return matchClass || matchTeacher || matchRoom;
      }
      return true;
    })
    .sort((a, b) => {
      const ga = parseInt(a.grade) || 0;
      const gb = parseInt(b.grade) || 0;
      if (ga !== gb) return ga - gb;
      return a.className.localeCompare(b.className, 'vi', { numeric: true });
    });

  // Teacher Map & Departments for lookup
  const teacherMap = useMemo(() => {
    const map = new Map<string, typeof teachers[0]>();
    teachers.forEach((t) => map.set(t.id, t));
    return map;
  }, [teachers]);

  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set);
  }, [teachers]);

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
      setSelectedTeacherId(cls.homeroomTeacherId || '');
      setClassTeacher(cls.homeroomTeacherName || '');
      setClassRoom(cls.roomNumber);
      setClassShift(cls.studyShift);
      setClassStudentCount(cls.studentCount);
      setClassNotes(cls.notes);
    } else {
      setEditingClass(null);
      setClassGrade('7');
      setClassName('7/2');
      setSelectedTeacherId('');
      setClassTeacher('');
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

    const tObj = selectedTeacherId ? teacherMap.get(selectedTeacherId) : null;
    const finalTeacherName = tObj ? tObj.fullName : classTeacher.trim();

    if (editingClass) {
      updateClass(editingClass.id, {
        grade: classGrade,
        className: className.trim(),
        homeroomTeacherId: selectedTeacherId,
        homeroomTeacherName: finalTeacherName,
        roomNumber: classRoom.trim(),
        studyShift: classShift,
        studentCount: classStudentCount,
        notes: classNotes,
      });
      setShowClassModal(false);
      showToast(`Đã cập nhật thông tin lớp ${className.trim()} thành công!`);
    } else {
      const res = addClass({
        schoolId: school.id,
        schoolYearId: currentSchoolYear.id,
        grade: classGrade,
        className: className.trim(),
        homeroomTeacherId: selectedTeacherId || '',
        homeroomTeacherName: finalTeacherName,
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
        showToast(`Đã thêm lớp ${className.trim()} mới thành công!`);
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
    showToast(`Đã xóa lớp ${deleteClassCandidate.className} khỏi hệ thống.`);
  };

  // Sync Homeroom Trigger
  const handleSyncHomeroom = () => {
    const report = syncHomeroomAssignments();
    setSyncReport(report);
    setShowSyncReportModal(true);
    showToast('Đồng bộ phân công GVCN thành công!');
  };

  // Export Homeroom Assignments
  const handleExportHomeroomExcel = () => {
    exportHomeroomAssignmentsToExcel(classes, teachers, currentSchoolYear, school);
    showToast('Đã tải xuống file Excel Bảng phân công GVCN thành công!');
  };

  // Inline Teacher Reassignment in Matrix
  const handleInlineAssignTeacher = (classId: string, newTeacherId: string) => {
    const res = assignHomeroomTeacher(classId, newTeacherId);
    if (res.success) {
      showToast(res.message);
    }
  };

  // Homeroom Statistics
  const totalClassesCount = activeYearClasses.length;
  const assignedClassesCount = activeYearClasses.filter((c) => c.homeroomTeacherName?.trim()).length;
  const unassignedClassesCount = totalClassesCount - assignedClassesCount;
  const assignmentPercent = totalClassesCount > 0 ? Math.round((assignedClassesCount / totalClassesCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs border border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
            <School className="w-5 h-5 text-sky-600" />
            QUẢN LÝ NĂM HỌC & LỚP HỌC (GIAI ĐOẠN 1)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập niên khóa, quản lý 33 lớp học (Khối 1 - 9) và đồng bộ phân công giáo viên chủ nhiệm
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSyncHomeroom}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            Đồng bộ GVCN
          </button>
          <button
            type="button"
            onClick={() => handleOpenYearModal()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" /> Thêm năm học
          </button>
          <button
            type="button"
            onClick={() => handleOpenClassModal()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  <div className="flex items-center gap-1.5">
                    {!isSelected && (
                      <button
                        onClick={() => selectSchoolYear(year.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Chọn năm này
                      </button>
                    )}
                    <button
                      onClick={() => toggleLockSchoolYear(year.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={isLocked ? 'Mở khóa năm học' : 'Khóa năm học'}
                    >
                      {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenYearModal(year)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!isSelected && (
                      <button
                        onClick={() => handleDeleteYear(year)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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

      {/* Section 2: Class Management & Homeroom Assignment Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Section 2 Tab Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <School className="w-4 h-4" />
              Danh sách Lớp học ({activeYearClasses.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('homeroom_assignment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
                activeTab === 'homeroom_assignment'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Phân công & Đồng bộ GVCN</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'homeroom_assignment'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-200 text-purple-900'
                }`}
              >
                {assignedClassesCount}/{totalClassesCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSyncHomeroom}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đồng bộ hai chiều dữ liệu lớp học, hồ sơ giáo viên và tài khoản phân quyền"
            >
              <Sparkles className="w-4 h-4" />
              Đồng bộ dữ liệu GVCN
            </button>

            <button
              type="button"
              onClick={handleExportHomeroomExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất bảng phân công GVCN ra file Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Excel phân công
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Nhập phân công GVCN từ file Excel (.xlsx)"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              Nhập từ Excel
            </button>
          </div>
        </div>

        {/* Tab 2: Phân công & Đồng bộ GVCN */}
        {activeTab === 'homeroom_assignment' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng số lớp</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">{totalClassesCount}</span>
                  <span className="text-xs text-slate-500">lớp toàn trường</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Tiểu học: 21 | THCS: 12</div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Đã phân công GVCN</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-700">{assignedClassesCount}</span>
                  <span className="text-xs text-emerald-600 font-bold">({assignmentPercent}%)</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">Đầy đủ thông tin liên lạc</div>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <span className="text-[11px] font-bold text-amber-800 uppercase">Chưa phân công</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-amber-700">{unassignedClassesCount}</span>
                  <span className="text-xs text-amber-600">lớp cần gán</span>
                </div>
                <div className="text-[10px] text-amber-600 mt-1">
                  {unassignedClassesCount === 0 ? 'Tất cả lớp đã có GVCN' : 'Cần phân công sớm'}
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl">
                <span className="text-[11px] font-bold text-purple-800 uppercase">Đồng bộ hai chiều</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-black text-purple-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    Nhất quán 100%
                  </span>
                </div>
                <div className="text-[10px] text-purple-600 mt-1">Lớp ⇄ Hồ sơ GV ⇄ Tài khoản</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">
                  Bộ lọc:
                </span>
                {[
                  { id: 'all', label: `Tất cả (${activeYearClasses.length})` },
                  {
                    id: 'primary',
                    label: `Tiểu học (${
                      activeYearClasses.filter((c) => ['1', '2', '3', '4', '5'].includes(c.grade))
                        .length
                    })`,
                  },
                  {
                    id: 'secondary',
                    label: `THCS (${
                      activeYearClasses.filter((c) => ['6', '7', '8', '9'].includes(c.grade)).length
                    })`,
                  },
                  {
                    id: 'unassigned',
                    label: `Chưa gán GV (${unassignedClassesCount})`,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGradeFilter(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      gradeFilter === item.id
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo lớp hoặc tên GVCN..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Assignment Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-100 text-[11px]">
                    <th className="p-3 text-center border-r border-slate-200 w-12">STT</th>
                    <th className="p-3 border-r border-slate-200 w-24">Cấp & Khối</th>
                    <th className="p-3 border-r border-slate-200 min-w-[100px] font-extrabold">
                      Tên lớp
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[280px]">
                      Phân công Giáo viên chủ nhiệm (Thay đổi trực tiếp)
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[170px]">
                      Tổ chuyên môn & Bộ môn
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[160px]">
                      Thông tin liên hệ
                    </th>
                    <th className="p-3 border-r border-slate-200 text-center w-36">
                      Trạng thái phân công
                    </th>
                    <th className="p-3 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAssignmentClasses.map((cls, idx) => {
                    const isPrimary = ['1', '2', '3', '4', '5'].includes(cls.grade);
                    const teacher = cls.homeroomTeacherId
                      ? teacherMap.get(cls.homeroomTeacherId)
                      : teachers.find(
                          (t) =>
                            t.fullName.toLowerCase().trim() ===
                            (cls.homeroomTeacherName || '').toLowerCase().trim()
                        );
                    const isAssigned = Boolean(cls.homeroomTeacherName && cls.homeroomTeacherName.trim());

                    return (
                      <tr key={cls.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="p-3 text-center text-slate-400 border-r border-slate-200">
                          {idx + 1}
                        </td>

                        <td className="p-3 border-r border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold block w-fit ${
                              isPrimary
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-sky-100 text-sky-900 border border-sky-200'
                            }`}
                          >
                            {isPrimary ? 'Tiểu học' : 'THCS'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            Khối {cls.grade}
                          </span>
                        </td>

                        <td className="p-3 border-r border-slate-200 font-black text-sm text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-purple-950">Lớp {cls.className}</span>
                            <span className="text-[10px] font-medium text-slate-400">
                              ({cls.studentCount} HS)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {cls.studyShift} • {cls.roomNumber}
                          </span>
                        </td>

                        <td className="p-3 border-r border-slate-200">
                          <select
                            value={cls.homeroomTeacherId || teacher?.id || ''}
                            onChange={(e) => handleInlineAssignTeacher(cls.id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition-all shadow-2xs"
                          >
                            <option value="">-- Chưa phân công GVCN --</option>
                            {departmentsList.map((dept) => (
                              <optgroup key={dept} label={`Tổ: ${dept}`}>
                                {teachers
                                  .filter((t) => t.department === dept)
                                  .map((t) => (
                                    <option key={t.id} value={t.id}>
                                      [{t.teacherCode}] {t.fullName} - {t.mainSubject}{' '}
                                      {t.isHomeroom && t.homeroomClassName
                                        ? t.homeroomClassId === cls.id
                                          ? `(Hiện tại)`
                                          : `(Đang CN ${t.homeroomClassName})`
                                        : ''}
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </td>

                        <td className="p-3 border-r border-slate-200">
                          {teacher ? (
                            <div>
                              <div className="font-bold text-slate-800">{teacher.department}</div>
                              <div className="text-[11px] text-slate-500">Môn: {teacher.mainSubject}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa gán tổ</span>
                          )}
                        </td>

                        <td className="p-3 border-r border-slate-200">
                          {teacher ? (
                            <div className="space-y-0.5 text-[11px]">
                              {teacher.phone && (
                                <div className="flex items-center gap-1 text-slate-700">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{teacher.phone}</span>
                                </div>
                              )}
                              {teacher.email && (
                                <div className="flex items-center gap-1 text-slate-500 truncate max-w-[180px]">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{teacher.email}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="p-3 text-center border-r border-slate-200">
                          {isAssigned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đã phân công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Chưa phân công
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {isAssigned && (
                            <button
                              type="button"
                              onClick={() => handleInlineAssignTeacher(cls.id, '')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hủy phân công GVCN cho lớp này"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 1: Danh sách Lớp học (Quản lý chung) */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            {/* Grade Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">
                Lọc khối:
              </span>
              {[
                { id: 'all', label: `Tất cả (${activeYearClasses.length})` },
                {
                  id: 'primary',
                  label: `Tiểu học (${
                    activeYearClasses.filter((c) => ['1', '2', '3', '4', '5'].includes(c.grade))
                      .length
                  })`,
                },
                {
                  id: 'secondary',
                  label: `THCS (${
                    activeYearClasses.filter((c) => ['6', '7', '8', '9'].includes(c.grade)).length
                  })`,
                },
                ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((g) => ({
                  id: g,
                  label: `Khối ${g} (${activeYearClasses.filter((c) => c.grade === g).length})`,
                })),
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGradeFilter(item.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    gradeFilter === item.id
                      ? 'bg-sky-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-3 text-center border-r border-slate-200 w-12">STT</th>
                    <th className="p-3 border-r border-slate-200">Khối</th>
                    <th className="p-3 border-r border-slate-200 font-bold min-w-[100px]">Tên lớp</th>
                    <th className="p-3 border-r border-slate-200 min-w-[200px]">
                      Giáo viên chủ nhiệm
                    </th>
                    <th className="p-3 border-r border-slate-200 text-center">Sĩ số</th>
                    <th className="p-3 border-r border-slate-200 min-w-[140px]">Phòng học</th>
                    <th className="p-3 border-r border-slate-200">Thời gian học</th>
                    <th className="p-3 border-r border-slate-200 min-w-[180px]">Ghi chú</th>
                    <th className="p-3 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedClasses.map((cls, idx) => {
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
                          {cls.homeroomTeacherName ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>{cls.homeroomTeacherName}</span>
                            </div>
                          ) : (
                            <span className="text-amber-600 italic">Chưa phân công</span>
                          )}
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
                        <td className="p-3 border-r border-slate-200 text-slate-500 text-[11px]">
                          {cls.notes}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!isSelectedClass && (
                              <button
                                onClick={() => selectClass(cls.id)}
                                className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Chọn lớp
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenClassModal(cls)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Sửa lớp"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
        )}
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
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 cursor-pointer"
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
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                    <optgroup label="Cấp Tiểu học">
                      <option value="1">Khối 1</option>
                      <option value="2">Khối 2</option>
                      <option value="3">Khối 3</option>
                      <option value="4">Khối 4</option>
                      <option value="5">Khối 5</option>
                    </optgroup>
                    <optgroup label="Cấp Trung học cơ sở (THCS)">
                      <option value="6">Khối 6</option>
                      <option value="7">Khối 7</option>
                      <option value="8">Khối 8</option>
                      <option value="9">Khối 9</option>
                    </optgroup>
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

              {/* Homeroom Teacher Selection from school teachers */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giáo viên chủ nhiệm (Chọn từ hồ sơ giáo viên) *
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTeacherId(tId);
                    const t = teacherMap.get(tId);
                    setClassTeacher(t ? t.fullName : '');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold bg-white"
                >
                  <option value="">-- Chưa phân công GVCN --</option>
                  {departmentsList.map((dept) => (
                    <optgroup key={dept} label={`Tổ chuyên môn: ${dept}`}>
                      {teachers
                        .filter((t) => t.department === dept)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.teacherCode}] {t.fullName} - {t.mainSubject}{' '}
                            {t.isHomeroom && t.homeroomClassName
                              ? `(Đang CN ${t.homeroomClassName})`
                              : ''}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
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
                    min={0}
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Homeroom Sync Report Modal */}
      <HomeroomSyncReportModal
        isOpen={showSyncReportModal}
        onClose={() => setShowSyncReportModal(false)}
        report={syncReport}
      />

      {/* Homeroom Assignment Import Modal */}
      <HomeroomAssignmentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(count) => {
          showToast(`Đã áp dụng phân công GVCN thành công cho ${count} lớp học!`);
        }}
      />

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
