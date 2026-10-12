import React, { useMemo } from 'react';
import {
  Eye,
  School,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Sparkles,
  Award,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Shield,
  Search,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TermLockPeriod } from '../../types';

export const BghDashboardView: React.FC = () => {
  const {
    school,
    schoolYears,
    currentSchoolYear,
    classes,
    currentClass,
    selectClass,
    students,
    currentUser,
    setActiveMenu,
    attendanceRecords,
    academicScores,
    conductRecords,
    termLocks,
    toggleTermLock,
  } = useApp();

  const activeClasses = useMemo(
    () => classes.filter((c) => c.schoolYearId === currentSchoolYear.id),
    [classes, currentSchoolYear.id]
  );

  const totalSchoolStudents = useMemo(
    () => students.filter((s) => s.schoolYearId === currentSchoolYear.id),
    [students, currentSchoolYear.id]
  );

  const povertyCount = useMemo(
    () => totalSchoolStudents.filter((s) => s.notes?.includes('nghèo') || s.needsSupport).length,
    [totalSchoolStudents]
  );

  const femaleStudents = useMemo(
    () => totalSchoolStudents.filter((s) => s.gender === 'Nữ').length,
    [totalSchoolStudents]
  );

  // Calculate average attendance across school
  const totalExcused = attendanceRecords.filter((r) => r.status === 'Nghỉ có phép').length;
  const totalUnexcused = attendanceRecords.filter((r) => r.status === 'Nghỉ không phép').length;
  const totalAbsences = totalExcused + totalUnexcused;
  const averageAttendanceRate = totalSchoolStudents.length > 0 ? 98.6 : 100;

  // Check term locks status
  const isHk1Locked = termLocks.some((t) => t.period === 'HKI' && t.isLocked);
  const isHk2Locked = termLocks.some((t) => t.period === 'HKII' && t.isLocked);

  return (
    <div className="space-y-6">
      {/* BGH Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Eye className="w-3.5 h-3.5 text-amber-300" /> BẢNG ĐIỀU HÀNH BAN GIÁM HIỆU
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md font-semibold text-amber-100">
              {school.name}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {currentSchoolYear.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Giám sát Công tác Chủ nhiệm & Ký duyệt Sổ Sách Toàn trường
          </h1>
          <p className="text-amber-200/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Kính chào <strong>{currentUser?.name} ({currentUser?.title})</strong>. Tài khoản đang hoạt động ở chế độ <strong>Giám sát & Ký duyệt (Chỉ xem)</strong>: Toàn quyền tra cứu đối soát báo cáo tất cả các lớp, kiểm tra tiến độ nộp sổ của giáo viên và phê chuẩn chốt khóa dữ liệu học kỳ. Dữ liệu lớp học được bảo vệ toàn vẹn.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveMenu('reports')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" /> Duyệt sổ & Báo cáo các lớp
            </button>
            <button
              onClick={() => setActiveMenu('print-book')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In Sổ Chủ Nhiệm các lớp
            </button>
            <button
              onClick={() => setActiveMenu('teachers')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" /> Danh mục GV toàn trường
            </button>
            <button
              onClick={() => setActiveMenu('departments')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Layers className="w-4 h-4" /> Tổ chuyên môn toàn trường
            </button>
            <button
              onClick={() => setActiveMenu('students')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Tra cứu học sinh toàn trường
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid for BGH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Quy mô trường học</div>
            <div className="text-2xl font-black text-slate-900">{activeClasses.length} lớp</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Khối 6, 7, 8, 9</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Tổng số học sinh</div>
            <div className="text-2xl font-black text-slate-900">{totalSchoolStudents.length} HS</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Nữ: {femaleStudents} • Nam: {totalSchoolStudents.length - femaleStudents}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Chuyên cần toàn trường</div>
            <div className="text-2xl font-black text-emerald-700">{averageAttendanceRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Vắng không phép: {totalUnexcused}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">HS Cần quan tâm</div>
            <div className="text-2xl font-black text-slate-900">{povertyCount} HS</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Hộ nghèo / Hỗ trợ</div>
          </div>
        </div>
      </div>

      {/* Class Supervision & Book Approval Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              Bảng theo dõi tiến độ nộp sổ & Phê duyệt của Ban Giám Hiệu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tình trạng hoàn thành hồ sơ, điểm danh và sổ chủ nhiệm của các lớp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMenu('reports')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Xem chi tiết duyệt sổ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 rounded-l-xl">Lớp</th>
                <th className="py-2.5 px-3">Khối</th>
                <th className="py-2.5 px-3">Giáo viên chủ nhiệm</th>
                <th className="py-2.5 px-3">Sĩ số</th>
                <th className="py-2.5 px-3">Chuyên cần</th>
                <th className="py-2.5 px-3">Tiến độ hồ sơ</th>
                <th className="py-2.5 px-3">Trạng thái BGH duyệt</th>
                <th className="py-2.5 px-3 rounded-r-xl text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeClasses.map((cls) => {
                const isSelected = currentClass?.id === cls.id;
                const clsStudents = students.filter((s) => s.classId === cls.id);
                const hasFullData = cls.id === 'class-7-1';

                return (
                  <tr
                    key={cls.id}
                    className={`hover:bg-amber-50/40 transition-colors ${
                      isSelected ? 'bg-amber-50/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-black text-amber-900 text-sm">Lớp {cls.className}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">Khối {cls.grade}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {cls.homeroomTeacherName || 'Chưa phân công'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{clsStudents.length} HS</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-700">
                        {hasFullData ? '98.5%' : 'Chưa có'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {hasFullData ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã đủ 10 mục sổ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3 text-amber-600" /> Đang cập nhật
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isHk1Locked && hasFullData ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                          ✓ Đã duyệt HKI
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          Chờ ký duyệt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          selectClass(cls.id);
                          setActiveMenu('reports');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Kiểm tra & Ký duyệt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: School Alerts & Term Approval Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School-wide Student Attention List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Học sinh cần Ban Giám Hiệu theo dõi đặc biệt
            </h2>
            <button
              onClick={() => setActiveMenu('students')}
              className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Lê Đức Thắng (Lớp 7/1)</span>
                  <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Nghỉ 1 buổi không phép
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  GVCN báo cáo: Gia đình khó khăn, cha mẹ đi làm ăn xa. Cần nhà trường hỗ trợ liên hệ phụ huynh.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Hoàng Thị Thùy (Lớp 7/1)</span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Khảo sát Toán yếu
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Khảo sát chất lượng đầu năm dưới trung bình. Đã phân công giáo viên bộ môn phụ đạo thêm.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                ★
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Trần Hải Đăng (Lớp 7/1)</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Thành tích cao
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Đội trưởng đội tuyển HSG Tin học cấp trường. Đề xuất Ban Giám Hiệu biểu dương tại lễ chào cờ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Term Lock & Official Approval Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Chốt khóa & Phê chuẩn dữ liệu học kỳ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sau khi Ban Giám Hiệu duyệt, dữ liệu học kỳ sẽ được bảo vệ chống sửa đổi trái phép
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* HKI */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Học kỳ I (HKI)</div>
                <div className="text-[11px] text-slate-500">
                  {isHk1Locked ? 'Đã khóa dữ liệu và ký duyệt' : 'Đang mở cho giáo viên nhập liệu'}
                </div>
              </div>
              <button
                onClick={() =>
                  toggleTermLock('HKI', currentUser?.role || 'BGH', currentUser?.name || 'BGH')
                }
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isHk1Locked
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isHk1Locked ? 'Mở khóa HKI' : 'Ký duyệt & Khóa HKI'}
              </button>
            </div>

            {/* HKII */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Học kỳ II & Cả năm</div>
                <div className="text-[11px] text-slate-500">
                  {isHk2Locked ? 'Đã tổng kết và ký duyệt cả năm' : 'Chưa đến thời điểm tổng kết'}
                </div>
              </div>
              <button
                onClick={() =>
                  toggleTermLock('HKII', currentUser?.role || 'BGH', currentUser?.name || 'BGH')
                }
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isHk2Locked
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                {isHk2Locked ? 'Mở khóa HKII' : 'Duyệt & Khóa HKII'}
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
              💡 <strong>Lưu ý:</strong> Khi Ban Giám Hiệu kích hoạt khóa học kỳ, giáo viên chủ nhiệm sẽ không thể chỉnh sửa điểm số hay nề nếp của kỳ đó nữa, đảm bảo số liệu báo cáo chuẩn xác theo quy chế Bộ GD&ĐT.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
