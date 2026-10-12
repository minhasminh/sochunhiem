import React, { useState, useMemo } from 'react';
import {
  User,
  Users,
  Clock,
  BookOpen,
  Smile,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Compass,
  Award,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { PrintPreviewModal } from '../print/PrintPreviewModal';

interface SingleStudentReportViewProps {
  initialStudentId?: string;
  onOpenPreview?: (contentId: string, title: string) => void;
}

export const SingleStudentReportView: React.FC<SingleStudentReportViewProps> = ({
  initialStudentId,
  onOpenPreview,
}) => {
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const {
    currentClass,
    currentSchoolYear,
    school,
    currentClassStudents,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    awardRecords,
    talentProfiles,
    studentSemesterComments,
    currentUser,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || currentClassStudents[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');

  const filteredStudents = useMemo(() => {
    return currentClassStudents.filter((st) => {
      if (filterGroup !== 'all' && st.groupNumber !== filterGroup) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return st.fullName.toLowerCase().includes(q) || st.studentCode.toLowerCase().includes(q);
    });
  }, [currentClassStudents, filterGroup, searchQuery]);

  const activeStudent = useMemo(() => {
    return (
      currentClassStudents.find((s) => s.id === selectedStudentId) ||
      currentClassStudents[0] ||
      null
    );
  }, [currentClassStudents, selectedStudentId]);

  // Comprehensive data aggregation for active student
  const studentData = useMemo(() => {
    if (!activeStudent) return null;

    // 1. Chuyên cần
    const attList = attendanceRecords.filter((r) => r.studentId === activeStudent.id);
    const present = attList.filter((r) => r.status === 'Có mặt').length;
    const excused = attList.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcused = attList.filter((r) => r.status === 'Nghỉ không phép').length;
    const late = attList.filter((r) => r.status === 'Đi muộn').length;
    const totalSessions = attList.length || 1;
    const attRate = Math.round(((totalSessions - (excused + unexcused)) / totalSessions) * 100);

    // 2. Học tập
    const scores = academicScores.filter((s) => s.studentId === activeStudent.id);
    const trackings = subjectTrackings.filter((t) => t.studentId === activeStudent.id);
    const numericScores = scores
      .map((s) => s.score)
      .filter((sc): sc is number => sc !== null && sc !== undefined);
    const avgScore =
      numericScores.length > 0
        ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
        : null;

    // 3. Rèn luyện
    const conducts = conductRecords.filter((c) => c.studentId === activeStudent.id);

    // 4. Vi phạm
    const violations = violationRecords.filter((v) => v.studentId === activeStudent.id);

    // 5. Tiến bộ
    const progressList = studentProgressEntries.filter((p) => p.studentId === activeStudent.id);

    // 6. Hoạt động
    const activities = classActivities.filter((a) =>
      a.participantStudentIds.includes(activeStudent.id)
    );

    // 7. Năng khiếu
    const talents = talentProfiles.filter((t) => t.studentId === activeStudent.id);

    // 8. Khen thưởng
    const awards = awardRecords.filter((aw) => aw.studentId === activeStudent.id);

    // 9. Nhận xét định kỳ
    const comments = studentSemesterComments.filter((c) => c.studentId === activeStudent.id);

    return {
      present,
      excused,
      unexcused,
      late,
      totalSessions,
      attRate,
      scores,
      trackings,
      avgScore,
      conducts,
      violations,
      progressList,
      activities,
      talents,
      awards,
      comments,
    };
  }, [
    activeStudent,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    classActivities,
    talentProfiles,
    awardRecords,
    studentSemesterComments,
  ]);

  const handlePrint = () => {
    window.print();
  };

  if (!activeStudent || !studentData) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 text-xs">Chưa có dữ liệu học sinh trong lớp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar (Screen only) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, mã học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <select
            value={filterGroup}
            onChange={(e) =>
              setFilterGroup(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            }
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="all">Tất cả các tổ</option>
            <option value={1}>Tổ 1</option>
            <option value={2}>Tổ 2</option>
            <option value={3}>Tổ 3</option>
            <option value={4}>Tổ 4</option>
          </select>

          <select
            value={activeStudent.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold rounded-xl text-xs"
          >
            {filteredStudents.map((st) => (
              <option key={st.id} value={st.id}>
                {st.stt}. {st.fullName} ({st.studentCode} - Tổ {st.groupNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (onOpenPreview) {
                onOpenPreview(
                  'student-dossier',
                  `Hồ sơ tổng hợp học sinh: ${activeStudent?.fullName || 'Học sinh'}`
                );
              } else {
                setInternalPreviewOpen(true);
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4" /> Xem trước khi in (Preview)
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-4 h-4" /> In Báo Cáo A4 / Xuất PDF
          </button>
        </div>
      </div>

      {/* Printable Comprehensive Student Dossier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs print:p-0 print:border-none print:shadow-none">
        {/* Document Administrative Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-600">
            <div>{school.districtAuthority}</div>
            <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          </div>
          <div className="flex items-center justify-between text-xs font-black uppercase text-slate-900">
            <div>{school.name}</div>
            <div>Độc lập - Tự do - Hạnh phúc</div>
          </div>
          <div className="pt-3">
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
              HỒ SƠ TỔNG HỢP THEO DÕI HỌC SINH
            </h2>
            <p className="text-[11px] text-slate-600">
              Lớp: <strong>{currentClass?.className}</strong> • Năm học: <strong>{currentSchoolYear.name}</strong> • GVCN: <strong>{currentClass?.homeroomTeacherName}</strong>
            </p>
          </div>
        </div>

        {/* Part 1: Sơ yếu lý lịch */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" /> I. THÔNG TIN LÝ LỊCH HỌC SINH
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800">
            <div>
              <span className="text-slate-500 text-[11px] block">Họ và tên:</span>
              <strong className="text-sm font-black text-slate-900">{activeStudent.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Mã học sinh:</span>
              <span className="font-mono font-bold text-indigo-900">{activeStudent.studentCode}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Ngày sinh:</span>
              <span className="font-medium">{activeStudent.birthDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Giới tính / Dân tộc:</span>
              <span className="font-medium">
                {activeStudent.gender} • {activeStudent.ethnicity || 'Kinh'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Phân công tổ:</span>
              <span className="font-bold text-slate-800">Tổ {activeStudent.groupNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Diện chính sách:</span>
              <span>{activeStudent.policyPriority || 'Không'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[11px] block">Địa chỉ thường trú:</span>
              <span>{activeStudent.address || 'Đang cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Họ tên Cha / Mẹ:</span>
              <span>{activeStudent.fatherName || activeStudent.motherName || 'Đang cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">SĐT Phụ huynh:</span>
              <span className="font-mono">{activeStudent.fatherPhone || activeStudent.motherPhone || 'Chưa có SĐT'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[11px] block">Ghi chú hoàn cảnh:</span>
              <span>{activeStudent.notes || 'Bình thường'}</span>
            </div>
          </div>
        </div>

        {/* Part 2: Chuyên cần & Điểm danh */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" /> II. THEO DÕI CHUYÊN CẦN & ĐIỂM DANH
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-emerald-800 uppercase font-bold">Tỷ lệ chuyên cần</div>
              <div className="text-lg font-black text-emerald-700">{studentData.attRate}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Số buổi có mặt</div>
              <div className="text-lg font-black text-slate-800">{studentData.present} buổi</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Nghỉ có phép</div>
              <div className="text-lg font-black text-blue-700">{studentData.excused} buổi</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Nghỉ không phép</div>
              <div className="text-lg font-black text-rose-700">{studentData.unexcused} buổi</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Đi muộn</div>
              <div className="text-lg font-black text-amber-700">{studentData.late} lần</div>
            </div>
          </div>
        </div>

        {/* Part 3: Kết quả học tập (TT22) */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" /> III. KẾT QUẢ ĐÁNH GIÁ CÁC MÔN HỌC (TT 22/2021/TT-BGDĐT)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-700 uppercase text-[10px]">
                  <th className="py-2 px-3 w-10">STT</th>
                  <th className="py-2 px-3">Môn học</th>
                  <th className="py-2 px-3 text-center w-24">Đánh giá / Điểm TB</th>
                  <th className="py-2 px-3">Ghi chú & Theo dõi của GVCN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  'Toán',
                  'Ngữ văn',
                  'Tiếng Anh',
                  'Khoa học tự nhiên',
                  'Lịch sử và Địa lí',
                  'Giáo dục công dân',
                  'Tin học',
                  'Công nghệ',
                  'Giáo dục thể chất',
                  'Nghệ thuật (Âm nhạc, Mĩ thuật)',
                  'Hoạt động trải nghiệm, hướng nghiệp',
                  'Nội dung giáo dục địa phương',
                ].map((sub, idx) => {
                  const scoreRec = studentData.scores.find((s) => s.subjectName === sub);
                  const trackRec = studentData.trackings.find((t) => t.subjectName === sub);

                  return (
                    <tr key={sub} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">{sub}</td>
                      <td className="py-1.5 px-3 text-center font-bold">
                        {scoreRec?.score !== null && scoreRec?.score !== undefined ? (
                          <span
                            className={
                              scoreRec.score >= 8.0
                                ? 'text-blue-700'
                                : scoreRec.score >= 6.5
                                ? 'text-emerald-700'
                                : scoreRec.score >= 5.0
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {scoreRec.score.toFixed(1)}
                          </span>
                        ) : scoreRec?.evaluationGrade ? (
                          <span className="text-emerald-700">{scoreRec.evaluationGrade}</span>
                        ) : (
                          <span className="text-slate-400">Đạt</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">
                        {trackRec?.notes || (trackRec?.trackingStatus ? `Tình trạng: ${trackRec.trackingStatus}` : 'Hoàn thành chương trình')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 4: Rèn luyện, Nề nếp & Vi phạm */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-pink-600" /> IV. THEO DÕI RÈN LUYỆN ĐẠO ĐỨC & NỀ NẾP
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <strong className="block text-slate-900">Xếp loại rèn luyện qua các kỳ:</strong>
              {studentData.conducts.length === 0 ? (
                <p className="text-slate-600">Xếp loại Rèn luyện: <strong>Tốt</strong> (Chấp hành tốt mọi quy định).</p>
              ) : (
                <ul className="space-y-1">
                  {studentData.conducts.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <span>{c.term}:</span>
                      <span className="font-bold text-pink-700">{c.grade}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <strong className="block text-slate-900">Ghi nhận vi phạm & sự tiến bộ:</strong>
              <div className="text-slate-700 space-y-1">
                <div>
                  Vi phạm nề nếp: <strong>{studentData.violations.length} vụ việc</strong>{' '}
                  {studentData.violations.length === 0 ? '(Gương mẫu)' : ''}
                </div>
                <div>
                  Tiến bộ được ghi nhận: <strong>{studentData.progressList.length} lượt</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 5: Hoạt động, Năng khiếu & Khen thưởng */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" /> V. HOẠT ĐỘNG, NĂNG KHIẾU & KHEN THƯỞNG
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Năng khiếu nổi bật:</span>
              <strong className="text-purple-900">
                {studentData.talents.length > 0
                  ? studentData.talents.map((t) => `${t.field} (${t.talentDescription})`).join(', ')
                  : 'Tham gia phong trào tập thể tốt'}
              </strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Hoạt động tập thể:</span>
              <strong className="text-teal-900">
                {studentData.activities.length} hoạt động lớp đã tham gia
              </strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Thành tích khen thưởng:</span>
              <strong className="text-amber-900">
                {studentData.awards.length > 0
                  ? studentData.awards.map((a) => a.achievement).join(', ')
                  : 'Đạt danh hiệu rèn luyện tốt'}
              </strong>
            </div>
          </div>
        </div>

        {/* Part 6: Lời nhận xét chính thức của GVCN */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-indigo-950 uppercase border-b border-indigo-100 pb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> VI. NHẬN XÉT CỦA GIÁO VIÊN CHỦ NHIỆM
          </h3>

          <div className="space-y-2">
            {(['HKI', 'HKII', 'Cả năm'] as const).map((period) => {
              const comm = studentData.comments.find((c) => c.period === period);
              return (
                <div key={period} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-indigo-900 mb-0.5">Nhận xét đợt {period}:</div>
                  <p className="text-slate-700 italic">
                    {comm?.teacherComment
                      ? `"${comm.teacherComment}"`
                      : `Học sinh ${activeStudent.fullName} có ý thức nếp sống tốt, hoàn thành nhiệm vụ học tập và rèn luyện.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Administrative Signature Block */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
          <div className="space-y-16">
            <div>
              <div className="font-bold text-slate-900 uppercase">BAN GIÁM HIỆU DUYỆT</div>
              <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
            </div>
            <div className="font-bold text-slate-900">{school.principalName || 'Thầy Hiệu Trưởng'}</div>
          </div>

          <div className="space-y-16">
            <div>
              <div className="font-bold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
            </div>
            <div className="font-bold text-slate-900">
              {currentClass?.homeroomTeacherName || currentUser?.name || 'Cô Lê Thị Kim Ánh'}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Print Preview Modal */}
      <PrintPreviewModal
        isOpen={internalPreviewOpen}
        onClose={() => setInternalPreviewOpen(false)}
        documentTitle={`Hồ sơ tổng hợp học sinh: ${activeStudent?.fullName || ''}`}
      >
        <SingleStudentReportView initialStudentId={selectedStudentId} />
      </PrintPreviewModal>
    </div>
  );
};
