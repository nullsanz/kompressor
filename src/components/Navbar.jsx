import React from 'react';
import { Video, Cpu, ShieldCheck, Sparkles, QrCode, Link2, Download, ExternalLink } from 'lucide-react';

const BRAND_AVATAR = 'https://res.cloudinary.com/dkjfid0sq/image/upload/v1785336228/719770759_17899290135454188_1095631538196561206_n_o4nkib.jpg';

export default function Navbar({ engineStatus }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-900 shadow-[0_4px_0px_#0f172a] text-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand with Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={BRAND_AVATAR}
              alt="Anull Brand Avatar"
              className="w-10 h-10 object-cover border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] rounded-[4px]"
              onError={(e) => {
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Anull&background=e11d48&color=fff&size=100';
              }}
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight truncate uppercase">
                Anull Kompresor
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                HD Studio
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 truncate flex items-center gap-1">
              <span>FFmpeg WebAssembly</span>
              <span className="hidden md:inline">• 100% Identik Bot WA</span>
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (Cross-Tool Ecosystem) */}
        <nav className="hidden md:flex items-center gap-2">
          <a
            href="https://qr.anull.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] bg-white text-slate-900 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#0f172a]"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>QR Studio</span>
          </a>

          <a
            href="https://qr.anull.cloud/link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] bg-white text-slate-900 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#0f172a]"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlink</span>
          </a>

          <a
            href="https://qr.anull.cloud/tiktok"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] bg-white text-slate-900 hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#0f172a]"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span>Downloader</span>
          </a>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] bg-rose-600 text-white text-xs font-black uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-white" />
            <span>Kompres Video</span>
          </span>
        </nav>

        {/* Right Actions: WASM Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] ${
            engineStatus === 'ready'
              ? 'bg-emerald-100 text-emerald-900'
              : engineStatus === 'loading'
              ? 'bg-amber-100 text-amber-900 animate-pulse'
              : 'bg-slate-100 text-slate-800'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-slate-900" />
            <span className="text-[11px]">
              {engineStatus === 'ready' ? 'FFmpeg Siap' : engineStatus === 'loading' ? 'Memuat Engine...' : 'WASM Siaga'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Lokal</span>
          </div>
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t-2 border-slate-900 bg-slate-50 text-[11px] font-black uppercase tracking-wider">
        <a href="https://qr.anull.cloud/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-700">
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>QR</span>
        </a>
        <a href="https://qr.anull.cloud/link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-700">
          <Link2 className="w-3 h-3 text-emerald-600" />
          <span>Shortlink</span>
        </a>
        <a href="https://qr.anull.cloud/tiktok" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-700">
          <Download className="w-3 h-3 text-pink-600" />
          <span>Downloader</span>
        </a>
        <span className="flex items-center gap-1 text-rose-600 font-black">
          <Video className="w-3 h-3 text-rose-600" />
          <span>Kompres</span>
        </span>
      </div>
    </header>
  );
}
