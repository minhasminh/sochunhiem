import React, { useState } from 'react';
import {
  X,
  Printer,
  ClipboardList,
  Calendar,
  CalendarRange,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PrintPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: 'yearly' | 'monthly' | 'schedule';
  selectedMonthId?: string;
}

export const PrintPlanModal: React.FC<PrintPlanModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'yearly',
  selectedMonthId,
}) => {
  const {
    school,
    currentSchoolYear,
    currentClass,
    yearlyPlan,
    monthlyPlans,
    scheduleWorkItems,
  } = useApp();

  const [activeDoc, setActiveDoc] = useState<'yearly' | 'monthly' | 'schedule'>(initialDoc);
  const [printMonthId, setPrintMonthId] = useState<string>(
    selectedMonthId || monthlyPlans[1]?.id || monthlyPlans[0]?.id || ''
  );

  if (!isOpen) return null;

  const activeMonthPlan = monthlyPlans.find((m) => m.id === printMonthId) || monthlyPlans[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Printer className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Xem Trước Bản In Kế Hoạch Chủ Nhiệm (Khổ A4)</h3>
              <p className="text-xs text-indigo-200">
                In Kế hoạch năm, Kế hoạch hoạt động tháng & Lịch công tác
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> In tài liệu (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Document Selector (Hidden on print) */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 print:hidden overflow-x-auto text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('yearly')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeDoc === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              1. Kế hoạch năm (A4)
            </button>
            <button
              onClick={() => setActiveDoc('monthly')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeDoc === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              2. Kế hoạch tháng (A4)
            </button>
            <button
              onClick={() => setActiveDoc('schedule')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeDoc === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              3. Lịch công việc (A4)
            </button>
          </div>

          {activeDoc === 'monthly' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Chọn tháng in:</span>
              <select
                value={printMonthId}
                onChange={(e) => setPrintMonthId(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              >
                {monthlyPlans.map((m) => (
                  <option key={m.id} value={m.id}>
                    Tháng {m.month}/{m.year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* PRINTABLE A4 CONTAINER */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white custom-scrollbar print:p-0 print:overflow-visible">
          {/* 1. KẾ HOẠCH NĂM */}
          {activeDoc === 'yearly' && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
              {/* Quốc hiệu Tiêu ngữ */}
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
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Huế, ngày ..... tháng ..... năm 2026
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM NĂM HỌC {currentSchoolYear.code}
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  LỚP {currentClass?.className} • GVCN: {currentClass?.homeroomTeacherName}
                </p>
              </div>

              {/* I. Mục tiêu & Chỉ tiêu */}
              <div className="space-y-2 text-xs">
                <div className="font-black uppercase text-slate-900">
                  I. MỤC TIÊU VÀ CHỈ TIÊU PHẤN ĐẤU CẢ NĂM HỌC
                </div>
                <p className="text-slate-800 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  "{yearlyPlan.generalGoal}"
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1">
                  <div>- Chỉ tiêu Rèn luyện (Hạnh kiểm): <strong>{yearlyPlan.targetsSummary.conductGoodRate}</strong></div>
                  <div>- Chỉ tiêu Học tập (Học lực): <strong>{yearlyPlan.targetsSummary.academicGoodRate}</strong></div>
                  <div>- Danh hiệu Chi đội: <strong>{yearlyPlan.targetsSummary.pioneerTitle}</strong></div>
                  <div>- Tỷ lệ chuyên cần: <strong>{yearlyPlan.targetsSummary.attendanceRate}</strong></div>
                </div>
              </div>

              {/* II. Nhiệm vụ và biện pháp */}
              <div className="space-y-2 text-xs">
                <div className="font-black uppercase text-slate-900">
                  II. NHIỆM VỤ TRỌNG TÂM, CHỈ TIÊU VÀ BIỆN PHÁP THỰC HIỆN
                </div>

                <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3 border-r border-slate-400 text-center w-10">STT</th>
                      <th className="py-2 px-3 border-r border-slate-400 w-48">Nhiệm vụ</th>
                      <th className="py-2 px-3 border-r border-slate-400 w-44">Chỉ tiêu</th>
                      <th className="py-2 px-3 border-r border-slate-400">Biện pháp thực hiện</th>
                      <th className="py-2 px-3 border-r border-slate-400 w-28">Thời gian & Người làm</th>
                      <th className="py-2 px-3 text-center w-24">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {yearlyPlan.tasks.map((task, idx) => (
                      <tr key={task.id}>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-950">{task.title}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[11px]">{task.target}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[11px] leading-relaxed">{task.measures}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">
                          <div className="font-bold">{task.timeframe}</div>
                          <div className="text-slate-500">{task.assignee}</div>
                        </td>
                        <td className="py-2 px-3 text-center text-[10px] font-bold">{task.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">PHÊ DUYỆT CỦA BGH NHÀ TRƯỜNG</div>
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

          {/* 2. KẾ HOẠCH THÁNG */}
          {activeDoc === 'monthly' && activeMonthPlan && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
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
                  KẾ HOẠCH HOẠT ĐỘNG GIÁO DỤC THÁNG {activeMonthPlan.month} NĂM {activeMonthPlan.year}
                </h1>
                <p className="text-xs font-bold text-indigo-900">
                  CHỦ ĐIỂM: "{activeMonthPlan.theme.toUpperCase()}"
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="font-bold uppercase text-slate-900 mb-1">1. Mục tiêu giáo dục tháng:</div>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {activeMonthPlan.goal}
                  </p>
                </div>

                <div>
                  <div className="font-bold uppercase text-slate-900 mb-1">2. Nội dung công việc trọng tâm:</div>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {activeMonthPlan.content}
                  </p>
                </div>

                <div>
                  <div className="font-bold uppercase text-slate-900 mb-1">3. Biện pháp thực hiện sư phạm:</div>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {activeMonthPlan.measures}
                  </p>
                </div>

                <div>
                  <div className="font-bold uppercase text-slate-900 mb-1">4. Các hoạt động trải nghiệm & phong trào thi đua:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {activeMonthPlan.activities.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Đánh giá kết quả đạt được:</div>
                    <p className="text-slate-700 italic">{activeMonthPlan.result || 'Đang thực hiện'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Nhận xét & Rút kinh nghiệm:</div>
                    <p className="text-slate-700 italic">{activeMonthPlan.comments || 'Chưa ghi'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">DUYỆT CỦA BGH</div>
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

          {/* 3. LỊCH CÔNG VIỆC */}
          {activeDoc === 'schedule' && (
            <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
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
                  LỊCH CÔNG TÁC CHỦ NHIỆM VÀ HOẠT ĐỘNG LỚP {currentClass?.className}
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  NĂM HỌC {currentSchoolYear.code} • GVCN: {currentClass?.homeroomTeacherName}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-slate-400 w-24">Ngày</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 min-w-[200px]">Nội dung công việc</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 text-center w-14">Tuần</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-44">Đối tượng tham gia</th>
                    <th className="py-2.5 px-3 border-r border-slate-400 w-36">Người phụ trách</th>
                    <th className="py-2.5 px-3 text-center w-28">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {scheduleWorkItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-900">{item.date}</td>
                      <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-900 leading-snug">{item.title}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">Tuần {item.weekNumber}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-[11px]">{item.targetAudience}</td>
                      <td className="py-2 px-3 border-r border-slate-300 text-[11px] font-medium">{item.assignee}</td>
                      <td className="py-2 px-3 text-center text-[10px] font-bold">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 text-center text-xs pt-8">
                <div>
                  <div className="font-bold uppercase">DUYỆT CỦA BGH</div>
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
        </div>
      </div>
    </div>
  );
};
