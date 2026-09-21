import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t-4 border-slate-900 bg-white text-slate-700 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Security & Privacy Banner */}
        <div className="p-4 rounded-xl border-3 border-slate-900 bg-[#d0fae5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left shadow-[4px_4px_0px_0px_#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-slate-900 text-emerald-700 flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-heading text-base sm:text-lg text-slate-900 block uppercase tracking-wide">
                Privasi 100% Aman & Terjamin
              </strong>
              <p className="text-[11px] text-emerald-900 font-bold">
                Seluruh video dan foto diproses di browser HP/Laptop Anda menggunakan WebAssembly. Tidak ada file yang dikirim ke server.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white text-emerald-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827]">
            Zero Server Upload
          </span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-slate-600">
            <span>Anull Kompresor HD Studio • Bagian dari ekosistem</span>
            <a 
              href="https://null.cloud" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-black text-slate-900 hover:underline flex items-center gap-0.5 border-b-2 border-slate-900"
            >
              <span>anull.cloud</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider">
            <a href="https://qr.anull.cloud" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-slate-900">
              QR Studio
            </a>
            <a href="https://qr.anull.cloud/link" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-slate-900">
              Shortlink
            </a>
            <a href="https://qr.anull.cloud/tiktok" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-slate-900">
              Downloader
            </a>
            <a href="https://lokerbrayy.anull.cloud" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-slate-900">
              Loker Bray
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-3 h-3 text-rose-600 fill-rose-600 inline" /> oleh Lukman (nullsanz) • 2026 Edition
        </p>
      </div>
    </footer>
  );
}
