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
    <div className="w-full rounded-[4px] border-2 border-slate-900 bg-white p-5 sm:p-8 space-y-6 shadow-[4px_4px_0px_#0f172a] transition-all overflow-hidden min-w-0">
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-[4px] bg-emerald-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a] shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base sm:text-lg tracking-tight uppercase text-slate-900 truncate">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs font-semibold text-slate-600 truncate">
              Preset: <strong className="text-rose-600 font-bold">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 border-2 border-slate-900 text-emerald-950 rounded-[4px] shadow-[2px_2px_0px_#0f172a] shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[3] text-emerald-700" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-black block text-emerald-800">Hemat Ukuran</span>
              <span className="text-base font-black font-mono">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className="p-3.5 rounded-[4px] border-2 border-slate-900 bg-slate-50 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full">
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-[4px] bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[1px_1px_0px_#0f172a] shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 w-full">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 shrink-0">Hasil:</span>
              <p className="text-xs font-black truncate min-w-0 flex-1 text-slate-900" title={result?.name || 'video_kompres_hd.mp4'}>
                {result?.name || 'video_kompres_hd.mp4'}
              </p>
            </div>
            {originalFile?.name && (
              <p className="text-[11px] font-semibold text-slate-500 truncate min-w-0" title={originalFile.name}>
                Asli: <span className="font-mono">{originalFile.name}</span>
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]">
          Siap Download
        </span>
      </div>

      {/* Metrics Cards: Original vs Result */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className="p-3.5 rounded-[4px] border-2 border-slate-900 bg-slate-100 shadow-[2px_2px_0px_#0f172a] min-w-0">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1 truncate">
            Ukuran Asli
          </span>
          <p className="text-base sm:text-lg font-black text-slate-500 line-through truncate font-mono">
            {formatBytes(originalSize)}
          </p>
        </div>

        <div className="p-3.5 rounded-[4px] border-2 border-slate-900 bg-rose-100 text-rose-900 shadow-[2px_2px_0px_#0f172a] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate">
            Ukuran Hasil
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate">
            {formatBytes(compressedSize)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-[4px] border-2 border-slate-900 bg-emerald-100 text-emerald-950 shadow-[2px_2px_0px_#0f172a] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate">
            Total Dihemat
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate">
            {formatBytes(savedBytes)}
          </p>
        </div>
      </div>

      {/* View Switcher (Hasil vs Asli) */}
      {!isImageResult && (
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] max-w-xs mx-auto text-xs font-black uppercase w-full">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-1.5 px-3 rounded-[2px] transition-all truncate cursor-pointer ${
              activeTab === 'result'
                ? 'bg-rose-600 text-white shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ✨ Hasil Kompresi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-1.5 px-3 rounded-[2px] transition-all truncate cursor-pointer ${
              activeTab === 'original'
                ? 'bg-slate-900 text-white shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📁 Video Asli
          </button>
        </div>
      )}

      {/* Preview Player */}
      <div className="relative rounded-[4px] overflow-hidden bg-black aspect-video max-h-[360px] sm:max-h-[420px] mx-auto flex items-center justify-center border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] w-full">
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
          className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer shrink-0"
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
          className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px] border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0"
          title="Download dan buka WhatsApp untuk langsung dijadikan Status"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">Langsung ke Status WA</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-3.5 rounded-[4px] font-black uppercase text-xs border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 shadow-[2px_2px_0px_#0f172a] transition-all flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="truncate">Kompres File Lain</span>
        </button>
      </div>
    </div>
  );
}
