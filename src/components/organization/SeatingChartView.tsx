import React, { useState } from 'react';
import {
  LayoutGrid,
  Search,
  Settings,
  Sparkles,
  Printer,
  RotateCcw,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  DoorOpen,
  Monitor,
  GraduationCap,
  X,
  ArrowLeftRight,
  Eye,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeskSeat, Student } from '../../types';
import { ClassroomConfigModal } from './ClassroomConfigModal';
import { AutoAssignModal } from './AutoAssignModal';

interface SeatingChartViewProps {
  onOpenPrint?: () => void;
}

export const SeatingChartView: React.FC<SeatingChartViewProps> = ({ onOpenPrint }) => {
  const {
    classroomConfig,
    seats,
    students,
    currentClassStudents,
    currentClass,
    currentSchoolYear,
    school,
    updateSeatAssignment,
    swapSeats,
    clearAllSeats,
    resetSeatsToDefault,
    setSelectedStudent,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<'Đầu năm' | 'Học kỳ I' | 'Học kỳ II'>('Đầu năm');
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Map student ID to student entity
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Determine students who are currently seated
  const seatedStudentIds = new Set(seats.map((s) => s.studentId).filter(Boolean) as string[]);
  const unassignedStudents = currentClassStudents.filter((s) => !seatedStudentIds.has(s.id));

  // Stats
  const totalSeats = seats.length;
  const occupiedSeatsCount = seatedStudentIds.size;
  const emptySeatsCount = totalSeats - occupiedSeatsCount;

  // Search match logic
  const matchedStudentId = searchTerm.trim()
    ? currentClassStudents.find(
        (s) =>
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          s.studentCode.includes(searchTerm.trim())
      )?.id
    : null;

  // Handle click on seat for click-to-swap
  const handleSeatClick = (seat: DeskSeat) => {
    if (!isAuthorized) {
      if (seat.studentId) {
        const st = studentMap.get(seat.studentId);
        if (st) setSelectedStudent(st);
      }
      return;
    }

    if (!selectedSeatId) {
      // First click: select seat
      setSelectedSeatId(seat.id);
    } else if (selectedSeatId === seat.id) {
      // Click same seat: deselect
      setSelectedSeatId(null);
    } else {
      // Second click on different seat: swap them
      swapSeats(selectedSeatId, seat.id);
      setSelectedSeatId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStartFromSeat = (e: React.DragEvent, seatId: string) => {
    if (!isAuthorized) return;
    setDraggedSeatId(seatId);
    setDraggedStudentId(null);
    e.dataTransfer.setData('text/plain', seatId);
  };

  const handleDragStartFromUnassigned = (e: React.DragEvent, studentId: string) => {
    if (!isAuthorized) return;
    setDraggedStudentId(studentId);
    setDraggedSeatId(null);
    e.dataTransfer.setData('text/plain', studentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAuthorized) return;
    e.preventDefault();
  };

  const handleDropOnSeat = (e: React.DragEvent, targetSeatId: string) => {
    if (!isAuthorized) return;
    e.preventDefault();

    if (draggedSeatId) {
      if (draggedSeatId !== targetSeatId) {
        swapSeats(draggedSeatId, targetSeatId);
      }
      setDraggedSeatId(null);
    } else if (draggedStudentId) {
      updateSeatAssignment(targetSeatId, draggedStudentId);
      setDraggedStudentId(null);
    }
  };

  // Organize seats by Column and Row for rendering
  // columns = classroomConfig.columns (1..columns)
  // rows = classroomConfig.rows (1..rows)
  const columnsList = Array.from({ length: classroomConfig.columns }, (_, i) => i + 1);
  const rowsList = Array.from({ length: classroomConfig.rows }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  SƠ ĐỒ CHỖ NGỒI LỚP {currentClass?.className || '7/1'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {currentSchoolYear.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Phòng: {classroomConfig.notes || currentClass?.roomNumber || 'P.204'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy mô: {classroomConfig.columns} dãy × {classroomConfig.rows} bàn ({totalSeats} chỗ ngồi) • Đã xếp: {occupiedSeatsCount}/{currentClassStudents.length} học sinh
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Term selector */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="Đầu năm">Sơ đồ: Đầu năm</option>
            <option value="Học kỳ I">Sơ đồ: Học kỳ I</option>
            <option value="Học kỳ II">Sơ đồ: Học kỳ II</option>
          </select>

          {isAuthorized && (
            <>
              <button
                onClick={() => setShowAutoAssignModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
                title="Tự động xếp chỗ theo tiêu chí hoặc AI"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Tự động xếp
              </button>

              <button
                onClick={() => setShowConfigModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Cấu hình số dãy, số bàn, vị trí phòng học"
              >
                <Settings className="w-4 h-4" />
                Cấu hình lớp
              </button>

              <button
                onClick={resetSeatsToDefault}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Khôi phục sắp xếp chuẩn 4 tổ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={clearAllSeats}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                title="Xóa tất cả chỗ ngồi trên sơ đồ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In sơ đồ
            </button>
          )}
        </div>
      </div>

      {/* Search & Selection Notification Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm học sinh trên sơ đồ (Tên hoặc Mã)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Seat State */}
        {selectedSeatId ? (
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 font-medium">
            <ArrowLeftRight className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              Đang chọn ghế <strong>{selectedSeatId}</strong>. Bấm vào bất kỳ ghế nào khác để <strong>đổi chỗ ngay</strong>!
            </span>
            <button
              onClick={() => setSelectedSeatId(null)}
              className="ml-2 text-amber-700 hover:text-amber-900 font-bold underline"
            >
              Hủy chọn
            </button>
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span className="hidden sm:inline">💡 Hướng dẫn:</span>
            <span>Bấm vào 1 ghế rồi bấm ghế khác để <strong>đổi chỗ</strong>, hoặc <strong>kéo thả</strong> trực tiếp.</span>
          </div>
        )}

        {/* Unassigned count tag */}
        {unassignedStudents.length > 0 && (
          <div className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
            Còn {unassignedStudents.length} học sinh chưa có chỗ ngồi
          </div>
        )}
      </div>

      {/* MAIN CLASSROOM LAYOUT CANVAS */}
      <div className="bg-slate-100/90 rounded-3xl p-5 sm:p-7 border border-slate-300 shadow-inner relative overflow-x-auto">
        {/* FRONT OF CLASSROOM: BẢNG VIẾT & BÀN GIÁO VIÊN & CỬA RA VÀO */}
        <div className="max-w-5xl mx-auto mb-8 relative">
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Left Area (Door if left, or placeholder) */}
            <div className="col-span-3 flex items-center gap-2">
              {classroomConfig.doorPosition.includes('left') && (
                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 flex items-center gap-2 text-xs font-bold shadow-xs">
                  <DoorOpen className="w-5 h-5 text-amber-600" />
                  <span>Cửa Ra Vào</span>
                </div>
              )}
              {classroomConfig.teacherDeskPosition === 'top-left' && (
                <div className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl shadow-md border border-amber-800 flex items-center gap-2.5 text-xs font-bold">
                  <Monitor className="w-5 h-5 text-amber-200" />
                  <div>
                    <div className="uppercase text-[10px] tracking-wider text-amber-200">Khu vực sư phạm</div>
                    <div>BÀN GIÁO VIÊN</div>
                  </div>
                </div>
              )}
            </div>

            {/* Center Area: BẢNG LỚP HỌC (Blackboard / Green chalkboard style) */}
            <div className="col-span-6">
              <div className="bg-emerald-950 text-white py-3.5 px-6 rounded-2xl border-4 border-emerald-900 shadow-lg text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-50" />
                <div className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-bold">
                  Phía trước lớp học
                </div>
                <div className="text-sm sm:text-base font-black tracking-wider text-white">
                  BẢNG LỚP HỌC
                </div>
                <div className="text-[10px] text-emerald-300/80">
                  {school.name} • Lớp {currentClass?.className}
                </div>
              </div>
            </div>

            {/* Right Area: Teacher desk (Top-Right per Page 11 of document) or Door */}
            <div className="col-span-3 flex items-center justify-end gap-2">
              {classroomConfig.teacherDeskPosition === 'top-right' && (
                <div className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl shadow-md border border-amber-800 flex items-center gap-2.5 text-xs font-bold">
                  <Monitor className="w-5 h-5 text-amber-200" />
                  <div>
                    <div className="uppercase text-[10px] tracking-wider text-amber-200">Khu vực sư phạm</div>
                    <div>BÀN GIÁO VIÊN</div>
                  </div>
                </div>
              )}

              {classroomConfig.doorPosition.includes('right') && (
                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 flex items-center gap-2 text-xs font-bold shadow-xs">
                  <DoorOpen className="w-5 h-5 text-amber-600" />
                  <span>Cửa Ra Vào</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESK GRID: Columns (Dãy) and Rows (Bàn) */}
        <div className="max-w-5xl mx-auto">
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${classroomConfig.columns}, minmax(180px, 1fr))`,
            }}
          >
            {columnsList.map((colNum) => (
              <div key={`col-${colNum}`} className="space-y-4">
                {/* Column / Group Header */}
                <div className="text-center py-2 px-3 bg-sky-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-300" />
                  <span>DÃY {colNum} (TỔ {colNum})</span>
                </div>

                {/* Rows in this column */}
                {rowsList.map((rowNum) => {
                  // Get seats belonging to this column and row
                  const deskSeats = seats.filter(
                    (s) => s.column === colNum && s.row === rowNum
                  );

                  return (
                    <div
                      key={`col-${colNum}-row-${rowNum}`}
                      className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border-2 border-slate-300/80 shadow-xs hover:border-sky-400 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1.5 px-1">
                        <span>Bàn {rowNum}</span>
                        {rowNum === 1 && (
                          <span className="text-[9px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded-sm border border-sky-100">
                            Bàn đầu
                          </span>
                        )}
                      </div>

                      {/* Seats in this Desk */}
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${classroomConfig.seatsPerDesk}, minmax(0, 1fr))`,
                        }}
                      >
                        {deskSeats.map((seat) => {
                          const student = seat.studentId ? studentMap.get(seat.studentId) : null;
                          const isSelected = selectedSeatId === seat.id;
                          const isMatchedSearch = student && student.id === matchedStudentId;
                          const isBoy = student?.gender === 'Nam';

                          return (
                            <div
                              key={seat.id}
                              draggable={isAuthorized && !!student}
                              onDragStart={(e) => handleDragStartFromSeat(e, seat.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropOnSeat(e, seat.id)}
                              onClick={() => handleSeatClick(seat)}
                              className={`p-2 rounded-xl transition-all cursor-pointer relative select-none min-h-[92px] flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-amber-100 border-2 border-amber-500 shadow-md ring-2 ring-amber-400 ring-offset-1'
                                  : isMatchedSearch
                                  ? 'bg-emerald-100 border-2 border-emerald-500 shadow-md ring-4 ring-emerald-300 animate-pulse'
                                  : student
                                  ? isBoy
                                    ? 'bg-sky-50/90 hover:bg-sky-100/90 border border-sky-200 text-sky-950 shadow-xs'
                                    : 'bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200 text-rose-950 shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 text-slate-400'
                              }`}
                            >
                              {/* Seat Header (Seat number & unassign button) */}
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  G{seat.seatNumber}
                                </span>

                                {student && isAuthorized && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateSeatAssignment(seat.id, null);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white/80 transition-colors"
                                    title="Gỡ học sinh khỏi ghế này"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {/* Student Information inside Seat */}
                              {student ? (
                                <div className="space-y-1 text-center my-auto">
                                  <div className="text-[10px] font-black tracking-tight text-slate-500">
                                    STT {student.stt}
                                  </div>
                                  <div className="font-extrabold text-xs text-slate-900 leading-tight line-clamp-2">
                                    {student.fullName}
                                  </div>

                                  {/* Badges */}
                                  <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                                    <span
                                      className={`text-[9px] px-1 py-0.2 rounded-sm font-bold ${
                                        isBoy ? 'bg-sky-200 text-sky-900' : 'bg-rose-200 text-rose-900'
                                      }`}
                                    >
                                      {student.gender}
                                    </span>

                                    {student.needsSupport && (
                                      <span
                                        className="text-[9px] px-1 py-0.2 rounded-sm font-bold bg-amber-200 text-amber-900"
                                        title="Học sinh cần hỗ trợ"
                                      >
                                        Hỗ trợ
                                      </span>
                                    )}

                                    {student.hasProgress && (
                                      <span
                                        className="text-[9px] px-1 py-0.2 rounded-sm font-bold bg-emerald-200 text-emerald-900"
                                        title="Học sinh có tiến bộ"
                                      >
                                        Tiến bộ
                                      </span>
                                    )}

                                    {student.hasSpecialTalent && (
                                      <span
                                        className="text-[9px] px-1 py-0.2 rounded-sm font-bold bg-purple-200 text-purple-900"
                                        title="Năng khiếu"
                                      >
                                        NK
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center my-auto text-slate-400">
                                  <div className="text-xs font-semibold">+ Ghế trống</div>
                                  <div className="text-[9px]">Click để xếp</div>
                                </div>
                              )}

                              {/* Bottom Footer Code */}
                              {student && (
                                <div className="text-[9px] text-slate-400 font-mono text-center">
                                  {student.studentCode.slice(-4)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* REAR OF CLASSROOM: DOOR IF REAR */}
        {(classroomConfig.doorPosition === 'bottom-left' || classroomConfig.doorPosition === 'bottom-right') && (
          <div className="max-w-5xl mx-auto mt-6 flex justify-end">
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 flex items-center gap-2 text-xs font-bold shadow-xs">
              <DoorOpen className="w-5 h-5 text-amber-600" />
              <span>Cửa Ra Vào (Phía sau)</span>
            </div>
          </div>
        )}
      </div>

      {/* UNASSIGNED STUDENTS TRAY (Danh sách học sinh chờ xếp chỗ) */}
      {unassignedStudents.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Danh Sách Học Sinh Chưa Xếp Chỗ ({unassignedStudents.length} em)</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Kéo thả học sinh vào một ghế trống trên sơ đồ, hoặc click vào học sinh rồi click vào ghế.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {unassignedStudents.map((st) => (
              <div
                key={st.id}
                draggable={isAuthorized}
                onDragStart={(e) => handleDragStartFromUnassigned(e, st.id)}
                onClick={() => {
                  if (!isAuthorized) return;
                  // If a seat is selected, assign to it!
                  if (selectedSeatId) {
                    updateSeatAssignment(selectedSeatId, st.id);
                    setSelectedSeatId(null);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer select-none ${
                  st.gender === 'Nam'
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>STT {st.stt}</span>
                  <span>Tổ {st.groupNumber}</span>
                </div>
                <div className="font-bold text-slate-900 truncate mt-0.5">{st.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{st.studentCode}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ClassroomConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />

      <AutoAssignModal
        isOpen={showAutoAssignModal}
        onClose={() => setShowAutoAssignModal(false)}
      />
    </div>
  );
};
