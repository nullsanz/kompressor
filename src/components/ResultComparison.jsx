import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  Play, 
  Film,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultComparison({ 
  isDark, 
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
    <div className={`w-full rounded-3xl border p-5 sm:p-8 space-y-6 transition-all shadow-2xl overflow-hidden min-w-0 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/60 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight truncate">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Preset: <strong className="text-rose-400">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold block text-emerald-600 dark:text-emerald-400">Hemat Ukuran</span>
              <span className="text-base font-black font-mono">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full ${
        isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 w-full">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 shrink-0">Hasil:</span>
              <p className="text-xs font-bold truncate min-w-0 flex-1 text-slate-200 dark:text-white" title={result?.name || 'video_kompres_hd.mp4'}>
                {result?.name || 'video_kompres_hd.mp4'}
              </p>
            </div>
            {originalFile?.name && (
              <p className="text-[11px] text-slate-400 truncate min-w-0" title={originalFile.name}>
                Asli: <span className="font-mono">{originalFile.name}</span>
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Siap Download
        </span>
      </div>

      {/* Metrics Cards: Original vs Result */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className={`p-3.5 rounded-2xl border min-w-0 ${
          isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
            Ukuran Asli
          </span>
          <p className="text-base sm:text-lg font-black text-slate-400 line-through truncate">
            {formatBytes(originalSize)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border bg-rose-500/10 border-rose-500/20 text-rose-500 min-w-0">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1 truncate">
            Ukuran Hasil
          </span>
          <p className="text-base sm:text-lg font-black font-mono text-rose-500 truncate">
            {formatBytes(compressedSize)}
          </p>
        </div>

        <div className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border min-w-0 ${
          isDark ? 'bg-slate-950/50 border-slate-800 text-emerald-400' : 'bg-emerald-50/50 border-emerald-200 text-emerald-700'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 truncate">
            Total Kuota Dihemat
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate">
            {formatBytes(savedBytes)}
          </p>
        </div>
      </div>

      {/* View Switcher (Hasil vs Asli) */}
      {!isImageResult && (
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-950/40 rounded-2xl border border-slate-800 max-w-xs mx-auto text-xs font-bold w-full">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all truncate ${
              activeTab === 'result'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ Hasil Kompresi HD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all truncate ${
              activeTab === 'original'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📁 Video Asli
          </button>
        </div>
      )}

      {/* Preview Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black/95 aspect-video max-h-[360px] sm:max-h-[420px] mx-auto flex items-center justify-center border border-slate-800 shadow-inner w-full">
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
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Download File ({formatBytes(compressedSize)})</span>
        </button>

        <a
          href="https://api.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            handleDownload();
          }}
          className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
          title="Download dan buka WhatsApp untuk langsung dijadikan Status"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">Langsung ke Status WA</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className={`w-full sm:w-auto px-4 py-3.5 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 ${
            isDark 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">Kompres Video Lain</span>
        </button>
      </div>
    </div>
  );
}
