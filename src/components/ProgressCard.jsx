import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Smartphone, 
  Copy, 
  Check, 
  Clock, 
  Zap, 
  Activity,
  Layers
} from 'lucide-react';

export default function ProgressCard({ 
  progress, 
  statusText, 
  logs = [], 
  elapsedSeconds,
  liveStats,
  isWakeLockOn = false
}) {
  const [showLogs, setShowLogs] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const logContainerRef = useRef(null);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const percent = Math.min(100, Math.max(0, Math.round((progress || 0) * 100)));

  // Auto-scroll log when expanded
  useEffect(() => {
    if (showLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, showLogs]);

  const handleCopyLogs = (e) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(logs.join('\n'));
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 2000);
    } catch (_) {}
  };

  // Determine stage description
  const getStageInfo = () => {
    if (percent < 10) {
      return { step: 'Tahap 1 / 3', label: 'Persiapan Memori Virtual WASM', color: 'text-amber-700 bg-amber-50' };
    } else if (percent < 95) {
      return { step: 'Tahap 2 / 3', label: 'Encoding libx264 Ultra HD & 60 FPS', color: 'text-rose-700 bg-rose-50' };
    } else if (percent < 100) {
      return { step: 'Tahap 3 / 3', label: 'FastStart Atom Muxing & Finalisasi', color: 'text-blue-700 bg-blue-50' };
    }
    return { step: 'Selesai', label: 'Video Siap Diunduh!', color: 'text-emerald-700 bg-emerald-50' };
  };

  const stage = getStageInfo();

  return (
    <div className="w-full rounded-2xl border-3 border-slate-900 bg-white p-5 sm:p-7 space-y-6 shadow-[5px_5px_0px_0px_#111827] transition-all animate-in fade-in duration-200">
      
      {/* Top Banner: Stage Badge + Anti-Sleep Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-dashed border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-[1px_1px_0px_0px_#111827]">
            {stage.step}
          </span>
          <span className="text-xs font-bold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
            {stage.label}
          </span>
        </div>

        {/* Screen WakeLock Indicator */}
        <div 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#111827] transition-all ${
            isWakeLockOn
              ? 'bg-[#d0fae5] text-emerald-950'
              : 'bg-slate-100 text-slate-700'
          }`}
          title={isWakeLockOn ? "Layar HP dikunci agar tidak mati otomatis saat merender" : "Menjaga layar tetap aktif"}
        >
          <Smartphone className="w-3 h-3 shrink-0" />
          <span className="relative flex h-2 w-2 shrink-0">
            {isWakeLockOn && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWakeLockOn ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
          </span>
          <span>{isWakeLockOn ? 'Layar HP Tetap Nyala' : 'Anti-Sleep Standby'}</span>
        </div>
      </div>

      {/* Progress Circle & Linear Indicator */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f1f5f9"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress fill */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f43f5e"
              strokeWidth="10"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * percent) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              fill="transparent"
            />
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 leading-none">
              {percent}%
            </span>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-1">
              Selesai
            </span>
          </div>
        </div>

        {/* Linear Progress Bar with Blocks */}
        <div className="w-full max-w-md h-3.5 bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden p-0.5 shadow-[1.5px_1.5px_0px_0px_#111827]">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>
      </div>

      {/* Primary Status Heading */}
      <div className="text-center space-y-1 px-2">
        <h3 className="font-heading text-base sm:text-lg uppercase tracking-wide text-slate-900 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-rose-600 animate-spin shrink-0" />
          <span className="truncate max-w-full">
            {statusText || 'Sedang memproses video di WebAssembly...'}
          </span>
        </h3>
        <p className="text-[11px] font-bold text-slate-500">
          Dikerjakan 100% lokal di browser Anda • Multi-core CPU Engine
        </p>
      </div>

      {/* Realtime Live HUD Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto">
        <div className="p-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-center shadow-[1.5px_1.5px_0px_0px_#111827]">
          <span className="text-[10px] uppercase font-black text-slate-500 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-rose-600" />
            <span>Waktu</span>
          </span>
          <span className="text-sm font-black font-mono text-slate-900 block mt-0.5">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-center shadow-[1.5px_1.5px_0px_0px_#111827]">
          <span className="text-[10px] uppercase font-black text-slate-500 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Frame Rate</span>
          </span>
          <span className="text-sm font-black font-mono text-slate-900 block mt-0.5">
            {liveStats?.fps ? `${liveStats.fps} FPS` : 'Menghitung...'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-center shadow-[1.5px_1.5px_0px_0px_#111827] col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-black text-slate-500 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" />
            <span>Kecepatan</span>
          </span>
          <span className="text-sm font-black font-mono text-slate-900 block mt-0.5">
            {liveStats?.speed || '1.0x'}
          </span>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-3 rounded-xl border-2 border-slate-900 bg-[#fef08a] text-[11px] text-amber-950 font-bold max-w-lg mx-auto shadow-[2px_2px_0px_0px_#111827] flex items-start gap-2 text-left">
        <Cpu className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Perhatian:</strong> Jangan tutup atau minimize tab browser ini selama kompresi berlangsung agar CPU tidak dibatasi sistem operasi.
        </p>
      </div>

      {/* Collapsible FFmpeg Log Console */}
      <div className="pt-1 max-w-lg mx-auto w-full min-w-0">
        <div className="rounded-xl border-2 border-slate-900 bg-slate-50 shadow-[2px_2px_0px_0px_#111827] overflow-hidden">
          <div 
            onClick={() => setShowLogs(!showLogs)}
            className="w-full py-2.5 px-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 truncate">
                Terminal Log Engine ({logs.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showLogs && (
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="px-2 py-0.5 rounded bg-white border border-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-800 hover:bg-slate-200 flex items-center gap-1 transition-all"
                  title="Salin seluruh log"
                >
                  {copiedLog ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLog ? 'Disalin' : 'Salin'}</span>
                </button>
              )}
              {showLogs ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-900" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-900" />}
            </div>
          </div>

          {showLogs && (
            <div 
              ref={logContainerRef}
              className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] max-h-48 overflow-y-auto overflow-x-hidden text-left whitespace-pre-wrap break-all leading-relaxed border-t-2 border-slate-900 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {logs.length === 0 ? (
                <span className="text-slate-500">Mempersiapkan virtual memory stream...</span>
              ) : (
                logs.slice(-40).map((l, idx) => (
                  <div key={idx} className="hover:text-white transition-colors">{l}</div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
