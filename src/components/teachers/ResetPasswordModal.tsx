import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: (msg: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { resetUserPassword } = useApp();

  const [newPassword, setNewPassword] = useState('Gv@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Gv@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleCopy = () => {
    const text = `Tài khoản: ${user.username}\nMật khẩu mới: ${newPassword}\nGiáo viên: ${user.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu mới!');
      return;
    }

    const res = resetUserPassword(user.id, newPassword.trim());
    if (res.success) {
      onSuccess?.(
        `Đã đặt lại mật khẩu cho tài khoản '${user.username}' thành công! Mật khẩu mới: ${res.temporaryPassword}`
      );
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Đặt Lại Mật Khẩu Giáo Viên</h3>
              <p className="text-xs text-amber-100">Cấp mật khẩu mới cho tài khoản đăng nhập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Info Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">{user.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                {user.role}
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Tên tài khoản: <strong className="font-mono text-purple-700">{user.username}</strong>
            </div>
            {user.plainPassword && (
              <div className="text-slate-400 text-[10px]">
                Mật khẩu hiện tại: <span className="font-mono">{user.plainPassword}</span>
              </div>
            )}
          </div>

          {/* New Password Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mật khẩu mới cấp lại:</span>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-amber-700 hover:text-amber-900 font-bold text-[10px] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Tạo ngẫu nhiên
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Copy Snippet */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép!' : 'Sao chép thông tin bàn giao'}
            </button>
            <span className="text-[10px] text-slate-400">Yêu cầu đổi MK khi đăng nhập</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Lưu mật khẩu mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
