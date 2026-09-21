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
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-8 space-y-6 shadow-sm transition-all overflow-hidden min-w-0 animate-in fade-in duration-200">
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate">
              Preset: <strong className="text-rose-600 font-bold">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5] text-emerald-600" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold block text-emerald-700">Hemat Ukuran</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-900">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full">
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 w-full">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">Hasil:</span>
              <p className="text-xs font-bold truncate min-w-0 flex-1 text-slate-900" title={result?.name || 'video_kompres_hd.mp4'}>
                {result?.name || 'video_kompres_hd.mp4'}
              </p>
            </div>
            {originalFile?.name && (
              <p className="text-[11px] font-medium text-slate-500 truncate min-w-0" title={originalFile.name}>
                Asli: <span className="font-mono">{originalFile.name}</span>
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Siap Download
        </span>
      </div>

      {/* Metrics Cards: Original vs Result */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
            Ukuran Asli
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-400 line-through truncate font-mono">
            {formatBytes(originalSize)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-900 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 truncate text-rose-600">
            Ukuran Hasil
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-rose-700">
            {formatBytes(compressedSize)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-900 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 truncate text-emerald-600">
            Total Dihemat
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-emerald-700">
            {formatBytes(savedBytes)}
          </p>
        </div>
      </div>

      {/* View Switcher (Hasil vs Asli) */}
      {!isImageResult && (
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100/90 rounded-xl max-w-xs mx-auto text-xs font-bold w-full">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all truncate cursor-pointer ${
              activeTab === 'result'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Hasil Kompresi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all truncate cursor-pointer ${
              activeTab === 'original'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📁 Video Asli
          </button>
        </div>
      )}

      {/* Preview Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] sm:max-h-[420px] mx-auto flex items-center justify-center shadow-sm w-full">
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
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl shadow-sm hover:shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Download File ({formatBytes(compressedSize)})</span>
        </button>

        <a
          href="https://api.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            handleDownload();
          }}
          className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0"
          title="Download dan buka WhatsApp untuk langsung dijadikan Status"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">Langsung ke Status WA</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-3.5 rounded-xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="truncate">Kompres File Lain</span>
        </button>
      </div>
    </div>
  );
}
