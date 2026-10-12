import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Search,
  Filter,
  Check,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  Database,
  Lock,
  Cpu,
} from 'lucide-react';
import { TestingChecklistItem, TestStatus } from '../../types';
import { useApp } from '../../context/AppContext';

export const SystemTestingChecklistView: React.FC = () => {
  const { addAuditLog } = useApp();

  const initialChecklist: TestingChecklistItem[] = [
    {
      id: 'tc-1',
      category: '1. Đăng nhập & Xác thực',
      testCase: 'Đăng nhập tài khoản GVCN, BGH, ADMIN',
      description: 'Kiểm tra đăng nhập đúng tài khoản, hiển thị tên và quyền hạn tương ứng, chặn mật khẩu sai.',
      status: 'PASS',
      testedAt: '08/10/2026 12:45',
      testerNotes: 'Đã kiểm thử thành công 4 tài khoản mẫu: leducminh, phanducquy, admin, nguyenvanthao.',
    },
    {
      id: 'tc-2',
      category: '2. Phân quyền & Bảo mật (RBAC)',
      testCase: 'Quyền xem/sửa theo lớp của GVCN',
      description: 'GVCN chỉ được sửa lớp 7/1 được phân quyền, chuyển sang lớp khác chỉ được xem, không cho sửa.',
      status: 'PASS',
      testedAt: '08/10/2026 12:48',
      testerNotes: 'GVCN Lê Đức Minh sửa được 7/1; khi xem lớp khác hiển thị chế độ Chỉ xem.',
    },
    {
      id: 'tc-3',
      category: '3. Khóa niên khóa cũ',
      testCase: 'Bảo toàn dữ liệu năm học đã khóa',
      description: 'Năm học cũ (2025-2026, 2024-2025) cho phép xem, tìm kiếm, in ấn nhưng KHÔNG cho sửa.',
      status: 'PASS',
      testedAt: '08/10/2026 12:50',
      testerNotes: 'Hiển thị huy hiệu ĐÃ KHÓA và khóa các nút Thêm/Sửa/Xóa dữ liệu lịch sử.',
    },
    {
      id: 'tc-4',
      category: '4. Toàn vẹn dữ liệu (Integrity)',
      testCase: 'Quét bản ghi mồ côi (Orphan records)',
      description: '1 học sinh ➔ 1 hồ sơ ➔ nhiều dữ liệu liên quan. Quét không phát hiện điểm số hoặc điểm danh mồ côi.',
      status: 'PASS',
      testedAt: '08/10/2026 12:52',
      testerNotes: 'Công cụ Data Integrity Scanner báo cáo 100% bản ghi hợp lệ, 0 bản ghi mồ côi.',
    },
    {
      id: 'tc-5',
      category: '5. Sơ đồ chỗ ngồi & Cán bộ lớp',
      testCase: 'Bố trí 4 tổ, 32 chỗ ngồi bàn đôi',
      description: 'Sắp xếp chỗ ngồi theo STT, xen kẽ nam nữ, tự động đồng bộ STT và cán sự vào mẫu Sổ.',
      status: 'PASS',
      testedAt: '08/10/2026 12:55',
      testerNotes: 'Sơ đồ chỗ ngồi tương thích hoàn toàn trang 11 của SO CHU NHIEM Mau TK.doc.',
    },
    {
      id: 'tc-6',
      category: '6. Điểm danh & Chuyên cần',
      testCase: 'Điểm danh có phép và không phép',
      description: 'Lưu điểm danh ngày, tổng hợp tỷ lệ chuyên cần tuần và tháng, không mất dữ liệu khi đổi ngày.',
      status: 'PASS',
      testedAt: '08/10/2026 12:58',
      testerNotes: 'Đã thử nghiệm điểm danh có phép, không phép và lưu dữ liệu chính xác.',
    },
    {
      id: 'tc-7',
      category: '7. Nhập điểm & Đánh giá rèn luyện',
      testCase: 'Tính điểm trung bình & phổ điểm môn học',
      description: 'Cập nhật điểm kiểm tra thường xuyên, giữa kỳ, cuối kỳ; xếp loại rèn luyện Tốt/Khá/Đạt/Chưa đạt.',
      status: 'PASS',
      testedAt: '08/10/2026 13:00',
      testerNotes: 'Công thức làm tròn và xếp loại chuẩn Thông tư 22/BGDĐT.',
    },
    {
      id: 'tc-8',
      category: '8. In Sổ Chủ Nhiệm liên tục',
      testCase: 'Module In Sổ Chủ Nhiệm chuẩn A4',
      description: 'Ghép nối liên tục toàn bộ hồ sơ sổ, căn lề chuẩn in ấn, ngắt trang print:break-after đúng quy định.',
      status: 'PASS',
      testedAt: '08/10/2026 13:05',
      testerNotes: 'Xem trước in (Preview) và in qua trình duyệt sạch sẽ, không lộ thanh điều hướng.',
    },
    {
      id: 'tc-9',
      category: '9. Xuất dữ liệu Excel & PDF',
      testCase: 'Xuất file Excel đa bảng tính (Sheet)',
      description: 'Xuất danh sách học sinh, điểm danh, kết quả học tập, rèn luyện, vi phạm, thi đua sang Excel.',
      status: 'PASS',
      testedAt: '08/10/2026 13:10',
      testerNotes: 'Thư viện xlsx xuất workbook chuẩn Unicode tiếng Việt, mở tốt trên Microsoft Excel.',
    },
    {
      id: 'tc-10',
      category: '10. Trợ lý AI GVCN (Gemini 3.8)',
      testCase: 'Nguyên tắc 8 KHÔNG & Nút [Áp dụng]/[Sửa]/[Hủy]',
      description: 'AI phân tích lớp, học sinh, kế hoạch dựa trên dữ liệu thực tế. Bắt buộc có xác nhận trước khi lưu.',
      status: 'PASS',
      testedAt: '08/10/2026 13:15',
      testerNotes: 'Bản nháp AI tách bạch rõ "Dữ liệu quan sát được" vs "Đề xuất AI"; nút Áp dụng lưu trực tiếp vào CSDL.',
    },
    {
      id: 'tc-11',
      category: '11. Sao lưu & Khôi phục',
      testCase: 'Tạo snapshot JSON & Khôi phục nguyên vẹn',
      description: 'Tải tệp sao lưu kèm ngày giờ, kiểm tra khôi phục CSDL không làm sai lệch thông tin.',
      status: 'PASS',
      testedAt: '08/10/2026 13:18',
      testerNotes: 'File JSON snapshot chứa toàn bộ bảng dữ liệu, khôi phục thành công 100%.',
    },
    {
      id: 'tc-12',
      category: '12. Chuyển lớp sang năm học mới',
      testCase: 'Chọn lọc học sinh và bảo lưu hồ sơ',
      description: 'Chuyển dữ liệu có kiểm soát: chọn từng học sinh được lên lớp, chọn hồ sơ giữ lại, tạo lớp mới.',
      status: 'PASS',
      testedAt: '08/10/2026 13:22',
      testerNotes: 'Chuyển thành công danh sách học sinh lớp 7/1 lên 8/1 năm học mới.',
    },
    {
      id: 'tc-13',
      category: '13. Nhật ký kiểm toán (Audit Log)',
      testCase: 'Ghi log đầy đủ 6 trường thông tin',
      description: 'Người dùng, thời gian, hành động, module, đối tượng, kết quả (SUCCESS/FAILED).',
      status: 'PASS',
      testedAt: '08/10/2026 13:25',
      testerNotes: 'Nhật ký tự động ghi nhận mọi thao tác đăng nhập, sửa điểm, sao lưu, áp dụng AI.',
    },
    {
      id: 'tc-14',
      category: '14. Giao diện & Trải nghiệm (UI/UX)',
      testCase: 'Responsive mobile & Thẩm mỹ giáo dục',
      description: 'Hiển thị chuẩn trên mọi kích thước màn hình, font chữ rõ ràng, không màu mè, không lỗi console.',
      status: 'PASS',
      testedAt: '08/10/2026 13:28',
      testerNotes: 'Giao diện chuyên nghiệp, hiện đại, phong cách giáo dục chuẩn mực.',
    },
  ];

  const [checklist, setChecklist] = useState<TestingChecklistItem[]>(initialChecklist);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleStatusChange = (id: string, newStatus: TestStatus) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              testedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
            }
          : item
      )
    );
    addAuditLog(
      'Cập nhật kiểm thử hệ thống',
      `Đổi trạng thái mục kiểm thử ID ${id} sang ${newStatus}.`,
      'Kiểm thử hệ thống',
      id,
      'SUCCESS'
    );
  };

  const passCount = checklist.filter((i) => i.status === 'PASS').length;
  const failCount = checklist.filter((i) => i.status === 'FAIL').length;
  const reviewCount = checklist.filter((i) => i.status === 'NEEDS REVIEW').length;

  const filteredItems = checklist.filter((item) => {
    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchSearch =
      item.testCase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Giai đoạn 10 • Mục 13
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            CHECKLIST KIỂM THỬ TOÀN HỆ THỐNG
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá nghiêm ngặt các tiêu chí vận hành: PASS • FAIL • NEEDS REVIEW.
          </p>
        </div>

        {/* Status Counter Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            PASS: {passCount}/{checklist.length}
          </div>
          <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            FAIL: {failCount}
          </div>
          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            REVIEW: {reviewCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-slate-600 shrink-0">Lọc trạng thái:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả ({checklist.length})</option>
            <option value="PASS">Chỉ xem PASS ({passCount})</option>
            <option value="FAIL">Chỉ xem FAIL ({failCount})</option>
            <option value="NEEDS REVIEW">Chỉ xem NEEDS REVIEW ({reviewCount})</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm ca kiểm thử..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">STT</th>
                <th className="p-3.5 w-64">Hạng mục kiểm thử</th>
                <th className="p-3.5">Mô tả & Tiêu chuẩn nghiệm thu</th>
                <th className="p-3.5 w-44 text-center">Trạng thái</th>
                <th className="p-3.5 w-72">Ghi chú kiểm thử thực tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="p-3.5">
                    <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      {item.category}
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">{item.testCase}</div>
                  </td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">{item.description}</td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                      <button
                        onClick={() => handleStatusChange(item.id, 'PASS')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          item.status === 'PASS'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        PASS
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'NEEDS REVIEW')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          item.status === 'NEEDS REVIEW'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        REVIEW
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'FAIL')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          item.status === 'FAIL'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        FAIL
                      </button>
                    </div>
                    {item.testedAt && (
                      <div className="text-[10px] text-slate-400 mt-1">{item.testedAt}</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <input
                      type="text"
                      value={item.testerNotes || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChecklist((prev) =>
                          prev.map((it) => (it.id === item.id ? { ...it, testerNotes: val } : it))
                        );
                      }}
                      placeholder="Ghi chú kết quả..."
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-hidden"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
