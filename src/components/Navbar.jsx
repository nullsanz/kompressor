import React from 'react';
import { Video, Cpu, ShieldCheck, Sparkles, QrCode, Link2, Download, ExternalLink } from 'lucide-react';

export default function Navbar({ engineStatus }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs text-slate-900 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand with Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/avatar.jpg"
              alt="Anull Brand Avatar"
              className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-xs"
              onError={(e) => {
                e.currentTarget.src = '/favicon.ico';
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight truncate text-slate-900">
                Anull Kompresor
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                HD Studio
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1">
              <span>FFmpeg WebAssembly</span>
              <span className="hidden md:inline">• 100% Identik Bot WA</span>
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (Cross-Tool Ecosystem) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
          <a
            href="https://qr.anull.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-bold transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>QR Studio</span>
          </a>

          <a
            href="https://qr.anull.cloud/link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-bold transition-all"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlink</span>
          </a>

          <a
            href="https://qr.anull.cloud/tiktok"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span>Downloader</span>
          </a>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-rose-600 text-xs font-bold shadow-xs">
            <Video className="w-3.5 h-3.5 text-rose-600" />
            <span>Kompres Video</span>
          </span>
        </nav>

        {/* Right Actions: WASM Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            engineStatus === 'ready'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : engineStatus === 'loading'
              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {engineStatus === 'ready' ? 'FFmpeg Siap' : engineStatus === 'loading' ? 'Memuat Engine...' : 'WASM Siaga'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Lokal</span>
          </div>
        </div>

      </div>

      {/* Mobile Horizontal Ecosystem Strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Ekosistem:</span>
        <a
          href="https://qr.anull.cloud/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold shrink-0 shadow-xs"
        >
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>QR</span>
        </a>
        <a
          href="https://qr.anull.cloud/link"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold shrink-0 shadow-xs"
        >
          <Link2 className="w-3 h-3 text-emerald-600" />
          <span>Shortlink</span>
        </a>
        <a
          href="https://qr.anull.cloud/tiktok"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold shrink-0 shadow-xs"
        >
          <Download className="w-3 h-3 text-pink-600" />
          <span>Downloader</span>
        </a>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold shrink-0">
          <Video className="w-3 h-3 text-rose-600" />
          <span>Kompres</span>
        </span>
      </div>
    </header>
  );
}
