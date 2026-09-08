import React from 'react';
import { Video, Sun, Moon, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ isDark, onToggleTheme, engineStatus }) {
  return (
    <header className={`sticky top-0 z-40 w-full transition-colors border-b backdrop-blur-md ${
      isDark 
        ? 'bg-slate-950/80 border-slate-800/80 text-white' 
        : 'bg-white/80 border-slate-200/80 text-slate-900'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
              <Video className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight truncate">
                Anull Kompresor
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                HD Studio
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate flex items-center gap-1">
              <span>Client-Side FFmpeg WebAssembly</span>
              <span className="hidden md:inline">• 100% Privasi Terjaga</span>
            </p>
          </div>
        </div>

        {/* Right Actions: Status Badge & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* WASM Engine Status Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            engineStatus === 'ready'
              ? isDark ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : engineStatus === 'loading'
              ? isDark ? 'bg-amber-950/50 text-amber-400 border-amber-800/50 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {engineStatus === 'ready' ? 'FFmpeg Siap' : engineStatus === 'loading' ? 'Memuat Engine...' : 'WASM Siaga'}
            </span>
          </div>

          {/* Privacy Badge */}
          <div className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold ${
            isDark ? 'bg-slate-900/90 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>0% Upload Server</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Ganti tema"
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
