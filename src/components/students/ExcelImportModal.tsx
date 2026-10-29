import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Users,
  Search,
  Check,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    students: Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>,
    strategy?: 'skip_existing' | 'update_existing'
  ) => {
    added: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  existingCodes?: string[];
  currentClassId: string;
  currentSchoolYearId: string;
}

interface ParsedStudentRow {
  index: number;
  data: Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>;
  targetClassName: string;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentClassId,
  currentSchoolYearId,
}) => {
  const { classes, currentClass, students, currentUser } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.dutyRole === 'Quản trị viên';

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>(
    currentClassId || currentClass?.id || (classes[0]?.id || '')
  );
  const [classAssignmentMode, setClassAssignmentMode] = useState<'fixed' | 'from_file'>('fixed');
  const [strategy, setStrategy] = useState<'skip_existing' | 'update_existing'>('skip_existing');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [importResult, setImportResult] = useState<{
    added: number;
    updated: number;
    skipped: number;
    errors: string[];
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

  const formatBirthDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      // Excel serial date number
      const date = new Date((val - (25567 + 2)) * 86400 * 1000);
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(val).trim();
    // YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
      return `${isoMatch[3].padStart(2, '0')}/${isoMatch[2].padStart(2, '0')}/${isoMatch[1]}`;
    }
    // DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[1].padStart(2, '0')}/${dmyMatch[2].padStart(2, '0')}/${dmyMatch[3]}`;
    }
    return str;
  };

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

      // Existing student codes
      const existingCodeMap = new Map<string, Student>();
      students.forEach((s) => existingCodeMap.set(s.studentCode.trim().toLowerCase(), s));

      // Classes map by name
      const classNameMap = new Map<string, string>();
      classes.forEach((c) => {
        classNameMap.set(c.className.toLowerCase().trim(), c.id);
        classNameMap.set(c.className.toLowerCase().replace(/[^0-9]/g, ''), c.id);
      });

      const parsed: ParsedStudentRow[] = [];
      const seenFileCodes = new Set<string>();

      rawJson.forEach((row, idx) => {
        const rowNum = idx + 1;
        const keys = Object.keys(row);

        const findVal = (terms: string[]): any => {
          for (const key of keys) {
            const normKey = normalizeKey(key);
            if (terms.some((term) => normKey.includes(term))) {
              return row[key];
            }
          }
          return '';
        };

        const rawCode = String(findVal(['mahocsinh', 'mahs', 'masohs', 'maso', 'code', 'studentcode']) || '').trim();
        const rawName = String(findVal(['hoten', 'tenhocsinh', 'ten', 'fullname', 'hocsinh']) || '').trim();
        const rawBirthDate = findVal(['ngaysinh', 'birthdate', 'dob', 'ngaythangnamsinh']);
        const rawGender = String(findVal(['gioitinh', 'phai', 'gender', 'sex']) || '').trim();
        const rawClass = String(findVal(['lop', 'lopchuyenmon', 'class', 'classname']) || '').trim();
        const rawEthnicity = String(findVal(['dantoc', 'ethnicity']) || '').trim();
        const rawGroup = String(findVal(['to', 'group', 'tohocsinh']) || '').trim();
        const rawAddress = String(findVal(['thuongtru', 'diachi', 'address', 'diachithuongtru']) || '').trim();
        const rawResidence = String(findVal(['noio', 'hientai', 'residence', 'tamvat']) || '').trim();
        const rawPhone = String(findVal(['sdt', 'dienthoai', 'phone', 'didong']) || '').trim();
        const rawFather = String(findVal(['cha', 'bo', 'hotencha', 'father']) || '').trim();
        const rawFatherPhone = String(findVal(['sdtcha', 'dienthoaicha', 'phonecha']) || '').trim();
        const rawMother = String(findVal(['me', 'hotenme', 'mother']) || '').trim();
        const rawMotherPhone = String(findVal(['sdtme', 'dienthoaime', 'phoneme']) || '').trim();
        const rawAbility = String(findVal(['nangluc', 'diemmanh', 'ability']) || '').trim();
        const rawTalent = String(findVal(['nangkheo', 'talent', 'nangkhieu']) || '').trim();
        const rawSupport = String(findVal(['canhotro', 'hotro', 'support']) || '').trim();
        const rawPoor = String(findVal(['hongheo', 'canngheo', 'poor']) || '').trim();

        // Check if entirely empty row
        if (!rawCode && !rawName && !rawBirthDate) {
          return;
        }

        const messages: string[] = [];
        let status: 'valid' | 'warning' | 'error' = 'valid';

        // 1. Full name validation
        if (!rawName) {
          messages.push('Thiếu họ và tên học sinh');
          status = 'error';
        }

        // 2. Birth date validation
        const birthDate = formatBirthDate(rawBirthDate);
        if (!birthDate) {
          messages.push('Thiếu ngày sinh');
          status = 'error';
        } else {
          const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
          if (!dateRegex.test(birthDate)) {
            messages.push(`Ngày sinh "${birthDate}" không đúng định dạng (DD/MM/YYYY)`);
            status = 'error';
          }
        }

        // 3. Gender validation
        let gender: 'Nam' | 'Nữ' = 'Nam';
        const cleanG = rawGender.toLowerCase();
        if (cleanG.includes('nu') || cleanG.includes('nữ') || cleanG === 'f') {
          gender = 'Nữ';
        } else {
          gender = 'Nam';
        }

        // 4. Target Class Assignment
        let targetClassId = selectedTargetClassId;
        let displayClassName =
          classes.find((c) => c.id === selectedTargetClassId)?.className || 'Lớp hiện tại';

        if (classAssignmentMode === 'from_file' && rawClass) {
          const matchedClassId =
            classNameMap.get(rawClass.toLowerCase().trim()) ||
            classNameMap.get(rawClass.toLowerCase().replace(/[^0-9]/g, ''));
          if (matchedClassId) {
            targetClassId = matchedClassId;
            displayClassName = classes.find((c) => c.id === matchedClassId)?.className || rawClass;
          } else {
            messages.push(`Không tìm thấy lớp "${rawClass}" trong trường`);
            status = 'error';
          }
        }

        // 5. Student Code (Auto-generate if empty)
        let studentCode = rawCode;
        if (!studentCode) {
          const targetClassObj = classes.find((c) => c.id === targetClassId);
          const gradeNum = targetClassObj?.grade || '7';
          studentCode = `2026${gradeNum}${String(idx + 1).padStart(3, '0')}`;
          messages.push(`Tự động sinh mã học sinh: ${studentCode}`);
        }

        // Check duplicate within file
        if (studentCode) {
          if (seenFileCodes.has(studentCode.toLowerCase())) {
            messages.push(`Mã học sinh "${studentCode}" trùng lặp trong tệp nhập`);
            status = 'error';
          } else {
            seenFileCodes.add(studentCode.toLowerCase());
          }
        }

        // Check duplicate with existing database
        if (studentCode && existingCodeMap.has(studentCode.toLowerCase())) {
          const existingSt = existingCodeMap.get(studentCode.toLowerCase())!;
          if (status !== 'error') {
            status = 'warning';
            messages.push(`Mã đã tồn tại (${existingSt.fullName}). Tuỳ chọn: Bỏ qua hoặc Cập nhật`);
          }
        }

        // 6. Group number (1 - 4)
        let groupNum = 1;
        const parsedGroup = parseInt(rawGroup);
        if (!isNaN(parsedGroup) && parsedGroup >= 1 && parsedGroup <= 4) {
          groupNum = parsedGroup;
        }

        const isPoor =
          rawPoor.toLowerCase().includes('co') ||
          rawPoor.toLowerCase().includes('ngheo') ||
          rawPoor === 'x';
        const needsSup =
          rawSupport.toLowerCase().includes('co') ||
          rawSupport.toLowerCase().includes('can') ||
          rawSupport === 'x';

        parsed.push({
          index: rowNum,
          data: {
            classId: targetClassId,
            schoolYearId: currentSchoolYearId,
            studentCode,
            fullName: rawName,
            birthDate,
            gender,
            ethnicity: rawEthnicity || 'Kinh',
            address: rawAddress || 'Xã Đan Điền, TP Huế',
            residence: rawResidence || rawAddress || 'Xã Đan Điền, TP Huế',
            phone: rawPhone,
            groupNumber: groupNum,
            fatherName: rawFather,
            fatherPhone: rawFatherPhone,
            motherName: rawMother,
            motherPhone: rawMotherPhone,
            outstandingAbility: rawAbility,
            talents: rawTalent,
            needsSupport: needsSup,
            hasProgress: false,
            hasSpecialTalent: Boolean(rawTalent && rawTalent.trim().length > 0),
            needsAttention: needsSup,
            status: 'active',
            isPoorHousehold: isPoor,
          },
          targetClassName: displayClassName,
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
      'Mã học sinh (*)',
      'Họ và tên (*)',
      'Ngày sinh (*)',
      'Giới tính',
      'Lớp',
      'Dân tộc',
      'Tổ (1-4)',
      'Địa chỉ thường trú',
      'Nơi ở hiện nay',
      'Điện thoại HS',
      'Họ tên Cha',
      'SĐT Cha',
      'Họ tên Mẹ',
      'SĐT Mẹ',
      'Năng lực nổi bật',
      'Năng khiếu',
      'Hộ nghèo (Có/Không)',
      'Cần hỗ trợ (Có/Không)',
    ];

    const currentClassObj = classes.find((c) => c.id === selectedTargetClassId) || classes[0];
    const cName = currentClassObj?.className || '7/1';

    const sampleRows = [
      [
        1,
        '2026701001',
        'Lê Hoàng Phúc',
        '15/08/2013',
        'Nam',
        cName,
        'Kinh',
        1,
        'Thôn Thạnh Lợi, Xã Đan Điền',
        'Thôn Thạnh Lợi, Xã Đan Điền',
        '0912345678',
        'Lê Văn Tâm',
        '0912345678',
        'Nguyễn Thị Hồng',
        '0912345678',
        'Tự giác học tập, tính toán nhanh',
        'Bóng đá, Cờ vua',
        'Không',
        'Không',
      ],
      [
        2,
        '2026701002',
        'Trần Mỹ Duyên',
        '20/11/2013',
        'Nữ',
        cName,
        'Kinh',
        2,
        'Thôn Thủy Lập, Xã Đan Điền',
        'Thôn Thủy Lập, Xã Đan Điền',
        '0987654321',
        'Trần Văn Kiên',
        '0987654321',
        'Lê Thị Sen',
        '0987654321',
        'Chăm chỉ, viết chữ đẹp',
        'Múa hát, Vẽ tranh',
        'Không',
        'Không',
      ],
      [
        3,
        '2026701003',
        'Phan Quốc Anh',
        '05/03/2013',
        'Nam',
        cName,
        'Kinh',
        3,
        'Thôn An Xuân, Xã Đan Điền',
        'Thôn An Xuân, Xã Đan Điền',
        '',
        'Phan Văn Nam',
        '0905111222',
        'Hoàng Thị Lan',
        '0905333444',
        'Năng nổ tham gia phong trào Đội',
        'Điền kinh',
        'Có',
        'Có',
      ],
      [
        4,
        '2026701004',
        'Nguyễn Thảo Nguyên',
        '12/09/2013',
        'Nữ',
        cName,
        'Kinh',
        4,
        'Thôn Đông Phước, Xã Đan Điền',
        'Thôn Đông Phước, Xã Đan Điền',
        '',
        'Nguyễn Văn Bình',
        '0935888999',
        'Đỗ Thị Mai',
        '0935777666',
        'Giao tiếp Tiếng Anh tốt',
        'Kể chuyện Tiếng Anh',
        'Không',
        'Không',
      ],
    ];

    const aoa = [headers, ...sampleRows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã HS
      { wch: 22 }, // Họ tên
      { wch: 14 }, // Ngày sinh
      { wch: 10 }, // Giới tính
      { wch: 10 }, // Lớp
      { wch: 12 }, // Dân tộc
      { wch: 10 }, // Tổ
      { wch: 26 }, // Thường trú
      { wch: 26 }, // Nơi ở
      { wch: 15 }, // SĐT HS
      { wch: 18 }, // Tên Cha
      { wch: 15 }, // SĐT Cha
      { wch: 18 }, // Tên Mẹ
      { wch: 15 }, // SĐT Mẹ
      { wch: 28 }, // Năng lực
      { wch: 20 }, // Năng khiếu
      { wch: 14 }, // Nghèo
      { wch: 14 }, // Hỗ trợ
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Hoc_Sinh');
    XLSX.writeFile(wb, `Mau_Nhap_Danh_Sach_Hoc_Sinh_Lop_${cName.replace(/[^0-9a-zA-Z]/g, '_')}.xlsx`);
  };

  const handleDownloadTemplateCsv = () => {
    const headers = [
      'STT',
      'Mã học sinh (*)',
      'Họ và tên (*)',
      'Ngày sinh (*)',
      'Giới tính',
      'Lớp',
      'Dân tộc',
      'Tổ (1-4)',
      'Địa chỉ thường trú',
      'Nơi ở hiện nay',
      'Điện thoại HS',
      'Họ tên Cha',
      'SĐT Cha',
      'Họ tên Mẹ',
      'SĐT Mẹ',
      'Năng lực nổi bật',
      'Năng khiếu',
    ];

    const currentClassObj = classes.find((c) => c.id === selectedTargetClassId) || classes[0];
    const cName = currentClassObj?.className || '7/1';

    const sampleRow1 = [
      1,
      '2026701001',
      'Lê Hoàng Phúc',
      '15/08/2013',
      'Nam',
      cName,
      'Kinh',
      1,
      'Thôn Thạnh Lợi, Xã Đan Điền',
      'Thôn Thạnh Lợi, Xã Đan Điền',
      '0912345678',
      'Lê Văn Tâm',
      '0912345678',
      'Nguyễn Thị Hồng',
      '0912345678',
      'Tự giác học tập',
      'Bóng đá',
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow1.join(',')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mau_Nhap_Danh_Sach_Hoc_Sinh_Lop_${cName.replace(/[^0-9a-zA-Z]/g, '_')}.csv`;
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
    const result = onImport(payload, strategy);
    setImportResult(result);
  };

  // Filtered rows for preview
  const displayedRows = parsedRows.filter((r) => {
    if (filterStatus === 'valid' && r.status !== 'valid') return false;
    if (filterStatus === 'warning' && r.status !== 'warning') return false;
    if (filterStatus === 'error' && r.status !== 'error') return false;

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      const match =
        r.data.fullName.toLowerCase().includes(s) ||
        r.data.studentCode.toLowerCase().includes(s) ||
        r.targetClassName.toLowerCase().includes(s) ||
        (r.data.phone || '').includes(s);
      if (!match) return false;
    }

    return true;
  });

  const totalParsed = parsedRows.length;
  const validCount = parsedRows.filter((r) => r.status === 'valid').length;
  const warningCount = parsedRows.filter((r) => r.status === 'warning').length;
  const errorCount = parsedRows.filter((r) => r.status === 'error').length;
  const readyCount = validCount + (strategy === 'update_existing' ? warningCount : 0);

  const targetClassObj = classes.find((c) => c.id === selectedTargetClassId);

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
                  Nhập Danh Sách Học Sinh Từ File Excel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-200 uppercase">
                  {isAdmin ? 'Quản trị viên' : 'Giáo viên chủ nhiệm'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Thêm đồng loạt học sinh vào lớp học từ tập tin Excel (.xlsx, .xls) hoặc CSV với tính năng đối soát và tự sinh mã tự động
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
                Nhập danh sách học sinh thành công!
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Đã thêm thành công <strong>{importResult.added}</strong> học sinh mới vào cơ sở dữ liệu lớp học.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Thêm mới</div>
                <div className="text-xl font-black text-emerald-600">{importResult.added}</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Cập nhật</div>
                <div className="text-xl font-black text-sky-600">{importResult.updated}</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Bỏ qua</div>
                <div className="text-xl font-black text-amber-600">{importResult.skipped}</div>
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
            {/* Class Target & Template Action Topbar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
                  <span>
                    Lớp tiếp nhận dữ liệu:{' '}
                    <strong className="text-indigo-900 font-black">
                      Lớp {targetClassObj?.className}
                    </strong>{' '}
                    (GVCN: {targetClassObj?.homeroomTeacherName || 'Chưa gán'})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Hệ thống tự động liên kết học sinh vào danh sách lớp, sổ điểm danh, hạnh kiểm và bảng theo dõi bộ môn.
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

            {/* Admin Class Selector & Mode */}
            {isAdmin && (
              <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-900 text-xs">Chế độ phân lớp cho Quản trị viên:</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="class_mode"
                        checked={classAssignmentMode === 'fixed'}
                        onChange={() => setClassAssignmentMode('fixed')}
                        className="text-sky-600"
                      />
                      <span className="text-slate-800 font-medium">Nhập vào 1 lớp chỉ định</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="class_mode"
                        checked={classAssignmentMode === 'from_file'}
                        onChange={() => setClassAssignmentMode('from_file')}
                        className="text-sky-600"
                      />
                      <span className="text-slate-800 font-medium">Tự động theo cột "Lớp" trong file</span>
                    </label>
                  </div>
                </div>

                {classAssignmentMode === 'fixed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Chọn lớp:</span>
                    <select
                      value={selectedTargetClassId}
                      onChange={(e) => setSelectedTargetClassId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          Lớp {c.className} ({c.studentCount} HS) - GVCN: {c.homeroomTeacherName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

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
                      {(file.size / 1024).toFixed(1)} KB • Đã nhận diện{' '}
                      <strong className="text-emerald-700">{totalParsed}</strong> học sinh
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
                      Kéo thả file Excel học sinh vào đây hoặc click để chọn file
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Hỗ trợ tập tin .xlsx, .xls, .csv (Tự động nhận diện cột và ngày sinh DD/MM/YYYY)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conflict Strategy */}
            {parsedRows.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Tùy chọn xử lý khi trùng mã học sinh
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-400">
                    <input
                      type="radio"
                      name="student_strategy"
                      checked={strategy === 'skip_existing'}
                      onChange={() => setStrategy('skip_existing')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Bỏ qua nếu mã học sinh đã có</div>
                      <div className="text-[11px] text-slate-500">
                        Bảo toàn thông tin hồ sơ cũ, chỉ thêm mới các học sinh chưa có trong hệ thống.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-400">
                    <input
                      type="radio"
                      name="student_strategy"
                      checked={strategy === 'update_existing'}
                      onChange={() => setStrategy('update_existing')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Cập nhật nếu mã học sinh đã có</div>
                      <div className="text-[11px] text-slate-500">
                        Cập nhật họ tên, ngày sinh, địa chỉ, số điện thoại phụ huynh cho học sinh đã có.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Validation and Preview Table */}
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
                        <th className="py-2.5 px-3">Trạng thái</th>
                        <th className="py-2.5 px-3">Mã học sinh</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Ngày sinh</th>
                        <th className="py-2.5 px-3">Giới tính</th>
                        <th className="py-2.5 px-3">Lớp nhận</th>
                        <th className="py-2.5 px-3">Tổ</th>
                        <th className="py-2.5 px-3">Nơi ở / Thường trú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400">
                            Không tìm thấy dòng học sinh nào phù hợp với bộ lọc.
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
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">
                              {row.data.studentCode}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">{row.data.fullName}</td>
                            <td className="py-2 px-3 text-slate-600">{row.data.birthDate}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.data.gender === 'Nữ'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {row.data.gender}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold text-indigo-700">
                              Lớp {row.targetClassName}
                            </td>
                            <td className="py-2 px-3 text-slate-600">Tổ {row.data.groupNumber}</td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-xs">
                              {row.data.residence || row.data.address}
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
                Xác nhận thêm {readyCount} học sinh vào hệ thống
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
