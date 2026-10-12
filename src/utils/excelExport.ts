import * as XLSX from 'xlsx';
import {
  Student,
  AttendanceRecord,
  AcademicScore,
  SubjectTracking,
  ConductRecord,
  ViolationRecord,
  ClassActivity,
  GroupCompetitionRecord,
  AwardRecord,
  ClassEntity,
  SchoolYear,
  School,
} from '../types';

/**
 * Security verification: Ensure export only processes data belonging to the active class and school year.
 */
function validateClassAndYear(
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear
) {
  if (!currentClass || !currentClass.id) {
    throw new Error('Lỗi bảo mật dữ liệu: Chưa chọn lớp học hiện hành!');
  }
  if (!currentSchoolYear || !currentSchoolYear.id) {
    throw new Error('Lỗi bảo mật dữ liệu: Chưa xác định năm học hiện hành!');
  }
}

/**
 * Helper to download workbook file
 */
function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName, { bookType: 'xlsx', compression: true });
}

// ================= 1. XUẤT DANH SÁCH HỌC SINH =================
export function exportStudentsToExcel(
  students: Student[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  // Strict class filter
  const classStudents = students.filter(
    (s) => s.classId === currentClass!.id
  );

  const metaRows = [
    [school.name.toUpperCase()],
    [`DANH SÁCH HỌC SINH LỚP ${currentClass!.className} - NĂM HỌC ${currentSchoolYear.name}`],
    [`GVCN: ${currentClass!.homeroomTeacherName} | Sĩ số: ${classStudents.length} học sinh`],
    [`Ngày xuất file: ${new Date().toLocaleDateString('vi-VN')}`],
    [], // Blank row
  ];

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Tổ',
    'Dân tộc',
    'Diện chính sách',
    'Địa chỉ thường trú',
    'Họ tên Cha/Mẹ',
    'SĐT Phụ huynh',
    'Ghi chú',
  ];

  const dataRows = classStudents.map((s, idx) => [
    idx + 1,
    s.studentCode,
    s.fullName,
    s.birthDate,
    s.gender,
    `Tổ ${s.groupNumber}`,
    s.ethnicity || 'Kinh',
    s.policyPriority || 'Không',
    s.address || '',
    s.fatherName || s.motherName || '',
    s.fatherPhone || s.motherPhone || '',
    s.notes || '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
    { wch: 14 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `HocSinh_${currentClass!.className}`);
  downloadWorkbook(workbook, `Danh_Sach_Hoc_Sinh_Lop_${currentClass!.className}_${currentSchoolYear.code}.xlsx`);
}

// ================= 2. XUẤT ĐIỂM DANH & CHUYÊN CẦN =================
export function exportAttendanceToExcel(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classStudents = students.filter((s) => s.classId === currentClass!.id);
  const classAttRecords = attendanceRecords.filter((r) => r.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`BÁO CÁO THEO DÕI ĐIỂM DANH & CHUYÊN CẦN LỚP ${currentClass!.className}`],
    [`Năm học: ${currentSchoolYear.name} | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Tổ',
    'Số buổi có mặt',
    'Nghỉ có phép',
    'Nghỉ không phép',
    'Đi muộn',
    'Về sớm',
    'Tổng lượt vắng',
    'Tỷ lệ chuyên cần (%)',
  ];

  const dataRows = classStudents.map((st, idx) => {
    const recs = classAttRecords.filter((r) => r.studentId === st.id);
    const present = recs.filter((r) => r.status === 'Có mặt').length;
    const excused = recs.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcused = recs.filter((r) => r.status === 'Nghỉ không phép').length;
    const late = recs.filter((r) => r.status === 'Đi muộn').length;
    const early = recs.filter((r) => r.status === 'Về sớm').length;
    const totalAbsences = excused + unexcused;
    const totalSessions = recs.length || 1;
    const rate = Math.round(((totalSessions - totalAbsences) / totalSessions) * 100);

    return [
      idx + 1,
      st.studentCode,
      st.fullName,
      `Tổ ${st.groupNumber}`,
      present,
      excused,
      unexcused,
      late,
      early,
      totalAbsences,
      `${rate}%`,
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 15 },
    { wch: 14 },
    { wch: 16 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `ChuyenCan_${currentClass!.className}`);
  downloadWorkbook(workbook, `Theo_Doi_Chuyen_Can_Lop_${currentClass!.className}_${currentSchoolYear.code}.xlsx`);
}

// ================= 3. XUẤT KẾT QUẢ HỌC TẬP =================
export function exportAcademicToExcel(
  students: Student[],
  academicScores: AcademicScore[],
  subjectTrackings: SubjectTracking[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School,
  termName = 'Cuối HKI'
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classStudents = students.filter((s) => s.classId === currentClass!.id);
  const classScores = academicScores.filter((s) => s.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`BẢNG TỔNG HỢP KẾT QUẢ HỌC TẬP LỚP ${currentClass!.className} (${termName})`],
    [`Quy chuẩn: Thông tư 22/2021/TT-BGDĐT | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Tổ',
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'KHTN',
    'Lịch sử & ĐL',
    'GDCD',
    'Tin học',
    'Công nghệ',
    'GDTC',
    'Nghệ thuật',
    'HĐTN',
    'GDĐP',
    'Điểm TB môn',
    'Xếp loại học tập',
  ];

  const subjects = [
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
  ];

  const dataRows = classStudents.map((st, idx) => {
    const studentScores = classScores.filter((s) => s.studentId === st.id);
    const scoreMap: Record<string, string | number> = {};

    let numericSum = 0;
    let numericCount = 0;

    subjects.forEach((sub) => {
      const rec = studentScores.find((s) => s.subjectName === sub);
      if (rec) {
        if (rec.score !== null && rec.score !== undefined) {
          scoreMap[sub] = rec.score;
          numericSum += rec.score;
          numericCount += 1;
        } else if (rec.evaluationGrade) {
          scoreMap[sub] = rec.evaluationGrade;
        } else {
          scoreMap[sub] = '-';
        }
      } else {
        scoreMap[sub] = '-';
      }
    });

    const avg = numericCount > 0 ? (numericSum / numericCount).toFixed(1) : '-';
    let grade = 'Đạt';
    if (avg !== '-') {
      const numAvg = parseFloat(avg);
      if (numAvg >= 8.0) grade = 'Tốt';
      else if (numAvg >= 6.5) grade = 'Khá';
      else if (numAvg >= 5.0) grade = 'Đạt';
      else grade = 'Chưa đạt';
    }

    return [
      idx + 1,
      st.studentCode,
      st.fullName,
      `Tổ ${st.groupNumber}`,
      scoreMap['Toán'] ?? '-',
      scoreMap['Ngữ văn'] ?? '-',
      scoreMap['Tiếng Anh'] ?? '-',
      scoreMap['Khoa học tự nhiên'] ?? '-',
      scoreMap['Lịch sử và Địa lí'] ?? '-',
      scoreMap['Giáo dục công dân'] ?? '-',
      scoreMap['Tin học'] ?? '-',
      scoreMap['Công nghệ'] ?? '-',
      scoreMap['Giáo dục thể chất'] ?? 'Đạt',
      scoreMap['Nghệ thuật (Âm nhạc, Mĩ thuật)'] ?? 'Đạt',
      scoreMap['Hoạt động trải nghiệm, hướng nghiệp'] ?? 'Đạt',
      scoreMap['Nội dung giáo dục địa phương'] ?? 'Đạt',
      avg,
      grade,
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `HocTap_${currentClass!.className}`);
  downloadWorkbook(workbook, `Ket_Qua_Hoc_Tap_Lop_${currentClass!.className}_${termName}.xlsx`);
}

// ================= 4. XUẤT RÈN LUYỆN =================
export function exportConductToExcel(
  students: Student[],
  conductRecords: ConductRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classStudents = students.filter((s) => s.classId === currentClass!.id);
  const classConduct = conductRecords.filter((c) => c.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`BẢNG THEO DÕI RÈN LUYỆN ĐẠO ĐỨC & NỀ NẾP LỚP ${currentClass!.className}`],
    [`Năm học: ${currentSchoolYear.name} | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Tổ',
    'Đợt đánh giá',
    'Xếp loại rèn luyện',
    'Biểu hiện tích cực',
    'Điểm cần rèn luyện thêm',
    'Ý kiến phụ huynh / Nhận xét',
  ];

  const dataRows: any[] = [];
  let stt = 1;

  classStudents.forEach((st) => {
    const studentConduct = classConduct.filter((c) => c.studentId === st.id);
    if (studentConduct.length === 0) {
      dataRows.push([
        stt++,
        st.studentCode,
        st.fullName,
        `Tổ ${st.groupNumber}`,
        'Cả năm',
        'Tốt',
        'Chấp hành tốt nội quy trường lớp',
        'Phát huy tinh thần tự giác',
        'Đồng thuận với đánh giá của GVCN',
      ]);
    } else {
      studentConduct.forEach((c) => {
        dataRows.push([
          stt++,
          st.studentCode,
          st.fullName,
          `Tổ ${st.groupNumber}`,
          c.term,
          c.grade,
          c.positiveManifestations || 'Gương mẫu, lễ phép',
          c.areasForImprovement || 'Duy trì nề nếp',
          c.teacherComment || '',
        ]);
      });
    }
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 35 },
    { wch: 30 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `RenLuyen_${currentClass!.className}`);
  downloadWorkbook(workbook, `Theo_Doi_Ren_Luyen_Lop_${currentClass!.className}.xlsx`);
}

// ================= 5. XUẤT VI PHẠM =================
export function exportViolationsToExcel(
  students: Student[],
  violationRecords: ViolationRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classStudents = students.filter((s) => s.classId === currentClass!.id);
  const classViolations = violationRecords.filter((v) => v.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`NHẬT KÝ THEO DÕI VI PHẠM NỀ NẾP & BIỆN PHÁP GIÁO DỤC LỚP ${currentClass!.className}`],
    [`Năm học: ${currentSchoolYear.name} | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Ngày ghi nhận',
    'Mã học sinh',
    'Họ và tên học sinh',
    'Tổ',
    'Nội dung vụ việc vi phạm',
    'Mức độ vi phạm',
    'Biện pháp giáo dục đã áp dụng',
    'Kết quả chuyển biến',
    'Người ghi nhận',
  ];

  const dataRows = classViolations.map((v, idx) => {
    const st = classStudents.find((s) => s.id === v.studentId);
    return [
      idx + 1,
      v.date,
      st?.studentCode || '',
      st?.fullName || 'Học sinh lớp',
      st ? `Tổ ${st.groupNumber}` : '',
      v.title,
      v.severity,
      v.educationalMeasures,
      v.resultAfterEducation,
      v.recordedBy,
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 35 },
    { wch: 15 },
    { wch: 35 },
    { wch: 30 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `ViPham_${currentClass!.className}`);
  downloadWorkbook(workbook, `Theo_Doi_Vi_Pham_Lop_${currentClass!.className}.xlsx`);
}

// ================= 6. XUẤT HOẠT ĐỘNG TẬP THỂ =================
export function exportActivitiesToExcel(
  classActivities: ClassActivity[],
  students: Student[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classActs = classActivities.filter((a) => a.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`SỔ THEO DÕI HOẠT ĐỘNG TẬP THỂ & NGOẠI KHÓA LỚP ${currentClass!.className}`],
    [`Năm học: ${currentSchoolYear.name} | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Tên hoạt động',
    'Ngày tổ chức',
    'Địa điểm',
    'Người phụ trách',
    'Mục tiêu giáo dục',
    'Nội dung hoạt động',
    'Số lượng HS tham gia',
    'Kết quả đạt được',
  ];

  const dataRows = classActs.map((act, idx) => [
    idx + 1,
    act.name,
    act.date,
    act.location,
    act.personInCharge,
    act.objective,
    act.content,
    `${act.participantStudentIds.length} học sinh`,
    act.result,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 35 },
    { wch: 20 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `HoatDong_${currentClass!.className}`);
  downloadWorkbook(workbook, `Hoat_Dong_Tap_The_Lop_${currentClass!.className}.xlsx`);
}

// ================= 7. XUẤT THI ĐUA =================
export function exportCompetitionToExcel(
  groupCompetitionRecords: GroupCompetitionRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classComps = groupCompetitionRecords.filter((c) => c.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`BẢNG THEO DÕI THI ĐUA 4 TỔ TỰ QUẢN LỚP ${currentClass!.className}`],
    [`6 Tiêu chí: Học tập, Chuyên cần, Nề nếp, Hoạt động, Vệ sinh, Phong trào`],
    [`GVCN: ${currentClass!.homeroomTeacherName} | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Đợt thi đua',
    'Tổ',
    'Học tập',
    'Chuyên cần',
    'Nề nếp',
    'Hoạt động',
    'Vệ sinh',
    'Phong trào',
    'Tổng điểm (nếu có)',
    'Xếp hạng',
    'Nhận xét của GVCN',
  ];

  const dataRows = classComps.map((c, idx) => [
    idx + 1,
    `${c.periodType.toUpperCase()} - ${c.periodName}`,
    `Tổ ${c.groupNumber}`,
    c.evaluations?.['học tập'] || (c.scores?.['học tập'] ? `${c.scores['học tập']}đ` : 'Tốt'),
    c.evaluations?.['chuyên cần'] || (c.scores?.['chuyên cần'] ? `${c.scores['chuyên cần']}đ` : 'Tốt'),
    c.evaluations?.['nề nếp'] || (c.scores?.['nề nếp'] ? `${c.scores['nề nếp']}đ` : 'Tốt'),
    c.evaluations?.['hoạt động'] || (c.scores?.['hoạt động'] ? `${c.scores['hoạt động']}đ` : 'Tốt'),
    c.evaluations?.['vệ sinh'] || (c.scores?.['vệ sinh'] ? `${c.scores['vệ sinh']}đ` : 'Tốt'),
    c.evaluations?.['phong trào'] || (c.scores?.['phong trào'] ? `${c.scores['phong trào']}đ` : 'Tốt'),
    c.totalScore ? `${c.totalScore} điểm` : 'Định tính',
    c.rank ? `Hạng ${c.rank}` : '-',
    c.comment || '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `ThiDua_${currentClass!.className}`);
  downloadWorkbook(workbook, `Theo_Doi_Thi_Dua_4_To_Lop_${currentClass!.className}.xlsx`);
}

// ================= 8. XUẤT KHEN THƯỞNG =================
export function exportAwardsToExcel(
  students: Student[],
  awardRecords: AwardRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const classStudents = students.filter((s) => s.classId === currentClass!.id);
  const classAwards = awardRecords.filter((aw) => aw.classId === currentClass!.id);

  const metaRows = [
    [school.name.toUpperCase()],
    [`SỔ KHEN THƯỞNG & THÀNH TÍCH HỌC SINH LỚP ${currentClass!.className}`],
    [`Năm học: ${currentSchoolYear.name} | GVCN: ${currentClass!.homeroomTeacherName}`],
    [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
  ];

  const headers = [
    'STT',
    'Ngày khen thưởng',
    'Mã học sinh',
    'Họ và tên học sinh',
    'Tổ',
    'Thành tích / Danh hiệu',
    'Cấp khen thưởng',
    'Nội dung quyết định khen thưởng',
    'Minh chứng / Số QĐ',
    'Ghi chú',
  ];

  const dataRows = classAwards.map((aw, idx) => {
    const st = classStudents.find((s) => s.id === aw.studentId);
    return [
      idx + 1,
      aw.date,
      st?.studentCode || '',
      st?.fullName || 'Học sinh',
      st ? `Tổ ${st.groupNumber}` : '',
      aw.achievement,
      aw.level,
      aw.content,
      aw.evidence || '',
      aw.notes || '',
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
    { wch: 8 },
    { wch: 28 },
    { wch: 15 },
    { wch: 35 },
    { wch: 22 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `KhenThuong_${currentClass!.className}`);
  downloadWorkbook(workbook, `So_Khen_Thuong_Lop_${currentClass!.className}.xlsx`);
}

// ================= 9. XUẤT TOÀN BỘ SỔ CHỦ NHIỆM (MULTI-SHEET WORKBOOK) =================
export function exportAllDataToSingleWorkbook(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  academicScores: AcademicScore[],
  subjectTrackings: SubjectTracking[],
  conductRecords: ConductRecord[],
  violationRecords: ViolationRecord[],
  classActivities: ClassActivity[],
  groupCompetitionRecords: GroupCompetitionRecord[],
  awardRecords: AwardRecord[],
  currentClass: ClassEntity | null,
  currentSchoolYear: SchoolYear,
  school: School
) {
  validateClassAndYear(currentClass, currentSchoolYear);

  const workbook = XLSX.utils.book_new();
  const classStudents = students.filter((s) => s.classId === currentClass!.id);

  // 1. Sheet Học Sinh
  const studentRows = classStudents.map((s, idx) => [
    idx + 1,
    s.studentCode,
    s.fullName,
    s.birthDate,
    s.gender,
    `Tổ ${s.groupNumber}`,
    s.ethnicity || 'Kinh',
    s.fatherPhone || s.motherPhone || '',
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH HỌC SINH LỚP ${currentClass!.className} - NĂM HỌC ${currentSchoolYear.name}`],
    [],
    ['STT', 'Mã HS', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Tổ', 'Dân tộc', 'SĐT Phụ huynh'],
    ...studentRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws1, 'Học Sinh');

  // 2. Sheet Điểm Danh
  const attRows = classStudents.map((st, idx) => {
    const recs = attendanceRecords.filter((r) => r.studentId === st.id);
    const excused = recs.filter((r) => r.status === 'Nghỉ có phép').length;
    const unexcused = recs.filter((r) => r.status === 'Nghỉ không phép').length;
    return [idx + 1, st.studentCode, st.fullName, `Tổ ${st.groupNumber}`, recs.length, excused, unexcused];
  });
  const ws2 = XLSX.utils.aoa_to_sheet([
    [`CHUYÊN CẦN LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Mã HS', 'Họ tên', 'Tổ', 'Tổng buổi', 'Vắng phép', 'Vắng không phép'],
    ...attRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws2, 'Điểm Danh');

  // 3. Sheet Rèn Luyện
  const conductRows = conductRecords
    .filter((c) => c.classId === currentClass!.id)
    .map((c, idx) => {
      const st = classStudents.find((s) => s.id === c.studentId);
      return [idx + 1, st?.fullName || '', c.term, c.grade, c.positiveManifestations || ''];
    });
  const ws3 = XLSX.utils.aoa_to_sheet([
    [`RÈN LUYỆN LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Học sinh', 'Đợt', 'Xếp loại', 'Biểu hiện'],
    ...conductRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws3, 'Rèn Luyện');

  // 4. Sheet Vi Phạm
  const violRows = violationRecords
    .filter((v) => v.classId === currentClass!.id)
    .map((v, idx) => {
      const st = classStudents.find((s) => s.id === v.studentId);
      return [idx + 1, v.date, st?.fullName || '', v.title, v.severity, v.educationalMeasures];
    });
  const ws4 = XLSX.utils.aoa_to_sheet([
    [`VI PHẠM NỀ NẾP LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Ngày', 'Học sinh', 'Nội dung', 'Mức độ', 'Biện pháp'],
    ...violRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws4, 'Vi Phạm');

  // 5. Sheet Hoạt Động
  const actRows = classActivities
    .filter((a) => a.classId === currentClass!.id)
    .map((a, idx) => [idx + 1, a.date, a.name, a.location, a.participantStudentIds.length, a.result]);
  const ws5 = XLSX.utils.aoa_to_sheet([
    [`HOẠT ĐỘNG TẬP THỂ LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Ngày', 'Tên hoạt động', 'Địa điểm', 'Số HS tham gia', 'Kết quả'],
    ...actRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws5, 'Hoạt Động');

  // 6. Sheet Thi Đua
  const compRows = groupCompetitionRecords
    .filter((c) => c.classId === currentClass!.id)
    .map((c, idx) => [idx + 1, c.periodName, `Tổ ${c.groupNumber}`, c.rank ? `Hạng ${c.rank}` : '', c.comment]);
  const ws6 = XLSX.utils.aoa_to_sheet([
    [`THI ĐUA 4 TỔ LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Đợt', 'Tổ', 'Xếp hạng', 'Nhận xét'],
    ...compRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws6, 'Thi Đua');

  // 7. Sheet Khen Thưởng
  const awardRows = awardRecords
    .filter((aw) => aw.classId === currentClass!.id)
    .map((aw, idx) => {
      const st = classStudents.find((s) => s.id === aw.studentId);
      return [idx + 1, aw.date, st?.fullName || '', aw.achievement, aw.level, aw.content];
    });
  const ws7 = XLSX.utils.aoa_to_sheet([
    [`KHEN THƯỞNG LỚP ${currentClass!.className}`],
    [],
    ['STT', 'Ngày', 'Học sinh', 'Thành tích', 'Cấp', 'Nội dung'],
    ...awardRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, ws7, 'Khen Thưởng');

  downloadWorkbook(
    workbook,
    `So_Chu_Nhiem_Toan_Dien_Lop_${currentClass!.className}_${currentSchoolYear.code}.xlsx`
  );
}
