import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  BookOpen,
  User,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  children,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showPdfTip, setShowPdfTip] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    setShowPdfTip(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col p-2 sm:p-4 overflow-hidden">
      {/* Top Floating Control Toolbar */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between gap-4 border border-slate-800 shadow-2xl shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight truncate max-w-md">
              {documentTitle}
            </div>
            <div className="text-[11px] text-slate-400">
              Chế độ xem trước khi in (A4 Preview) • Khổ chuẩn A4 Portrait
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-300">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-mono text-[11px]">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="px-2 py-1 text-[10px] hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
          >
            Mặc định
          </button>
        </div>

        {/* Primary Print / PDF Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Xuất PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>In Ngay</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors ml-1"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Export Helper Hint */}
      {showPdfTip && (
        <div className="mt-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs flex items-center justify-between shrink-0 animate-fadeIn">
          <span>
            💡 <strong>Mẹo xuất PDF:</strong> Trong hộp thoại In vừa mở, chọn mục <strong>"Máy in đích (Destination)"</strong> là <strong>"Lưu dưới dạng PDF" (Save as PDF)</strong> để tải file PDF về máy tính.
          </span>
          <button onClick={() => setShowPdfTip(false)} className="text-white hover:underline text-[11px] font-bold ml-2">
            Đã hiểu ✕
          </button>
        </div>
      )}

      {/* Scrollable Document Canvas Container */}
      <div className="flex-1 overflow-y-auto mt-3 p-4 sm:p-8 flex justify-center bg-slate-950/40 rounded-2xl">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-4xl"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
