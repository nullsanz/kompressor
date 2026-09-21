import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Film,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultComparison({ 
  originalFile, 
  result, 
  preset,
  onReset 
}) {
  const [activeTab, setActiveTab] = useState('result'); // 'result' | 'original'

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const originalSize = originalFile?.size || 1;
  const compressedSize = result?.size || 1;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = Math.min(99, Math.max(0, Math.round((savedBytes / originalSize) * 100)));

  const handleDownload = () => {
    if (!result?.url) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name || 'video_kompres_hd.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isImageResult = result?.blob?.type?.startsWith('image/');

  return (
    <div className="w-full rounded-xl border-3 border-slate-900 bg-white p-5 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_#111827] transition-all overflow-hidden min-w-0 animate-in fade-in duration-200">
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-300 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-xl sm:text-2xl text-slate-900 truncate uppercase tracking-wide">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs font-bold text-slate-500 truncate">
              Preset: <strong className="text-slate-900 font-black">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 rounded-md shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5] text-emerald-700" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-black block text-emerald-900">Hemat Ukuran</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full shadow-[2px_2px_0px_0px_#111827]">
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-[#ffe4e6] border-2 border-slate-900 text-rose-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] shrink-0">
            <Film className="w-4 h-4 text-slate-900" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 w-full">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 shrink-0">Hasil:</span>
              <p className="text-xs font-black truncate min-w-0 flex-1 text-slate-900" title={result?.name || 'video_kompres_hd.mp4'}>
                {result?.name || 'video_kompres_hd.mp4'}
              </p>
            </div>
            {originalFile?.name && (
              <p className="text-[11px] font-bold text-slate-500 truncate min-w-0" title={originalFile.name}>
                Asli: <span className="font-mono text-slate-700">{originalFile.name}</span>
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#d0fae5] text-emerald-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">
          Siap Download
        </span>
      </div>

      {/* Metrics Cards: Original vs Result */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-slate-50 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1 truncate">
            Ukuran Asli
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-400 line-through truncate font-mono">
            {formatBytes(originalSize)}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-[#fef08a] text-slate-900 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate text-slate-800">
            Ukuran Hasil
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-slate-950">
            {formatBytes(compressedSize)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg border-2 border-slate-900 bg-[#d0fae5] text-emerald-950 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate text-emerald-900">
            Total Dihemat
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-emerald-950">
            {formatBytes(savedBytes)}
          </p>
        </div>
      </div>

      {/* View Switcher (Hasil vs Asli) */}
      {!isImageResult && (
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-100 rounded-lg border-2 border-slate-900 max-w-xs mx-auto text-xs font-black shadow-[2px_2px_0px_0px_#111827] w-full">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-2 px-3 rounded-md transition-all uppercase tracking-wider truncate cursor-pointer ${
              activeTab === 'result'
                ? 'bg-[#fef08a] text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ✨ Hasil Kompres
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-2 px-3 rounded-md transition-all uppercase tracking-wider truncate cursor-pointer ${
              activeTab === 'original'
                ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📁 Video Asli
          </button>
        </div>
      )}

      {/* Preview Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] sm:max-h-[420px] mx-auto flex items-center justify-center border-3 border-slate-900 shadow-[3px_3px_0px_0px_#111827] w-full">
        {isImageResult ? (
          <img
            src={result.url}
            alt="Hasil Foto Profil HD 1:1"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            key={activeTab}
            src={activeTab === 'result' ? result.url : URL.createObjectURL(originalFile)}
            controls
            playsInline
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Action Buttons: Download, WhatsApp Share, Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full min-w-0">
        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="tetris-btn-clip w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#f43f5e] text-white flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="truncate">Download File ({formatBytes(compressedSize)})</span>
          </button>
        </div>

        <div className="tetris-btn-wrap w-full sm:w-auto">
          <a
            href="https://api.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              handleDownload();
            }}
            className="tetris-btn-clip w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#10b981] text-white flex items-center justify-center gap-2"
            title="Download dan buka WhatsApp untuk langsung dijadikan Status"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Langsung ke Status WA</span>
          </a>
        </div>

        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="tetris-btn-clip w-full sm:w-auto px-4 py-3 text-xs font-black uppercase tracking-wider bg-white text-slate-900 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">Kompres File Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
