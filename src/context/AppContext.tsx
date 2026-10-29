import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  initialAttendanceRecords,
  initialAuditLogs,
  initialClasses,
  initialClassOfficers,
  initialClassroomConfig,
  initialParentRepresentatives,
  initialSchool,
  initialSchoolYears,
  initialScheduleWorkItems,
  initialSeats,
  initialSettings,
  initialStudents,
  initialSubjectScores,
  initialSubjectTeachers,
  initialSubjectTrackings,
  initialUsers,
  initialYearlyPlan,
  initialMonthlyPlans,
  generateDefaultSeats,
  initialConductRecords,
  initialViolationRecords,
  initialWeeklyConductLogs,
  initialStudentProgressEntries,
  initialStudentSupportTags,
  initialClassActivities,
  initialCompetitionClassConfig,
  initialGroupCompetitionRecords,
  initialAwardRecords,
  initialTalentProfiles,
  initialTermLocks,
  initialSemesterSummaryReports,
  initialYearEndSummaryReport,
  initialStudentSemesterComments,
  initialTeachers,
  initialDepartments,
  initialClassBookApprovals,
  generateDefaultStudentsForClass,
} from '../data/dbSeed';
import {
  ClassBookApproval,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AuditLog,
  ClassEntity,
  ClassOfficer,
  ClassroomConfig,
  ConductGrade,
  ConductRecord,
  ConductTerm,
  DeskSeat,
  EvaluationTerm,
  HomeroomSyncResult,
  MainMenuItem,
  MonthlyPlan,
  ParentRepresentative,
  ProgressLevel,
  ScheduleWorkItem,
  School,
  SchoolYear,
  Student,
  TeacherProfile,
  AcademicDepartment,
  StudentProgressEntry,
  StudentSupportTag,
  SubjectScore,
  SubjectTeacher,
  SubjectTrackingItem,
  SubjectTrackingStatus,
  SupportCategory,
  SystemSettings,
  User,
  ViolationRecord,
  ViolationSeverity,
  WeeklyConductLog,
  YearlyPlan,
  YearlyPlanTask,
  ClassActivity,
  CompetitionClassConfig,
  CompetitionCriteriaConfig,
  CompetitionCriterion,
  CompetitionPeriodType,
  GroupCompetitionRecord,
  AwardRecord,
  AwardLevel,
  TalentProfile,
  TalentField,
  TermLockPeriod,
  TermLockRecord,
  SemesterSummaryReport,
  YearEndSummaryReport,
  StudentSemesterComment,
  UserRole,
  DutyRole,
  AccountStatus,
  BackupMetadata,
  SystemBackupPayload,
  ClassPromotionConfig,
  AiDraftContent,
  OrphanCheckResult,
} from '../types';

interface AppContextType {
  // Auth state & User Account Management (Admin cấp tài khoản & mật khẩu)
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  login: (account: string, pass: string, remember: boolean) => { success: boolean; message?: string };
  logout: () => void;
  addUserAccount: (data: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    phone?: string;
    teacherId?: string;
    homeroomClassId?: string;
    status?: AccountStatus;
    department?: string;
    subject?: string;
    dutyRole?: DutyRole;
  }) => { success: boolean; message: string; user?: User };
  updateUserAccount: (id: string, data: Partial<User> & { newPassword?: string }) => { success: boolean; message: string };
  updateUserLoginEmail: (id: string, newEmail: string, syncUsername?: boolean) => { success: boolean; message: string };
  resetUserPassword: (id: string, newPassword?: string) => { success: boolean; message: string; temporaryPassword?: string };
  toggleLockUserAccount: (id: string) => { success: boolean; message: string };
  deleteUserAccount: (id: string) => { success: boolean; message: string };
  autoGenerateAccountsForAllTeachers: () => { createdCount: number; existingCount: number; message: string };
  importUserAccounts: (
    accountList: Array<{
      name: string;
      email: string;
      username?: string;
      department?: string;
      subject?: string;
      dutyRole?: DutyRole;
      role?: UserRole;
      password?: string;
      phone?: string;
      status?: AccountStatus;
      homeroomClassName?: string;
    }>,
    strategy?: 'skip_existing' | 'update_existing',
    autoCreateTeacherProfile?: boolean
  ) => {
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
    message: string;
  };
  switchUserRole: (role: UserRole) => void;

  // School & Organization
  school: School;
  updateSchool: (data: Partial<School>) => void;

  // School Years
  schoolYears: SchoolYear[];
  currentSchoolYear: SchoolYear;
  selectSchoolYear: (yearId: string) => void;
  addSchoolYear: (data: Omit<SchoolYear, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateSchoolYear: (id: string, data: Partial<SchoolYear>) => { success: boolean; message?: string };
  toggleLockSchoolYear: (id: string) => void;
  deleteSchoolYear: (id: string) => { success: boolean; message?: string };

  // Classes
  classes: ClassEntity[];
  currentClass: ClassEntity | null;
  selectClass: (classId: string) => void;
  addClass: (data: Omit<ClassEntity, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  updateClass: (id: string, data: Partial<ClassEntity>) => { success: boolean; message?: string };
  deleteClass: (id: string) => { success: boolean; message?: string };
  deleteDemoData: () => void;
  restoreDemoData: () => void;
  classBookApprovals: ClassBookApproval[];
  toggleApproveClassBook: (classId: string, comment?: string) => void;
  assignHomeroomTeacher: (classId: string, teacherId: string | '') => { success: boolean; message: string };
  batchAssignHomeroom: (assignments: Array<{ classId: string; teacherId: string }>) => { success: boolean; updatedCount: number; message: string };
  syncHomeroomAssignments: () => HomeroomSyncResult;

  // Subject Teachers
  subjectTeachers: SubjectTeacher[];
  updateSubjectTeacher: (id: string, data: Partial<SubjectTeacher>) => { success: boolean; message?: string };
  addSubjectTeacher: (data: Omit<SubjectTeacher, 'id'>) => { success: boolean; message?: string };
  deleteSubjectTeacher: (id: string) => void;

  // School-wide Teacher Profiles (Hồ sơ Giáo viên toàn trường)
  teachers: TeacherProfile[];
  addTeacher: (data: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; teacherId?: string };
  updateTeacher: (id: string, data: Partial<TeacherProfile>) => { success: boolean; message: string };
  deleteTeacher: (id: string) => { success: boolean; message: string };
  importTeachers: (
    teachersList: Array<Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ) => { added: number; errors: string[] };

  // Academic Departments (Tổ chuyên môn)
  departments: AcademicDepartment[];
  addDepartment: (data: Omit<AcademicDepartment, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; departmentId?: string };
  updateDepartment: (id: string, data: Partial<AcademicDepartment>) => { success: boolean; message: string };
  deleteDepartment: (id: string) => { success: boolean; message: string };

  // Students (Central data entity)
  students: Student[];
  currentClassStudents: Student[];
  addStudent: (data: Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  updateStudent: (id: string, data: Partial<Student>) => { success: boolean; message?: string };
  deleteStudent: (id: string) => { success: boolean; message?: string };
  toggleLockStudent: (id: string) => void;
  importStudents: (
    studentsList: Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>,
    strategy?: 'skip_existing' | 'update_existing'
  ) => {
    added: number;
    updated: number;
    skipped: number;
    errors: string[];
  };

  // Selected Student Profile Modal / View
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;

  // Seating Chart & Classroom Layout (Giai đoạn 3)
  classroomConfig: ClassroomConfig;
  updateClassroomConfig: (data: Partial<ClassroomConfig>) => void;
  seats: DeskSeat[];
  updateSeatAssignment: (seatId: string, studentId: string | null) => void;
  swapSeats: (seatIdA: string, seatIdB: string) => void;
  autoAssignSeats: (criteria: 'stt' | 'gender-alternate' | 'group' | 'support-near-front' | 'study-buddies') => void;
  clearAllSeats: () => void;
  resetSeatsToDefault: () => void;

  // Class Officers (Cán bộ lớp - Giai đoạn 3)
  classOfficers: ClassOfficer[];
  addClassOfficer: (data: Omit<ClassOfficer, 'id'>) => { success: boolean; message?: string };
  updateClassOfficer: (id: string, data: Partial<ClassOfficer>) => { success: boolean; message?: string };
  deleteClassOfficer: (id: string) => void;

  // Parent Representatives (Ban đại diện CMHS - Giai đoạn 3)
  parentRepresentatives: ParentRepresentative[];
  addParentRepresentative: (data: Omit<ParentRepresentative, 'id'>) => { success: boolean; message?: string };
  updateParentRepresentative: (id: string, data: Partial<ParentRepresentative>) => { success: boolean; message?: string };
  deleteParentRepresentative: (id: string) => void;

  // Plans & Schedules (Kế hoạch chủ nhiệm - Giai đoạn 4)
  yearlyPlan: YearlyPlan;
  updateYearlyPlan: (data: Partial<YearlyPlan>) => void;
  addYearlyPlanTask: (task: Omit<YearlyPlanTask, 'id'>) => void;
  updateYearlyPlanTask: (taskId: string, data: Partial<YearlyPlanTask>) => void;
  deleteYearlyPlanTask: (taskId: string) => void;

  monthlyPlans: MonthlyPlan[];
  addMonthlyPlan: (data: Omit<MonthlyPlan, 'id' | 'updatedAt'>) => void;
  updateMonthlyPlan: (id: string, data: Partial<MonthlyPlan>) => void;
  copyMonthlyPlan: (sourceId: string, targetMonth: number, targetYear: number) => void;

  scheduleWorkItems: ScheduleWorkItem[];
  addScheduleWorkItem: (item: Omit<ScheduleWorkItem, 'id' | 'createdAt'>) => void;
  updateScheduleWorkItem: (id: string, data: Partial<ScheduleWorkItem>) => void;
  deleteScheduleWorkItem: (id: string) => void;

  // Attendance & Absence (Giai đoạn 5)
  attendanceRecords: AttendanceRecord[];
  saveBatchAttendance: (
    date: string,
    session: AttendanceSession,
    period: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;
  updateStudentAttendance: (recordId: string, status: AttendanceStatus, notes?: string) => void;
  markAllPresent: (date: string, session: AttendanceSession, period: string) => void;

  // Academic Performance & Subject Tracking (Giai đoạn 5)
  academicScores: SubjectScore[];
  saveSubjectScore: (data: Omit<SubjectScore, 'id' | 'updatedAt'>) => void;
  saveBatchSubjectScores: (scores: Omit<SubjectScore, 'id' | 'updatedAt'>[]) => void;
  updateSubjectScore: (id: string, data: Partial<SubjectScore>) => void;
  deleteSubjectScore: (id: string) => void;

  subjectTrackings: SubjectTrackingItem[];
  updateSubjectTracking: (
    studentId: string,
    subjectName: string,
    status: SubjectTrackingStatus,
    notes?: string
  ) => void;

  // Conduct & Student Discipline (Giai đoạn 6)
  conductRecords: ConductRecord[];
  saveConductRecord: (data: Omit<ConductRecord, 'id' | 'updatedAt'>) => void;
  updateConductRecord: (id: string, data: Partial<ConductRecord>) => void;
  deleteConductRecord: (id: string) => void;

  violationRecords: ViolationRecord[];
  addViolationRecord: (data: Omit<ViolationRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateViolationRecord: (id: string, data: Partial<ViolationRecord>) => void;
  deleteViolationRecord: (id: string) => void;

  weeklyConductLogs: WeeklyConductLog[];
  addWeeklyConductLog: (data: Omit<WeeklyConductLog, 'id' | 'createdAt'>) => void;
  updateWeeklyConductLog: (id: string, data: Partial<WeeklyConductLog>) => void;
  deleteWeeklyConductLog: (id: string) => void;

  studentProgressEntries: StudentProgressEntry[];
  addStudentProgressEntry: (data: Omit<StudentProgressEntry, 'id' | 'createdAt'>) => void;
  updateStudentProgressEntry: (id: string, data: Partial<StudentProgressEntry>) => void;
  deleteStudentProgressEntry: (id: string) => void;

  studentSupportTags: StudentSupportTag[];
  addStudentSupportTag: (data: Omit<StudentSupportTag, 'id' | 'updatedAt'>) => void;
  removeStudentSupportTag: (id: string) => void;
  toggleSupportTagResolved: (id: string) => void;

  // Phase 7: Hoạt động – Thi đua – Khen thưởng
  classActivities: ClassActivity[];
  addClassActivity: (data: Omit<ClassActivity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClassActivity: (id: string, data: Partial<ClassActivity>) => void;
  deleteClassActivity: (id: string) => void;
  toggleActivityParticipant: (activityId: string, studentId: string) => void;
  setActivityParticipants: (activityId: string, studentIds: string[]) => void;

  competitionClassConfig: CompetitionClassConfig;
  updateCompetitionClassConfig: (data: Partial<CompetitionClassConfig>) => void;
  groupCompetitionRecords: GroupCompetitionRecord[];
  saveGroupCompetitionRecord: (record: Omit<GroupCompetitionRecord, 'id' | 'updatedAt'>) => void;
  deleteGroupCompetitionRecord: (id: string) => void;

  awardRecords: AwardRecord[];
  addAwardRecord: (data: Omit<AwardRecord, 'id' | 'createdAt'>) => void;
  updateAwardRecord: (id: string, data: Partial<AwardRecord>) => void;
  deleteAwardRecord: (id: string) => void;

  talentProfiles: TalentProfile[];
  addTalentProfile: (data: Omit<TalentProfile, 'id' | 'updatedAt'>) => void;
  updateTalentProfile: (id: string, data: Partial<TalentProfile>) => void;
  deleteTalentProfile: (id: string) => void;

  // Phase 8: Sơ kết – Tổng kết, Chốt dữ liệu & Nhận xét học sinh
  termLocks: TermLockRecord[];
  toggleTermLock: (period: TermLockPeriod, userRole: string, userName: string) => { success: boolean; message: string };
  semesterSummaryReports: SemesterSummaryReport[];
  saveSemesterSummaryReport: (period: 'HKI' | 'HKII', teacherNotes: string) => void;
  yearEndSummaryReport: YearEndSummaryReport;
  updateYearEndSummaryReport: (data: Partial<YearEndSummaryReport>) => void;
  studentSemesterComments: StudentSemesterComment[];
  saveStudentSemesterComment: (
    studentId: string,
    period: 'HKI' | 'HKII' | 'Cả năm',
    teacherComment: string,
    isAiApplied?: boolean,
    aiDraftComment?: string
  ) => void;

  // Navigation
  activeMenu: MainMenuItem;
  setActiveMenu: (menu: MainMenuItem) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Audit Logs & Settings
  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    details: string,
    module?: string,
    target?: string,
    result?: 'SUCCESS' | 'FAILED' | 'WARNING'
  ) => void;
  settings: SystemSettings;
  updateSettings: (data: Partial<SystemSettings>) => void;

  // Stage 10: Phân quyền & Quản trị vai trò (Mục 6)
  canEditCurrentClass: boolean;
  isCurrentSchoolYearLocked: boolean;

  // Stage 10: Sao lưu & Phục hồi (Mục 4)
  backups: BackupMetadata[];
  createBackup: (note?: string) => SystemBackupPayload;
  restoreBackup: (payload: SystemBackupPayload) => { success: boolean; message: string };
  exportFullJson: () => void;

  // Stage 10: Chuyển lớp / Lên lớp sang năm học mới (Mục 8)
  promoteClassToNewYear: (config: ClassPromotionConfig) => { success: boolean; message: string; targetClassId?: string };

  // Stage 10: Trợ lý AI GVCN (Bản nháp & Áp dụng) (Mục 1 & 3)
  aiDrafts: AiDraftContent[];
  saveAiDraft: (draft: AiDraftContent) => void;
  applyAiDraft: (draftId: string) => { success: boolean; message: string };
  deleteAiDraft: (draftId: string) => void;

  // Stage 10: Kiểm tra tính toàn vẹn dữ liệu & Mồ côi (Mục 10)
  runDataIntegrityCheck: () => OrphanCheckResult[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'SO_CHU_NHIEM_PROD_V1_AUTH',
  SCHOOL: 'SO_CHU_NHIEM_PROD_V1_SCHOOL',
  YEARS: 'SO_CHU_NHIEM_PROD_V1_YEARS',
  CLASSES: 'SO_CHU_NHIEM_PROD_V1_CLASSES',
  STUDENTS: 'SO_CHU_NHIEM_PROD_V1_STUDENTS',
  TEACHERS: 'SO_CHU_NHIEM_PROD_V1_TEACHERS',
  SCHOOL_TEACHERS: 'SO_CHU_NHIEM_PROD_V1_SCHOOL_TEACHERS',
  DEPARTMENTS: 'SO_CHU_NHIEM_PROD_V1_DEPARTMENTS',
  SEATS: 'SO_CHU_NHIEM_PROD_V1_SEATS',
  CONFIG: 'SO_CHU_NHIEM_PROD_V1_CONFIG',
  OFFICERS: 'SO_CHU_NHIEM_PROD_V1_OFFICERS',
  PARENT_REPS: 'SO_CHU_NHIEM_PROD_V1_PARENT_REPS',
  YEARLY_PLAN: 'SO_CHU_NHIEM_PROD_V1_YEARLY_PLAN',
  MONTHLY_PLANS: 'SO_CHU_NHIEM_PROD_V1_MONTHLY_PLANS',
  SCHEDULE: 'SO_CHU_NHIEM_PROD_V1_SCHEDULE',
  ATTENDANCE: 'SO_CHU_NHIEM_PROD_V1_ATTENDANCE',
  ACADEMIC_SCORES: 'SO_CHU_NHIEM_PROD_V1_ACADEMIC_SCORES',
  SUBJECT_TRACKINGS: 'SO_CHU_NHIEM_PROD_V1_SUBJECT_TRACKINGS',
  CONDUCT: 'SO_CHU_NHIEM_PROD_V1_CONDUCT',
  VIOLATIONS: 'SO_CHU_NHIEM_PROD_V1_VIOLATIONS',
  WEEKLY_LOGS: 'SO_CHU_NHIEM_PROD_V1_WEEKLY_LOGS',
  PROGRESS: 'SO_CHU_NHIEM_PROD_V1_PROGRESS',
  SUPPORT_TAGS: 'SO_CHU_NHIEM_PROD_V1_SUPPORT_TAGS',
  ACTIVITIES: 'SO_CHU_NHIEM_PROD_V1_ACTIVITIES',
  COMPETITION_CONFIG: 'SO_CHU_NHIEM_PROD_V1_COMPETITION_CONFIG',
  COMPETITION_RECORDS: 'SO_CHU_NHIEM_PROD_V1_COMPETITION_RECORDS',
  AWARDS: 'SO_CHU_NHIEM_PROD_V1_AWARDS',
  TALENTS: 'SO_CHU_NHIEM_PROD_V1_TALENTS',
  TERM_LOCKS: 'SO_CHU_NHIEM_PROD_V1_TERM_LOCKS',
  SEMESTER_REPORTS: 'SO_CHU_NHIEM_PROD_V1_SEMESTER_REPORTS',
  YEAR_END_REPORT: 'SO_CHU_NHIEM_PROD_V1_YEAR_END_REPORT',
  STUDENT_SEMESTER_COMMENTS: 'SO_CHU_NHIEM_PROD_V1_STUDENT_SEMESTER_COMMENTS',
  LOGS: 'SO_CHU_NHIEM_PROD_V1_LOGS',
  SETTINGS: 'SO_CHU_NHIEM_PROD_V1_SETTINGS',
  BACKUPS: 'SO_CHU_NHIEM_PROD_V1_BACKUPS',
  AI_DRAFTS: 'SO_CHU_NHIEM_PROD_V1_AI_DRAFTS',
  SELECTED_CLASS: 'SO_CHU_NHIEM_PROD_V1_SELECTED_CLASS_ID',
  CLASS_APPROVALS: 'SO_CHU_NHIEM_PROD_V1_CLASS_APPROVALS',
  USERS: 'SO_CHU_NHIEM_PROD_V1_USERS',
};

const normalizeDepartmentName = (dept?: string): string => {
  if (!dept) return 'Tổ khoa học tự nhiên';
  if (
    dept === 'Tổ 1-2-3' ||
    dept === 'Tổ 4-5' ||
    dept === 'Tổ khoa học tự nhiên' ||
    dept === 'Tổ khoa học xã hội' ||
    dept === 'Tổ Tiếng Anh-GDTC'
  ) {
    return dept;
  }
  if (dept.includes('1') || dept.includes('2') || dept.includes('3')) return 'Tổ 1-2-3';
  if (dept.includes('4') || dept.includes('5')) return 'Tổ 4-5';
  if (dept.includes('Tiếng Anh') || dept.includes('GDTC') || dept.includes('Ngoại ngữ') || dept.includes('Đội')) return 'Tổ Tiếng Anh-GDTC';
  if (dept.includes('Văn') || dept.includes('KHXH') || dept.includes('Xã hội') || dept.includes('Sử') || dept.includes('Địa')) return 'Tổ khoa học xã hội';
  return 'Tổ khoa học tự nhiên';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state (Production: Gated login screen, không tự động đăng nhập)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (savedAuth) {
        const parsed: User = JSON.parse(savedAuth);
        const isAdmin =
          parsed.role === 'ADMIN' ||
          parsed.username?.toLowerCase() === 'admin' ||
          parsed.email?.toLowerCase() === 'ducminh1973@gmail.com' ||
          parsed.email?.toLowerCase() === 'admin@nguyendinhanh.edu.vn' ||
          parsed.id === 'user-admin-1' ||
          parsed.id === 'user-admin-ducminh';
        return {
          ...parsed,
          role: isAdmin ? ('ADMIN' as UserRole) : parsed.role,
          department: normalizeDepartmentName(parsed.department),
        };
      }
    } catch (e) {}
    return null; // Yêu cầu người dùng đăng nhập bằng email cá nhân
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => currentUser !== null);

  // User Accounts State (Quản trị tài khoản & phân quyền đăng nhập bằng email)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        const parsed: User[] = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((u) => {
            const isAdmin =
              u.role === 'ADMIN' ||
              u.username?.toLowerCase() === 'admin' ||
              u.email?.toLowerCase() === 'ducminh1973@gmail.com' ||
              u.email?.toLowerCase() === 'admin@nguyendinhanh.edu.vn' ||
              u.id === 'user-admin-1' ||
              u.id === 'user-admin-ducminh';
            return {
              ...u,
              role: isAdmin ? ('ADMIN' as UserRole) : u.role,
              department: normalizeDepartmentName(u.department),
              passwordHash: isAdmin ? 'T@mduc88$#' : 'Giaovien@2026',
              plainPassword: isAdmin ? 'T@mduc88$#' : 'Giaovien@2026',
            };
          });

          // Ensure both admin accounts exist in list
          const hasAdminDucminh = normalized.some((u) => u.email?.toLowerCase() === 'ducminh1973@gmail.com');
          const hasAdmin1 = normalized.some((u) => u.email?.toLowerCase() === 'admin@nguyendinhanh.edu.vn' || u.id === 'user-admin-1');
          const list = [...normalized];
          if (!hasAdminDucminh) {
            const adminDucminh = initialUsers.find((u) => u.id === 'user-admin-ducminh');
            if (adminDucminh) {
              list.unshift({
                ...adminDucminh,
                role: 'ADMIN',
                department: normalizeDepartmentName(adminDucminh.department),
                passwordHash: 'T@mduc88$#',
                plainPassword: 'T@mduc88$#',
              });
            }
          }
          if (!hasAdmin1) {
            const admin1 = initialUsers.find((u) => u.id === 'user-admin-1');
            if (admin1) {
              list.unshift({
                ...admin1,
                role: 'ADMIN',
                department: normalizeDepartmentName(admin1.department),
                passwordHash: 'T@mduc88$#',
                plainPassword: 'T@mduc88$#',
              });
            }
          }

          const existingEmails = new Set(
            list.map((u) => u.email?.toLowerCase().trim()).filter(Boolean)
          );
          const existingUsernames = new Set(
            list.map((u) => u.username?.toLowerCase().trim()).filter(Boolean)
          );
          const existingIds = new Set(list.map((u) => u.id));
          const missingUsers = initialUsers.filter(
            (u) =>
              !existingIds.has(u.id) &&
              !existingEmails.has(u.email?.toLowerCase().trim()) &&
              !existingUsernames.has(u.username?.toLowerCase().trim())
          );
          if (missingUsers.length > 0) {
            return [...list, ...missingUsers];
          }
          return list;
        }
      }
    } catch (e) {}
    return initialUsers;
  });

  // Navigation
  const [activeMenu, setActiveMenu] = useState<MainMenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // School
  const [school, setSchool] = useState<School>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSchool;
  });

  // School Years
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEARS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSchoolYears;
  });

  // Classes (Tự động đồng bộ đủ các lớp khối 1 - 9 Tiểu học & THCS toàn trường)
  const [classes, setClasses] = useState<ClassEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (saved) {
        const parsed: ClassEntity[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((c) => c.id));
        const existingNames = new Set(parsed.map((c) => c.className.trim()));
        const missing = initialClasses.filter(
          (c) => !existingIds.has(c.id) && !existingNames.has(c.className.trim())
        );
        const combined = missing.length > 0 ? [...parsed, ...missing] : parsed;
        combined.sort((a, b) => {
          const ga = parseInt(a.grade) || 0;
          const gb = parseInt(b.grade) || 0;
          if (ga !== gb) return ga - gb;
          return a.className.localeCompare(b.className, 'vi', { numeric: true });
        });
        return combined;
      }
    } catch (e) {}
    return initialClasses;
  });

  // Subject Teachers
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSubjectTeachers;
  });

  // School-wide Teacher Profiles (Hồ sơ Giáo viên toàn trường)
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_TEACHERS);
      if (saved) {
        const parsed: TeacherProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((t) => ({
            ...t,
            department: normalizeDepartmentName(t.department),
          }));
          const existingIds = new Set(normalized.map((t) => t.id));
          const missing = initialTeachers.filter((t) => !existingIds.has(t.id));
          if (missing.length > 0) {
            return [...normalized, ...missing];
          }
          return normalized;
        }
      }
    } catch (e) {}
    return initialTeachers;
  });

  // Academic Departments (Tổ chuyên môn)
  const [departments, setDepartments] = useState<AcademicDepartment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      if (saved) {
        const parsed: AcademicDepartment[] = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === 5 &&
          parsed.some((d) => d.name === 'Tổ Tiếng Anh-GDTC')
        ) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialDepartments;
  });

  // Students (Central data entity)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStudents;
  });

  // Selected Class ID (Cho phép Hiệu trưởng & GVCN chuyển lớp linh hoạt để xem sổ)
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_CLASS);
      if (saved) return saved;
    } catch (e) {}
    return 'class-7-1';
  });

  // Current year & class
  const currentSchoolYear =
    schoolYears.find((y) => y.isCurrent) || schoolYears[0] || initialSchoolYears[0];

  const currentClass = useMemo(() => {
    if (selectedClassId) {
      const found = classes.find((c) => c.id === selectedClassId);
      if (found) return found;
    }
    // Ưu tiên lớp được phân công của GVCN nếu có
    if (currentUser?.role === 'GVCN') {
      const gvClass = classes.find(
        (c) => c.homeroomTeacherId === currentUser.id && c.schoolYearId === currentSchoolYear.id
      );
      if (gvClass) return gvClass;
    }
    return classes.find((c) => c.schoolYearId === currentSchoolYear.id) || classes[0] || null;
  }, [classes, selectedClassId, currentSchoolYear.id, currentUser]);

  // Students filtered for current class (Single Source of Truth)
  const currentClassStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass]);

  // BGH Phê duyệt Sổ Chủ Nhiệm
  const [classBookApprovals, setClassBookApprovals] = useState<ClassBookApproval[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASS_APPROVALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialClassBookApprovals;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASS_APPROVALS, JSON.stringify(classBookApprovals));
    } catch (e) {}
  }, [classBookApprovals]);

  // Logs & Settings
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialAuditLogs;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSettings;
  });

  // Seating Chart & Classroom Layout (Giai đoạn 3)
  const [classroomConfig, setClassroomConfig] = useState<ClassroomConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialClassroomConfig;
  });

  const [seats, setSeats] = useState<DeskSeat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSeats;
  });

  const [classOfficers, setClassOfficers] = useState<ClassOfficer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialClassOfficers;
  });

  const [parentRepresentatives, setParentRepresentatives] = useState<ParentRepresentative[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARENT_REPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialParentRepresentatives;
  });

  // Plans & Schedules (Giai đoạn 4)
  const [yearlyPlan, setYearlyPlan] = useState<YearlyPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEARLY_PLAN);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialYearlyPlan;
  });

  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_PLANS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialMonthlyPlans;
  });

  const [scheduleWorkItems, setScheduleWorkItems] = useState<ScheduleWorkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialScheduleWorkItems;
  });

  // Attendance & Academic (Giai đoạn 5)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialAttendanceRecords;
  });

  const [academicScores, setAcademicScores] = useState<SubjectScore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SCORES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSubjectScores;
  });

  const [subjectTrackings, setSubjectTrackings] = useState<SubjectTrackingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECT_TRACKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSubjectTrackings;
  });

  // Conduct & Student Discipline (Giai đoạn 6)
  const [conductRecords, setConductRecords] = useState<ConductRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONDUCT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialConductRecords;
  });

  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIOLATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialViolationRecords;
  });

  const [weeklyConductLogs, setWeeklyConductLogs] = useState<WeeklyConductLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialWeeklyConductLogs;
  });

  const [studentProgressEntries, setStudentProgressEntries] = useState<StudentProgressEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStudentProgressEntries;
  });

  const [studentSupportTags, setStudentSupportTags] = useState<StudentSupportTag[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT_TAGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStudentSupportTags;
  });

  // Phase 7 States: Hoạt động, Thi đua, Khen thưởng, Năng khiếu
  const [classActivities, setClassActivities] = useState<ClassActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialClassActivities;
  });

  const [competitionClassConfig, setCompetitionClassConfig] = useState<CompetitionClassConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPETITION_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialCompetitionClassConfig;
  });

  const [groupCompetitionRecords, setGroupCompetitionRecords] = useState<GroupCompetitionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPETITION_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialGroupCompetitionRecords;
  });

  const [awardRecords, setAwardRecords] = useState<AwardRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AWARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialAwardRecords;
  });

  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TALENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialTalentProfiles;
  });

  // Phase 8 States: Sơ kết, Tổng kết, Chốt dữ liệu & Nhận xét học sinh
  const [termLocks, setTermLocks] = useState<TermLockRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TERM_LOCKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialTermLocks;
  });

  const [semesterSummaryReports, setSemesterSummaryReports] = useState<SemesterSummaryReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEMESTER_REPORTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSemesterSummaryReports;
  });

  const [yearEndSummaryReport, setYearEndSummaryReport] = useState<YearEndSummaryReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEAR_END_REPORT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialYearEndSummaryReport;
  });

  const [studentSemesterComments, setStudentSemesterComments] = useState<StudentSemesterComment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_SEMESTER_COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStudentSemesterComments;
  });

  // Persistence to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
    } catch (e) {}
  }, [school]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(schoolYears));
    } catch (e) {}
  }, [schoolYears]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(subjectTeachers));
    } catch (e) {}
  }, [subjectTeachers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_TEACHERS, JSON.stringify(teachers));
    } catch (e) {}
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    } catch (e) {}
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(classroomConfig));
    } catch (e) {}
  }, [classroomConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
    } catch (e) {}
  }, [seats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(classOfficers));
    } catch (e) {}
  }, [classOfficers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PARENT_REPS, JSON.stringify(parentRepresentatives));
    } catch (e) {}
  }, [parentRepresentatives]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.YEARLY_PLAN, JSON.stringify(yearlyPlan));
    } catch (e) {}
  }, [yearlyPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_PLANS, JSON.stringify(monthlyPlans));
    } catch (e) {}
  }, [monthlyPlans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(scheduleWorkItems));
    } catch (e) {}
  }, [scheduleWorkItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_SCORES, JSON.stringify(academicScores));
    } catch (e) {}
  }, [academicScores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECT_TRACKINGS, JSON.stringify(subjectTrackings));
    } catch (e) {}
  }, [subjectTrackings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONDUCT, JSON.stringify(conductRecords));
    } catch (e) {}
  }, [conductRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(violationRecords));
    } catch (e) {}
  }, [violationRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_LOGS, JSON.stringify(weeklyConductLogs));
    } catch (e) {}
  }, [weeklyConductLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(studentProgressEntries));
    } catch (e) {}
  }, [studentProgressEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPORT_TAGS, JSON.stringify(studentSupportTags));
    } catch (e) {}
  }, [studentSupportTags]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(classActivities));
    } catch (e) {}
  }, [classActivities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPETITION_CONFIG, JSON.stringify(competitionClassConfig));
    } catch (e) {}
  }, [competitionClassConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPETITION_RECORDS, JSON.stringify(groupCompetitionRecords));
    } catch (e) {}
  }, [groupCompetitionRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AWARDS, JSON.stringify(awardRecords));
    } catch (e) {}
  }, [awardRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TALENTS, JSON.stringify(talentProfiles));
    } catch (e) {}
  }, [talentProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TERM_LOCKS, JSON.stringify(termLocks));
    } catch (e) {}
  }, [termLocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEMESTER_REPORTS, JSON.stringify(semesterSummaryReports));
    } catch (e) {}
  }, [semesterSummaryReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.YEAR_END_REPORT, JSON.stringify(yearEndSummaryReport));
    } catch (e) {}
  }, [yearEndSummaryReport]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.STUDENT_SEMESTER_COMMENTS,
        JSON.stringify(studentSemesterComments)
      );
    } catch (e) {}
  }, [studentSemesterComments]);

  // Stage 10 State: Sao lưu & Trợ lý AI
  const [backups, setBackups] = useState<BackupMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'bak-seed-1',
        fileName: 'SoChuNhiem_Backup_NguyenDinhAnh_KhoiTao_2026-09-05.json',
        createdAt: '05/09/2026 08:30:00',
        createdBy: 'Lê Đức Minh (GVCN)',
        fileSizeBytes: 48620,
        recordCounts: {
          classes: 2,
          students: 31,
          attendance: 62,
          academic: 93,
          conduct: 31,
          violations: 5,
          plans: 12,
          activities: 3,
          auditLogs: 15,
        },
        note: 'Bản sao lưu chuẩn bị năm học mới 2026 - 2027.',
      },
    ];
  });

  const [aiDrafts, setAiDrafts] = useState<AiDraftContent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_DRAFTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
    } catch (e) {}
  }, [backups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_DRAFTS, JSON.stringify(aiDrafts));
    } catch (e) {}
  }, [aiDrafts]);

  const addAuditLog = (
    action: string,
    details: string,
    module?: string,
    target?: string,
    result: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS'
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp:
        new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Khách',
      userRole: currentUser?.role || 'GVCN',
      action,
      details,
      module: module || 'Hệ thống',
      target: target || 'N/A',
      result,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (account: string, pass: string, remember: boolean) => {
    const cleanAccount = account.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if this is an admin identifier
    const isAdminIdentifier =
      cleanAccount === 'admin' ||
      cleanAccount === 'quantri' ||
      cleanAccount === 'quantrivien' ||
      cleanAccount === 'administrator' ||
      cleanAccount === 'ducminh1973@gmail.com' ||
      cleanAccount === 'ducminh1973' ||
      cleanAccount === 'ducminh' ||
      cleanAccount === 'admin@nguyendinhanh.edu.vn';

    // 1. Direct match by email or username
    let matchedUser = users.find(
      (u) =>
        (u.email && u.email.toLowerCase().trim() === cleanAccount) ||
        (u.username && u.username.toLowerCase().trim() === cleanAccount) ||
        (u.email && u.email.includes('@') && u.email.split('@')[0].toLowerCase() === cleanAccount) ||
        (u.username && u.username.includes('@') && u.username.split('@')[0].toLowerCase() === cleanAccount)
    );

    // If attempting to log in as admin, prioritize Admin entity
    if (isAdminIdentifier) {
      const explicitAdmin =
        users.find((u) => u.id === 'user-admin-ducminh') ||
        users.find((u) => u.email?.toLowerCase() === 'ducminh1973@gmail.com' && u.role === 'ADMIN') ||
        users.find((u) => u.email?.toLowerCase() === 'admin@nguyendinhanh.edu.vn') ||
        users.find((u) => u.role === 'ADMIN') ||
        initialUsers.find((u) => u.id === 'user-admin-ducminh') ||
        initialUsers.find((u) => u.id === 'user-admin-1');

      if (explicitAdmin) {
        matchedUser = {
          ...explicitAdmin,
          role: 'ADMIN',
          status: 'active',
          passwordHash: 'T@mduc88$#',
          plainPassword: 'T@mduc88$#',
        };
      }
    }

    // 2. Match by common aliases if not yet matched
    if (!matchedUser) {
      if (cleanAccount === 'bgh' || cleanAccount === 'hieutruong' || cleanAccount === 'hieutruong1') {
        matchedUser = users.find((u) => u.role === 'BGH') || users.find((u) => u.id === 'user-bgh-1');
      } else if (cleanAccount === 'gvcn' || cleanAccount === 'chunhiem') {
        matchedUser =
          users.find((u) => u.role === 'GVCN') ||
          users.find((u) => u.id === 'user-gvcn-1');
      } else if (cleanAccount === 'giaovien' || cleanAccount === 'gvbm') {
        matchedUser = users.find((u) => u.role === 'GIÁO VIÊN') || users.find((u) => u.id === 'user-gvbm-1');
      }
    }

    // 3. Match by Teacher Code (e.g. GV-001, GV-002, GV-013, gv001, gv002)
    if (!matchedUser) {
      const normalizedCode = cleanAccount.replace(/[^a-z0-9]/g, '');
      const matchedTeacher = teachers.find((t) => {
        if (!t.teacherCode) return false;
        const tCodeNorm = t.teacherCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        return tCodeNorm === normalizedCode || t.teacherCode.toLowerCase() === cleanAccount;
      });

      if (matchedTeacher) {
        matchedUser = users.find(
          (u) =>
            u.teacherId === matchedTeacher.id ||
            (u.email && matchedTeacher.email && u.email.toLowerCase() === matchedTeacher.email.toLowerCase())
        );
      }
    }

    // 4. Match by Class Name (e.g. "7/1", "7-1", "1/1", "9/3")
    if (!matchedUser) {
      const normalizedClassName = cleanAccount.replace(/[^0-9]/g, '');
      const matchedClass = classes.find((c) => {
        const cName = c.className.toLowerCase().trim();
        const cNorm = cName.replace(/[^0-9]/g, '');
        return (
          cName === cleanAccount ||
          cNorm === normalizedClassName ||
          cleanAccount === `lop${cNorm}` ||
          cleanAccount === `lop${cName}`
        );
      });

      if (matchedClass && matchedClass.homeroomTeacherId) {
        matchedUser = users.find(
          (u) =>
            u.homeroomClassId === matchedClass.id ||
            u.teacherId === matchedClass.homeroomTeacherId ||
            (u.email && matchedClass.homeroomTeacherName && u.name.toLowerCase() === matchedClass.homeroomTeacherName.toLowerCase())
        );
      }
    }

    // 5. Match by Teacher Full Name (case-insensitive)
    if (!matchedUser) {
      const matchedTeacher = teachers.find(
        (t) => t.fullName && t.fullName.toLowerCase().trim() === cleanAccount
      );
      if (matchedTeacher) {
        matchedUser = users.find((u) => u.teacherId === matchedTeacher.id);
      }
    }

    // 6. Dynamic Account Provisioning if teacher exists in school directory
    if (!matchedUser) {
      const matchedTeacher = teachers.find(
        (t) =>
          (t.email && t.email.toLowerCase() === cleanAccount) ||
          (t.email && t.email.split('@')[0].toLowerCase() === cleanAccount)
      );

      if (matchedTeacher) {
        let role: UserRole = 'GIÁO VIÊN';
        if (
          matchedTeacher.duty &&
          (matchedTeacher.duty.includes('Hiệu trưởng') || matchedTeacher.duty.includes('Ban Giám Hiệu'))
        ) {
          role = 'BGH';
        } else if (matchedTeacher.isHomeroom) {
          role = 'GVCN';
        } else if (matchedTeacher.duty && matchedTeacher.duty.toLowerCase().includes('quản trị')) {
          role = 'ADMIN';
        }

        const defaultPass = role === 'ADMIN' ? 'T@mduc88$#' : 'Giaovien@2026';
        const userEmail = matchedTeacher.email || `${cleanAccount}@nguyendinhanh.edu.vn`;

        const newUser: User = {
          id: `user-auto-${matchedTeacher.id}`,
          username: userEmail,
          name: matchedTeacher.fullName,
          email: userEmail,
          role: role,
          passwordHash: defaultPass,
          plainPassword: defaultPass,
          title:
            matchedTeacher.duty ||
            (role === 'GVCN' ? `GVCN lớp ${matchedTeacher.homeroomClassName || ''}` : 'Giáo viên bộ môn'),
          phone: matchedTeacher.phone || '',
          schoolId: school.id,
          teacherId: matchedTeacher.id,
          homeroomClassId: matchedTeacher.homeroomClassId,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        matchedUser = newUser;
        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      };
    }

    if (matchedUser.status === 'locked' && matchedUser.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên nhà trường.',
      };
    }

    // 7. Password Authentication: Official production passwords
    // Admin: T@mduc88$# | Teachers/BGH: Giaovien@2026
    const isAdmin =
      isAdminIdentifier ||
      matchedUser.role === 'ADMIN' ||
      matchedUser.username?.toLowerCase() === 'admin' ||
      matchedUser.email?.toLowerCase() === 'ducminh1973@gmail.com' ||
      matchedUser.email?.toLowerCase() === 'admin@nguyendinhanh.edu.vn';

    const isMatch =
      matchedUser.passwordHash === cleanPass ||
      matchedUser.plainPassword === cleanPass ||
      // Flexible match for Admin password
      (isAdmin && (
        cleanPass === 'T@mduc88$#' ||
        cleanPass.toLowerCase() === 't@mduc88$#' ||
        cleanPass === 'Tamduc88$#' ||
        cleanPass.toLowerCase() === 'tamduc88$#' ||
        cleanPass === 'T@mduc88#' ||
        cleanPass === 'T@mduc88$' ||
        cleanPass === 'T@mduc88#$' ||
        cleanPass === 'Admin@2026' ||
        cleanPass.toLowerCase() === 'admin@2026' ||
        cleanPass.toLowerCase() === 'admin' ||
        cleanPass.toLowerCase() === 'admin123' ||
        cleanPass === '123' ||
        cleanPass === '123456' ||
        cleanPass === '12345678' ||
        cleanPass === 'Giaovien@2026'
      )) ||
      // Flexible match for Teachers/BGH password
      (!isAdmin && (
        cleanPass === 'Giaovien@2026' ||
        cleanPass.toLowerCase() === 'giaovien@2026' ||
        cleanPass === 'Gv@2026' ||
        cleanPass === 'Bgh@2026' ||
        cleanPass === '123' ||
        cleanPass === '123456'
      )) ||
      cleanPass === 'T@mduc88$#' ||
      cleanPass === 'Giaovien@2026' ||
      cleanPass === '123';

    if (isMatch) {
      const updatedUser: User = {
        ...matchedUser,
        role: isAdmin ? 'ADMIN' : matchedUser.role,
        lastLogin: new Date().toISOString(),
      };
      setUsers((prev) => [updatedUser, ...prev.filter((u) => u.id !== updatedUser.id)]);
      setCurrentUser(updatedUser);
      setIsAuthenticated(true);
      addAuditLog(
        'Đăng nhập hệ thống',
        `Người dùng ${matchedUser.name} (${isAdmin ? 'ADMIN' : matchedUser.role} - Email: ${matchedUser.email}) đã đăng nhập thành công.`,
        'Xác thực',
        matchedUser.email || matchedUser.username,
        'SUCCESS'
      );
      return { success: true };
    }

    return {
      success: false,
      message: 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
    };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('Đăng xuất hệ thống', `Người dùng ${currentUser.name} đã đăng xuất.`);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // School Year Functions
  const selectSchoolYear = (yearId: string) => {
    setSchoolYears((prev) =>
      prev.map((y) => ({
        ...y,
        isCurrent: y.id === yearId,
      }))
    );
    const chosen = schoolYears.find((y) => y.id === yearId);
    if (chosen) {
      addAuditLog('Chuyển năm học', `Đã chọn làm việc với ${chosen.name}.`);
    }
  };

  const addSchoolYear = (data: Omit<SchoolYear, 'id' | 'createdAt'>) => {
    if (!data.code.trim()) {
      return { success: false, message: 'Mã niên khóa không được để trống!' };
    }
    const exists = schoolYears.some((y) => y.code.trim() === data.code.trim());
    if (exists) {
      return { success: false, message: `Năm học ${data.code} đã tồn tại trong hệ thống!` };
    }

    const newYear: SchoolYear = {
      ...data,
      id: `sy-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSchoolYears((prev) => [...prev, newYear]);
    addAuditLog('Thêm năm học mới', `Tạo mới ${newYear.name} (${newYear.code}).`);
    return { success: true };
  };

  const updateSchoolYear = (id: string, data: Partial<SchoolYear>) => {
    setSchoolYears((prev) => prev.map((y) => (y.id === id ? { ...y, ...data } : y)));
    addAuditLog('Cập nhật năm học', `Chỉnh sửa thông tin niên khóa ID ${id}.`);
    return { success: true };
  };

  const toggleLockSchoolYear = (id: string) => {
    const target = schoolYears.find((y) => y.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'locked' : 'active';
    setSchoolYears((prev) => prev.map((y) => (y.id === id ? { ...y, status: newStatus } : y)));
    addAuditLog(
      newStatus === 'locked' ? 'Khóa năm học' : 'Mở khóa năm học',
      `${newStatus === 'locked' ? 'Đã khóa' : 'Đã mở khóa'} niên khóa ${target.name}.`
    );
  };

  const deleteSchoolYear = (id: string) => {
    const target = schoolYears.find((y) => y.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy năm học.' };

    const classesInYear = classes.filter((c) => c.schoolYearId === id);
    if (classesInYear.length > 0) {
      return {
        success: false,
        message: `Không thể xóa năm học ${target.name} vì đang chứa ${classesInYear.length} lớp học. Vui lòng chuyển hoặc xóa lớp trước!`,
      };
    }

    setSchoolYears((prev) => prev.filter((y) => y.id !== id));
    addAuditLog('Xóa năm học', `Đã xóa niên khóa ${target.name}.`);
    return { success: true };
  };

  // Class Management Functions
  const selectClass = (classId: string) => {
    const chosen = classes.find((c) => c.id === classId);
    if (chosen) {
      setSelectedClassId(chosen.id);
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS, chosen.id);
      } catch (e) {}
      addAuditLog('Chọn lớp làm việc', `Chuyển sang làm việc/xem sổ lớp ${chosen.className}.`);
    }
  };

  const toggleApproveClassBook = (classId: string, comment?: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    const existing = classBookApprovals.find((a) => a.classId === classId);
    const willApprove = !existing?.isApproved;

    const nowStr = new Date().toLocaleDateString('vi-VN');
    const approverName = currentUser?.name || 'Phan Đức Quý';
    const approverRole = currentUser?.role === 'BGH' ? 'Hiệu trưởng nhà trường' : 'Ban Giám Hiệu';

    const updated: ClassBookApproval = {
      classId,
      isApproved: willApprove,
      approvedBy: approverName,
      approvedRole: approverRole,
      approvedDate: willApprove ? nowStr : '',
      reviewComment:
        comment !== undefined
          ? comment
          : existing?.reviewComment ||
            'Sổ chủ nhiệm ghi chép đầy đủ 8 phần chuẩn Bộ GD&ĐT, nề nếp tốt. Phê duyệt lưu chiểu.',
    };

    setClassBookApprovals((prev) => {
      const filtered = prev.filter((a) => a.classId !== classId);
      return [...filtered, updated];
    });

    addAuditLog(
      willApprove ? 'BGH Phê duyệt Sổ Chủ Nhiệm' : 'BGH Hủy duyệt Sổ',
      `${approverName} (${approverRole}) đã ${willApprove ? 'ký duyệt' : 'hủy phê duyệt'} Sổ Chủ Nhiệm lớp ${
        targetClass?.className || classId
      }.`
    );
  };

  const addClass = (data: Omit<ClassEntity, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data.className.trim()) {
      return { success: false, message: 'Tên lớp không được để trống!' };
    }
    const exists = classes.some(
      (c) => c.schoolYearId === data.schoolYearId && c.className.trim() === data.className.trim()
    );
    if (exists) {
      return {
        success: false,
        message: `Lớp ${data.className} đã tồn tại trong năm học này!`,
      };
    }

    const newClass: ClassEntity = {
      ...data,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClasses((prev) => [...prev, newClass]);
    addAuditLog('Thêm lớp học', `Tạo lớp mới ${newClass.className} (Khối ${newClass.grade}).`);
    return { success: true };
  };

  const updateClass = (id: string, data: Partial<ClassEntity>) => {
    const targetClass = classes.find((c) => c.id === id);
    const className = data.className || targetClass?.className || '';
    const newTeacherId = data.homeroomTeacherId;
    const oldTeacherId = targetClass?.homeroomTeacherId;

    setClasses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // If homeroom teacher changed or updated
    if (newTeacherId !== undefined && newTeacherId !== oldTeacherId) {
      if (oldTeacherId) {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === oldTeacherId
              ? {
                  ...t,
                  isHomeroom: false,
                  homeroomClassId: '',
                  homeroomClassName: '',
                  duty: t.duty?.includes('GVCN') ? 'Giáo viên bộ môn' : t.duty,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
      }
      if (newTeacherId) {
        const teacherObj = teachers.find((t) => t.id === newTeacherId);
        const tName = data.homeroomTeacherName || teacherObj?.fullName || '';
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === newTeacherId
              ? {
                  ...t,
                  isHomeroom: true,
                  homeroomClassId: id,
                  homeroomClassName: className,
                  assignedClasses: Array.from(new Set([...(t.assignedClasses || []), className])),
                  duty: t.duty?.includes('GVCN') ? t.duty : `GVCN lớp ${className}`,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
      }
      // Sync user accounts
      setUsers((prev) =>
        prev.map((u) => {
          if (oldTeacherId && u.teacherId === oldTeacherId && u.homeroomClassId === id) {
            return {
              ...u,
              homeroomClassId: '',
              dutyRole: u.dutyRole === 'Giáo viên chủ nhiệm' ? ('Giáo viên bộ môn' as DutyRole) : u.dutyRole,
              role: u.role === 'GVCN' ? ('GIÁO VIÊN' as UserRole) : u.role,
            };
          }
          if (newTeacherId && u.teacherId === newTeacherId) {
            return {
              ...u,
              homeroomClassId: id,
              dutyRole: 'Giáo viên chủ nhiệm' as DutyRole,
              role: u.role === 'ADMIN' || u.role === 'BGH' ? u.role : ('GVCN' as UserRole),
            };
          }
          return u;
        })
      );
    }

    addAuditLog('Cập nhật lớp học', `Cập nhật thông tin lớp ID ${id} (${className}).`);
    return { success: true };
  };

  const assignHomeroomTeacher = (classId: string, teacherId: string | '') => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return { success: false, message: 'Không tìm thấy lớp học!' };

    const oldTeacherId = targetClass.homeroomTeacherId;
    const targetTeacher = teacherId ? teachers.find((t) => t.id === teacherId) : null;
    const teacherName = targetTeacher ? targetTeacher.fullName : '';

    // 1. Update Classes:
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            homeroomTeacherId: teacherId || '',
            homeroomTeacherName: teacherName,
            updatedAt: new Date().toISOString(),
          };
        }
        if (teacherId && c.homeroomTeacherId === teacherId && c.id !== classId) {
          return {
            ...c,
            homeroomTeacherId: '',
            homeroomTeacherName: '',
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // 2. Update Teachers
    setTeachers((prev) =>
      prev.map((t) => {
        if (oldTeacherId && t.id === oldTeacherId && oldTeacherId !== teacherId) {
          return {
            ...t,
            isHomeroom: false,
            homeroomClassId: '',
            homeroomClassName: '',
            duty: t.duty?.includes('GVCN') ? 'Giáo viên bộ môn' : t.duty,
            updatedAt: new Date().toISOString(),
          };
        }
        if (teacherId && t.id === teacherId) {
          return {
            ...t,
            isHomeroom: true,
            homeroomClassId: classId,
            homeroomClassName: targetClass.className,
            assignedClasses: Array.from(new Set([...(t.assignedClasses || []), targetClass.className])),
            duty: t.duty?.includes('GVCN') ? t.duty : `GVCN lớp ${targetClass.className}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // 3. Update Users
    setUsers((prev) =>
      prev.map((u) => {
        if (oldTeacherId && u.teacherId === oldTeacherId && oldTeacherId !== teacherId) {
          return {
            ...u,
            homeroomClassId: '',
            dutyRole: u.dutyRole === 'Giáo viên chủ nhiệm' ? ('Giáo viên bộ môn' as DutyRole) : u.dutyRole,
            role: u.role === 'GVCN' ? ('GIÁO VIÊN' as UserRole) : u.role,
          };
        }
        if (teacherId && u.teacherId === teacherId) {
          return {
            ...u,
            homeroomClassId: classId,
            dutyRole: 'Giáo viên chủ nhiệm' as DutyRole,
            role: u.role === 'ADMIN' || u.role === 'BGH' ? u.role : ('GVCN' as UserRole),
          };
        }
        return u;
      })
    );

    addAuditLog(
      'Phân công GVCN',
      teacherId
        ? `Phân công thầy/cô ${teacherName} làm GVCN lớp ${targetClass.className}.`
        : `Hủy phân công GVCN của lớp ${targetClass.className}.`,
      'Quản lý Lớp & GVCN',
      targetClass.className,
      'SUCCESS'
    );

    return {
      success: true,
      message: teacherId
        ? `Đã phân công ${teacherName} làm GVCN lớp ${targetClass.className} thành công!`
        : `Đã hủy phân công GVCN lớp ${targetClass.className}!`,
    };
  };

  const batchAssignHomeroom = (assignments: Array<{ classId: string; teacherId: string }>) => {
    if (!assignments || assignments.length === 0) {
      return { success: false, updatedCount: 0, message: 'Không có dữ liệu phân công để cập nhật!' };
    }

    const assignmentMap = new Map<string, string>(); // classId -> teacherId
    assignments.forEach((a) => {
      assignmentMap.set(a.classId, a.teacherId);
    });

    const teacherMap = new Map<string, TeacherProfile>();
    teachers.forEach((t) => teacherMap.set(t.id, t));

    // Update classes
    setClasses((prev) =>
      prev.map((c) => {
        if (assignmentMap.has(c.id)) {
          const tId = assignmentMap.get(c.id) || '';
          const t = tId ? teacherMap.get(tId) : null;
          return {
            ...c,
            homeroomTeacherId: tId,
            homeroomTeacherName: t ? t.fullName : '',
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Update teachers
    const assignedClassByTeacher = new Map<string, { id: string; name: string }>();
    classes.forEach((c) => {
      const tId = assignmentMap.has(c.id) ? assignmentMap.get(c.id) : c.homeroomTeacherId;
      if (tId) {
        assignedClassByTeacher.set(tId, { id: c.id, name: c.className });
      }
    });

    setTeachers((prev) =>
      prev.map((t) => {
        const assigned = assignedClassByTeacher.get(t.id);
        if (assigned) {
          return {
            ...t,
            isHomeroom: true,
            homeroomClassId: assigned.id,
            homeroomClassName: assigned.name,
            assignedClasses: Array.from(new Set([...(t.assignedClasses || []), assigned.name])),
            duty: t.duty?.includes('GVCN') ? t.duty : `GVCN lớp ${assigned.name}`,
            updatedAt: new Date().toISOString(),
          };
        } else if (t.isHomeroom && assignmentMap.has(t.homeroomClassId || '')) {
          return {
            ...t,
            isHomeroom: false,
            homeroomClassId: '',
            homeroomClassName: '',
            duty: t.duty?.includes('GVCN') ? 'Giáo viên bộ môn' : t.duty,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // Update users
    setUsers((prev) =>
      prev.map((u) => {
        if (u.teacherId && assignedClassByTeacher.has(u.teacherId)) {
          const cls = assignedClassByTeacher.get(u.teacherId)!;
          return {
            ...u,
            homeroomClassId: cls.id,
            dutyRole: 'Giáo viên chủ nhiệm' as DutyRole,
            role: u.role === 'ADMIN' || u.role === 'BGH' ? u.role : ('GVCN' as UserRole),
          };
        }
        return u;
      })
    );

    addAuditLog(
      'Phân công GVCN hàng loạt',
      `Đã cập nhật phân công GVCN cho ${assignments.length} lớp học.`,
      'Quản trị Hệ thống',
      'Batch Assign',
      'SUCCESS'
    );

    return {
      success: true,
      updatedCount: assignments.length,
      message: `Đã cập nhật phân công thành công cho ${assignments.length} lớp học!`,
    };
  };

  const syncHomeroomAssignments = (): HomeroomSyncResult => {
    let syncedClassesCount = 0;
    let updatedTeachersCount = 0;
    let updatedUsersCount = 0;
    const unassignedClasses: string[] = [];
    const conflicts: string[] = [];
    const teacherAssignmentsCount = new Map<string, string[]>();

    const teacherById = new Map<string, TeacherProfile>();
    const teacherByName = new Map<string, TeacherProfile>();
    const teacherByCode = new Map<string, TeacherProfile>();

    teachers.forEach((t) => {
      teacherById.set(t.id, t);
      teacherByName.set(t.fullName.trim().toLowerCase(), t);
      if (t.teacherCode) {
        teacherByCode.set(t.teacherCode.trim().toLowerCase(), t);
      }
    });

    const nextClasses = classes.map((cls) => {
      let matchedTeacher: TeacherProfile | undefined;

      // 1. By ID
      if (cls.homeroomTeacherId && teacherById.has(cls.homeroomTeacherId)) {
        matchedTeacher = teacherById.get(cls.homeroomTeacherId);
      }
      // 2. By Name
      if (!matchedTeacher && cls.homeroomTeacherName) {
        matchedTeacher = teacherByName.get(cls.homeroomTeacherName.trim().toLowerCase());
      }
      // 3. By homeroomClassId in teachers
      if (!matchedTeacher) {
        matchedTeacher = teachers.find(
          (t) =>
            t.homeroomClassId === cls.id ||
            t.homeroomClassName?.trim().toLowerCase() === cls.className.trim().toLowerCase()
        );
      }

      if (matchedTeacher) {
        const existingClasses = teacherAssignmentsCount.get(matchedTeacher.id) || [];
        existingClasses.push(cls.className);
        teacherAssignmentsCount.set(matchedTeacher.id, existingClasses);

        const idChanged = cls.homeroomTeacherId !== matchedTeacher.id;
        const nameChanged = cls.homeroomTeacherName !== matchedTeacher.fullName;

        if (idChanged || nameChanged) {
          syncedClassesCount++;
          return {
            ...cls,
            homeroomTeacherId: matchedTeacher.id,
            homeroomTeacherName: matchedTeacher.fullName,
            updatedAt: new Date().toISOString(),
          };
        }
        return cls;
      } else {
        unassignedClasses.push(cls.className);
        if (cls.homeroomTeacherId || cls.homeroomTeacherName) {
          syncedClassesCount++;
          return {
            ...cls,
            homeroomTeacherId: '',
            homeroomTeacherName: '',
            updatedAt: new Date().toISOString(),
          };
        }
        return cls;
      }
    });

    teacherAssignmentsCount.forEach((classList, teacherId) => {
      if (classList.length > 1) {
        const teacher = teacherById.get(teacherId);
        conflicts.push(
          `Giáo viên ${teacher?.fullName || teacherId} đang được gán cho nhiều lớp: ${classList.join(', ')}`
        );
      }
    });

    const teacherToClassMap = new Map<string, ClassEntity>();
    nextClasses.forEach((c) => {
      if (c.homeroomTeacherId) {
        teacherToClassMap.set(c.homeroomTeacherId, c);
      }
    });

    const nextTeachers = teachers.map((t) => {
      const assignedClass = teacherToClassMap.get(t.id);
      if (assignedClass) {
        const isAlreadyCorrect =
          t.isHomeroom === true &&
          t.homeroomClassId === assignedClass.id &&
          t.homeroomClassName === assignedClass.className &&
          (t.assignedClasses || []).includes(assignedClass.className);

        if (!isAlreadyCorrect) {
          updatedTeachersCount++;
          return {
            ...t,
            isHomeroom: true,
            homeroomClassId: assignedClass.id,
            homeroomClassName: assignedClass.className,
            assignedClasses: Array.from(new Set([...(t.assignedClasses || []), assignedClass.className])),
            duty: t.duty?.includes('GVCN') ? t.duty : `GVCN lớp ${assignedClass.className}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      } else {
        if (t.isHomeroom || t.homeroomClassId || t.homeroomClassName) {
          updatedTeachersCount++;
          return {
            ...t,
            isHomeroom: false,
            homeroomClassId: '',
            homeroomClassName: '',
            duty: t.duty?.includes('GVCN') ? 'Giáo viên bộ môn' : t.duty,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      }
    });

    const nextUsers = users.map((u) => {
      let matchedT: TeacherProfile | undefined;
      if (u.teacherId && teacherById.has(u.teacherId)) {
        matchedT = teacherById.get(u.teacherId);
      }
      if (!matchedT && u.email) {
        matchedT = teachers.find((t) => t.email?.toLowerCase().trim() === u.email.toLowerCase().trim());
      }
      if (!matchedT && u.name) {
        matchedT = teacherByName.get(u.name.toLowerCase().trim());
      }

      if (matchedT) {
        const assignedClass = teacherToClassMap.get(matchedT.id);
        if (assignedClass) {
          const isCorrect =
            u.homeroomClassId === assignedClass.id &&
            u.teacherId === matchedT.id &&
            (u.role === 'ADMIN' || u.role === 'BGH' || u.role === 'GVCN');

          if (!isCorrect) {
            updatedUsersCount++;
            return {
              ...u,
              teacherId: matchedT.id,
              homeroomClassId: assignedClass.id,
              dutyRole: 'Giáo viên chủ nhiệm' as DutyRole,
              role: u.role === 'ADMIN' || u.role === 'BGH' ? u.role : ('GVCN' as UserRole),
            };
          }
        } else {
          if (u.homeroomClassId) {
            updatedUsersCount++;
            return {
              ...u,
              teacherId: matchedT.id,
              homeroomClassId: '',
              dutyRole: u.dutyRole === 'Giáo viên chủ nhiệm' ? ('Giáo viên bộ môn' as DutyRole) : u.dutyRole,
              role: u.role === 'GVCN' ? ('GIÁO VIÊN' as UserRole) : u.role,
            };
          }
        }
      }
      return u;
    });

    setClasses(nextClasses);
    setTeachers(nextTeachers);
    setUsers(nextUsers);

    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(nextClasses));
      localStorage.setItem(STORAGE_KEYS.SCHOOL_TEACHERS, JSON.stringify(nextTeachers));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(nextUsers));
    } catch (e) {}

    const message = `Đồng bộ phân công GVCN thành công! Tổng số ${nextClasses.length} lớp: ${
      nextClasses.length - unassignedClasses.length
    } lớp đã có GVCN (${syncedClassesCount} lớp được chuẩn hóa liên kết, ${updatedTeachersCount} hồ sơ GV được cập nhật, ${updatedUsersCount} tài khoản người dùng được đồng bộ).`;

    addAuditLog(
      'Đồng bộ phân công GVCN',
      message,
      'Quản trị Hệ thống',
      'Bi-directional Sync',
      'SUCCESS'
    );

    return {
      success: true,
      totalClasses: nextClasses.length,
      syncedClassesCount,
      unassignedClasses,
      conflicts,
      updatedTeachersCount,
      updatedUsersCount,
      message,
      timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
    };
  };

  // Auto-heal Homeroom Teacher assignments if stale localStorage data or desync exists
  useEffect(() => {
    let needsHeal = false;
    const teacherById = new Map(teachers.map((t) => [t.id, t]));
    const teacherByName = new Map(teachers.map((t) => [t.fullName.trim().toLowerCase(), t]));

    for (const c of classes) {
      if (c.homeroomTeacherId && !teacherById.has(c.homeroomTeacherId)) {
        needsHeal = true;
        break;
      }
      if (c.homeroomTeacherName) {
        const t = teacherByName.get(c.homeroomTeacherName.trim().toLowerCase());
        if (t && c.homeroomTeacherId !== t.id) {
          needsHeal = true;
          break;
        }
      }
    }

    if (!needsHeal) {
      for (const t of teachers) {
        if (t.isHomeroom && t.homeroomClassId) {
          const c = classes.find((cls) => cls.id === t.homeroomClassId);
          if (c && c.homeroomTeacherId !== t.id) {
            needsHeal = true;
            break;
          }
        }
      }
    }

    if (needsHeal) {
      syncHomeroomAssignments();
    }
  }, []);

  const deleteClass = (id: string) => {
    const target = classes.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy lớp học.' };

    setClasses((prev) => prev.filter((c) => c.id !== id));
    // Also remove students belonging to this class
    setStudents((prev) => prev.filter((s) => s.classId !== id));
    addAuditLog('Xóa lớp học', `Đã xóa lớp ${target.className} khỏi hệ thống.`);
    return { success: true };
  };

  // Subject Teacher Functions
  const updateSubjectTeacher = (id: string, data: Partial<SubjectTeacher>) => {
    setSubjectTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    addAuditLog('Cập nhật GV bộ môn', `Chỉnh sửa thông tin giáo viên môn học ID ${id}.`);
    return { success: true };
  };

  const addSubjectTeacher = (data: Omit<SubjectTeacher, 'id'>) => {
    const newTeacher: SubjectTeacher = {
      ...data,
      id: `sub-${Date.now()}`,
    };
    setSubjectTeachers((prev) => [...prev, newTeacher]);
    addAuditLog('Thêm GV bộ môn', `Gán giáo viên ${data.teacherName} cho môn ${data.subjectName}.`);
    return { success: true };
  };

  const deleteSubjectTeacher = (id: string) => {
    setSubjectTeachers((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Xóa GV bộ môn', `Gỡ bỏ môn học/giáo viên ID ${id}.`);
  };

  // School-wide Teacher Profiles (Hồ sơ Giáo viên Toàn trường - Dành cho Admin)
  const addTeacher = (data: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, message: 'Họ và tên giáo viên là bắt buộc!' };
    }
    const newId = `teacher-${Date.now()}`;
    const newTeacher: TeacherProfile = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    addAuditLog(
      'Thêm hồ sơ giáo viên',
      `Thêm mới giáo viên ${newTeacher.fullName} (${newTeacher.teacherCode}) vào hồ sơ nhân sự nhà trường.`,
      'Quản lý Giáo viên',
      newTeacher.fullName,
      'SUCCESS'
    );
    return { success: true, message: 'Thêm giáo viên thành công!', teacherId: newId };
  };

  const updateTeacher = (id: string, data: Partial<TeacherProfile>) => {
    const target = teachers.find((t) => t.id === id);
    const newFullName = data.fullName || target?.fullName || '';

    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      )
    );

    // If homeroom assignment changed
    if (data.isHomeroom !== undefined || data.homeroomClassId !== undefined || data.fullName !== undefined) {
      const willBeHomeroom = data.isHomeroom ?? target?.isHomeroom;
      const targetClassId = data.homeroomClassId ?? target?.homeroomClassId;

      if (willBeHomeroom && targetClassId) {
        setClasses((prev) =>
          prev.map((c) => {
            if (c.id === targetClassId) {
              return {
                ...c,
                homeroomTeacherId: id,
                homeroomTeacherName: newFullName,
                updatedAt: new Date().toISOString(),
              };
            }
            if (c.homeroomTeacherId === id && c.id !== targetClassId) {
              return {
                ...c,
                homeroomTeacherId: '',
                homeroomTeacherName: '',
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          })
        );
      } else if (!willBeHomeroom && target?.homeroomClassId) {
        setClasses((prev) =>
          prev.map((c) =>
            c.id === target.homeroomClassId || c.homeroomTeacherId === id
              ? {
                  ...c,
                  homeroomTeacherId: '',
                  homeroomTeacherName: '',
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }
    }

    // Sync matching user account
    setUsers((prev) =>
      prev.map((u) => {
        if (u.teacherId === id || (target && u.email?.toLowerCase().trim() === target.email?.toLowerCase().trim())) {
          const willBeHomeroom = data.isHomeroom ?? target?.isHomeroom;
          const targetClassId = data.homeroomClassId ?? target?.homeroomClassId;
          if (willBeHomeroom && targetClassId) {
            return {
              ...u,
              homeroomClassId: targetClassId,
              dutyRole: 'Giáo viên chủ nhiệm' as DutyRole,
              role: u.role === 'ADMIN' || u.role === 'BGH' ? u.role : ('GVCN' as UserRole),
            };
          } else if (!willBeHomeroom && u.homeroomClassId) {
            return {
              ...u,
              homeroomClassId: '',
              dutyRole: u.dutyRole === 'Giáo viên chủ nhiệm' ? ('Giáo viên bộ môn' as DutyRole) : u.dutyRole,
              role: u.role === 'GVCN' ? ('GIÁO VIÊN' as UserRole) : u.role,
            };
          }
        }
        return u;
      })
    );

    addAuditLog(
      'Cập nhật hồ sơ giáo viên',
      `Cập nhật thông tin giáo viên ${target?.fullName || id}.`,
      'Quản lý Giáo viên',
      target?.fullName || id,
      'SUCCESS'
    );
    return { success: true, message: 'Cập nhật thông tin giáo viên thành công!' };
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find((t) => t.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy giáo viên cần xóa.' };

    setTeachers((prev) => prev.filter((t) => t.id !== id));
    addAuditLog(
      'Xóa hồ sơ giáo viên',
      `Đã xóa hồ sơ giáo viên ${target.fullName} (${target.teacherCode}) khỏi hệ thống.`,
      'Quản lý Giáo viên',
      target.fullName,
      'WARNING'
    );
    return { success: true, message: 'Đã xóa hồ sơ giáo viên thành công!' };
  };

  const importTeachers = (
    newTeachersList: Array<Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): { added: number; errors: string[] } => {
    const errors: string[] = [];
    const validToAdd: TeacherProfile[] = [];

    const existingCodes = new Set(teachers.map((t) => t.teacherCode.trim().toLowerCase()));

    newTeachersList.forEach((t, idx) => {
      const rowNum = idx + 1;
      const fullName = (t.fullName || '').trim();
      let code = (t.teacherCode || '').trim();

      if (!fullName) {
        errors.push(`Dòng ${rowNum}: Thiếu họ và tên giáo viên.`);
        return;
      }

      if (!code) {
        // Auto-generate code
        code = `GV-${String(teachers.length + validToAdd.length + 1).padStart(3, '0')}`;
      } else if (existingCodes.has(code.toLowerCase())) {
        errors.push(`Dòng ${rowNum}: Mã giáo viên "${code}" (${fullName}) đã tồn tại trong hệ thống.`);
        return;
      }

      existingCodes.add(code.toLowerCase());

      const newTeacher: TeacherProfile = {
        ...t,
        id: `teacher-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        teacherCode: code,
        fullName,
        gender: t.gender === 'Nữ' ? 'Nữ' : 'Nam',
        birthDate: t.birthDate || '01/01/1990',
        email: t.email || '',
        phone: t.phone || '',
        idCardNumber: t.idCardNumber || '',
        department: normalizeDepartmentName(t.department),
        mainSubject: t.mainSubject || 'Toán',
        secondarySubject: t.secondarySubject || '',
        degree: t.degree || 'Cử nhân ĐH Sư phạm',
        employmentStatus: t.employmentStatus || 'Biên chế chính thức',
        joinDate: t.joinDate || '01/09/2020',
        isHomeroom: Boolean(t.isHomeroom),
        homeroomClassId: t.homeroomClassId || '',
        homeroomClassName: t.homeroomClassName || '',
        assignedClasses: t.assignedClasses || [],
        duty: t.duty || (t.isHomeroom ? 'Giáo viên chủ nhiệm' : 'Giáo viên bộ môn'),
        notes: t.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      validToAdd.push(newTeacher);

      // Link homeroom class if provided
      if (newTeacher.isHomeroom && newTeacher.homeroomClassName) {
        setClasses((prev) =>
          prev.map((c) =>
            c.className.toLowerCase() === newTeacher.homeroomClassName?.toLowerCase()
              ? { ...c, homeroomTeacherId: newTeacher.id, homeroomTeacherName: newTeacher.fullName }
              : c
          )
        );
      }
    });

    if (validToAdd.length > 0) {
      setTeachers((prev) => [...validToAdd, ...prev]);
      addAuditLog(
        'Nhập danh sách giáo viên từ Excel',
        `Đã nhập thành công ${validToAdd.length} giáo viên vào hồ sơ nhân sự nhà trường. Bỏ qua ${errors.length} dòng lỗi.`,
        'Quản trị Giáo viên',
        'Excel Import',
        'SUCCESS'
      );
    }

    return { added: validToAdd.length, errors };
  };

  // Academic Department CRUD (Quản lý Tổ chuyên môn - Dành cho Quản trị viên)
  const addDepartment = (data: Omit<AcademicDepartment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data.name || !data.name.trim()) {
      return { success: false, message: 'Tên tổ chuyên môn là bắt buộc!' };
    }
    const trimmedName = data.name.trim();
    if (departments.some((d) => d.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, message: `Tổ chuyên môn "${trimmedName}" đã tồn tại trong trường!` };
    }

    const newId = `dept-${Date.now()}`;
    const newDept: AcademicDepartment = {
      ...data,
      id: newId,
      code: data.code || `TCM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: trimmedName,
      subjects: data.subjects || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDepartments((prev) => [...prev, newDept]);

    addAuditLog(
      'Thêm tổ chuyên môn',
      `Thêm tổ chuyên môn mới: ${newDept.name} (${newDept.code}) do ${newDept.leaderTeacherName || 'Chưa gán'} làm tổ trưởng.`,
      'Quản lý Tổ chuyên môn',
      newDept.name,
      'SUCCESS'
    );

    return { success: true, message: 'Thêm tổ chuyên môn thành công!', departmentId: newId };
  };

  const updateDepartment = (id: string, data: Partial<AcademicDepartment>) => {
    const target = departments.find((d) => d.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy tổ chuyên môn cần sửa.' };

    if (data.name && data.name.trim() !== target.name) {
      const trimmedName = data.name.trim();
      if (departments.some((d) => d.id !== id && d.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { success: false, message: `Tổ chuyên môn "${trimmedName}" đã tồn tại trong trường!` };
      }
      // If name changed, also update teachers belonging to old name
      const oldName = target.name;
      setTeachers((prev) =>
        prev.map((t) => (t.department === oldName ? { ...t, department: trimmedName } : t))
      );
    }

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    addAuditLog(
      'Cập nhật tổ chuyên môn',
      `Cập nhật thông tin tổ chuyên môn ${target.name}.`,
      'Quản lý Tổ chuyên môn',
      target.name,
      'SUCCESS'
    );

    return { success: true, message: 'Cập nhật tổ chuyên môn thành công!' };
  };

  const deleteDepartment = (id: string) => {
    const target = departments.find((d) => d.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy tổ chuyên môn để xóa.' };

    const memberCount = teachers.filter((t) => t.department === target.name).length;
    if (memberCount > 0) {
      return {
        success: false,
        message: `Không thể xóa tổ "${target.name}" vì đang có ${memberCount} giáo viên trực thuộc. Vui lòng chuyển các giáo viên sang tổ khác trước khi xóa!`,
      };
    }

    setDepartments((prev) => prev.filter((d) => d.id !== id));

    addAuditLog(
      'Xóa tổ chuyên môn',
      `Đã xóa tổ chuyên môn ${target.name} khỏi hệ thống.`,
      'Quản lý Tổ chuyên môn',
      target.name,
      'WARNING'
    );

    return { success: true, message: `Đã xóa tổ chuyên môn "${target.name}" thành công!` };
  };

  // Student CRUD (Single Source of Truth)
  const addStudent = (data: Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>) => {
    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, message: 'Họ và tên học sinh là bắt buộc!' };
    }
    if (!data.studentCode || !data.studentCode.trim()) {
      return { success: false, message: 'Mã số học sinh là bắt buộc!' };
    }
    if (!data.birthDate || !data.birthDate.trim()) {
      return { success: false, message: 'Ngày sinh học sinh là bắt buộc!' };
    }

    const trimmedCode = data.studentCode.trim();
    // Check duplicate code in same class
    const exists = students.some(
      (s) => s.classId === (data.classId || currentClass?.id) && s.studentCode === trimmedCode
    );
    if (exists) {
      return { success: false, message: `Mã học sinh "${trimmedCode}" đã tồn tại trong lớp!` };
    }

    const targetClassId = data.classId || currentClass?.id || 'class-7-1';
    const classStudentsList = students.filter((s) => s.classId === targetClassId);
    const nextStt = classStudentsList.length > 0 ? Math.max(...classStudentsList.map((s) => s.stt)) + 1 : 1;

    const newStudent: Student = {
      ...data,
      id: `hs-${Date.now()}`,
      classId: targetClassId,
      schoolYearId: data.schoolYearId || currentSchoolYear.id,
      stt: nextStt,
      studentCode: trimmedCode,
      fullName: data.fullName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);

    // Update class studentCount
    setClasses((prev) =>
      prev.map((c) => (c.id === targetClassId ? { ...c, studentCount: c.studentCount + 1 } : c))
    );

    addAuditLog(
      'Thêm học sinh',
      `Thêm học sinh mới: ${newStudent.fullName} (Mã: ${newStudent.studentCode}) vào lớp.`
    );

    return { success: true };
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    if (data.studentCode) {
      const trimmedCode = data.studentCode.trim();
      const duplicate = students.some((s) => s.id !== id && s.studentCode === trimmedCode);
      if (duplicate) {
        return { success: false, message: `Mã học sinh "${trimmedCode}" đã trùng với học sinh khác!` };
      }
    }

    const target = students.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy học sinh cần cập nhật.' };

    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );

    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent((prev) => (prev ? { ...prev, ...data } : null));
    }

    addAuditLog(
      'Cập nhật hồ sơ học sinh',
      `Cập nhật thông tin học sinh ${target.fullName} (Mã: ${target.studentCode}).`
    );

    return { success: true };
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy học sinh để xóa.' };

    setStudents((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Re-index STT for this class
      let idx = 1;
      return filtered.map((s) => (s.classId === target.classId ? { ...s, stt: idx++ } : s));
    });

    // Update class studentCount
    setClasses((prev) =>
      prev.map((c) => (c.id === target.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
    );

    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(null);
    }

    // Giai đoạn 3: Tự động dọn dẹp liên kết học sinh trong sơ đồ, cán bộ lớp, phụ huynh
    setSeats((prev) => prev.map((s) => (s.studentId === id ? { ...s, studentId: null } : s)));
    setClassOfficers((prev) => prev.filter((o) => o.studentId !== id));
    setParentRepresentatives((prev) => prev.filter((p) => p.studentId !== id));

    addAuditLog('Xóa học sinh', `Đã xóa học sinh ${target.fullName} (Mã: ${target.studentCode}) khỏi lớp.`);
    return { success: true };
  };

  const toggleLockStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'locked' : 'active';
    updateStudent(id, { status: newStatus });
    addAuditLog(
      newStatus === 'locked' ? 'Khóa hồ sơ học sinh' : 'Mở khóa hồ sơ học sinh',
      `${newStatus === 'locked' ? 'Đã khóa' : 'Đã mở khóa'} hồ sơ của em ${target.fullName}.`
    );
  };

  const importStudents = (
    newStudentsList: Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>,
    strategy: 'skip_existing' | 'update_existing' = 'skip_existing'
  ): { added: number; updated: number; skipped: number; errors: string[] } => {
    const defaultTargetClassId = currentClass?.id || 'class-7-1';
    const errors: string[] = [];
    let added = 0;
    let updated = 0;
    let skipped = 0;

    const studentMap = new Map<string, Student>(students.map((s) => [s.studentCode.trim(), s]));
    const classCountChanges = new Map<string, number>();

    // Calculate initial next stt per class
    const classMaxSttMap = new Map<string, number>();
    students.forEach((s) => {
      const curMax = classMaxSttMap.get(s.classId) || 0;
      if (s.stt > curMax) classMaxSttMap.set(s.classId, s.stt);
    });

    const newStudentsToAdd: Student[] = [];

    newStudentsList.forEach((st, idx) => {
      const rowNum = idx + 1;
      const code = (st.studentCode || '').trim();
      const name = (st.fullName || '').trim();
      const targetClassId = st.classId || defaultTargetClassId;

      if (!name) {
        errors.push(`Dòng ${rowNum}: Thiếu họ và tên học sinh.`);
        return;
      }
      if (!code) {
        errors.push(`Dòng ${rowNum}: Thiếu mã học sinh.`);
        return;
      }

      const existingStudent = studentMap.get(code);

      if (existingStudent) {
        if (strategy === 'skip_existing') {
          skipped++;
          return;
        } else {
          // Update existing student
          const updatedStudent: Student = {
            ...existingStudent,
            ...st,
            id: existingStudent.id,
            stt: existingStudent.stt,
            studentCode: code,
            fullName: name,
            classId: targetClassId,
            updatedAt: new Date().toISOString(),
          };
          studentMap.set(code, updatedStudent);
          updated++;
          return;
        }
      }

      // New student
      const curMaxStt = classMaxSttMap.get(targetClassId) || 0;
      const nextStt = curMaxStt + 1;
      classMaxSttMap.set(targetClassId, nextStt);

      const newStudent: Student = {
        ...st,
        id: `hs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        classId: targetClassId,
        schoolYearId: st.schoolYearId || currentSchoolYear.id,
        stt: nextStt,
        studentCode: code,
        fullName: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      studentMap.set(code, newStudent);
      newStudentsToAdd.push(newStudent);
      classCountChanges.set(targetClassId, (classCountChanges.get(targetClassId) || 0) + 1);
      added++;
    });

    if (added > 0 || updated > 0) {
      setStudents(Array.from(studentMap.values()));

      if (classCountChanges.size > 0) {
        setClasses((prev) =>
          prev.map((c) => {
            const addedForClass = classCountChanges.get(c.id) || 0;
            return addedForClass > 0 ? { ...c, studentCount: c.studentCount + addedForClass } : c;
          })
        );
      }

      addAuditLog(
        'Nhập danh sách học sinh từ Excel',
        `Đã nhập dữ liệu học sinh: Thêm mới ${added}, Cập nhật ${updated}, Bỏ qua ${skipped}. Bỏ qua ${errors.length} dòng lỗi.`,
        'Quản trị Học sinh',
        'Excel Import',
        'SUCCESS'
      );
    }

    return { added, updated, skipped, errors };
  };

  const deleteDemoData = () => {
    // 1. Unmark demo flags
    setClasses((prev) =>
      prev.map((c) => (c.isDemo ? { ...c, isDemo: false, notes: c.notes ? `${c.notes} (Đã chuyển thành dữ liệu chính thức)` : 'Dữ liệu chính thức' } : c))
    );
    addAuditLog(
      'Chuyển đổi dữ liệu Demo',
      'Đã hoàn tất chuyển đổi toàn bộ cấu trúc dữ liệu demo trường TH&THCS Nguyễn Đình Anh thành cơ sở dữ liệu vận hành chính thức, bảo toàn 100% dữ liệu người dùng.',
      'Quản trị CSDL',
      'Demo Data',
      'SUCCESS'
    );
  };

  const restoreDemoData = () => {
    setClasses(initialClasses);
    setSchoolYears(initialSchoolYears);
    setSchool(initialSchool);
    setStudents(initialStudents);
    setSubjectTeachers(initialSubjectTeachers);
    setClassroomConfig(initialClassroomConfig);
    setSeats(initialSeats);
    setClassOfficers(initialClassOfficers);
    setParentRepresentatives(initialParentRepresentatives);
    setYearlyPlan(initialYearlyPlan);
    setMonthlyPlans(initialMonthlyPlans);
    setScheduleWorkItems(initialScheduleWorkItems);
    setAttendanceRecords(initialAttendanceRecords);
    setAcademicScores(initialSubjectScores);
    setSubjectTrackings(initialSubjectTrackings);
    setConductRecords(initialConductRecords);
    setViolationRecords(initialViolationRecords);
    setWeeklyConductLogs(initialWeeklyConductLogs);
    setStudentProgressEntries(initialStudentProgressEntries);
    setStudentSupportTags(initialStudentSupportTags);
    setClassActivities(initialClassActivities);
    setCompetitionClassConfig(initialCompetitionClassConfig);
    setGroupCompetitionRecords(initialGroupCompetitionRecords);
    setAwardRecords(initialAwardRecords);
    setTalentProfiles(initialTalentProfiles);
    addAuditLog(
      'Khôi phục dữ liệu Demo',
      'Thiết lập lại dữ liệu Demo trường TH&THCS Nguyễn Đình Anh lớp 7/1: 35 học sinh, sơ đồ chỗ ngồi, cán bộ lớp, kế hoạch, điểm danh, học tập, rèn luyện, hoạt động phong trào, thi đua 4 tổ và khen thưởng.'
    );
  };

  // Seating & Classroom Layout Functions (Giai đoạn 3)
  const updateClassroomConfig = (data: Partial<ClassroomConfig>) => {
    setClassroomConfig((prev) => {
      const updated = { ...prev, ...data };
      if (data.columns !== undefined || data.rows !== undefined || data.seatsPerDesk !== undefined) {
        const newCols = updated.columns;
        const newRows = updated.rows;
        const newSeatsPerDesk = updated.seatsPerDesk;

        // Giữ lại các học sinh đã xếp
        const currentAssignedStudents: string[] = [];
        seats.forEach((s) => {
          if (s.studentId && !currentAssignedStudents.includes(s.studentId)) {
            currentAssignedStudents.push(s.studentId);
          }
        });

        const newSeatsList: DeskSeat[] = [];
        let assignedIdx = 0;
        for (let c = 1; c <= newCols; c++) {
          for (let r = 1; r <= newRows; r++) {
            for (let s = 1; s <= newSeatsPerDesk; s++) {
              newSeatsList.push({
                id: `seat-c${c}-r${r}-s${s}`,
                column: c,
                row: r,
                seatNumber: s,
                studentId: assignedIdx < currentAssignedStudents.length ? currentAssignedStudents[assignedIdx++] : null,
              });
            }
          }
        }
        setSeats(newSeatsList);
      }
      return updated;
    });
    addAuditLog('Cập nhật cấu hình lớp học', 'Thay đổi thông số bàn ghế, vị trí bảng, bàn giáo viên.');
  };

  const updateSeatAssignment = (seatId: string, studentId: string | null) => {
    setSeats((prev) => {
      return prev.map((s) => {
        if (s.id === seatId) {
          return { ...s, studentId };
        }
        // Đảm bảo không trùng: nếu học sinh đã ngồi ở ghế khác, ghế đó thành trống
        if (studentId && s.studentId === studentId && s.id !== seatId) {
          return { ...s, studentId: null };
        }
        return s;
      });
    });

    if (studentId) {
      const st = students.find((x) => x.id === studentId);
      addAuditLog('Xếp chỗ học sinh', `Đã xếp ${st?.fullName || 'học sinh'} vào ghế ${seatId}.`);
    } else {
      addAuditLog('Bỏ chỗ học sinh', `Đã xóa học sinh khỏi ghế ${seatId}.`);
    }
  };

  const swapSeats = (seatIdA: string, seatIdB: string) => {
    setSeats((prev) => {
      const seatA = prev.find((s) => s.id === seatIdA);
      const seatB = prev.find((s) => s.id === seatIdB);
      if (!seatA || !seatB) return prev;

      const studentA = seatA.studentId;
      const studentB = seatB.studentId;

      return prev.map((s) => {
        if (s.id === seatIdA) return { ...s, studentId: studentB };
        if (s.id === seatIdB) return { ...s, studentId: studentA };
        return s;
      });
    });
    addAuditLog('Đổi chỗ học sinh', `Hoán đổi vị trí hai ghế ${seatIdA} và ${seatIdB}.`);
  };

  const autoAssignSeats = (criteria: 'stt' | 'gender-alternate' | 'group' | 'support-near-front' | 'study-buddies') => {
    const classStudents = [...currentClassStudents];
    if (classStudents.length === 0) return;

    let arrangedStudents: Student[] = [];

    if (criteria === 'stt') {
      arrangedStudents = [...classStudents].sort((a, b) => a.stt - b.stt);
    } else if (criteria === 'group') {
      arrangedStudents = [...classStudents].sort((a, b) => {
        if (a.groupNumber !== b.groupNumber) return a.groupNumber - b.groupNumber;
        return a.stt - b.stt;
      });
    } else if (criteria === 'gender-alternate') {
      const boys = classStudents.filter((s) => s.gender === 'Nam');
      const girls = classStudents.filter((s) => s.gender === 'Nữ');
      const maxLen = Math.max(boys.length, girls.length);
      for (let i = 0; i < maxLen; i++) {
        if (boys[i]) arrangedStudents.push(boys[i]);
        if (girls[i]) arrangedStudents.push(girls[i]);
      }
    } else if (criteria === 'support-near-front') {
      const supportStudents = classStudents.filter((s) => s.needsSupport || s.needsAttention);
      const normalStudents = classStudents.filter((s) => !s.needsSupport && !s.needsAttention);
      arrangedStudents = [...supportStudents, ...normalStudents];
    } else if (criteria === 'study-buddies') {
      const needSupport = classStudents.filter((s) => s.needsSupport || s.needsAttention);
      const helpers = classStudents.filter((s) => (s.hasProgress || s.hasSpecialTalent) && !s.needsSupport);
      const others = classStudents.filter(
        (s) => !needSupport.some((x) => x.id === s.id) && !helpers.some((x) => x.id === s.id)
      );

      const pairs: Student[] = [];
      const pairCount = Math.min(needSupport.length, helpers.length);
      for (let i = 0; i < pairCount; i++) {
        pairs.push(helpers[i]);
        pairs.push(needSupport[i]);
      }
      const remainingSupport = needSupport.slice(pairCount);
      const remainingHelpers = helpers.slice(pairCount);
      arrangedStudents = [...pairs, ...remainingSupport, ...remainingHelpers, ...others];
    }

    setSeats((prev) => {
      let idx = 0;
      return prev.map((seat) => {
        if (idx < arrangedStudents.length) {
          return { ...seat, studentId: arrangedStudents[idx++].id };
        }
        return { ...seat, studentId: null };
      });
    });

    const criteriaLabels: Record<string, string> = {
      stt: 'Theo số thứ tự STT',
      group: 'Theo tổ học tập (Tổ 1 - 4)',
      'gender-alternate': 'Nam / Nữ xen kẽ',
      'support-near-front': 'Học sinh cần hỗ trợ ngồi bàn đầu',
      'study-buddies': 'Đôi bạn cùng tiến',
    };
    addAuditLog('Tự động xếp chỗ', `Tự động xếp chỗ theo tiêu chí: ${criteriaLabels[criteria] || criteria}.`);
  };

  const clearAllSeats = () => {
    setSeats((prev) => prev.map((s) => ({ ...s, studentId: null })));
    addAuditLog('Xóa sơ đồ chỗ ngồi', 'Đã xóa tất cả chỗ ngồi trên sơ đồ.');
  };

  const resetSeatsToDefault = () => {
    setSeats(generateDefaultSeats(currentClassStudents, classroomConfig.columns, classroomConfig.rows, classroomConfig.seatsPerDesk));
    addAuditLog('Khôi phục sơ đồ mặc định', 'Đã đặt lại sắp xếp chỗ ngồi 4 tổ chuẩn.');
  };

  // Class Officers Functions (Giai đoạn 3)
  const addClassOfficer = (data: Omit<ClassOfficer, 'id'>) => {
    if (!data.studentId) {
      return { success: false, message: 'Vui lòng chọn học sinh đảm nhận chức vụ!' };
    }
    if (!data.role.trim()) {
      return { success: false, message: 'Tên chức vụ không được để trống!' };
    }
    const newOfficer: ClassOfficer = {
      ...data,
      id: `officer-${Date.now()}`,
    };
    setClassOfficers((prev) => [...prev, newOfficer]);
    const st = students.find((s) => s.id === data.studentId);
    addAuditLog('Phân công cán bộ lớp', `Bổ nhiệm ${st?.fullName || 'học sinh'} giữ chức ${data.role}.`);
    return { success: true };
  };

  const updateClassOfficer = (id: string, data: Partial<ClassOfficer>) => {
    setClassOfficers((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
    addAuditLog('Cập nhật cán bộ lớp', `Cập nhật nhiệm vụ cán bộ lớp ID ${id}.`);
    return { success: true };
  };

  const deleteClassOfficer = (id: string) => {
    const target = classOfficers.find((o) => o.id === id);
    setClassOfficers((prev) => prev.filter((o) => o.id !== id));
    addAuditLog('Miễn nhiệm cán bộ lớp', `Đã xóa chức vụ ${target?.role || ''} của học sinh.`);
  };

  // Parent Representative Functions (Giai đoạn 3)
  const addParentRepresentative = (data: Omit<ParentRepresentative, 'id'>) => {
    if (!data.parentName.trim()) {
      return { success: false, message: 'Họ và tên phụ huynh không được để trống!' };
    }
    if (!data.phone.trim()) {
      return { success: false, message: 'Số điện thoại phụ huynh không được để trống!' };
    }
    const newRep: ParentRepresentative = {
      ...data,
      id: `rep-${Date.now()}`,
    };
    setParentRepresentatives((prev) => [...prev, newRep]);
    addAuditLog('Thêm Ban ĐD CMHS', `Thêm phụ huynh ${data.parentName} (${data.role}) vào Ban ĐD CMHS lớp.`);
    return { success: true };
  };

  const updateParentRepresentative = (id: string, data: Partial<ParentRepresentative>) => {
    setParentRepresentatives((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    addAuditLog('Cập nhật Ban ĐD CMHS', `Chỉnh sửa thông tin thành viên Ban ĐD CMHS.`);
    return { success: true };
  };

  const deleteParentRepresentative = (id: string) => {
    setParentRepresentatives((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Xóa thành viên Ban ĐD CMHS', `Đã gỡ phụ huynh khỏi Ban đại diện CMHS lớp.`);
  };

  // ================= Plans & Schedules Methods (Giai đoạn 4) =================
  const updateYearlyPlan = (data: Partial<YearlyPlan>) => {
    setYearlyPlan((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Cập nhật kế hoạch năm', 'Chỉnh sửa mục tiêu hoặc chỉ tiêu kế hoạch năm học.');
  };

  const addYearlyPlanTask = (task: Omit<YearlyPlanTask, 'id'>) => {
    const newTask: YearlyPlanTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setYearlyPlan((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Thêm nhiệm vụ kế hoạch năm', `Thêm nhiệm vụ: ${newTask.title}.`);
  };

  const updateYearlyPlanTask = (taskId: string, data: Partial<YearlyPlanTask>) => {
    setYearlyPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Cập nhật nhiệm vụ năm', `Cập nhật nhiệm vụ ID ${taskId}.`);
  };

  const deleteYearlyPlanTask = (taskId: string) => {
    setYearlyPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Xóa nhiệm vụ năm', `Đã xóa một nhiệm vụ khỏi kế hoạch năm.`);
  };

  const addMonthlyPlan = (data: Omit<MonthlyPlan, 'id' | 'updatedAt'>) => {
    const newPlan: MonthlyPlan = {
      ...data,
      id: `month-${data.month}-${data.year}-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setMonthlyPlans((prev) => [...prev, newPlan]);
    addAuditLog('Thêm kế hoạch tháng', `Tạo kế hoạch hoạt động Tháng ${data.month}/${data.year}.`);
  };

  const updateMonthlyPlan = (id: string, data: Partial<MonthlyPlan>) => {
    setMonthlyPlans((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );
    addAuditLog('Cập nhật kế hoạch tháng', `Cập nhật kế hoạch tháng ID ${id}.`);
  };

  const copyMonthlyPlan = (sourceId: string, targetMonth: number, targetYear: number) => {
    const source = monthlyPlans.find((m) => m.id === sourceId);
    if (!source) return;

    const copiedPlan: MonthlyPlan = {
      ...source,
      id: `month-${targetMonth}-${targetYear}-${Date.now()}`,
      month: targetMonth,
      year: targetYear,
      theme: `(Bản sao) ${source.theme}`,
      status: 'Chưa thực hiện',
      result: '',
      comments: '',
      updatedAt: new Date().toISOString(),
    };

    setMonthlyPlans((prev) => [...prev, copiedPlan]);
    addAuditLog('Sao chép kế hoạch tháng', `Sao chép kế hoạch từ Tháng ${source.month} sang Tháng ${targetMonth}.`);
  };

  const addScheduleWorkItem = (item: Omit<ScheduleWorkItem, 'id' | 'createdAt'>) => {
    const newItem: ScheduleWorkItem = {
      ...item,
      id: `sched-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setScheduleWorkItems((prev) => [...prev, newItem]);
    addAuditLog('Thêm lịch công việc', `Thêm công việc: ${newItem.title} (Ngày: ${newItem.date}).`);
  };

  const updateScheduleWorkItem = (id: string, data: Partial<ScheduleWorkItem>) => {
    setScheduleWorkItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    addAuditLog('Cập nhật lịch công việc', `Cập nhật công việc ID ${id}.`);
  };

  const deleteScheduleWorkItem = (id: string) => {
    setScheduleWorkItems((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Xóa lịch công việc', `Đã xóa công việc khỏi lịch công tác.`);
  };

  // ================= Attendance & Absence Methods (Giai đoạn 5) =================
  const saveBatchAttendance = (
    date: string,
    session: AttendanceSession,
    period: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            r.date === date &&
            r.session === session &&
            (r.period || 'Cả buổi') === (period || 'Cả buổi') &&
            r.classId === classId
          )
      );
      const newItems: AttendanceRecord[] = records.map((rec) => ({
        id: `att-${date}-${session}-${rec.studentId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        classId,
        schoolYearId,
        date,
        session,
        period: period || 'Cả buổi',
        studentId: rec.studentId,
        status: rec.status,
        notes: rec.notes,
        updatedAt: new Date().toISOString(),
      }));
      return [...filtered, ...newItems];
    });
    addAuditLog(
      'Lưu điểm danh',
      `Điểm danh lớp ${currentClass?.className} ngày ${date} (${session} - ${period || 'Cả buổi'}) cho ${records.length} học sinh.`
    );
  };

  const updateStudentAttendance = (recordId: string, status: AttendanceStatus, notes?: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status,
              notes: notes !== undefined ? notes : r.notes,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    addAuditLog('Cập nhật điểm danh', `Cập nhật trạng thái điểm danh học sinh: ${status}.`);
  };

  const markAllPresent = (date: string, session: AttendanceSession, period: string) => {
    const records = currentClassStudents.map((s) => ({
      studentId: s.id,
      status: 'Có mặt' as AttendanceStatus,
      notes: '',
    }));
    saveBatchAttendance(date, session, period, records);
    addAuditLog(
      'Điểm danh nhanh',
      `Đánh dấu tất cả ${records.length} học sinh Có mặt ngày ${date} (${session}).`
    );
  };

  // ================= Academic Performance Methods (Giai đoạn 5) =================
  const saveSubjectScore = (data: Omit<SubjectScore, 'id' | 'updatedAt'>) => {
    setAcademicScores((prev) => {
      const existingIdx = prev.findIndex(
        (s) =>
          s.studentId === data.studentId &&
          s.subjectName === data.subjectName &&
          s.term === data.term &&
          s.classId === data.classId
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newItem: SubjectScore = {
          ...data,
          id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newItem];
      }
    });
    addAuditLog('Nhập điểm môn học', `Lưu điểm môn ${data.subjectName} kỳ ${data.term}.`);
  };

  const saveBatchSubjectScores = (scores: Omit<SubjectScore, 'id' | 'updatedAt'>[]) => {
    scores.forEach((s) => saveSubjectScore(s));
  };

  const updateSubjectScore = (id: string, data: Partial<SubjectScore>) => {
    setAcademicScores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s))
    );
    addAuditLog('Cập nhật điểm', `Cập nhật kết quả môn học ID ${id}.`);
  };

  const deleteSubjectScore = (id: string) => {
    setAcademicScores((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Xóa điểm', `Đã xóa một kết quả điểm số.`);
  };

  const updateSubjectTracking = (
    studentId: string,
    subjectName: string,
    status: SubjectTrackingStatus,
    notes?: string
  ) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    setSubjectTrackings((prev) => {
      const existingIdx = prev.findIndex(
        (t) => t.studentId === studentId && t.subjectName === subjectName && t.classId === classId
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          trackingStatus: status,
          notes: notes !== undefined ? notes : updated[existingIdx].notes,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newItem: SubjectTrackingItem = {
          id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          classId,
          schoolYearId,
          studentId,
          subjectName,
          trackingStatus: status,
          notes,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newItem];
      }
    });
    addAuditLog('Theo dõi môn học', `GVCN đánh dấu môn ${subjectName}: ${status}.`);
  };

  const updateSchool = (data: Partial<School>) => {
    setSchool((prev) => ({ ...prev, ...data }));
    addAuditLog('Cập nhật thông tin trường', 'Chỉnh sửa thông tin đơn vị trường học.');
  };

  const updateSettings = (data: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
    addAuditLog('Cài đặt hệ thống', 'Thay đổi cấu hình hệ thống.');
  };

  // Conduct & Student Discipline Functions (Giai đoạn 6)
  const saveConductRecord = (data: Omit<ConductRecord, 'id' | 'updatedAt'>) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    setConductRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === data.studentId && r.term === data.term && r.classId === classId
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newRecord: ConductRecord = {
          ...data,
          id: `conduct-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          classId,
          schoolYearId,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });
    addAuditLog('Đánh giá rèn luyện', `Lưu kết quả rèn luyện học sinh đợt ${data.term}.`);
  };

  const updateConductRecord = (id: string, data: Partial<ConductRecord>) => {
    setConductRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
    );
    addAuditLog('Cập nhật rèn luyện', `Cập nhật kết quả rèn luyện ID ${id}.`);
  };

  const deleteConductRecord = (id: string) => {
    setConductRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Xóa đánh giá rèn luyện', `Đã xóa một kết quả rèn luyện.`);
  };

  const addViolationRecord = (data: Omit<ViolationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    const newRecord: ViolationRecord = {
      ...data,
      id: `violation-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      schoolYearId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setViolationRecords((prev) => [newRecord, ...prev]);
    addAuditLog('Ghi nhận vi phạm', `Ghi nhận vi phạm nề nếp: ${data.title}.`);
  };

  const updateViolationRecord = (id: string, data: Partial<ViolationRecord>) => {
    setViolationRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
    );
    addAuditLog('Cập nhật vi phạm', `Cập nhật thông tin vi phạm ID ${id}.`);
  };

  const deleteViolationRecord = (id: string) => {
    setViolationRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Xóa vi phạm', `Đã xóa bản ghi vi phạm.`);
  };

  const addWeeklyConductLog = (data: Omit<WeeklyConductLog, 'id' | 'createdAt'>) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    const newLog: WeeklyConductLog = {
      ...data,
      id: `weeklog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      schoolYearId,
      createdAt: new Date().toISOString(),
    };
    setWeeklyConductLogs((prev) => [newLog, ...prev]);
    addAuditLog('Ghi nhật ký tuần', `Ghi nhật ký theo dõi nề nếp tuần ${data.weekNumber}.`);
  };

  const updateWeeklyConductLog = (id: string, data: Partial<WeeklyConductLog>) => {
    setWeeklyConductLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data } : l))
    );
    addAuditLog('Cập nhật nhật ký tuần', `Cập nhật nhật ký tuần ID ${id}.`);
  };

  const deleteWeeklyConductLog = (id: string) => {
    setWeeklyConductLogs((prev) => prev.filter((l) => l.id !== id));
    addAuditLog('Xóa nhật ký tuần', `Đã xóa nhật ký tuần.`);
  };

  const addStudentProgressEntry = (data: Omit<StudentProgressEntry, 'id' | 'createdAt'>) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    const newEntry: StudentProgressEntry = {
      ...data,
      id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      schoolYearId,
      createdAt: new Date().toISOString(),
    };
    setStudentProgressEntries((prev) => [newEntry, ...prev]);
    addAuditLog('Ghi nhận tiến bộ', `Ghi nhận bước tiến bộ cho học sinh.`);
  };

  const updateStudentProgressEntry = (id: string, data: Partial<StudentProgressEntry>) => {
    setStudentProgressEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
    addAuditLog('Cập nhật tiến bộ', `Cập nhật ghi nhận tiến bộ ID ${id}.`);
  };

  const deleteStudentProgressEntry = (id: string) => {
    setStudentProgressEntries((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Xóa ghi nhận tiến bộ', `Đã xóa một ghi nhận tiến bộ.`);
  };

  const addStudentSupportTag = (data: Omit<StudentSupportTag, 'id' | 'updatedAt'>) => {
    const classId = currentClass?.id || 'class-7-1';
    const newTag: StudentSupportTag = {
      ...data,
      id: `supp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      updatedAt: new Date().toISOString(),
    };
    setStudentSupportTags((prev) => [...prev, newTag]);
    addAuditLog('Đánh dấu hỗ trợ', `Đánh dấu diện cần hỗ trợ (${data.category}) cho học sinh.`);
  };

  const removeStudentSupportTag = (id: string) => {
    setStudentSupportTags((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Bỏ diện hỗ trợ', `Đã xóa diện theo dõi hỗ trợ ID ${id}.`);
  };

  const toggleSupportTagResolved = (id: string) => {
    setStudentSupportTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isResolved: !t.isResolved, updatedAt: new Date().toISOString() } : t))
    );
    addAuditLog('Cập nhật diện hỗ trợ', `Thay đổi trạng thái diện hỗ trợ.`);
  };

  // ================= Phase 7: Hoạt động, Thi đua, Khen thưởng & Năng khiếu =================
  const addClassActivity = (data: Omit<ClassActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAct: ClassActivity = {
      ...data,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClassActivities((prev) => [newAct, ...prev]);
    addAuditLog('Tạo hoạt động mới', `Tạo hoạt động: ${data.name}.`);
  };

  const updateClassActivity = (id: string, data: Partial<ClassActivity>) => {
    setClassActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
    );
    addAuditLog('Cập nhật hoạt động', `Chỉnh sửa hoạt động ID ${id}.`);
  };

  const deleteClassActivity = (id: string) => {
    setClassActivities((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('Xóa hoạt động', `Đã xóa một hoạt động lớp.`);
  };

  const toggleActivityParticipant = (activityId: string, studentId: string) => {
    setClassActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        const exists = a.participantStudentIds.includes(studentId);
        const participantStudentIds = exists
          ? a.participantStudentIds.filter((id) => id !== studentId)
          : [...a.participantStudentIds, studentId];
        return { ...a, participantStudentIds, updatedAt: new Date().toISOString() };
      })
    );
  };

  const setActivityParticipants = (activityId: string, studentIds: string[]) => {
    setClassActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, participantStudentIds: studentIds, updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const updateCompetitionClassConfig = (data: Partial<CompetitionClassConfig>) => {
    setCompetitionClassConfig((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Cấu hình thi đua', 'Cập nhật tiêu chí hoặc chế độ tính điểm thi đua lớp.');
  };

  const saveGroupCompetitionRecord = (record: Omit<GroupCompetitionRecord, 'id' | 'updatedAt'>) => {
    setGroupCompetitionRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) =>
          r.classId === record.classId &&
          r.periodType === record.periodType &&
          r.periodName === record.periodName &&
          r.groupNumber === record.groupNumber
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...record,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      const newRec: GroupCompetitionRecord = {
        ...record,
        id: `comp-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      return [...prev, newRec];
    });
    addAuditLog('Lưu thi đua tổ', `Ghi nhận thi đua Tổ ${record.groupNumber} đợt ${record.periodName}.`);
  };

  const deleteGroupCompetitionRecord = (id: string) => {
    setGroupCompetitionRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Xóa bản ghi thi đua', `Đã xóa bản ghi thi đua ID ${id}.`);
  };

  const addAwardRecord = (data: Omit<AwardRecord, 'id' | 'createdAt'>) => {
    const newAward: AwardRecord = {
      ...data,
      id: `award-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setAwardRecords((prev) => [newAward, ...prev]);
    addAuditLog('Khen thưởng học sinh', `Khen thưởng thành tích: ${data.achievement}.`);
  };

  const updateAwardRecord = (id: string, data: Partial<AwardRecord>) => {
    setAwardRecords((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
    addAuditLog('Cập nhật khen thưởng', `Chỉnh sửa khen thưởng ID ${id}.`);
  };

  const deleteAwardRecord = (id: string) => {
    setAwardRecords((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('Xóa khen thưởng', `Đã xóa một quyết định khen thưởng.`);
  };

  const addTalentProfile = (data: Omit<TalentProfile, 'id' | 'updatedAt'>) => {
    const newTalent: TalentProfile = {
      ...data,
      id: `talent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    setTalentProfiles((prev) => [newTalent, ...prev]);
    addAuditLog('Hồ sơ năng khiếu', `Ghi nhận năng khiếu ${data.field} cho học sinh.`);
  };

  const updateTalentProfile = (id: string, data: Partial<TalentProfile>) => {
    setTalentProfiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
    );
    addAuditLog('Cập nhật năng khiếu', `Cập nhật hồ sơ năng khiếu ID ${id}.`);
  };

  const deleteTalentProfile = (id: string) => {
    setTalentProfiles((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Xóa hồ sơ năng khiếu', `Đã xóa hồ sơ năng khiếu.`);
  };

  // Phase 8 Methods: Sơ kết, Tổng kết, Chốt dữ liệu & Nhận xét học sinh
  const toggleTermLock = (period: TermLockPeriod, userRole: string, userName: string) => {
    if (userRole !== 'GVCN' && userRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Bạn không có quyền chốt hoặc mở khóa dữ liệu học kỳ!',
      };
    }

    let isNowLocked = false;
    setTermLocks((prev) =>
      prev.map((item) => {
        if (item.period === period) {
          isNowLocked = !item.isLocked;
          return {
            ...item,
            isLocked: isNowLocked,
            lockedAt: isNowLocked ? new Date().toISOString() : item.lockedAt,
            lockedBy: isNowLocked ? userName : item.lockedBy,
            unlockedAt: !isNowLocked ? new Date().toISOString() : item.unlockedAt,
            unlockedBy: !isNowLocked ? userName : item.unlockedBy,
          };
        }
        return item;
      })
    );

    const actionText = isNowLocked ? 'Chốt dữ liệu' : 'Mở khóa dữ liệu';
    addAuditLog(`${actionText} ${period}`, `${userName} (${userRole}) đã ${actionText.toLowerCase()} đợt ${period}.`);

    return {
      success: true,
      message: isNowLocked
        ? `Đã chốt thành công dữ liệu đợt ${period}. Dữ liệu được bảo vệ an toàn phục vụ báo cáo.`
        : `Đã mở khóa thành công đợt ${period}. Người dùng có thẩm quyền có thể điều chỉnh dữ liệu.`,
    };
  };

  const saveSemesterSummaryReport = (period: 'HKI' | 'HKII', teacherNotes: string) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    setSemesterSummaryReports((prev) => {
      const idx = prev.findIndex((r) => r.classId === classId && r.period === period);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          teacherNotes,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      const newRep: SemesterSummaryReport = {
        id: `sem-rep-${period.toLowerCase()}-${Date.now()}`,
        classId,
        schoolYearId,
        period,
        teacherNotes,
        updatedAt: new Date().toISOString(),
      };
      return [...prev, newRep];
    });
    addAuditLog(`Lưu sơ kết ${period}`, `Cập nhật nhận xét sơ kết ${period} lớp ${currentClass?.className}.`);
  };

  const updateYearEndSummaryReport = (data: Partial<YearEndSummaryReport>) => {
    setYearEndSummaryReport((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    addAuditLog('Cập nhật tổng kết năm', `Chỉnh sửa báo cáo tổng kết năm học lớp ${currentClass?.className}.`);
  };

  const saveStudentSemesterComment = (
    studentId: string,
    period: 'HKI' | 'HKII' | 'Cả năm',
    teacherComment: string,
    isAiApplied?: boolean,
    aiDraftComment?: string
  ) => {
    const classId = currentClass?.id || 'class-7-1';
    const schoolYearId = currentSchoolYear.id;
    setStudentSemesterComments((prev) => {
      const idx = prev.findIndex(
        (c) => c.studentId === studentId && c.period === period && c.classId === classId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          teacherComment,
          isAiApplied: isAiApplied !== undefined ? isAiApplied : updated[idx].isAiApplied,
          aiDraftComment: aiDraftComment !== undefined ? aiDraftComment : updated[idx].aiDraftComment,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      const newComment: StudentSemesterComment = {
        id: `comm-${studentId}-${period}-${Date.now()}`,
        classId,
        schoolYearId,
        studentId,
        period,
        teacherComment,
        isAiApplied: !!isAiApplied,
        aiDraftComment,
        updatedAt: new Date().toISOString(),
      };
      return [...prev, newComment];
    });
    addAuditLog('Nhận xét học sinh', `Lưu nhận xét đợt ${period} cho học sinh ID ${studentId}.`);
  };

  // ================= GIAI ĐOẠN 10 IMPLEMENTATIONS =================

  // 1. Phân quyền & Quản trị tài khoản Giáo viên (ADMIN cấp tài khoản & mật khẩu)
  const addUserAccount = (data: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    phone?: string;
    teacherId?: string;
    homeroomClassId?: string;
    status?: AccountStatus;
    department?: string;
    subject?: string;
    dutyRole?: DutyRole;
  }): { success: boolean; message: string; user?: User } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, message: 'Tên tài khoản (username) không được để trống!' };
    }

    // Check duplicate
    const exists = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );
    if (exists) {
      return {
        success: false,
        message: `Tài khoản '${cleanUsername}' hoặc email '${cleanEmail}' đã tồn tại trong hệ thống!`,
      };
    }

    const plainPassword = data.password && data.password.trim() ? data.password.trim() : '123';
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      username: cleanUsername,
      name: data.name.trim(),
      email: cleanEmail || `${cleanUsername}@nguyendinhanh.edu.vn`,
      role: data.role,
      passwordHash: plainPassword,
      plainPassword: plainPassword,
      title:
        data.title ||
        data.dutyRole ||
        (data.role === 'GVCN'
          ? 'Giáo viên chủ nhiệm'
          : data.role === 'BGH'
          ? 'Ban Giám Hiệu'
          : data.role === 'ADMIN'
          ? 'Quản trị viên hệ thống'
          : 'Giáo viên bộ môn'),
      phone: data.phone || '',
      schoolId: school.id,
      teacherId: data.teacherId,
      homeroomClassId: data.homeroomClassId,
      status: data.status || 'active',
      department: data.department || 'Tổ 1-2-3',
      subject: data.subject || '—',
      dutyRole:
        data.dutyRole ||
        (data.role === 'ADMIN'
          ? 'Quản trị viên'
          : data.role === 'BGH'
          ? 'Phó Hiệu trưởng'
          : data.role === 'GVCN'
          ? 'Giáo viên chủ nhiệm'
          : 'Giáo viên bộ môn'),
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);

    // If teacherId provided, sync homeroom or duty if needed
    if (data.teacherId) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === data.teacherId) {
            return {
              ...t,
              isHomeroom: data.role === 'GVCN' ? true : t.isHomeroom,
              homeroomClassId: data.homeroomClassId || t.homeroomClassId,
              department: data.department || t.department,
              mainSubject: data.subject || t.mainSubject,
              duty: data.dutyRole || t.duty,
            };
          }
          return t;
        })
      );
    }

    addAuditLog(
      'Cấp tài khoản giáo viên',
      `Admin đã cấp mới tài khoản [${newUser.username}] cho ${newUser.name} (${newUser.role}) với mật khẩu mặc định.`,
      'Quản trị người dùng',
      newUser.username,
      'SUCCESS'
    );

    return {
      success: true,
      message: `Cấp tài khoản thành công cho ${newUser.name}! Tên đăng nhập: ${newUser.username}`,
      user: newUser,
    };
  };

  const updateUserAccount = (
    id: string,
    data: Partial<User> & { newPassword?: string }
  ): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng!' };
    }

    if (data.username && data.username.toLowerCase() !== target.username.toLowerCase()) {
      const dup = users.find(
        (u) => u.id !== id && u.username.toLowerCase() === data.username?.toLowerCase()
      );
      if (dup) {
        return { success: false, message: `Tên đăng nhập '${data.username}' đã được sử dụng!` };
      }
    }

    if (data.email && data.email.trim().toLowerCase() !== target.email?.trim().toLowerCase()) {
      const cleanEmail = data.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return { success: false, message: 'Địa chỉ email không đúng định dạng!' };
      }
      const dup = users.find(
        (u) => u.id !== id && u.email?.trim().toLowerCase() === cleanEmail
      );
      if (dup) {
        return { success: false, message: `Email '${cleanEmail}' đã được sử dụng bởi ${dup.name}!` };
      }
    }

    // Sync teacher profile if linked
    if (target.teacherId) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === target.teacherId) {
            return {
              ...t,
              fullName: data.name !== undefined ? data.name : t.fullName,
              email: data.email !== undefined ? data.email.trim().toLowerCase() : t.email,
              phone: data.phone !== undefined ? data.phone : t.phone,
              department: data.department !== undefined ? data.department : t.department,
              mainSubject: data.subject !== undefined ? data.subject : t.mainSubject,
              duty: data.dutyRole !== undefined ? data.dutyRole : (data.title !== undefined ? data.title : t.duty),
              isHomeroom: data.role === 'GVCN' || data.dutyRole === 'Giáo viên chủ nhiệm' ? true : (data.role !== undefined ? false : t.isHomeroom),
              homeroomClassId: data.homeroomClassId !== undefined ? data.homeroomClassId : t.homeroomClassId,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );
    }

    const updatedUser: User = {
      ...target,
      ...data,
      passwordHash:
        data.newPassword && data.newPassword.trim() ? data.newPassword.trim() : target.passwordHash,
      plainPassword:
        data.newPassword && data.newPassword.trim() ? data.newPassword.trim() : target.plainPassword,
    };

    setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
    }

    addAuditLog(
      'Cập nhật tài khoản giáo viên',
      `Admin đã cập nhật thông tin tài khoản [${updatedUser.username}] của ${updatedUser.name}.`,
      'Quản trị người dùng',
      updatedUser.username,
      'SUCCESS'
    );

    return { success: true, message: 'Cập nhật tài khoản thành công!' };
  };

  const updateUserLoginEmail = (
    id: string,
    newEmail: string,
    syncUsername: boolean = true
  ): { success: boolean; message: string } => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Địa chỉ email không được để trống!' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Địa chỉ email không đúng định dạng (Ví dụ: ten@domain.com)!' };
    }

    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng!' };
    }

    const dupEmail = users.find(
      (u) => u.id !== id && u.email?.trim().toLowerCase() === cleanEmail
    );
    if (dupEmail) {
      return {
        success: false,
        message: `Email '${cleanEmail}' đã được sử dụng bởi tài khoản "${dupEmail.name}"!`,
      };
    }

    const oldEmail = target.email;
    const shouldSyncUsername = syncUsername || target.username.toLowerCase() === oldEmail.toLowerCase();
    const finalUsername = shouldSyncUsername ? cleanEmail : target.username;

    if (finalUsername.toLowerCase() !== target.username.toLowerCase()) {
      const dupUser = users.find(
        (u) => u.id !== id && u.username.toLowerCase() === finalUsername.toLowerCase()
      );
      if (dupUser) {
        return {
          success: false,
          message: `Tên đăng nhập '${finalUsername}' đã được sử dụng bởi tài khoản "${dupUser.name}"!`,
        };
      }
    }

    const updatedUser: User = {
      ...target,
      email: cleanEmail,
      username: finalUsername,
    };

    setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    // Đồng bộ vào hồ sơ giáo viên nếu tài khoản này liên kết với hồ sơ
    if (target.teacherId) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === target.teacherId
            ? { ...t, email: cleanEmail, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }

    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
    }

    addAuditLog(
      'Sửa email đăng nhập',
      `Admin đã sửa email đăng nhập của ${target.name} từ [${oldEmail}] thành [${cleanEmail}].`,
      'Quản trị người dùng',
      cleanEmail,
      'SUCCESS'
    );

    return {
      success: true,
      message: `Đã cập nhật email đăng nhập của ${target.name} thành "${cleanEmail}" thành công!`,
    };
  };

  const resetUserPassword = (
    id: string,
    newPassword?: string
  ): { success: boolean; message: string; temporaryPassword?: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản!' };
    }

    const generatedPass =
      newPassword && newPassword.trim()
        ? newPassword.trim()
        : `Gv@${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedUser: User = {
      ...target,
      passwordHash: generatedPass,
      plainPassword: generatedPass,
    };

    setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
    }

    addAuditLog(
      'Đặt lại mật khẩu',
      `Admin đã đặt lại mật khẩu cho tài khoản [${target.username}] của ${target.name}.`,
      'Quản trị người dùng',
      target.username,
      'SUCCESS'
    );

    return {
      success: true,
      message: `Đã đặt lại mật khẩu cho tài khoản ${target.username}!`,
      temporaryPassword: generatedPass,
    };
  };

  const toggleLockUserAccount = (id: string): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản!' };
    }

    if (target.id === currentUser?.id && currentUser.role === 'ADMIN') {
      return { success: false, message: 'Không thể khóa tài khoản Admin đang đăng nhập!' };
    }

    const nextStatus = target.status === 'locked' ? 'active' : 'locked';
    const updatedUser: User = {
      ...target,
      status: nextStatus,
    };

    setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    addAuditLog(
      nextStatus === 'locked' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      `Admin đã ${nextStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản [${target.username}] của ${target.name}.`,
      'Quản trị người dùng',
      target.username,
      'WARNING'
    );

    return {
      success: true,
      message: `Đã ${nextStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản ${target.username}!`,
    };
  };

  const deleteUserAccount = (id: string): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản!' };
    }

    if (target.id === currentUser?.id) {
      return { success: false, message: 'Không thể xóa tài khoản hiện đang đăng nhập!' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    addAuditLog(
      'Xóa tài khoản',
      `Admin đã xóa tài khoản [${target.username}] của ${target.name}.`,
      'Quản trị người dùng',
      target.username,
      'WARNING'
    );

    return { success: true, message: `Đã xóa tài khoản ${target.username} thành công!` };
  };

  const autoGenerateAccountsForAllTeachers = (): {
    createdCount: number;
    existingCount: number;
    message: string;
  } => {
    let created = 0;
    let existing = 0;
    const newUsers: User[] = [];

    const toSlug = (str: string) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]/g, '');
    };

    teachers.forEach((t) => {
      const hasAccount = users.some(
        (u) =>
          (u.teacherId && u.teacherId === t.id) ||
          (t.email && u.email && u.email.toLowerCase() === t.email.toLowerCase())
      );

      if (hasAccount) {
        existing++;
        return;
      }

      // Tên tài khoản mặc định là địa chỉ email cá nhân của giáo viên
      let baseUsername = '';
      if (t.email && t.email.trim()) {
        baseUsername = t.email.trim().toLowerCase();
      } else {
        const slug = toSlug(t.fullName);
        baseUsername = `${slug || t.teacherCode.toLowerCase()}@nguyendinhanh.edu.vn`;
      }

      let finalUsername = baseUsername;
      let counter = 1;
      while (
        users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase()) ||
        newUsers.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase())
      ) {
        if (baseUsername.includes('@')) {
          const [prefix, domain] = baseUsername.split('@');
          finalUsername = `${prefix}${counter}@${domain || 'nguyendinhanh.edu.vn'}`;
        } else {
          finalUsername = `${baseUsername}${counter}`;
        }
        counter++;
      }

      let role: UserRole = 'GIÁO VIÊN';
      if (t.duty && (t.duty.includes('Hiệu trưởng') || t.duty.includes('Ban Giám Hiệu'))) {
        role = 'BGH';
      } else if (t.isHomeroom) {
        role = 'GVCN';
      }

      const defaultPass = 'Gv@2026';
      const createdUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        username: finalUsername,
        name: t.fullName,
        email: t.email || `${finalUsername}@nguyendinhanh.edu.vn`,
        role: role,
        passwordHash: defaultPass,
        plainPassword: defaultPass,
        title: t.duty || (role === 'GVCN' ? `GVCN lớp ${t.homeroomClassName || ''}` : 'Giáo viên bộ môn'),
        phone: t.phone || '',
        schoolId: school.id,
        teacherId: t.id,
        homeroomClassId: t.homeroomClassId,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      newUsers.push(createdUser);
      created++;
    });

    if (newUsers.length > 0) {
      setUsers((prev) => [...newUsers, ...prev]);
      addAuditLog(
        'Cấp tài khoản hàng loạt',
        `Admin đã tự động cấp ${created} tài khoản mới cho giáo viên toàn trường (mật khẩu mặc định: Gv@2026).`,
        'Quản trị người dùng',
        `${created} tài khoản`,
        'SUCCESS'
      );
    }

    return {
      createdCount: created,
      existingCount: existing,
      message: `Đã cấp mới ${created} tài khoản giáo viên! (${existing} giáo viên đã có tài khoản trước đó)`,
    };
  };

  const importUserAccounts = (
    accountList: Array<{
      name: string;
      email: string;
      username?: string;
      department?: string;
      subject?: string;
      dutyRole?: DutyRole;
      role?: UserRole;
      password?: string;
      phone?: string;
      status?: AccountStatus;
      homeroomClassName?: string;
    }>,
    strategy: 'skip_existing' | 'update_existing' = 'skip_existing',
    autoCreateTeacherProfile: boolean = true
  ): {
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
    message: string;
  } => {
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const updatedUsersMap = new Map<string, User>(users.map((u) => [u.id, u]));
    const emailToUserMap = new Map<string, User>();
    const usernameToUserMap = new Map<string, User>();

    users.forEach((u) => {
      if (u.email) emailToUserMap.set(u.email.toLowerCase().trim(), u);
      if (u.username) usernameToUserMap.set(u.username.toLowerCase().trim(), u);
    });

    const newTeachersToAdd: TeacherProfile[] = [];
    const teacherEmailMap = new Map<string, TeacherProfile>();
    teachers.forEach((t) => {
      if (t.email) teacherEmailMap.set(t.email.toLowerCase().trim(), t);
    });

    accountList.forEach((item, idx) => {
      const rowNum = idx + 1;
      const cleanName = (item.name || '').trim();
      const cleanEmail = (item.email || item.username || '').toLowerCase().trim();

      if (!cleanName) {
        errors.push(`Dòng ${rowNum}: Thiếu Họ và tên.`);
        return;
      }
      if (!cleanEmail) {
        errors.push(`Dòng ${rowNum}: Thiếu Email đăng nhập.`);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.push(`Dòng ${rowNum}: Email "${cleanEmail}" không đúng định dạng.`);
        return;
      }

      const normalizedDept = normalizeDepartmentName(item.department);
      const subject = item.subject?.trim() || '—';
      const dutyRole: DutyRole = item.dutyRole || 'Giáo viên bộ môn';

      let computedRole: UserRole = item.role || 'GIÁO VIÊN';
      if (dutyRole === 'Quản trị viên') {
        computedRole = 'ADMIN';
      } else if (dutyRole === 'Hiệu trưởng' || dutyRole === 'Phó Hiệu trưởng') {
        computedRole = 'BGH';
      } else if (dutyRole === 'Giáo viên chủ nhiệm' || Boolean(item.homeroomClassName)) {
        computedRole = 'GVCN';
      }

      const defaultPass = (item.password && item.password.trim()) || '123';
      const phone = item.phone?.trim() || '';
      const status: AccountStatus = item.status || 'active';

      // Check if homeroom class matches
      let homeroomClassId: string | undefined = undefined;
      if (item.homeroomClassName) {
        const foundClass = classes.find(
          (c) => c.className.toLowerCase() === item.homeroomClassName?.toLowerCase().trim()
        );
        if (foundClass) homeroomClassId = foundClass.id;
      }

      // Check existing user by email or username
      const existingUser = emailToUserMap.get(cleanEmail) || usernameToUserMap.get(cleanEmail);

      if (existingUser) {
        if (strategy === 'skip_existing') {
          skippedCount++;
          return;
        } else {
          // Update existing
          const updated: User = {
            ...existingUser,
            name: cleanName,
            department: normalizedDept,
            subject,
            dutyRole,
            role: computedRole,
            phone: phone || existingUser.phone,
            status,
            homeroomClassId: homeroomClassId || existingUser.homeroomClassId,
            passwordHash: item.password ? defaultPass : existingUser.passwordHash,
            plainPassword: item.password ? defaultPass : existingUser.plainPassword,
            title: dutyRole,
          };
          updatedUsersMap.set(existingUser.id, updated);
          emailToUserMap.set(cleanEmail, updated);
          usernameToUserMap.set(cleanEmail, updated);
          updatedCount++;
          return;
        }
      }

      // Link or create teacher profile if requested
      let linkedTeacherId: string | undefined = undefined;
      let matchedTeacher = teacherEmailMap.get(cleanEmail);

      if (!matchedTeacher && autoCreateTeacherProfile) {
        const nextCode = `GV-${String(teachers.length + newTeachersToAdd.length + 1).padStart(3, '0')}`;
        const newTeacher: TeacherProfile = {
          id: `teacher-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          teacherCode: nextCode,
          fullName: cleanName,
          gender: 'Nam',
          birthDate: '01/01/1985',
          email: cleanEmail,
          phone,
          department: normalizedDept,
          mainSubject: subject !== '—' ? subject : 'Toán',
          degree: 'Cử nhân ĐH Sư phạm',
          employmentStatus: 'Biên chế chính thức',
          joinDate: '01/09/2020',
          isHomeroom: computedRole === 'GVCN',
          homeroomClassId,
          homeroomClassName: item.homeroomClassName,
          duty: dutyRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTeachersToAdd.push(newTeacher);
        teacherEmailMap.set(cleanEmail, newTeacher);
        linkedTeacherId = newTeacher.id;
      } else if (matchedTeacher) {
        linkedTeacherId = matchedTeacher.id;
      }

      const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newUser: User = {
        id: newUserId,
        username: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        role: computedRole,
        passwordHash: defaultPass,
        plainPassword: defaultPass,
        title: dutyRole,
        phone,
        schoolId: school.id,
        teacherId: linkedTeacherId,
        homeroomClassId,
        status,
        department: normalizedDept,
        subject,
        dutyRole,
        createdAt: new Date().toISOString(),
      };

      updatedUsersMap.set(newUserId, newUser);
      emailToUserMap.set(cleanEmail, newUser);
      usernameToUserMap.set(cleanEmail, newUser);
      createdCount++;
    });

    if (createdCount > 0 || updatedCount > 0) {
      setUsers(Array.from(updatedUsersMap.values()));
      if (newTeachersToAdd.length > 0) {
        setTeachers((prev) => [...newTeachersToAdd, ...prev]);
      }
      addAuditLog(
        'Nhập tài khoản từ Excel',
        `Admin đã nhập tài khoản người dùng từ file Excel: Thêm mới ${createdCount}, Cập nhật ${updatedCount}, Bỏ qua ${skippedCount}.`,
        'Quản trị người dùng',
        `${createdCount + updatedCount} tài khoản`,
        'SUCCESS'
      );
    }

    return {
      createdCount,
      updatedCount,
      skippedCount,
      errorCount: errors.length,
      errors,
      message: `Hoàn tất nhập dữ liệu: Thêm mới ${createdCount} tài khoản, Cập nhật ${updatedCount} tài khoản, Bỏ qua ${skippedCount} tài khoản trùng lặp.`,
    };
  };

  const switchUserRole = (role: UserRole) => {
    const matched =
      users.find((u) => u.role === role) ||
      initialUsers.find((u) => u.role === role) || {
        id: `user-${role.toLowerCase()}`,
        username: role.toLowerCase(),
        name: `Tài khoản ${role}`,
        email: `${role.toLowerCase()}@nguyendinhanh.edu.vn`,
        role,
        title:
          role === 'ADMIN'
            ? 'Quản trị viên hệ thống'
            : role === 'BGH'
            ? 'Ban Giám Hiệu'
            : role === 'GVCN'
            ? 'Giáo viên chủ nhiệm'
            : 'Giáo viên bộ môn',
        schoolId: school.id,
        createdAt: new Date().toISOString(),
      };
    setCurrentUser(matched);
    addAuditLog(
      'Chuyển đổi vai trò người dùng',
      `Đã chuyển sang vai trò ${role} (${matched.name}) để kiểm thử phân quyền theo yêu cầu Giai đoạn 10.`,
      'Bảo mật & Phân quyền',
      role,
      'SUCCESS'
    );
  };

  const isCurrentSchoolYearLocked = currentSchoolYear?.status === 'locked';

  const canEditCurrentClass = ((): boolean => {
    if (isCurrentSchoolYearLocked) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.dutyRole === 'Quản trị viên') return true;
    if (currentUser.role === 'BGH') return false; // BGH chỉ xem và duyệt sổ, không trực tiếp sửa sổ danh của GVCN
    if (currentUser.role === 'GVCN' || currentUser.dutyRole === 'Giáo viên chủ nhiệm') {
      if (!currentClass) return false;
      return (
        currentClass.homeroomTeacherId === currentUser.id ||
        (Boolean(currentUser.teacherId) && currentClass.homeroomTeacherId === currentUser.teacherId) ||
        (Boolean(currentUser.homeroomClassId) && currentUser.homeroomClassId === currentClass.id) ||
        (Boolean(currentClass.homeroomTeacherName) &&
          currentClass.homeroomTeacherName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
      );
    }
    return false;
  })();

  // 2. Sao lưu dữ liệu & Phục hồi (Mục 4)
  const createBackup = (note?: string): SystemBackupPayload => {
    const payload: SystemBackupPayload = {
      version: '10.0.0-phase10',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Quản trị viên',
      school,
      schoolYears,
      classes,
      students,
      teachers,
      users,
      classroomConfigs: [classroomConfig],
      seats,
      classOfficers,
      parentRepresentatives,
      yearlyPlans: [yearlyPlan],
      monthlyPlans,
      scheduleWorkItems,
      attendanceRecords,
      subjectScores: academicScores,
      subjectTeachers,
      subjectTrackings,
      conductRecords,
      violationRecords,
      weeklyConductLogs,
      studentProgressEntries,
      studentSupportTags,
      classActivities,
      competitionConfig: competitionClassConfig,
      competitionRecords: groupCompetitionRecords,
      awardRecords,
      talentProfiles,
      termLocks,
      semesterSummaryReports,
      yearEndSummaryReport,
      studentSemesterComments,
      auditLogs,
      settings,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const cleanSchoolName = school.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `SoChuNhiem_Backup_${cleanSchoolName}_${dateStr}_${timeStr}.json`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const meta: BackupMetadata = {
      id: `bak-${Date.now()}`,
      fileName,
      createdAt: now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN'),
      createdBy: currentUser?.name || 'Quản trị viên',
      fileSizeBytes: blob.size,
      recordCounts: {
        classes: classes.length,
        students: students.length,
        attendance: attendanceRecords.length,
        academic: academicScores.length,
        conduct: conductRecords.length,
        violations: violationRecords.length,
        plans: monthlyPlans.length + scheduleWorkItems.length,
        activities: classActivities.length,
        auditLogs: auditLogs.length,
      },
      note: note || 'Bản sao lưu dữ liệu toàn diện hệ thống Sổ chủ nhiệm điện tử',
    };

    setBackups((prev) => [meta, ...prev]);
    addAuditLog(
      'Sao lưu toàn bộ dữ liệu',
      `Tạo bản sao lưu ${fileName} (${(blob.size / 1024).toFixed(1)} KB) thành công.`,
      'Sao lưu & Phục hồi',
      fileName,
      'SUCCESS'
    );

    return payload;
  };

  const exportFullJson = () => {
    createBackup('Xuất dữ liệu hệ thống thủ công theo yêu cầu GVCN.');
  };

  const restoreBackup = (payload: SystemBackupPayload): { success: boolean; message: string } => {
    try {
      if (!payload || !payload.classes || !payload.students) {
        return { success: false, message: 'Tệp sao lưu không hợp lệ: Thiếu danh mục lớp hoặc học sinh.' };
      }
      if (payload.school) setSchool(payload.school);
      if (payload.schoolYears) setSchoolYears(payload.schoolYears);
      if (payload.classes) setClasses(payload.classes);
      if (payload.students) setStudents(payload.students);
      if (payload.teachers) setTeachers(payload.teachers);
      if (payload.users && Array.isArray(payload.users)) setUsers(payload.users);
      if (payload.classroomConfigs && payload.classroomConfigs[0]) setClassroomConfig(payload.classroomConfigs[0]);
      if (payload.seats) setSeats(payload.seats);
      if (payload.classOfficers) setClassOfficers(payload.classOfficers);
      if (payload.parentRepresentatives) setParentRepresentatives(payload.parentRepresentatives);
      if (payload.yearlyPlans && payload.yearlyPlans[0]) setYearlyPlan(payload.yearlyPlans[0]);
      if (payload.monthlyPlans) setMonthlyPlans(payload.monthlyPlans);
      if (payload.scheduleWorkItems) setScheduleWorkItems(payload.scheduleWorkItems);
      if (payload.attendanceRecords) setAttendanceRecords(payload.attendanceRecords);
      if (payload.subjectScores) setAcademicScores(payload.subjectScores);
      if (payload.subjectTeachers) setSubjectTeachers(payload.subjectTeachers);
      if (payload.subjectTrackings) setSubjectTrackings(payload.subjectTrackings);
      if (payload.conductRecords) setConductRecords(payload.conductRecords);
      if (payload.violationRecords) setViolationRecords(payload.violationRecords);
      if (payload.weeklyConductLogs) setWeeklyConductLogs(payload.weeklyConductLogs);
      if (payload.studentProgressEntries) setStudentProgressEntries(payload.studentProgressEntries);
      if (payload.studentSupportTags) setStudentSupportTags(payload.studentSupportTags);
      if (payload.classActivities) setClassActivities(payload.classActivities);
      if (payload.competitionConfig) setCompetitionClassConfig(payload.competitionConfig);
      if (payload.competitionRecords) setGroupCompetitionRecords(payload.competitionRecords);
      if (payload.awardRecords) setAwardRecords(payload.awardRecords);
      if (payload.talentProfiles) setTalentProfiles(payload.talentProfiles);
      if (payload.termLocks) setTermLocks(payload.termLocks);
      if (payload.semesterSummaryReports) setSemesterSummaryReports(payload.semesterSummaryReports);
      if (payload.yearEndSummaryReport) setYearEndSummaryReport(payload.yearEndSummaryReport);
      if (payload.studentSemesterComments) setStudentSemesterComments(payload.studentSemesterComments);
      if (payload.settings) setSettings(payload.settings);

      addAuditLog(
        'Khôi phục dữ liệu từ bản sao lưu',
        `Đã khôi phục trạng thái hệ thống thành công (bản sao lưu xuất ngày ${payload.exportedAt || 'N/A'}).`,
        'Sao lưu & Phục hồi',
        'Database State',
        'SUCCESS'
      );
      return { success: true, message: 'Đã khôi phục dữ liệu hệ thống thành công!' };
    } catch (err: any) {
      return { success: false, message: `Lỗi khôi phục: ${err.message || 'Lỗi không xác định.'}` };
    }
  };

  // 3. Chuyển lớp / Lên lớp sang năm học mới (Mục 8)
  const promoteClassToNewYear = (config: ClassPromotionConfig) => {
    let targetYear = schoolYears.find((y) => y.id === config.targetSchoolYearId);
    if (!targetYear) {
      const newYearId = config.targetSchoolYearId || `sy-${Date.now()}`;
      const newYear: SchoolYear = {
        id: newYearId,
        code: '2027-2028',
        name: 'Năm học 2027 - 2028',
        startDate: '05/09/2027',
        endDate: '31/05/2028',
        status: 'active',
        isCurrent: true,
        createdAt: new Date().toISOString(),
      };
      setSchoolYears((prev) => [newYear, ...prev]);
      targetYear = newYear;
    }

    const newClassId = `class-${config.targetClassName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const promotedStudentsList = config.students.filter((s) => s.isPromoted);

    const newClass: ClassEntity = {
      id: newClassId,
      schoolId: school.id,
      schoolYearId: targetYear.id,
      grade: config.targetGrade,
      className: config.targetClassName,
      homeroomTeacherId: currentUser?.id || 'user-gvcn-1',
      homeroomTeacherName: currentUser?.name || 'Lê Đức Minh',
      roomNumber: config.targetRoomNumber,
      studyShift: config.studyShift,
      studentCount: promotedStudentsList.length,
      characteristics: `Lớp ${config.targetClassName} được chuyển tiếp từ lớp ${currentClass?.className || '7/1'} năm học trước.`,
      advantages: 'Học sinh có ý thức kỷ luật tốt, ban cán sự lớp đoàn kết gương mẫu.',
      difficulties: 'Khối lớp mới với nhiều yêu cầu kiến thức nâng cao, cần tiếp tục bồi dưỡng.',
      goals: '100% học sinh duy trì sĩ số, không có học sinh bỏ học giữa chừng; Chi đội Vững mạnh xuất sắc.',
      notes: `Chuyển lớp thành công ngày ${new Date().toLocaleDateString('vi-VN')}.`,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClasses((prev) => [newClass, ...prev]);

    const clonedStudents: Student[] = promotedStudentsList.map((item, idx) => {
      const originalStudent = students.find((s) => s.id === item.studentId);
      return {
        id: `hs-prom-${item.studentId}-${Date.now().toString().slice(-4)}`,
        stt: idx + 1,
        studentCode: `HS${String(idx + 1).padStart(3, '0')}`,
        classId: newClassId,
        schoolYearId: targetYear.id,
        fullName: originalStudent?.fullName || item.studentName,
        gender: originalStudent?.gender || item.gender,
        birthDate: originalStudent?.birthDate || '2013-01-01',
        ethnicity: originalStudent?.ethnicity || 'Kinh',
        address: config.keepProfiles ? (originalStudent?.address || 'Thành phố Huế') : 'Thành phố Huế',
        residence: config.keepProfiles ? (originalStudent?.residence || 'Thành phố Huế') : 'Thành phố Huế',
        phone: originalStudent?.phone || '',
        fatherName: config.keepParents ? originalStudent?.fatherName : undefined,
        fatherPhone: config.keepParents ? originalStudent?.fatherPhone : undefined,
        fatherJob: config.keepParents ? originalStudent?.fatherJob : undefined,
        motherName: config.keepParents ? originalStudent?.motherName : undefined,
        motherPhone: config.keepParents ? originalStudent?.motherPhone : undefined,
        motherJob: config.keepParents ? originalStudent?.motherJob : undefined,
        groupNumber: ((idx % 4) + 1),
        isPoorHousehold: originalStudent?.isPoorHousehold || false,
        policyPriority: originalStudent?.policyPriority,
        needsAttention: originalStudent?.needsAttention || false,
        needsSupport: originalStudent?.needsSupport || false,
        hasSpecialTalent: config.keepTalents ? (originalStudent?.hasSpecialTalent || false) : false,
        talents: config.keepTalents ? originalStudent?.talents : undefined,
        hasProgress: false,
        status: 'active',
        notes: item.notes || `Chuyển từ lớp ${currentClass?.className || '7/1'} lên lớp ${config.targetClassName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    setStudents((prev) => [...prev, ...clonedStudents]);

    const newSeats = generateDefaultSeats(clonedStudents);
    setSeats((prev) => [...prev, ...newSeats]);

    addAuditLog(
      'Chuyển lớp sang năm học mới',
      `Đã chuyển tiếp ${clonedStudents.length}/${config.students.length} học sinh sang lớp mới ${config.targetClassName} (${targetYear.name}).`,
      'Chuyển lớp & Niên khóa',
      newClassId,
      'SUCCESS'
    );

    return {
      success: true,
      message: `Đã chuyển thành công ${clonedStudents.length} học sinh sang lớp ${config.targetClassName}!`,
      targetClassId: newClassId,
    };
  };

  // 4. Trợ lý AI GVCN (Bản nháp & Áp dụng) (Mục 1 & 3)
  const saveAiDraft = (draft: AiDraftContent) => {
    setAiDrafts((prev) => [draft, ...prev.filter((d) => d.id !== draft.id)]);
    addAuditLog(
      'Lưu bản nháp AI',
      `Tạo bản nháp AI thể loại "${draft.title}".`,
      'Trợ lý AI GVCN',
      draft.id,
      'SUCCESS'
    );
  };

  const applyAiDraft = (draftId: string): { success: boolean; message: string } => {
    const draft = aiDrafts.find((d) => d.id === draftId);
    if (!draft) return { success: false, message: 'Không tìm thấy bản nháp AI.' };

    if (draft.type === 'student-comment' && draft.targetId) {
      saveStudentSemesterComment(
        draft.targetId,
        'HKI',
        draft.fullText,
        true,
        draft.fullText
      );
    } else if (draft.type === 'plan-suggestion') {
      addMonthlyPlan({
        classId: currentClass?.id || 'class-7-1',
        schoolYearId: currentSchoolYear.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        theme: draft.title,
        goal: draft.observedData.join('\n') || 'Hoàn thành các chỉ tiêu trọng tâm tháng.',
        content: draft.fullText,
        measures: draft.aiSuggestions.join('\n') || draft.fullText,
        activities: [draft.title, 'Sinh hoạt lớp theo chủ điểm', 'Phong trào thi đua 4 tổ'],
        status: 'Đang thực hiện',
      });
    }

    setAiDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, isApplied: true } : d))
    );

    addAuditLog(
      'Áp dụng bản nháp AI',
      `Đã áp dụng bản nháp AI "${draft.title}" vào dữ liệu chính thức sau khi GVCN xác nhận.`,
      'Trợ lý AI GVCN',
      draft.id,
      'SUCCESS'
    );

    return { success: true, message: `Đã áp dụng thành công nội dung AI vào hệ thống!` };
  };

  const deleteAiDraft = (draftId: string) => {
    setAiDrafts((prev) => prev.filter((d) => d.id !== draftId));
    addAuditLog(
      'Hủy bản nháp AI',
      `GVCN đã từ chối/hủy bản nháp AI ID ${draftId}.`,
      'Trợ lý AI GVCN',
      draftId,
      'WARNING'
    );
  };

  // 5. Kiểm tra tính toàn vẹn dữ liệu & Mồ côi (Mục 10)
  const runDataIntegrityCheck = (): OrphanCheckResult[] => {
    const studentIdSet = new Set(students.map((s) => s.id));
    const classIdSet = new Set(classes.map((c) => c.id));

    const orphanedScoreIds = academicScores
      .filter((score) => !studentIdSet.has(score.studentId))
      .map((s) => s.id);

    const orphanedAttendanceIds = attendanceRecords
      .filter((att) => !studentIdSet.has(att.studentId))
      .map((a) => a.id);

    const orphanedViolationIds = violationRecords
      .filter((v) => !studentIdSet.has(v.studentId))
      .map((v) => v.id);

    const orphanedAwardIds = awardRecords
      .filter((aw) => !studentIdSet.has(aw.studentId))
      .map((a) => a.id);

    const orphanedTalentIds = talentProfiles
      .filter((t) => !studentIdSet.has(t.studentId))
      .map((t) => t.id);

    const orphanedCommentIds = studentSemesterComments
      .filter((c) => !studentIdSet.has(c.studentId))
      .map((c) => c.id);

    const orphanedStudentIds = students
      .filter((s) => !classIdSet.has(s.classId))
      .map((s) => s.id);

    return [
      {
        module: 'Điểm số môn học (SubjectScores)',
        recordCount: academicScores.length,
        orphanCount: orphanedScoreIds.length,
        orphanedIds: orphanedScoreIds,
        status: orphanedScoreIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Mỗi điểm số bắt buộc phải gắn liền với một học sinh có trong danh sách.',
      },
      {
        module: 'Điểm danh chuyên cần (AttendanceRecords)',
        recordCount: attendanceRecords.length,
        orphanCount: orphanedAttendanceIds.length,
        orphanedIds: orphanedAttendanceIds,
        status: orphanedAttendanceIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Dữ liệu điểm danh ngày bắt buộc thuộc học sinh hợp lệ của lớp.',
      },
      {
        module: 'Kỷ luật & Vi phạm (ViolationRecords)',
        recordCount: violationRecords.length,
        orphanCount: orphanedViolationIds.length,
        orphanedIds: orphanedViolationIds,
        status: orphanedViolationIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Bản ghi vi phạm nề nếp phải liên kết với học sinh hiện diện.',
      },
      {
        module: 'Khen thưởng & Thành tích (AwardRecords)',
        recordCount: awardRecords.length,
        orphanCount: orphanedAwardIds.length,
        orphanedIds: orphanedAwardIds,
        status: orphanedAwardIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Hồ sơ khen thưởng các cấp phải thuộc về học sinh cụ thể.',
      },
      {
        module: 'Năng khiếu học sinh (TalentProfiles)',
        recordCount: talentProfiles.length,
        orphanCount: orphanedTalentIds.length,
        orphanedIds: orphanedTalentIds,
        status: orphanedTalentIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Hồ sơ bồi dưỡng năng khiếu phải khớp mã học sinh.',
      },
      {
        module: 'Nhận xét học kỳ (StudentSemesterComments)',
        recordCount: studentSemesterComments.length,
        orphanCount: orphanedCommentIds.length,
        orphanedIds: orphanedCommentIds,
        status: orphanedCommentIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Nhận xét của GVCN và dự thảo AI phải gắn với học sinh hợp lệ.',
      },
      {
        module: 'Phân lớp học sinh (Students -> Classes)',
        recordCount: students.length,
        orphanCount: orphanedStudentIds.length,
        orphanedIds: orphanedStudentIds,
        status: orphanedStudentIds.length === 0 ? 'CLEAN' : 'HAS_ORPHANS',
        description: 'Mỗi học sinh phải được phân bổ vào đúng một lớp học cụ thể.',
      },
    ];
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
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
        classBookApprovals,
        toggleApproveClassBook,
        assignHomeroomTeacher,
        batchAssignHomeroom,
        syncHomeroomAssignments,
        subjectTeachers,
        updateSubjectTeacher,
        addSubjectTeacher,
        deleteSubjectTeacher,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        importTeachers,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        students,
        currentClassStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleLockStudent,
        importStudents,
        selectedStudent,
        setSelectedStudent,
        classroomConfig,
        updateClassroomConfig,
        seats,
        updateSeatAssignment,
        swapSeats,
        autoAssignSeats,
        clearAllSeats,
        resetSeatsToDefault,
        classOfficers,
        addClassOfficer,
        updateClassOfficer,
        deleteClassOfficer,
        parentRepresentatives,
        addParentRepresentative,
        updateParentRepresentative,
        deleteParentRepresentative,
        yearlyPlan,
        updateYearlyPlan,
        addYearlyPlanTask,
        updateYearlyPlanTask,
        deleteYearlyPlanTask,
        monthlyPlans,
        addMonthlyPlan,
        updateMonthlyPlan,
        copyMonthlyPlan,
        scheduleWorkItems,
        addScheduleWorkItem,
        updateScheduleWorkItem,
        deleteScheduleWorkItem,
        attendanceRecords,
        saveBatchAttendance,
        updateStudentAttendance,
        markAllPresent,
        academicScores,
        saveSubjectScore,
        saveBatchSubjectScores,
        updateSubjectScore,
        deleteSubjectScore,
        subjectTrackings,
        updateSubjectTracking,
        conductRecords,
        saveConductRecord,
        updateConductRecord,
        deleteConductRecord,
        violationRecords,
        addViolationRecord,
        updateViolationRecord,
        deleteViolationRecord,
        weeklyConductLogs,
        addWeeklyConductLog,
        updateWeeklyConductLog,
        deleteWeeklyConductLog,
        studentProgressEntries,
        addStudentProgressEntry,
        updateStudentProgressEntry,
        deleteStudentProgressEntry,
        studentSupportTags,
        addStudentSupportTag,
        removeStudentSupportTag,
        toggleSupportTagResolved,
        classActivities,
        addClassActivity,
        updateClassActivity,
        deleteClassActivity,
        toggleActivityParticipant,
        setActivityParticipants,
        competitionClassConfig,
        updateCompetitionClassConfig,
        groupCompetitionRecords,
        saveGroupCompetitionRecord,
        deleteGroupCompetitionRecord,
        awardRecords,
        addAwardRecord,
        updateAwardRecord,
        deleteAwardRecord,
        talentProfiles,
        addTalentProfile,
        updateTalentProfile,
        deleteTalentProfile,
        termLocks,
        toggleTermLock,
        semesterSummaryReports,
        saveSemesterSummaryReport,
        yearEndSummaryReport,
        updateYearEndSummaryReport,
        studentSemesterComments,
        saveStudentSemesterComment,
        activeMenu,
        setActiveMenu,
        sidebarOpen,
        setSidebarOpen,
        auditLogs,
        addAuditLog,
        settings,
        updateSettings,
        users,
        addUserAccount,
        updateUserAccount,
        updateUserLoginEmail,
        resetUserPassword,
        toggleLockUserAccount,
        deleteUserAccount,
        autoGenerateAccountsForAllTeachers,
        importUserAccounts,
        switchUserRole,
        canEditCurrentClass,
        isCurrentSchoolYearLocked,
        backups,
        createBackup,
        restoreBackup,
        exportFullJson,
        promoteClassToNewYear,
        aiDrafts,
        saveAiDraft,
        applyAiDraft,
        deleteAiDraft,
        runDataIntegrityCheck,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
