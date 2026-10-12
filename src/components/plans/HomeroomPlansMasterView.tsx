import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  CalendarRange,
  Printer,
  Sparkles,
} from 'lucide-react';
import { YearlyPlanView } from './YearlyPlanView';
import { MonthlyPlanView } from './MonthlyPlanView';
import { ScheduleView } from './ScheduleView';
import { PrintPlanModal } from './PrintPlanModal';
import { useApp } from '../../context/AppContext';

export const HomeroomPlansMasterView: React.FC = () => {
  const { currentClass, currentSchoolYear } = useApp();

  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly' | 'schedule'>('yearly');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState<'yearly' | 'monthly' | 'schedule'>('yearly');
  const [selectedMonthIdForPrint, setSelectedMonthIdForPrint] = useState<string | undefined>(undefined);

  const handleOpenPrint = (doc: 'yearly' | 'monthly' | 'schedule', monthId?: string) => {
    setPrintDoc(doc);
    setSelectedMonthIdForPrint(monthId);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Hub */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'yearly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>1. Kế Hoạch Năm Học</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Kế Hoạch Theo Tháng</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>3. Lịch Công Việc (Tuần / Tháng)</span>
          </button>
        </div>

        {/* Global Print Button */}
        <div className="pr-2 min-w-max">
          <button
            onClick={() => handleOpenPrint(activeTab)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In tài liệu</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'yearly' && (
        <YearlyPlanView onOpenPrint={() => handleOpenPrint('yearly')} />
      )}

      {activeTab === 'monthly' && (
        <MonthlyPlanView onOpenPrint={(mId) => handleOpenPrint('monthly', mId)} />
      )}

      {activeTab === 'schedule' && (
        <ScheduleView onOpenPrint={() => handleOpenPrint('schedule')} />
      )}

      {/* Print Modal */}
      <PrintPlanModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        initialDoc={printDoc}
        selectedMonthId={selectedMonthIdForPrint}
      />
    </div>
  );
};
