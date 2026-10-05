import React from 'react';
import { Video, Cpu, ShieldCheck, Sparkles, QrCode, Link2, Download, ExternalLink } from 'lucide-react';

export default function Navbar({ engineStatus, isWakeLockOn = false }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-4 border-slate-900 shadow-[0_2px_0px_0px_#111827] text-slate-900 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand with Tetris Logo Block */}
        <div className="flex items-center gap-2.5 min-w-0 select-none">
          <span 
            aria-hidden="true" 
            className="grid h-9 w-9 place-items-center border-3 border-slate-900 bg-[#f43f5e] text-white shadow-[2px_2px_0px_0px_#111827] font-black text-base shrink-0"
            style={{ clipPath: 'polygon(calc(100% - 6px) 0px, 100% 6px, 100% 100%, 6px 100%, 0px calc(100% - 6px), 0px 0px)' }}
          >
            ■
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl sm:text-2xl uppercase tracking-wide truncate text-slate-900">
                ANULL KOMPRESOR
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider bg-[#ffe4e6] text-rose-900 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">
                HD STUDIO
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate flex items-center gap-1 hidden sm:flex">
              <span>FFMPEG WEBASSEMBLY</span>
              <span className="hidden md:inline">• 100% IDENTIK BOT WA</span>
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (Cross-Tool Ecosystem) */}
        <nav className="hidden md:flex items-center gap-2">
          <a
            href="https://qr.anull.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-800 hover:text-slate-950 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>QR Studio</span>
          </a>

          <a
            href="https://qr.anull.cloud/link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-800 hover:text-slate-950 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlink</span>
          </a>

          <a
            href="https://qr.anull.cloud/tiktok"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-800 hover:text-slate-950 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all border-2 border-transparent"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span>Downloader</span>
          </a>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#fef08a] text-slate-900 text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
            <Video className="w-3.5 h-3.5 text-rose-600" />
            <span>Kompres Video</span>
          </span>
        </nav>

        {/* Right Actions: WASM Status & Anti-Sleep Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Anti-Sleep Pill */}
          {isWakeLockOn && (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#d0fae5] text-emerald-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]"
              title="Anti-Sleep Aktif: Layar HP tidak akan mati otomatis saat merender"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="hidden sm:inline">Anti-Sleep ON</span>
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827] transition-all ${
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

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#dbeafe] text-blue-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>100% Lokal</span>
          </div>
        </div>

      </div>

      {/* Mobile Horizontal Ecosystem Strip */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-t-3 border-slate-900 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 mr-1 tracking-wider">Ekosistem:</span>
        <a
          href="https://qr.anull.cloud/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]"
        >
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>QR</span>
        </a>
        <a
          href="https://qr.anull.cloud/link"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]"
        >
          <Link2 className="w-3 h-3 text-emerald-600" />
          <span>Shortlink</span>
        </a>
        <a
          href="https://qr.anull.cloud/tiktok"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]"
        >
          <Download className="w-3 h-3 text-pink-600" />
          <span>Downloader</span>
        </a>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fef08a] border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]">
          <Video className="w-3 h-3 text-rose-600" />
          <span>Kompres</span>
        </span>
      </div>
    </header>
  );
}
