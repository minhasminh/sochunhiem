import React, { useState } from 'react';
import {
  BookOpen,
  KeyRound,
  Calendar,
  School,
  UserPlus,
  BookCheck,
  Award,
  Users,
  ClipboardList,
  FileText,
  Printer,
  Sparkles,
  Database,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';

interface GuideSection {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
  summary: string;
  steps: string[];
  tips: string[];
}

export const UserGuideMasterView: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('guide-1');
  const [searchTerm, setSearchTerm] = useState('');

  const guideSections: GuideSection[] = [
    {
      id: 'guide-1',
      number: 1,
      title: 'Đăng nhập & Quản lý tài khoản',
      icon: KeyRound,
      summary: 'Truy cập hệ thống Sổ chủ nhiệm điện tử và xác thực phân quyền.',
      steps: [
        'Truy cập trang đăng nhập bằng tài khoản được cấp (email hoặc tên người dùng).',
        'Tài khoản Demo thử nghiệm: `leducminh` (GVCN), `phanducquy` (BGH), `admin` (Quản trị), mật khẩu mặc định: `123`.',
        'Sau khi đăng nhập thành công, hệ thống tự động tải quyền hạn tương ứng theo vai trò (ADMIN, BGH, GVCN, GIÁO VIÊN).',
      ],
      tips: [
        'Nếu bạn là GVCN, bạn chỉ được phép thêm/sửa dữ liệu ở lớp do bạn phụ trách.',
        'Có thể chuyển đổi nhanh vai trò kiểm thử trong mục Cài đặt hệ thống.',
      ],
    },
    {
      id: 'guide-2',
      number: 2,
      title: 'Tạo năm học & Quản lý niên khóa',
      icon: Calendar,
      summary: 'Khởi tạo niên khóa mới và quản lý trạng thái khóa sổ.',
      steps: [
        'Vào menu "Thông tin lớp" ➔ Tab "Quản lý Niên khóa".',
        'Nhấn nút "Thêm năm học mới", điền mã niên khóa (VD: 2026-2027), ngày bắt đầu và kết thúc.',
        'Chọn năm học hiện hành bằng bộ chọn niên khóa trên thanh tiêu đề.',
        'Khi năm học kết thúc, nhấn "Khóa năm học" để bảo toàn lịch sử dữ liệu.',
      ],
      tips: [
        'Năm học đã khóa sẽ chuyển sang chế độ CHỈ XEM; mọi thao tác chỉnh sửa sẽ bị chặn để chống sửa điểm/sửa sổ hồi tố.',
      ],
    },
    {
      id: 'guide-3',
      number: 3,
      title: 'Tạo lớp học & Thiết lập phòng học',
      icon: School,
      summary: 'Khai báo lớp chủ nhiệm, khối học, ca học và phân công GVCN.',
      steps: [
        'Vào menu "Thông tin lớp" ➔ Tab "Danh sách Lớp học".',
        'Nhấn "Thêm lớp học", nhập Tên lớp (VD: 7/1), Khối lớp (Khối 7), Phòng học, Buổi học (Sáng/Chiều).',
        'Gán Giáo viên chủ nhiệm tương ứng với mã tài khoản giáo viên.',
        'Cập nhật đặc điểm tình hình lớp: Thuận lợi, khó khăn, mục tiêu năm học.',
      ],
      tips: [
        'Mỗi lớp được gán duy nhất 1 GVCN chính thức theo quy định của Bộ GD&ĐT.',
      ],
    },
    {
      id: 'guide-4',
      number: 4,
      title: 'Nhập học sinh & Sơ đồ chỗ ngồi',
      icon: UserPlus,
      summary: 'Quản lý hồ sơ 31 học sinh và phân bổ vị trí bàn học 4 tổ.',
      steps: [
        'Vào menu "Học sinh" để xem danh sách hoặc nhấn "Thêm học sinh mới".',
        'Điền đầy đủ lý lịch: Họ tên, ngày sinh, nơi sinh, địa chỉ, thông tin cha mẹ, diện hộ nghèo.',
        'Vào menu "Sơ đồ chỗ ngồi" để xếp bàn học 4 dãy (tương ứng 4 tổ).',
        'Kéo thả hoặc dùng tính năng "Tự động xếp chỗ" theo STT, xen kẽ nam/nữ, hoặc nhóm học tập.',
      ],
      tips: [
        'Hệ thống tự động đồng bộ STT và thông tin cán sự lớp vào trang 11 của Sổ chủ nhiệm mẫu.',
      ],
    },
    {
      id: 'guide-5',
      number: 5,
      title: 'Điểm danh & Theo dõi chuyên cần',
      icon: BookCheck,
      summary: 'Ghi nhận sĩ số hàng ngày, vắng có phép và không phép.',
      steps: [
        'Vào menu "Điểm danh", chọn ngày và buổi học (Sáng / Chiều).',
        'Nhấn "Đánh dấu tất cả có mặt" để điểm danh nhanh, sau đó bấm vào học sinh vắng để đổi trạng thái.',
        'Phân loại chính xác: "Vắng có phép" (P) hoặc "Vắng không phép" (KP).',
        'Nhấn "Lưu dữ liệu điểm danh".',
      ],
      tips: [
        'Dữ liệu chuyên cần được tích hợp tự động vào bảng theo dõi tuần và báo cáo sơ kết tháng.',
      ],
    },
    {
      id: 'guide-6',
      number: 6,
      title: 'Nhập kết quả học tập & Rèn luyện',
      icon: Award,
      summary: 'Cập nhật điểm số bộ môn và đánh giá nề nếp theo Thông tư 22/BGDĐT.',
      steps: [
        'Vào menu "Học tập", chọn môn học và kỳ đánh giá (ĐĐGtx, ĐĐGgk, ĐĐGck).',
        'Nhập điểm trực tiếp trên bảng hoặc nhập hàng loạt nhanh chóng.',
        'Vào menu "Rèn luyện" để đánh giá mức độ đạt được (Tốt, Khá, Đạt, Chưa đạt).',
        'Ghi nhận các trường hợp vi phạm hoặc học sinh có hành vi gương mẫu.',
      ],
      tips: [
        'Hệ thống tự động tính điểm trung bình và biểu đồ phổ điểm trực quan cho GVCN.',
      ],
    },
    {
      id: 'guide-7',
      number: 7,
      title: 'Theo dõi học sinh tiến bộ & Khó khăn',
      icon: Users,
      summary: 'Sổ tay theo dõi học sinh diện chính sách, năng khiếu và khó khăn.',
      steps: [
        'Tại menu "Rèn luyện" ➔ Tab "Học sinh tiến bộ / Khó khăn".',
        'Gắn thẻ hỗ trợ: "Cần phối hợp gia đình", "Học tập cần kèm cặp", "Chuyên cần".',
        'Ghi nhận tiến bộ khi học sinh có chuyển biến tích cực trong tuần.',
        'Lập hồ sơ bồi dưỡng năng khiếu (Văn nghệ, Thể thao, Tin học...).',
      ],
      tips: [
        'Dữ liệu này là căn cứ xác thực khi làm việc cùng phụ huynh và khen thưởng cuối năm.',
      ],
    },
    {
      id: 'guide-8',
      number: 8,
      title: 'Lập kế hoạch chủ nhiệm tuần / tháng / năm',
      icon: ClipboardList,
      summary: 'Xây dựng kế hoạch công tác theo đúng mẫu Sổ chủ nhiệm TK.doc.',
      steps: [
        'Vào menu "Kế hoạch" ➔ Xem Kế hoạch năm với các chỉ tiêu phấn đấu.',
        'Chọn "Kế hoạch tháng": Điền chủ điểm tháng, mục tiêu, biện pháp và hoạt động trải nghiệm.',
        'Sử dụng tính năng "Sao chép kế hoạch" để kế thừa từ tháng trước hoặc nhờ Trợ lý AI gợi ý.',
      ],
      tips: [
        'Kế hoạch sau khi lập sẽ được hiển thị ngay ngắn trong bản in Sổ chủ nhiệm liên tục.',
      ],
    },
    {
      id: 'guide-9',
      number: 9,
      title: 'Báo cáo tổng hợp & Thống kê số hóa',
      icon: FileText,
      summary: 'Xuất các biểu mẫu báo cáo sơ kết, tổng kết và báo cáo cá nhân học sinh.',
      steps: [
        'Vào menu "Báo cáo".',
        'Xem "Dashboard Tổng Quan": Tỷ lệ nam/nữ, hộ nghèo, phổ điểm, vi phạm, thi đua 4 tổ.',
        'Chọn "Báo cáo cá nhân học sinh" để in phiếu liên lạc hoặc hồ sơ tổng hợp một em.',
        'Chọn "Báo cáo tổng kết lớp" để lấy số liệu gửi Ban Giám Hiệu.',
      ],
      tips: [
        'Hệ thống có bộ kiểm tra năm học và lớp nghiêm ngặt, bảo đảm không bao giờ lẫn lộn số liệu lớp khác.',
      ],
    },
    {
      id: 'guide-10',
      number: 10,
      title: 'In Sổ Chủ Nhiệm chuẩn Bộ GD&ĐT',
      icon: Printer,
      summary: 'Tạo hồ sơ Sổ chủ nhiệm hoàn chỉnh, liên tục từ trang bìa đến trang cuối.',
      steps: [
        'Vào menu "In Sổ Chủ Nhiệm".',
        'Hệ thống tổng hợp liên tục: Bìa sổ, Kế hoạch, Cán bộ lớp, Sơ đồ chỗ ngồi, Sơ yếu lý lịch, Điểm danh, Kết quả học tập và Đánh giá cuối năm.',
        'Bấm "Xem trước khi in (Preview)" để kiểm tra ngắt trang và căn lề A4.',
        'Nhấn "In Sổ ngay" hoặc "Xuất tệp Excel / PDF" để lưu trữ.',
      ],
      tips: [
        'Hỗ trợ chế độ in ẩn các nút điều hướng trên trình duyệt (Ctrl + P chuẩn CSS @media print).',
      ],
    },
    {
      id: 'guide-11',
      number: 11,
      title: 'Sử dụng Trợ lý AI GVCN (Gemini 3.8 Flash)',
      icon: Sparkles,
      summary: 'Ứng dụng trí tuệ nhân tạo có kiểm duyệt hỗ trợ công tác chủ nhiệm.',
      steps: [
        'Vào menu "Trợ lý AI".',
        'Chọn tính năng mong muốn: Phân tích lớp, Phân tích học sinh, Gợi ý kế hoạch, Soạn nhận xét, Soạn nội dung họp PH, Phân tích xu hướng.',
        'Nhấn "Yêu cầu AI". Hệ thống sẽ tạo bản nháp với dữ liệu quan sát được và đề xuất sư phạm.',
        'Mỗi bản nháp AI bắt buộc có 3 nút: [Áp dụng] để lưu chính thức, [Chỉnh sửa] để sửa văn phong, [Hủy] để xóa bỏ.',
      ],
      tips: [
        'AI tuyệt đối không bao giờ tự tạo điểm hoặc bịa vi phạm. Khi thiếu dữ liệu sẽ thông báo "Chưa có dữ liệu để phân tích".',
      ],
    },
    {
      id: 'guide-12',
      number: 12,
      title: 'Sao lưu, Khôi phục dữ liệu & Chuyển lớp',
      icon: Database,
      summary: 'Bảo vệ dữ liệu an toàn tuyệt đối và chuyển tiếp học sinh lên lớp mới.',
      steps: [
        'Vào menu "Cài đặt" ➔ "Sao lưu & Khôi phục".',
        'Nhấn "Sao lưu dữ liệu ngay" để tải tệp JSON snapshot có kèm ngày giờ đầy đủ.',
        'Khi cần khôi phục: Tải tệp sao lưu lên hệ thống để phục hồi toàn bộ cơ sở dữ liệu.',
        'Khi sang năm học mới: Dùng chức năng "Chuyển dữ liệu sang năm học mới" để chọn học sinh được lên lớp và giữ lại hồ sơ cần thiết.',
      ],
      tips: [
        'Nên thực hiện sao lưu định kỳ hàng tuần hoặc trước mỗi đợt khóa sổ học kỳ.',
      ],
    },
  ];

  const filteredSections = guideSections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSection = guideSections.find((s) => s.id === selectedSectionId) || guideSections[0];
  const IconComponent = activeSection.icon;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Cẩm Nang Hướng Dẫn Sử Dụng Hệ Thống
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            HƯỚNG DẪN SỬ DỤNG SỔ CHỦ NHIỆM ĐIỆN TỬ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tài liệu hướng dẫn chi tiết 12 quy trình nghiệp vụ từ khởi tạo đến in ấn và sao lưu.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chủ đề hướng dẫn..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Guide Grid: Sidebar TOC + Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Contents List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-1.5 max-h-[750px] overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Mục lục chuyên đề ({guideSections.length})
          </div>

          {filteredSections.map((sec) => {
            const SecIcon = sec.icon;
            const isSelected = sec.id === activeSection.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sec.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{sec.title}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isSelected ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {sec.summary}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>

        {/* Detail Guide Content */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Chuyên đề số {activeSection.number}
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeSection.title}</h3>
            </div>
          </div>

          <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-xs text-sky-900 leading-relaxed font-semibold">
            {activeSection.summary}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Các bước thực hiện chuẩn nghiệp vụ:
            </h4>
            <div className="space-y-2.5">
              {activeSection.steps.map((st, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700"
                >
                  <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 leading-relaxed">{st}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips / Notes */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs space-y-2 text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <span>💡 Lưu ý quan trọng & Mẹo sử dụng:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 pl-1 leading-relaxed">
              {activeSection.tips.map((tp, idx) => (
                <li key={idx}>{tp}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
