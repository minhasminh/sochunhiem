import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  LayoutGrid,
  Award,
  HeartHandshake,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

interface PrintOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: 'seating' | 'officers' | 'parentReps';
}

export const PrintOrganizationModal: React.FC<PrintOrganizationModalProps> = ({
  isOpen,
  onClose,
  initialDocument = 'seating',
}) => {
  const {
    school,
    currentSchoolYear,
    currentClass,
    classroomConfig,
    seats,
    students,
    classOfficers,
    parentRepresentatives,
  } = useApp();

  const [activeDoc, setActiveDoc] = useState<'seating' | 'officers' | 'parentReps'>(
    initialDocument
  );

  if (!isOpen) return null;

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const handlePrint = () => {
    window.print();
  };

  const columnsList = Array.from({ length: classroomConfig.columns }, (_, i) => i + 1);
  const rowsList = Array.from({ length: classroomConfig.rows }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar (Hidden during printing) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Printer className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Xem Trước Bản In Sư Phạm (Khổ A4)</h3>
              <p className="text-xs text-sky-200">
                Sơ đồ chỗ ngồi, Danh sách cán bộ lớp & Ban đại diện CMHS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> In trang này (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Document Selector (Hidden during printing) */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 print:hidden overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveDoc('seating')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              activeDoc === 'seating'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            1. Sơ đồ chỗ ngồi (A4 Ngang)
          </button>
          <button
            onClick={() => setActiveDoc('officers')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              activeDoc === 'officers'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            2. Danh sách cán bộ lớp (A4 Đứng)
          </button>
          <button
            onClick={() => setActiveDoc('parentReps')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
              activeDoc === 'parentReps'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            3. Ban đại diện CMHS (A4 Đứng)
          </button>
        </div>

        {/* PRINTABLE A4 CONTAINER */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white custom-scrollbar print:p-0 print:overflow-visible">
          {/* 1. SƠ ĐỒ CHỖ NGỒI */}
          {activeDoc === 'seating' && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
              {/* Quốc hiệu tiêu ngữ */}
              <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-4">
                <div>
                  <div className="font-bold uppercase tracking-wider">{school.districtAuthority}</div>
                  <div className="font-black uppercase text-sm">{school.name}</div>
                  <div className="text-[11px] text-slate-600">Lớp: {currentClass?.className} • Phòng: {classroomConfig.notes || currentClass?.roomNumber}</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xs uppercase tracking-wide">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-xs underline decoration-1 underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Huế, ngày ..... tháng ..... năm 2026
                  </div>
                </div>
              </div>

              {/* Tiêu đề */}
              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  SƠ ĐỒ CHỖ NGỒI LỚP {currentClass?.className}
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  NĂM HỌC {currentSchoolYear.code} • GVCN: {currentClass?.homeroomTeacherName}
                </p>
              </div>

              {/* Sơ đồ trực quan */}
              <div className="border-2 border-slate-800 rounded-xl p-4 bg-slate-50/50">
                {/* BẢNG LỚP HỌC & BÀN GV */}
                <div className="grid grid-cols-12 gap-3 items-center mb-6">
                  <div className="col-span-3 text-xs font-bold text-slate-600">
                    [ Cửa ra vào ]
                  </div>
                  <div className="col-span-6 bg-slate-900 text-white font-black py-2.5 text-center text-xs tracking-wider rounded-lg uppercase shadow-xs">
                    BẢNG LỚP HỌC
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="inline-block px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-lg uppercase">
                      BÀN GIÁO VIÊN
                    </span>
                  </div>
                </div>

                {/* Các dãy bàn */}
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${classroomConfig.columns}, minmax(0, 1fr))`,
                  }}
                >
                  {columnsList.map((colNum) => (
                    <div key={`print-col-${colNum}`} className="space-y-2">
                      <div className="text-center font-black text-[11px] uppercase py-1 bg-slate-200 rounded-md">
                        DÃY {colNum} (TỔ {colNum})
                      </div>

                      {rowsList.map((rowNum) => {
                        const deskSeats = seats.filter(
                          (s) => s.column === colNum && s.row === rowNum
                        );

                        return (
                          <div
                            key={`print-col-${colNum}-row-${rowNum}`}
                            className="border border-slate-400 rounded-lg p-1.5 bg-white text-[10px]"
                          >
                            <div className="text-[9px] text-slate-500 font-bold mb-0.5">
                              Bàn {rowNum}
                            </div>
                            <div
                              className="grid gap-1"
                              style={{
                                gridTemplateColumns: `repeat(${classroomConfig.seatsPerDesk}, minmax(0, 1fr))`,
                              }}
                            >
                              {deskSeats.map((stSeat) => {
                                const st = stSeat.studentId ? studentMap.get(stSeat.studentId) : null;
                                return (
                                  <div
                                    key={stSeat.id}
                                    className="p-1 border border-slate-300 rounded-sm text-center min-h-[44px] flex flex-col justify-center"
                                  >
                                    {st ? (
                                      <>
                                        <div className="font-bold text-slate-900 leading-tight">
                                          {st.stt}. {st.fullName}
                                        </div>
                                        <div className="text-[9px] text-slate-500">
                                          ({st.gender})
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-slate-300 italic text-[9px]">Ghế trống</span>
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

              {/* Chữ ký */}
              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">HIỆU TRƯỞNG / BAN GIÁM HIỆU</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và đóng dấu)</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">{school.principalName}</div>
                </div>
                <div>
                  <div className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">{currentClass?.homeroomTeacherName}</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DANH SÁCH CÁN BỘ LỚP */}
          {activeDoc === 'officers' && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-4">
                <div>
                  <div className="font-bold uppercase tracking-wider">{school.districtAuthority}</div>
                  <div className="font-black uppercase text-sm">{school.name}</div>
                  <div className="text-[11px] text-slate-600">Lớp: {currentClass?.className}</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xs uppercase tracking-wide">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-xs underline decoration-1 underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  DANH SÁCH BAN CÁN SỰ & CÁN BỘ LỚP {currentClass?.className}
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  NĂM HỌC {currentSchoolYear.code} • GVCN: {currentClass?.homeroomTeacherName}
                </p>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-44">Chức vụ</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-48">Họ và tên học sinh</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 text-center w-20">Giới tính</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 text-center w-16">Tổ</th>
                    <th className="py-2.5 px-3 border-r border-slate-400">Nhiệm vụ được phân công</th>
                    <th className="py-2.5 px-3 text-center w-28">Số điện thoại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classOfficers.map((o, idx) => {
                    const st = studentMap.get(o.studentId);
                    return (
                      <tr key={o.id}>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-950">{o.role}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900">{st?.fullName || 'Chưa rõ'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">{st?.gender}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">Tổ {st?.groupNumber}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[11px] leading-relaxed">{o.duties}</td>
                        <td className="py-2 px-3 text-center font-mono">{st?.phone || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">DUYỆT CỦA BGH NHÀ TRƯỜNG</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">{school.principalName}</div>
                </div>
                <div>
                  <div className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">{currentClass?.homeroomTeacherName}</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. BAN ĐẠI DIỆN CMHS */}
          {activeDoc === 'parentReps' && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-4">
                <div>
                  <div className="font-bold uppercase tracking-wider">{school.districtAuthority}</div>
                  <div className="font-black uppercase text-sm">{school.name}</div>
                  <div className="text-[11px] text-slate-600">Ban Đại Diện CMHS Lớp {currentClass?.className}</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xs uppercase tracking-wide">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-xs underline decoration-1 underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  DANH SÁCH BAN ĐẠI DIỆN CHA MẸ HỌC SINH
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  LỚP {currentClass?.className} • NĂM HỌC {currentSchoolYear.code}
                </p>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-48">Họ và tên Phụ huynh</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-36">Chức vụ</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-32 text-center">Số điện thoại</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-44">Phụ huynh em (Học sinh)</th>
                    <th className="py-2.5 px-3">Nhiệm vụ phân công</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {parentRepresentatives.map((r, idx) => {
                    const st = studentMap.get(r.studentId);
                    return (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-950">{r.parentName}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-800">{r.role}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono font-bold text-sky-800">{r.phone}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-medium">{st ? `${st.fullName} (Tổ ${st.groupNumber})` : 'Chưa rõ'}</td>
                        <td className="py-2.5 px-3 text-[11px] leading-relaxed">{r.responsibilities}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">TRƯỞNG BAN ĐẠI DIỆN CMHS</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">
                    {parentRepresentatives.find((p) => p.role === 'Trưởng ban')?.parentName || 'Võ Quốc Dũng'}
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
                  <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-black text-slate-900">{currentClass?.homeroomTeacherName}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
