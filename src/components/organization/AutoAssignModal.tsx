import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AutoAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CriteriaType =
  | 'stt'
  | 'gender-alternate'
  | 'group'
  | 'support-near-front'
  | 'study-buddies';

export const AutoAssignModal: React.FC<AutoAssignModalProps> = ({ isOpen, onClose }) => {
  const {
    autoAssignSeats,
    currentClassStudents,
    classroomConfig,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'criteria' | 'ai-suggestion'>('criteria');
  const [selectedCriteria, setSelectedCriteria] = useState<CriteriaType>('group');
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  if (!isOpen) return null;

  const totalSeats = classroomConfig.columns * classroomConfig.rows * classroomConfig.seatsPerDesk;
  const supportStudents = currentClassStudents.filter((s) => s.needsSupport || s.needsAttention);
  const boysCount = currentClassStudents.filter((s) => s.gender === 'Nam').length;
  const girlsCount = currentClassStudents.filter((s) => s.gender === 'Nữ').length;

  const handleApplyCriteria = () => {
    autoAssignSeats(selectedCriteria);
    setShowAppliedToast(true);
    setTimeout(() => {
      setShowAppliedToast(false);
      onClose();
    }, 1200);
  };

  const handleApplyAISuggestion = () => {
    // Áp dụng mô hình kết hợp sư phạm: Đôi bạn cùng tiến + học sinh cần hỗ trợ bàn đầu
    autoAssignSeats('study-buddies');
    setShowAppliedToast(true);
    setTimeout(() => {
      setShowAppliedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-700 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tự Động Sắp Xếp Chỗ Ngồi Lớp Học</h3>
              <p className="text-xs text-sky-200">
                Sử dụng thuật toán sư phạm hoặc Trợ lý AI gợi ý cách bố trí chỗ ngồi tối ưu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'criteria'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Chọn Tiêu Chí Sắp Xếp
          </button>
          <button
            onClick={() => setActiveTab('ai-suggestion')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ai-suggestion'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            2. Trợ Lý AI Đề Xuất Sư Phạm
          </button>
        </div>

        {/* Tab 1: Criteria Selection */}
        {activeTab === 'criteria' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="text-slate-600">
              Chọn tiêu chí bạn muốn hệ thống tự động gán học sinh vào các vị trí bàn ghế ({currentClassStudents.length} học sinh / {totalSeats} chỗ ngồi):
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: Theo tổ */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedCriteria === 'group'
                    ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="criteria"
                  checked={selectedCriteria === 'group'}
                  onChange={() => setSelectedCriteria('group')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    Theo Tổ Học Tập (Tổ 1 → Dãy 1, Tổ 2 → Dãy 2, Tổ 3 → Dãy 3, Tổ 4 → Dãy 4)
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                      Khuyên Dùng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Phù hợp quản lý theo nề nếp sinh hoạt Đội và chấm điểm thi đua 4 tổ tự quản của trường.
                  </p>
                </div>
              </label>

              {/* Option 2: Nam/Nữ xen kẽ */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedCriteria === 'gender-alternate'
                    ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="criteria"
                  checked={selectedCriteria === 'gender-alternate'}
                  onChange={() => setSelectedCriteria('gender-alternate')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs">
                    Nam / Nữ Xen Kẽ (Cân bằng giới tính từng bàn)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Lớp hiện có {boysCount} Nam và {girlsCount} Nữ. Thuật toán sẽ bố trí 1 nam 1 nữ cạnh nhau tại từng bàn, giúp lớp nghiêm túc và giảm tình trạng nói chuyện riêng.
                  </p>
                </div>
              </label>

              {/* Option 3: Đôi bạn cùng tiến */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedCriteria === 'study-buddies'
                    ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="criteria"
                  checked={selectedCriteria === 'study-buddies'}
                  onChange={() => setSelectedCriteria('study-buddies')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    Mô hình "Đôi Bạn Cùng Tiến" (Kèm Cặp)
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Sư Phạm Tốt
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tự động ghép học sinh cần hỗ trợ ngồi cùng bàn với các học sinh học lực Tốt hoặc có tiến bộ để hỗ trợ lẫn nhau trong giờ học.
                  </p>
                </div>
              </label>

              {/* Option 4: Học sinh cần hỗ trợ bàn đầu */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedCriteria === 'support-near-front'
                    ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="criteria"
                  checked={selectedCriteria === 'support-near-front'}
                  onChange={() => setSelectedCriteria('support-near-front')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs">
                    Ưu tiên Học Sinh Cần Hỗ Trợ Ngồi Bàn Đầu (Gần Bàn GV)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {supportStudents.length} học sinh có diện cần hỗ trợ sẽ được xếp ở Bàn 1 & 2 gần bục giảng để giáo viên dễ quan sát, uốn nắn.
                  </p>
                </div>
              </label>

              {/* Option 5: Theo STT */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedCriteria === 'stt'
                    ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="criteria"
                  checked={selectedCriteria === 'stt'}
                  onChange={() => setSelectedCriteria('stt')}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs">
                    Theo Số Thứ Tự (STT 1 → 31)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Xếp tuần tự theo danh sách điểm danh từ trên xuống dưới, thuận tiện tra cứu nhanh.
                  </p>
                </div>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {showAppliedToast ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Đã áp dụng sơ đồ chỗ ngồi mới!
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  * Bạn có thể tiếp tục kéo thả đổi chỗ tự do sau khi áp dụng.
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleApplyCriteria}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" /> Áp dụng sắp xếp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Suggestion */}
        {activeTab === 'ai-suggestion' && (
          <div className="p-6 space-y-4 text-xs">
            {/* AI Banner */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Đề Xuất Sư Phạm Từ Trợ Lý AI Giáo Viên Chủ Nhiệm
              </div>
              <p className="text-slate-600 leading-relaxed">
                Dựa trên phân tích <strong>dữ liệu thực tế của 31 học sinh lớp 7/1</strong> (3 học sinh diện cần hỗ trợ, 2 học sinh tiến bộ, tỷ lệ 17 Nam / 14 Nữ, 4 tổ học tập và vị trí bàn giáo viên ở góc phải phía trước):
              </p>
            </div>

            {/* Specific Pedagogical Suggestions */}
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900">Bố trí học sinh cần hỗ trợ ở hàng ghế trước</div>
                  <p className="text-slate-600 mt-0.5">
                    Đề xuất xếp em <strong>Lê Phan Tuấn Kiệt (hs-12)</strong>, <strong>Đinh Văn Phong (hs-19)</strong> và <strong>Lê Văn Quý (hs-21)</strong> ở Bàn 1 & Bàn 2 (Dãy 2 và Dãy 3) ngay tầm mắt giáo viên để thuận tiện theo dõi khả năng tiếp thu bài và chấn chỉnh nề nếp.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ghép cặp "Đôi bạn cùng tiến"</div>
                  <p className="text-slate-600 mt-0.5">
                    Xếp bạn <strong>Hồ Thái Thảo Nguyên (hs-2 - Lớp phó HT)</strong> ngồi cùng bàn để kèm bạn cần hỗ trợ; xếp bạn <strong>Trần Phan Nguyệt Ánh (hs-1 - Lớp trưởng)</strong> ở Dãy 1 để dễ bao quát chung.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900">Cân bằng giới tính & vai trò tổ tự quản</div>
                  <p className="text-slate-600 mt-0.5">
                    Phân bố các Tổ trưởng (Nhã Ý - T1, Mỹ Kim - T2, Ánh My - T3, Ánh Quỳnh - T4) ở đầu mỗi dãy để quản lý tốt việc điểm danh và nộp vở 15 phút đầu giờ.
                  </p>
                </div>
              </div>
            </div>

            {/* Principle reminder */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Nguyên tắc AI:</strong> AI chỉ đóng vai trò trợ lý đề xuất phương án sư phạm. Hệ thống <strong>không tự ý ghi đè dữ liệu</strong> cho tới khi GVCN bấm "Xác nhận áp dụng đề xuất".
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {showAppliedToast ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Đã áp dụng thành công đề xuất của AI!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy bỏ / Giữ nguyên sơ đồ cũ
                </button>
              )}

              <button
                type="button"
                onClick={handleApplyAISuggestion}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Xác nhận áp dụng đề xuất AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
