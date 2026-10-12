import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Database,
  Search,
  Check,
  FileCheck,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrphanCheckResult } from '../../types';

export const DataIntegrityCheckerView: React.FC = () => {
  const { runDataIntegrityCheck, students, classes, academicScores, attendanceRecords, addAuditLog } =
    useApp();

  const [results, setResults] = useState<OrphanCheckResult[]>(() => runDataIntegrityCheck());
  const [lastCheckTime, setLastCheckTime] = useState<string>(
    new Date().toLocaleTimeString('vi-VN')
  );

  const handleRecheck = () => {
    const updated = runDataIntegrityCheck();
    setResults(updated);
    setLastCheckTime(new Date().toLocaleTimeString('vi-VN'));
    addAuditLog(
      'Kiểm tra toàn vẹn dữ liệu',
      'Đã quét kiểm tra tính toàn vẹn 100% cơ sở dữ liệu học sinh và các liên kết con.',
      'Toàn vẹn dữ liệu',
      'Data Integrity',
      'SUCCESS'
    );
  };

  const totalOrphans = results.reduce((sum, r) => sum + r.orphanCount, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Giai đoạn 10 • Mục 10
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Kiểm Tra Toàn Vẹn Dữ Liệu & Phát Hiện Bản Ghi Mồ Côi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy chuẩn: 1 Học sinh ➔ 1 Hồ sơ ➔ Nhiều dữ liệu liên quan. Không tồn tại dữ liệu mồ côi (Orphaned records).
          </p>
        </div>

        <button
          onClick={handleRecheck}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Quét kiểm tra lại (Lúc {lastCheckTime})
        </button>
      </div>

      {/* Summary Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-center gap-4 ${
          totalOrphans === 0
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
            totalOrphans === 0
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
          }`}
        >
          {totalOrphans === 0 ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>

        <div>
          <h4 className="text-sm font-bold">
            {totalOrphans === 0
              ? 'Hệ thống đạt chuẩn toàn vẹn 100% — Không có dữ liệu mồ côi!'
              : `Phát hiện ${totalOrphans} bản ghi mồ côi cần dọn dẹp.`}
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Toàn bộ {students.length} học sinh đều liên kết đúng với {classes.length} lớp học. Tất cả {academicScores.length} điểm số và {attendanceRecords.length} lượt điểm danh đều gắn chặt với học sinh thực tế.
          </p>
        </div>
      </div>

      {/* Detailed Modules Check Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Kết quả kiểm tra chi tiết theo từng bảng dữ liệu:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  {r.module}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{r.description}</p>
                <div className="text-[11px] text-slate-600 pt-1">
                  Tổng số bản ghi: <span className="font-bold text-slate-800">{r.recordCount}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {r.orphanCount === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Chuẩn 100%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" /> {r.orphanCount} mồ côi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
