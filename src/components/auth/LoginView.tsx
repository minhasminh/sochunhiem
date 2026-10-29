import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  School,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupportInfo, setShowSupportInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAcc = account.trim();
    if (!cleanAcc) {
      setErrorMessage('Vui lòng nhập Email hoặc Tài khoản đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(cleanAcc, password, rememberMe);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e?.message || 'Lỗi kết nối máy chủ.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-sky-600/30 mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              <School className="w-3 h-3" />
              <span>Cổng Thông Tin Giáo Dục</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            SỔ CHỦ NHIỆM ĐIỆN TỬ
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Trường TH&THCS Nguyễn Đình Anh • Vận hành năm học 2026–2027
          </p>
        </div>

        {/* Official Security Portal Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-700 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[11px] uppercase tracking-wide text-slate-800">
              Vận hành chính thức
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Bảo mật tài khoản cá nhân cán bộ & giáo viên
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kích hoạt</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email hoặc Tên đăng nhập
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Nhập email hoặc tên tài khoản được cấp..."
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Help link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              onClick={() => setShowSupportInfo(!showSupportInfo)}
              className="text-slate-500 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hỗ trợ kỹ thuật</span>
            </button>
          </div>

          {/* Support guidance accordion */}
          {showSupportInfo && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2 animate-fade-in">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-sky-600" />
                <span>Thông tin tài khoản đăng nhập chính thức:</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                  <span>👑 <strong>Quản trị viên (ADMIN):</strong> <code className="text-sky-700">admin</code> hoặc <code className="text-sky-700">ducminh1973@gmail.com</code> (MK: <code className="text-emerald-700">T@mduc88$#</code>)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAccount('admin');
                      setPassword('T@mduc88$#');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-2 py-0.5 rounded hover:bg-sky-50 cursor-pointer"
                  >
                    Điền
                  </button>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                  <span>👨‍🏫 <strong>Giáo viên & BGH:</strong> Email cá nhân hoặc Mã lớp (vd: <code className="text-sky-700">1/1</code>, <code className="text-sky-700">7/1</code>) • MK: <code className="text-emerald-700">Giaovien@2026</code></span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic pt-1">
                Quý Thầy/Cô quên mật khẩu hoặc cần cấp lại tài khoản vui lòng liên hệ Ban Giám Hiệu hoặc Quản trị mạng nhà trường.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            <span>Đăng nhập hệ thống</span>
          </button>

          {/* Discreet 1-click Admin login shortcut for testing/recovery */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={async () => {
                setAccount('admin');
                setPassword('T@mduc88$#');
                setErrorMessage(null);
                setIsLoading(true);
                try {
                  const res = await login('admin', 'T@mduc88$#', true);
                  setIsLoading(false);
                  if (!res.success) {
                    setErrorMessage(res.message || 'Không thể đăng nhập tài khoản quản trị.');
                  }
                } catch (err: any) {
                  setIsLoading(false);
                  setErrorMessage(err?.message || 'Lỗi kết nối máy chủ.');
                }
              }}
              className="text-[11px] text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Đăng nhập nhanh với quyền Quản trị viên (admin)</span>
            </button>
          </div>
        </form>

        {/* Footer info & Server Sync Indicator */}
        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Máy chủ trực tuyến • Đồng bộ đa thiết bị tự động</span>
          </div>
          <div className="font-semibold text-slate-500">Trường TH&THCS Nguyễn Đình Anh</div>
          <div>Cơ sở dữ liệu Vận hành chính thức • Phiên bản 1.0</div>
        </div>
      </div>
    </div>
  );
};
export default LoginView;
