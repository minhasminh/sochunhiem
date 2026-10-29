import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  HelpCircle,
  Key,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, users, classes } = useApp();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);
  const [activeTab, setActiveTab] = useState<'common' | 'primary' | 'secondary'>('common');

  const executeLogin = (acc: string, pass: string) => {
    setErrorMessage(null);
    if (!acc.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Tài khoản đăng nhập.');
      return;
    }
    if (!pass) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(acc.trim(), pass, rememberMe);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(account, password);
  };

  const handleQuickFill = (acc: string, pass = '123', autoSubmit = false) => {
    setAccount(acc);
    setPassword(pass);
    setErrorMessage(null);
    if (autoSubmit) {
      executeLogin(acc, pass);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-sky-600/30 mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            SỔ CHỦ NHIỆM ĐIỆN TỬ
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Trường TH&THCS Nguyễn Đình Anh • Vận hành năm học 2026–2027
          </p>
        </div>

        {/* GitHub / Demo Quick Access Banner */}
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Đăng nhập nhanh (Tài khoản mẫu GitHub / Dùng thử)</span>
            </div>
            <span className="text-[11px] font-semibold bg-sky-200/70 text-sky-800 px-2 py-0.5 rounded-full">
              MK: 123
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', '123', true)}
              className="px-2.5 py-2 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl text-left transition-all shadow-xs hover:border-sky-300 group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                <span>👑 Quản trị viên</span>
                <span className="text-[10px] text-sky-600 opacity-80">1-chạm</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">admin (Toàn quyền)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('bgh', '123', true)}
              className="px-2.5 py-2 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl text-left transition-all shadow-xs hover:border-sky-300 group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                <span>🎓 Ban Giám Hiệu</span>
                <span className="text-[10px] text-sky-600 opacity-80">1-chạm</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">bgh (Duyệt sổ 32 lớp)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ducminh1973@gmail.com', '123', true)}
              className="px-2.5 py-2 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl text-left transition-all shadow-xs hover:border-sky-300 group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                <span>👨‍🏫 GVCN 7/1 (Thầy Minh)</span>
                <span className="text-[10px] text-sky-600 opacity-80">1-chạm</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">Khối THCS • Lớp 7/1</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('1/1', '123', true)}
              className="px-2.5 py-2 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl text-left transition-all shadow-xs hover:border-sky-300 group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                <span>👩‍🏫 GVCN 1/1 (Thầy Sùng)</span>
                <span className="text-[10px] text-sky-600 opacity-80">1-chạm</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">Khối Tiểu học • Lớp 1/1</div>
            </button>
          </div>

          {/* Toggle all 32 classes modal */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowAccountList(!showAccountList)}
              className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{showAccountList ? 'Ẩn danh sách 32 lớp' : '🔍 Xem & chọn tài khoản GVCN của 32 lớp'}</span>
              {showAccountList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible 32 Class Accounts Selector */}
          {showAccountList && (
            <div className="mt-2 p-3 bg-white border border-sky-200 rounded-xl shadow-xs space-y-2 max-h-56 overflow-y-auto">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('common')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    activeTab === 'common' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({classes.length} lớp)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('primary')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    activeTab === 'primary' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tiểu học (Khối 1–5)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('secondary')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    activeTab === 'secondary' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  THCS (Khối 6–9)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {classes
                  .filter((c) => {
                    const g = parseInt(c.grade) || 0;
                    if (activeTab === 'primary') return g >= 1 && g <= 5;
                    if (activeTab === 'secondary') return g >= 6 && g <= 9;
                    return true;
                  })
                  .map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleQuickFill(cls.className, '123', true)}
                      className="p-1.5 bg-slate-50 hover:bg-sky-100/60 border border-slate-200 rounded-lg text-left text-[11px] transition-all cursor-pointer truncate"
                      title={`Đăng nhập GVCN lớp ${cls.className}: ${cls.homeroomTeacherName}`}
                    >
                      <div className="font-bold text-sky-800">Lớp {cls.className}</div>
                      <div className="text-[10px] text-slate-600 truncate">{cls.homeroomTeacherName}</div>
                    </button>
                  ))}
              </div>
            </div>
          )}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Email, Tên đăng nhập hoặc Tên lớp</span>
              <span className="text-[11px] text-slate-400 font-normal">Hỗ trợ: admin, bgh, 7/1, 1/1...</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Nhập email, tên tài khoản hoặc tên lớp (vd: 7/1, admin)..."
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mật khẩu</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Mật khẩu mặc định: 123</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu (Mặc định: 123)..."
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
                className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500"
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
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5 animate-fade-in">
              <div className="font-bold text-slate-800">Quy tắc đăng nhập trên GitHub / Bản cài mới:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Mật khẩu mặc định toàn hệ thống là: <strong className="text-slate-800">123</strong> (chấp nhận cả 123456, admin).</li>
                <li>Có thể nhập trực tiếp tên lớp: <code className="bg-slate-200 px-1 py-0.5 rounded">7/1</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">1/1</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">9/3</code> để vào ngay Sổ của lớp đó.</li>
                <li>Tài khoản Quản trị: <code className="bg-slate-200 px-1 py-0.5 rounded">admin</code> hoặc <code className="bg-slate-200 px-1 py-0.5 rounded">ducminh1973@gmail.com</code>.</li>
                <li>Tài khoản Ban Giám Hiệu: <code className="bg-slate-200 px-1 py-0.5 rounded">bgh</code>.</li>
              </ul>
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
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-500">Trường TH&THCS Nguyễn Đình Anh</div>
          <div>Cơ sở dữ liệu Vận hành chính thức • Sẵn sàng đồng bộ GitHub</div>
        </div>
      </div>
    </div>
  );
};

