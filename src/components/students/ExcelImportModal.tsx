import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Student } from '../../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>) => {
    added: number;
    errors: string[];
  };
  existingCodes: string[];
  currentClassId: string;
  currentSchoolYearId: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCodes,
  currentClassId,
  currentSchoolYearId,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [validationDone, setValidationDone] = useState(false);
  const [parsedRows, setParsedRows] = useState<Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'Mã học sinh',
      'Họ và tên',
      'Ngày sinh (DD/MM/YYYY)',
      'Giới tính (Nam/Nữ)',
      'Dân tộc',
      'Địa chỉ thường trú',
      'Nơi ở hiện nay',
      'Điện thoại HS',
      'Tổ (1-4)',
      'Họ tên Cha',
      'Điện thoại Cha',
      'Họ tên Mẹ',
      'Điện thoại Mẹ',
      'Năng lực nổi bật',
      'Năng khiếu',
    ];

    const sampleRow1 = [
      '2001550001',
      'Lê Hoàng Phúc',
      '15/08/2014',
      'Nam',
      'Kinh',
      'Thôn Thạnh Lợi, Xã Đan Điền',
      'Thôn Thạnh Lợi, Xã Đan Điền',
      '0912345678',
      '1',
      'Lê Văn Tâm',
      '0912345678',
      'Nguyễn Thị Hồng',
      '0912345678',
      'Tự giác học tập',
      'Bóng đá',
    ];

    const sampleRow2 = [
      '2001550002',
      'Trần Mỹ Duyên',
      '20/11/2014',
      'Nữ',
      'Kinh',
      'Thôn Thủy Lập, Xã Đan Điền',
      'Thôn Thủy Lập, Xã Đan Điền',
      '0987654321',
      '2',
      'Trần Văn Kiên',
      '0987654321',
      'Lê Thị Sen',
      '0987654321',
      'Học khá môn Văn',
      'Múa hát',
    ];

    const csvStr =
      '\uFEFF' +
      [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\r\n');

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_nhap_danh_sach_hoc_sinh.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseAndValidate = () => {
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    const errors: string[] = [];
    const validList: Array<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>> = [];
    const seenInFileCodes = new Set<string>();

    const startIndex = lines[0].toLowerCase().includes('mã') || lines[0].toLowerCase().includes('họ') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const rowNum = i + 1;

      const cols = line.split(/[,\t;]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));

      const code = cols[0] || '';
      const name = cols[1] || '';
      const birthDate = cols[2] || '';
      const rawGender = cols[3] || 'Nam';
      const ethnicity = cols[4] || 'Kinh';
      const address = cols[5] || 'Xã Đan Điền, TP Huế';
      const residence = cols[6] || address;
      const phone = cols[7] || '';
      const groupNum = cols[8] ? parseInt(cols[8]) || 1 : 1;
      const fatherName = cols[9] || '';
      const fatherPhone = cols[10] || '';
      const motherName = cols[11] || '';
      const motherPhone = cols[12] || '';
      const outstandingAbility = cols[13] || '';
      const talents = cols[14] || '';

      // Validation 1: Required fields
      if (!code) {
        errors.push(`Dòng ${rowNum}: Thiếu mã học sinh.`);
        continue;
      }
      if (!name) {
        errors.push(`Dòng ${rowNum}: Thiếu họ và tên học sinh.`);
        continue;
      }
      if (!birthDate) {
        errors.push(`Dòng ${rowNum}: Thiếu ngày sinh.`);
        continue;
      }

      // Validation 2: Birth date regex format check
      const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!dateRegex.test(birthDate)) {
        errors.push(`Dòng ${rowNum}: Sai định dạng ngày sinh "${birthDate}" (Phải là DD/MM/YYYY).`);
        continue;
      }

      // Validation 3: Gender check
      const cleanGender = rawGender.toLowerCase();
      let gender: 'Nam' | 'Nữ' = 'Nam';
      if (cleanGender === 'nam' || cleanGender === 'm' || cleanGender === 'male') {
        gender = 'Nam';
      } else if (cleanGender === 'nữ' || cleanGender === 'nu' || cleanGender === 'f' || cleanGender === 'female') {
        gender = 'Nữ';
      } else {
        errors.push(`Dòng ${rowNum}: Sai giới tính "${rawGender}" (Chỉ chấp nhận Nam hoặc Nữ).`);
        continue;
      }

      // Validation 4: Duplicate in current database
      if (existingCodes.includes(code)) {
        errors.push(`Dòng ${rowNum}: Mã học sinh "${code}" đã tồn tại trong hệ thống.`);
        continue;
      }

      // Validation 5: Duplicate in current file
      if (seenInFileCodes.has(code)) {
        errors.push(`Dòng ${rowNum}: Mã học sinh "${code}" bị trùng lặp ngay trong tệp nhập.`);
        continue;
      }

      seenInFileCodes.add(code);

      validList.push({
        classId: currentClassId,
        schoolYearId: currentSchoolYearId,
        studentCode: code,
        fullName: name,
        birthDate,
        gender,
        ethnicity,
        address,
        residence,
        phone,
        groupNumber: groupNum,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        outstandingAbility,
        talents,
        needsSupport: false,
        hasProgress: false,
        hasSpecialTalent: talents.trim().length > 0,
        needsAttention: false,
        status: 'active',
        isPoorHousehold: false,
      });
    }

    setParsedRows(validList);
    setValidationErrors(errors);
    setValidationDone(true);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    const res = onImport(parsedRows);
    setImportResult(res);
    setTimeout(() => {
      onClose();
      setImportResult(null);
      setValidationDone(false);
      setParsedRows([]);
      setCsvContent('');
    }, 1500);
  };

  const handleFillSample = () => {
    const sample = `Mã học sinh,Họ và tên,Ngày sinh,Giới tính,Dân tộc,Địa chỉ,Nơi ở,Điện thoại HS,Tổ
2001550003,Nguyễn Tiến Đạt,12/03/2014,Nam,Kinh,Thôn Thạnh Lợi,Thôn Thạnh Lợi,0912111222,1
2001550004,Phan Thùy Trang,25/07/2014,Nữ,Kinh,Thôn Thủy Lập,Thôn Thủy Lập,0912333444,2`;
    setCsvContent(sample);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 space-y-4">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nhập danh sách học sinh từ Excel</h3>
              <p className="text-xs text-slate-500">
                Kiểm tra hợp lệ trước khi nhập: chống trùng mã, sai định dạng, thiếu thông tin bắt buộc
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Đã nhập thành công {importResult.added} học sinh mới vào lớp!</span>
            </div>
          )}

          {/* Section: File Structure Preview & Download */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                Cấu trúc tệp dữ liệu chuẩn (Thứ tự các cột):
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải tệp mẫu (.CSV)
              </button>
            </div>
            <div className="overflow-x-auto text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-200">
              1. Mã học sinh (*) | 2. Họ và tên (*) | 3. Ngày sinh (DD/MM/YYYY) (*) | 4. Giới tính (*) | 5. Dân tộc | 6. Địa chỉ | 7. Nơi ở | 8. Điện thoại HS | 9. Tổ
            </div>
          </div>

          {!validationDone ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">
                  Dán nội dung bảng tính hoặc tệp CSV vào ô dưới đây:
                </label>
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="text-sky-600 hover:underline font-semibold text-[11px]"
                >
                  Dán dữ liệu ví dụ mẫu
                </button>
              </div>

              <textarea
                rows={7}
                placeholder="Dán các dòng dữ liệu (phân cách bằng dấu phẩy hoặc tab từ Excel)..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleParseAndValidate}
                  disabled={!csvContent.trim()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Kiểm tra & Đối soát dữ liệu
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Validation Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                  <div className="font-bold text-sm">{parsedRows.length} học sinh hợp lệ</div>
                  <div className="text-[11px]">Sẵn sàng nạp vào danh sách lớp</div>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                  <div className="font-bold text-sm">{validationErrors.length} dòng dữ liệu lỗi</div>
                  <div className="text-[11px]">Đã bị loại trừ tự động</div>
                </div>
              </div>

              {/* Error list if any */}
              {validationErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Danh sách lỗi phát hiện:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-rose-700 text-[11px]">
                    {validationErrors.map((err, eIdx) => (
                      <li key={eIdx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Valid rows preview */}
              {parsedRows.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Mã HS</th>
                        <th className="p-2">Họ và tên</th>
                        <th className="p-2">Ngày sinh</th>
                        <th className="p-2">Giới tính</th>
                        <th className="p-2">Tổ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-400">{i + 1}</td>
                          <td className="p-2 font-mono font-bold text-slate-800">{r.studentCode}</td>
                          <td className="p-2 font-bold text-slate-900">{r.fullName}</td>
                          <td className="p-2">{r.birthDate}</td>
                          <td className="p-2">{r.gender}</td>
                          <td className="p-2">Tổ {r.groupNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setValidationDone(false)}
                  className="text-slate-600 hover:text-slate-900 underline text-xs"
                >
                  ← Nhập lại tệp khác
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={parsedRows.length === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                  >
                    Xác nhận nhập ({parsedRows.length} HS)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
