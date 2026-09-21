import React, { useState } from 'react';
import { Loader2, Terminal, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

export default function ProgressCard({ 
  progress, 
  statusText, 
  logs, 
  elapsedSeconds 
}) {
  const [showLogs, setShowLogs] = useState(false);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div className="w-full rounded-2xl border-2 border-slate-900 bg-white p-6 sm:p-8 text-center space-y-5 shadow-[4px_4px_0px_0px_#111827] transition-all animate-in fade-in duration-200">
      {/* Progress Circle */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#f1f5f9"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#111827"
            strokeWidth="8"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * percent) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
            {percent}%
          </span>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
            Selesai
          </span>
        </div>
      </div>

      {/* Status & Elapsed Time */}
      <div className="space-y-1 min-w-0 w-full">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center gap-2 min-w-0 px-2">
          <Loader2 className="w-4 h-4 text-rose-600 animate-spin shrink-0" />
          <span className="truncate max-w-full">{statusText || 'Sedang Memproses Video di Browser...'}</span>
        </h3>
        <p className="text-xs font-bold text-slate-600 truncate">
          Waktu berjalan: <strong className="font-mono text-rose-600 font-black">{formatElapsed(elapsedSeconds)}</strong> • Dikerjakan langsung di browser Anda
        </p>
      </div>

      {/* Educational Notice */}
      <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-[#fef08a] text-xs text-left max-w-lg mx-auto text-amber-950 font-bold shadow-[2px_2px_0px_0px_#111827]">
        <p className="flex items-start gap-2">
          <Cpu className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
          <span>
            <strong className="uppercase">Info Kecepatan:</strong> WebAssembly memanfaatkan multi-core CPU perangkat Anda. Jangan tutup tab browser ini sampai proses kompresi selesai!
          </span>
        </p>
      </div>

      {/* Collapsible FFmpeg Log Console */}
      <div className="pt-2 max-w-xl mx-auto w-full min-w-0">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full py-2.5 px-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">Terminal Log FFmpeg ({logs.length})</span>
          </div>
          {showLogs ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>

        {showLogs && (
          <div className="mt-2 p-3.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#111827] max-h-48 overflow-y-auto overflow-x-hidden text-left whitespace-pre-wrap break-all leading-relaxed">
            {logs.length === 0 ? (
              <span className="text-slate-500">Menunggu stream log dari FFmpeg...</span>
            ) : (
              logs.slice(-30).map((l, idx) => (
                <div key={idx} className="hover:text-white transition-colors break-all">{l}</div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
