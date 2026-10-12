import React, { useState } from 'react';
import { X, Save, Settings, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassroomConfig } from '../../types';

interface ClassroomConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomConfigModal: React.FC<ClassroomConfigModalProps> = ({ isOpen, onClose }) => {
  const { classroomConfig, updateClassroomConfig, currentClassStudents } = useApp();

  const [form, setForm] = useState<ClassroomConfig>({ ...classroomConfig });
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const totalSeats = form.columns * form.rows * form.seatsPerDesk;
  const totalStudents = currentClassStudents.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassroomConfig(form);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Settings className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cấu hình Quy cách Lớp học</h3>
              <p className="text-xs text-sky-200">Thiết lập số dãy, số bàn và các vị trí sư phạm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Sĩ số vs Chỗ ngồi thông báo */}
          <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-sky-900">Sức chứa phòng học:</div>
              <div className="text-slate-600">
                {form.columns} dãy × {form.rows} bàn × {form.seatsPerDesk} chỗ ={' '}
                <span className="font-bold text-sky-700">{totalSeats} chỗ ngồi</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Sĩ số học sinh:</div>
              <div className={`font-black text-sm ${totalSeats < totalStudents ? 'text-rose-600' : 'text-emerald-600'}`}>
                {totalStudents} học sinh
              </div>
            </div>
          </div>

          {totalSeats < totalStudents && (
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-[11px]">
              ⚠️ Cảnh báo: Tổng số chỗ ngồi ({totalSeats}) nhỏ hơn sĩ số lớp ({totalStudents}). Vui lòng tăng số dãy hoặc số bàn để đủ chỗ cho tất cả học sinh!
            </div>
          )}

          {/* Grid cấu hình số lượng */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số dãy bàn:</label>
              <select
                value={form.columns}
                onChange={(e) => setForm({ ...form, columns: parseInt(e.target.value) || 4 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value={2}>2 dãy (Dãy đôi)</option>
                <option value={3}>3 dãy bàn</option>
                <option value={4}>4 dãy (4 tổ - chuẩn)</option>
                <option value={5}>5 dãy bàn</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số bàn / dãy:</label>
              <select
                value={form.rows}
                onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value) || 4 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value={3}>3 bàn mỗi dãy</option>
                <option value={4}>4 bàn mỗi dãy (chuẩn)</option>
                <option value={5}>5 bàn mỗi dãy</option>
                <option value={6}>6 bàn mỗi dãy</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số chỗ / bàn:</label>
              <select
                value={form.seatsPerDesk}
                onChange={(e) => setForm({ ...form, seatsPerDesk: parseInt(e.target.value) || 2 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value={1}>1 học sinh/bàn</option>
                <option value={2}>2 học sinh/bàn (chuẩn)</option>
                <option value={3}>3 học sinh/bàn</option>
              </select>
            </div>
          </div>

          {/* Vị trí bảng và bàn giáo viên */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vị trí Bảng viết:</label>
              <select
                value={form.boardPosition}
                onChange={(e) => setForm({ ...form, boardPosition: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value="top-center">Giữa phía trước (Chuẩn)</option>
                <option value="top-left">Lệch trái phía trước</option>
                <option value="top-right">Lệch phải phía trước</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Vị trí Bàn Giáo Viên:</label>
              <select
                value={form.teacherDeskPosition}
                onChange={(e) => setForm({ ...form, teacherDeskPosition: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value="top-right">Góc phải phía trước (Mẫu Sổ CN)</option>
                <option value="top-left">Góc trái phía trước</option>
              </select>
            </div>
          </div>

          {/* Vị trí Cửa ra vào & Ghi chú phòng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vị trí Cửa ra vào:</label>
              <select
                value={form.doorPosition}
                onChange={(e) => setForm({ ...form, doorPosition: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-medium"
              >
                <option value="top-right">Cửa trước bên phải</option>
                <option value="top-left">Cửa trước bên trái</option>
                <option value="bottom-right">Cửa sau bên phải</option>
                <option value="bottom-left">Cửa sau bên trái</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ghi chú phòng học:</label>
              <input
                type="text"
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="VD: P.204, tầng 2, dãy nhà B"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {success ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu cấu hình lớp học!
              </span>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu cấu hình
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
