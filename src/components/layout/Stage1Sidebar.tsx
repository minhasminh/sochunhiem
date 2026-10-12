import React from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  LayoutGrid,
  ClipboardList,
  BookCheck,
  BookOpen,
  Smile,
  Award,
  Compass,
  FileText,
  Printer,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MainMenuItem } from '../../types';

interface MenuItemConfig {
  id: MainMenuItem;
  label: string;
  icon: React.ElementType;
  isReady: boolean; // true: đã hoàn thiện trong Giai đoạn 1; false: "Đang phát triển"
}

export const Stage1Sidebar: React.FC = () => {
  const {
    activeMenu,
    setActiveMenu,
    sidebarOpen,
    setSidebarOpen,
    currentClass,
    currentSchoolYear,
    currentUser,
  } = useApp();

  const menuSections: { title: string; roles: string[]; items: MenuItemConfig[] }[] = [
    // 1. ADMIN MENU
    {
      title: 'TỔNG QUAN QUẢN TRỊ',
      roles: ['ADMIN'],
      items: [
        { id: 'dashboard', label: 'Dashboard Quản trị', icon: LayoutDashboard, isReady: true },
      ],
    },
    {
      title: 'QUẢN TRỊ NHÂN SỰ & HỌC SINH',
      roles: ['ADMIN'],
      items: [
        { id: 'teachers', label: 'Hồ sơ GV toàn trường', icon: GraduationCap, isReady: true },
        { id: 'departments', label: 'Tổ chuyên môn', icon: Layers, isReady: true },
        { id: 'students', label: 'Hồ sơ HS toàn trường', icon: Users, isReady: true },
      ],
    },
    {
      title: 'QUẢN TRỊ NIÊN KHÓA & LỚP',
      roles: ['ADMIN'],
      items: [
        { id: 'class-info', label: 'Niên khóa & Lớp học', icon: School, isReady: true },
      ],
    },
    {
      title: 'HỆ THỐNG & SAO LƯU CSDL',
      roles: ['ADMIN'],
      items: [
        { id: 'settings', label: 'Cài đặt & Sao lưu CSDL', icon: Settings, isReady: true },
        { id: 'system-testing', label: 'Kiểm thử & Tính toàn vẹn', icon: ClipboardList, isReady: true },
      ],
    },
    {
      title: 'BÁO CÁO & XUẤT BẢN',
      roles: ['ADMIN'],
      items: [
        { id: 'reports', label: 'Báo cáo tổng hợp trường', icon: FileText, isReady: true },
        { id: 'print-book', label: 'In Sổ Chủ Nhiệm các lớp', icon: Printer, isReady: true },
      ],
    },
    {
      title: 'TRỢ GIÚP',
      roles: ['ADMIN'],
      items: [
        { id: 'user-guide', label: 'Hướng dẫn sử dụng', icon: BookOpen, isReady: true },
      ],
    },

    // 2. BGH (BAN GIÁM HIỆU) MENU
    {
      title: 'TỔNG QUAN BAN GIÁM HIỆU',
      roles: ['BGH'],
      items: [
        { id: 'dashboard', label: 'Dashboard BGH & Giám sát', icon: LayoutDashboard, isReady: true },
      ],
    },
    {
      title: 'GIÁM SÁT & KÝ DUYỆT SỔ',
      roles: ['BGH'],
      items: [
        { id: 'reports', label: 'Báo cáo & Duyệt sổ', icon: FileText, isReady: true },
        { id: 'print-book', label: 'In Sổ Chủ Nhiệm các lớp', icon: Printer, isReady: true },
        { id: 'class-info', label: 'Danh mục Lớp & GVCN', icon: School, isReady: true },
      ],
    },
    {
      title: 'GIÁM SÁT DỮ LIỆU CÁC LỚP',
      roles: ['BGH'],
      items: [
        { id: 'teachers', label: 'Hồ sơ GV toàn trường', icon: GraduationCap, isReady: true },
        { id: 'departments', label: 'Tổ chuyên môn', icon: Layers, isReady: true },
        { id: 'students', label: 'Tra cứu HS toàn trường', icon: Users, isReady: true },
        { id: 'attendance', label: 'Giám sát Chuyên cần', icon: BookCheck, isReady: true },
        { id: 'academic', label: 'Giám sát Học tập', icon: BookOpen, isReady: true },
        { id: 'conduct', label: 'Nề nếp & Khen thưởng', icon: Smile, isReady: true },
        { id: 'competition', label: 'Thi đua toàn trường', icon: Award, isReady: true },
      ],
    },
    {
      title: 'CÔNG CỤ & TRỢ GIÚP',
      roles: ['BGH'],
      items: [
        { id: 'ai-assistant', label: 'Trợ lý AI Ban Giám Hiệu', icon: Sparkles, isReady: true },
        { id: 'user-guide', label: 'Hướng dẫn sử dụng', icon: BookOpen, isReady: true },
      ],
    },

    // 3. GVCN (GIÁO VIÊN CHỦ NHIỆM) MENU
    {
      title: 'TỔNG QUAN LỚP CHỦ NHIỆM',
      roles: ['GVCN', 'GIÁO VIÊN', 'GVBM'],
      items: [
        { id: 'dashboard', label: 'Dashboard Lớp chủ nhiệm', icon: LayoutDashboard, isReady: true },
      ],
    },
    {
      title: 'QUẢN LÝ LỚP CHỦ NHIỆM',
      roles: ['GVCN', 'GIÁO VIÊN', 'GVBM'],
      items: [
        { id: 'class-info', label: 'Thông tin lớp & GVBM', icon: School, isReady: true },
        { id: 'students', label: 'Hồ sơ học sinh lớp', icon: Users, isReady: true },
        { id: 'seating-chart', label: 'Sơ đồ chỗ ngồi & Cán bộ', icon: LayoutGrid, isReady: true },
        { id: 'plans', label: 'Kế hoạch chủ nhiệm', icon: ClipboardList, isReady: true },
      ],
    },
    {
      title: 'THEO DÕI HỌC SINH',
      roles: ['GVCN', 'GIÁO VIÊN', 'GVBM'],
      items: [
        { id: 'attendance', label: 'Điểm danh chuyên cần', icon: BookCheck, isReady: true },
        { id: 'academic', label: 'Kết quả học tập', icon: BookOpen, isReady: true },
        { id: 'conduct', label: 'Rèn luyện & Hạnh kiểm', icon: Smile, isReady: true },
        { id: 'competition', label: 'Thi đua 4 tổ', icon: Award, isReady: true },
        { id: 'activities', label: 'Hoạt động phong trào', icon: Compass, isReady: true },
      ],
    },
    {
      title: 'BÁO CÁO & XUẤT BẢN',
      roles: ['GVCN', 'GIÁO VIÊN', 'GVBM'],
      items: [
        { id: 'reports', label: 'Báo cáo & Sơ kết sổ', icon: FileText, isReady: true },
        { id: 'print-book', label: 'In Sổ Chủ Nhiệm (GĐ9)', icon: Printer, isReady: true },
        { id: 'ai-assistant', label: 'Trợ lý AI GVCN', icon: Sparkles, isReady: true },
      ],
    },
    {
      title: 'TRỢ GIÚP & CÀI ĐẶT',
      roles: ['GVCN', 'GIÁO VIÊN', 'GVBM'],
      items: [
        { id: 'user-guide', label: 'Hướng dẫn sử dụng', icon: BookOpen, isReady: true },
        { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings, isReady: true },
      ],
    },
  ];

  // Filter sections according to current role
  const visibleSections = menuSections.filter((section) => {
    return currentUser ? section.roles.includes(currentUser.role) : false;
  });

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-300 z-20 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } border-r border-slate-800 fixed lg:static inset-y-0 left-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-900 text-purple-200 border border-purple-700'
                  : currentUser?.role === 'BGH'
                  ? 'bg-amber-900 text-amber-200 border border-amber-700'
                  : 'bg-sky-900 text-sky-200 border border-sky-700'
              }`}
            >
              {currentUser?.role === 'ADMIN'
                ? 'MENU QUẢN TRỊ VIÊN'
                : currentUser?.role === 'BGH'
                ? 'MENU BAN GIÁM HIỆU'
                : 'MENU GIÁO VIÊN'}
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
          title={sidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3 custom-scrollbar">
        {visibleSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {sidebarOpen && (
              <div className="px-3 pt-1 pb-0.5 text-[9px] font-black tracking-wider uppercase text-slate-400">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={`${sec.title}-${item.id}`}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  title={sidebarOpen ? undefined : item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? currentUser?.role === 'ADMIN'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                        : currentUser?.role === 'BGH'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                        : 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />

                  {sidebarOpen && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      {sidebarOpen && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 truncate">
              Lớp {currentClass?.className} • {currentSchoolYear.code}
            </span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-300'
                  : currentUser?.role === 'BGH'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-sky-500/20 text-sky-300'
              }`}
            >
              {currentUser?.role}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            GVCN: {currentClass?.homeroomTeacherName}
          </div>
        </div>
      )}
    </aside>
  );
};
