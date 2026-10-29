import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Users,
  Shield,
  KeyRound,
  RefreshCw,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  User,
  DutyRole,
  AccountStatus,
  DEPARTMENT_OPTIONS,
  SUBJECT_OPTIONS,
  DUTY_ROLE_OPTIONS,
} from '../../types';

interface UserExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

interface ParsedAccountRow {
  index: number;
  data: {
    name: string;
    email: string;
    username: string;
    department: string;
    subject: string;
    dutyRole: DutyRole;
    phone: string;
    password: string;
    status: AccountStatus;
    homeroomClassName: string;
  };
  status: 'valid' | 'warning' | 'error';
  messages: string[];
}

export const UserExcelImportModal: React.FC<UserExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { users, classes, importUserAccounts } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedAccountRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState<'skip_existing' | 'update_existing'>('skip_existing');
  const [autoCreateTeacherProfile, setAutoCreateTeacherProfile] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [importResult, setImportResult] = useState<{
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Normalization helper
  const normalizeKey = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const parseExcel = async (selectedFile: File) => {
    setIsProcessing(true);
    setParsedRows([]);
    setImportResult(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        alert('File không chứa dữ liệu hoặc bảng tính trống!');
        setIsProcessing(false);
        return;
      }

      // Existing email & username sets for quick lookup
      const existingEmails = new Map<string, User>();
      users.forEach((u) => {
        if (u.email) existingEmails.set(u.email.toLowerCase().trim(), u);
        if (u.username) existingEmails.set(u.username.toLowerCase().trim(), u);
      });

      const parsed: ParsedAccountRow[] = [];
      const seenFileEmails = new Set<string>();

      rawJson.forEach((row, idx) => {
        const rowNum = idx + 1;
        const keys = Object.keys(row);

        const findVal = (terms: string[]): string => {
          for (const key of keys) {
            const normKey = normalizeKey(key);
            if (terms.some((term) => normKey.includes(term))) {
              return String(row[key]).trim();
            }
          }
          return '';
        };

        const rawName = findVal(['hoten', 'ten', 'fullname', 'nguoidung', 'giaovien']);
        const rawEmail = findVal(['email', 'mail', 'tendangnhap', 'username', 'taikhoan']);
        const rawDept = findVal(['tochuyenmon', 'bophan', 'to', 'dept', 'department']);
        const rawSubject = findVal(['bomon', 'mon', 'monhoc', 'subject']);
        const rawRole = findVal(['vaitro', 'chucdanh', 'chucvu', 'role', 'duty']);
        const rawPhone = findVal(['sdt', 'dienthoai', 'phone', 'didong']);
        const rawPass = findVal(['matkhau', 'password', 'pass', 'mk']);
        const rawStatus = findVal(['trangthai', 'status']);
        const rawClass = findVal(['lopchunhiem', 'lop', 'class', 'homeroom']);

        // Check if entirely empty row
        if (!rawName && !rawEmail && !rawDept && !rawSubject) {
          return;
        }

        const messages: string[] = [];
        let status: 'valid' | 'warning' | 'error' = 'valid';

        // 1. Name validation
        if (!rawName) {
          messages.push('Thiếu họ và tên người dùng');
          status = 'error';
        }

        // 2. Email validation
        let cleanEmail = rawEmail.toLowerCase().trim();
        if (!cleanEmail) {
          messages.push('Thiếu email đăng nhập');
          status = 'error';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(cleanEmail)) {
            messages.push(`Email "${cleanEmail}" không hợp lệ`);
            status = 'error';
          }
        }

        // Check duplicate within the same file
        if (cleanEmail) {
          if (seenFileEmails.has(cleanEmail)) {
            messages.push(`Email trùng lặp trong chính file nhập`);
            status = 'error';
          } else {
            seenFileEmails.add(cleanEmail);
          }
        }

        // 3. Department normalization matching the 5 departments
        let dept = 'Tổ khoa học tự nhiên';
        if (rawDept) {
          const normD = rawDept.toLowerCase();
          if (normD.includes('1') || normD.includes('2') || normD.includes('3')) {
            dept = 'Tổ 1-2-3';
          } else if (normD.includes('4') || normD.includes('5')) {
            dept = 'Tổ 4-5';
          } else if (
            normD.includes('tieng anh') ||
            normD.includes('ngoai ngu') ||
            normD.includes('gdtc') ||
            normD.includes('the chat') ||
            normD.includes('nghe thuat') ||
            normD.includes('am nhac') ||
            normD.includes('my thuat') ||
            normD.includes('doi')
          ) {
            dept = 'Tổ Tiếng Anh-GDTC';
          } else if (
            normD.includes('xa hoi') ||
            normD.includes('khxh') ||
            normD.includes('van') ||
            normD.includes('su') ||
            normD.includes('dia') ||
            normD.includes('gdcd')
          ) {
            dept = 'Tổ khoa học xã hội';
          } else {
            dept = 'Tổ khoa học tự nhiên';
          }
        }

        // 4. Subject matching
        let subject = '—';
        if (rawSubject) {
          const matchedSub = SUBJECT_OPTIONS.find((s) =>
            normalizeKey(s).includes(normalizeKey(rawSubject)) ||
            normalizeKey(rawSubject).includes(normalizeKey(s))
          );
          subject = matchedSub || rawSubject;
        }

        // 5. Duty Role matching
        let dutyRole: DutyRole = 'Giáo viên bộ môn';
        if (rawRole) {
          const normR = rawRole.toLowerCase();
          if (normR.includes('quan tri') || normR.includes('admin') || normR.includes('cntt')) {
            dutyRole = 'Quản trị viên';
          } else if (normR.includes('pho hieu truong') || normR.includes('pht')) {
            dutyRole = 'Phó Hiệu trưởng';
          } else if (normR.includes('hieu truong') || normR.includes('ht') || normR.includes('bgh')) {
            dutyRole = 'Hiệu trưởng';
          } else if (normR.includes('to pho')) {
            dutyRole = 'Tổ phó';
          } else if (normR.includes('to truong')) {
            dutyRole = 'Tổ trưởng';
          } else if (normR.includes('chu nhiem') || normR.includes('gvcn')) {
            dutyRole = 'Giáo viên chủ nhiệm';
          } else if (normR.includes('nhan vien') || normR.includes('ke toan') || normR.includes('van thu') || normR.includes('y te')) {
            dutyRole = 'Nhân viên';
          }
        }

        // 6. Account Status
        let accStatus: AccountStatus = 'active';
        if (rawStatus) {
          const normS = rawStatus.toLowerCase();
          if (normS.includes('khoa') || normS.includes('locked')) {
            accStatus = 'locked';
          } else if (normS.includes('chua') || normS.includes('pending')) {
            accStatus = 'pending';
          }
        }

        // 7. Password
        const password = rawPass || '123';

        // 8. Homeroom class
        let homeroomClassName = rawClass;
        if (dutyRole === 'Giáo viên chủ nhiệm' && !homeroomClassName) {
          messages.push('Chưa điền lớp chủ nhiệm (có thể phân công sau)');
        }

        // Check if email already exists in system database
        if (cleanEmail && existingEmails.has(cleanEmail)) {
          const existingUser = existingEmails.get(cleanEmail)!;
          if (status !== 'error') {
            status = 'warning';
            messages.push(`Email đã tồn tại (${existingUser.name}). Tuỳ chọn: Bỏ qua hoặc Cập nhật`);
          }
        }

        parsed.push({
          index: rowNum,
          data: {
            name: rawName,
            email: cleanEmail,
            username: cleanEmail,
            department: dept,
            subject,
            dutyRole,
            phone: rawPhone,
            password,
            status: accStatus,
            homeroomClassName,
          },
          status,
          messages,
        });
      });

      setParsedRows(parsed);
      setFile(selectedFile);
    } catch (err) {
      console.error(err);
      alert('Không thể đọc file Excel! Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseExcel(e.target.files[0]);
    }
  };

  const handleDownloadTemplateXlsx = () => {
    const headers = [
      'STT',
      'Họ và tên (*)',
      'Email / Tên đăng nhập (*)',
      'Tổ chuyên môn / bộ phận',
      'Bộ môn',
      'Vai trò',
      'Số điện thoại',
      'Mật khẩu khởi tạo',
      'Trạng thái',
      'Lớp chủ nhiệm',
    ];

    const sampleRow1 = [
      1,
      'Nguyễn Văn A',
      'nguyenvana@nguyendinhanh.edu.vn',
      'Tổ 1-2-3',
      'Toán (Tiểu học)',
      'Tổ trưởng',
      '0905123456',
      '123',
      'Hoạt động',
      '3/1',
    ];

    const sampleRow2 = [
      2,
      'Trần Thị B',
      'tranthib@nguyendinhanh.edu.vn',
      'Tổ 4-5',
      'Tiếng Việt (Tiểu học)',
      'Giáo viên chủ nhiệm',
      '0912345678',
      '123',
      'Hoạt động',
      '5/2',
    ];

    const sampleRow3 = [
      3,
      'Lê Hoàng Nam',
      'hoangnam.le@nguyendinhanh.edu.vn',
      'Tổ khoa học tự nhiên',
      'Toán',
      'Giáo viên bộ môn',
      '0988776655',
      '123',
      'Hoạt động',
      '',
    ];

    const sampleRow4 = [
      4,
      'Phạm Thu Hà',
      'thuha.pham@nguyendinhanh.edu.vn',
      'Tổ khoa học xã hội',
      'Ngữ văn',
      'Tổ phó',
      '0935112233',
      '123',
      'Hoạt động',
      '8/1',
    ];

    const sampleRow5 = [
      5,
      'Đặng Quốc Tuấn',
      'quoctuan.dang@nguyendinhanh.edu.vn',
      'Tổ Tiếng Anh-GDTC',
      'Tiếng Anh',
      'Giáo viên bộ môn',
      '0909888999',
      '123',
      'Hoạt động',
      '',
    ];

    const sampleRow6 = [
      6,
      'Trần Minh Đức',
      'ducminh.admin@nguyendinhanh.edu.vn',
      'Tổ khoa học tự nhiên',
      'Tin học',
      'Quản trị viên',
      '0977665544',
      'Admin@2026',
      'Hoạt động',
      '',
    ];

    const aoa = [
      headers,
      sampleRow1,
      sampleRow2,
      sampleRow3,
      sampleRow4,
      sampleRow5,
      sampleRow6,
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 24 }, // Họ tên
      { wch: 34 }, // Email
      { wch: 24 }, // Tổ
      { wch: 22 }, // Bộ môn
      { wch: 22 }, // Vai trò
      { wch: 15 }, // SĐT
      { wch: 18 }, // Mật khẩu
      { wch: 16 }, // Trạng thái
      { wch: 16 }, // Lớp chủ nhiệm
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Tai_Khoan');
    XLSX.writeFile(wb, 'Mau_Them_Moi_Tai_Khoan_Nha_Truong.xlsx');
  };

  const handleDownloadTemplateCsv = () => {
    const headers = [
      'STT',
      'Họ và tên (*)',
      'Email / Tên đăng nhập (*)',
      'Tổ chuyên môn / bộ phận',
      'Bộ môn',
      'Vai trò',
      'Số điện thoại',
      'Mật khẩu khởi tạo',
      'Trạng thái',
      'Lớp chủ nhiệm',
    ];

    const sampleRow1 = [
      1,
      'Nguyễn Văn A',
      'nguyenvana@nguyendinhanh.edu.vn',
      'Tổ 1-2-3',
      'Toán (Tiểu học)',
      'Tổ trưởng',
      '0905123456',
      '123',
      'Hoạt động',
      '3/1',
    ];

    const csvContent =
      '\uFEFF' + [headers.join(','), sampleRow1.join(',')].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Them_Moi_Tai_Khoan_Nha_Truong.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    const eligibleRows = parsedRows.filter((r) => r.status !== 'error');
    if (eligibleRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập!');
      return;
    }

    const payload = eligibleRows.map((r) => r.data);
    const result = importUserAccounts(payload, strategy, autoCreateTeacherProfile);

    setImportResult(result);
    if (onSuccess) {
      onSuccess(result.message);
    }
  };

  // Filtered preview rows
  const displayedRows = parsedRows.filter((r) => {
    if (filterStatus === 'valid' && r.status !== 'valid') return false;
    if (filterStatus === 'warning' && r.status !== 'warning') return false;
    if (filterStatus === 'error' && r.status !== 'error') return false;

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      const match =
        r.data.name.toLowerCase().includes(s) ||
        r.data.email.toLowerCase().includes(s) ||
        r.data.department.toLowerCase().includes(s) ||
        r.data.dutyRole.toLowerCase().includes(s) ||
        r.data.subject.toLowerCase().includes(s);
      if (!match) return false;
    }

    return true;
  });

  const totalParsed = parsedRows.length;
  const validCount = parsedRows.filter((r) => r.status === 'valid').length;
  const warningCount = parsedRows.filter((r) => r.status === 'warning').length;
  const errorCount = parsedRows.filter((r) => r.status === 'error').length;
  const readyCount = validCount + (strategy === 'update_existing' ? warningCount : 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in duration-150 my-auto text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Thêm Mới Tài Khoản Bằng File Excel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-200 uppercase">
                  Dành cho Quản trị viên
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập hàng loạt tài khoản người dùng với cấu trúc chuẩn: Họ tên, Email (đăng nhập), Tổ chuyên môn (5 tổ), Bộ môn, Vai trò, Mật khẩu
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

        {/* Success / Result Screen */}
        {importResult ? (
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Nhập danh sách tài khoản thành công!
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                {importResult.message}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Thêm mới</div>
                <div className="text-xl font-black text-emerald-600">{importResult.createdCount}</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Cập nhật</div>
                <div className="text-xl font-black text-sky-600">{importResult.updatedCount}</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Bỏ qua</div>
                <div className="text-xl font-black text-amber-600">{importResult.skippedCount}</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left max-h-40 overflow-y-auto space-y-1">
                <div className="font-bold text-rose-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Các dòng bị bỏ qua do lỗi:
                </div>
                {importResult.errors.map((err, i) => (
                  <div key={i} className="text-rose-700 text-[11px]">
                    • {err}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImportResult(null);
                  setParsedRows([]);
                  setFile(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Nhập thêm file khác
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Topbar: Download Template & Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  Chuẩn bị file dữ liệu tài khoản theo mẫu chuẩn của nhà trường
                </div>
                <div className="text-[11px] text-slate-500">
                  Hỗ trợ định dạng Excel (.xlsx, .xls) hoặc CSV. Hệ thống tự động phân vai trò (Quản trị viên, BGH, GVCN, Bộ môn) và liên kết hồ sơ giáo viên.
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadTemplateXlsx}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" /> Tải mẫu Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Tải mẫu CSV
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 ${
                file
                  ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                  : 'border-slate-300 hover:border-sky-500 bg-slate-50/50 hover:bg-sky-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{file.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      {(file.size / 1024).toFixed(1)} KB • Đã đọc được{' '}
                      <strong className="text-emerald-700">{totalParsed}</strong> dòng
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setParsedRows([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer pt-1"
                  >
                    Chọn file khác
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Kéo thả file Excel vào đây hoặc click để chọn file
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Hỗ trợ tập tin .xlsx, .xls, .csv (Dung lượng tối đa 15MB)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conflict Resolution & Auto-link Options */}
            {parsedRows.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Cấu hình xử lý khi nhập dữ liệu
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-400">
                    <input
                      type="radio"
                      name="import_strategy"
                      checked={strategy === 'skip_existing'}
                      onChange={() => setStrategy('skip_existing')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Bỏ qua nếu email đã tồn tại</div>
                      <div className="text-[11px] text-slate-500">
                        Giữ nguyên tài khoản cũ, chỉ thêm mới các tài khoản chưa có trong hệ thống.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-400">
                    <input
                      type="radio"
                      name="import_strategy"
                      checked={strategy === 'update_existing'}
                      onChange={() => setStrategy('update_existing')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Cập nhật nếu email đã tồn tại</div>
                      <div className="text-[11px] text-slate-500">
                        Ghi đè họ tên, tổ chuyên môn, bộ môn, vai trò và mật khẩu mới cho tài khoản cũ.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCreateTeacherProfile}
                      onChange={(e) => setAutoCreateTeacherProfile(e.target.checked)}
                      className="rounded-sm text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-700">
                      Tự động tạo hồ sơ giáo viên trong danh sách nhân sự nếu chưa có
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-500">
                    5 tổ chuyên môn chuẩn: <strong>Tổ 1-2-3, Tổ 4-5, Tổ KHTN, Tổ KHXH, Tổ Tiếng Anh-GDTC</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Data Validation & Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                {/* Stats summary & filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả ({totalParsed})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('valid')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        filterStatus === 'valid'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      Hợp lệ ({validCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('warning')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        filterStatus === 'warning'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      Cảnh báo ({warningCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('error')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        filterStatus === 'error'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      Lỗi ({errorCount})
                    </button>
                  </div>

                  <div className="relative max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm dòng xem trước..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Trạng thái dòng</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Email (Đăng nhập)</th>
                        <th className="py-2.5 px-3">Tổ chuyên môn</th>
                        <th className="py-2.5 px-3">Bộ môn</th>
                        <th className="py-2.5 px-3">Vai trò</th>
                        <th className="py-2.5 px-3">Mật khẩu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Không tìm thấy dòng dữ liệu nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => (
                          <tr
                            key={row.index}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              row.status === 'error'
                                ? 'bg-rose-50/30'
                                : row.status === 'warning'
                                ? 'bg-amber-50/20'
                                : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-mono">
                              {row.index}
                            </td>
                            <td className="py-2 px-3">
                              {row.status === 'valid' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <Check className="w-3 h-3" /> Hợp lệ
                                </span>
                              ) : row.status === 'warning' ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
                                  title={row.messages.join('; ')}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {strategy === 'skip_existing' ? 'Sẽ bỏ qua' : 'Sẽ cập nhật'}
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800"
                                  title={row.messages.join('; ')}
                                >
                                  <AlertCircle className="w-3 h-3" /> {row.messages[0] || 'Lỗi'}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">{row.data.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{row.data.email}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-medium text-[10px]">
                                {row.data.department}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-700">{row.data.subject}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md font-semibold text-[10px]">
                                {row.data.dutyRole}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-500">
                              {row.data.password}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={isProcessing || parsedRows.length === 0 || readyCount === 0}
                onClick={handleExecuteImport}
                className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  isProcessing || parsedRows.length === 0 || readyCount === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20'
                }`}
              >
                <Check className="w-4 h-4" />
                Xác nhận thêm {readyCount} tài khoản vào hệ thống
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
