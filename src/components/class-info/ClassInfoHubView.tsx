import React, { useState } from 'react';
import { School, Calendar, Users, Eye, Settings, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YearAndClassView } from '../organization/YearAndClassView';
import { ClassDetailView } from './ClassDetailView';

export const ClassInfoHubView: React.FC = () => {
  const { currentUser, currentClass, classes, currentSchoolYear, selectClass } = useApp();

  const [adminTab, setAdminTab] = useState<'years-classes' | 'class-details'>('years-classes');
  const [bghTab, setBghTab] = useState<'class-directory' | 'class-details'>('class-directory');

  // If user is ADMIN: give them full administrative tabs
  if (currentUser?.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Navigation Tabs for ADMIN */}
        <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setAdminTab('years-classes')}
              className={`py-2.5 px-4 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                adminTab === 'years-classes'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Quản trị Niên khóa & Toàn bộ Lớp học</span>
            </button>

            <button
              onClick={() => setAdminTab('class-details')}
              className={`py-2.5 px-4 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                adminTab === 'class-details'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <School className="w-4 h-4" />
              <span>2. Hồ sơ chi tiết lớp & GVBM (Lớp {currentClass?.className || '7/1'})</span>
            </button>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
            🛡️ QUẢN TRỊ VIÊN HỆ THỐNG
          </span>
        </div>

        {adminTab === 'years-classes' ? <YearAndClassView /> : <ClassDetailView />}
      </div>
    );
  }

  // If user is BGH: give them school-wide class directory & inspection view
  if (currentUser?.role === 'BGH') {
    const activeYearClasses = classes.filter((c) => c.schoolYearId === currentSchoolYear.id);

    return (
      <div className="space-y-6">
        {/* Navigation Tabs for BGH */}
        <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setBghTab('class-directory')}
              className={`py-2.5 px-4 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                bghTab === 'class-directory'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <School className="w-4 h-4" />
              <span>1. Danh mục Lớp học toàn trường ({activeYearClasses.length} lớp)</span>
            </button>

            <button
              onClick={() => setBghTab('class-details')}
              className={`py-2.5 px-4 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
                bghTab === 'class-details'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>2. Xem hồ sơ lớp & GVBM (Lớp {currentClass?.className || '7/1'})</span>
            </button>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
            👔 BAN GIÁM HIỆU (GIÁM SÁT)
          </span>
        </div>

        {bghTab === 'class-directory' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <School className="w-4 h-4 text-amber-600" />
                    Danh sách các lớp học trong trường ({currentSchoolYear.name})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn lớp để giám sát thông tin chi tiết và giáo viên bộ môn
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeYearClasses.map((cls) => {
                  const isCurrent = currentClass?.id === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900">
                              Lớp {cls.className}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                              Khối {cls.grade}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-600 mt-1">
                            GVCN: <span className="text-amber-800 font-bold">{cls.homeroomTeacherName || 'Chưa gán'}</span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {cls.studentCount} HS
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        <div>Phòng học: <strong className="text-slate-700">{cls.roomNumber || 'N/A'}</strong></div>
                        <div>Ca học: <strong className="text-slate-700">{cls.studyShift || 'Buổi sáng'}</strong></div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            selectClass(cls.id);
                            setBghTab('class-details');
                          }}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem hồ sơ lớp này
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <ClassDetailView />
        )}
      </div>
    );
  }

  // For GVCN: Direct Homeroom Class & Subject Teacher View
  return <ClassDetailView />;
};
