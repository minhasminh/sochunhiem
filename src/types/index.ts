export type UserRole = 'ADMIN' | 'BGH' | 'GVCN' | 'GIÁO VIÊN' | 'GVBM';

export type DutyRole =
  | 'Quản trị viên'
  | 'Hiệu trưởng'
  | 'Phó Hiệu trưởng'
  | 'Tổ trưởng'
  | 'Tổ phó'
  | 'Giáo viên chủ nhiệm'
  | 'Giáo viên bộ môn'
  | 'Nhân viên';

export type AccountStatus = 'active' | 'pending' | 'locked';

export const DEPARTMENT_OPTIONS = [
  'Tổ 1-2-3',
  'Tổ 4-5',
  'Tổ khoa học tự nhiên',
  'Tổ khoa học xã hội',
  'Tổ Tiếng Anh-GDTC',
] as const;

export const SUBJECT_OPTIONS = [
  '—',
  'Toán',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên',
  'Lịch sử và Địa lí',
  'Giáo dục công dân',
  'Tin học',
  'Công nghệ',
  'Giáo dục thể chất',
  'Âm nhạc',
  'Mĩ thuật',
  'Hoạt động trải nghiệm, hướng nghiệp',
  'Giáo dục địa phương',
  'Tiếng Việt (Tiểu học)',
  'Toán (Tiểu học)',
  'Tự nhiên và Xã hội',
  'Lịch sử và Địa lí (Tiểu học)',
  'Khoa học (Tiểu học)',
  'Đạo đức',
  'Tin học và Công nghệ (Tiểu học)',
  'Tiếng Anh (Tiểu học)',
  'Giáo dục thể chất (Tiểu học)',
  'Âm nhạc (Tiểu học)',
  'Mĩ thuật (Tiểu học)',
  'Hoạt động trải nghiệm (Tiểu học)',
] as const;

export const DUTY_ROLE_OPTIONS: DutyRole[] = [
  'Quản trị viên',
  'Hiệu trưởng',
  'Phó Hiệu trưởng',
  'Tổ trưởng',
  'Tổ phó',
  'Giáo viên chủ nhiệm',
  'Giáo viên bộ môn',
  'Nhân viên',
];

export interface User {
  id: string;
  username: string; // Email hoặc mã đăng nhập
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  plainPassword?: string; // Mật khẩu hiển thị cho Admin khi bàn giao tài khoản
  title: string;
  phone?: string;
  avatar?: string;
  schoolId: string;
  teacherId?: string; // Khóa ngoại liên kết hồ sơ giáo viên
  homeroomClassId?: string; // Lớp chủ nhiệm được phân công (nếu là GVCN)
  status?: AccountStatus; // Trạng thái: 'active' (Hoạt động) | 'pending' (Chưa kích hoạt) | 'locked' (Bị khóa)
  department?: string; // Tổ chuyên môn/bộ phận
  subject?: string; // Bộ môn giảng dạy
  dutyRole?: DutyRole; // Vai trò chức danh
  lastLogin?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  districtAuthority: string; // UBND Huyện / Xã / Phòng GD&ĐT
  address: string;
  phone: string;
  email: string;
  principalName: string;
  createdAt: string;
}

export type SchoolYearStatus = 'active' | 'locked';

export interface SchoolYear {
  id: string;
  code: string; // Ví dụ: "2026-2027"
  name: string; // "Năm học 2026 - 2027"
  startDate: string; // 05/09/2026
  endDate: string; // 31/05/2027
  status: SchoolYearStatus; // 'active' (Đang sử dụng) | 'locked' (Đã khóa)
  isCurrent: boolean; // Năm học đang chọn hiện hành
  createdAt: string;
}

export type StudyShift = 'Buổi sáng' | 'Buổi chiều' | 'Cả ngày';

export const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
export type GradeLevel = (typeof GRADE_OPTIONS)[number];

export interface ClassEntity {
  id: string;
  schoolId: string;
  schoolYearId: string;
  grade: string; // 1, 2, 3, 4, 5, 6, 7, 8, 9 (Tiểu học & THCS)
  className: string; // VD: 1/1, 2/1, 3/1, 4/1, 5/1, 6/1, 7/1...
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  roomNumber: string; // Phòng học: P.204
  studyShift: StudyShift; // Buổi sáng / Buổi chiều
  studentCount: number; // Sĩ số
  characteristics?: string; // Đặc điểm tình hình lớp
  advantages?: string; // Thuận lợi
  difficulties?: string; // Khó khăn
  goals?: string; // Mục tiêu phấn đấu
  notes: string;
  isDemo: boolean; // Đánh dấu DỮ LIỆU DEMO
  createdAt: string;
  updatedAt: string;
}

export interface HomeroomSyncResult {
  success: boolean;
  totalClasses: number;
  syncedClassesCount: number;
  unassignedClasses: string[]; // Tên các lớp chưa phân công GVCN
  conflicts: string[]; // Cảnh báo trùng lặp GVCN
  updatedTeachersCount: number;
  updatedUsersCount: number;
  message: string;
  timestamp: string;
}

export interface SystemSettings {
  id: string;
  schoolName: string;
  allowTeacherEditLockedYear: boolean;
  autoBackupDaily: boolean;
  maskSensitiveData: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module?: string;
  target?: string;
  result?: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
  ipAddress?: string;
}

// Menu items according to Stage 1 - 10 menu structure
export type MainMenuItem =
  | 'dashboard'
  | 'class-info'
  | 'teachers'
  | 'accounts'
  | 'departments'
  | 'students'
  | 'seating-chart'
  | 'plans'
  | 'attendance'
  | 'academic'
  | 'conduct'
  | 'competition'
  | 'activities'
  | 'reports'
  | 'print-book'
  | 'ai-assistant'
  | 'user-guide'
  | 'system-testing'
  | 'settings';

export interface AcademicDepartment {
  id: string;
  code: string; // Mã tổ: "TCM-KHTN"
  name: string; // Tên tổ: "Tổ 1-2-3", "Tổ 4-5", "Tổ khoa học tự nhiên", "Tổ khoa học xã hội", "Tổ Tiếng Anh-GDTC"
  description?: string;
  leaderTeacherId: string; // ID Tổ trưởng chuyên môn
  leaderTeacherName: string;
  deputyTeacherId?: string; // ID Tổ phó chuyên môn
  deputyTeacherName?: string;
  subjects: string[]; // Các môn trực thuộc: ["Toán", "Tin học", ...]
  meetingSchedule?: string; // Lịch sinh hoạt tổ
  room?: string; // Phòng sinh hoạt chuyên môn
  goals?: string; // Mục tiêu trọng tâm năm học
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
}

// Preserved Domain Types for upcoming stages (Students, Subjects, Plans, etc.)
export interface SchoolInfo {
  schoolName: string;
  districtAuthority: string;
  schoolYear: string;
  grade: string;
  className: string;
  homeroomTeacher: string;
  department: string;
  principalName: string;
}

export interface ClassStatisticsByPeriod {
  period: 'Đầu năm' | 'Giữa HKI' | 'Cuối HKI' | 'Giữa HKII' | 'Cuối HKII' | 'Cả năm';
  totalStudents: number;
  femaleCount: number;
  maleCount: number;
  ethnicMinorityCount: number;
  povertyCount: number;
  policyPriorityCount: number;
  disabledCount: number;
  retainedCount: number;
  orphanCount: number;
  martyrWoundedCount: number;
  notes: string;
}

export interface Student {
  id: string;
  classId: string;
  schoolYearId: string;
  stt: number;
  studentCode: string;
  fullName: string;
  birthDate: string; // DD/MM/YYYY
  gender: 'Nam' | 'Nữ';
  ethnicity: string;
  address: string; // Địa chỉ thường trú
  residence: string; // Nơi ở hiện tại (Thôn, xã...)
  phone: string; // Số điện thoại HS nếu có
  notes?: string;

  // Thông tin gia đình
  fatherName?: string;
  fatherJob?: string;
  fatherPhone?: string;
  motherName?: string;
  motherJob?: string;
  motherPhone?: string;
  guardianName?: string;
  emergencyContact?: string;
  familyNotes?: string;

  // Thông tin học tập
  outstandingAbility?: string; // Năng lực nổi bật
  favoriteSubject?: string; // Môn học yêu thích
  supportNeededSubject?: string; // Môn cần hỗ trợ
  talents?: string; // Năng khiếu
  achievements?: string; // Thành tích

  // Thông tin theo dõi
  groupNumber: number; // Tổ 1, 2, 3, 4
  needsSupport: boolean; // Cần hỗ trợ
  supportReason?: string;
  hasProgress: boolean; // Có tiến bộ
  hasSpecialTalent: boolean; // Học sinh năng khiếu
  needsAttention: boolean; // Học sinh cần quan tâm
  status: 'active' | 'locked'; // Trạng thái hồ sơ: Hoạt động / Đã khóa
  isPoorHousehold: boolean; // Hộ nghèo
  policyPriority?: string; // Diện chính sách (Con TB/LS, Hộ nghèo, Cận nghèo...)
  createdAt: string;
  updatedAt: string;
}

export type EmploymentStatus = 'Biên chế chính thức' | 'Hợp đồng' | 'Thỉnh giảng' | 'Tập sự';
export type AcademicDegree = 'Tiến sĩ' | 'Thạc sĩ' | 'Cử nhân ĐH Sư phạm' | 'Cử nhân Đại học' | 'Cao đẳng Sư phạm';

export interface TeacherProfile {
  id: string;
  teacherCode: string; // Mã giáo viên: "GV-001"
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string; // DD/MM/YYYY
  email: string;
  phone: string;
  idCardNumber?: string;
  department: string; // Tổ chuyên môn: "Tổ 1-2-3", "Tổ 4-5", "Tổ khoa học tự nhiên", "Tổ khoa học xã hội", "Tổ Tiếng Anh-GDTC"
  mainSubject: string; // Môn giảng dạy chính
  secondarySubject?: string;
  degree: AcademicDegree;
  employmentStatus: EmploymentStatus;
  joinDate: string; // Ngày vào trường
  isHomeroom: boolean; // Có chủ nhiệm không
  homeroomClassId?: string; // ID lớp chủ nhiệm
  homeroomClassName?: string; // Tên lớp: 7/1
  assignedClasses?: string[]; // Các lớp dạy bộ môn: ["7/1", "7/2", "8/1"]
  duty?: string; // Chức vụ: "Hiệu trưởng", "Phó Hiệu trưởng", "Tổ trưởng chuyên môn", "GVCN", "Tổng phụ trách Đội"...
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectTeacher {
  id: string;
  classId: string;
  subjectName: string;
  teacherName: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface DeskSeat {
  id: string; // e.g. "seat-c1-r1-s1"
  column: number; // Dãy (1..columns)
  row: number; // Bàn (1..rows)
  seatNumber: number; // Chỗ trong bàn (1..seatsPerDesk)
  studentId: string | null; // Liên kết trực tiếp student_id
}

export interface ClassroomConfig {
  id: string;
  classId: string;
  schoolYearId: string;
  columns: number; // Số dãy (mặc định 4)
  rows: number; // Số bàn mỗi dãy (mặc định 4)
  seatsPerDesk: number; // Số chỗ mỗi bàn (mặc định 2)
  boardPosition: 'top-center' | 'top-left' | 'top-right';
  teacherDeskPosition: 'top-right' | 'top-left';
  doorPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  notes?: string;
}

export interface SeatingChartData {
  id: string;
  classId: string;
  schoolYearId: string;
  term: 'Đầu năm' | 'Học kỳ I' | 'Học kỳ II';
  config: ClassroomConfig;
  seats: DeskSeat[];
  updatedAt: string;
}

export interface ClassOfficer {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string; // Khóa ngoại bắt buộc liên kết với Student
  role: string; // 'Lớp trưởng' | 'Lớp phó học tập' | 'Lớp phó lao động' | 'Tổ trưởng tổ 1' ...
  category: 'ban-can-su' | 'to-truong-to-pho' | 'can-su-bo-mon' | 'khac';
  duties: string; // Nhiệm vụ được giao
  startDate?: string;
  notes?: string;
}

export interface ParentRepresentative {
  id: string;
  classId: string;
  schoolYearId: string;
  parentName: string;
  phone: string;
  studentId: string; // Khóa ngoại liên kết học sinh là con
  role: 'Trưởng ban' | 'Phó ban' | 'Thành viên';
  responsibilities: string; // Nhiệm vụ phân công
  notes?: string;
}

// ================= GIAI ĐOẠN 4: KẾ HOẠCH CHỦ NHIỆM =================
export type PlanTaskStatus = 'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành';

export interface YearlyPlanTask {
  id: string;
  category: 'dao-duc' | 'hoc-tap' | 'lao-dong' | 'phong-trao' | 'phu-huynh' | 'khac';
  title: string; // Tên nhiệm vụ
  target: string; // Chỉ tiêu
  measures: string; // Biện pháp
  timeframe: string; // Thời gian (HKI, HKII, Cả năm, Tháng 9-11...)
  assignee: string; // Người thực hiện
  status: PlanTaskStatus;
  result?: string; // Kết quả
  notes?: string; // Ghi chú
}

export interface YearlyPlan {
  id: string;
  classId: string;
  schoolYearId: string;
  generalGoal: string; // Mục tiêu chung
  targetsSummary: {
    conductGoodRate: string; // Tỷ lệ Rèn luyện Tốt/Khá
    academicGoodRate: string; // Tỷ lệ Học tập Tốt/Khá
    pioneerTitle: string; // Danh hiệu thi đua chi đội
    attendanceRate: string; // Tỷ lệ chuyên cần phấn đấu
  };
  tasks: YearlyPlanTask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPlan {
  id: string;
  classId: string;
  schoolYearId: string;
  month: number; // 9, 10, 11, 12, 1, 2, 3, 4, 5
  year: number; // 2026, 2027
  theme: string; // Chủ điểm tháng (VD: "Truyền thống nhà trường")
  goal: string; // Mục tiêu
  content: string; // Nội dung
  measures: string; // Biện pháp
  tasksText?: string; // Nhiệm vụ tháng
  activities: string[]; // Hoạt động trọng tâm
  status: PlanTaskStatus; // Trạng thái tháng
  result?: string; // Kết quả đạt được
  comments?: string; // Nhận xét, rút kinh nghiệm
  updatedAt: string;
}

export interface ScheduleWorkItem {
  id: string;
  classId: string;
  schoolYearId: string;
  date: string; // YYYY-MM-DD
  time?: string; // Giờ (VD: 07:30)
  title: string; // Nội dung công việc
  weekNumber: number; // Tuần học 1..35
  targetAudience: string; // Đối tượng
  assignee: string; // Người phụ trách
  status: PlanTaskStatus;
  priority?: 'Cao' | 'Trung bình' | 'Thấp';
  notes?: string;
  createdAt: string;
}

// ================= GIAI ĐOẠN 5: ĐIỂM DANH & HỌC TẬP =================
export type AttendanceStatus =
  | 'Có mặt'
  | 'Nghỉ có phép'
  | 'Nghỉ không phép'
  | 'Đi muộn'
  | 'Về sớm';

export type AttendanceSession = 'Sáng' | 'Chiều' | 'Cả ngày';

export interface AttendanceRecord {
  id: string;
  classId: string;
  schoolYearId: string;
  date: string; // YYYY-MM-DD
  session: AttendanceSession;
  period?: string; // 'Cả buổi' | 'Tiết 1' .. 'Tiết 5'
  studentId: string; // Khóa liên kết với Student
  status: AttendanceStatus;
  notes?: string;
  updatedAt: string;
}

export type EvaluationTerm =
  | 'Đầu năm'
  | 'Giữa HKI'
  | 'Cuối HKI'
  | 'Giữa HKII'
  | 'Cuối HKII'
  | 'Cả năm';

export type EvaluationGrade = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface SubjectScore {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  subjectName: string; // e.g. "Toán", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên"...
  term: EvaluationTerm;
  score: number | null; // Điểm số 0..10 hoặc null nếu chưa có điểm
  evaluationGrade?: EvaluationGrade; // Mức đánh giá theo TT 22
  comment?: string; // Nhận xét của giáo viên
  result?: string; // Kết quả tóm tắt
  notes?: string;
  updatedAt: string;
}

export type AcademicScore = SubjectScore;

export type SubjectTrackingStatus = 'nổi bật' | 'ổn định' | 'cần hỗ trợ' | 'có tiến bộ';

export interface SubjectTrackingItem {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  subjectName: string;
  trackingStatus: SubjectTrackingStatus;
  notes?: string;
  updatedAt: string;
}

export type SubjectTracking = SubjectTrackingItem;

export interface StudentAlertItem {
  id: string;
  studentId: string;
  studentName: string;
  type: 'nghỉ nhiều' | 'thiếu dữ liệu' | 'kết quả giảm' | 'cần theo dõi';
  message: string;
  detail: string;
  severity: 'danger' | 'warning' | 'info';
  date: string;
}

// ================= GIAI ĐOẠN 6: THEO DÕI RÈN LUYỆN HỌC SINH =================
export type ConductTerm =
  | 'Tháng 9'
  | 'Tháng 10'
  | 'Tháng 11'
  | 'Tháng 12'
  | 'Tháng 1'
  | 'Tháng 2'
  | 'Tháng 3'
  | 'Tháng 4'
  | 'Tháng 5'
  | 'HKI'
  | 'HKII'
  | 'Cả năm';

export type ConductGrade = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface ConductRecord {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  term: ConductTerm;
  grade: ConductGrade;
  teacherComment: string; // Nhận xét chung của GVCN
  positiveManifestations: string; // Biểu hiện tích cực
  areasForImprovement: string; // Nội dung cần cải thiện
  updatedAt: string;
}

export type ViolationSeverity =
  | 'Nhắc nhở'
  | 'Khiển trách'
  | 'Cần phối hợp phụ huynh'
  | 'Cảnh cáo trước lớp';

export interface ViolationRecord {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  title: string; // Nội dung vi phạm (ngôn ngữ sư phạm tôn trọng học sinh)
  severity: ViolationSeverity;
  location: string; // Địa điểm
  recordedBy: string; // Người ghi nhận
  educationalMeasures: string; // Biện pháp giáo dục
  resultAfterEducation: string; // Kết quả sau giáo dục
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyConductLog {
  id: string;
  classId: string;
  schoolYearId: string;
  weekNumber: number; // Tuần 1 .. 35
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  issueDescription: string; // Vấn đề trong tuần
  relatedStudentIds: string[]; // Học sinh liên quan
  measures: string; // Biện pháp xử lý của GVCN
  result: string; // Kết quả
  createdAt: string;
}

export type ProgressLevel = 'Khởi đầu' | 'Có chuyển biến' | 'Tiến bộ rõ rệt' | 'Duy trì tốt';

export interface StudentProgressEntry {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  timestamp: string; // Thời điểm (YYYY-MM-DD)
  issue: string; // Vấn đề trước đó
  measures: string; // Biện pháp đã thực hiện
  result: string; // Kết quả
  progressLevel: ProgressLevel; // Mức độ tiến bộ
  teacherComment: string; // Nhận xét của GVCN
  createdAt: string;
}

export type SupportCategory =
  | 'học tập'
  | 'chuyên cần'
  | 'rèn luyện'
  | 'kỹ năng'
  | 'hoàn cảnh'
  | 'cần phối hợp gia đình';

export interface StudentSupportTag {
  id: string;
  classId: string;
  studentId: string;
  category: SupportCategory;
  description: string; // Chi tiết do GVCN ghi (không do AI tự suy đoán)
  isResolved?: boolean;
  updatedAt: string;
}

// ================= GIAI ĐOẠN 7: HOẠT ĐỘNG – THI ĐUA – KHEN THƯỞNG =================

// 1. Hoạt động & Tham gia hoạt động
export interface ClassActivity {
  id: string;
  classId: string;
  schoolYearId: string;
  name: string; // Tên hoạt động
  date: string; // Ngày diễn ra (YYYY-MM-DD)
  content: string; // Nội dung hoạt động
  objective: string; // Mục tiêu giáo dục
  location: string; // Địa điểm tổ chức
  personInCharge: string; // Người phụ trách
  participantStudentIds: string[]; // Danh sách ID học sinh tham gia
  result: string; // Kết quả đạt được
  documents?: string[]; // Tài liệu / link hình ảnh minh chứng
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Thi đua & Tiêu chí thi đua
export type CompetitionPeriodType = 'tuần' | 'tháng' | 'học kỳ' | 'cả năm';

export type CompetitionCriterion =
  | 'học tập'
  | 'chuyên cần'
  | 'nề nếp'
  | 'hoạt động'
  | 'vệ sinh'
  | 'phong trào';

export interface CompetitionCriteriaConfig {
  criterion: CompetitionCriterion;
  label: string;
  description: string;
  enabled: boolean;
  maxScore?: number; // Điểm tối đa nếu bật chế độ chấm điểm
}

export interface CompetitionClassConfig {
  id: string;
  classId: string;
  isScoringEnabled: boolean; // Không mặc định áp dụng điểm số nếu GVCN chưa cấu hình
  criteriaConfigs: CompetitionCriteriaConfig[];
  updatedAt: string;
}

export interface GroupCompetitionRecord {
  id: string;
  classId: string;
  schoolYearId: string;
  periodType: CompetitionPeriodType;
  periodName: string; // Ví dụ: "Tuần 6", "Tháng 10", "HKI", "Cả năm"
  groupNumber: number; // Tổ 1, Tổ 2, Tổ 3, Tổ 4
  scores?: Partial<Record<CompetitionCriterion, number>>; // Điểm nếu áp dụng chấm điểm
  evaluations: Partial<Record<CompetitionCriterion, string>>; // Nhận xét định tính cho từng tiêu chí
  totalScore?: number; // Tổng điểm tính toán (nếu áp dụng điểm)
  rank?: number; // Xếp hạng (1..4)
  comment: string; // Nhận xét chung của GVCN
  notes?: string;
  updatedAt: string;
}

// 3. Khen thưởng
export type AwardLevel = 'Lớp' | 'Trường' | 'Cụm / Huyện / TP' | 'Tỉnh' | 'Quốc gia';

export interface AwardRecord {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string; // Liên kết student_id
  achievement: string; // Thành tích (e.g. "Giải Nhất KHTN", "Học sinh 3 Tốt"...)
  date: string; // Ngày khen thưởng (YYYY-MM-DD)
  level: AwardLevel; // Cấp khen thưởng
  content: string; // Nội dung quyết định khen thưởng
  evidence?: string; // Minh chứng (Số quyết định, ảnh giấy khen...)
  notes?: string; // Ghi chú
  createdAt: string;
}

// 4. Học sinh Năng khiếu
export type TalentField =
  | 'Toán học'
  | 'Tin học'
  | 'Khoa học tự nhiên'
  | 'Ngữ văn - Ngoại ngữ'
  | 'Nghệ thuật & Mĩ thuật'
  | 'Âm nhạc'
  | 'Thể dục thể thao'
  | 'Kỹ năng Đội - Hoạt náo';

export interface TalentProfile {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string; // Liên kết student_id
  field: TalentField; // Lĩnh vực
  talentDescription: string; // Năng khiếu cụ thể
  achievements: string; // Thành tích đã đạt
  competitions: string; // Cuộc thi đã hoặc dự kiến tham gia
  results: string; // Kết quả
  trainingPlan: string; // Kế hoạch bồi dưỡng của GVCN & trường
  updatedAt: string;
}

// ================= GIAI ĐOẠN 8: SƠ KẾT – TỔNG KẾT =================

// 1. Chốt dữ liệu / Khóa học kỳ (Mục 5)
export type TermLockPeriod = 'HKI' | 'HKII' | 'Cả năm';

export interface TermLockRecord {
  period: TermLockPeriod;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  unlockedAt?: string;
  unlockedBy?: string;
}

// 2. Báo cáo Sơ kết Học kỳ I & II (Mục 1 & Mục 2)
export interface SemesterSummaryReport {
  id: string;
  classId: string;
  schoolYearId: string;
  period: 'HKI' | 'HKII';
  teacherNotes: string; // Nhận xét bổ sung của GVCN
  updatedAt: string;
}

// 3. Báo cáo Tổng kết Cả năm (Mục 3)
export interface YearEndSummaryReport {
  id: string;
  classId: string;
  schoolYearId: string;
  generalComment: string; // Nhận xét chung
  strengths: string; // Ưu điểm
  limitations: string; // Hạn chế
  overallResults: string; // Kết quả
  measures: string; // Biện pháp
  recommendations: string; // Kiến nghị
  futureDirections: string; // Phương hướng
  updatedAt: string;
}

// 4. Nhận xét Học sinh (Mục 4)
export interface StudentSemesterComment {
  id: string;
  classId: string;
  schoolYearId: string;
  studentId: string;
  period: 'HKI' | 'HKII' | 'Cả năm';
  teacherComment: string; // Nhận xét của GVCN
  aiDraftComment?: string; // Bản nháp đề xuất của AI dựa trên dữ liệu thật
  isAiApplied?: boolean;
  updatedAt: string;
}

// ================= GIAI ĐOẠN 10: TRỢ LÝ AI GVCN – BẢO MẬT – SAO LƯU – HOÀN THIỆN =================

// 1. Sao lưu dữ liệu & Bản sao lưu (Mục 4)
export interface BackupMetadata {
  id: string;
  fileName: string;
  createdAt: string;
  createdBy: string;
  fileSizeBytes: number;
  recordCounts: {
    classes: number;
    students: number;
    attendance: number;
    academic: number;
    conduct: number;
    violations: number;
    plans: number;
    activities: number;
    auditLogs: number;
  };
  note?: string;
}

export interface SystemBackupPayload {
  version: string;
  exportedAt: string;
  exportedBy: string;
  school: School;
  schoolYears: SchoolYear[];
  classes: ClassEntity[];
  students: Student[];
  teachers?: TeacherProfile[];
  users?: User[];
  classroomConfigs: ClassroomConfig[];
  seats: DeskSeat[];
  classOfficers: ClassOfficer[];
  parentRepresentatives: ParentRepresentative[];
  yearlyPlans: YearlyPlan[];
  monthlyPlans: MonthlyPlan[];
  scheduleWorkItems: ScheduleWorkItem[];
  attendanceRecords: AttendanceRecord[];
  subjectScores: SubjectScore[];
  subjectTeachers: SubjectTeacher[];
  subjectTrackings: SubjectTrackingItem[];
  conductRecords: ConductRecord[];
  violationRecords: ViolationRecord[];
  weeklyConductLogs: WeeklyConductLog[];
  studentProgressEntries: StudentProgressEntry[];
  studentSupportTags: StudentSupportTag[];
  classActivities: ClassActivity[];
  competitionConfig: CompetitionClassConfig;
  competitionRecords: GroupCompetitionRecord[];
  awardRecords: AwardRecord[];
  talentProfiles: TalentProfile[];
  termLocks: TermLockRecord[];
  semesterSummaryReports: SemesterSummaryReport[];
  yearEndSummaryReport: YearEndSummaryReport | null;
  studentSemesterComments: StudentSemesterComment[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

// 2. Chuyển lớp / Lên lớp sang năm học mới (Mục 8)
export interface PromotionStudentOption {
  studentId: string;
  studentName: string;
  gender: 'Nam' | 'Nữ';
  isPromoted: boolean; // Được lên lớp
  newClassId?: string; // Lớp mới
  notes?: string;
}

export interface ClassPromotionConfig {
  sourceSchoolYearId: string;
  sourceClassId: string;
  targetSchoolYearId: string;
  targetClassName: string;
  targetGrade: string;
  targetRoomNumber: string;
  studyShift: StudyShift;
  keepProfiles: boolean; // Giữ lý lịch cá nhân
  keepParents: boolean; // Giữ thông tin phụ huynh
  keepTalents: boolean; // Giữ hồ sơ năng khiếu
  keepProgressNotes: boolean; // Giữ nhật ký theo dõi
  students: PromotionStudentOption[];
}

// 3. Trợ lý AI GVCN - Bản nháp & Xu hướng (Mục 1)
export interface AiDraftContent {
  id: string;
  type: 'class-analysis' | 'student-analysis' | 'plan-suggestion' | 'student-comment' | 'parent-meeting' | 'trend-analysis';
  title: string;
  observedData: string[]; // Dữ liệu quan sát được (thực tế đo lường)
  aiSuggestions: string[]; // Đề xuất sư phạm của AI
  fullText: string; // Nội dung đầy đủ
  targetId?: string; // classId hoặc studentId
  targetName?: string;
  isApplied?: boolean;
  createdAt: string;
}

// 4. Kiểm tra tính toàn vẹn dữ liệu (Mục 10)
export interface OrphanCheckResult {
  module: string;
  recordCount: number;
  orphanCount: number;
  orphanedIds: string[];
  status: 'CLEAN' | 'HAS_ORPHANS';
  description: string;
}

// 5. Checklist kiểm thử (Mục 13)
export type TestStatus = 'PASS' | 'FAIL' | 'NEEDS REVIEW';

export interface TestingChecklistItem {
  id: string;
  category: string;
  testCase: string;
  description: string;
  status: TestStatus;
  testedAt?: string;
  testerNotes?: string;
}

// 6. Phê duyệt Sổ Chủ Nhiệm của Ban Giám Hiệu / Hiệu trưởng
export interface ClassBookApproval {
  classId: string;
  isApproved: boolean;
  approvedBy: string;
  approvedRole: string;
  approvedDate: string;
  reviewComment: string;
}






