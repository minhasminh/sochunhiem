import React from 'react';
import { Hammer, Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InDevelopmentViewProps {
  moduleName: string;
  expectedStage: number;
  plannedFeatures: string[];
}

export const InDevelopmentView: React.FC<InDevelopmentViewProps> = ({
  moduleName,
  expectedStage,
  plannedFeatures,
}) => {
  const { setActiveMenu, currentClass, currentSchoolYear } = useApp();

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
        <Hammer className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
          Đang phát triển
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Module: {moduleName}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Chức năng này thuộc kế hoạch triển khai của <strong>Giai đoạn {expectedStage}</strong>. Hệ thống không tạo chức năng giả theo đúng nguyên tắc kỹ thuật.
        </p>
      </div>

      <div className="p-5 bg-white rounded-3xl border border-slate-200 text-left text-xs space-y-3 shadow-xs">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Clock className="w-4 h-4 text-sky-600" />
          Nội dung nghiệp vụ dự kiến triển khai:
        </div>
        <ul className="space-y-1.5 text-slate-600">
          {plannedFeatures.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Về Dashboard tổng quan
        </button>
      </div>
    </div>
  );
};
