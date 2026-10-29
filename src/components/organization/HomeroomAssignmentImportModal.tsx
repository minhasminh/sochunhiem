import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Info,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';

interface HomeroomAssignmentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedAssignmentRow {
  className: string;
  teacherQuery: string; // Teacher code or Name
  matchedClassId?: string;
  matchedTeacherId?: string;
  matchedTeacherName?: string;
  status: 'valid' | 'invalid_class' | 'invalid_teacher';
  errorNote?: string;
}

export const HomeroomAssignmentImportModal: React.FC<HomeroomAssignmentImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { classes, teachers, batchAssignHomeroom, currentSchoolYear } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedAssignmentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active year classes
  const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const headers = ['STT', 'Tên lớp (*)', 'Mã giáo viên', 'Họ và tên GVCN (*)'];
    const sampleRows = activeYearClasses
      .slice(0, 10)
      .map((c, idx) => [idx + 1, c.className, '', c.homeroomTeacherName || '']);

    const ws = XLSX.utils.aoa_to_sheet([
      ['MẪU NHẬP PHÂN CÔNG GIÁO VIÊN CHỦ NHIỆM'],
      ['Lưu ý: Cột "Tên lớp" và "Họ và tên GVCN" (hoặc "Mã giáo viên") là bắt buộc.'],
      [],
      headers,
      ...sampleRows,
    ]);

    ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Phan_Cong');
    XLSX.writeFile(wb, 'Mau_Phan_Cong_GVCN.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonRows.length === 0) {
          setErrorMsg('File Excel không có dữ liệu!');
          setIsLoading(false);
          return;
        }

        // Detect header row
        let headerRowIndex = -1;
        let colClassIdx = -1;
        let colCodeIdx = -1;
        let colNameIdx = -1;

        for (let i = 0; i < Math.min(10, jsonRows.length); i++) {
          const row = jsonRows[i];
          if (!row || !Array.isArray(row)) continue;

          row.forEach((cell, idx) => {
            const str = String(cell || '').toLowerCase().trim();
            if (str.includes('tên lớp') || str.includes('lớp')) {
              colClassIdx = idx;
              headerRowIndex = i;
            }
            if (str.includes('mã gv') || str.includes('mã giáo viên')) {
              colCodeIdx = idx;
            }
            if (str.includes('họ và tên') || str.includes('gvcn') || str.includes('giáo viên')) {
              colNameIdx = idx;
            }
          });

          if (colClassIdx !== -1 && (colCodeIdx !== -1 || colNameIdx !== -1)) {
            break;
          }
        }

        if (colClassIdx === -1) {
          // Default fallbacks: Col 1 is Class, Col 3 is Teacher Name
          colClassIdx = 1;
          colNameIdx = 3;
          headerRowIndex = 0;
        }

        const classMapByName = new Map(
          activeYearClasses.map((c) => [c.className.trim().toLowerCase(), c])
        );
        const teacherMapByCode = new Map(
          teachers.map((t) => [t.teacherCode.trim().toLowerCase(), t])
        );
        const teacherMapByName = new Map(
          teachers.map((t) => [t.fullName.trim().toLowerCase(), t])
        );

        const parsed: ParsedAssignmentRow[] = [];

        for (let i = headerRowIndex + 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;

          const rawClass = String(row[colClassIdx] || '').trim();
          const rawCode = colCodeIdx !== -1 ? String(row[colCodeIdx] || '').trim() : '';
          const rawName = colNameIdx !== -1 ? String(row[colNameIdx] || '').trim() : '';

          if (!rawClass) continue;

          const matchedClass = classMapByName.get(rawClass.toLowerCase());
          let matchedTeacher = rawCode ? teacherMapByCode.get(rawCode.toLowerCase()) : undefined;
          if (!matchedTeacher && rawName) {
            matchedTeacher = teacherMapByName.get(rawName.toLowerCase());
          }

          if (!matchedClass) {
            parsed.push({
              className: rawClass,
              teacherQuery: rawName || rawCode || '—',
              status: 'invalid_class',
              errorNote: `Lớp "${rawClass}" không tồn tại trong năm học hiện tại.`,
            });
          } else if (!matchedTeacher) {
            parsed.push({
              className: rawClass,
              teacherQuery: rawName || rawCode || '—',
              matchedClassId: matchedClass.id,
              status: 'invalid_teacher',
              errorNote: `Không tìm thấy giáo viên "${rawName || rawCode}" trong danh sách nhà trường.`,
            });
          } else {
            parsed.push({
              className: rawClass,
              teacherQuery: rawName || rawCode,
              matchedClassId: matchedClass.id,
              matchedTeacherId: matchedTeacher.id,
              matchedTeacherName: matchedTeacher.fullName,
              status: 'valid',
            });
          }
        }

        setParsedRows(parsed);
        setIsLoading(false);
      } catch (err) {
        console.error('Error reading excel file:', err);
        setErrorMsg('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
        setIsLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleApply = () => {
    const validRows = parsedRows.filter(
      (r) => r.status === 'valid' && r.matchedClassId && r.matchedTeacherId
    );

    if (validRows.length === 0) {
      setErrorMsg('Không có dòng phân công hợp lệ nào để áp dụng!');
      return;
    }

    const assignments = validRows.map((r) => ({
      classId: r.matchedClassId!,
      teacherId: r.matchedTeacherId!,
    }));

    const res = batchAssignHomeroom(assignments);
    if (res.success) {
      onSuccess(validRows.length);
      onClose();
    } else {
      setErrorMsg(res.message || 'Lỗi khi cập nhật phân công!');
    }
  };

  const validCount = parsedRows.filter((r) => r.status === 'valid').length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập Phân Công GVCN Từ File Excel
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật đồng loạt giáo viên chủ nhiệm cho các lớp học từ file .xlsx hoặc .xls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {fileName ? 'Chọn file khác' : 'Chọn file Excel (.xlsx)'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Tải mẫu Excel chuẩn
          </button>

          {fileName && (
            <span className="text-xs text-slate-600 font-medium truncate max-w-xs">
              File đã chọn: <strong>{fileName}</strong>
            </span>
          )}
        </div>

        {/* Preview Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl min-h-[220px]">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang đọc file Excel...</div>
          ) : parsedRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Chưa có dữ liệu xem trước. Vui lòng chọn file Excel để bắt đầu.</p>
              <p className="text-[11px] text-slate-400">
                Gợi ý: Tải file mẫu bên trên để điền tên lớp và tên/mã GVCN.
              </p>
            </div>
          ) : (
            <div>
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between font-semibold">
                <span className="text-slate-700">
                  Xem trước phân công ({parsedRows.length} dòng):
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    {validCount} hợp lệ
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                      {invalidCount} lỗi
                    </span>
                  )}
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-2.5 text-center w-10">STT</th>
                    <th className="p-2.5">Lớp</th>
                    <th className="p-2.5">GVCN (File)</th>
                    <th className="p-2.5">Khớp trong hệ thống</th>
                    <th className="p-2.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr
                      key={i}
                      className={
                        r.status === 'valid'
                          ? 'hover:bg-slate-50'
                          : 'bg-rose-50/50 hover:bg-rose-50'
                      }
                    >
                      <td className="p-2.5 text-center text-slate-400">{i + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.className}</td>
                      <td className="p-2.5 text-slate-600">{r.teacherQuery}</td>
                      <td className="p-2.5">
                        {r.status === 'valid' ? (
                          <span className="font-semibold text-emerald-800">
                            {r.matchedTeacherName}
                          </span>
                        ) : (
                          <span className="text-rose-600 text-[11px]">{r.errorNote}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {r.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Lỗi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hệ thống sẽ tự động đồng bộ hai chiều lớp học và hồ sơ nhân sự sau khi áp dụng.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleApply}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors ${
                validCount > 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Áp dụng phân công ({validCount} lớp)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
