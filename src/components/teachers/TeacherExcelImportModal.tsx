import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Info,
  Check,
  School,
  GraduationCap,
  Users,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  TeacherProfile,
  AcademicDegree,
  EmploymentStatus,
  AcademicDepartment,
} from '../../types';

interface TeacherExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    teachers: Array<Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ) => { added: number; errors: string[] };
  existingTeachers: TeacherProfile[];
  departments?: AcademicDepartment[];
}

interface ParsedTeacherRow {
  index: number;
  data: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
}

const DEPARTMENT_LIST = [
  'Tổ 1-2-3',
  'Tổ 4-5',
  'Tổ khoa học tự nhiên',
  'Tổ khoa học xã hội',
  'Tổ Tiếng Anh-GDTC',
];

const DEGREE_LIST: AcademicDegree[] = [
  'Thạc sĩ',
  'Cử nhân ĐH Sư phạm',
  'Cử nhân Đại học',
  'Cao đẳng Sư phạm',
  'Tiến sĩ',
];

const STATUS_LIST: EmploymentStatus[] = [
  'Biên chế chính thức',
  'Hợp đồng',
  'Thỉnh giảng',
  'Tập sự',
];

export const TeacherExcelImportModal: React.FC<TeacherExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingTeachers,
  departments = [],
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedTeacherRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'error'>('all');
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Clean and normalize strings for column header matching
  const normalizeKey = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Convert raw 2D row array or json to structured teacher objects
  const processRawDataRows = (rows: any[][]) => {
    if (!rows || rows.length < 2) {
      alert('Tập tin không có dữ liệu hoặc chỉ có tiêu đề. Vui lòng kiểm tra lại!');
      return;
    }

    const headerRow = rows[0].map((h: any) => normalizeKey(String(h || '')));
    const dataRows = rows.slice(1);

    // Map column indices
    const findCol = (possibleNames: string[]): number => {
      const normalizedTargets = possibleNames.map(normalizeKey);
      return headerRow.findIndex((h: string) =>
        normalizedTargets.some((target) => h.includes(target) || target.includes(h))
      );
    };

    const colCode = findCol(['magiaovien', 'magv', 'ma']);
    const colName = findCol(['hovaten', 'hoten', 'tengiaovien', 'ten']);
    const colGender = findCol(['gioitinh', 'phai']);
    const colBirth = findCol(['ngaysinh', 'namsinh']);
    const colPhone = findCol(['sodienthoai', 'dienthoai', 'sdt']);
    const colEmail = findCol(['email', 'thu']);
    const colIdCard = findCol(['cccd', 'cmnd', 'socccd', 'socmnd']);
    const colDept = findCol(['tochuyenmon', 'tobomon', 'to']);
    const colMainSub = findCol(['monchinh', 'mongiangday', 'mon']);
    const colSecSub = findCol(['monphu', 'mondaykem']);
    const colDegree = findCol(['trinhdo', 'bangcap', 'trinhdodaotao']);
    const colStatus = findCol(['hinhthucbienche', 'bienche', 'hopdong']);
    const colJoinDate = findCol(['ngayvaotruong', 'ngaycongsinh']);
    const colHomeroom = findCol(['chunhiemlop', 'lopchunhiem', 'chunhiem', 'lopcn']);
    const colDuty = findCol(['chucvu', 'nhiemvu']);
    const colNotes = findCol(['ghichu']);

    const existingCodeSet = new Set(
      existingTeachers.map((t) => t.teacherCode.trim().toLowerCase())
    );
    const inBatchCodes = new Set<string>();

    const results: ParsedTeacherRow[] = [];

    dataRows.forEach((row, idx) => {
      // Skip completely empty rows
      if (!row || row.every((c: any) => c === null || c === undefined || String(c).trim() === '')) {
        return;
      }

      const rowNum = idx + 2; // Row number in Excel (1-based, after header)
      const messages: string[] = [];
      let status: 'valid' | 'warning' | 'error' = 'valid';

      const rawName = colName !== -1 ? String(row[colName] || '').trim() : '';
      let rawCode = colCode !== -1 ? String(row[colCode] || '').trim() : '';
      const rawGender = colGender !== -1 ? String(row[colGender] || '').trim() : 'Nam';
      const rawBirth = colBirth !== -1 ? String(row[colBirth] || '').trim() : '';
      const rawPhone = colPhone !== -1 ? String(row[colPhone] || '').trim() : '';
      const rawEmail = colEmail !== -1 ? String(row[colEmail] || '').trim() : '';
      const rawIdCard = colIdCard !== -1 ? String(row[colIdCard] || '').trim() : '';
      const rawDept = colDept !== -1 ? String(row[colDept] || '').trim() : '';
      const rawMainSub = colMainSub !== -1 ? String(row[colMainSub] || '').trim() : '';
      const rawSecSub = colSecSub !== -1 ? String(row[colSecSub] || '').trim() : '';
      const rawDegree = colDegree !== -1 ? String(row[colDegree] || '').trim() : '';
      const rawStatus = colStatus !== -1 ? String(row[colStatus] || '').trim() : '';
      const rawJoinDate = colJoinDate !== -1 ? String(row[colJoinDate] || '').trim() : '';
      const rawHomeroom = colHomeroom !== -1 ? String(row[colHomeroom] || '').trim() : '';
      const rawDuty = colDuty !== -1 ? String(row[colDuty] || '').trim() : '';
      const rawNotes = colNotes !== -1 ? String(row[colNotes] || '').trim() : '';

      // Validation 1: Full name
      if (!rawName) {
        messages.push('Thiếu họ và tên giáo viên');
        status = 'error';
      }

      // Validation 2: Teacher Code
      if (!rawCode) {
        // Auto-generate code
        const genNumber = existingTeachers.length + results.length + 1;
        rawCode = `GV-${String(genNumber).padStart(3, '0')}`;
        messages.push(`Tự tạo mã "${rawCode}" do để trống`);
        if (status !== 'error') status = 'warning';
      } else {
        const lowerCode = rawCode.toLowerCase();
        if (existingCodeSet.has(lowerCode)) {
          messages.push(`Mã giáo viên "${rawCode}" đã tồn tại trong CSDL`);
          status = 'error';
        } else if (inBatchCodes.has(lowerCode)) {
          messages.push(`Mã giáo viên "${rawCode}" bị trùng lặp trong tập tin`);
          status = 'error';
        } else {
          inBatchCodes.add(lowerCode);
        }
      }

      // Gender normalization
      const normalizedGender =
        rawGender.toLowerCase().includes('nu') || rawGender.toLowerCase().includes('nữ')
          ? 'Nữ'
          : 'Nam';

      // Department normalization
      const activeDeptNames = departments.length > 0 ? departments.map((d) => d.name) : DEPARTMENT_LIST;
      let dept = activeDeptNames.find((d) =>
        normalizeKey(d).includes(normalizeKey(rawDept)) || normalizeKey(rawDept).includes(normalizeKey(d))
      );
      if (!dept) {
        dept = rawDept || activeDeptNames[0] || 'Tổ khoa học tự nhiên';
      }

      // Degree normalization
      let degree: AcademicDegree = 'Cử nhân ĐH Sư phạm';
      if (rawDegree) {
        const matched = DEGREE_LIST.find((deg) =>
          normalizeKey(deg).includes(normalizeKey(rawDegree)) || normalizeKey(rawDegree).includes(normalizeKey(deg))
        );
        if (matched) degree = matched;
      }

      // Employment Status normalization
      let employmentStatus: EmploymentStatus = 'Biên chế chính thức';
      if (rawStatus) {
        const matched = STATUS_LIST.find((st) =>
          normalizeKey(st).includes(normalizeKey(rawStatus)) || normalizeKey(rawStatus).includes(normalizeKey(st))
        );
        if (matched) employmentStatus = matched;
      }

      // Homeroom detection
      const isHomeroom =
        Boolean(rawHomeroom) &&
        rawHomeroom.toLowerCase() !== 'khong' &&
        rawHomeroom.toLowerCase() !== 'không' &&
        rawHomeroom !== '-';

      const homeroomClassName = isHomeroom ? rawHomeroom.replace(/^(lớp|lop)\s*/i, '').trim() : '';

      const teacherObj: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        teacherCode: rawCode,
        fullName: rawName,
        gender: normalizedGender,
        birthDate: rawBirth || '01/01/1990',
        email: rawEmail || `${rawCode.toLowerCase()}@thcs-nguyendinhanh.edu.vn`,
        phone: rawPhone || '0905123456',
        idCardNumber: rawIdCard,
        department: dept,
        mainSubject: rawMainSub || 'Toán',
        secondarySubject: rawSecSub || '',
        degree,
        employmentStatus,
        joinDate: rawJoinDate || '01/09/2020',
        isHomeroom,
        homeroomClassId: '',
        homeroomClassName,
        assignedClasses: homeroomClassName ? [homeroomClassName] : [],
        duty: rawDuty || (isHomeroom ? 'Giáo viên chủ nhiệm' : 'Giáo viên bộ môn'),
        notes: rawNotes,
      };

      if (status === 'valid' && messages.length === 0) {
        messages.push('Dữ liệu hợp lệ sẵn sàng thêm');
      }

      results.push({
        index: rowNum,
        data: teacherObj,
        status,
        messages,
      });
    });

    setParsedRows(results);
    setImportResult(null);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processRawDataRows(rows);
      } catch (err: any) {
        alert('Lỗi đọc tập tin: ' + (err.message || 'Không thể mở tập tin Excel'));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle raw text parsing (e.g. pasted from Excel / Google Sheets)
  const handleParseRawText = () => {
    if (!rawText.trim()) {
      alert('Vui lòng dán dữ liệu vào ô văn bản trước khi phân tích!');
      return;
    }

    const lines = rawText.trim().split(/\r?\n/);
    const rows = lines.map((line) => line.split(/\t|,|;/).map((c) => c.trim().replace(/^["']|["']$/g, '')));
    processRawDataRows(rows);
  };

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'STT',
      'Mã giáo viên',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'Số điện thoại',
      'Email',
      'Số CCCD/CMND',
      'Tổ chuyên môn',
      'Môn giảng dạy chính',
      'Môn phụ',
      'Trình độ đào tạo',
      'Hình thức biên chế',
      'Ngày vào trường',
      'Chủ nhiệm lớp',
      'Chức vụ',
      'Ghi chú',
    ];

    const sampleRow1 = [
      1,
      'GV-011',
      'Nguyễn Thanh Tùng',
      'Nam',
      '15/04/1988',
      '0905112233',
      'thanhtung.gv@gmail.com',
      '046088001234',
      'Tổ khoa học tự nhiên',
      'Toán',
      'Tin học',
      'Thạc sĩ',
      'Biên chế chính thức',
      '01/09/2015',
      '7/2',
      'Giáo viên chủ nhiệm',
      'Giáo viên dạy giỏi cấp Tỉnh',
    ];

    const sampleRow2 = [
      2,
      'GV-012',
      'Phan Thị Mai Lan',
      'Nữ',
      '22/10/1992',
      '0914556677',
      'mailan.phan@gmail.com',
      '046092005678',
      'Tổ khoa học xã hội',
      'Ngữ văn',
      'Lịch sử',
      'Cử nhân ĐH Sư phạm',
      'Biên chế chính thức',
      '01/09/2018',
      '8/1',
      'Giáo viên chủ nhiệm',
      'Bồi dưỡng học sinh giỏi Văn',
    ];

    const sampleRow3 = [
      3,
      'GV-013',
      'Lê Quốc Hưng',
      'Nam',
      '08/03/1995',
      '0988776655',
      'quochung.le@gmail.com',
      '046095009988',
      'Tổ khoa học tự nhiên',
      'Khoa học tự nhiên',
      'Hóa học',
      'Cử nhân Đại học',
      'Hợp đồng',
      '01/09/2021',
      '',
      'Giáo viên bộ môn',
      'Phụ trách phòng thực hành Lý - Hóa',
    ];

    const sampleRow4 = [
      4,
      'GV-014',
      'Trần Thị Hoàng Yến',
      'Nữ',
      '12/07/1994',
      '0935998877',
      'hoangyen.tran@gmail.com',
      '046094007766',
      'Tổ Tiếng Anh-GDTC',
      'Tiếng Anh',
      '',
      'Thạc sĩ',
      'Biên chế chính thức',
      '01/09/2019',
      '6/1',
      'Tổ phó chuyên môn',
      'Chứng chỉ IELTS 7.5',
    ];

    const aoa = [headers, sampleRow1, sampleRow2, sampleRow3, sampleRow4];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã GV
      { wch: 24 }, // Họ tên
      { wch: 10 }, // Giới tính
      { wch: 14 }, // Ngày sinh
      { wch: 15 }, // SĐT
      { wch: 26 }, // Email
      { wch: 16 }, // CCCD
      { wch: 22 }, // Tổ
      { wch: 20 }, // Môn chính
      { wch: 15 }, // Môn phụ
      { wch: 22 }, // Trình độ
      { wch: 20 }, // Biên chế
      { wch: 15 }, // Ngày vào
      { wch: 14 }, // Chủ nhiệm
      { wch: 22 }, // Chức vụ
      { wch: 30 }, // Ghi chú
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Giao_Vien');
    XLSX.writeFile(wb, 'Mau_Nhap_Ho_So_Giao_Vien_THCS.xlsx');
  };

  // Download Sample CSV
  const handleDownloadCsvTemplate = () => {
    const headers = [
      'STT',
      'Mã giáo viên',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh',
      'Số điện thoại',
      'Email',
      'Số CCCD/CMND',
      'Tổ chuyên môn',
      'Môn giảng dạy chính',
      'Môn phụ',
      'Trình độ đào tạo',
      'Hình thức biên chế',
      'Ngày vào trường',
      'Chủ nhiệm lớp',
      'Chức vụ',
      'Ghi chú',
    ];

    const sampleRow1 = [
      1,
      'GV-011',
      'Nguyễn Thanh Tùng',
      'Nam',
      '15/04/1988',
      '0905112233',
      'thanhtung.gv@gmail.com',
      '046088001234',
      'Tổ khoa học tự nhiên',
      'Toán',
      'Tin học',
      'Thạc sĩ',
      'Biên chế chính thức',
      '01/09/2015',
      '7/2',
      'Giáo viên chủ nhiệm',
      'Giáo viên dạy giỏi cấp Tỉnh',
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(','), sampleRow1.join(',')].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Nhap_Ho_So_Giao_Vien.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Perform Final Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.status === 'valid' || r.status === 'warning');
    if (validRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để thêm!');
      return;
    }

    const payload = validRows.map((r) => r.data);
    const result = onImport(payload);

    setImportResult(result);
  };

  const validCount = parsedRows.filter((r) => r.status === 'valid' || r.status === 'warning').length;
  const errorCount = parsedRows.filter((r) => r.status === 'error').length;

  const displayedRows = parsedRows.filter((r) => {
    if (filterStatus === 'valid') return r.status === 'valid' || r.status === 'warning';
    if (filterStatus === 'error') return r.status === 'error';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Nhập Hồ Sơ Giáo Viên Từ File Excel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 uppercase">
                  Dành cho Quản trị viên
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Thêm đồng loạt cán bộ, giáo viên từ tập tin Excel (.xlsx, .xls) hoặc CSV với tính năng đối soát và tự sinh mã tự động
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal / Result View if imported */}
        {importResult ? (
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Nhập danh sách giáo viên thành công!
              </h3>
              <p className="text-xs text-slate-600">
                Đã thêm thành công <strong>{importResult.added}</strong> giáo viên mới vào hệ thống dữ liệu nhân sự của trường.
              </p>
            </div>

            {importResult.errors.length > 0 && (
              <div className="text-left bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Các dòng bị bỏ qua hoặc có cảnh báo ({importResult.errors.length}):
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px]">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setImportResult(null);
                  setParsedRows([]);
                  setFileName(null);
                  setRawText('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Nhập thêm file khác
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Template download & mode selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Instructions & Template Download Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-50 p-5 rounded-3xl border border-purple-100 space-y-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-900">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>Hướng dẫn & File mẫu</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Để hệ thống nhận diện chính xác các cột thông tin, vui lòng tải tập tin Excel mẫu chuẩn dưới đây và điền thông tin giáo viên:
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleDownloadExcelTemplate}
                    className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Tải file mẫu Excel (.xlsx)
                  </button>

                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-purple-800 border border-purple-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5" /> Tải file mẫu định dạng .CSV
                  </button>
                </div>

                <div className="pt-2 border-t border-purple-100 text-[10px] text-slate-500 space-y-1">
                  <div>• <strong>Bắt buộc:</strong> Họ và tên giáo viên.</div>
                  <div>• <strong>Mã GV:</strong> Để trống hệ thống sẽ tự sinh mã tiếp theo (GV-xxx).</div>
                  <div>• <strong>Chủ nhiệm:</strong> Điền tên lớp (VD: 7/1) để gán lớp chủ nhiệm tự động.</div>
                </div>
              </div>

              {/* Upload Input & Paste Panel */}
              <div className="md:col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'upload'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Tải lên tập tin (.xlsx, .csv)
                    </button>
                    <button
                      onClick={() => setActiveTab('paste')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'paste'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Dán trực tiếp từ bảng tính
                    </button>
                  </div>

                  {fileName && (
                    <span className="text-[11px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-bold truncate max-w-[180px]">
                      {fileName}
                    </span>
                  )}
                </div>

                {activeTab === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Nhấp để chọn file Excel (.xlsx, .xls) hoặc .CSV từ máy tính
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Hỗ trợ kéo và thả tập tin trực tiếp vào đây
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Sao chép các dòng từ Excel hoặc Google Sheets rồi dán (Ctrl+V) vào đây..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                    <button
                      onClick={handleParseRawText}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Phân tích dữ liệu vừa dán
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Data Review & Verification Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      Kết quả phân tích ({parsedRows.length} dòng):
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {validCount} dòng hợp lệ
                    </span>
                    {errorCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        {errorCount} dòng có lỗi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 text-[11px]">Lọc hiển thị:</span>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        filterStatus === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Tất cả ({parsedRows.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('valid')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        filterStatus === 'valid'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Hợp lệ ({validCount})
                    </button>
                    {errorCount > 0 && (
                      <button
                        onClick={() => setFilterStatus('error')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          filterStatus === 'error'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Có lỗi ({errorCount})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Dòng</th>
                        <th className="py-2.5 px-3">Mã GV</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Giới tính</th>
                        <th className="py-2.5 px-3">Tổ chuyên môn</th>
                        <th className="py-2.5 px-3">Môn chính</th>
                        <th className="py-2.5 px-3">Trình độ</th>
                        <th className="py-2.5 px-3">Chủ nhiệm</th>
                        <th className="py-2.5 px-3">Trạng thái đối soát</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {displayedRows.map((row) => (
                        <tr
                          key={row.index}
                          className={`hover:bg-slate-50 transition-colors ${
                            row.status === 'error'
                              ? 'bg-rose-50/40'
                              : row.status === 'warning'
                              ? 'bg-amber-50/40'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">
                            #{row.index}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {row.data.teacherCode}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {row.data.fullName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{row.data.gender}</td>
                          <td className="py-2.5 px-3 text-slate-700">{row.data.department}</td>
                          <td className="py-2.5 px-3 font-bold text-purple-900">
                            {row.data.mainSubject}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{row.data.degree}</td>
                          <td className="py-2.5 px-3">
                            {row.data.isHomeroom ? (
                              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                                Lớp {row.data.homeroomClassName}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-col gap-0.5">
                              {row.status === 'valid' && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hợp lệ
                                </span>
                              )}
                              {row.status === 'warning' && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Lưu ý
                                </span>
                              )}
                              {row.status === 'error' && (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Lỗi dữ liệu
                                </span>
                              )}
                              {row.messages.map((m, mi) => (
                                <span
                                  key={mi}
                                  className={`text-[10px] ${
                                    row.status === 'error'
                                      ? 'text-rose-600 font-semibold'
                                      : row.status === 'warning'
                                      ? 'text-amber-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-500 text-[11px]">
                {parsedRows.length > 0 ? (
                  <span>
                    Sẵn sàng thêm <strong>{validCount}</strong> giáo viên vào cơ sở dữ liệu trường học.
                  </span>
                ) : (
                  <span>Vui lòng tải lên file Excel mẫu để tiến hành đối soát.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={validCount === 0 || isProcessing}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    validCount > 0 && !isProcessing
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Thực hiện thêm vào hệ thống ({validCount} GV)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
