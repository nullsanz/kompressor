import React from 'react';
import { Video, Cpu, ShieldCheck, Sparkles, QrCode, Link2, Download, ExternalLink } from 'lucide-react';

export default function Navbar({ engineStatus }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-900 shadow-[0_2px_0px_0px_#111827] text-slate-900 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand with Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827] bg-[#ffd1ba] flex items-center justify-center">
              <span className="text-sm font-black text-slate-900 select-none">A</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight truncate text-slate-900">
                Anull Kompresor
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#ffe4e6] text-rose-900 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">
                HD Studio
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 truncate flex items-center gap-1">
              <span>FFmpeg WebAssembly</span>
              <span className="hidden md:inline">• 100% Identik Bot WA</span>
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (Cross-Tool Ecosystem) */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
          <a
            href="https://qr.anull.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_#111827]"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>QR Studio</span>
          </a>

          <a
            href="https://qr.anull.cloud/link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_#111827]"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlink</span>
          </a>

          <a
            href="https://qr.anull.cloud/tiktok"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_#111827]"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span>Downloader</span>
          </a>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffd1ba] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
            <Video className="w-3.5 h-3.5 text-rose-600" />
            <span>Kompres Video</span>
          </span>
        </nav>

        {/* Right Actions: WASM Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827] transition-all ${
            engineStatus === 'ready'
              ? 'bg-[#d0fae5] text-emerald-950'
              : engineStatus === 'loading'
              ? 'bg-[#fef08a] text-amber-950 animate-pulse'
              : 'bg-slate-100 text-slate-900'
          }`}>
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">
              {engineStatus === 'ready' ? 'FFmpeg Siap' : engineStatus === 'loading' ? 'Memuat Engine...' : 'WASM Siaga'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-[#dbeafe] text-blue-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>100% Lokal</span>
          </div>
        </div>

      </div>

      {/* Mobile Horizontal Ecosystem Strip */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-t-2 border-slate-900 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-black uppercase text-slate-500 shrink-0 mr-1">Ekosistem:</span>
        <a
          href="https://qr.anull.cloud/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>QR</span>
        </a>
        <a
          href="https://qr.anull.cloud/link"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Link2 className="w-3 h-3 text-emerald-600" />
          <span>Shortlink</span>
        </a>
        <a
          href="https://qr.anull.cloud/tiktok"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Download className="w-3 h-3 text-pink-600" />
          <span>Downloader</span>
        </a>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ffd1ba] border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]">
          <Video className="w-3 h-3 text-rose-600" />
          <span>Kompres</span>
        </span>
      </div>
    </header>
  );
}
