import React, { useState } from 'react';
import {
  User,
  Users,
  BookOpen,
  Smile,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Compass,
  Award,
  MessageSquare,
  Lock,
  Unlock,
  Edit,
  X,
  Phone,
  Calendar,
  CheckCircle2,
  Hammer,
  UserCheck,
  ShieldAlert,
  HeartHandshake,
  ArrowRight,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

interface StudentProfileViewProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

type ProfileTab =
  | 'general'
  | 'family'
  | 'academic'
  | 'conduct'
  | 'attendance'
  | 'violations'
  | 'progress'
  | 'talents'
  | 'activities'
  | 'awards'
  | 'comments';

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  const {
    toggleLockStudent,
    updateStudent,
    currentUser,
    attendanceRecords,
    academicScores,
    subjectTrackings,
    conductRecords,
    violationRecords,
    studentProgressEntries,
    studentSupportTags,
    classActivities,
    awardRecords,
    talentProfiles,
    studentSemesterComments,
    setActiveMenu,
  } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>('general');
  const [teacherComment, setTeacherComment] = useState<string>(student?.notes || '');
  const [savedCommentSuccess, setSavedCommentSuccess] = useState(false);

  if (!student) return null;

  const isLocked = student.status === 'locked';
  const isAuthorized = currentUser?.role === 'GVCN' || currentUser?.role === 'ADMIN';

  // Real Attendance records for this student
  const studentAttRecords = attendanceRecords
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = studentAttRecords.filter((r) => r.status === 'Có mặt').length;
  const excusedCount = studentAttRecords.filter((r) => r.status === 'Nghỉ có phép').length;
  const unexcusedCount = studentAttRecords.filter((r) => r.status === 'Nghỉ không phép').length;
  const lateCount = studentAttRecords.filter((r) => r.status === 'Đi muộn').length;
  const earlyCount = studentAttRecords.filter((r) => r.status === 'Về sớm').length;
  const totalSessions = studentAttRecords.length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round(((totalSessions - (excusedCount + unexcusedCount)) / totalSessions) * 100)
      : 100;

  // Real Academic scores for this student
  const studentScores = academicScores.filter((s) => s.studentId === student.id);
  const studentTrackingsList = subjectTrackings.filter((t) => t.studentId === student.id);

  // Giai đoạn 6: Rèn luyện, Vi phạm, Tiến bộ & Diện cần hỗ trợ
  const studentConductList = conductRecords.filter((r) => r.studentId === student.id);
  const studentViolationsList = violationRecords
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const studentProgressTimeline = studentProgressEntries
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const studentSupportList = studentSupportTags.filter((t) => t.studentId === student.id);

  // Giai đoạn 7: Hoạt động, Khen thưởng & Năng khiếu
  const studentActivitiesList = classActivities.filter((a) =>
    a.participantStudentIds.includes(student.id)
  );
  const studentAwardsList = awardRecords.filter((aw) => aw.studentId === student.id);
  const studentTalentProfilesList = talentProfiles.filter((tp) => tp.studentId === student.id);

  const handleSaveComment = () => {
    updateStudent(student.id, { notes: teacherComment });
    setSavedCommentSuccess(true);
    setTimeout(() => setSavedCommentSuccess(false), 2000);
  };

  const tabs: Array<{ id: ProfileTab; label: string; icon: React.ElementType; isImplemented: boolean }> = [
    { id: 'general', label: 'Thông tin chung', icon: User, isImplemented: true },
    { id: 'family', label: 'Gia đình', icon: Users, isImplemented: true },
    { id: 'academic', label: 'Học tập', icon: BookOpen, isImplemented: true },
    { id: 'conduct', label: 'Rèn luyện', icon: Smile, isImplemented: true },
    { id: 'attendance', label: 'Điểm danh', icon: Clock, isImplemented: true },
    { id: 'violations', label: 'Vi phạm', icon: AlertTriangle, isImplemented: true },
    { id: 'progress', label: 'Tiến bộ', icon: TrendingUp, isImplemented: true },
    { id: 'talents', label: 'Năng khiếu', icon: Sparkles, isImplemented: true },
    { id: 'activities', label: 'Hoạt động', icon: Compass, isImplemented: true },
    { id: 'awards', label: 'Khen thưởng', icon: Award, isImplemented: true },
    { id: 'comments', label: 'Nhận xét', icon: MessageSquare, isImplemented: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-4">
        {/* Profile Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black shadow-inner uppercase">
              {student.fullName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{student.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-sky-100 border border-white/20">
                  Mã: {student.studentCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isLocked ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  {isLocked ? 'Đã khóa hồ sơ' : 'Đang học'}
                </span>
              </div>

              <div className="text-xs text-sky-100 mt-1 flex items-center gap-3 flex-wrap">
                <span>STT: {student.stt}</span>
                <span>•</span>
                <span>Tổ {student.groupNumber}</span>
                <span>•</span>
                <span>Sinh ngày: {student.birthDate} ({student.gender})</span>
                <span>•</span>
                <span>Dân tộc: {student.ethnicity}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthorized && (
              <>
                <button
                  onClick={() => onEdit(student)}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Sửa
                </button>
                <button
                  onClick={() => toggleLockStudent(student.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isLocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                  title={isLocked ? 'Mở khóa hồ sơ' : 'Khóa hồ sơ học sinh'}
                >
                  {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {isLocked ? 'Mở khóa' : 'Khóa hồ sơ'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Exactly matching the 11 tabs from Section 5) */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {!tab.isImplemented && (
                  <span className="text-[9px] px-1 py-0.2 rounded-sm bg-slate-200 text-slate-500 font-normal">
                    Kế hoạch
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs custom-scrollbar space-y-4">
          {/* TAB 1: THÔNG TIN CHUNG */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-sky-900 uppercase text-[11px] pb-1 border-b border-slate-200">
                    Lý lịch & Liên hệ
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Mã học sinh:</span>
                    <span className="font-bold text-slate-900 font-mono">{student.studentCode}</span>

                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900">{student.fullName}</span>

                    <span className="text-slate-500">Ngày sinh:</span>
                    <span className="text-slate-800 font-medium">{student.birthDate}</span>

                    <span className="text-slate-500">Giới tính:</span>
                    <span className="text-slate-800">{student.gender}</span>

                    <span className="text-slate-500">Dân tộc:</span>
                    <span className="text-slate-800">{student.ethnicity}</span>

                    <span className="text-slate-500">Số điện thoại HS:</span>
                    <span className="text-slate-800 font-mono">{student.phone || 'Chưa có SĐT'}</span>

                    <span className="text-slate-500">Tổ học tập:</span>
                    <span className="font-bold text-sky-800">Tổ {student.groupNumber}</span>

                    <span className="text-slate-500">Trạng thái:</span>
                    <span className={`font-bold ${isLocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isLocked ? 'Đã khóa hồ sơ' : 'Đang học'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-sky-900 uppercase text-[11px] pb-1 border-b border-slate-200">
                    Địa chỉ & Nơi ở
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-slate-500 text-[11px]">Địa chỉ thường trú:</div>
                      <div className="font-medium text-slate-800 mt-0.5">{student.address || 'Chưa có dữ liệu'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[11px]">Nơi ở hiện nay:</div>
                      <div className="font-medium text-slate-800 mt-0.5">{student.residence || 'Chưa có dữ liệu'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Tags */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Phân loại & Diện theo dõi:</div>
                <div className="flex flex-wrap gap-2">
                  {student.isPoorHousehold && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      Hộ nghèo (/GCN-HN.HCN)
                    </span>
                  )}
                  {student.needsSupport && (
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                      Cần hỗ trợ
                    </span>
                  )}
                  {student.hasProgress && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      Có tiến bộ
                    </span>
                  )}
                  {student.hasSpecialTalent && (
                    <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                      Năng khiếu
                    </span>
                  )}
                  {student.needsAttention && (
                    <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-bold">
                      Cần quan tâm
                    </span>
                  )}
                  {!student.isPoorHousehold && !student.needsSupport && !student.needsAttention && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                      Học sinh phát triển bình thường
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GIA ĐÌNH */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-sky-900">Thông tin Cha</div>
                  <div className="space-y-1 text-slate-700">
                    <div>Họ tên: <strong>{student.fatherName || 'Chưa có dữ liệu'}</strong></div>
                    <div>Nghề nghiệp: {student.fatherJob || 'Chưa có dữ liệu'}</div>
                    <div>Điện thoại: {student.fatherPhone || 'Chưa có dữ liệu'}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-sky-900">Thông tin Mẹ</div>
                  <div className="space-y-1 text-slate-700">
                    <div>Họ tên: <strong>{student.motherName || 'Chưa có dữ liệu'}</strong></div>
                    <div>Nghề nghiệp: {student.motherJob || 'Chưa có dữ liệu'}</div>
                    <div>Điện thoại: {student.motherPhone || 'Chưa có dữ liệu'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Người giám hộ & Liên hệ khẩn cấp:</div>
                <div className="text-slate-600">
                  Người giám hộ: <strong>{student.guardianName || 'Cha mẹ trực tiếp nuôi dưỡng'}</strong>
                </div>
                <div className="text-slate-600">
                  Liên hệ khẩn cấp: <strong>{student.emergencyContact || student.fatherPhone || student.motherPhone || 'Chưa có dữ liệu'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HỌC TẬP */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2">
                  <div className="font-bold text-sky-900">Năng lực nổi bật & Sở thích</div>
                  <div>Năng lực: <strong>{student.outstandingAbility || 'Chưa có dữ liệu'}</strong></div>
                  <div>Môn học yêu thích: <strong>{student.favoriteSubject || 'Chưa có dữ liệu'}</strong></div>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                  <div className="font-bold text-rose-900">Môn cần hỗ trợ / phụ đạo</div>
                  <div>Môn cần hỗ trợ: <strong>{student.supportNeededSubject || 'Không có'}</strong></div>
                  {student.needsSupport && (
                    <div className="text-rose-700 italic">
                      Lý do: {student.supportReason || 'Cần phụ đạo thêm kiến thức nền tảng.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Bảng Điểm & Đánh giá môn học thực tế */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Kết quả điểm số & nhận xét môn học (Dữ liệu thực)
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {studentScores.length > 0 ? `${studentScores.length} đầu điểm` : 'Chưa có dữ liệu điểm'}
                  </span>
                </div>

                {studentScores.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-xs italic">
                    Chưa có dữ liệu điểm số được nhập cho học sinh này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-2 px-3">Môn học</th>
                          <th className="py-2 px-3">Đợt đánh giá</th>
                          <th className="py-2 px-3 text-center">Điểm số</th>
                          <th className="py-2 px-3 text-center">Đánh giá</th>
                          <th className="py-2 px-3">Nhận xét của GV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentScores.map((sc) => (
                          <tr key={sc.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">{sc.subjectName}</td>
                            <td className="py-2 px-3 text-slate-600">{sc.term}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                              {sc.score !== null && sc.score !== undefined ? sc.score : '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {sc.evaluationGrade ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    sc.evaluationGrade === 'Tốt'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : sc.evaluationGrade === 'Khá'
                                      ? 'bg-sky-100 text-sky-800'
                                      : sc.evaluationGrade === 'Đạt'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {sc.evaluationGrade}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-700 italic">
                              {sc.comment || 'Chưa ghi nhận xét'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Theo dõi môn học của GVCN */}
              {studentTrackingsList.length > 0 && (
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2">
                  <div className="font-bold text-sky-900 flex items-center gap-1.5 text-xs">
                    <UserCheck className="w-4 h-4 text-sky-700" />
                    Theo dõi của GVCN theo môn học:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {studentTrackingsList.map((tr) => (
                      <div
                        key={tr.id}
                        className="p-2.5 bg-white rounded-xl border border-sky-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{tr.subjectName}</span>
                          {tr.notes && <div className="text-[11px] text-slate-500 mt-0.5">{tr.notes}</div>}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tr.trackingStatus === 'nổi bật'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tr.trackingStatus === 'ổn định'
                              ? 'bg-sky-100 text-sky-800'
                              : tr.trackingStatus === 'cần hỗ trợ'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tr.trackingStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ĐIỂM DANH & CHUYÊN CẦN (Giai đoạn 5) */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {/* Thống kê chuyên cần của học sinh */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <div className="text-slate-500 font-semibold text-[11px]">Có mặt</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">{presentCount}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">buổi học</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <div className="text-slate-500 font-semibold text-[11px]">Nghỉ có phép</div>
                  <div className="text-xl font-black text-amber-700 mt-1">{excusedCount}</div>
                  <div className="text-[10px] text-amber-600 mt-0.5">buổi học</div>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <div className="text-slate-500 font-semibold text-[11px]">Nghỉ k.phép</div>
                  <div className="text-xl font-black text-rose-700 mt-1">{unexcusedCount}</div>
                  <div className="text-[10px] text-rose-600 mt-0.5">buổi học</div>
                </div>

                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                  <div className="text-slate-500 font-semibold text-[11px]">Đi muộn</div>
                  <div className="text-xl font-black text-purple-700 mt-1">{lateCount}</div>
                  <div className="text-[10px] text-purple-600 mt-0.5">lần</div>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center col-span-2 sm:col-span-1">
                  <div className="text-slate-500 font-semibold text-[11px]">Chuyên cần</div>
                  <div className="text-xl font-black text-sky-700 mt-1">{attendanceRate}%</div>
                  <div className="text-[10px] text-sky-600 mt-0.5">tỷ lệ đạt</div>
                </div>
              </div>

              {/* Lịch sử điểm danh chi tiết */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center justify-between text-xs">
                  <span>Lịch sử điểm danh các buổi ({studentAttRecords.length} lượt ghi nhận):</span>
                  <span className="text-[11px] text-slate-500">Mới nhất xếp trên</span>
                </div>

                {studentAttRecords.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-xs italic">
                    Chưa có dữ liệu điểm danh được ghi nhận cho học sinh này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-2 px-3">Ngày</th>
                          <th className="py-2 px-3">Buổi</th>
                          <th className="py-2 px-3">Tiết</th>
                          <th className="py-2 px-3 text-center">Trạng thái</th>
                          <th className="py-2 px-3">Ghi chú lý do</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentAttRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{r.date}</td>
                            <td className="py-2 px-3 text-slate-600">{r.session}</td>
                            <td className="py-2 px-3 text-slate-600">{r.period || 'Cả buổi'}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.status === 'Có mặt'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'Nghỉ có phép'
                                    ? 'bg-amber-100 text-amber-800'
                                    : r.status === 'Nghỉ không phép'
                                    ? 'bg-rose-100 text-rose-800'
                                    : r.status === 'Đi muộn'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-700 italic">
                              {r.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RÈN LUYỆN (Giai đoạn 6) */}
          {activeTab === 'conduct' && (
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Smile className="w-5 h-5 text-pink-600 shrink-0" />
                  <div>
                    <span className="font-black text-pink-950 block">Theo dõi kết quả rèn luyện</span>
                    <span className="text-pink-800 text-[11px]">
                      Đánh giá nề nếp, biểu hiện tích cực và nội dung cần rèn luyện thêm qua từng tháng và học kỳ.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('conduct');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1 shadow-xs"
                >
                  Mở Sổ Rèn Luyện <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {studentConductList.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs italic">
                  Chưa có phiếu đánh giá rèn luyện riêng cho học sinh này trong kỳ đang chọn.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentConductList.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm">{rec.term}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              rec.grade === 'Tốt'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.grade === 'Khá'
                                ? 'bg-blue-100 text-blue-800'
                                : rec.grade === 'Đạt'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Xếp loại: {rec.grade}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Cập nhật: {new Date(rec.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <strong className="text-slate-700 block text-[11px]">Nhận xét của GVCN:</strong>
                          <p className="text-slate-600 leading-relaxed italic">
                            "{rec.teacherComment || 'Chưa ghi nhận'}"
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-50/60 rounded-xl space-y-1 border border-emerald-100">
                          <strong className="text-emerald-900 block text-[11px]">Biểu hiện tích cực:</strong>
                          <p className="text-emerald-800 leading-relaxed">
                            {rec.positiveManifestations || 'Chấp hành nề nếp chung'}
                          </p>
                        </div>
                        <div className="p-3 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
                          <strong className="text-amber-900 block text-[11px]">Cần cải thiện:</strong>
                          <p className="text-amber-800 leading-relaxed">
                            {rec.areasForImprovement || 'Duy trì kết quả hiện tại'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VI PHẠM NỀ NẾP (Giai đoạn 6) */}
          {activeTab === 'violations' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="font-bold block">Nguyên tắc sư phạm nhân văn:</strong>
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    Hồ sơ vi phạm ghi nhận khách quan với tinh thần uốn nắn, giáo dục giúp học sinh sửa đổi và tiến bộ; tuyệt đối không dùng ngôn ngữ xúc phạm hay định kiến với học sinh.
                  </p>
                </div>
              </div>

              {studentViolationsList.length === 0 ? (
                <div className="p-8 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-emerald-900 text-sm">
                    Gương Mẫu & Chấp Hành Tốt Nội Quy
                  </div>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Học sinh {student.fullName} chưa có ghi nhận vi phạm nề nếp nào trong năm học hiện tại.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
                    <span>Tổng số vụ việc ghi nhận: {studentViolationsList.length}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu('conduct');
                        onClose();
                      }}
                      className="text-pink-600 hover:text-pink-800 flex items-center gap-1 font-bold"
                    >
                      Quản lý tại phân hệ Rèn luyện <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {studentViolationsList.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{v.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.severity === 'Nhắc nhở'
                                ? 'bg-amber-100 text-amber-800'
                                : v.severity === 'Khiển trách'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {v.severity}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Ngày: {v.date} • {v.location}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                            Biện pháp giáo dục:
                          </span>
                          <p className="text-[11px] text-slate-600">{v.educationalMeasures}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">
                            Kết quả sau giáo dục:
                          </span>
                          <p className="text-[11px] text-emerald-800">{v.resultAfterEducation}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Người ghi nhận: <strong>{v.recordedBy}</strong></span>
                        {v.notes && <span>Ghi chú: {v.notes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TIẾN BỘ & HỖ TRỢ (Giai đoạn 6 - Timeline) */}
          {activeTab === 'progress' && (
            <div className="space-y-5">
              {/* Support categories section */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-pink-600" />
                    <span>Diện Cần Hỗ Trợ (GVCN Đánh Dấu Trực Tiếp)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('conduct');
                      onClose();
                    }}
                    className="text-pink-600 hover:text-pink-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    Xem tất cả diện hỗ trợ <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {studentSupportList.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">
                    Học sinh hiện không thuộc diện cần can thiệp hỗ trợ đặc biệt.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {studentSupportList.map((tag) => (
                      <div
                        key={tag.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-pink-100 text-pink-800">
                            {tag.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                              tag.isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tag.isResolved ? 'Đã khắc phục' : 'Đang hỗ trợ'}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {tag.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Timeline */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Dòng Thời Gian Ghi Nhận Tiến Bộ ({studentProgressTimeline.length} bước)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Trình tự thời gian</span>
                </div>

                {studentProgressTimeline.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px] p-4 text-center">
                    Chưa có nhật ký tiến bộ nào được ghi nhận cho học sinh này.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {studentProgressTimeline.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
                        <div className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-slate-700 text-[11px]">
                                {item.timestamp}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.progressLevel === 'Tiến bộ rõ rệt'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.progressLevel === 'Có chuyển biến'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.progressLevel}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] space-y-1 text-slate-700">
                            <div>
                              <strong className="text-slate-900">Vấn đề:</strong> {item.issue}
                            </div>
                            <div>
                              <strong className="text-slate-900">Biện pháp:</strong> {item.measures}
                            </div>
                            <div>
                              <strong className="text-slate-900">Kết quả:</strong> {item.result}
                            </div>
                            {item.teacherComment && (
                              <div className="text-slate-600 italic pt-1 border-t border-slate-200">
                                Nhận xét GVCN: "{item.teacherComment}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: NĂNG KHIẾU (Giai đoạn 7) */}
          {activeTab === 'talents' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-purple-900 text-sm">Hồ Sơ Năng Khiếu & Sở Trường</h4>
                    <p className="text-purple-700 text-[11px]">
                      {student.talents ? `Sở trường: ${student.talents}` : 'Theo dõi và bồi dưỡng năng khiếu học sinh'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('activities');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  Quản lý năng khiếu <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {studentTalentProfilesList.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">Chưa có hồ sơ bồi dưỡng chuyên sâu</div>
                  <p className="text-slate-500 max-w-md mx-auto">
                    {student.talents
                      ? `Học sinh có năng khiếu ghi nhận: "${student.talents}". GVCN có thể lập kế hoạch bồi dưỡng tại phân hệ Hoạt động.`
                      : 'Học sinh chưa được ghi nhận năng khiếu đặc biệt trong danh sách bồi dưỡng.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentTalentProfilesList.map((tp) => (
                    <div
                      key={tp.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                            {tp.field}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {tp.talentDescription}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          Cập nhật: {new Date(tp.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-700">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <strong className="block text-[11px] text-slate-900 mb-0.5">Thành tích:</strong>
                          <p className="text-slate-600">{tp.achievements || 'Đang bồi dưỡng'}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <strong className="block text-[11px] text-slate-900 mb-0.5">Cuộc thi:</strong>
                          <p className="text-slate-600">{tp.competitions || 'Theo kế hoạch'}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <strong className="block text-[11px] text-slate-900 mb-0.5">Kết quả:</strong>
                          <p className="text-slate-600">{tp.results || 'Đang theo dõi'}</p>
                        </div>
                      </div>

                      {tp.trainingPlan && (
                        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-teal-900 space-y-0.5">
                          <strong className="block text-[11px] font-bold">Kế hoạch bồi dưỡng:</strong>
                          <p className="text-slate-700 leading-relaxed">{tp.trainingPlan}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: THAM GIA HOẠT ĐỘNG (Giai đoạn 7) */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-teal-900 text-sm">Tham Gia Hoạt Động Tập Thể</h4>
                    <p className="text-teal-700 text-[11px]">
                      Đã tham gia {studentActivitiesList.length}/{classActivities.length} hoạt động lớp ({classActivities.length > 0 ? Math.round((studentActivitiesList.length / classActivities.length) * 100) : 0}%)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('activities');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  Sổ hoạt động <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {studentActivitiesList.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
                  <Compass className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">Chưa tham gia hoạt động phong trào nào</div>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Học sinh chưa có tên trong danh sách tham gia các hoạt động phong trào đã ghi nhận.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentActivitiesList.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{act.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                            Ngày {act.date}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Địa điểm: <strong>{act.location}</strong>
                        </span>
                      </div>

                      <div className="text-slate-600 space-y-1">
                        <div>
                          <strong className="text-slate-800">Mục tiêu:</strong> {act.objective}
                        </div>
                        <div>
                          <strong className="text-slate-800">Nội dung:</strong> {act.content}
                        </div>
                      </div>

                      {act.result && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                          <strong className="block text-[11px]">Kết quả đạt được:</strong>
                          <p className="text-slate-700">{act.result}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: KHEN THƯỞNG & THÀNH TÍCH (Giai đoạn 7) */}
          {activeTab === 'awards' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-900 text-sm">Hồ Sơ Khen Thưởng & Thành Tích</h4>
                    <p className="text-amber-700 text-[11px]">
                      Tổng số {studentAwardsList.length} danh hiệu & thành tích đã ghi nhận
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('activities');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  Sổ khen thưởng <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {studentAwardsList.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
                  <Award className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">Chưa có bản ghi khen thưởng</div>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Học sinh chưa có thành tích hoặc bằng khen nào được ghi nhận trong năm học hiện tại.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentAwardsList.map((aw) => (
                    <div
                      key={aw.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            {aw.achievement}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              aw.level === 'Quốc gia'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : aw.level === 'Tỉnh'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : aw.level === 'Cụm / Huyện / TP'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            Cấp {aw.level}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Ngày: {aw.date}
                        </span>
                      </div>

                      <div className="text-slate-700 space-y-1">
                        <div>
                          <strong className="text-slate-900">Nội dung quyết định:</strong> {aw.content}
                        </div>
                        {aw.evidence && (
                          <div className="text-amber-800 text-[11px] font-medium">
                            <strong>Minh chứng:</strong> {aw.evidence}
                          </div>
                        )}
                        {aw.notes && (
                          <div className="text-slate-500 text-[11px]">
                            <strong>Ghi chú:</strong> {aw.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: NHẬN XÉT */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Giai đoạn 8: Nhận xét định kỳ HKI, HKII, Cả năm */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-purple-900">
                      Sổ Nhận Xét Định Kỳ & Trợ Lý AI (Giai đoạn 8)
                    </div>
                    <div className="text-[11px] text-purple-700">
                      Đánh giá sư phạm chuẩn mực dựa trên dữ liệu thật (Áp dụng / Chỉnh sửa / Hủy)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveMenu('ai-assistant');
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Mở Trợ Lý AI Nhận Xét <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Danh sách nhận xét các đợt đã lưu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['HKI', 'HKII', 'Cả năm'] as const).map((period) => {
                  const comm = studentSemesterComments.find(
                    (c) => c.studentId === student.id && c.period === period
                  );
                  return (
                    <div
                      key={period}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Đợt {period}:</span>
                        {comm?.teacherComment ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            Đã nhận xét
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal">
                            Chưa có
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] italic min-h-[48px] line-clamp-3">
                        {comm?.teacherComment ? `"${comm.teacherComment}"` : 'Chưa nhập nhận xét cho đợt này.'}
                      </p>
                      {comm?.isAiApplied && (
                        <div className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Đã áp dụng gợi ý AI
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs">Ghi chú & Nhận xét thường xuyên của GVCN:</div>
                <textarea
                  rows={3}
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="Ghi nhận xét về ý thức đạo đức, học tập, sự tiến bộ thường ngày..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-xs"
                />

                <div className="flex items-center justify-between">
                  {savedCommentSuccess ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Đã lưu nhận xét!
                    </span>
                  ) : <span />}

                  <button
                    onClick={handleSaveComment}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs transition-colors text-xs"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
