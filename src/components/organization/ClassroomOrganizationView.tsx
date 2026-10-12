import React, { useState } from 'react';
import {
  LayoutGrid,
  Award,
  HeartHandshake,
  Printer,
  Sparkles,
  Users,
  Settings,
} from 'lucide-react';
import { SeatingChartView } from './SeatingChartView';
import { ClassOfficersView } from './ClassOfficersView';
import { ParentRepsView } from './ParentRepsView';
import { PrintOrganizationModal } from './PrintOrganizationModal';
import { useApp } from '../../context/AppContext';

export const ClassroomOrganizationView: React.FC = () => {
  const { currentClass, currentSchoolYear } = useApp();

  const [activeTab, setActiveTab] = useState<'seating' | 'officers' | 'parentReps'>('seating');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState<'seating' | 'officers' | 'parentReps'>('seating');

  const handleOpenPrint = (doc: 'seating' | 'officers' | 'parentReps') => {
    setPrintDoc(doc);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Hub */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('seating')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'seating'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>1. Sơ Đồ Chỗ Ngồi & Lớp Học</span>
          </button>

          <button
            onClick={() => setActiveTab('officers')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'officers'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>2. Ban Cán Sự & Cán Bộ Lớp</span>
          </button>

          <button
            onClick={() => setActiveTab('parentReps')}
            className={`py-3 px-5 rounded-2xl flex items-center gap-2 transition-all ${
              activeTab === 'parentReps'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>3. Ban Đại Diện CMHS</span>
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
      {activeTab === 'seating' && (
        <SeatingChartView onOpenPrint={() => handleOpenPrint('seating')} />
      )}

      {activeTab === 'officers' && (
        <ClassOfficersView onOpenPrint={() => handleOpenPrint('officers')} />
      )}

      {activeTab === 'parentReps' && (
        <ParentRepsView onOpenPrint={() => handleOpenPrint('parentReps')} />
      )}

      {/* Print Modal */}
      <PrintOrganizationModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        initialDocument={printDoc}
      />
    </div>
  );
};
